import { getWordEntry } from './dictionary';
import repetitionRules from '../../data/repetition_rules.json';

export function suggestSynonyms(text) {
  const stop = new Set(repetitionRules.stopwords || []);
  const tokens = (text.toLowerCase().match(/[A-Za-z][A-Za-z'-]*/g) || []).filter(t => !stop.has(t));
  const counts = {};
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
  const repeated = Object.entries(counts)
    .filter(([, c]) => c >= (repetitionRules.min_count || 3))
    .sort((a, b) => b[1] - a[1]);

  return repeated.map(([word, count]) => {
    const entry = getWordEntry(word);
    return {
      word,
      count,
      synonyms: entry?.synonyms?.slice(0, 4) || []
    };
  });
}
