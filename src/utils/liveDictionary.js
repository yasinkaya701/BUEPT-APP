const LIVE_CACHE = new Map();
const GENERIC_NOISE = new Set([
  'thing', 'things', 'stuff', 'person', 'people', 'someone', 'something', 'object',
  'matter', 'issue', 'item', 'part',
]);

function normalizeToken(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z\-']/g, '').trim();
}

function uniqueList(list = []) {
  const out = [];
  list.forEach((item) => {
    const v = String(item || '').trim();
    if (!v) return;
    if (!out.includes(v)) out.push(v);
  });
  return out;
}

function looksLikeLexicalTerm(value = '') {
  const token = String(value || '').trim().toLowerCase();
  if (!token) return false;
  if (!/^[a-z][a-z -]*[a-z]$/.test(token)) return false;
  const parts = token.split(' ').filter(Boolean);
  if (!parts.length || parts.length > 3) return false;
  if (parts.some((p) => p.length < 2)) return false;
  return true;
}

function cleanLexicalList(list = [], headword = '', limit = 10) {
  const head = normalizeToken(headword);
  return uniqueList(list)
    .map((item) => String(item || '').trim().toLowerCase())
    .filter((item) => looksLikeLexicalTerm(item))
    .filter((item) => item !== head)
    .filter((item) => !GENERIC_NOISE.has(item))
    .slice(0, limit);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Request failed (${res.status})`);
  }
  return res.json();
}

async function fetchSynonymsDatamuse(word) {
  const data = await fetchJson(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=12`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => item?.word).filter(Boolean);
}

async function fetchAntonymsDatamuse(word) {
  const data = await fetchJson(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=12`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => item?.word).filter(Boolean);
}

function mapPos(pos = '') {
  const t = String(pos || '').toLowerCase();
  if (t.startsWith('n')) return 'noun';
  if (t.startsWith('v')) return 'verb';
  if (t.startsWith('adj')) return 'adjective';
  if (t.startsWith('adv')) return 'adverb';
  return '';
}

async function fetchDatamuseDefinition(word) {
  const data = await fetchJson(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`);
  if (!Array.isArray(data) || !data.length) return null;
  const item = data[0];
  const defs = Array.isArray(item?.defs) ? item.defs : [];
  if (!defs.length) return null;
  const raw = defs[0];
  const parts = String(raw).split('\t');
  const pos = mapPos(parts[0] || '');
  const def = parts[1] || '';
  return { def, pos };
}

export async function fetchLiveEntry(rawWord = '') {
  const word = normalizeToken(rawWord);
  if (!word) return null;
  if (LIVE_CACHE.has(word)) return LIVE_CACHE.get(word);

  let definition = '';
  let example = '';
  let pos = '';
  let synonyms = [];
  let antonyms = [];

  try {
    const dm = await fetchDatamuseDefinition(word);
    if (dm?.def) {
      definition = dm.def;
      pos = dm.pos || '';
    }
  } catch (_) {
    // ignore
  }

  if (!definition) {
    try {
      const data = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const entry = Array.isArray(data) ? data[0] : null;
      if (entry) {
        const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
        for (const meaning of meanings) {
          const defs = Array.isArray(meaning.definitions) ? meaning.definitions : [];
          if (!pos && meaning.partOfSpeech) pos = meaning.partOfSpeech;
          if (!definition && defs.length) {
            const picked = defs.find((d) => d && d.definition) || defs[0];
            definition = picked?.definition || '';
            example = picked?.example || '';
            synonyms = synonyms.concat(picked?.synonyms || []);
            antonyms = antonyms.concat(picked?.antonyms || []);
          }
          synonyms = synonyms.concat(meaning.synonyms || []);
          antonyms = antonyms.concat(meaning.antonyms || []);
          if (definition) break;
        }
      }
    } catch (_) {
      // ignore
    }
  }

  if (!synonyms.length) {
    try {
      synonyms = await fetchSynonymsDatamuse(word);
    } catch (_) {
      // ignore
    }
  }

  if (!antonyms.length) {
    try {
      antonyms = await fetchAntonymsDatamuse(word);
    } catch (_) {
      // ignore
    }
  }

  const result = {
    word,
    word_type: pos || 'general',
    simple_definition: definition ? definition.trim() : 'Definition not available.',
    synonyms: cleanLexicalList(synonyms, word, 10),
    antonyms: cleanLexicalList(antonyms, word, 8),
    collocations: [],
    derivatives: [],
    examples: example ? [example] : [],
    source: 'live',
  };

  LIVE_CACHE.set(word, result);
  return result;
}

export function clearLiveDictionaryCache() {
  LIVE_CACHE.clear();
}
