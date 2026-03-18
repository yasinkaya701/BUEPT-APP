import { getWordEntry, getDictionarySample } from './dictionary';
import repetitionRules from '../../data/repetition_rules.json';

function normalizeWord(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z'-]/g, '')
    .trim();
}

function wordRoot(value = '') {
  const w = normalizeWord(value);
  if (!w) return '';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  return w;
}

function uniqueTerms(values = [], limit = 12, blocked = new Set()) {
  const out = [];
  const seen = new Set();
  values.forEach((item) => {
    const term = normalizeWord(item);
    if (!term || blocked.has(term) || seen.has(term)) return;
    seen.add(term);
    out.push(term);
  });
  return out.slice(0, limit);
}

export function lookupSynonymsForWord(word, limit = 10) {
  const normalized = normalizeWord(word);
  if (!normalized) return [];
  const blocked = new Set([normalized]);
  const direct = getWordEntry(normalized);
  const directList = uniqueTerms(direct?.synonyms || [], limit, blocked);
  if (directList.length >= Math.min(4, limit)) return directList.slice(0, limit);

  const root = wordRoot(normalized);
  const prefix = root.slice(0, Math.min(4, root.length));
  const pool = getDictionarySample(1500);
  const candidates = [];
  pool.forEach((entry) => {
    const itemWord = normalizeWord(entry?.word);
    if (!itemWord || blocked.has(itemWord)) return;
    const itemRoot = wordRoot(itemWord);
    const rootClose =
      (root && itemRoot && (itemRoot.startsWith(root) || root.startsWith(itemRoot))) ||
      (prefix && itemWord.startsWith(prefix));
    const synonymHit = (entry?.synonyms || []).some((syn) => normalizeWord(syn) === normalized);
    if (!rootClose && !synonymHit) return;
    candidates.push(itemWord);
    (entry?.synonyms || []).forEach((syn) => candidates.push(syn));
  });

  const merged = uniqueTerms([...directList, ...candidates], limit, blocked);
  return merged.slice(0, limit);
}

export function suggestSynonyms(text) {
  const safe = String(text || '');
  const single = safe.trim().split(/\s+/).length === 1;
  if (single) {
    const oneWord = normalizeWord(safe);
    if (oneWord) {
      return [{ word: oneWord, count: 1, synonyms: lookupSynonymsForWord(oneWord, 10) }];
    }
  }

  const stop = new Set(repetitionRules.stopwords || []);
  const tokens = (safe.toLowerCase().match(/[A-Za-z][A-Za-z'-]*/g) || []).filter((t) => !stop.has(t));
  const counts = {};
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
  const repeated = Object.entries(counts)
    .filter(([, c]) => c >= (repetitionRules.min_count || 3))
    .sort((a, b) => b[1] - a[1]);

  return repeated.map(([word, count]) => {
    const entry = getWordEntry(word);
    const synonyms = entry?.synonyms?.slice(0, 4) || lookupSynonymsForWord(word, 4);
    return {
      word,
      count,
      synonyms
    };
  });
}
