let dict = null;
let overrides = null;
let antonymOverrides = null;
let antonymLookup = null;
let academicWords = null;
let academicVerbs = null;
let departmentVocab = null;
let testEnglishVocab = null;
let wascVocabulary = null;
let curatedWordData = null;

function loadOverrides() {
  if (!overrides) {
    overrides = require('../../data/synonym_overrides.json');
  }
  return overrides;
}

function loadAcademicWords() {
  if (!academicWords) {
    academicWords = require('../../data/academic_wordlist.json');
  }
  return academicWords;
}

function loadAntonymOverrides() {
  if (!antonymOverrides) {
    antonymOverrides = require('../../data/antonym_overrides.json');
  }
  return antonymOverrides;
}

function loadAcademicVerbs() {
  if (!academicVerbs) {
    academicVerbs = require('../../data/academic_verbs.json');
  }
  return academicVerbs;
}

function loadDepartmentVocab() {
  if (!departmentVocab) {
    departmentVocab = require('../../data/bogazici_department_vocab.json');
  }
  return departmentVocab;
}

function loadTestEnglishVocab() {
  if (!testEnglishVocab) {
    testEnglishVocab = require('../../data/test_english_vocab_items.json');
  }
  return testEnglishVocab;
}

function loadWascVocabulary() {
  if (!wascVocabulary) {
    const payload = require('../../data/wasc_vocab_lists.json');
    wascVocabulary = Array.isArray(payload?.lists) ? payload.lists : [];
  }
  return wascVocabulary;
}

function loadCuratedWordData() {
  if (!curatedWordData) {
    try {
      curatedWordData = require('../../data/curated_word_data.json');
    } catch (_) {
      curatedWordData = {};
    }
  }
  return curatedWordData || {};
}

function loadDictionaryCore() {
  if (!dict) {
    dict = require('../../data/dictionary_core.json');
  }
  return dict;
}

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done', 'that', 'this', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their'
]);

// Common function words frequently mapped to wrong WordNet senses.
const BLOCKED_HEADWORDS = new Set([
  ...Array.from(STOP),
  'can', 'could', 'may', 'might', 'will', 'would', 'shall', 'should', 'must',
  'not', 'who', 'whom', 'which', 'what', 'when', 'where', 'why', 'how',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'here', 'there', 'then', 'than', 'also', 'just', 'only', 'very', 'even', 'more', 'most',
  'get', 'got', 'make', 'made', 'take', 'took', 'give', 'gave', 'have', 'has', 'had', 'know', 'see',
  'like', 'look', 'work', 'time', 'day', 'year', 'way', 'good', 'bad', 'new', 'old', 'right', 'left',
  'out', 'over', 'under', 'into', 'onto', 'about', 'after', 'before', 'during', 'through',
  'all', 'any', 'some', 'many', 'few', 'much', 'other',
]);

const BANNED_TERMS = new Set([
  'arse', 'ass', 'bathroom', 'bum', 'buns', 'butt', 'buttocks', 'commode', 'crapper', 'derriere', 'fanny',
  'fuck', 'sex', 'intercourse', 'bonk', 'hump', 'laid', 'do it', 'have sex', 'eff', 'ca ca', 'crap', 'bugger off'
]);

const GENERIC_NOISE_TERMS = new Set([
  'thing', 'things', 'stuff', 'someone', 'somebody', 'person', 'people', 'part', 'parts',
  'kind', 'kinds', 'type', 'types', 'way', 'ways', 'point', 'points', 'idea', 'ideas',
  'matter', 'matters', 'issue', 'issues', 'item', 'items', 'object', 'objects', 'factor', 'factors',
]);

const NOISY_DEFINITION_PATTERNS = [
  /united states/i,
  /english statesman/i,
  /writer best known/i,
  /month following/i,
  /baseball/i,
  /cricket/i,
  /southern regional/i,
  /un agency/i,
  /beheaded/i,
  /dialectal variant/i,
  /honours degree/i,
];

const ARCHAIC_NOISE_TERMS = new Set([
  'secern', 'secernate', 'severalise', 'severalize', 'speciate', 'tell_apart',
  'indifferentiate', 'dedifferentiate', 'commonize', 'commonise',
  'vesica', 'efflorescence', 'heyday', 'particularisation', 'particularization'
]);

const ACADEMIC_SCENES = [
  'in the reading section',
  'during a timed writing task',
  'while summarizing a lecture',
  'in the discussion paragraph',
  'during peer-feedback review',
  'in a response to a BUEPT prompt',
];

const PURPOSES = [
  'to clarify the main claim',
  'to support the argument with evidence',
  'to improve coherence between sentences',
  'to present a precise academic point',
  'to avoid vague wording in formal writing',
  'to strengthen the thesis statement',
];

const NEGATIVE_PREFIXES = ['un', 'in', 'im', 'ir', 'il', 'non', 'dis', 'mis', 'anti', 'de'];
const NEGATIVE_ASSIMILATED_PREFIXES = new Set(['in', 'im', 'ir', 'il']);
const LY_ADJECTIVE_EXCEPTIONS = new Set([
  'friendly', 'unfriendly', 'likely', 'unlikely', 'lively', 'lovely', 'lonely', 'elderly',
  'daily', 'weekly', 'monthly', 'yearly', 'early', 'silly', 'ugly', 'costly', 'holy', 'timely',
]);
const CURATED_SOURCES = new Set([
  'wasc-glossary',
  'test-english',
  'department',
  'academic-list',
  'academic-verb',
  'live',
]);

const IRREGULAR_VERB_FORMS = {
  be: { v2: 'was/were', v3: 'been' },
  become: { v2: 'became', v3: 'become' },
  begin: { v2: 'began', v3: 'begun' },
  break: { v2: 'broke', v3: 'broken' },
  bring: { v2: 'brought', v3: 'brought' },
  build: { v2: 'built', v3: 'built' },
  buy: { v2: 'bought', v3: 'bought' },
  catch: { v2: 'caught', v3: 'caught' },
  choose: { v2: 'chose', v3: 'chosen' },
  come: { v2: 'came', v3: 'come' },
  cost: { v2: 'cost', v3: 'cost' },
  cut: { v2: 'cut', v3: 'cut' },
  do: { v2: 'did', v3: 'done' },
  draw: { v2: 'drew', v3: 'drawn' },
  drink: { v2: 'drank', v3: 'drunk' },
  drive: { v2: 'drove', v3: 'driven' },
  eat: { v2: 'ate', v3: 'eaten' },
  fall: { v2: 'fell', v3: 'fallen' },
  feel: { v2: 'felt', v3: 'felt' },
  fight: { v2: 'fought', v3: 'fought' },
  find: { v2: 'found', v3: 'found' },
  fly: { v2: 'flew', v3: 'flown' },
  forget: { v2: 'forgot', v3: 'forgotten' },
  forgive: { v2: 'forgave', v3: 'forgiven' },
  get: { v2: 'got', v3: 'got/gotten' },
  give: { v2: 'gave', v3: 'given' },
  go: { v2: 'went', v3: 'gone' },
  grow: { v2: 'grew', v3: 'grown' },
  have: { v2: 'had', v3: 'had' },
  hear: { v2: 'heard', v3: 'heard' },
  hold: { v2: 'held', v3: 'held' },
  keep: { v2: 'kept', v3: 'kept' },
  know: { v2: 'knew', v3: 'known' },
  lead: { v2: 'led', v3: 'led' },
  leave: { v2: 'left', v3: 'left' },
  lend: { v2: 'lent', v3: 'lent' },
  let: { v2: 'let', v3: 'let' },
  lose: { v2: 'lost', v3: 'lost' },
  make: { v2: 'made', v3: 'made' },
  mean: { v2: 'meant', v3: 'meant' },
  meet: { v2: 'met', v3: 'met' },
  pay: { v2: 'paid', v3: 'paid' },
  put: { v2: 'put', v3: 'put' },
  read: { v2: 'read', v3: 'read' },
  ride: { v2: 'rode', v3: 'ridden' },
  ring: { v2: 'rang', v3: 'rung' },
  rise: { v2: 'rose', v3: 'risen' },
  run: { v2: 'ran', v3: 'run' },
  say: { v2: 'said', v3: 'said' },
  see: { v2: 'saw', v3: 'seen' },
  sell: { v2: 'sold', v3: 'sold' },
  send: { v2: 'sent', v3: 'sent' },
  set: { v2: 'set', v3: 'set' },
  shake: { v2: 'shook', v3: 'shaken' },
  shine: { v2: 'shone', v3: 'shone' },
  shoot: { v2: 'shot', v3: 'shot' },
  show: { v2: 'showed', v3: 'shown' },
  shut: { v2: 'shut', v3: 'shut' },
  sing: { v2: 'sang', v3: 'sung' },
  sit: { v2: 'sat', v3: 'sat' },
  sleep: { v2: 'slept', v3: 'slept' },
  speak: { v2: 'spoke', v3: 'spoken' },
  spend: { v2: 'spent', v3: 'spent' },
  stand: { v2: 'stood', v3: 'stood' },
  steal: { v2: 'stole', v3: 'stolen' },
  swim: { v2: 'swam', v3: 'swum' },
  take: { v2: 'took', v3: 'taken' },
  teach: { v2: 'taught', v3: 'taught' },
  tell: { v2: 'told', v3: 'told' },
  think: { v2: 'thought', v3: 'thought' },
  throw: { v2: 'threw', v3: 'thrown' },
  understand: { v2: 'understood', v3: 'understood' },
  wake: { v2: 'woke', v3: 'woken' },
  wear: { v2: 'wore', v3: 'worn' },
  win: { v2: 'won', v3: 'won' },
  write: { v2: 'wrote', v3: 'written' },
};

function asList(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'string') return [value];
  return [];
}

function normalizeToken(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureAntonymLookup() {
  if (antonymLookup) return antonymLookup;
  const raw = loadAntonymOverrides();
  const table = new Map();
  if (!raw || typeof raw !== 'object') {
    antonymLookup = table;
    return antonymLookup;
  }
  Object.entries(raw).forEach(([word, values]) => {
    const head = normalizeToken(word);
    if (!head) return;
    const list = asList(values).map((item) => normalizeToken(item)).filter(Boolean);
    if (!table.has(head)) table.set(head, new Set());
    list.forEach((item) => table.get(head).add(item));
    list.forEach((item) => {
      if (!table.has(item)) table.set(item, new Set());
      table.get(item).add(head);
    });
  });
  antonymLookup = table;
  return antonymLookup;
}

function sentenceCase(text = '') {
  const s = String(text || '').trim().replace(/\s+/g, ' ');
  if (!s) return '';
  const withPunc = /[.!?]$/.test(s) ? s : `${s}.`;
  return withPunc.charAt(0).toUpperCase() + withPunc.slice(1);
}

function looksLikeTerm(value = '', maxWords = 3) {
  if (!value) return false;
  if (!/^[a-z][a-z -]*[a-z]$/.test(value)) return false;
  const tokens = value.split(' ').filter(Boolean);
  if (!tokens.length || tokens.length > maxWords) return false;
  if (tokens.some((t) => t.length < 2)) return false;
  return true;
}

function stemToken(value = '') {
  let out = normalizeToken(value).replace(/[^a-z]/g, '');
  if (!out) return '';
  if (out.length > 5 && out.endsWith('ing')) out = out.slice(0, -3);
  else if (out.length > 4 && out.endsWith('ed')) out = out.slice(0, -2);
  else if (out.length > 4 && out.endsWith('es')) out = out.slice(0, -2);
  else if (out.length > 3 && out.endsWith('s')) out = out.slice(0, -1);
  if (out.length > 5 && out.endsWith('ly')) out = out.slice(0, -2);
  return out;
}

function isMorphVariant(headword = '', candidate = '') {
  const head = stemToken(headword);
  const cand = stemToken(candidate);
  if (!head || !cand) return false;
  if (head === cand) return true;
  if (cand.startsWith(head) && cand.length - head.length <= 3) return true;
  if (head.startsWith(cand) && head.length - cand.length <= 3) return true;
  return false;
}

function scoreLexicalTerm(term = '', headword = '') {
  const normalized = normalizeToken(term);
  const tokens = normalized.split(' ').filter(Boolean);
  let score = 0;
  if (tokens.length === 1) score += 5;
  else if (tokens.length === 2) score += 4;
  else if (tokens.length === 3) score += 2;
  else score += 1;
  const len = normalized.length;
  if (len >= 4 && len <= 12) score += 3;
  else if (len <= 20) score += 2;
  else score += 1;
  if (headword && tokens.length === 1 && !isMorphVariant(headword, normalized)) score += 1;
  if (!normalized.includes('-')) score += 0.5;

  // AWL Elevation
  const awl = loadAcademicWords();
  const isAWL = Array.isArray(awl) && awl.some(a => normalizeToken(a.word) === normalized);
  if (isAWL) score += 15; // Massive priority for Academic Word List

  return score;
}

function isBanned(value = '') {
  if (!value) return true;
  const normalized = normalizeToken(value);
  if (!normalized) return true;
  if (BANNED_TERMS.has(normalized)) return true;
  if (ARCHAIC_NOISE_TERMS.has(normalized)) return true;
  return Array.from(BANNED_TERMS).some((t) => normalized.includes(t));
}

function hasWholeWord(text = '', word = '') {
  const t = String(text || '').toLowerCase();
  const w = String(word || '').toLowerCase().trim();
  if (!t || !w) return false;
  return new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t);
}

function inferPos(wordType = '') {
  const t = String(wordType || '').toLowerCase();
  if (t.includes('verb')) return 'verb';
  if (t.includes('adjective')) return 'adjective';
  if (t.includes('adverb')) return 'adverb';
  if (t.includes('noun')) return 'noun';
  return 'generic';
}

function normalizeFamilyPos(value = '') {
  const t = String(value || '').toLowerCase();
  if (!t) return '';
  if (t.includes('noun')) return 'noun';
  if (t.includes('verb')) return 'verb';
  if (t.includes('adverb') || t.includes('adv')) return 'adverb';
  if (t.includes('adjective') || t.includes('adj')) return 'adjective';
  return '';
}

function guessFamilyPos(word = '', wordType = '') {
  const w = normalizeToken(word);
  if (!w) return '';

  // 1. Trust the data source's word_type FIRST — it's the most reliable signal
  const fromType = normalizeFamilyPos(wordType);
  if (fromType) return fromType;

  // 2. Also check if the word exists in the map and has a type
  const mapEntry = map.get(w);
  if (mapEntry) {
    const mapType = normalizeFamilyPos(mapEntry.word_type);
    if (mapType) return mapType;
  }

  // 3. Suffix heuristics as last resort (with minimum length guards)
  if (w.length >= 5 && /ly$/.test(w) && !LY_ADJECTIVE_EXCEPTIONS.has(w)) return 'adverb';
  if (w.length >= 6 && /(ously|ively|ably|ibly|fully|lessly)$/.test(w)) return 'adverb';
  if (w.length >= 6 && /(ous|ive|able|ible|ical|less|ful)$/.test(w)) return 'adjective';
  if (w.length >= 5 && /(ic|ent|ant|ary)$/.test(w)) return 'adjective';
  if (w.length >= 6 && /(tion|sion|ment|ness|ance|ence|ship)$/.test(w)) return 'noun';
  if (w.length >= 5 && /(ity|ism|ist)$/.test(w)) return 'noun';
  if (w.length >= 5 && /(ize|ise|ify|ate)$/.test(w)) return 'verb';

  return 'noun';
}

function commonPrefixLen(a = '', b = '') {
  const x = normalizeToken(a);
  const y = normalizeToken(b);
  const max = Math.min(x.length, y.length);
  let i = 0;
  while (i < max && x[i] === y[i]) i += 1;
  return i;
}

function minFamilyPrefix(word = '') {
  const len = String(word || '').length;
  if (len >= 8) return 5;
  if (len >= 6) return 4;
  return 3;
}

function familyRoot(word = '') {
  const w = normalizeToken(word).replace(/[^a-z]/g, '');
  if (!w) return '';
  if (w.length > 6 && w.endsWith('ysis')) return `${w.slice(0, -4)}y`;
  if (w.length > 5 && (w.endsWith('yze') || w.endsWith('yse'))) return `${w.slice(0, -3)}y`;
  const suffixes = [
    'ization', 'isation', 'ational', 'iveness', 'fulness', 'ousness', 'ability', 'ibility',
    'ically', 'ement', 'ment', 'ness', 'less', 'ship', 'tion', 'sion', 'ation', 'ition',
    'ance', 'ence', 'ality', 'ity', 'ism', 'ist', 'ical', 'able', 'ible',
    'ive', 'ous', 'ial', 'al', 'ic', 'ly', 'ing', 'ed', 'er', 'or',
  ];
  for (const suffix of suffixes) {
    if (w.length - suffix.length >= 3 && w.endsWith(suffix)) {
      return w.slice(0, -suffix.length);
    }
  }
  return w;
}

function splitNegativePrefix(word = '') {
  const w = normalizeToken(word).replace(/[^a-z]/g, '');
  if (!w) return null;
  for (const prefix of NEGATIVE_PREFIXES) {
    if (w.startsWith(prefix) && w.length - prefix.length >= 4) {
      return { prefix, stem: w.slice(prefix.length) };
    }
  }
  return null;
}

function isNegativeFamilyWord(candidate = '', headword = '') {
  const cand = normalizeToken(candidate);
  const head = normalizeToken(headword);
  if (!cand || !head || cand === head) return false;
  if (!map.has(cand)) return false;

  if (cand.endsWith('less') && head.endsWith('ful')) {
    return cand.slice(0, -4) === head.slice(0, -3);
  }
  if (cand.endsWith('ful') && head.endsWith('less')) {
    return cand.slice(0, -3) === head.slice(0, -4);
  }

  const split = splitNegativePrefix(cand);
  if (!split) return false;
  const { prefix, stem } = split;
  if (!stem || stem.length < 3) return false;

  const overrideHead = new Set(getAntonymOverrideList(head));
  const overrideCand = new Set(getAntonymOverrideList(cand));
  const trustedByOverride = overrideHead.has(cand) || overrideCand.has(head);
  const directMatch = stem === head;
  const stemEntryExists = map.has(stem);
  const headPos = guessFamilyPos(head, map.get(head)?.word_type || '');
  const candPos = guessFamilyPos(cand, map.get(cand)?.word_type || '');

  if (headPos && candPos && headPos !== candPos) return false;
  if (NEGATIVE_ASSIMILATED_PREFIXES.has(prefix) && headPos && headPos === 'verb') return false;
  if (!directMatch && !trustedByOverride && !stemEntryExists) return false;
  if (directMatch) return stemEntryExists || trustedByOverride;

  const strippedRoot = familyRoot(stem);
  const headRoot = familyRoot(head);
  const strongRoot = strippedRoot && headRoot && strippedRoot === headRoot && strippedRoot.length >= 4;
  const strongPrefix = commonPrefixLen(stem, head) >= (minFamilyPrefix(head) + 1);
  return trustedByOverride || (strongRoot && strongPrefix);
}

function isFamilyRelated(headword = '', candidate = '') {
  const head = normalizeToken(headword);
  const cand = normalizeToken(candidate);
  if (!head || !cand) return false;
  if (head === cand) return true;
  if (isNegativeFamilyWord(cand, head)) return true;
  const sharedPrefix = commonPrefixLen(head, cand);
  const minPrefix = minFamilyPrefix(head);
  const headStem = stemToken(head);
  const candStem = stemToken(cand);
  if (headStem && candStem && headStem === candStem) return true;
  const headRoot = familyRoot(head);
  const candRoot = familyRoot(cand);
  if (headRoot && candRoot && headRoot === candRoot && headRoot.length >= 4 && sharedPrefix >= (minPrefix + 1)) return true;
  if (isMorphVariant(head, cand)) return true;
  return false;
}

function rankFamilyWord(headword = '', candidate = '') {
  const head = normalizeToken(headword);
  const cand = normalizeToken(candidate);
  if (!head || !cand) return 0;
  if (head === cand) return 1000;
  let score = 0;
  score += commonPrefixLen(head, cand) * 10;
  if (stemToken(head) === stemToken(cand)) score += 28;
  if (familyRoot(head) && familyRoot(head) === familyRoot(cand)) score += 24;
  score -= Math.abs(head.length - cand.length) * 2;
  if (isNegativeFamilyWord(cand, head)) score -= 6;
  return score;
}

function normalizeLevel(level = '') {
  const raw = String(level || '').toUpperCase().trim();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(raw)) return raw;
  return 'B2';
}

function extractTopic(definition = '') {
  const tokens = String(definition || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && t.length > 2 && !STOP.has(t));
  if (!tokens.length) return 'the main argument';
  return tokens.slice(0, 3).join(' ');
}

function cleanTermList(
  values = [],
  limit = 20,
  { headword = '', maxWords = 3, requireHeadword = false, dropMorphVariants = false } = {}
) {
  const out = [];
  const seen = new Set();
  const word = normalizeToken(headword);
  asList(values).forEach((raw) => {
    const normalized = normalizeToken(raw);
    if (!normalized) return;
    if (!looksLikeTerm(normalized, maxWords)) return;
    if (isBanned(normalized)) return;
    if (!requireHeadword && GENERIC_NOISE_TERMS.has(normalized)) return;
    if (normalized === word) return;
    if (!requireHeadword && dropMorphVariants && word && normalized.split(' ').length === 1 && isMorphVariant(word, normalized)) return;
    if (requireHeadword && word && !hasWholeWord(normalized, word)) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    out.push(normalized);
  });
  return out
    .sort((a, b) => {
      const diff = scoreLexicalTerm(b, word) - scoreLexicalTerm(a, word);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    })
    .slice(0, limit);
}

function cleanSynonymsForEntry(entry = {}) {
  const headword = normalizeToken(entry?.word);
  if (!headword) return [];
  const overrideList = getOverrideList(headword);
  const overrideSet = new Set(overrideList);
  const antonymBlockSet = new Set([
    ...asList(entry?.antonyms).map((item) => normalizeToken(item)),
    ...getAntonymOverrideList(headword),
    ...generateMorphAntonymCandidates(headword),
  ]);
  const rawSynonyms = [...asList(entry?.synonyms), ...overrideList];
  const headPos = guessFamilyPos(headword, entry?.word_type || '');
  const posFiltered = rawSynonyms.filter((syn) => {
    const synNorm = normalizeToken(syn);
    if (!synNorm) return false;
    if (BLOCKED_HEADWORDS.has(synNorm)) return false;
    const synEntry = map.get(synNorm);
    if (!synEntry && !overrideSet.has(synNorm)) return false;
    const synPos = guessFamilyPos(synNorm, synEntry?.word_type || entry?.word_type || '');
    if (headPos && synPos && headPos !== synPos) return false;
    return true;
  });
  const source = posFiltered.length >= 2 ? posFiltered : rawSynonyms;
  const safe = cleanTermList(source, 16, {
    headword,
    maxWords: 3,
    dropMorphVariants: true,
  });
  const qualityFiltered = safe.filter((term) => {
    const normalized = normalizeToken(term);
    if (!normalized || normalized === headword) return false;
    if (antonymBlockSet.has(normalized)) return false;
    if (isNegativeFamilyWord(normalized, headword)) return false;
    if (GENERIC_NOISE_TERMS.has(normalized)) return false;
    if (isMorphVariant(headword, normalized)) return false;
    if (overrideSet.has(normalized)) return true;
    if (normalized.includes(' ')) return normalized.split(' ').length <= 2;
    const hit = map.get(normalized);
    if (!hit) return false;
    const reciprocal = hasReciprocalSynonymLink(headword, normalized);
    const curatedTrust = isCuratedLexicalEntry(entry) || isCuratedLexicalEntry(hit);
    if (!reciprocal && !curatedTrust) return false;
    const defOk = !!sanitizeDefinition(hit.simple_definition || hit.definition || '');
    if (!defOk) return false;
    const hitPos = guessFamilyPos(normalized, hit.word_type || '');
    if (headPos && hitPos && headPos !== hitPos) return false;
    return normalized.length >= 3 && normalized.length <= 18;
  });
  return qualityFiltered.slice(0, 12);
}

function cleanAntonymsForEntry(entry = {}) {
  const headword = normalizeToken(entry?.word);
  if (!headword) return [];
  const provided = cleanTermList(asList(entry?.antonyms), 16, {
    headword,
    maxWords: 3,
    dropMorphVariants: false,
  });
  const override = getAntonymOverrideList(headword);
  const providedSet = new Set(provided);
  const overrideSet = new Set(override);
  const headPos = guessFamilyPos(headword, entry?.word_type || '');
  const raw = [...provided, ...override];
  const safe = cleanTermList(raw, 16, {
    headword,
    maxWords: 3,
    dropMorphVariants: false,
  });
  const filtered = safe.filter((term) => {
    const normalized = normalizeToken(term);
    if (!normalized || normalized === headword) return false;
    const hit = map.get(normalized);
    if (!hit) return false;
    const hitPos = guessFamilyPos(normalized, hit.word_type || '');
    if (headPos && hitPos && headPos !== hitPos) return false;
    const trustedByList = providedSet.has(normalized) || overrideSet.has(normalized);
    const reciprocal = hasReciprocalAntonymLink(headword, normalized);
    const negativePair = isNegativeFamilyWord(normalized, headword) || isNegativeFamilyWord(headword, normalized);
    if (negativePair) return true;
    if (!trustedByList) return reciprocal;
    if (trustedByList && reciprocal) return true;
    return isCuratedLexicalEntry(entry) && isCuratedLexicalEntry(hit);
  });
  return filtered.slice(0, 8);
}

function cleanSentenceList(values = [], limit = 8) {
  const out = [];
  const seen = new Set();
  asList(values).forEach((raw) => {
    const s = sentenceCase(raw);
    const normalized = normalizeToken(s);
    if (!s || s.length < 16 || s.length > 220) return;
    if (isBanned(normalized)) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    out.push(s);
  });
  return out.slice(0, limit);
}

function seedFromWord(word = '') {
  return String(word)
    .split('')
    .reduce((n, ch, i) => n + ch.charCodeAt(0) * (i + 3), 0);
}

function pickBySeed(list = [], seed = 1) {
  if (!Array.isArray(list) || !list.length) return '';
  return list[Math.abs(seed) % list.length];
}

function rotateBySeed(list = [], seed = 1) {
  if (!Array.isArray(list) || !list.length) return [];
  const out = [];
  for (let i = 0; i < list.length; i += 1) out.push(list[(i + seed) % list.length]);
  return out;
}

function getOverrideList(word) {
  const overrideMap = loadOverrides();
  if (!word || !overrideMap || typeof overrideMap !== 'object') return [];
  if (!Object.prototype.hasOwnProperty.call(overrideMap, word)) return [];
  return cleanTermList(overrideMap[word], 20, { headword: word, maxWords: 4, dropMorphVariants: true });
}

function getAntonymOverrideList(word) {
  const key = normalizeToken(word);
  if (!key) return [];
  const table = ensureAntonymLookup();
  const set = table.get(key);
  if (!set || !set.size) return [];
  return cleanTermList(Array.from(set), 16, {
    headword: key,
    maxWords: 3,
    dropMorphVariants: false,
  });
}

function isCuratedLexicalEntry(entry = {}) {
  const source = normalizeToken(entry?.source || '').replace(/\s+/g, '-');
  if (CURATED_SOURCES.has(source)) return true;
  return Number(entry?.rank || 0) >= 90;
}

function hasReciprocalSynonymLink(headword = '', candidate = '') {
  const head = normalizeToken(headword);
  const cand = normalizeToken(candidate);
  if (!head || !cand) return false;
  const entry = map.get(cand);
  if (!entry) return false;
  const candidateSynonyms = cleanTermList(
    [...asList(entry?.synonyms), ...getOverrideList(cand)],
    24,
    { headword: cand, maxWords: 3, dropMorphVariants: false }
  );
  return candidateSynonyms.includes(head);
}

function hasReciprocalAntonymLink(headword = '', candidate = '') {
  const head = normalizeToken(headword);
  const cand = normalizeToken(candidate);
  if (!head || !cand) return false;
  const entry = map.get(cand);
  if (!entry) return false;
  const candidateAntonyms = cleanTermList(
    [...asList(entry?.antonyms), ...getAntonymOverrideList(cand)],
    20,
    { headword: cand, maxWords: 3, dropMorphVariants: false }
  );
  return candidateAntonyms.includes(head);
}

function generateMorphAntonymCandidates(headword = '') {
  const head = normalizeToken(headword).replace(/[^a-z]/g, '');
  if (!head || head.length < 3) return [];
  const out = new Set();
  const headPos = guessFamilyPos(head, map.get(head)?.word_type || '');
  const split = splitNegativePrefix(head);
  if (split?.stem && map.has(split.stem)) out.add(split.stem);

  if ((headPos === 'adjective' || headPos === 'noun') && !split) {
    out.add(`un${head}`);
    out.add(`non${head}`);
  }
  if (!split) {
    if (headPos === 'verb') out.add(`dis${head}`);
    if (headPos === 'adjective' || headPos === 'noun') {
      out.add(`in${head}`);
      out.add(`im${head}`);
      out.add(`ir${head}`);
      out.add(`il${head}`);
    }
  }
  if (head.endsWith('ful') && head.length > 4) out.add(`${head.slice(0, -3)}less`);
  if (head.endsWith('less') && head.length > 5) out.add(`${head.slice(0, -4)}ful`);
  if (head.endsWith('able') && head.length > 5) out.add(`${head.slice(0, -4)}unable`);
  if (head.startsWith('un') && head.endsWith('able') && head.length > 7) out.add(head.slice(2));

  return Array.from(out)
    .map((item) => normalizeToken(item))
    .filter(Boolean)
    .filter((item) => item !== head)
    .filter((item) => map.has(item))
    .filter((item) => {
      const itemPos = guessFamilyPos(item, map.get(item)?.word_type || '');
      if (headPos && itemPos && headPos !== itemPos) return false;
      return isNegativeFamilyWord(item, head) || isNegativeFamilyWord(head, item);
    });
}

function buildCollocations(word, wordType) {
  const w = normalizeToken(word);
  if (!w) return [];
  const pos = inferPos(wordType);
  if (pos === 'verb') {
    return cleanTermList([
      `${w} evidence`,
      `${w} a claim`,
      `${w} an argument`,
      `${w} the data`,
      `${w} findings`,
      `${w} results`,
    ], 8, { headword: w, maxWords: 4, requireHeadword: true });
  }
  if (pos === 'noun') {
    return cleanTermList([
      `key ${w}`,
      `${w} analysis`,
      `${w} in context`,
      `${w} in writing`,
      `${w} development`,
      `${w} practice`,
    ], 8, { headword: w, maxWords: 4, requireHeadword: true });
  }
  if (pos === 'adjective') {
    return cleanTermList([
      `${w} argument`,
      `${w} evidence`,
      `${w} response`,
      `${w} explanation`,
      `${w} writing style`,
    ], 8, { headword: w, maxWords: 4, requireHeadword: true });
  }
  return cleanTermList([
    `use ${w} in context`,
    `${w} in a sentence`,
    `${w} for precision`,
    `apply ${w} correctly`,
  ], 8, { headword: w, maxWords: 4, requireHeadword: true });
}

function sanitizeDefinition(definition = '') {
  const raw = String(definition || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  if (raw.length < 10 || raw.length > 220) return '';
  if (isBanned(raw)) return '';
  if (NOISY_DEFINITION_PATTERNS.some((re) => re.test(raw))) return '';
  return sentenceCase(raw);
}

function isAllowedHeadword(word = '') {
  const w = normalizeToken(word);
  if (!w || w.length < 3) return false;
  if (!/^[a-z][a-z-]*$/.test(w)) return false;
  if (BLOCKED_HEADWORDS.has(w)) return false;
  if (isBanned(w)) return false;
  return true;
}

function isWeakExampleSet(examples = [], word = '') {
  const items = cleanSentenceList(examples, 8);
  if (items.length < 2) return true;
  const normWord = normalizeToken(word);
  if (!normWord) return false;
  const includesWordCount = items.filter((ex) => hasWholeWord(ex, normWord)).length;
  return includesWordCount === 0;
}

function buildWordSpecificExamples(entry = {}) {
  const word = normalizeToken(entry.word);
  if (!word) return [];
  const wordType = String(entry.word_type || entry.type || '').trim();
  const definition = String(entry.simple_definition || '').trim();
  const synonyms = cleanTermList(entry.synonyms, 20, { headword: word, maxWords: 4, dropMorphVariants: true });
  const collocations = cleanTermList(entry.collocations, 20, { headword: word, maxWords: 4 });
  const seed = seedFromWord(word) + definition.length;
  const topic = extractTopic(definition);
  const pos = inferPos(wordType);
  const synonymPickA = pickBySeed(synonyms, seed + 7);
  const synonymPickB = pickBySeed(synonyms.filter((s) => s !== synonymPickA), seed + 17);
  const collocationPickA = pickBySeed(collocations, seed + 11);
  const collocationPickB = pickBySeed(collocations.filter((c) => c !== collocationPickA), seed + 21);
  const sceneA = pickBySeed(ACADEMIC_SCENES, seed + 3);
  const sceneB = pickBySeed(ACADEMIC_SCENES.filter((s) => s !== sceneA), seed + 9);
  const purposeA = pickBySeed(PURPOSES, seed + 5);
  const purposeB = pickBySeed(PURPOSES.filter((s) => s !== purposeA), seed + 15);
  const definitionCore = definition.replace(/[.!?]+$/, '').toLowerCase();

  let base = [];
  if (pos === 'verb') {
    base = [
      `Students should ${word} the writer's main claim before choosing evidence ${sceneA}`,
      `A strong response will ${word} key points first, then explain them with one clear example`,
      `During revision, I ${word} each paragraph to remove vague wording ${sceneB || sceneA}`,
      `In BUEPT writing, ${word} complex ideas ${purposeA}`,
      `The paragraph sounds stronger when you ${word} evidence and interpretation together`,
      `If a sentence feels unclear, ${word} the idea in simpler academic language`,
    ];
  } else if (pos === 'noun') {
    base = [
      `${word} is a core term when discussing ${topic} ${sceneA}`,
      `A clear definition of ${word} improves coherence in academic paragraphs`,
      `In my outline, ${word} appears in the thesis and again in the conclusion`,
      `The lecturer highlighted ${word} to explain why the argument was convincing`,
      `Students retain ${word} better when they attach it to a concrete class example`,
      `In exam answers, ${word} is often used ${purposeA}`,
    ];
  } else if (pos === 'adjective') {
    base = [
      `A ${word} explanation makes the argument easier to follow ${sceneA}`,
      `The teacher asked for a ${word} topic sentence in each body paragraph`,
      `We revised the draft to make the conclusion more ${word} and focused`,
      `A ${word} claim still needs concrete evidence and one clear example`,
      `In formal writing, ${word} wording helps readers track the logic`,
      `Your response gains clarity when each paragraph stays ${word} and relevant`,
    ];
  } else if (pos === 'adverb') {
    base = [
      `The presenter explained the process ${word}, so the class followed each step`,
      `Use connectors ${word} to show clear relationships between ideas`,
      `The student responded ${word} and supported each point with evidence`,
      `In timed practice, write ${word} to reduce repetition and improve flow`,
      `The lecturer spoke ${word}, which made note-taking easier`,
      `Read your paragraph ${word} during revision to catch weak transitions`,
    ];
  } else {
    base = [
      `In BUEPT writing, ${word} is useful when discussing ${topic}`,
      `I used ${word} in my response to make the meaning more precise`,
      `The passage used ${word} to highlight the central argument`,
      `Try using ${word} in one definition sentence and one example sentence`,
      `When reviewing vocabulary, place ${word} in a context you can remember`,
      `A practical habit is writing one new sentence with ${word} after each lesson`,
    ];
  }

  if (definitionCore) {
    base.push(`Think of ${word} as "${definitionCore}", then use it ${purposeB || purposeA}`);
  }
  if (collocationPickA) {
    base.push(`A natural collocation for ${word} is "${collocationPickA}", which sounds formal ${sceneA}`);
  }
  if (collocationPickB) {
    base.push(`Another useful phrase is "${collocationPickB}", especially ${sceneB || sceneA}`);
  }
  if (synonymPickA) {
    base.push(`"${synonymPickA}" is close in meaning, but ${word} is often more precise in exam writing`);
  }
  if (synonymPickB) {
    base.push(`Compared with "${synonymPickB}", ${word} usually sounds more academic in this context`);
  }

  return cleanSentenceList(
    rotateBySeed(base.map(sentenceCase), seed % Math.max(1, base.length)).filter((x) => hasWholeWord(x, word)),
    8
  );
}

function createBaseEntry({
  word = '',
  definition = '',
  wordType = '',
  level = 'B2',
  synonyms = [],
  antonyms = [],
  collocations = [],
  derivatives = [],
  examples = [],
  source = 'subset',
  rank = 0,
} = {}) {
  const normalizedWord = normalizeToken(word);
  if (!isAllowedHeadword(normalizedWord)) return null;
  const safeDefinition = sanitizeDefinition(definition);
  if (!safeDefinition) return null;
  const normalizedWordType = String(wordType || '').trim();
  const headPos = guessFamilyPos(normalizedWord, normalizedWordType);
  const rawSynonyms = [...asList(synonyms), ...getOverrideList(normalizedWord)];
  // Filter synonyms to only include words of the SAME part of speech
  const posFilteredSynonyms = rawSynonyms.filter((syn) => {
    const synNorm = normalizeToken(syn);
    if (!synNorm) return false;
    const synEntry = map.get(synNorm);
    const synPos = guessFamilyPos(synNorm, synEntry?.word_type || '');
    // Allow if same POS or if we can't determine POS
    return synPos === headPos || synPos === 'noun' && headPos === 'noun';
  });
  // Fall back to unfiltered if filtering removes everything
  const synonymSource = posFilteredSynonyms.length >= 2 ? posFilteredSynonyms : rawSynonyms;
  const safeSynonyms = cleanTermList(synonymSource, 20, {
    headword: normalizedWord,
    maxWords: 4,
    dropMorphVariants: true,
  });
  const rawAntonyms = [
    ...asList(antonyms),
    ...getAntonymOverrideList(normalizedWord),
    ...generateMorphAntonymCandidates(normalizedWord),
  ];
  const safeAntonyms = cleanTermList(rawAntonyms, 12, { headword: normalizedWord, maxWords: 3, dropMorphVariants: true });
  const safeCollocations = cleanTermList(collocations, 12, {
    headword: normalizedWord,
    maxWords: 4,
    requireHeadword: true,
  });
  const safeDerivatives = cleanTermList(derivatives, 12, { headword: normalizedWord, maxWords: 3 });
  const safeExamples = cleanSentenceList(examples, 8);
  return {
    word: normalizedWord,
    word_type: normalizedWordType,
    level: normalizeLevel(level),
    simple_definition: safeDefinition,
    synonyms: safeSynonyms,
    antonyms: safeAntonyms,
    collocations: safeCollocations.length ? safeCollocations : buildCollocations(normalizedWord, normalizedWordType),
    derivatives: safeDerivatives,
    examples: safeExamples,
    source,
    rank,
  };
}

function mergeEntries(a, b) {
  if (!a) return b;
  if (!b) return a;
  const aRank = Number(a.rank || 0);
  const bRank = Number(b.rank || 0);
  const primary = aRank >= bRank ? a : b;
  const secondary = primary === a ? b : a;
  const mergedCollocations = cleanTermList([...asList(primary.collocations), ...asList(secondary.collocations)], 12, {
    headword: primary.word,
    maxWords: 4,
    requireHeadword: true,
  });
  return {
    ...primary,
    simple_definition: primary.simple_definition || secondary.simple_definition,
    word_type: primary.word_type || secondary.word_type,
    level: primary.level || secondary.level,
    synonyms: cleanTermList([...asList(primary.synonyms), ...asList(secondary.synonyms)], 20, {
      headword: primary.word,
      maxWords: 4,
      dropMorphVariants: true,
    }),
    antonyms: cleanTermList([
      ...asList(primary.antonyms),
      ...asList(secondary.antonyms),
      ...getAntonymOverrideList(primary.word),
      ...generateMorphAntonymCandidates(primary.word),
    ], 12, {
      headword: primary.word,
      maxWords: 3,
      dropMorphVariants: true,
    }),
    collocations: mergedCollocations.length
      ? mergedCollocations
      : buildCollocations(primary.word, primary.word_type || secondary.word_type),
    derivatives: cleanTermList([...asList(primary.derivatives), ...asList(secondary.derivatives)], 12, { headword: primary.word, maxWords: 3 }),
    examples: cleanSentenceList([...asList(primary.examples), ...asList(secondary.examples)], 8),
    rank: Math.max(aRank, bRank),
    source: primary.source,
  };
}

function upsertEntry(targetMap, entry) {
  if (!entry || !entry.word) return false;
  const prev = targetMap.get(entry.word);
  if (!prev) {
    targetMap.set(entry.word, entry);
    return true;
  }
  targetMap.set(entry.word, mergeEntries(prev, entry));
  return false;
}

function fromDepartmentData() {
  const out = [];
  const raw = loadDepartmentVocab();
  const list = Array.isArray(raw) ? raw : [];
  list.forEach((dept) => {
    const words = Array.isArray(dept?.words) ? dept.words : [];
    words.forEach((item) => {
      const entry = createBaseEntry({
        word: item?.word,
        definition: item?.definition,
        wordType: 'noun',
        level: 'B2',
        examples: item?.example ? [item.example] : [],
        source: 'department',
        rank: 100,
      });
      if (entry) out.push(entry);
    });
  });
  return out;
}

function fromAcademicVerbs() {
  const out = [];
  const raw = loadAcademicVerbs();
  const list = Array.isArray(raw) ? raw : [];
  list.forEach((item) => {
    const entry = createBaseEntry({
      word: item?.word,
      definition: item?.definition,
      wordType: 'verb',
      level: 'B2',
      examples: item?.example ? [item.example] : [],
      source: 'academic-verb',
      rank: 95,
    });
    if (entry) out.push(entry);
  });
  return out;
}

function fromAcademicWordList() {
  const out = [];
  const raw = loadAcademicWords();
  const list = Array.isArray(raw) ? raw : [];
  list.forEach((item) => {
    const entry = createBaseEntry({
      word: item?.word,
      definition: item?.definition,
      wordType: '',
      level: item?.level || 'B2',
      source: 'academic-list',
      rank: 92,
    });
    if (entry) out.push(entry);
  });
  return out;
}

function fromTestEnglishVocab() {
  const out = [];
  const raw = loadTestEnglishVocab();
  const list = Array.isArray(raw) ? raw : [];
  list.forEach((item) => {
    const entry = createBaseEntry({
      word: item?.word,
      definition: item?.simple_definition || item?.definition,
      wordType: item?.word_type || '',
      level: item?.level || 'B1',
      synonyms: item?.synonyms,
      antonyms: item?.antonyms,
      collocations: item?.collocations,
      derivatives: item?.derivatives,
      examples: item?.examples,
      source: 'test-english',
      rank: 93,
    });
    if (entry) out.push(entry);
  });
  return out;
}

function fromSubset() {
  const out = [];
  const raw = loadDictionaryCore();
  const list = Array.isArray(raw) ? raw : [];
  list.forEach((item) => {
    const word = normalizeToken(item?.word);
    if (!isAllowedHeadword(word)) return;
    const entry = createBaseEntry({
      word,
      definition: item?.simple_definition || item?.definition,
      wordType: item?.word_type || item?.type,
      level: item?.level || 'B2',
      synonyms: item?.synonyms,
      antonyms: item?.antonyms,
      collocations: item?.collocations,
      derivatives: item?.derivatives,
      examples: item?.examples,
      source: 'subset',
      rank: 60,
    });
    if (!entry) return;
    // the user specifically wants the massive 27,000+ dataset intact.
    out.push(entry);
  });
  return out;
}

let dictionaryBuilt = false;
let dictionaryBuilding = false;
let dictionaryBuildPromise = null;
let buildProgress = 0;
let buildStatus = 'idle';
let buildError = null;
const buildListeners = new Set();
let map = new Map();
let orderedEntries = [];
let familyStemIndex = new Map();
let familyIndexBuilt = false;

function notifyBuild() {
  const payload = { status: buildStatus, progress: buildProgress, error: buildError };
  buildListeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (_) {}
  });
}

export function subscribeDictionaryBuild(listener) {
  if (typeof listener !== 'function') return () => {};
  buildListeners.add(listener);
  listener({ status: buildStatus, progress: buildProgress, error: buildError });
  return () => buildListeners.delete(listener);
}

function normalizeCoreEntry(item = {}) {
  const word = normalizeToken(item?.word);
  if (!word || !isAllowedHeadword(word)) return null;
  const def = sanitizeDefinition(item?.simple_definition || item?.definition);
  if (!def) return null;
  return {
    word,
    simple_definition: def,
    word_type: String(item?.word_type || item?.type || '').trim(),
    level: normalizeLevel(item?.level || 'B2'),
    synonyms: asList(item?.synonyms),
    antonyms: asList(item?.antonyms),
    collocations: asList(item?.collocations),
    derivatives: asList(item?.derivatives),
    examples: asList(item?.examples),
    source: item?.source || 'core',
    rank: Number(item?.rank || 0),
  };
}

function seedFromAcademicItem(item = {}, fallbackLevel = 'B2', fallbackPos = '') {
  const word = normalizeToken(item?.word);
  if (!word || !isAllowedHeadword(word)) return null;
  const def = sanitizeDefinition(item?.definition || item?.simple_definition);
  if (!def) return null;
  return {
    word,
    simple_definition: def,
    word_type: String(fallbackPos || item?.word_type || item?.type || '').trim(),
    level: normalizeLevel(item?.level || fallbackLevel),
    synonyms: asList(item?.synonyms),
    antonyms: asList(item?.antonyms),
    collocations: asList(item?.collocations),
    derivatives: asList(item?.derivatives),
    examples: item?.example ? [item.example] : asList(item?.examples),
    source: item?.source || 'academic',
    rank: Number(item?.rank || 0),
  };
}

function fastCoreBuild() {
  const core = loadDictionaryCore();
  map = new Map();
  orderedEntries = [];
  familyStemIndex = new Map();
  familyIndexBuilt = false;
  hydratedCache.clear();
  familyCache.clear();

  const items = Array.isArray(core) ? core : [];
  items.forEach((item) => {
    const entry = normalizeCoreEntry(item);
    if (!entry) return;
    if (!map.has(entry.word)) {
      map.set(entry.word, entry);
      orderedEntries.push(entry);
    }
  });

  const academic = loadAcademicWords();
  const academicVerbList = loadAcademicVerbs();
  const dept = loadDepartmentVocab();
  const wascLists = loadWascVocabulary();

  (Array.isArray(academic) ? academic : []).forEach((item) => {
    if (!item?.word) return;
    const entry = seedFromAcademicItem(item, item?.level || 'B2', item?.word_type || '');
    if (!entry) return;
    if (!map.has(entry.word)) {
      map.set(entry.word, entry);
      orderedEntries.push(entry);
    }
  });

  (Array.isArray(academicVerbList) ? academicVerbList : []).forEach((item) => {
    if (!item?.word) return;
    const entry = seedFromAcademicItem(item, item?.level || 'B2', 'verb');
    if (!entry) return;
    if (!map.has(entry.word)) {
      map.set(entry.word, entry);
      orderedEntries.push(entry);
    }
  });

  (Array.isArray(dept) ? dept : []).forEach((group) => {
    const words = Array.isArray(group?.words) ? group.words : [];
    words.forEach((item) => {
      if (!item?.word) return;
      const entry = seedFromAcademicItem(item, 'B2', 'noun');
      if (!entry) return;
      if (!map.has(entry.word)) {
        map.set(entry.word, entry);
        orderedEntries.push(entry);
      }
    });
  });

  (Array.isArray(wascLists) ? wascLists : []).forEach((group) => {
    const fallbackLevel = normalizeLevel(group?.level || 'B1');
    const words = Array.isArray(group?.entries) ? group.entries : [];
    words.forEach((item) => {
      if (!item?.word) return;
      const entry = seedFromAcademicItem(
        {
          ...item,
          source: 'wasc-glossary',
          level: item?.level || fallbackLevel,
          examples: item?.examples,
        },
        fallbackLevel,
        item?.word_type || ''
      );
      if (!entry) return;
      if (!map.has(entry.word)) {
        map.set(entry.word, entry);
        orderedEntries.push(entry);
      }
    });
  });

  // ── UPSERT test-english curated vocab (high-quality synonyms/collocations) ──
  // This runs LAST so it can enrich/override existing entries with better data.
  const testEnglishList = loadTestEnglishVocab();
  (Array.isArray(testEnglishList) ? testEnglishList : []).forEach((item) => {
    if (!item?.word) return;
    const word = normalizeToken(item.word);
    if (!word) return;
    const newSynonyms = Array.isArray(item.synonyms) ? item.synonyms : [];
    const newCollocations = Array.isArray(item.collocations) ? item.collocations : [];
    const newExamples = Array.isArray(item.examples) ? item.examples : [];
    const existing = map.get(word);
    if (existing) {
      // Enrich existing entry with curated synonyms and collocations
      const mergedSynonyms = [...new Set([...newSynonyms, ...asList(existing.synonyms)])].slice(0, 20);
      const mergedCollocations = [...new Set([...newCollocations, ...asList(existing.collocations)])].slice(0, 10);
      const mergedExamples = [...new Set([...newExamples, ...asList(existing.examples)])].slice(0, 8);
      map.set(word, {
        ...existing,
        synonyms: mergedSynonyms,
        collocations: mergedCollocations,
        examples: mergedExamples.length ? mergedExamples : existing.examples,
        source: 'test-english', // upgrade source for quality scoring
        rank: Math.max(Number(existing.rank || 0), 93),
      });
      // Invalidate cache for this word
      hydratedCache.delete(word);
    } else {
      const entry = seedFromAcademicItem(
        { ...item, source: 'test-english', rank: 93 },
        item.level || 'B1',
        item.word_type || ''
      );
      if (entry) {
        map.set(entry.word, entry);
        orderedEntries.push(entry);
      }
    }
  });
}

export function startDictionaryBuild() {
  if (dictionaryBuilt) {
    buildStatus = 'ready';
    buildProgress = 1;
    notifyBuild();
    return Promise.resolve(true);
  }
  if (dictionaryBuildPromise) return dictionaryBuildPromise;
  dictionaryBuilding = true;
  buildStatus = 'building';
  buildProgress = 0;
  buildError = null;
  notifyBuild();

  dictionaryBuildPromise = new Promise((resolve, reject) => {
    try {
      fastCoreBuild();
      dictionaryBuilt = true;
      dictionaryBuilding = false;
      buildStatus = 'ready';
      buildProgress = 1;
      notifyBuild();
      resolve(true);
    } catch (err) {
      dictionaryBuilding = false;
      buildStatus = 'error';
      buildError = err?.message || 'Dictionary build failed';
      notifyBuild();
      reject(err);
    }
  });

  return dictionaryBuildPromise;
}

function ensureFamilyIndexReady() {
  if (familyIndexBuilt || !dictionaryBuilt) return;
  familyIndexBuilt = true;
  familyStemIndex = new Map();
  orderedEntries.forEach((entry) => {
    const w = normalizeToken(entry?.word).replace(/[^a-z]/g, '');
    if (!w || w.length < 3) return;
    const stem = stemToken(w);
    if (stem && stem.length >= 3) {
      if (!familyStemIndex.has(stem)) familyStemIndex.set(stem, new Set());
      familyStemIndex.get(stem).add(w);
    }
    const root = familyRoot(w);
    if (root && root.length >= 3) {
      if (!familyStemIndex.has(root)) familyStemIndex.set(root, new Set());
      familyStemIndex.get(root).add(w);
    }
  });
}

function ensureDictionaryReady() {
  if (dictionaryBuilt) return true;
  startDictionaryBuild();
  return false;
}

const hydratedCache = new Map();
const familyCache = new Map();

function buildFamilyFromEntry(entry = {}, fallback = null) {
  const head = normalizeToken(entry?.word || fallback?.word || '');
  const empty = { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };
  if (!head) return empty;

  const extraDerivatives = asList(entry?.derivatives).concat(asList(fallback?.derivatives));
  const extraAntonyms = asList(entry?.antonyms).concat(asList(fallback?.antonyms));

  const candidates = new Set([head]);
  extraDerivatives.forEach((w) => candidates.add(normalizeToken(w)));

  const stem = stemToken(head);
  const root = familyRoot(head);
  [stem, root].forEach((key) => {
    if (!key) return;
    const bucket = familyStemIndex.get(key);
    if (!bucket) return;
    bucket.forEach((cand) => {
      if (isFamilyRelated(head, cand)) candidates.add(cand);
    });
  });

  extraAntonyms.forEach((a) => {
    const normalized = normalizeToken(a);
    if (isNegativeFamilyWord(normalized, head)) candidates.add(normalized);
  });

  const byPos = {
    noun: new Map(),
    verb: new Map(),
    adjective: new Map(),
    adverb: new Map(),
  };
  const negatives = new Map();

  const register = (rawWord, posHint = '') => {
    const w = normalizeToken(rawWord);
    if (!w || w.length < 3) return;
    if (w !== head && !map.has(w)) return;
    if (!isFamilyRelated(head, w) && w !== head && !isNegativeFamilyWord(w, head)) return;
    if (w !== head && commonPrefixLen(head, w) < minFamilyPrefix(head) && !isNegativeFamilyWord(w, head)) return;
    const hit = map.get(w);
    const pos = guessFamilyPos(w, posHint || hit?.word_type || '');
    const score = rankFamilyWord(head, w);
    if (w !== head && score < 34 && !isNegativeFamilyWord(w, head)) return;
    const isNeg = isNegativeFamilyWord(w, head);
    if (pos && byPos[pos] && !isNeg) {
      const prev = byPos[pos].get(w) || -Infinity;
      if (score > prev) byPos[pos].set(w, score);
    }
    if (isNeg) {
      const prevNeg = negatives.get(w) || -Infinity;
      if (score > prevNeg) negatives.set(w, score);
    }
  };

  register(head, entry?.word_type || fallback?.word_type || '');
  candidates.forEach((w) => register(w));
  extraDerivatives.forEach((w) => register(w));
  extraAntonyms.forEach((w) => register(w));

  const toSortedList = (bucket) => Array.from(bucket.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map((item) => item[0]);

  const noun = toSortedList(byPos.noun).slice(0, 8);
  const verb = toSortedList(byPos.verb).slice(0, 8);
  const adjective = toSortedList(byPos.adjective).slice(0, 8);
  const adverb = toSortedList(byPos.adverb).slice(0, 8);
  const negative = Array.from(negatives.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map((item) => item[0])
    .filter((w) => w !== head)
    .slice(0, 8);
  const all = Array.from(new Set([head, ...noun, ...verb, ...adjective, ...adverb, ...negative]));

  return { noun, verb, adjective, adverb, negative, all };
}

function hydrateEntry(entry) {
  if (!entry) return null;
  const key = String(entry.word || '').toLowerCase();
  if (!key) return entry;
  const cached = hydratedCache.get(key);
  if (cached) return cached;

  const rawExamples = cleanSentenceList(entry.examples, 8);
  const generatedExamples = buildWordSpecificExamples(entry);
  const finalExamples = isWeakExampleSet(rawExamples, key)
    ? cleanSentenceList([...rawExamples, ...generatedExamples], 8)
    : rawExamples;
  const safeSynonyms = cleanSynonymsForEntry(entry);
  const safeAntonyms = cleanAntonymsForEntry(entry);
  const verbForms = getVerbForms(entry?.word, entry);

  // ── Merge curated antonyms + word family data ──
  const curated = loadCuratedWordData();
  const curatedEntry = curated[key] || null;
  const curatedAntonyms = curatedEntry?.antonyms || [];
  const mergedAntonyms = [...new Set([...curatedAntonyms, ...safeAntonyms])].slice(0, 10);

  // Build word family derivatives from curated data
  const curatedFamily = curatedEntry?.word_family || null;
  const curatedDerivatives = curatedFamily
    ? [
        ...(curatedFamily.noun || []),
        ...(curatedFamily.verb || []),
        ...(curatedFamily.adjective || []),
        ...(curatedFamily.adverb || []),
      ].filter((w) => w && w !== key)
    : [];

  const hydrated = {
    ...entry,
    examples: finalExamples.length ? finalExamples : generatedExamples,
    synonyms: safeSynonyms,
    antonyms: mergedAntonyms,
    verb_forms: verbForms,
    collocations: entry.collocations?.length ? entry.collocations : buildCollocations(entry.word, entry.word_type),
    // Store curated word family for getWordFamily fallback
    _curatedFamily: curatedFamily || null,
    _curatedDerivatives: curatedDerivatives,
  };
  hydratedCache.set(key, hydrated);
  return hydrated;
}

export function buildFallbackEntry(word = '', definition = '', wordType = '') {
  const cleanWord = normalizeToken(word);
  if (!cleanWord) return null;
  const safeDef = sanitizeDefinition(definition) || sentenceCase(definition || `Meaning of ${cleanWord}`);
  const baseEntry = {
    word: cleanWord,
    word_type: String(wordType || '').trim(),
    level: 'B2',
    simple_definition: safeDef,
    synonyms: [],
    antonyms: [],
    collocations: buildCollocations(cleanWord, wordType),
    derivatives: [],
    examples: [],
    source: 'fallback',
  };
  const generatedExamples = buildWordSpecificExamples(baseEntry);
  return {
    ...baseEntry,
    examples: generatedExamples,
  };
}

export function sanitizeSynonymList(word = '', wordType = '', synonyms = []) {
  return cleanSynonymsForEntry({ word, word_type: wordType, synonyms });
}

export function getWordEntry(word) {
  if (!dictionaryBuilt && !dictionaryBuilding) {
    startDictionaryBuild();
  }
  const base = normalizeToken(word);
  if (!base) return null;
  const direct = map.get(base);
  if (direct) return hydrateEntry(direct);
  const variants = [
    base.replace(/ies$/, 'y'),
    base.replace(/es$/, ''),
    base.replace(/s$/, ''),
    base.replace(/ing$/, ''),
    base.replace(/ed$/, ''),
  ].filter((v) => v && v !== base);
  for (const v of variants) {
    const hit = map.get(v);
    if (hit) return hydrateEntry(hit);
  }
  return null;
}

export function getWordFamily(word, fallbackEntry = null) {
  if (!ensureDictionaryReady()) {
    return { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };
  }
  ensureFamilyIndexReady();
  const baseWord = normalizeToken(word);
  if (!baseWord) return { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };

  // ── Check curated word family FIRST (most accurate) ──
  const curated = loadCuratedWordData();
  const curatedEntry = curated[baseWord];
  if (curatedEntry?.word_family) {
    const cf = curatedEntry.word_family;
    const noun = (cf.noun || []).filter(Boolean);
    const verb = (cf.verb || []).filter(Boolean);
    const adjective = (cf.adjective || []).filter(Boolean);
    const adverb = (cf.adverb || []).filter(Boolean);
    const negative = [];
    const all = [...new Set([baseWord, ...noun, ...verb, ...adjective, ...adverb])];
    return { noun, verb, adjective, adverb, negative, all };
  }

  const fallbackTail = [
    ...asList(fallbackEntry?.derivatives),
    ...asList(fallbackEntry?.antonyms),
  ]
    .map((item) => normalizeToken(item))
    .filter(Boolean)
    .sort()
    .join('|');
  const cacheKey = `${baseWord}|${String(fallbackEntry?.word_type || '')}|${fallbackTail}`;
  const cached = familyCache.get(cacheKey);
  if (cached) return cached;
  const direct = getWordEntry(baseWord);
  const source = direct || {
    word: baseWord,
    word_type: fallbackEntry?.word_type || '',
    derivatives: asList(fallbackEntry?.derivatives),
    antonyms: asList(fallbackEntry?.antonyms),
  };
  const family = buildFamilyFromEntry(source, fallbackEntry);
  familyCache.set(cacheKey, family);
  return family;

}

function isLikelyVerb(word = '', wordType = '') {
  const normalized = normalizeToken(word);
  if (!normalized) return false;
  const type = String(wordType || '').toLowerCase();
  if (type.includes('verb')) return true;
  const hit = map.get(normalized);
  return String(hit?.word_type || '').toLowerCase().includes('verb');
}

function normalizeVerbBase(word = '') {
  return normalizeToken(word).replace(/[^a-z]/g, '');
}

function endsWithConsonantY(word = '') {
  return /[^aeiou]y$/.test(word);
}

function shouldDoubleFinalConsonant(word = '') {
  if (!word || word.length < 3) return false;
  const last = word[word.length - 1];
  const mid = word[word.length - 2];
  const prev = word[word.length - 3];
  if ('wxy'.includes(last)) return false;
  const isVowel = (ch) => 'aeiou'.includes(ch);
  return !isVowel(last) && isVowel(mid) && !isVowel(prev) && word.length <= 6;
}

function buildRegularVerbForms(base = '') {
  const word = normalizeVerbBase(base);
  if (!word) return null;
  let thirdPerson = `${word}s`;
  if (endsWithConsonantY(word)) {
    thirdPerson = `${word.slice(0, -1)}ies`;
  } else if (/(s|sh|ch|x|z|o)$/.test(word)) {
    thirdPerson = `${word}es`;
  }

  let ing = `${word}ing`;
  if (/ie$/.test(word)) {
    ing = `${word.slice(0, -2)}ying`;
  } else if (/e$/.test(word) && !/(ee|ye|oe)$/.test(word)) {
    ing = `${word.slice(0, -1)}ing`;
  } else if (shouldDoubleFinalConsonant(word)) {
    ing = `${word}${word[word.length - 1]}ing`;
  }

  let v2 = `${word}ed`;
  if (/e$/.test(word)) {
    v2 = `${word}d`;
  } else if (endsWithConsonantY(word)) {
    v2 = `${word.slice(0, -1)}ied`;
  } else if (shouldDoubleFinalConsonant(word)) {
    v2 = `${word}${word[word.length - 1]}ed`;
  }

  return {
    base: word,
    v2,
    v3: v2,
    ing,
    thirdPerson,
    isIrregular: false,
  };
}

export function getVerbForms(word = '', fallbackEntry = null) {
  const base = normalizeVerbBase(word);
  if (!base) return null;
  const entry = fallbackEntry || map.get(base) || null;
  if (!isLikelyVerb(base, entry?.word_type || '')) return null;

  const irregular = IRREGULAR_VERB_FORMS[base];
  if (irregular) {
    const regular = buildRegularVerbForms(base);
    return {
      base,
      v2: irregular.v2,
      v3: irregular.v3,
      ing: regular?.ing || `${base}ing`,
      thirdPerson: regular?.thirdPerson || `${base}s`,
      isIrregular: true,
    };
  }

  return buildRegularVerbForms(base);
}

export function getDictionarySample(limit = 50) {
  if (!dictionaryBuilt && !dictionaryBuilding) {
    startDictionaryBuild();
  }
  if (!orderedEntries.length) return [];
  return orderedEntries.slice(0, limit).map(hydrateEntry);
}

export function getDictionarySlice(limit = 50) {
  if (!dictionaryBuilt && !dictionaryBuilding) {
    startDictionaryBuild();
  }
  if (!orderedEntries.length) return [];
  return orderedEntries.slice(0, limit);
}

export function searchDictionary({ query = '', level = 'All', limit = 2000, includeDefinitions = true, hydrate = false } = {}) {
  if (!dictionaryBuilt && !dictionaryBuilding) {
    startDictionaryBuild();
  }
  if (!orderedEntries.length) return [];
  const q = normalizeToken(query);
  const results = [];
  for (const entry of orderedEntries) {
    if (level !== 'All' && entry.level !== level) continue;
    if (q) {
      const w = String(entry.word || '').toLowerCase();
      const d = String(entry.simple_definition || '').toLowerCase();
      if (!w.includes(q) && (!includeDefinitions || !d.includes(q))) continue;
    }
    results.push(hydrate ? hydrateEntry(entry) : entry);
    if (limit && results.length >= limit) break;
  }
  return results;
}

export function getDictionaryCount() {
  if (!dictionaryBuilt && !dictionaryBuilding) {
    startDictionaryBuild();
  }
  return orderedEntries.length;
}

export function getEntriesWithExamples(limit = 200) {
  if (!ensureDictionaryReady()) return [];
  const result = [];
  for (const entry of orderedEntries) {
    const hydrated = hydrateEntry(entry);
    if (hydrated && hydrated.examples && hydrated.examples.length > 0) {
      result.push(hydrated);
      if (result.length >= limit) break;
    }
  }
  return result;
}

export function getEntriesWithSynonyms(limit = 200) {
  if (!ensureDictionaryReady()) return [];
  const result = [];
  for (const entry of orderedEntries) {
    const hydrated = hydrateEntry(entry);
    if (hydrated && hydrated.synonyms && hydrated.synonyms.length > 0) {
      result.push(hydrated);
      if (result.length >= limit) break;
    }
  }
  return result;
}
