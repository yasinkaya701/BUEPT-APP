import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  ActivityIndicator, Animated, useWindowDimensions, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isChatApiConfigured, requestChatbotReply } from '../utils/chatbotAI';
import { getAiSourceMeta } from '../utils/aiWorkspace';
import { speakEnglish, stopEnglishTts } from '../utils/ttsEnglish';
import { performWebSearch } from '../utils/webSearch';

const CHAT_STATE_KEY = '@chatbot_state_v1';
const DEFAULT_CHIPS = ["📝 Essay Help", "📖 Reading Skills", "🎧 Listening", "📚 Grammar", "Find Synonyms", "🧠 Vocab Quiz"];
const WELCOME_MESSAGE = "👋 Merhaba! Ben senin **BUEPT Global AI** asistanınım.\n\nSadece sınav için değil, aklına gelen her konuda benimle özgürce konuşabilirsin. Ödevlerin, günlük soruların, İngilizce pratiği veya sadece sohbet etmek için buradayım.\n\nSana bugün nasıl yardımcı olabilirim?";
const CHAT_MODES = [
  { id: 'coach', label: 'Coach' },
  { id: 'examiner', label: 'Examiner' },
  { id: 'tool-guide', label: 'Tool Guide' },
];
const TOOL_SHORTCUTS = [
  {
    id: 'synonym',
    label: 'Synonym Finder',
    hint: 'Meaning, examples, save words',
    route: 'SynonymFinder',
    params: { initialWord: 'significant' },
    icon: 'swap-horizontal',
    tint: '#EAF1FF',
  },
  {
    id: 'photo',
    label: 'Photo OCR',
    hint: 'Scan image text into vocab',
    route: 'PhotoVocabCapture',
    icon: 'scan',
    tint: '#ECFDF3',
  },
  {
    id: 'presentation',
    label: 'Presentation Prep',
    hint: 'Outline, script, body cues',
    route: 'AIPresentationPrep',
    params: { topic: 'The role of AI in higher education' },
    icon: 'easel',
    tint: '#F3E8FF',
  },
  {
    id: 'video',
    label: 'Lesson Video',
    hint: 'Generate a narrated lesson demo',
    route: 'AILessonVideoStudio',
    params: { topic: 'BUEPT paraphrase strategy' },
    icon: 'videocam',
    tint: '#FFF7ED',
  },
];
const COACH_PACKS = [
  {
    id: 'thesis',
    label: 'Build Thesis',
    prompt: 'Help me write a strong BUEPT thesis statement about technology and education.',
  },
  {
    id: 'reading',
    label: 'Reading Strategy',
    prompt: 'Explain how I should answer inference and tone questions in BUEPT reading.',
  },
  {
    id: 'study',
    label: 'Study Plan',
    prompt: 'Create a 4-week BUEPT study plan for grammar, reading, and writing.',
  },
];
const AI_WORKFLOWS = [
  {
    id: 'speaking_flow',
    label: 'AI Speaking',
    sub: 'Prompt -> record -> evaluate',
    action: { route: 'AISpeakingPartner', params: { initialMode: 'academic' } },
  },
  {
    id: 'presentation_flow',
    label: 'Presentation Deck',
    sub: 'Topic -> slides -> script',
    action: { route: 'AIPresentationPrep', params: { topic: 'The role of AI in higher education' } },
  },
  {
    id: 'video_flow',
    label: 'Lesson Storyboard',
    sub: 'Topic -> scenes -> narration',
    action: { route: 'AILessonVideoStudio', params: { topic: 'BUEPT paraphrase strategy' } },
  },
  {
    id: 'essay_flow',
    label: 'Essay Grader',
    sub: 'Paste text -> rubric -> fixes',
    action: { route: 'EssayEvaluation' },
  },
];
let lastStudyTipIndex = -1;
let lastDefaultIntroIndex = -1;

function RichText({ text, style, boldStyle }) {
  if (!text) return null;
  
  // First split by bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={`bold-${i}`} style={boldStyle}>{part.slice(2, -2)}</Text>;
        }
        
        // Second, split by URL patterns for the remaining text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const subParts = part.split(urlRegex);
        
        return subParts.map((sub, j) => {
          if (sub.match(urlRegex)) {
            return (
              <Text 
                key={`link-${i}-${j}`} 
                style={{ color: colors.primary, textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL(sub)}
              >
                {sub}
              </Text>
            );
          }
          return <Text key={`text-${i}-${j}`}>{sub}</Text>;
        });
      })}
    </Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUEPT Knowledge Base ─ rich, multi-turn aware NLP engine
// ─────────────────────────────────────────────────────────────────────────────

const ESSAY_STRUCTURES = {
  argumentative: `📄 Argumentative Essay Blueprint

Paragraph 1 — Introduction
  • Hook: a bold claim or rhetorical question
  • Background: 1-2 sentences of context
  • Thesis: "Despite X, it is evident that Y, primarily because of A and B."

Paragraph 2 — Argument 1 (Point A)
  • Topic sentence → Evidence → Analysis → Link back to thesis

Paragraph 3 — Argument 2 (Point B)
  • Topic sentence → Evidence → Analysis → Link back to thesis

Paragraph 4 — Counter-Argument & Rebuttal
  • "While it could be argued that..."
  • Concede partially → then refute with stronger evidence

Paragraph 5 — Conclusion
  • Restate thesis in new words
  • Summarise main arguments
  • End with implication / call to action`,

  discussion: `📄 Discussion Essay Blueprint

Paragraph 1 — Introduction
  • Introduce both sides of the debate
  • Thesis: "There are compelling arguments on both sides; however, [your view] is more convincing."

Paragraph 2 — Side A (advantages/supporters)
Paragraph 3 — Side B (disadvantages/critics)
Paragraph 4 — Your Evaluation
Paragraph 5 — Conclusion`,
};

const VOCABULARY_QUIZ = [
  { q: "What does 'empirical' mean?", opts: ["based on observation", "based on theory", "based on tradition", "based on opinion"], a: 0 },
  { q: "Which word means 'to combine into one'?", opts: ["synthesise", "analyse", "critique", "enumerate"], a: 0 },
  { q: "'Ubiquitous' is closest to:", opts: ["everywhere", "rare", "important", "dangerous"], a: 0 },
  { q: "What does 'paradigm' refer to?", opts: ["a model or framework", "a type of argument", "an exam type", "a paragraph structure"], a: 0 },
  { q: "'Consequently' is a:", opts: ["result connector", "contrast connector", "example connector", "addition connector"], a: 0 },
];

const STUDY_TIPS = [
  "⏱️ **Pomodoro method**: study 25 min, rest 5 min. After 4 cycles take a 20-min break. Your recall jumps by ~40%.",
  "🗂️ **Cornell Notes**: divide your page — notes on the right, keywords on the left, summary at the bottom. Review within 24h.",
  "🔁 **Spaced repetition**: review new vocab at 1 day → 3 days → 1 week → 2 weeks intervals for long-term memory.",
  "✍️ **Active recall**: close the book and write everything you remember. This beats re-reading by 300%.",
  "🌙 **Sleep is memory**: your brain consolidates knowledge during sleep. Studying before bed and sleeping 7h increases retention.",
  "🎯 **Interleaving**: mix grammar, reading, and vocab in one session instead of blocking each skill. Harder but more effective.",
  "🎙️ **Say it aloud**: reading definitions out loud engages auditory memory and activates more neural pathways.",
];

const WRITING_TIPS = {
  coherence: [
    "Use discourse markers to signal structure: 'Furthermore', 'In contrast', 'As a result', 'Nonetheless'.",
    "Every body paragraph must begin with a clear topic sentence that links to your thesis.",
    "Avoid repeating the same noun — use synonyms or pronouns for cohesion.",
  ],
  vocabulary: [
    "Replace 'good' → advantageous, beneficial, constructive",
    "Replace 'bad' → detrimental, adverse, counterproductive",
    "Replace 'show' → demonstrate, illustrate, reveal, highlight",
    "Replace 'say' → argue, assert, claim, contend, maintain",
    "Replace 'think' → suggest, propose, hypothesise, infer",
  ],
  grammar: [
    "Use passive voice for academic formality: 'It is argued that...' rather than 'People think that...'",
    "Hedging language shows academic caution: 'may', 'tend to', 'appears to', 'is likely to'",
    "Avoid contractions (don't → do not, can't → cannot) in formal writing.",
    "Complex sentences: use relative clauses (which, that, who) to pack more meaning.",
  ],
};

const READING_STRATEGIES = {
  skimming: "**Skimming** — read the first sentence of each paragraph + the last paragraph fully. Takes 30 seconds per page and gives you the main idea.",
  scanning: "**Scanning** — run your eyes quickly over the text searching for a specific keyword, date, or name. Don't read word-for-word!",
  inference: "**Inference questions** — the answer is NOT stated directly. Ask: 'What must be true based on this?' Look for implications.",
  tone: "**Tone questions** — look at the author's word choices. Words like 'must', 'clearly', 'unfortunately' reveal attitude.",
  summary: "**Summary questions** — identify the main claim of each paragraph. The summary should cover all paragraphs proportionally.",
};

const GRAMMAR_EXPLANATIONS = {
  conditional: `**Conditionals in English**

  Zero: "If you heat water to 100°C, it boils." (always true)
  First: "If I study hard, I will pass." (likely future)
  Second: "If I studied, I would pass." (unreal present/future)  
  Third: "If I had studied, I would have passed." (unreal past)
  Mixed: "If I had studied (past), I would speak better (now)."`,

  passive: `**Passive Voice**
  
  Active:  "Researchers conducted the study."
  Passive: "The study was conducted by researchers."
  
  Use passive when:
  • The agent is unknown
  • The action is more important than the doer
  • Writing formally (academic, scientific)`,

  articles: `**Articles (a / an / the)**

  'a/an' — first mention, non-specific: "I read a book."
  'the' — specific, previously mentioned: "The book was fascinating."
  No article — generalisations: "Books expand your mind."
  
  Tricky cases:
  • Uncountable nouns: "Research is important." (no article)
  • Unique nouns: "the sun", "the government", "the internet"`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Intent Engine — full state machine with context awareness
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_PATTERNS = [
  // Greetings
  {
    intent: 'greeting',
    patterns: ['hello', 'hi', 'hey', 'merhaba', 'start', 'begin', 'good morning', 'good afternoon'],
    handler: () => ({
      text: "👋 Welcome to the BUEPT AI Coach! I can help you with:\n\n• 📝 Essay writing & structure\n• 📖 Reading strategies\n• 🎧 Listening skills\n• 📚 Grammar explanations\n• 🧠 Vocabulary & word families\n• 📊 Study techniques\n\nWhat shall we work on today?",
      chips: ["📝 Essay Help", "📖 Reading Skills", "🎧 Listening", "📚 Grammar", "🧠 Vocab Quiz", "📊 Study Tips"],
    }),
  },
  // Essay / Writing
  {
    intent: 'essay_structure',
    patterns: ['essay', 'argumentative', 'writing structure', 'structure my', 'how to write', 'paragraph', 'body paragraph', 'introduction', 'conclusion'],
    handler: () => ({
      text: "✍️ Which essay type do you need help with?",
      chips: ["Argumentative Essay", "Discussion Essay", "Coherence Tips", "Academic Vocabulary", "Grammar Tips"],
    }),
  },
  {
    intent: 'argumentative',
    patterns: ['argumentative essay', 'argumentative', 'argument essay'],
    handler: () => ({
      text: "Here's your Argumentative Essay Blueprint. Each body paragraph follows: Topic Sentence → Evidence → Analysis → Link to Thesis.",
      chips: ["📋 Show Blueprint", "Coherence Tips", "Vocab Upgrader", "Help me with my thesis"],
      artifact: { title: "Argumentative Essay Blueprint", content: ESSAY_STRUCTURES.argumentative },
    }),
  },
  {
    intent: 'show_blueprint',
    patterns: ['show blueprint', 'blueprint', 'show me the blueprint'],
    handler: () => ({
      text: "Opening your blueprint now! 👆 Use it as a template — fill in your own arguments for each section.",
      chips: ["Coherence Tips", "Academic Vocabulary", "Grammar Tips"],
      artifact: { title: "Argumentative Essay Blueprint", content: ESSAY_STRUCTURES.argumentative },
    }),
  },
  {
    intent: 'thesis',
    patterns: ['thesis', 'thesis statement', 'main statement', 'claim'],
    handler: () => ({
      text: "💡 A strong BUEPT thesis has 3 parts:\n\n1️⃣ **Concession:** 'While it is true that X...'\n2️⃣ **Stance:** '...it is more evident that Y...'\n3️⃣ **Reasons:** '...primarily because of A and B.'\n\nExample: 'While technology has improved productivity, it is more evident that it has widened the social inequality gap, primarily due to unequal access and digital literacy gaps.'\n\nWant to try writing one? Tell me your essay topic!",
      chips: ["Give me a topic", "Show me another example", "Back to essay structure"],
    }),
  },
  {
    intent: 'coherence',
    patterns: ['coherence', 'cohesion', 'flow', 'linking', 'connectors', 'transition', 'discourse markers'],
    handler: () => ({
      text: `🔗 Coherence & Cohesion Tips:\n\n${WRITING_TIPS.coherence.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}\n\nKey discourse markers:\n• Addition: Furthermore, Moreover, In addition\n• Contrast: However, Nevertheless, In contrast\n• Result: Therefore, Consequently, As a result\n• Example: For instance, For example, Namely`,
      chips: ["Academic Vocabulary", "Grammar Tips", "Back to essay structure"],
    }),
  },
  // Vocabulary
  {
    intent: 'vocab_upgrade',
    patterns: ['vocab', 'vocabulary', 'word', 'academic vocabulary', 'upgrade my words', 'word choices', 'lexical'],
    handler: () => ({
      text: `📚 Academic Vocabulary Upgrader:\n\n${WRITING_TIPS.vocabulary.join('\n')}\n\nAlso useful:\n• 'use' → utilise, employ, leverage\n• 'need' → require, necessitate\n• 'help' → facilitate, enable, support\n• 'change' → alter, modify, transform\n\nWant to take a vocabulary quiz? 🧠`,
      chips: ["🧠 Start Vocab Quiz", "Grammar Tips", "Essay Help"],
    }),
  },
  // Grammar
  {
    intent: 'grammar',
    patterns: ['grammar', 'tense', 'passive', 'conditional', 'article', 'articles'],
    handler: () => ({
      text: "📚 Which grammar topic do you need help with?",
      chips: ["Conditionals", "Passive Voice", "Articles (a/an/the)", "Academic Grammar Tips"],
    }),
  },
  {
    intent: 'conditional',
    patterns: ['conditional', 'conditionals', 'if clause', 'if i had', 'if i were'],
    handler: () => ({
      text: GRAMMAR_EXPLANATIONS.conditional,
      chips: ["Passive Voice", "Articles (a/an/the)", "Grammar tips", "Essay Help"],
    }),
  },
  {
    intent: 'passive',
    patterns: ['passive', 'passive voice', 'was done', 'is conducted'],
    handler: () => ({
      text: GRAMMAR_EXPLANATIONS.passive,
      chips: ["Conditionals", "Articles (a/an/the)", "Grammar tips"],
    }),
  },
  {
    intent: 'articles',
    patterns: ['article', 'articles', 'a/an', 'the', 'when to use the'],
    handler: () => ({
      text: GRAMMAR_EXPLANATIONS.articles,
      chips: ["Conditionals", "Passive Voice", "Grammar tips"],
    }),
  },
  {
    intent: 'grammar_tips',
    patterns: ['grammar tips', 'grammar for writing', 'academic grammar', 'formal grammar'],
    handler: () => ({
      text: `✏️ Grammar tips for BUEPT Writing:\n\n${WRITING_TIPS.grammar.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}`,
      chips: ["Conditionals", "Passive Voice", "Articles", "Coherence Tips"],
    }),
  },
  // Reading
  {
    intent: 'reading',
    patterns: ['reading', 'read', 'scanning', 'skimming', 'passage', 'comprehension', 'inference', 'reading tips'],
    handler: () => ({
      text: "📖 BUEPT Reading Strategies. Which skill do you want to develop?",
      chips: ["Skimming", "Scanning", "Inference Questions", "Tone Questions", "Summary Questions"],
    }),
  },
  {
    intent: 'skimming',
    patterns: ['skimming', 'skim', 'main idea', 'how to skim'],
    handler: () => ({
      text: READING_STRATEGIES.skimming + "\n\n**Practice**: Take any paragraph — read only the first sentence. Then predict what the rest will say. Check if you were right.",
      chips: ["Scanning", "Inference Questions", "Reading Tips"],
    }),
  },
  {
    intent: 'scanning',
    patterns: ['scanning', 'scan', 'find specific', 'locate information'],
    handler: () => ({
      text: READING_STRATEGIES.scanning + "\n\n**Tip for BUEPT**: questions often ask for specific dates, names, or percentages. Train your eye to 'jump' to those patterns.",
      chips: ["Skimming", "Inference Questions", "Reading Tips"],
    }),
  },
  {
    intent: 'inference',
    patterns: ['inference', 'infer', 'implied', 'not stated', 'implied meaning'],
    handler: () => ({
      text: READING_STRATEGIES.inference + "\n\n**BUEPT Inference approach**:\n1. Find the relevant paragraph\n2. Ask: What does the author assume the reader knows?\n3. Eliminate options that contradict the text\n4. Choose the option that MUST be true",
      chips: ["Tone Questions", "Skimming", "Summary"],
    }),
  },
  {
    intent: 'tone',
    patterns: ['tone', 'attitude', 'author attitude', 'author stance', 'author view'],
    handler: () => ({
      text: READING_STRATEGIES.tone + "\n\n**Common BUEPT tone options**: critical, neutral, optimistic, cautious, concerned, analytical, persuasive\n\nLook for intensifiers ('clearly', 'undoubtedly') vs. hedges ('may', 'could') to decide the strength of the author's stance.",
      chips: ["Inference Questions", "Reading Tips", "Essay Help"],
    }),
  },
  // Listening
  {
    intent: 'listening',
    patterns: ['listening', 'lecture', 'note taking', 'cornell', 'audio', 'audio comprehension', 'podcast'],
    handler: () => ({
      text: "🎧 BUEPT Listening strategies:\n\n**Before listening:**\n• Read all questions first — you have ~30 seconds\n• Predict what type of information is needed (date? name? reason?)\n\n**While listening:**\n• Don't try to transcribe everything — note keywords only\n• Listen for signal words: 'however', 'the key point is', 'in conclusion'\n• Numbers and proper nouns are usually tested directly\n\n**Cornell Note Method:**\n📋 Right column: notes as you hear\n🔑 Left column: keywords after listening\n✍️ Bottom: 2-sentence summary\n\nWant tips on specific listening question types?",
      chips: ["Detail Questions", "Main Idea", "Speaker Attitude", "Cornell Method"],
    }),
  },
  // Study tips
  {
    intent: 'study_tips',
    patterns: ['study', 'study tips', 'how to study', 'study plan', 'exam prep', 'exam preparation', 'prepare'],
    handler: () => ({
      text: `📊 Top BUEPT Study Strategies:\n\n${STUDY_TIPS.slice(0, 4).join('\n\n')}\n\nWant a personalised weekly study plan?`,
      chips: ["🗓️ Build Study Plan", "Pomodoro Explained", "Active Recall", "Spaced Repetition"],
    }),
  },
  {
    intent: 'study_plan',
    patterns: ['study plan', 'build study plan', 'weekly plan', 'schedule'],
    handler: () => ({
      text: "🗓️ Here's a recommended BUEPT study plan for a student with 4 weeks remaining:\n\n**Week 1 — Foundation**\n• Mon/Wed: Grammar (conditionals, passive, articles)\n• Tue/Thu: Reading strategies (skimming, scanning)\n• Fri: Vocab building (AWL list, synonyms)\n• Sat: Full reading practice test\n\n**Week 2 — Skills**\n• Mon/Wed: Academic writing (structure + coherence)\n• Tue/Thu: Listening note-taking\n• Fri: Mock essay (timed)\n• Sat: Review + weak points\n\n**Week 3 — Practice**\n• Daily: 1 reading passage + 1 listening\n• Alt days: essay drafts\n• Sat: Full mock under exam conditions\n\n**Week 4 — Polish**\n• Consolidate weak areas\n• Review vocab and grammar notes\n• 2 full mock exams\n• Thu/Fri: Rest and light review",
      chips: ["Writing Practice", "Vocab Quiz", "Back to Study Tips"],
    }),
  },
  {
    intent: 'synonym_tool',
    patterns: ['synonym finder', 'find synonyms', 'find synonym', 'similar word'],
    handler: () => ({
      text: "Opening Synonym Finder. Search one word, inspect word forms, and save useful items directly to My Words.",
      chips: ["Find Synonyms", "🧠 Vocab Quiz", "📚 Grammar"],
      navigate: 'SynonymFinder',
      params: { initialWord: 'significant' },
    }),
  },
  {
    intent: 'photo_vocab_tool',
    patterns: ['photo vocab', 'photo ocr', 'scan photo text', 'ocr tool', 'scan text'],
    handler: () => ({
      text: "Opening Photo to Vocab OCR. Use it when you want to capture vocabulary from worksheets, slides, or book pages.",
      chips: ["Photo OCR", "Find Synonyms", "🧠 Vocab Quiz"],
      navigate: 'PhotoVocabCapture',
    }),
  },
  {
    intent: 'presentation_tool',
    patterns: ['presentation prep', 'presentation script', 'slide outline', 'slide deck', 'presentation outline'],
    handler: () => ({
      text: "Opening AI Presentation Prep. Set your duration, tone, and level, then generate a usable presentation structure.",
      chips: ["Presentation Prep", "Lesson Video", "📝 Essay Help"],
      navigate: 'AIPresentationPrep',
      params: { topic: 'The role of AI in higher education' },
    }),
  },
  {
    intent: 'video_tool',
    patterns: ['lesson video', 'video studio', 'ai lesson video', 'generate video lesson'],
    handler: () => ({
      text: "Opening AI Lesson Video Studio. It is useful for short explainers, paraphrase demos, and mini grammar lessons.",
      chips: ["Lesson Video", "Presentation Prep", "📚 Grammar"],
      navigate: 'AILessonVideoStudio',
      params: { topic: 'BUEPT paraphrase strategy' },
    }),
  },
  {
    intent: 'demo_hub',
    patterns: ['demo', 'feature hub', 'modules', 'modüller', 'özellikler'],
    handler: () => ({
      text: "🧩 Opening the feature hub. From there you can filter live tools and jump directly into the modules you need.",
      chips: ["Open Demo Hub", "🧠 Vocab Quiz", "📝 Essay Help"],
      navigate: 'DemoFeatures',
    }),
  },
  {
    intent: 'mock_exam',
    patterns: ['mock', 'proficiency', 'hazırlık atlama', 'deneme sınavı'],
    handler: () => ({
      text: "⏳ Opening the proficiency mock. Use it for timed practice and realistic exam pacing.",
      chips: ["Start Mock", "Study Plan", "Grammar Tips"],
      navigate: 'ProficiencyMock',
    }),
  },
  // Vocab quiz start
  {
    intent: 'vocab_quiz_start',
    patterns: ['vocab quiz', 'start vocab quiz', 'test my vocab', 'quiz me', 'quiz'],
    handler: () => ({
      text: `🧠 Vocabulary Quiz — Question 1/${VOCABULARY_QUIZ.length}:\n\n**${VOCABULARY_QUIZ[0].q}**\n\nA) ${VOCABULARY_QUIZ[0].opts[0]}\nB) ${VOCABULARY_QUIZ[0].opts[1]}\nC) ${VOCABULARY_QUIZ[0].opts[2]}\nD) ${VOCABULARY_QUIZ[0].opts[3]}`,
      chips: ["A", "B", "C", "D"],
      quizIndex: 0,
      quizScore: 0,
    }),
  },
  // Score tracking
  {
    intent: 'writing_feedback',
    patterns: ['check my essay', 'evaluate my writing', 'feedback on', 'review my', 'is this good', 'grade my'],
    handler: () => ({
      text: "📝 Paste your essay paragraph below and I'll evaluate it for:\n\n✅ Thesis clarity\n✅ Topic sentence strength\n✅ Coherence and flow\n✅ Academic vocabulary level\n✅ Grammar accuracy\n\nGo ahead — paste it now!",
      chips: ["Never mind", "What makes a good paragraph?"],
    }),
  },
  // Default
  {
    intent: 'default',
    patterns: [],
    handler: (input) => {
      // Smart generic responses based on what the user typed
      const lower = input.toLowerCase();
      if (lower.length < 15) {
        return {
          text: "Could you elaborate a bit? I want to give you the most useful advice I can. 😊",
          chips: ["Essay Help", "Reading Tips", "Grammar", "Vocab Quiz"],
        };
      }
      // Check if looks like an essay paragraph (long text)
      if (lower.length > 100) {
        const hasGoodStructure = lower.includes('however') || lower.includes('furthermore') || lower.includes('therefore');
        const hasPassive = lower.includes('is') && lower.includes('by');
        const wordCount = lower.split(' ').length;
        return {
          text: `📝 Quick analysis of your text (${wordCount} words):\n\n${hasGoodStructure ? "✅ Good use of discourse markers!" : "⚠️ Try adding discourse markers (However, Furthermore, Therefore) for better cohesion."}\n${hasPassive ? "✅ Academic passive voice detected." : "💡 Consider using passive voice for a more formal academic tone."}\n${wordCount < 80 ? "⚠️ Body paragraphs should typically be 100-150 words minimum." : "✅ Good paragraph length."}\n\nFor a deeper review, I recommend checking the coherence and topic sentence structure.`,
          chips: ["Coherence Tips", "Grammar Tips", "Academic Vocabulary", "Essay Structure"],
        };
      }
      const tips = STUDY_TIPS;
      const tipIndex = pickNoRepeatIndex(tips.length, lastStudyTipIndex);
      lastStudyTipIndex = tipIndex;
      const intros = [
        "That's a useful question. Try this:",
        "Good prompt. This usually helps:",
        "Here is a practical move you can apply right now:",
      ];
      const introIndex = pickNoRepeatIndex(intros.length, lastDefaultIntroIndex);
      lastDefaultIntroIndex = introIndex;
      const tip = tips[tipIndex];
      return {
        text: `${intros[introIndex]}\n\n${tip}\n\nIs there a specific BUEPT skill I can help you with?`,
        chips: ["Essay Help", "Reading Tips", "Grammar", "Vocab Quiz", "Study Tips"],
      };
    },
  },
];

function buildQuizQuestion(index) {
  const q = VOCABULARY_QUIZ[index];
  if (!q) return '';
  return `🧠 Vocabulary Quiz — Question ${index + 1}/${VOCABULARY_QUIZ.length}:\n\n**${q.q}**\n\nA) ${q.opts[0]}\nB) ${q.opts[1]}\nC) ${q.opts[2]}\nD) ${q.opts[3]}`;
}

function pickNoRepeatIndex(length, lastIndex) {
  if (!length || length < 1) return 0;
  if (length === 1) return 0;
  let next = Math.floor(Math.random() * length);
  if (next === lastIndex) next = (next + 1 + Math.floor(Math.random() * (length - 1))) % length;
  return next;
}

function analyzeIntent(text, quizState) {
  const lower = text.trim().toLowerCase();

  // Quiz state machine — intercept A/B/C/D answers
  if (quizState !== null) {
    const answerMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const picked = answerMap[lower] ?? -1;
    if (picked >= 0 && quizState.index < VOCABULARY_QUIZ.length) {
      const q = VOCABULARY_QUIZ[quizState.index];
      const correct = picked === q.a;
      const nextScore = quizState.score + (correct ? 1 : 0);
      const nextIndex = quizState.index + 1;
      const resultLine = correct
        ? `✅ Correct! "${q.opts[q.a]}" is right.`
        : `❌ Incorrect. The correct answer was: "${q.opts[q.a]}"`;

      if (nextIndex >= VOCABULARY_QUIZ.length) {
        const score = nextScore;
        const grade = score >= 4 ? "🌟 Excellent!" : score >= 3 ? "👍 Good effort!" : "📖 Keep studying!";
        return {
          text: `${resultLine}\n\n🏁 Quiz Complete! Final Score: **${score}/${VOCABULARY_QUIZ.length}**\n${grade}\n\nYour vocabulary is ${score >= 4 ? 'strong' : 'developing'}. Keep using flashcards and reading academic texts to build your lexical resource.`,
          chips: ["🧠 New Quiz", "Vocab Upgrade Tips", "Essay Help", "Study Tips"],
          nextQuizState: null,
        };
      }

      return {
        text: `${resultLine}\n\n─────────────────\n${buildQuizQuestion(nextIndex).replace('🧠 Vocabulary Quiz — ', '')}`,
        chips: ["A", "B", "C", "D"],
        nextQuizState: { index: nextIndex, score: nextScore },
      };
    }
    if (quizState.index < VOCABULARY_QUIZ.length) {
      return {
        text: `Please answer with one option: **A, B, C or D**.\n\n${buildQuizQuestion(quizState.index)}`,
        chips: ["A", "B", "C", "D"],
        nextQuizState: quizState,
      };
    }
  }

  // Vocab quiz trigger — set state machine
  if (lower.includes('vocab quiz') || lower.includes('quiz me') || lower.includes('start vocab quiz') || lower === '🧠 start vocab quiz' || lower === 'new quiz' || lower === '🧠 new quiz') {
    return {
      text: buildQuizQuestion(0),
      chips: ["A", "B", "C", "D"],
      nextQuizState: { index: 0, score: 0 },
    };
  }

  // Run intent patterns
  for (const intent of INTENT_PATTERNS) {
    if (intent.intent === 'default') continue;
    if (intent.patterns.some(p => lower.includes(p))) {
      return intent.handler(text);
    }
  }

  // Smart default
  return INTENT_PATTERNS.find(i => i.intent === 'default').handler(text);
}

function applyAssistantMode(text, mode) {
  if (!text) return text;
  if (mode === 'examiner') {
    return `🎯 Examiner Mode\n${text}\n\nRubric focus: clarity, coherence, grammar accuracy, lexical range.`;
  }
  if (mode === 'tool-guide') {
    return `🧭 Tool Guide Mode\n${text}\n\nIf needed, I will route you to the most relevant AI tool instead of giving a long text explanation.`;
  }
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatbotScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [messages, setMessages] = useState([]); // Populated from AsyncStorage on mount
  const [activeChips, setActiveChips] = useState(DEFAULT_CHIPS);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [quizState, setQuizState] = useState(null);
  const [assistantMode, setAssistantMode] = useState('coach');
  const [showTools, setShowTools] = useState(false);
  const [webAccess, setWebAccess] = useState(false);
  const inputRef = useRef();
  const [ttsReadingId, setTtsReadingId] = useState(null);
  const [replySource, setReplySource] = useState(isChatApiConfigured() ? 'hybrid' : 'offline');
  const [activeModelName, setActiveModelName] = useState('...');
  const sourceMeta = getAiSourceMeta(replySource);
  const scrollRef = useRef();
  const artifactAnim = useRef(new Animated.Value(width)).current;
  const timersRef = useRef([]);

  const WELCOME = {
    id: '1', role: 'ai',
    text: WELCOME_MESSAGE,
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@ai_access_config');
        if (raw) {
          const cfg = JSON.parse(raw);
          setActiveModelName(cfg.ollamaModel || 'dolphin-llama3:8b');
        } else {
          setActiveModelName('dolphin-llama3:8b');
        }

        const stateRaw = await AsyncStorage.getItem(CHAT_STATE_KEY);
        if (!stateRaw) {
          // First launch — show welcome message
          setMessages([WELCOME]);
          return;
        }
        const parsed = JSON.parse(stateRaw);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          // Restore previous session — do NOT add welcome on top
          setMessages(parsed.messages);
        } else {
          setMessages([WELCOME]);
        }
        if (Array.isArray(parsed.activeChips)) {
          setActiveChips(parsed.activeChips);
        }
        if (parsed.quizState && typeof parsed.quizState.index === 'number') {
          setQuizState(parsed.quizState);
        }
        if (parsed.assistantMode === 'coach' || parsed.assistantMode === 'examiner' || parsed.assistantMode === 'tool-guide') {
          setAssistantMode(parsed.assistantMode);
        }
      } catch (_) {
        setMessages([WELCOME]);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const payload = {
          messages: messages.slice(-40),
          activeChips: activeChips.slice(0, 8),
          quizState,
          assistantMode,
        };
        await AsyncStorage.setItem(CHAT_STATE_KEY, JSON.stringify(payload));
      } catch (_) { }
    })();
  }, [messages, activeChips, quizState, assistantMode]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const closeArtifact = useCallback(() => {
    Animated.timing(artifactAnim, { toValue: width, duration: 280, useNativeDriver: true }).start(() => setActiveArtifact(null));
  }, [artifactAnim]);

  const openTool = useCallback((tool) => {
    if (!tool?.route) return;
    navigation.navigate(tool.route, tool.params || undefined);
  }, [navigation]);

  const handleSend = useCallback((textOverride = null) => {
    const txt = (textOverride || inputText).trim();
    if (!txt) return;
    if (txt === '/help') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: "Commands:\n• `/clear` → clear history\n• `/quiz` → start vocab quiz\n• `/demo` → open feature hub\n• `/mock` → open proficiency mock\n• `/tools` → show tool shortcuts"
      }]);
      setActiveChips(["/quiz", "/demo", "/mock", "/tools", "/clear"]);
      setInputText('');
      return;
    }
    if (txt === '/quiz') {
      setInputText('');
      handleSend('🧠 Start Vocab Quiz');
      return;
    }
    if (txt === '/demo') {
      setInputText('');
      handleSend('Open Demo Hub');
      return;
    }
    if (txt === '/mock') {
      setInputText('');
      handleSend('Start Mock');
      return;
    }
    if (txt === '/tools') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: "Tool shortcuts ready. You can open Synonym Finder, Photo OCR, Presentation Prep, or Lesson Video directly from the launcher above."
      }]);
      setActiveChips(["Find Synonyms", "Photo OCR", "Presentation Prep", "Lesson Video"]);
      setInputText('');
      return;
    }
    if (txt === '/clear' || txt.toLowerCase() === 'temizle') {
      setMessages([{
        id: Date.now().toString(),
        role: 'ai',
        text: "History cleared. What do you want to practice now?"
      }]);
      setActiveChips(DEFAULT_CHIPS);
      setInputText('');
      setQuizState(null);
      AsyncStorage.removeItem(CHAT_STATE_KEY).catch(() => { });
      return;
    }

    const userMsg = { id: Date.now().toString(), role: 'user', text: txt };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setActiveChips([]);
    setIsTyping(true);

    const t0 = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    timersRef.current.push(t0);

    // Simulate thinking delay proportional to message length (feels more real)
    const delay = Math.max(800, Math.min(2400, txt.length * 40));

    const t1 = setTimeout(() => {
      (async () => {
        let webContext = "";
        if (webAccess) {
          setIsTyping(true); // Keep typing while searching
          webContext = await performWebSearch(txt);
        }

        const local = analyzeIntent(txt, quizState);
        let final = local;
        // Keep deterministic flows local (quiz/navigation artifacts), but upgrade free-text replies via API.
        const canUseSmartReply = !local.nextQuizState && !local.navigate && !local.artifact;
        if (canUseSmartReply) {
          const apiMessage = webContext 
            ? `[WEB CONTEXT]: ${webContext}\n\n[USER MESSAGE]: ${txt}`
            : txt;

          const online = await requestChatbotReply({
            message: apiMessage,
            mode: assistantMode,
            history: updatedMessages,
          });
          if (online?.text) {
            final = {
              ...local,
              ...online,
              text: online.text,
              chips: online.chips?.length ? online.chips : local.chips,
            };
            setReplySource(online.source || (isChatApiConfigured() ? 'online' : 'offline'));
          } else {
            setReplySource('offline');
          }
        } else if (isChatApiConfigured()) {
          setReplySource('hybrid');
        }

        setMessages(currentMessages => {
          const aiMsg = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: applyAssistantMode(final.text, assistantMode),
          };
          return [...currentMessages, aiMsg];
        });
        if (Object.prototype.hasOwnProperty.call(final, 'nextQuizState')) {
          setQuizState(final.nextQuizState);
        }
        setActiveChips(final.chips || []);
        setIsTyping(false);

        if (final.artifact) {
          setActiveArtifact(final.artifact);
          Animated.spring(artifactAnim, { toValue: 0, useNativeDriver: true, tension: 55, friction: 9 }).start();
        }
        if (final.navigate) {
          const t2 = setTimeout(() => {
            navigation.navigate(final.navigate, final.params || undefined);
          }, 250);
          timersRef.current.push(t2);
        }

        const t3 = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        timersRef.current.push(t3);
      })();
    }, delay);
    timersRef.current.push(t1);
  }, [inputText, artifactAnim, quizState, navigation, assistantMode, messages]);

  const handleTts = useCallback(async (msg) => {
    if (ttsReadingId === msg.id) {
      await stopEnglishTts();
      setTtsReadingId(null);
      return;
    }
    setTtsReadingId(msg.id);
    await speakEnglish(msg.text, { onDone: () => setTtsReadingId(null) });
  }, [ttsReadingId]);

  return (
    <Screen contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.aiAvatarHeader}>
          <Ionicons name="sparkles" size={18} color="#fff" />
        </View>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.pageTitle}>BUEPT Global AI</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>{sourceMeta.label} • {activeModelName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.quickRow}>
        {CHAT_MODES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.modeBtn, assistantMode === m.id && styles.modeBtnActive]}
            onPress={() => setAssistantMode(m.id)}
          >
            <Text style={[styles.modeBtnText, assistantMode === m.id && styles.modeBtnTextActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.quickBtn} onPress={() => setShowTools(!showTools)}>
          <Ionicons name={showTools ? "chatbox-ellipses" : "grid"} size={14} color={colors.primary} />
          <Text style={styles.quickText}>{showTools ? "Chat" : "Tools"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setWebAccess(!webAccess)}>
          <Ionicons name={webAccess ? "globe" : "globe-outline"} size={14} color={webAccess ? colors.success : colors.primary} />
          <Text style={[styles.quickText, webAccess && { color: colors.success }]}>Web {webAccess ? "ON" : "OFF"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => handleSend('/clear')}>
          <Ionicons name="trash" size={14} color={colors.primary} />
          <Text style={styles.quickText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {showTools && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.toolStrip}
          contentContainerStyle={styles.toolStripContent}
        >
          {TOOL_SHORTCUTS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              activeOpacity={0.88}
              onPress={() => openTool(tool)}
            >
              <View style={[styles.toolCardIcon, { backgroundColor: tool.tint }]}>
                <Ionicons name={tool.icon} size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.toolCardBody}>
                <Text style={styles.toolCardTitle}>{tool.label}</Text>
                <Text style={styles.toolCardHint}>{tool.hint}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <KeyboardAvoidingView 
        style={[styles.keyboardAvoid, { width: width }]} 
        enabled={Platform.OS !== 'web'} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollRef} 
          contentContainerStyle={styles.chatScroll} 
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        >
          <Text style={styles.timestampDivider}>BUEPT Global AI · Unrestricted</Text>

          {messages.length <= 2 && (
            <>
              <Card style={styles.launchPad}>
                <Text style={styles.launchPadTitle}>Start Faster</Text>
                <Text style={styles.launchPadSub}>Load a ready-made prompt or jump into one of the AI tools.</Text>
                <View style={styles.packRow}>
                  {COACH_PACKS.map((pack) => (
                    <TouchableOpacity
                      key={pack.id}
                      style={styles.packChip}
                      onPress={() => setInputText(pack.prompt)}
                    >
                      <Text style={styles.packChipText}>{pack.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
              <Card style={styles.workspaceCard}>
                <Text style={styles.launchPadTitle}>AI Workspaces</Text>
                <Text style={styles.launchPadSub}>Use the dedicated tool when the task needs generation, scoring, or structured output.</Text>
                {AI_WORKFLOWS.map((flow) => (
                  <TouchableOpacity
                    key={flow.id}
                    style={styles.workspaceRow}
                    onPress={() => navigation.navigate(flow.action.route, flow.action.params || undefined)}
                  >
                    <View style={styles.workspaceCopy}>
                      <Text style={styles.workspaceTitle}>{flow.label}</Text>
                      <Text style={styles.workspaceSub}>{flow.sub}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={colors.primaryDark} />
                  </TouchableOpacity>
                ))}
              </Card>
            </>
          )}

          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.role === 'user' ? styles.messageRowUser : styles.messageRowAI]}>
              {msg.role === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <RichText
                  text={msg.text}
                  style={[styles.messageText, msg.role === 'user' ? styles.messageTextUser : styles.messageTextAI]}
                  boldStyle={styles.richTextBold}
                />
                {msg.role === 'ai' && (
                  <TouchableOpacity 
                    style={styles.ttsIconBtn} 
                    onPress={() => handleTts(msg)}
                  >
                    <Ionicons 
                      name={ttsReadingId === msg.id ? "volume-high" : "volume-medium-outline"} 
                      size={16} 
                      color={ttsReadingId === msg.id ? colors.primary : colors.muted} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowAI]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </View>
              <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Chip suggestions */}
        <View style={styles.inputContainer}>
          {activeChips.length > 0 && !isTyping && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {activeChips.map((chip, i) => (
                <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(chip)}>
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputHero}>
            <TextInput
              ref={inputRef}
              style={styles.inputArea}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about essays, reading, grammar..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={800}
              onKeyPress={(e) => {
                if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Text style={styles.charCount}>{inputText.length}/800</Text>
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Artifact panel */}
        {activeArtifact && (
          <Animated.View style={[styles.artifactOverlay, { transform: [{ translateX: artifactAnim }] }]}>
            <View style={styles.artifactHeader}>
              <Ionicons name="document-text" size={18} color={colors.primary} style={styles.artifactIcon} />
              <Text style={styles.artifactTitle}>{activeArtifact.title}</Text>
              <TouchableOpacity onPress={closeArtifact} style={styles.artifactCloseBtn}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.artifactContent}>
              <Text style={styles.artifactText}>{activeArtifact.content}</Text>
            </ScrollView>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
  aiAvatarHeader: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerTitleWrap: { flex: 1 },
  pageTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 5 },
  statusText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, paddingTop: 6, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modeBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeBtnText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  modeBtnTextActive: { color: '#fff' },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  quickText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  toolStrip: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  toolStripContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: 10 },
  toolCard: {
    width: 196,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E3F8',
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolCardIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  toolCardBody: { flex: 1 },
  toolCardTitle: { fontSize: 13, fontWeight: '800', color: colors.primaryDark },
  toolCardHint: { fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 15 },

  keyboardAvoid: { flex: 1 },
  chatScroll: { padding: spacing.lg, paddingBottom: 32 },
  timestampDivider: { textAlign: 'center', fontSize: 11, color: colors.muted, fontWeight: '700', marginBottom: spacing.lg, textTransform: 'uppercase', letterSpacing: 1 },
  launchPad: { marginBottom: spacing.lg },
  launchPadTitle: { fontSize: 17, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  launchPadSub: { fontSize: 13, color: colors.muted, lineHeight: 19, marginBottom: spacing.md },
  packRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  packChip: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#D6E3F8',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  packChipText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  workspaceCard: { marginBottom: spacing.lg, backgroundColor: '#FBFDFF' },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  workspaceCopy: { flex: 1 },
  workspaceTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 2 },
  workspaceSub: { fontSize: 12, color: colors.muted, lineHeight: 17 },

  messageRow: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageRowAI: { alignSelf: 'flex-start', justifyContent: 'flex-start' },

  aiAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8, flexShrink: 0 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '85%' },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', ...shadow.slight },
  typingBubble: { paddingHorizontal: 20, paddingVertical: 16 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextUser: { color: '#fff' },
  messageTextAI: { color: colors.text },
  richTextBold: { fontWeight: '900' },
  ttsIconBtn: { alignSelf: 'flex-end', marginTop: 4, padding: 4 },

  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  chipScroll: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 4, gap: 8 },
  chip: { backgroundColor: colors.primarySoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  chipText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },

  inputHero: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md },
  inputArea: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingTop: 12, paddingBottom: 10, fontSize: 15, color: colors.text, marginRight: spacing.sm },
  charCount: { position: 'absolute', right: 58, bottom: 8, fontSize: 10, color: colors.muted, fontWeight: '600' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  sendBtnDisabled: { backgroundColor: '#CBD5E0', shadowOpacity: 0 },

  artifactOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, backgroundColor: '#fff', ...shadow.lg, borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.08)', zIndex: 1000, paddingTop: Platform.OS === 'ios' ? 56 : 16 },
  artifactHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  artifactIcon: { marginRight: 8 },
  artifactTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.primaryDark },
  artifactCloseBtn: { padding: 4 },
  artifactContent: { padding: spacing.lg },
  artifactText: { fontSize: 14, color: colors.text, lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
