import dict from '../../data/dictionary_subset.json';
import overrides from '../../data/synonym_overrides.json';
import academicWords from '../../data/academic_wordlist.json';
import academicVerbs from '../../data/academic_verbs.json';
import departmentVocab from '../../data/bogazici_department_vocab.json';
import testEnglishVocab from '../../data/test_english_vocab_items.json';

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
  const isAWL = Array.isArray(academicWords) && academicWords.some(a => normalizeToken(a.word) === normalized);
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
  // Suffixes have highest priority for correctness (prevents "differently" as verb)
  if (/(ly)$/.test(w)) return 'adverb';
  if (/(ous|ive|able|ible|ic|ical|less|ful|ent|ant|ary)$/.test(w)) return 'adjective';
  if (/(tion|sion|ment|ness|ity|ism|ist|ance|ence|ship)$/.test(w)) return 'noun';
  if (/(ize|ise|ify|ate|en)$/.test(w)) return 'verb';
  
  const fromType = normalizeFamilyPos(wordType);
  if (fromType) return fromType;
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

function stripNegativePrefix(word = '') {
  const w = normalizeToken(word).replace(/[^a-z]/g, '');
  if (!w) return '';
  for (const prefix of NEGATIVE_PREFIXES) {
    if (w.startsWith(prefix) && w.length - prefix.length >= 4) {
      return w.slice(prefix.length);
    }
  }
  return '';
}

function isNegativeFamilyWord(candidate = '', headword = '') {
  const cand = normalizeToken(candidate);
  const head = normalizeToken(headword);
  if (!cand || !head || cand === head) return false;
  if (cand.endsWith('less') && commonPrefixLen(cand, head) >= 4) return true;
  const stripped = stripNegativePrefix(cand);
  if (!stripped) return false;
  if (stripped === head) return true;
  if (commonPrefixLen(stripped, head) >= minFamilyPrefix(head)) return true;
  const strippedRoot = familyRoot(stripped);
  const headRoot = familyRoot(head);
  if (strippedRoot && headRoot && strippedRoot === headRoot && strippedRoot.length >= 3) return true;
  return false;
}

function isFamilyRelated(headword = '', candidate = '') {
  const head = normalizeToken(headword);
  const cand = normalizeToken(candidate);
  if (!head || !cand) return false;
  if (head === cand) return true;
  const prefix = commonPrefixLen(head, cand);
  const minPrefix = minFamilyPrefix(head);
  const closeLength = Math.abs(head.length - cand.length) <= 7;
  if (prefix >= minPrefix && closeLength) return true;
  const headStem = stemToken(head);
  const candStem = stemToken(cand);
  if (headStem && candStem && headStem === candStem) return true;
  const headRoot = familyRoot(head);
  const candRoot = familyRoot(cand);
  if (headRoot && candRoot && headRoot === candRoot && headRoot.length >= 3) return true;
  if (head.includes(cand) || cand.includes(head)) return true;
  return false;
}

function generateFamilyCandidates(word = '') {
  const w = normalizeToken(word).replace(/[^a-z]/g, '');
  if (!w || w.length < 3) return [];
  const stems = new Set([w, familyRoot(w)]);
  if (w.length > 4 && w.endsWith('e')) stems.add(w.slice(0, -1));
  if (w.length > 4 && w.endsWith('y')) stems.add(w.slice(0, -1));
  if (w.length > 5 && w.endsWith('ic')) stems.add(w.slice(0, -2));
  const out = new Set();
  const nounSuffixes = ['tion', 'sion', 'ion', 'ment', 'ness', 'ity', 'ance', 'ence', 'er', 'or', 'ism', 'ist'];
  const verbSuffixes = ['ize', 'ise', 'ify', 'ate', 'en'];
  const adjectiveSuffixes = ['al', 'ial', 'ic', 'ical', 'ive', 'ous', 'able', 'ible', 'ary', 'ant', 'ent', 'ful', 'less'];
  const adverbSuffixes = ['ly'];
  stems.forEach((stem) => {
    if (!stem || stem.length < 3) return;
    nounSuffixes.forEach((s) => out.add(`${stem}${s}`));
    verbSuffixes.forEach((s) => out.add(`${stem}${s}`));
    adjectiveSuffixes.forEach((s) => out.add(`${stem}${s}`));
    adverbSuffixes.forEach((s) => out.add(`${stem}${s}`));
    if (stem.endsWith('y') && stem.length > 3) out.add(`${stem.slice(0, -1)}ily`);
  });
  return Array.from(out).filter((item) => item && item !== w);
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
  if (!word || !overrides || typeof overrides !== 'object') return [];
  if (!Object.prototype.hasOwnProperty.call(overrides, word)) return [];
  return cleanTermList(overrides[word], 20, { headword: word, maxWords: 4, dropMorphVariants: true });
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
  const safeSynonyms = cleanTermList([...asList(synonyms), ...getOverrideList(normalizedWord)], 20, {
    headword: normalizedWord,
    maxWords: 4,
    dropMorphVariants: true,
  });
  const safeAntonyms = cleanTermList(antonyms, 12, { headword: normalizedWord, maxWords: 3, dropMorphVariants: true });
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
  const mergedCollocations = cleanTermList([...(primary.collocations || []), ...(secondary.collocations || [])], 12, {
    headword: primary.word,
    maxWords: 4,
    requireHeadword: true,
  });
  return {
    ...primary,
    simple_definition: primary.simple_definition || secondary.simple_definition,
    word_type: primary.word_type || secondary.word_type,
    level: primary.level || secondary.level,
    synonyms: cleanTermList([...(primary.synonyms || []), ...(secondary.synonyms || [])], 20, {
      headword: primary.word,
      maxWords: 4,
      dropMorphVariants: true,
    }),
    antonyms: cleanTermList([...(primary.antonyms || []), ...(secondary.antonyms || [])], 12, {
      headword: primary.word,
      maxWords: 3,
      dropMorphVariants: true,
    }),
    collocations: mergedCollocations.length
      ? mergedCollocations
      : buildCollocations(primary.word, primary.word_type || secondary.word_type),
    derivatives: cleanTermList([...(primary.derivatives || []), ...(secondary.derivatives || [])], 12, { headword: primary.word, maxWords: 3 }),
    examples: cleanSentenceList([...(primary.examples || []), ...(secondary.examples || [])], 8),
    rank: Math.max(aRank, bRank),
    source: primary.source,
  };
}

function upsertEntry(targetMap, entry) {
  if (!entry || !entry.word) return;
  const prev = targetMap.get(entry.word);
  if (!prev) {
    targetMap.set(entry.word, entry);
    return;
  }
  targetMap.set(entry.word, mergeEntries(prev, entry));
}

function fromDepartmentData() {
  const out = [];
  const list = Array.isArray(departmentVocab) ? departmentVocab : [];
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
  const list = Array.isArray(academicVerbs) ? academicVerbs : [];
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
  const list = Array.isArray(academicWords) ? academicWords : [];
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
  const list = Array.isArray(testEnglishVocab) ? testEnglishVocab : [];
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
  const list = Array.isArray(dict) ? dict : [];
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

const map = new Map();
[...fromDepartmentData(), ...fromAcademicVerbs(), ...fromAcademicWordList(), ...fromTestEnglishVocab(), ...fromSubset()].forEach((entry) => {
  upsertEntry(map, entry);
});

const orderedEntries = Array.from(map.values())
  .sort((a, b) => {
    const rankDiff = Number(b.rank || 0) - Number(a.rank || 0);
    if (rankDiff !== 0) return rankDiff;
    return String(a.word).localeCompare(String(b.word));
  });

const familyPrefixIndex = new Map();
orderedEntries.forEach((entry) => {
  const w = normalizeToken(entry?.word).replace(/[^a-z]/g, '');
  if (!w || w.length < 3) return;
  const max = Math.min(6, w.length);
  for (let len = 3; len <= max; len += 1) {
    const key = w.slice(0, len);
    if (!familyPrefixIndex.has(key)) familyPrefixIndex.set(key, new Set());
    familyPrefixIndex.get(key).add(w);
  }
});

const hydratedCache = new Map();
const familyCache = new Map();

function buildFamilyFromEntry(entry = {}, fallback = null) {
  const head = normalizeToken(entry?.word || fallback?.word || '');
  const empty = { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };
  if (!head) return empty;

  const extraDerivatives = asList(entry?.derivatives).concat(asList(fallback?.derivatives));
  const extraAntonyms = asList(entry?.antonyms).concat(asList(fallback?.antonyms));
  const generated = generateFamilyCandidates(head);

  const candidates = new Set([head]);
  extraDerivatives.forEach((w) => candidates.add(normalizeToken(w)));
  generated.forEach((w) => {
    if (map.has(w)) candidates.add(w);
  });

  const prefixLens = [];
  const minPrefix = minFamilyPrefix(head);
  for (let len = minPrefix; len <= Math.min(6, head.length); len += 1) prefixLens.push(len);
  prefixLens.forEach((len) => {
    const key = head.slice(0, len);
    const bucket = familyPrefixIndex.get(key);
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
    if (!isFamilyRelated(head, w) && w !== head && !isNegativeFamilyWord(w, head)) return;
    const hit = map.get(w);
    const pos = guessFamilyPos(w, posHint || hit?.word_type || '');
    const score = rankFamilyWord(head, w);
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
  const hydrated = {
    ...entry,
    examples: finalExamples.length ? finalExamples : generatedExamples,
    collocations: entry.collocations?.length ? entry.collocations : buildCollocations(entry.word, entry.word_type),
  };
  hydratedCache.set(key, hydrated);
  return hydrated;
}

export function getWordEntry(word) {
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
  const baseWord = normalizeToken(word);
  if (!baseWord) return { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };
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

export function getDictionarySample(limit = 50) {
  return orderedEntries.slice(0, limit).map(hydrateEntry);
}

export function getDictionaryCount() {
  return orderedEntries.length;
}

export function getEntriesWithExamples(limit = 200) {
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
