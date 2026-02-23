import { getWordEntry } from './dictionary';

const DEFAULT_SUGGESTIONS = [
  'Give me a 7‑day BUEPT study plan.',
  'How can I improve my thesis statement?',
  'Quiz me on academic vocabulary.',
  'Quiz me on grammar.',
  'Explain passive voice with examples.',
  'How should I approach reading questions?'
];

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
  if (looksLikeEssay(userText)) {
    return {
      text: 'I can review this draft. Tap “Quick Essay Review” below.',
      suggestions: ['Quick Essay Review', 'Give me 3 thesis options']
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
      'Try: “Explain passive voice,” “Give me a thesis sentence,” or “Define resilience.”',
    suggestions: DEFAULT_SUGGESTIONS
  };
}
function looksLikeEssay(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return words >= 80 && text.includes('\n');
}
