import { getWordEntry } from './dictionary';

function replaceWithSynonyms(sentence, level = 'standard') {
  const words = sentence.split(/\b/);
  return words.map((w) => {
    const clean = w.toLowerCase();
    if (!/^[a-zA-Z-']+$/.test(clean)) return w;
    const entry = getWordEntry(clean);
    if (entry && entry.synonyms && entry.synonyms.length) {
      const idx = level === 'advanced' ? Math.min(2, entry.synonyms.length - 1) : 0;
      const syn = entry.synonyms[idx];
      if (syn && syn.length <= 16) return matchCase(w, syn);
    }
    return w;
  }).join('');
}

function matchCase(original, replacement) {
  if (original[0] && original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function rewriteParagraphLocal(text, mode = 'standard') {
  if (!text) return '';
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (!sentences.length) return text;
  const revised = sentences.map((s, i) => {
    let out = s.trim();
    if (i === 0 && !out.toLowerCase().startsWith('in this')) {
      out = `In this paragraph, ${out[0].toLowerCase()}${out.slice(1)}`;
    }
    const level = mode === 'advanced' ? 'advanced' : 'standard';
    out = replaceWithSynonyms(out, level);
    if (mode === 'connectors') {
      if (i === 1) out = `Moreover, ${out[0].toLowerCase()}${out.slice(1)}`;
      if (i === 2) out = `However, ${out[0].toLowerCase()}${out.slice(1)}`;
    }
    return out;
  });
  return revised.join(' ');
}
