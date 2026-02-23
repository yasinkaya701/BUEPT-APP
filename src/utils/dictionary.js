import dict from '../../data/dictionary_subset.json';
import overrides from '../../data/synonym_overrides.json';

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done', 'that', 'this', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their'
]);

function getOverrideList(word) {
  if (!word || !overrides || typeof overrides !== 'object') return [];
  if (!Object.prototype.hasOwnProperty.call(overrides, word)) return [];
  const value = overrides[word];
  return Array.isArray(value) ? value : [];
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'string') return [value];
  return [];
}

function cleanList(values = [], limit = 20) {
  if (!Array.isArray(values)) return [];
  const out = [];
  const seen = new Set();
  values.forEach((v) => {
    const s = String(v || '').trim().toLowerCase();
    if (!s || s.length <= 1) return;
    if (seen.has(s)) return;
    seen.add(s);
    out.push(String(v).trim());
  });
  return out.slice(0, limit);
}

function normalizeEntry(raw = {}) {
  const word = String(raw.word || '').toLowerCase().trim();
  const examples = cleanList(raw.examples, 8);
  const simpleDefinition = String(raw.simple_definition || '').trim();
  const generatedExample = simpleDefinition
    ? `In class, we discussed how "${word}" relates to the topic.`
    : '';
  return {
    ...raw,
    word,
    word_type: String(raw.word_type || raw.type || '').trim(),
    simple_definition: simpleDefinition,
    synonyms: cleanList(raw.synonyms, 20),
    antonyms: cleanList(raw.antonyms, 20),
    collocations: cleanList(raw.collocations, 20),
    derivatives: cleanList(raw.derivatives, 20),
    examples: examples.length ? examples : (generatedExample ? [generatedExample] : []),
  };
}

const dictionaryItems = Array.isArray(dict) ? dict : [];

const filtered = dictionaryItems
  .map(normalizeEntry)
  .filter((item) => {
    if (!item.word) return false;
    if (item.word.length <= 2) return false;
    if (STOP.has(item.word)) return false;
    if (!item.simple_definition) return false;
    return true;
  });

const map = new Map();
for (const item of filtered) {
  const merged = {
    ...item,
    synonyms: cleanList([...asList(item.synonyms), ...asList(getOverrideList(item.word))], 20),
  };
  map.set(item.word, merged);
}

export function getWordEntry(word) {
  const base = String(word || '').toLowerCase().trim();
  if (!base) return null;
  const direct = map.get(base);
  if (direct) return direct;
  const variants = [
    base.replace(/ies$/, 'y'),
    base.replace(/es$/, ''),
    base.replace(/s$/, ''),
    base.replace(/ing$/, ''),
    base.replace(/ed$/, ''),
  ].filter((v) => v && v !== base);
  for (const v of variants) {
    const hit = map.get(v);
    if (hit) return hit;
  }
  return null;
}

export function getDictionarySample(limit = 50) {
  return filtered.slice(0, limit);
}

export function getDictionaryCount() {
  return filtered.length;
}

export function getEntriesWithExamples(limit = 200) {
  return filtered.filter((w) => w.examples && w.examples.length > 0).slice(0, limit);
}

export function getEntriesWithSynonyms(limit = 200) {
  return filtered.filter((w) => w.synonyms && w.synonyms.length > 0).slice(0, limit);
}
