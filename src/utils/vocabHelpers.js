/**
 * vocabHelpers.js
 * Shared utility functions extracted from VocabScreen.js.
 * Moving these reduces VocabScreen from ~163KB to a manageable size
 * and makes the logic reusable across vocab-related screens.
 */

import { buildFallbackEntry, getDictionaryCount, getDictionarySample, getDictionarySlice, getVerbForms, getWordEntry, getWordFamily } from './dictionary';
import { speakEnglish } from './ttsEnglish';

// ── String Helpers ────────────────────────────────────────────────────────────

export function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function seededIndex(seed, length) {
  if (!length) return 0;
  return Math.abs((seed * 9301 + 49297) % 233280) % length;
}

export function seededShuffle(list = [], seed = 1) {
  const out = Array.isArray(list) ? [...list] : [];
  if (out.length < 2) return out;
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = seededIndex(seed + i * 17, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function formatTopicLabel(topic = '') {
  const raw = String(topic || '').trim();
  if (!raw) return 'Unknown';
  if (raw.toLowerCase() === 'all') return 'All';
  return raw
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function normalizeWordKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

export function getLevelWeight(level = '') {
  return {
    A1: 1, A2: 2, B1: 3, B2: 4, C1: 5,
  }[String(level || '').toUpperCase()] || 0;
}

export function normalizeSentence(text = '') {
  const compact = String(text || '').trim().replace(/\s+/g, ' ');
  if (!compact) return '';
  const withPunc = /[.!?]$/.test(compact) ? compact : `${compact}.`;
  return withPunc.charAt(0).toUpperCase() + withPunc.slice(1);
}

export function hasConnector(text = '') {
  return /\b(however|therefore|for example|for instance|moreover|in addition|as a result)\b/i.test(String(text || ''));
}

// ── Dictionary Safe Wrappers ──────────────────────────────────────────────────

export function safeDictionaryCount() {
  try { return Number(getDictionaryCount() || 0); } catch (_) { return 0; }
}

export function safeDictionarySample(limit = 50) {
  try {
    const list = getDictionarySample(limit);
    return Array.isArray(list) ? list : [];
  } catch (_) { return []; }
}

export function safeDictionarySlice(limit = 50) {
  try {
    const list = getDictionarySlice(limit);
    return Array.isArray(list) ? list : [];
  } catch (_) { return []; }
}

export function safeWordEntry(word) {
  try { return getWordEntry(word); } catch (_) { return null; }
}

export function safeWordFamily(word, fallbackEntry = null) {
  try {
    const family = getWordFamily(word, fallbackEntry);
    if (family && typeof family === 'object') return family;
  } catch (_) { }
  return { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };
}

export function safeVerbForms(word, fallbackEntry = null) {
  try {
    const forms = getVerbForms(word, fallbackEntry);
    if (forms && typeof forms === 'object') return forms;
  } catch (_) { }
  return null;
}

// ── Vocab List Normalizers ────────────────────────────────────────────────────

export function normalizeAcademicVerbList(list = []) {
  const source = Array.isArray(list) ? list : [];
  const byWord = new Map();
  source.forEach((item) => {
    const rawWord = String(item?.word || '').trim();
    const key = rawWord.toLowerCase();
    if (!key) return;
    const prev = byWord.get(key);
    if (!prev) {
      byWord.set(key, { ...item, word: rawWord });
      return;
    }
    byWord.set(key, {
      ...prev,
      definition: prev.definition || item.definition || '',
      example: prev.example || item.example || '',
    });
  });
  return Array.from(byWord.values());
}

// ── Challenge Builder ─────────────────────────────────────────────────────────

export function buildVocabChallenge(pool = [], seed = 1) {
  if (!Array.isArray(pool) || pool.length < 4) return null;
  const source = pool
    .filter((item) => item.word && item.def)
    .map((item) => ({ word: String(item.word).trim(), def: String(item.def).trim() }))
    .filter((item) => item.word && item.def);
  if (source.length < 4) return null;
  const uniqueByWord = new Map();
  source.forEach((item) => {
    if (!uniqueByWord.has(item.word.toLowerCase())) uniqueByWord.set(item.word.toLowerCase(), item);
  });
  const words = Array.from(uniqueByWord.values());
  if (words.length < 4) return null;
  const target = words[seededIndex(seed, words.length)];
  const distractorDefs = Array.from(
    new Set(
      words
        .filter((item) => item.word.toLowerCase() !== target.word.toLowerCase())
        .map((item) => item.def)
        .filter((def) => def && def !== target.def)
    )
  );
  if (distractorDefs.length < 3) return null;
  const wrong = seededShuffle(distractorDefs, seed + 11).slice(0, 3);
  const options = seededShuffle([target.def, ...wrong], seed + 97);
  const correctIndex = options.findIndex((o) => o === target.def);
  if (correctIndex < 0) return null;
  return { word: target.word, options, correctIndex };
}

// ── Sentence Builders ─────────────────────────────────────────────────────────

export function buildSentenceStarters(targetWord, entry = null) {
  const safeWord = String(targetWord || '').trim();
  if (!safeWord) return [];
  const topic = String(entry?.simple_definition || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');
  return [
    `In my essay, ${safeWord} helps explain `,
    `A practical example of ${safeWord} is `,
    `In BUEPT reading, ${safeWord} is used when `,
    topic ? `${safeWord} is strongly linked to ${topic} because ` : `I can define ${safeWord} as `,
  ];
}

export function buildVerbDrillSentence(sentence = '', targetWord = '', definition = '') {
  const base = normalizeSentence(sentence);
  const safeWord = String(targetWord || '').trim().toLowerCase();
  if (!base || !safeWord) return '';
  let out = base;
  const hasWord = new RegExp(`\\b${escapeRegExp(safeWord)}\\b`, 'i').test(out);
  if (!hasWord) {
    out = normalizeSentence(`Researchers ${safeWord} the evidence to clarify ${definition || 'the claim'}`);
  }
  if (!hasConnector(out)) {
    out = out.replace(/[.!?]$/, ', which strengthens the academic argument.');
  }
  return normalizeSentence(out);
}

export function buildSentenceUpgrade(sentence = '', targetWord = '', entry = null) {
  const base = normalizeSentence(sentence);
  const safeWord = String(targetWord || '').trim().toLowerCase();
  if (!base || !safeWord) return '';
  let out = base;
  const hasWord = new RegExp(`\\b${escapeRegExp(safeWord)}\\b`, 'i').test(out);
  if (!hasWord) {
    out = normalizeSentence(`In academic writing, ${safeWord} is important because ${out.toLowerCase()}`);
  }
  if (!hasConnector(out)) {
    out = out.replace(/[.!?]$/, ', for example in a BUEPT response.');
  }
  const wordCount = out.split(/\s+/).filter(Boolean).length;
  if (wordCount < 13) {
    const topic = String(entry?.simple_definition || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .join(' ');
    out = out.replace(/[.!?]$/, `, which helps explain ${topic || 'the main idea'} more clearly.`);
  }
  return normalizeSentence(out);
}

// ── TTS ───────────────────────────────────────────────────────────────────────

export async function speakWord(word) {
  try {
    await speakEnglish(word, { rate: 0.48 });
  } catch (_) { }
}

// ── Safe Entry Builder ────────────────────────────────────────────────────────

export { buildFallbackEntry };
