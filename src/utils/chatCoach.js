import { getWordEntry } from './dictionary';
import writingPrompts from '../../data/writing_prompts.json';
import grammarTasks from '../../data/grammar_tasks.json';
import testEnglishGrammarTasks from '../../data/test_english_grammar_tasks.json';
import readingTasks from '../../data/reading_tasks.json';
import academicVerbs from '../../data/academic_verbs.json';

const DEFAULT_SUGGESTIONS = [
  'Give me a 7‑day BUEPT study plan.',
  'How can I improve my thesis statement?',
  'Quiz me on academic vocabulary.',
  'Quiz me on grammar.',
  'Explain passive voice with examples.',
  'How should I approach reading questions?'
];

const ALL_GRAMMAR_TASKS = [...grammarTasks, ...testEnglishGrammarTasks];

const TOPIC_HINTS = {
  writing: [
    'Keep a clear thesis in the first paragraph.',
    'Use topic sentences for each body paragraph.',
    'Support claims with one specific example per paragraph.',
    'Avoid repetition by varying connectors.'
  ],
  grammar: [
    'Check subject–verb agreement in long sentences.',
    'Use past perfect only for actions before another past action.',
    'Prefer active voice unless the doer is unknown.',
    'Use articles (a/an/the) consistently.'
  ],
  reading: [
    'Skim first, then read for evidence.',
    'Match options to exact wording in the passage.',
    'Identify the author’s stance before answering tone questions.'
  ],
  listening: [
    'Focus on signpost phrases (first, however, as a result).',
    'Note contrasts and cause–effect relations.',
    'Avoid writing every word; capture key ideas.'
  ],
  vocab: [
    'Learn collocations, not isolated words.',
    'Review synonyms/antonyms in context.',
    'Group words by topic (education, technology, environment).'
  ],
  exam: [
    'Time‑box each section and move on if stuck.',
    'Do not over‑think vocabulary questions—trust context.',
    'Leave 3–5 minutes for review.'
  ]
};

function detectTopic(text) {
  const t = text.toLowerCase();
  if (t.includes('writing') || t.includes('essay') || t.includes('thesis')) return 'writing';
  if (t.includes('grammar') || t.includes('tense') || t.includes('article')) return 'grammar';
  if (t.includes('reading') || t.includes('passage')) return 'reading';
  if (t.includes('listening') || t.includes('lecture') || t.includes('audio')) return 'listening';
  if (t.includes('vocab') || t.includes('word') || t.includes('synonym')) return 'vocab';
  if (t.includes('buept') || t.includes('exam') || t.includes('test')) return 'exam';
  return null;
}

function extractWordQuery(text) {
  const m = text.match(/define\s+([a-zA-Z'-]{2,})/i) || text.match(/meaning of\s+([a-zA-Z'-]{2,})/i);
  if (m) return m[1].toLowerCase();
  return null;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractQuoted(text = '') {
  const m = text.match(/"([^"]{8,})"/);
  if (m) return m[1];
  return null;
}

function pickAcademicVerb() {
  return pick(academicVerbs)?.word || 'analyze';
}

function improveSentence(sentence = '') {
  let out = sentence.trim();
  if (!out) return '';
  out = out.replace(/\s+/g, ' ');
  out = out.replace(/\ba lot\b/gi, 'significantly');
  out = out.replace(/\bvery\b/gi, 'highly');
  out = out.replace(/\bkind of\b/gi, 'somewhat');
  out = out.replace(/\bget\b/gi, 'obtain');
  if (!/[.!?]$/.test(out)) out += '.';
  if (!/^[A-Z]/.test(out)) out = out.charAt(0).toUpperCase() + out.slice(1);
  if (!/(however|therefore|moreover|in addition|as a result)/i.test(out)) {
    out = out.replace(/[.!?]$/, ', therefore the claim is clearer.');
  }
  const verb = pickAcademicVerb();
  if (!new RegExp(`\\b(${verb})\\b`, 'i').test(out)) {
    out = out.replace(/^[A-Z][^a-z]*[a-z]*/, (m) => `${m} (${verb} the key evidence)`);
  }
  return out;
}

function buildModelAnswer(promptText = '') {
  const verb1 = pickAcademicVerb();
  const verb2 = pickAcademicVerb();
  const verb3 = pickAcademicVerb();
  return (
    `Thesis: ${promptText ? `This response addresses: ${promptText}` : 'This response addresses the prompt with a clear claim.'}\n` +
    `Body: First, I ${verb1} the main reason and support it with a concrete example from academic context. ` +
    `Moreover, I ${verb2} the counterpoint and show why the main argument remains stronger. ` +
    `Finally, I ${verb3} the implications and connect them to broader academic expectations.\n` +
    `Conclusion: The argument is cohesive, evidence-based, and appropriately cautious.`
  );
}

function analyzeEssay(text = '') {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 3);
  const sentenceCount = sentences.length || 1;
  const avgSentence = Math.round((wordCount / sentenceCount) * 10) / 10;
  const connectors = ['however', 'therefore', 'moreover', 'in addition', 'for example', 'on the other hand', 'as a result'];
  const connectorHits = connectors.filter((c) => text.toLowerCase().includes(c)).length;
  const verbHits = academicVerbs
    .slice(0, 80)
    .filter((v) => new RegExp(`\\b${v.word}\\b`, 'i').test(text))
    .length;

  let content = 50;
  if (wordCount >= 120) content += 15;
  if (wordCount >= 180) content += 5;
  if (sentenceCount >= 5) content += 10;
  if (connectorHits >= 2) content += 10;
  if (avgSentence >= 12) content += 5;
  content = Math.min(90, content);

  let language = 50;
  if (verbHits >= 2) language += 10;
  if (verbHits >= 4) language += 8;
  if (avgSentence >= 10) language += 6;
  if (connectorHits >= 2) language += 6;
  language = Math.min(90, language);

  let organization = 50;
  if (sentenceCount >= 5) organization += 10;
  if (connectorHits >= 2) organization += 10;
  if (text.includes('\n')) organization += 6;
  organization = Math.min(90, organization);

  const tips = [];
  if (wordCount < 120) tips.push('Increase length to at least 120 words.');
  if (connectorHits < 2) tips.push('Add 2+ connectors (however, therefore, in addition).');
  if (verbHits < 2) tips.push('Use 2+ academic verbs (analyze, evaluate, demonstrate).');
  if (avgSentence < 10) tips.push('Combine short sentences to improve flow.');
  if (!tips.length) tips.push('Good baseline. Upgrade with precise academic vocabulary and one strong example.');

  return { wordCount, sentenceCount, avgSentence, connectorHits, verbHits, content, language, organization, tips };
}

export function buildCoachReply(userText = '', state = {}) {
  const word = extractWordQuery(userText);
  if (word) {
    const entry = getWordEntry(word);
    if (entry) {
      return {
        text:
          `**${entry.word}** (${entry.word_type || 'word'})\\n` +
          `${entry.simple_definition || 'No simple definition yet.'}\\n` +
          (entry.synonyms?.length ? `Synonyms: ${entry.synonyms.slice(0, 6).join(', ')}` : 'Synonyms: —'),
        suggestions: DEFAULT_SUGGESTIONS
      };
    }
    return {
      text: `I couldn't find **${word}** in the offline dictionary. Try another word or ask for a usage example.`,
      suggestions: DEFAULT_SUGGESTIONS
    };
  }

  const lower = userText.toLowerCase();
  if (lower.includes('rewrite') || lower.includes('improve sentence')) {
    const quoted = extractQuoted(userText);
    const base = quoted || userText.split(/[.!?]/).map((s) => s.trim()).filter(Boolean)[0] || '';
    const improved = improveSentence(base);
    return {
      text: `Rewrite:\nOriginal: ${base}\nImproved: ${improved}`,
      suggestions: ['Rewrite another sentence', 'Give 3 thesis options', 'Show academic verbs']
    };
  }

  if (lower.includes('model answer') || lower.includes('sample answer')) {
    const quoted = extractQuoted(userText);
    const prompt = quoted || userText.replace(/model answer|sample answer|for/gi, '').trim();
    const usePrompt = prompt.length > 8 ? prompt : (pick(writingPrompts)?.prompt || '');
    return {
      text: buildModelAnswer(usePrompt),
      suggestions: ['Make it shorter', 'Add connectors', 'Rewrite conclusion']
    };
  }
  if (looksLikeEssay(userText)) {
    const rubric = analyzeEssay(userText);
    return {
      text:
        `Quick Rubric (auto)\\n` +
        `Content: ${rubric.content}/90\\n` +
        `Organization: ${rubric.organization}/90\\n` +
        `Language: ${rubric.language}/90\\n` +
        `Stats: ${rubric.wordCount} words, ${rubric.sentenceCount} sentences, avg ${rubric.avgSentence} words/sentence\\n` +
        `Tips:\\n- ${rubric.tips.join('\\n- ')}`,
      suggestions: ['Give me 3 thesis options', 'Suggest better connectors', 'Rewrite one sentence']
    };
  }
  if (lower.includes('quiz me on academic vocabulary') || lower.includes('vocab quiz')) {
    const words = (state.vocabList || []).slice(0, 20);
    const pickWord = words.length ? pick(words) : null;
    if (pickWord) {
      const entry = getWordEntry(pickWord.word) || pickWord;
      return {
        text: `Vocab Quiz: What is the best meaning of **${entry.word}**?\\nA) ${entry.simple_definition || 'Not sure'}\\nB) Opposite meaning\\nC) An unrelated word\\nD) A place name`,
        suggestions: ['Answer: A', 'Give me another vocab question', 'Show example sentence'],
        quiz: { type: 'vocab', correct: 'A' }
      };
    }
    return {
      text: 'Vocab Quiz: Choose the best meaning of **resilient**.\\nA) able to recover quickly\\nB) easily broken\\nC) related to medicine\\nD) not connected',
      suggestions: ['Answer: A', 'Give me another vocab question'],
      quiz: { type: 'vocab', correct: 'A' }
    };
  }
  if (lower.includes('quiz me on grammar') || lower.includes('grammar quiz')) {
    const items = [
      { q: 'She ___ to class every day.', options: ['go', 'goes', 'going', 'gone'], a: 'B' },
      { q: 'If I ___ time, I would help.', options: ['have', 'had', 'will have', 'has'], a: 'B' },
      { q: 'The report was submitted ___ Monday.', options: ['on', 'in', 'at', 'by'], a: 'A' },
      { q: 'Neither the students nor the teacher ___ late.', options: ['was', 'were', 'is', 'be'], a: 'A' }
    ];
    const item = pick(items);
    return {
      text: `Grammar Quiz: ${item.q}\\nA) ${item.options[0]}\\nB) ${item.options[1]}\\nC) ${item.options[2]}\\nD) ${item.options[3]}`,
      suggestions: ['Answer: A', 'Answer: B', 'Answer: C', 'Answer: D', 'Another grammar question'],
      quiz: { type: 'grammar', correct: item.a }
    };
  }

  if (lower.includes('random reading') || lower.includes('reading question')) {
    const task = pick(readingTasks);
    if (task?.questions?.length) {
      const q = pick(task.questions);
      return {
        text:
          `Reading Quick Check (${task.level || 'P2'}): ${q.q}\\n` +
          q.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('\\n'),
        suggestions: ['Answer: A', 'Answer: B', 'Answer: C', 'Answer: D'],
        quiz: { type: 'reading', correct: String.fromCharCode(65 + (q.answer || 0)) }
      };
    }
  }

  if (lower.includes('random grammar') || lower.includes('grammar question')) {
    const task = pick(ALL_GRAMMAR_TASKS);
    if (task?.questions?.length) {
      const q = pick(task.questions);
      return {
        text:
          `Grammar Quick Check (${task.level || 'P2'}): ${q.q}\\n` +
          q.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('\\n'),
        suggestions: ['Answer: A', 'Answer: B', 'Answer: C', 'Answer: D'],
        quiz: { type: 'grammar', correct: String.fromCharCode(65 + (q.answer || 0)) }
      };
    }
  }

  if (lower.includes('random writing') || lower.includes('writing prompt')) {
    const prompt = pick(writingPrompts);
    if (prompt) {
      return {
        text:
          `Writing Prompt (${prompt.level || 'P2'} / ${prompt.task || 'paragraph'}):\\n` +
          `${prompt.prompt}\\n` +
          (prompt.keywords?.length ? `Keywords: ${prompt.keywords.join(', ')}` : ''),
        suggestions: ['Open Writing Editor', 'Give me 3 thesis options']
      };
    }
  }

  if (lower.includes('academic verbs') || lower.includes('verb list')) {
    const sample = academicVerbs.slice(0, 10).map((v) => v.word).join(', ');
    return {
      text: `Academic verb starter list: ${sample}. Ask for more or a random verb.`,
      suggestions: ['Random academic verb', 'How to use analyze', 'Give me 10 more verbs']
    };
  }

  if (lower.includes('random verb')) {
    const v = pick(academicVerbs);
    if (v) {
      return {
        text: `${v.word}: ${v.definition}\\nExample: ${v.example}`,
        suggestions: ['Another verb', `Use ${v.word} in a sentence`]
      };
    }
  }

  if (lower.includes('give me 3 thesis')) {
    return {
      text:
        'Here are three thesis templates you can adapt:\\n' +
        '1) Although X is common, it should be limited because A and B.\\n' +
        '2) X brings benefits, but the long‑term costs outweigh them.\\n' +
        '3) To address X effectively, institutions must prioritize Y and Z.',
      suggestions: DEFAULT_SUGGESTIONS
    };
  }

  const topic = detectTopic(userText);
  if (topic) {
    return {
      text:
        `Here are focused tips for **${topic}**:\\n` +
        TOPIC_HINTS[topic].map((t) => `• ${t}`).join('\\n'),
      suggestions: DEFAULT_SUGGESTIONS
    };
  }

  if (userText.toLowerCase().includes('plan')) {
    return {
      text:
        'Here is a compact 7‑day BUEPT plan:\\n' +
        'Day 1: Reading + vocab (academic list)\\n' +
        'Day 2: Grammar drills + error review\\n' +
        'Day 3: Listening + transcript review\\n' +
        'Day 4: Writing (essay) + feedback\\n' +
        'Day 5: Mixed practice (reading + listening)\\n' +
        'Day 6: Mock exam + analysis\\n' +
        'Day 7: Weak‑area review + vocab recycle',
      suggestions: DEFAULT_SUGGESTIONS
    };
  }

  return {
    text:
      'I can help with BUEPT writing, grammar, reading, listening, and vocabulary.\\n' +
      'Try: “Random reading question,” “Academic verb list,” or “Define resilience.”',
    suggestions: DEFAULT_SUGGESTIONS
  };
}
function looksLikeEssay(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return words >= 80 && text.includes('\n');
}
