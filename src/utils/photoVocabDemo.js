import { getWordEntry } from './dictionary';

export const PHOTO_OCR_DEMO_SAMPLES = [
  {
    id: 'lecture-slide',
    label: 'Lecture Slide',
    context: 'Social sciences lecture',
    text: 'Methodology and empirical evidence are central to a coherent argument. Students should evaluate assumptions, synthesize findings, and articulate implications with precision.',
  },
  {
    id: 'news-column',
    label: 'News Column',
    context: 'Academic news snippet',
    text: 'Researchers highlighted sustainable infrastructure, institutional resilience, and regulatory compliance. The report emphasized transparency, accountability, and long-term viability.',
  },
  {
    id: 'essay-draft',
    label: 'Essay Draft',
    context: 'Student writing draft',
    text: 'Although technological innovation accelerates productivity, unequal access may intensify social disparity. Therefore, policymakers should implement inclusive mechanisms and measurable interventions.',
  },
  {
    id: 'exam-sheet',
    label: 'Exam Sheet',
    context: 'BUEPT style prompt',
    text: 'Analyze the passage and identify the writer\'s primary stance. Substantiate your response with relevant evidence, compare contrasting viewpoints, and justify your conclusion.',
  },
];

const LEVEL_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const VALID_LEVELS = new Set(Object.keys(LEVEL_RANK));
const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'into', 'your', 'their', 'about', 'have', 'has', 'had',
  'should', 'would', 'could', 'there', 'which', 'when', 'what', 'where', 'while', 'after', 'before', 'then',
  'than', 'were', 'was', 'are', 'is', 'it', 'its', 'our', 'you', 'they', 'them', 'his', 'her', 'she', 'him',
  'who', 'why', 'how', 'may', 'might', 'can', 'will', 'also', 'more', 'most', 'very', 'much', 'many', 'such',
  'only', 'just', 'each', 'some', 'any', 'all', 'not', 'but', 'one', 'two', 'three',
]);

const ACADEMIC_SUFFIXES = [
  'tion', 'sion', 'ment', 'ness', 'ity', 'ance', 'ence', 'ism', 'ist',
  'ical', 'ology', 'ivity', 'ative', 'ously', 'ively', 'ially', 'ality',
];

function normalizeLevel(level = 'B2') {
  const lv = String(level || '').toUpperCase().trim();
  return VALID_LEVELS.has(lv) ? lv : 'B2';
}

function levelAtLeast(level = 'B2', minLevel = 'B1') {
  return (LEVEL_RANK[normalizeLevel(level)] || 0) >= (LEVEL_RANK[normalizeLevel(minLevel)] || 0);
}

function inferPos(word = '') {
  const w = String(word || '').toLowerCase();
  if (!w) return 'noun';
  if (/(ly)$/.test(w)) return 'adverb';
  if (/(ing|ed|ize|ise|ify|ate|en)$/.test(w)) return 'verb';
  if (/(ous|ive|able|ible|al|ial|ic|ical|less|ful|ent|ant|ary)$/.test(w)) return 'adjective';
  return 'noun';
}

function normalizePos(value = '') {
  const t = String(value || '').toLowerCase();
  if (t.includes('noun')) return 'noun';
  if (t.includes('verb')) return 'verb';
  if (t.includes('adverb') || t.includes('adv')) return 'adverb';
  if (t.includes('adjective') || t.includes('adj')) return 'adjective';
  return inferPos(t);
}

function inferLevel(word = '') {
  const w = String(word || '').toLowerCase();
  if (w.length >= 11) return 'C1';
  if (w.length >= 8) return 'B2';
  if (/(tion|sion|ology|ivity|ality|ously|ively)$/.test(w)) return 'C1';
  if (/(ment|ness|able|ible|ical|ative|ance|ence)$/.test(w)) return 'B2';
  return 'B1';
}

function hasAcademicShape(word = '') {
  const w = String(word || '').toLowerCase();
  return ACADEMIC_SUFFIXES.some((suffix) => w.endsWith(suffix));
}

function tokenize(rawText = '') {
  const text = String(rawText || '').toLowerCase();
  const tokens = text.match(/[a-z][a-z-]{2,}/g) || [];
  return tokens
    .map((token) => token.replace(/^-+|-+$/g, ''))
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rankWord({ word = '', frequency = 1, entry = null, level = 'B2' } = {}) {
  let score = 42;
  const reasons = [];

  if (entry) {
    score += 22;
    reasons.push('dictionary matched');
  }
  if (frequency > 1) {
    score += Math.min(16, (frequency - 1) * 4);
    reasons.push(`repeated ${frequency}x in image`);
  }
  if (hasAcademicShape(word)) {
    score += 12;
    reasons.push('academic suffix detected');
  }
  if (word.length >= 9) {
    score += 8;
    reasons.push('advanced word length');
  }
  if (['C1', 'C2'].includes(level)) {
    score += 7;
    reasons.push('higher CEFR level');
  }

  return {
    confidence: clamp(Math.round(score), 35, 99),
    reasons,
  };
}

export function extractPhotoVocabDemo(rawText = '', options = {}) {
  const minLevel = normalizeLevel(options.minLevel || 'B1');
  const limit = clamp(Number(options.limit || 12) || 12, 5, 40);
  const tokens = tokenize(rawText);
  const frequency = new Map();
  tokens.forEach((token) => {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  });

  const words = Array.from(frequency.entries())
    .map(([word, count]) => {
      let entry = null;
      try {
        entry = getWordEntry(word);
      } catch (_) {
        entry = null;
      }
      const level = normalizeLevel(entry?.level || inferLevel(word));
      if (!levelAtLeast(level, minLevel)) return null;
      const pos = normalizePos(entry?.word_type || '');
      const scored = rankWord({ word, frequency: count, entry, level });
      return {
        word,
        level,
        pos,
        confidence: scored.confidence,
        reasons: scored.reasons,
        frequency: count,
        definition: entry?.simple_definition || `Likely ${level} ${pos} candidate extracted from scanned text.`,
        synonyms: Array.isArray(entry?.synonyms) ? entry.synonyms.slice(0, 3) : [],
        collocations: Array.isArray(entry?.collocations) ? entry.collocations.slice(0, 2) : [],
        example: Array.isArray(entry?.examples) && entry.examples.length ? entry.examples[0] : '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      return a.word.localeCompare(b.word);
    })
    .slice(0, limit);

  return {
    source: 'local-photo-ocr',
    meta: {
      tokenCount: tokens.length,
      uniqueCount: frequency.size,
      keptCount: words.length,
      minLevel,
      limit,
    },
    words,
  };
}

