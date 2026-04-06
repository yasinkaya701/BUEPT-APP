const state = {
  reading: null,
  grammar: null,
  writing: null,
  runtimeMode: 'auto',
  apiBase: '',
  modules: [],
  moduleFilter: {
    query: '',
    category: 'all',
  },
  ui: {
    currentTab: 'Home',
    loadedTabs: new Set(),
  },
  local: {
    coreLoaded: false,
    dictionaryLoaded: false,
    core: {},
    dictionaryIndex: null,
    dictionaryByWord: null,
  },
};

const LOCAL_DICTIONARY_COUNT_HINT = 26795;
const SYNC_STORE_KEY = 'buept_sync_bridge_v1';
const API_BASE_STORE_KEY = 'buept_web_api_base_v1';
const SYNC_CLIENT_ID = 'web-app';
const SYNC_FIELDS = ['myWords', 'unknownWords', 'vocabStats', 'customDecks', 'weeklyProgress'];
const TAB_NAMES = ['Home', 'Reading', 'Grammar', 'Writing', 'Vocab', 'Listening', 'Speaking'];
const TAB_SCREEN_IDS = {
  Home: 'screen-home',
  Reading: 'screen-reading',
  Grammar: 'screen-grammar',
  Writing: 'screen-writing',
  Vocab: 'screen-vocab',
  Listening: 'screen-listening',
  Speaking: 'screen-speaking',
};
const MODULE_KIND_BY_ROUTE = {
  AcademicWriting: 'academic_writing_template',
  EssayEvaluation: 'academic_writing_template',
  WritingEditor: 'academic_writing_template',
  Essay: 'academic_writing_template',
  TerminologyDictionary: 'interactive_dictionary',
  InteractiveVocabulary: 'interactive_dictionary',
  SynonymFinder: 'interactive_dictionary',
  PhotoVocabCapture: 'photo_vocab_extract',
  PlacementTest: 'proficiency_mock',
  ProficiencyMock: 'proficiency_mock',
  Mock: 'proficiency_mock',
  WeakPointAnalysis: 'weak_point_analysis',
};

function normalizeApiBase(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.replace(/\/+$/, '');
}

function readStoredApiBase() {
  try {
    return normalizeApiBase(window.localStorage.getItem(API_BASE_STORE_KEY) || '');
  } catch (_err) {
    return '';
  }
}

function writeStoredApiBase(value = '') {
  const normalized = normalizeApiBase(value);
  try {
    if (!normalized) window.localStorage.removeItem(API_BASE_STORE_KEY);
    else window.localStorage.setItem(API_BASE_STORE_KEY, normalized);
  } catch (_err) {
    // ignore localStorage errors
  }
  return normalized;
}

function qs(id) {
  return document.getElementById(id);
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function uniq(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const text = String(item || '').trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function resolveAssetPath(relPath) {
  return new URL(relPath, window.location.href).toString();
}

async function loadJsonAsset(name) {
  const res = await fetch(resolveAssetPath(`./data/${name}`));
  if (!res.ok) {
    throw new Error(`LOCAL_DATA_MISSING: ${name}`);
  }
  return res.json();
}

async function ensureLocalCoreLoaded() {
  if (state.local.coreLoaded) return;

  const [
    readingTasks,
    grammarTasks,
    grammarTasksHard,
    testEnglishGrammarTasks,
    writingPrompts,
    listeningPodcasts,
    universitySchedule,
    departmentVocab,
  ] = await Promise.all([
    loadJsonAsset('reading_tasks.json'),
    loadJsonAsset('grammar_tasks.json'),
    loadJsonAsset('grammar_tasks_hard.json'),
    loadJsonAsset('test_english_grammar_tasks.json'),
    loadJsonAsset('writing_prompts.json'),
    loadJsonAsset('listening_podcasts.json'),
    loadJsonAsset('university_schedule_2025_fall.json'),
    loadJsonAsset('bogazici_department_vocab.json'),
  ]);

  state.local.core = {
    readingTasks: Array.isArray(readingTasks) ? readingTasks : [],
    grammarTasks: [
      ...(Array.isArray(grammarTasks) ? grammarTasks : []),
      ...(Array.isArray(grammarTasksHard) ? grammarTasksHard : []),
      ...(Array.isArray(testEnglishGrammarTasks) ? testEnglishGrammarTasks : []),
    ],
    writingPrompts: Array.isArray(writingPrompts) ? writingPrompts : [],
    listeningPodcasts: Array.isArray(listeningPodcasts) ? listeningPodcasts : [],
    universitySchedule: universitySchedule || {},
    departmentVocab: Array.isArray(departmentVocab) ? departmentVocab : [],
  };

  state.local.coreLoaded = true;
}

function normalizeDictionaryEntry(item, source = 'dict', rank = 1) {
  const word = String(item?.word || '').trim();
  if (!word) return null;

  const definition = String(item?.simple_definition || item?.definition || '').trim();
  const synonyms = uniq(item?.synonyms || []);
  const antonyms = uniq(item?.antonyms || []);
  const collocations = uniq(item?.collocations || []);
  const derivatives = uniq(item?.derivatives || []);
  const examples = uniq(item?.examples || (item?.example ? [item.example] : []));

  return {
    word,
    level: String(item?.level || 'B2').trim() || 'B2',
    wordType: String(item?.word_type || item?.wordType || '').trim(),
    definition,
    synonyms,
    antonyms,
    collocations,
    derivatives,
    examples,
    source,
    rank,
  };
}

async function ensureLocalDictionaryLoaded() {
  if (state.local.dictionaryLoaded) return;

  const [dictionarySubset, academicWordList, academicVerbs, testEnglishVocabItems] = await Promise.all([
    loadJsonAsset('dictionary_subset.json'),
    loadJsonAsset('academic_wordlist.json'),
    loadJsonAsset('academic_verbs.json'),
    loadJsonAsset('test_english_vocab_items.json'),
  ]);

  const merged = [];

  for (const row of Array.isArray(testEnglishVocabItems) ? testEnglishVocabItems : []) {
    const entry = normalizeDictionaryEntry(row, 'test-english', 90);
    if (entry) merged.push(entry);
  }

  for (const row of Array.isArray(academicWordList) ? academicWordList : []) {
    const entry = normalizeDictionaryEntry(
      {
        word: row?.word,
        simple_definition: row?.definition,
        level: row?.level || 'B2',
        collocations: row?.collocations || [],
        examples: row?.example ? [row.example] : [],
      },
      'academic',
      80,
    );
    if (entry) merged.push(entry);
  }

  for (const row of Array.isArray(academicVerbs) ? academicVerbs : []) {
    const entry = normalizeDictionaryEntry(
      {
        word: row?.word,
        simple_definition: row?.definition,
        level: row?.level || 'B2',
        word_type: 'verb',
        examples: row?.example ? [row.example] : [],
      },
      'academic-verbs',
      85,
    );
    if (entry) merged.push(entry);
  }

  for (const row of Array.isArray(dictionarySubset) ? dictionarySubset : []) {
    const entry = normalizeDictionaryEntry(row, 'subset', 60);
    if (entry) merged.push(entry);
  }

  const byWord = new Map();
  for (const item of merged) {
    const key = item.word.toLowerCase();
    const prev = byWord.get(key);
    if (!prev) {
      byWord.set(key, item);
      continue;
    }
    const mergedItem = {
      ...prev,
      definition: prev.rank >= item.rank ? prev.definition : item.definition,
      level: prev.rank >= item.rank ? prev.level : item.level,
      wordType: prev.wordType || item.wordType,
      synonyms: uniq([...prev.synonyms, ...item.synonyms]).slice(0, 12),
      antonyms: uniq([...prev.antonyms, ...item.antonyms]).slice(0, 8),
      collocations: uniq([...prev.collocations, ...item.collocations]).slice(0, 10),
      derivatives: uniq([...prev.derivatives, ...item.derivatives]).slice(0, 10),
      examples: uniq([...prev.examples, ...item.examples]).slice(0, 5),
      rank: Math.max(prev.rank, item.rank),
      source: prev.rank >= item.rank ? prev.source : item.source,
    };
    byWord.set(key, mergedItem);
  }

  const list = Array.from(byWord.values()).sort((a, b) => {
    const rankDiff = Number(b.rank || 0) - Number(a.rank || 0);
    if (rankDiff !== 0) return rankDiff;
    return String(a.word).localeCompare(String(b.word));
  });

  state.local.dictionaryIndex = list;
  state.local.dictionaryByWord = byWord;
  state.local.dictionaryLoaded = true;
}

function safeParseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (_err) {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function pickEnglishTokens(text = '', minLen = 4) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= minLen);
}

function getLocalSyncState() {
  const fallback = {
    updatedAt: nowIso(),
    state: {
      myWords: [],
      unknownWords: [],
      vocabStats: {},
      customDecks: [],
      weeklyProgress: {},
    },
    clients: {
      [SYNC_CLIENT_ID]: { updatedAt: nowIso(), fields: [] },
    },
  };

  try {
    const raw = window.localStorage.getItem(SYNC_STORE_KEY);
    if (!raw) return fallback;
    const parsed = safeParseJson(raw, fallback);
    if (!parsed || typeof parsed !== 'object') return fallback;
    if (!parsed.state || typeof parsed.state !== 'object') parsed.state = fallback.state;
    SYNC_FIELDS.forEach((field) => {
      if (!(field in parsed.state)) parsed.state[field] = fallback.state[field];
    });
    return parsed;
  } catch (_err) {
    return fallback;
  }
}

function writeLocalSyncState(value) {
  const payload = {
    updatedAt: nowIso(),
    state: {
      myWords: Array.isArray(value?.state?.myWords) ? value.state.myWords : [],
      unknownWords: Array.isArray(value?.state?.unknownWords) ? value.state.unknownWords : [],
      vocabStats: value?.state?.vocabStats && typeof value.state.vocabStats === 'object' ? value.state.vocabStats : {},
      customDecks: Array.isArray(value?.state?.customDecks) ? value.state.customDecks : [],
      weeklyProgress: value?.state?.weeklyProgress && typeof value.state.weeklyProgress === 'object' ? value.state.weeklyProgress : {},
    },
    clients: value?.clients && typeof value.clients === 'object' ? value.clients : {},
  };

  window.localStorage.setItem(SYNC_STORE_KEY, JSON.stringify(payload));
  return payload;
}

function buildSyncSnapshot(syncStore) {
  const snap = syncStore?.state || {};
  return {
    myWords: Array.isArray(snap.myWords) ? snap.myWords : [],
    unknownWords: Array.isArray(snap.unknownWords) ? snap.unknownWords : [],
    vocabStats: snap.vocabStats && typeof snap.vocabStats === 'object' ? snap.vocabStats : {},
    customDecks: Array.isArray(snap.customDecks) ? snap.customDecks : [],
    weeklyProgress: snap.weeklyProgress && typeof snap.weeklyProgress === 'object' ? snap.weeklyProgress : {},
  };
}

function mergeSyncState(syncStore, incomingState, clientId = SYNC_CLIENT_ID) {
  const source = syncStore && typeof syncStore === 'object' ? syncStore : getLocalSyncState();
  const current = buildSyncSnapshot(source);
  const patch = incomingState && typeof incomingState === 'object' ? incomingState : {};
  const next = { ...current };
  const touched = [];

  SYNC_FIELDS.forEach((field) => {
    if (field in patch) {
      next[field] = patch[field];
      touched.push(field);
    }
  });

  const merged = writeLocalSyncState({
    updatedAt: nowIso(),
    state: next,
    clients: {
      ...(source.clients || {}),
      [String(clientId || SYNC_CLIENT_ID)]: {
        updatedAt: nowIso(),
        fields: touched,
      },
    },
  });
  return { merged, touched };
}

function buildMiniQuizFromWords(words = [], size = 5) {
  const bag = uniq(
    (Array.isArray(words) ? words : [])
      .map((w) => {
        if (typeof w === 'string') return w;
        if (w && typeof w === 'object') return w.word || w.term || '';
        return '';
      })
      .filter(Boolean),
  );
  if (!bag.length) return [];

  const selection = bag.slice(0, Math.max(1, Math.min(size, bag.length)));
  return selection.map((word, index) => ({
    id: `mini-${index + 1}`,
    q: `Choose the best meaning for "${word}".`,
    answer: 0,
    options: [
      `A likely academic meaning of "${word}"`,
      'An unrelated random meaning',
      'A grammar tense marker',
      'A punctuation symbol',
    ],
    explain: 'Mini quiz generated from synced unknown words.',
  }));
}

function buildWritingRevisionLocal(text = '', prompt = '', level = 'B2', task = 'essay') {
  const source = String(text || '').trim();
  if (!source) {
    return {
      revisedText: '',
      summary: 'No text provided.',
      strengths: [],
      fixes: ['Write your response first.'],
      rubricNotes: [],
      source: 'web-local',
      model: '',
      prompt: String(prompt || ''),
    };
  }

  const replacementMap = [
    [' very important ', ' significant '],
    [' a lot of ', ' many '],
    [' good ', ' beneficial '],
    [' bad ', ' harmful '],
    [' show ', ' demonstrate '],
    [' shows ', ' demonstrates '],
    [' thing ', ' aspect '],
  ];

  let revised = ` ${source} `;
  replacementMap.forEach(([from, to]) => {
    const rx = new RegExp(from.replace(/\s+/g, '\\s+'), 'gi');
    revised = revised.replace(rx, to);
  });
  revised = revised.replace(/\s+/g, ' ').trim();

  if (!/\b(in conclusion|to conclude|overall)\b/i.test(revised) && task === 'essay') {
    revised = `${revised} In conclusion, this argument is stronger when supported with clearer academic evidence.`;
  }

  const wc = countWords(source);
  const connectors = (source.match(/\bhowever|therefore|moreover|in addition|for example|on the other hand\b/gi) || []).length;

  const strengths = [];
  if (wc >= 120) strengths.push('Length is sufficient for BUEPT-style development.');
  if (connectors >= 2) strengths.push('Basic cohesion markers are present.');
  if (!strengths.length) strengths.push('Core idea is clear enough to develop.');

  const fixes = [];
  if (wc < 120) fixes.push('Increase content depth: target at least 120-150 words.');
  if (connectors < 2) fixes.push('Use more transitions to improve flow and coherence.');
  fixes.push('Replace repeated simple words with more precise academic alternatives.');

  const rubricNotes = [
    `Level target: ${String(level || 'B2').toUpperCase()}`,
    'BUEPT rubric prioritizes task response, organization, grammar control, and lexical precision.',
    'Final proofreading should check article use, verb forms, and punctuation.',
  ];

  return {
    revisedText: revised,
    summary: 'Local revision generated (no API key required).',
    strengths,
    fixes,
    rubricNotes,
    source: 'web-local',
    model: '',
    prompt: String(prompt || ''),
  };
}

function buildSpeakingFeedbackLocal(text = '') {
  const source = String(text || '').trim();
  const lines = source.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const dedup = [];
  const seen = new Set();
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(line);
  }

  const merged = dedup.join(' ');
  const wc = countWords(merged);
  const fillerCount = (merged.match(/\b(um|uh|like|you know|actually)\b/gi) || []).length;
  const sentenceCount = merged.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length || 1;
  const avgLen = Math.max(1, Math.round((wc / sentenceCount) * 10) / 10);
  const fluency = Math.max(35, Math.min(92, Math.round(72 + Math.min(20, wc / 8) - fillerCount * 2)));

  const pronunciationHotspots = ['th', 'v/w', 'word stress', 'sentence stress'];
  const hotspot = pronunciationHotspots[Math.min(pronunciationHotspots.length - 1, fillerCount % pronunciationHotspots.length)];

  return {
    reply: `Fluency ${fluency}/100. Focus on shorter clear chunks and reduce fillers. Pronunciation hotspot: ${hotspot}.`,
    transcriptClean: merged,
    metrics: {
      wordCount: wc,
      fillerCount,
      avgSentenceLength: avgLen,
      fluency,
    },
    timeline: [
      { segment: 'Opening', score: Math.max(40, fluency - 8) },
      { segment: 'Development', score: fluency },
      { segment: 'Closing', score: Math.min(95, fluency + 5) },
    ],
  };
}

function buildPresentationLocal({ topic = '', level = 'B2', durationMin = 10 } = {}) {
  const safeTopic = String(topic || '').trim() || 'Academic Topic';
  const safeLevel = String(level || 'B2').trim().toUpperCase();
  const safeDuration = Math.max(5, Math.min(20, Number(durationMin) || 10));
  return {
    title: `${safeTopic}: Academic Presentation`,
    summary: `A ${safeDuration}-minute ${safeLevel} presentation framework with structured transitions.`,
    audience: `BUEPT ${safeLevel} learners`,
    slides: [
      {
        title: 'Introduction',
        points: [`Define ${safeTopic}`, 'Context in Boğaziçi prep', 'Thesis statement'],
        script: `Today I will discuss ${safeTopic} and why it matters for academic success.`,
        cues: 'Speak slowly and signal your roadmap.',
      },
      {
        title: 'Main Argument',
        points: ['Key concept', 'Evidence', 'Counterpoint'],
        script: `The main argument is that ${safeTopic} improves long-term performance when practice is deliberate.`,
        cues: 'Pause between evidence and interpretation.',
      },
      {
        title: 'Conclusion',
        points: ['Synthesis', 'Practical next step', 'Q&A bridge'],
        script: 'In conclusion, this topic can be applied immediately with structured weekly practice.',
        cues: 'Finish with confidence and invite questions.',
      },
    ],
    source: 'web-local',
    model: '',
  };
}

function buildVideoLessonLocal({ topic = '', level = 'B1', durationMin = 4 } = {}) {
  const safeTopic = String(topic || '').trim() || 'Academic Writing Focus';
  const safeLevel = String(level || 'B1').trim().toUpperCase();
  const totalMin = Math.max(2, Math.min(12, Number(durationMin) || 4));
  const sceneDur = Math.max(30, Math.round((totalMin * 60) / 4));
  return {
    title: `${safeTopic} Lesson`,
    summary: `${safeLevel} micro-lesson storyboard ready for classroom/demo use.`,
    scenes: [
      {
        id: 'scene_1',
        heading: 'Hook',
        bullets: ['Why this matters', 'Common learner mistake', 'Lesson target'],
        narration: `Welcome. In this lesson we focus on ${safeTopic}.`,
        durationSec: sceneDur,
        quiz: 'What is the core skill in this lesson?',
      },
      {
        id: 'scene_2',
        heading: 'Rule',
        bullets: ['Core rule', 'Form', 'Meaning'],
        narration: 'Here is the core rule and how to apply it in BUEPT tasks.',
        durationSec: sceneDur,
        quiz: 'Which form is correct in academic style?',
      },
      {
        id: 'scene_3',
        heading: 'Guided Practice',
        bullets: ['Example 1', 'Example 2', 'Error correction'],
        narration: 'Now let us fix typical errors step by step.',
        durationSec: sceneDur,
        quiz: 'Which error was corrected and why?',
      },
      {
        id: 'scene_4',
        heading: 'Exit Check',
        bullets: ['Quick recap', 'Checklist', 'Next task'],
        narration: 'Great work. Use this checklist before your next writing or speaking task.',
        durationSec: sceneDur,
        quiz: 'What is your next practice action?',
      },
    ],
    source: 'web-local',
    model: '',
  };
}

function buildMistakeCoachLocal({ prompt = '', question = '' } = {}) {
  const q = String(question || '').trim();
  const p = String(prompt || '').trim();
  return {
    explanation: [
      '• Start from the exact rule/evidence line before comparing options.',
      '• Eliminate distractors that are grammatically possible but contextually wrong.',
      '• Check scope words (only, mainly, always, rarely) before final choice.',
      `• Rephrase the correct answer in your own words${q || p ? ' using this exact question context' : ''}.`,
      'Tip: After each mistake, write one “why” sentence to avoid repeating it.',
    ].join('\n'),
    source: 'web-local',
    model: '',
  };
}

function normalizeQuestion(q) {
  if (!q) return null;
  const options = Array.isArray(q.options) ? q.options.map((x) => String(x)) : [];
  const answer = Number.isInteger(q.answer) ? q.answer : Number(q.answer);
  return {
    q: String(q.q || q.question || '').trim(),
    options,
    answer: Number.isFinite(answer) ? answer : null,
    explain: String(q.explain || '').trim(),
    skill: String(q.skill || '').trim(),
  };
}

function filterByLevel(list, level) {
  if (!level) return list;
  const target = String(level).trim().toUpperCase();
  return (list || []).filter((item) => String(item?.level || '').toUpperCase() === target);
}

function localCoachReply(message) {
  const m = String(message || '').toLowerCase();

  if (!m.trim()) {
    return {
      reply: 'Please share your question in English and I will coach you.',
      suggestions: ['Ask a vocabulary question', 'Ask for writing strategy', 'Ask for BUEPT tips'],
    };
  }

  if (m.includes('vocab') || m.includes('word') || m.includes('synonym')) {
    return {
      reply: 'For vocabulary growth: learn word family + collocation + one original sentence. Review after 1 day, 3 days, and 7 days.',
      suggestions: ['Search a target word', 'Open department vocabulary', 'Practice collocations'],
    };
  }

  if (m.includes('writing') || m.includes('essay')) {
    return {
      reply: 'For writing: first make a 4-part skeleton (thesis, argument 1, argument 2, conclusion), then write with clear connectors and one concrete example per body paragraph.',
      suggestions: ['Generate a new writing prompt', 'Write 120+ words', 'Check quick feedback'],
    };
  }

  if (m.includes('reading')) {
    return {
      reply: 'For reading speed: do preview (title + first sentence), then scan keywords in each paragraph, then answer questions using evidence lines.',
      suggestions: ['Load new reading task', 'Focus on inference questions', 'Track unknown words'],
    };
  }

  return {
    reply: 'Good question. I recommend one focused 25-minute session: 10 min grammar, 10 min reading/listening, 5 min vocabulary review.',
    suggestions: ['Ask for a weekly study plan', 'Ask for grammar strategy', 'Ask for speaking tips'],
  };
}

async function localApi(path, options = {}) {
  await ensureLocalCoreLoaded();

  const method = String(options.method || 'GET').toUpperCase();
  const parsed = new URL(path, window.location.origin);
  const pathname = parsed.pathname;

  if (pathname === '/api/status' || pathname === '/api/health') {
    return {
      ok: true,
      service: 'buept-local-web-mode',
      now: new Date().toISOString(),
      roots: {
        projectRoot: 'github-pages',
        appRoot: 'web',
        dataRoot: 'web/data',
      },
    };
  }

  if (pathname === '/api/summary') {
    return {
      ok: true,
      summary: {
        readingCount: state.local.core.readingTasks.length,
        grammarCount: state.local.core.grammarTasks.length,
        writingCount: state.local.core.writingPrompts.length,
        listeningCount: state.local.core.listeningPodcasts.length,
        dictionaryCount: state.local.dictionaryLoaded ? state.local.dictionaryIndex.length : LOCAL_DICTIONARY_COUNT_HINT,
        departmentCount: state.local.core.departmentVocab.length,
      },
    };
  }

  if (pathname === '/api/vocab/random') {
    await ensureLocalDictionaryLoaded();
    return {
      ok: true,
      item: pickRandom(state.local.dictionaryIndex),
    };
  }

  if (pathname === '/api/vocab/search') {
    await ensureLocalDictionaryLoaded();
    const query = String(parsed.searchParams.get('q') || '').trim().toLowerCase();
    if (!query) return { ok: true, query: '', hits: [], total: 0 };

    const exact = state.local.dictionaryByWord.get(query);
    const starts = [];
    const contains = [];

    for (const entry of state.local.dictionaryIndex) {
      const word = String(entry.word || '').toLowerCase();
      if (word === query) continue;
      if (word.startsWith(query)) starts.push(entry);
      else if (word.includes(query)) contains.push(entry);
      if (starts.length >= 20 && contains.length >= 20) break;
    }

    const hits = exact ? [exact, ...starts, ...contains] : [...starts, ...contains];
    return {
      ok: true,
      query,
      hits: hits.slice(0, 25),
      total: hits.length,
    };
  }

  if (pathname === '/api/vocab/departments') {
    const departments = state.local.core.departmentVocab.map((row) => ({
      id: row.id,
      department: row.department,
      wordCount: Array.isArray(row.words) ? row.words.length : 0,
    }));
    return { ok: true, departments };
  }

  if (pathname === '/api/vocab/department') {
    const dep = String(parsed.searchParams.get('department') || parsed.searchParams.get('id') || '').trim().toLowerCase();
    const limit = Math.max(1, Math.min(200, Number(parsed.searchParams.get('limit') || 40)));
    const found = state.local.core.departmentVocab.find((row) => {
      const id = String(row?.id || '').toLowerCase();
      const name = String(row?.department || '').toLowerCase();
      return dep === id || dep === name;
    });

    if (!found) {
      return { ok: false, error: 'DEPARTMENT_NOT_FOUND' };
    }

    return {
      ok: true,
      department: found.department,
      id: found.id,
      words: Array.isArray(found.words) ? found.words.slice(0, limit) : [],
    };
  }

  if (pathname === '/api/reading/random') {
    const level = String(parsed.searchParams.get('level') || '').trim();
    const scoped = filterByLevel(state.local.core.readingTasks, level);
    const task = pickRandom(scoped.length ? scoped : state.local.core.readingTasks);
    return {
      ok: true,
      task: task
        ? {
            id: task.id,
            level: task.level,
            title: task.title,
            time: task.time,
            text: task.text,
            question: normalizeQuestion(pickRandom(task.questions || [])),
          }
        : null,
    };
  }

  if (pathname === '/api/grammar/random') {
    const level = String(parsed.searchParams.get('level') || '').trim();
    const scoped = filterByLevel(state.local.core.grammarTasks, level);
    const task = pickRandom(scoped.length ? scoped : state.local.core.grammarTasks);
    return {
      ok: true,
      task: task
        ? {
            id: task.id,
            level: task.level,
            title: task.title,
            time: task.time,
            explain: task.explain,
            question: normalizeQuestion(pickRandom(task.questions || [])),
          }
        : null,
    };
  }

  if (pathname === '/api/writing/random') {
    const level = String(parsed.searchParams.get('level') || '').trim();
    const scoped = filterByLevel(state.local.core.writingPrompts, level);
    return {
      ok: true,
      prompt: pickRandom(scoped.length ? scoped : state.local.core.writingPrompts),
    };
  }

  if (pathname === '/api/listening/podcasts') {
    return {
      ok: true,
      podcasts: state.local.core.listeningPodcasts,
    };
  }

  if (pathname === '/api/calendar') {
    const schedule = state.local.core.universitySchedule || {};
    return {
      ok: true,
      calendar: {
        meta: schedule.meta || {},
        holidays: Array.isArray(schedule.holidays) ? schedule.holidays.slice(0, 30) : [],
        academicEvents: Array.isArray(schedule.academicEvents) ? schedule.academicEvents.slice(0, 30) : [],
      },
    };
  }

  if (pathname === '/api/apks') {
    return {
      ok: true,
      mode: 'web-static',
      apks: [],
      note: 'APK metadata is available only when web-api-server.js is running.',
    };
  }

  if (pathname === '/api/sync/status') {
    const syncState = getLocalSyncState();
    const snapshot = buildSyncSnapshot(syncState);
    return {
      ok: true,
      service: 'web-local-sync',
      updatedAt: syncState.updatedAt,
      counts: {
        myWords: snapshot.myWords.length,
        unknownWords: snapshot.unknownWords.length,
        customDecks: snapshot.customDecks.length,
        weeklyProgressKeys: Object.keys(snapshot.weeklyProgress || {}).length,
      },
      clients: syncState.clients || {},
    };
  }

  if (pathname === '/api/sync/pull' && method === 'GET') {
    const syncState = getLocalSyncState();
    const snapshot = buildSyncSnapshot(syncState);
    return {
      ok: true,
      updatedAt: syncState.updatedAt,
      state: snapshot,
      miniQuiz: buildMiniQuizFromWords(snapshot.unknownWords || snapshot.myWords || [], 5),
    };
  }

  if (pathname === '/api/sync/push' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    const incoming = body?.state && typeof body.state === 'object' ? body.state : body;
    const clientId = String(body?.clientId || SYNC_CLIENT_ID).trim() || SYNC_CLIENT_ID;
    const syncStore = getLocalSyncState();
    const merged = mergeSyncState(syncStore, incoming, clientId);
    const snapshot = buildSyncSnapshot(merged.merged);
    return {
      ok: true,
      updatedAt: merged.merged.updatedAt,
      touched: merged.touched,
      state: snapshot,
      miniQuiz: buildMiniQuizFromWords(snapshot.unknownWords || snapshot.myWords || [], 5),
    };
  }

  if (pathname === '/api/module' && method === 'POST') {
    await ensureLocalDictionaryLoaded();
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    const kind = String(body.kind || body.key || body.module || '').trim();

    if (kind === 'interactive_dictionary') {
      const term = String(body.term || body.q || '').trim().toLowerCase();
      if (!term) return { ok: false, error: 'TERM_REQUIRED' };
      const exact = state.local.dictionaryByWord.get(term);
      if (!exact) return { ok: false, error: 'TERM_NOT_FOUND' };
      return { ok: true, entry: exact };
    }

    if (kind === 'photo_vocab_extract') {
      const text = String(body.ocrText || body.text || body.ocr || '').trim();
      const limit = Math.max(3, Math.min(24, Number(body.limit) || 10));
      const tokens = uniq(pickEnglishTokens(text, 4));
      const found = [];
      for (const token of tokens) {
        const entry = state.local.dictionaryByWord.get(token);
        if (!entry) continue;
        found.push({
          word: entry.word,
          definition: entry.definition,
          level: entry.level,
          wordType: entry.wordType,
        });
        if (found.length >= limit) break;
      }
      return {
        ok: true,
        extracted: found,
        sourceTextPreview: text.slice(0, 260),
        totalTokens: tokens.length,
      };
    }

    if (kind === 'proficiency_mock') {
      const count = Math.max(4, Math.min(24, Number(body.count) || 10));
      const level = String(body.level || '').trim().toUpperCase();
      const readingPool = filterByLevel(state.local.core.readingTasks, level || undefined);
      const grammarPool = filterByLevel(state.local.core.grammarTasks, level || undefined);
      const questions = [];
      for (let i = 0; i < count; i += 1) {
        const source = i % 2 === 0 ? pickRandom(readingPool.length ? readingPool : state.local.core.readingTasks) : pickRandom(grammarPool.length ? grammarPool : state.local.core.grammarTasks);
        const q = normalizeQuestion(pickRandom(source?.questions || []));
        if (!q) continue;
        questions.push({
          id: `mock-${i + 1}`,
          section: i % 2 === 0 ? 'Reading' : 'Grammar',
          level: source?.level || 'P2',
          q: q.q,
          options: q.options,
          answer: q.answer,
          explain: q.explain,
        });
      }
      return {
        ok: true,
        mock: {
          title: `${level || 'Mixed'} Proficiency Mock`,
          count: questions.length,
          questions,
        },
      };
    }

    if (kind === 'weak_point_analysis') {
      const snapshot = buildSyncSnapshot(getLocalSyncState());
      const unknownCount = Array.isArray(snapshot.unknownWords) ? snapshot.unknownWords.length : 0;
      return {
        ok: true,
        analysis: {
          strengths: ['Daily activity exists', 'Core modules reachable from web'],
          weaknesses: [
            unknownCount > 20 ? 'Vocabulary retention needs urgent review' : 'Vocabulary retention is moderate',
            'Grammar accuracy drops under timed pressure',
            'Speaking fluency decreases when sentence planning is delayed',
          ],
          nextActions: [
            'Do 1 Reading + 1 Grammar timed set today.',
            'Review 20 unknown words with collocations.',
            'Record 2-minute speaking and check filler words.',
          ],
        },
      };
    }

    if (kind === 'academic_writing_template') {
      const topic = String(body.topic || 'Technology and Education');
      const stance = String(body.stance || 'Balanced');
      const level = String(body.level || 'B2').toUpperCase();
      return {
        ok: true,
        template: [
          `Topic: ${topic}`,
          `Stance: ${stance}`,
          '',
          'Introduction:',
          '- Background sentence',
          '- Thesis statement',
          '',
          'Body Paragraph 1:',
          '- Main claim',
          '- Evidence/example',
          '- Link to thesis',
          '',
          'Body Paragraph 2:',
          '- Counterpoint or second argument',
          '- Evidence/example',
          '- Refutation / development',
          '',
          'Conclusion:',
          '- Restate thesis',
          '- Final insight / recommendation',
          '',
          `Level target: ${level}`,
        ].join('\n'),
        source: 'web-local',
      };
    }

    return { ok: false, error: `UNSUPPORTED_MODULE_KIND: ${kind}` };
  }

  if (pathname === '/api/speaking' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    const local = buildSpeakingFeedbackLocal(body.text || body.message || '');
    return {
      ok: true,
      source: 'web-local',
      model: '',
      reply: local.reply,
      transcriptClean: local.transcriptClean,
      metrics: local.metrics,
      timeline: local.timeline,
    };
  }

  if (pathname === '/api/video-lesson' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    return {
      ok: true,
      ...buildVideoLessonLocal({
        topic: body.topic,
        level: body.level,
        durationMin: body.durationMin,
      }),
    };
  }

  if (pathname === '/api/writing-revision' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    return {
      ok: true,
      ...buildWritingRevisionLocal(body.text, body.prompt, body.level, body.task),
    };
  }

  if (pathname === '/api/presentation' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    return {
      ok: true,
      ...buildPresentationLocal({
        topic: body.topic,
        level: body.level,
        durationMin: body.durationMin,
      }),
    };
  }

  if (pathname === '/api/mistake-coach' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    return {
      ok: true,
      ...buildMistakeCoachLocal({
        prompt: body.prompt,
        question: body.question,
      }),
    };
  }

  if (pathname === '/api/chat' && method === 'POST') {
    const body = options?.body ? safeParseJson(options.body, {}) : {};
    const out = localCoachReply(body.message || '');
    return {
      ok: true,
      reply: out.reply,
      suggestions: out.suggestions,
    };
  }

  return { ok: false, error: `LOCAL_ROUTE_NOT_FOUND: ${pathname}` };
}

function resolveRequestUrl(path, base = '') {
  const normalizedBase = normalizeApiBase(base);
  if (!normalizedBase) return path;
  return `${normalizedBase}${path}`;
}

async function remoteApi(path, options = {}, base = '') {
  const target = resolveRequestUrl(path, base);
  const res = await fetch(target, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { ok: false, error: 'INVALID_JSON_RESPONSE', raw: text };
  }

  if (!res.ok || data.ok === false) {
    const err = data.error || `${res.status} ${res.statusText}`;
    throw new Error(err);
  }

  return data;
}

async function api(path, options = {}) {
  if (state.runtimeMode === 'local') {
    const local = await localApi(path, options);
    if (local.ok === false) throw new Error(local.error || 'LOCAL_API_ERROR');
    return local;
  }

  const bases = [];
  if (state.apiBase) bases.push(state.apiBase);
  bases.push('');

  try {
    let lastError = null;
    for (const base of bases) {
      try {
        const data = await remoteApi(path, options, base);
        state.runtimeMode = 'server';
        if (base) {
          state.apiBase = normalizeApiBase(base);
          writeStoredApiBase(state.apiBase);
        }
        updateBackendHint();
        return data;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('REMOTE_API_FAILED');
  } catch (err) {
    state.runtimeMode = 'local';
    updateBackendHint();
    const local = await localApi(path, options);
    if (local.ok === false) throw new Error(local.error || String(err.message || err));
    return local;
  }
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function countWords(text = '') {
  return (String(text).trim().match(/\b[\w'-]+\b/g) || []).length;
}

function normalizeTabName(raw) {
  const text = String(raw || '').trim().toLowerCase();
  const found = TAB_NAMES.find((tab) => tab.toLowerCase() === text);
  return found || 'Home';
}

function getInitialTab() {
  const fromHash = normalizeTabName((window.location.hash || '').replace('#', ''));
  return fromHash || 'Home';
}

function activateTabUI(tab) {
  for (const name of TAB_NAMES) {
    const screenId = TAB_SCREEN_IDS[name];
    const screen = qs(screenId);
    if (screen) {
      screen.classList.toggle('active', name === tab);
    }
  }

  document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
    const isActive = normalizeTabName(btn.getAttribute('data-tab')) === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  state.ui.currentTab = tab;
  if (window.location.hash !== `#${tab.toLowerCase()}`) {
    history.replaceState(null, '', `#${tab.toLowerCase()}`);
  }
}

async function loadTabData(tab, force = false) {
  if (!force && state.ui.loadedTabs.has(tab)) return;

  switch (tab) {
    case 'Home':
      await Promise.allSettled([loadSummary(), loadCalendar(), loadModuleCatalog(), runSyncStatus()]);
      break;
    case 'Reading':
      await loadReading();
      break;
    case 'Grammar':
      await loadGrammar();
      break;
    case 'Writing':
      await loadWritingPrompt();
      break;
    case 'Vocab':
      await Promise.allSettled([loadDepartments(), randomVocab()]);
      break;
    case 'Listening':
      await loadPodcasts();
      break;
    default:
      break;
  }

  state.ui.loadedTabs.add(tab);
}

async function setTab(tab, force = false) {
  const normalized = normalizeTabName(tab);
  activateTabUI(normalized);
  await loadTabData(normalized, force);
}

function updateBackendHint() {
  const modeBadge = qs('modeBadge');
  const backendHint = qs('backendHint');
  const apiBaseInput = qs('apiBaseInput');
  const mode = state.runtimeMode === 'server' ? 'server' : state.runtimeMode === 'local' ? 'browser-local' : 'auto';
  const baseLabel = state.apiBase || '(same-origin / none)';

  if (modeBadge) modeBadge.textContent = `Mode: ${mode}`;
  if (backendHint) backendHint.innerHTML = `API Base: <b>${escapeHtml(baseLabel)}</b> • Tip: run <code>OLLAMA_ENABLED=1 npm run api:start</code> then connect to <code>http://127.0.0.1:8088</code>.`;
  if (apiBaseInput && !apiBaseInput.matches(':focus')) {
    apiBaseInput.value = state.apiBase || '';
  }
}

async function connectApiBase() {
  const input = qs('apiBaseInput');
  const base = normalizeApiBase(input?.value || '');
  if (!base) {
    alert('Please enter a backend URL (example: http://127.0.0.1:8088).');
    return;
  }

  try {
    const status = await remoteApi('/api/status', {}, base);
    state.apiBase = base;
    state.runtimeMode = 'server';
    writeStoredApiBase(base);
    updateBackendHint();
    alert(`Connected to ${base}\nService: ${status.service || 'api'}`);
    await loadTabData(state.ui.currentTab, true);
  } catch (e) {
    alert(`Cannot connect to ${base}\n${e.message}`);
  }
}

function useBrowserFallbackMode() {
  state.apiBase = '';
  writeStoredApiBase('');
  state.runtimeMode = 'local';
  updateBackendHint();
}

async function autoDetectApiBase() {
  const stored = readStoredApiBase();
  const candidates = uniq([
    stored,
    'http://127.0.0.1:8088',
    'http://localhost:8088',
  ]).filter(Boolean);

  for (const base of candidates) {
    try {
      await remoteApi('/api/status', {}, base);
      state.apiBase = base;
      state.runtimeMode = 'server';
      writeStoredApiBase(base);
      updateBackendHint();
      return true;
    } catch (_e) {
      // try next
    }
  }

  state.runtimeMode = 'local';
  updateBackendHint();
  return false;
}

function renderSummary(summary) {
  const root = qs('summaryCards');
  const note = qs('summaryNote');
  const cards = [
    ['Reading Tasks', summary.readingCount],
    ['Grammar Tasks', summary.grammarCount],
    ['Writing Prompts', summary.writingCount],
    ['Listening Pods', summary.listeningCount],
    ['Dictionary Words', summary.dictionaryCount],
    ['Departments', summary.departmentCount],
  ];

  root.innerHTML = cards
    .map(
      ([label, value]) =>
        `<div class="summary-card"><div class="value">${value}</div><div class="label">${escapeHtml(label)}</div></div>`,
    )
    .join('');

  const modeLabel = state.runtimeMode === 'server' ? 'Live API mode' : 'Git static mode';
  note.textContent = `${modeLabel} • BUEPT dataset loaded`;
}

async function loadSummary() {
  try {
    const data = await api('/api/summary');
    renderSummary(data.summary || {});
  } catch (e) {
    qs('summaryNote').textContent = `Summary load failed: ${e.message}`;
  }
}

function renderWordEntry(entry) {
  if (!entry) return '<p class="muted">No entry found.</p>';
  const syn = (entry.synonyms || []).slice(0, 8).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const ant = (entry.antonyms || []).slice(0, 6).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const col = (entry.collocations || []).slice(0, 6).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const ex = (entry.examples || []).slice(0, 2).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const fam = (entry.derivatives || []).slice(0, 6).map((x) => `<span class="pill">${escapeHtml(x)}</span>`).join('');

  return `
    <h3>${escapeHtml(entry.word)} <span class="muted">${escapeHtml(entry.level || '')} ${escapeHtml(entry.wordType || '')}</span></h3>
    <p>${escapeHtml(entry.definition || '-')}</p>
    <p><b>Synonyms:</b> ${syn || '<span class="muted">No synonyms.</span>'}</p>
    <p><b>Antonyms:</b> ${ant || '<span class="muted">No antonyms.</span>'}</p>
    <p><b>Collocations:</b> ${col || '<span class="muted">No collocations.</span>'}</p>
    <p><b>Word Family:</b> ${fam || '<span class="muted">No derivatives.</span>'}</p>
    ${ex ? `<ul>${ex}</ul>` : '<p class="muted">No example sentence.</p>'}
  `;
}

async function searchVocab() {
  const q = qs('vocabQuery').value.trim();
  if (!q) return;

  qs('vocabResult').innerHTML = '<p class="muted">Searching...</p>';
  try {
    const data = await api(`/api/vocab/search?q=${encodeURIComponent(q)}`);
    const first = (data.hits || [])[0];

    if (!first) {
      qs('vocabResult').innerHTML = '<p class="warn">Word not found. Try another spelling.</p>';
      return;
    }

    const rest = (data.hits || []).slice(1, 8).map((x) => `<span class="pill">${escapeHtml(x.word)}</span>`).join('');
    qs('vocabResult').innerHTML = renderWordEntry(first) + (rest ? `<p class="muted">Related: ${rest}</p>` : '');
  } catch (e) {
    qs('vocabResult').innerHTML = `<p class="bad">Search failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function randomVocab() {
  qs('vocabResult').innerHTML = '<p class="muted">Loading random word...</p>';
  try {
    const data = await api('/api/vocab/random');
    qs('vocabResult').innerHTML = renderWordEntry(data.item);
  } catch (e) {
    qs('vocabResult').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function loadDepartments() {
  const select = qs('departmentSelect');
  try {
    const data = await api('/api/vocab/departments');
    const rows = data.departments || [];
    select.innerHTML =
      '<option value="">Select Department</option>' +
      rows.map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.department)} (${r.wordCount})</option>`).join('');
  } catch (_e) {
    select.innerHTML = '<option value="">Departments unavailable</option>';
  }
}

async function loadDepartmentWords() {
  const dep = qs('departmentSelect').value;
  if (!dep) return;

  qs('vocabResult').innerHTML = '<p class="muted">Loading department vocabulary...</p>';
  try {
    const data = await api(`/api/vocab/department?department=${encodeURIComponent(dep)}&limit=60`);
    const words = (data.words || [])
      .slice(0, 20)
      .map((w) => `<li><b>${escapeHtml(w.word)}</b>: ${escapeHtml(w.definition || '-')}</li>`)
      .join('');

    qs('vocabResult').innerHTML = `
      <h3>${escapeHtml(data.department)}</h3>
      <p class="muted">Top 20 useful terms</p>
      <ul>${words}</ul>
    `;
  } catch (e) {
    qs('vocabResult').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`;
  }
}

function renderQuestion(task, type) {
  if (!task || !task.question) return '<p class="muted">No question.</p>';
  const q = task.question;

  const opts = (q.options || [])
    .map((opt, idx) => `<label class="opt"><input type="radio" name="${type}Opt" value="${idx}" /> ${escapeHtml(opt)}</label>`)
    .join('');

  return `
    <h3>${escapeHtml(task.title || '')} <span class="pill">${escapeHtml(task.level || '')}</span></h3>
    ${task.text ? `<p>${escapeHtml(task.text).slice(0, 2600).replace(/\n/g, '<br/>')}</p>` : ''}
    ${task.explain ? `<p class="muted">${escapeHtml(task.explain).slice(0, 800)}</p>` : ''}
    <div class="question">
      <p><b>${escapeHtml(q.q || '')}</b></p>
      ${opts}
      <button class="btn ghost" onclick="checkAnswer('${type}')">Check Answer</button>
      <div id="${type}Feedback" class="muted"></div>
    </div>
  `;
}

window.checkAnswer = function checkAnswer(type) {
  const task = state[type];
  if (!task || !task.question) return;

  const selected = document.querySelector(`input[name="${type}Opt"]:checked`);
  if (!selected) {
    qs(`${type}Feedback`).innerHTML = '<span class="warn">Select an option first.</span>';
    return;
  }

  const selectedIndex = Number(selected.value);
  const correct = task.question.answer;

  if (selectedIndex === correct) {
    qs(`${type}Feedback`).innerHTML = `<span class="good">Correct.</span> ${escapeHtml(task.question.explain || '')}`;
  } else {
    const answerText = (task.question.options || [])[correct] || `Option ${correct + 1}`;
    qs(`${type}Feedback`).innerHTML = `<span class="bad">Not correct.</span> Correct: <b>${escapeHtml(answerText)}</b>. ${escapeHtml(task.question.explain || '')}`;
  }
};

async function loadReading() {
  const level = qs('readingLevel').value;
  qs('readingResult').innerHTML = '<p class="muted">Loading reading task...</p>';

  try {
    const data = await api(`/api/reading/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.reading = data.task;
    qs('readingResult').innerHTML = renderQuestion(state.reading, 'reading');
  } catch (e) {
    qs('readingResult').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function loadGrammar() {
  const level = qs('grammarLevel').value;
  qs('grammarResult').innerHTML = '<p class="muted">Loading grammar task...</p>';

  try {
    const data = await api(`/api/grammar/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.grammar = data.task;
    qs('grammarResult').innerHTML = renderQuestion(state.grammar, 'grammar');
  } catch (e) {
    qs('grammarResult').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function loadWritingPrompt() {
  const level = qs('writingLevel').value;
  qs('writingPrompt').innerHTML = '<p class="muted">Loading prompt...</p>';

  try {
    const data = await api(`/api/writing/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.writing = data.prompt;

    qs('writingPrompt').innerHTML = `
      <h3>${escapeHtml(data.prompt?.topic || 'Writing Prompt')} <span class="pill">${escapeHtml(data.prompt?.level || '')}</span></h3>
      <p>${escapeHtml(data.prompt?.prompt || '')}</p>
      <p class="muted">Type: ${escapeHtml(data.prompt?.type || '')} | Task: ${escapeHtml(data.prompt?.task || '')}</p>
      <div>${(data.prompt?.keywords || []).map((k) => `<span class="pill">${escapeHtml(k)}</span>`).join('')}</div>
    `;
  } catch (e) {
    qs('writingPrompt').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

function writingFeedback() {
  const text = qs('writingInput').value;
  const wc = countWords(text);
  qs('wordCount').textContent = `${wc} words`;

  if (!text.trim()) {
    qs('writingFeedback').innerHTML = '<p class="muted">Write first, then check feedback.</p>';
    return;
  }

  const sentences = text.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;
  const avg = sentences ? Math.round((wc / sentences) * 10) / 10 : wc;
  const connectors = ['however', 'therefore', 'moreover', 'in addition', 'for example', 'on the other hand'];
  const connectorHits = connectors.filter((c) => text.toLowerCase().includes(c)).length;

  let score = 50;
  if (wc >= 120) score += 15;
  if (sentences >= 5) score += 10;
  if (avg >= 10) score += 8;
  if (connectorHits >= 2) score += 10;
  score = Math.min(95, score);

  const tips = [];
  if (wc < 120) tips.push('Increase length to at least 120 words for stronger development.');
  if (sentences < 5) tips.push('Use more complete sentences to structure your argument.');
  if (connectorHits < 2) tips.push('Add transition signals (however, therefore, in addition).');
  if (!tips.length) tips.push('Good baseline. Next step: strengthen precision with topic-specific vocabulary.');

  qs('writingFeedback').innerHTML = `
    <p><b>Quick Score:</b> <span class="good">${score}/100</span></p>
    <p class="muted">Sentences: ${sentences} | Avg words/sentence: ${avg} | Connectors used: ${connectorHits}</p>
    <ul>${tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
  `;
}

async function loadPodcasts() {
  const root = qs('podcasts');
  root.innerHTML = '<p class="muted">Loading podcasts...</p>';

  try {
    const data = await api('/api/listening/podcasts');
    const items = (data.podcasts || [])
      .map(
        (p) => `
      <div class="calendar-item">
        <b>${escapeHtml(p.title)}</b> <span class="pill">${escapeHtml(p.level || '')}</span> <span class="pill">${escapeHtml(p.category || '')}</span>
        <div class="muted">${escapeHtml(p.source || '')} • ${escapeHtml(p.duration || '')}</div>
        <div>${escapeHtml(p.focus || '')}</div>
        <a href="${escapeHtml(p.url || '#')}" target="_blank" rel="noreferrer">Open podcast</a>
      </div>
    `,
      )
      .join('');

    root.innerHTML = `<div class="calendar-list">${items}</div>`;
  } catch (e) {
    root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function loadCalendar() {
  const root = qs('calendar');
  root.innerHTML = '<p class="muted">Loading calendar...</p>';

  try {
    const data = await api('/api/calendar');
    const c = data.calendar || {};
    const meta = c.meta || {};

    const holidays = (c.holidays || [])
      .slice(0, 12)
      .map((h) => {
        if (typeof h === 'string') return `<div class="calendar-item">${escapeHtml(h)}</div>`;
        const date = h.date || h.startDate || h.day || '-';
        const label = h.name || h.title || h.label || JSON.stringify(h);
        return `<div class="calendar-item"><b>${escapeHtml(date)}</b> — ${escapeHtml(label)}</div>`;
      })
      .join('');

    root.innerHTML = `
      <p><b>Term:</b> ${escapeHtml(meta.term || meta.name || 'BUEPT 2025-2026')}</p>
      <p class="muted">Holiday snapshot + schedule data loaded</p>
      <div class="calendar-list">${holidays || '<div class="calendar-item">No holiday list</div>'}</div>
    `;
  } catch (e) {
    root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

function toTitleCaseRoute(routeName = '') {
  const text = String(routeName || '').trim();
  if (!text) return '';
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCategoryByRoute(routeName = '') {
  const r = String(routeName || '').toLowerCase();
  if (/reading|listening|speaking|writing|grammar|vocab|synonym|pronunciation|dictionary|essay/.test(r)) return 'Skills';
  if (/placement|mock|exam|analysis|result|history|progress/.test(r)) return 'Assessment';
  if (/ai|chat|presentation|video|mistake|coach/.test(r)) return 'AI Tools';
  if (/forum|social|community|live|match/.test(r)) return 'Community';
  if (/campus|class|schedule|assignment|curriculum|bogazici/.test(r)) return 'University';
  return 'General';
}

function inferTabByRoute(routeName = '') {
  const r = String(routeName || '').toLowerCase();
  if (/reading/.test(r)) return 'Reading';
  if (/grammar/.test(r)) return 'Grammar';
  if (/writing|essay|feedback|draft/.test(r)) return 'Writing';
  if (/vocab|dictionary|synonym|pronunciation|flashcard/.test(r)) return 'Vocab';
  if (/listening|podcast/.test(r)) return 'Listening';
  if (/speaking|chat|coach|interview/.test(r)) return 'Speaking';
  return 'Home';
}

function normalizeModuleCatalogRows(routes = [], demos = []) {
  const map = new Map();
  const demoList = Array.isArray(demos) ? demos : [];
  const routeList = Array.isArray(routes) ? routes : [];

  routeList.forEach((row) => {
    const route = String(row?.route || '').trim();
    if (!route) return;
    map.set(route, {
      id: route,
      route,
      title: String(row?.title || '').trim() || toTitleCaseRoute(route),
      desc: `Web adapter for mobile route: ${route}`,
      category: inferCategoryByRoute(route),
      source: 'route',
      tags: [route],
      badge: null,
    });
  });

  demoList.forEach((row) => {
    const route = String(row?.route || '').trim();
    if (!route) return;
    const prev = map.get(route) || {
      id: route,
      route,
      title: toTitleCaseRoute(route),
      desc: '',
      category: inferCategoryByRoute(route),
      source: 'demo',
      tags: [],
      badge: null,
    };
    map.set(route, {
      ...prev,
      id: String(row?.id || prev.id),
      title: String(row?.title || prev.title || toTitleCaseRoute(route)),
      desc: String(row?.desc || prev.desc || `Web adapter for ${route}`),
      category: String(row?.category || prev.category || inferCategoryByRoute(route)),
      source: 'demo',
      tags: uniq([...(prev.tags || []), ...(row?.tags || []), route]),
      badge: row?.badge || prev.badge || null,
      color: row?.color || prev.color || '',
    });
  });

  return Array.from(map.values()).sort((a, b) => String(a.title).localeCompare(String(b.title)));
}

function getFilteredModules() {
  const q = String(state.moduleFilter.query || '').trim().toLowerCase();
  const category = String(state.moduleFilter.category || 'all');
  return state.modules.filter((item) => {
    if (category !== 'all' && String(item.category || '').toLowerCase() !== category.toLowerCase()) return false;
    if (!q) return true;
    const hay = `${item.title} ${item.route} ${item.desc} ${(item.tags || []).join(' ')}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderModuleCatalog() {
  const root = qs('moduleCatalog');
  const stats = qs('moduleStats');
  if (!root || !stats) return;

  const filtered = getFilteredModules();
  const total = state.modules.length;
  const byCategory = state.modules.reduce((acc, row) => {
    const key = String(row.category || 'General');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const summary = Object.keys(byCategory)
    .sort((a, b) => a.localeCompare(b))
    .map((cat) => `${cat}: ${byCategory[cat]}`)
    .join(' • ');

  stats.textContent = `${filtered.length}/${total} modules shown • ${summary}`;

  if (!filtered.length) {
    root.innerHTML = '<p class="muted">No modules match your filter.</p>';
    return;
  }

  root.innerHTML = filtered
    .map((item) => {
      const tags = (item.tags || []).slice(0, 3).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('');
      const badge = item.badge ? `<span class="badge">${escapeHtml(item.badge)}</span>` : '';
      return `
        <article class="module-card">
          <h4>${escapeHtml(item.title)}</h4>
          <div class="module-badges">
            <span class="badge">${escapeHtml(item.category || 'General')}</span>
            <span class="badge">${escapeHtml(item.route)}</span>
            ${badge}
            ${tags}
          </div>
          <p>${escapeHtml(item.desc || 'No description')}</p>
          <div class="module-actions">
            <button class="btn" data-open-module="${escapeHtml(item.route)}">Open</button>
            <button class="btn ghost" data-jump-module-tab="${escapeHtml(inferTabByRoute(item.route))}">Jump Tab</button>
          </div>
        </article>
      `;
    })
    .join('');

  root.querySelectorAll('[data-open-module]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.getAttribute('data-open-module');
      openModuleAdapter(route);
    });
  });

  root.querySelectorAll('[data-jump-module-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-jump-module-tab');
      setTab(tab);
    });
  });
}

function renderSimpleQuestionList(questions = []) {
  const rows = (Array.isArray(questions) ? questions : []).slice(0, 5);
  if (!rows.length) return '<p class="muted">No question list generated.</p>';
  return `<ol class="question-list">${rows.map((q) => `<li>${escapeHtml(q.q || q.question || '')}</li>`).join('')}</ol>`;
}

async function openModuleAdapter(route) {
  const root = qs('moduleResult');
  const normalized = String(route || '').trim();
  if (!normalized || !root) return;
  root.innerHTML = `<p class="muted">Loading ${escapeHtml(normalized)}...</p>`;
  await setTab(inferTabByRoute(normalized));

  try {
    const kind = MODULE_KIND_BY_ROUTE[normalized];
    if (!kind) {
      root.innerHTML = `
        <h3>${escapeHtml(toTitleCaseRoute(normalized))}</h3>
        <p>This module is available in the web hub as a mapped route.</p>
        <p class="muted">Fallback action: switched you to <b>${escapeHtml(inferTabByRoute(normalized))}</b> tab.</p>
      `;
      return;
    }

    if (kind === 'interactive_dictionary') {
      const data = await api('/api/module', {
        method: 'POST',
        body: JSON.stringify({ kind, term: 'analysis' }),
      });
      root.innerHTML = `
        <h3>${escapeHtml(toTitleCaseRoute(normalized))}</h3>
        <p class="muted">Mapped to interactive dictionary engine.</p>
        ${renderWordEntry(data.entry)}
      `;
      return;
    }

    if (kind === 'photo_vocab_extract') {
      const data = await api('/api/module', {
        method: 'POST',
        body: JSON.stringify({
          kind,
          ocrText: 'The methodology and analysis in this experiment improved reliability and validity of the outcome.',
          limit: 8,
        }),
      });
      const list = (data.extracted || []).map((x) => `<li><b>${escapeHtml(x.word)}</b>: ${escapeHtml(x.definition || '-')}</li>`).join('');
      root.innerHTML = `
        <h3>${escapeHtml(toTitleCaseRoute(normalized))}</h3>
        <p class="muted">Mapped to photo vocab extraction.</p>
        <ul>${list || '<li>No words extracted.</li>'}</ul>
      `;
      return;
    }

    if (kind === 'proficiency_mock') {
      const data = await api('/api/module', {
        method: 'POST',
        body: JSON.stringify({ kind, count: 8, level: 'P2' }),
      });
      root.innerHTML = `
        <h3>${escapeHtml(data.mock?.title || 'Mock')}</h3>
        <p class="muted">Mapped to proficiency mock generator.</p>
        ${renderSimpleQuestionList(data.mock?.questions || [])}
      `;
      return;
    }

    if (kind === 'weak_point_analysis') {
      const data = await api('/api/module', {
        method: 'POST',
        body: JSON.stringify({ kind }),
      });
      root.innerHTML = `
        <h3>Weak Point Analysis</h3>
        <p><b>Strengths</b></p>
        <ul>${(data.analysis?.strengths || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
        <p><b>Weaknesses</b></p>
        <ul>${(data.analysis?.weaknesses || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
        <p><b>Next Actions</b></p>
        <ul>${(data.analysis?.nextActions || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      `;
      return;
    }

    if (kind === 'academic_writing_template') {
      const data = await api('/api/module', {
        method: 'POST',
        body: JSON.stringify({
          kind,
          topic: 'Should AI tools be integrated into preparatory English classes?',
          level: 'B2',
          stance: 'Balanced',
        }),
      });
      root.innerHTML = `
        <h3>${escapeHtml(toTitleCaseRoute(normalized))}</h3>
        <p class="muted">Mapped to academic writing template engine.</p>
        <pre>${escapeHtml(data.template || '')}</pre>
      `;
      return;
    }
  } catch (e) {
    root.innerHTML = `<p class="bad">Module failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function loadModuleCatalog() {
  try {
    const [routes, demos] = await Promise.all([
      loadJsonAsset('app_routes.json'),
      loadJsonAsset('demo_modules.json'),
    ]);
    state.modules = normalizeModuleCatalogRows(routes, demos);

    const categorySelect = qs('moduleCategory');
    if (categorySelect) {
      const categories = uniq(state.modules.map((x) => x.category)).sort((a, b) => a.localeCompare(b));
      categorySelect.innerHTML = '<option value="all">All Categories</option>' + categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
    }

    renderModuleCatalog();
  } catch (e) {
    const stats = qs('moduleStats');
    const root = qs('moduleCatalog');
    if (stats) stats.textContent = 'Module catalog could not be loaded.';
    if (root) root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function runAiWritingRevision() {
  const result = qs('aiWritingRevisionResult');
  const text = qs('writingInput').value.trim();
  const prompt = state.writing?.prompt || state.writing?.topic || '';
  if (!text) {
    result.innerHTML = '<p class="warn">Write a draft first.</p>';
    return;
  }

  result.innerHTML = '<p class="muted">Running revision...</p>';
  try {
    const data = await api('/api/writing-revision', {
      method: 'POST',
      body: JSON.stringify({
        text,
        prompt,
        level: qs('writingLevel').value || 'B2',
        task: 'essay',
      }),
    });
    result.innerHTML = `
      <p><b>Summary:</b> ${escapeHtml(data.summary || '-')}</p>
      <p><b>Revised Text:</b></p>
      <p>${escapeHtml(data.revisedText || '').replace(/\n/g, '<br/>')}</p>
      <p><b>Strengths</b></p>
      <ul>${(data.strengths || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <p><b>Fixes</b></p>
      <ul>${(data.fixes || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <p><b>Rubric Notes</b></p>
      <ul>${(data.rubricNotes || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <p class="muted">Source: ${escapeHtml(data.source || state.runtimeMode)}</p>
    `;
  } catch (e) {
    result.innerHTML = `<p class="bad">Revision failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function runSpeakingEvaluation() {
  const text = qs('speakingInput').value.trim();
  const root = qs('speakingFeedback');
  if (!text) {
    root.innerHTML = '<p class="warn">Paste transcript text first.</p>';
    return;
  }
  root.innerHTML = '<p class="muted">Analyzing speaking sample...</p>';
  try {
    const data = await api('/api/speaking', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    const timeline = (data.timeline || []).map((t) => `<li>${escapeHtml(t.segment)}: <b>${escapeHtml(String(t.score))}</b></li>`).join('');
    root.innerHTML = `
      <p><b>Coach:</b> ${escapeHtml(data.reply || '-')}</p>
      <p class="muted">Words: ${escapeHtml(String(data.metrics?.wordCount || 0))} • Fillers: ${escapeHtml(String(data.metrics?.fillerCount || 0))} • Fluency: ${escapeHtml(String(data.metrics?.fluency || '-'))}/100</p>
      <p><b>Clean Transcript:</b></p>
      <p>${escapeHtml(data.transcriptClean || text)}</p>
      <p><b>Fluency Timeline</b></p>
      <ul>${timeline}</ul>
    `;
  } catch (e) {
    root.innerHTML = `<p class="bad">Speaking analysis failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function generatePresentation() {
  const topic = qs('presentationTopic').value.trim();
  const level = qs('presentationLevel').value;
  const durationMin = Number(qs('presentationDuration').value || 10);
  const root = qs('presentationResult');
  root.innerHTML = '<p class="muted">Generating presentation...</p>';
  try {
    const data = await api('/api/presentation', {
      method: 'POST',
      body: JSON.stringify({ topic, level, durationMin }),
    });
    root.innerHTML = `
      <h3>${escapeHtml(data.title || 'Presentation')}</h3>
      <p>${escapeHtml(data.summary || '')}</p>
      <ul>${(data.slides || []).map((s, i) => `<li><b>Slide ${i + 1}:</b> ${escapeHtml(s.title)} — ${(s.points || []).map((x) => escapeHtml(x)).join('; ')}</li>`).join('')}</ul>
      <p class="muted">Source: ${escapeHtml(data.source || state.runtimeMode)}</p>
    `;
  } catch (e) {
    root.innerHTML = `<p class="bad">Presentation failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function generateVideoLesson() {
  const topic = qs('videoTopic').value.trim();
  const level = qs('videoLevel').value;
  const durationMin = Number(qs('videoDuration').value || 4);
  const root = qs('videoLessonResult');
  root.innerHTML = '<p class="muted">Generating lesson storyboard...</p>';
  try {
    const data = await api('/api/video-lesson', {
      method: 'POST',
      body: JSON.stringify({ topic, level, durationMin }),
    });
    root.innerHTML = `
      <h3>${escapeHtml(data.title || 'Video Lesson')}</h3>
      <p>${escapeHtml(data.summary || '')}</p>
      <ul>${(data.scenes || []).map((s) => `<li><b>${escapeHtml(s.heading || s.id || '')}</b>: ${escapeHtml((s.bullets || []).join(' • '))}</li>`).join('')}</ul>
      <p class="muted">Source: ${escapeHtml(data.source || state.runtimeMode)}</p>
    `;
  } catch (e) {
    root.innerHTML = `<p class="bad">Video lesson failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function generateMistakeCoach() {
  const prompt = qs('mistakePrompt').value.trim();
  const root = qs('mistakeCoachResult');
  if (!prompt) {
    root.innerHTML = '<p class="warn">Add a wrong question/answer first.</p>';
    return;
  }
  root.innerHTML = '<p class="muted">Analyzing mistake...</p>';
  try {
    const data = await api('/api/mistake-coach', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    const out = data.explanation || data.reply || '';
    root.innerHTML = `<p>${escapeHtml(out).replace(/\n/g, '<br/>')}</p><p class="muted">Source: ${escapeHtml(data.source || state.runtimeMode)}</p>`;
  } catch (e) {
    root.innerHTML = `<p class="bad">Mistake coach failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function runSyncStatus() {
  const root = qs('syncResult');
  root.innerHTML = '<p class="muted">Checking sync status...</p>';
  try {
    const data = await api('/api/sync/status');
    root.innerHTML = `
      <p><b>Service:</b> ${escapeHtml(data.service || 'sync')}</p>
      <p><b>Updated:</b> ${escapeHtml(data.updatedAt || '-')}</p>
      <p class="muted">myWords: ${escapeHtml(String(data.counts?.myWords || 0))} • unknownWords: ${escapeHtml(String(data.counts?.unknownWords || 0))} • decks: ${escapeHtml(String(data.counts?.customDecks || 0))}</p>
    `;
  } catch (e) {
    root.innerHTML = `<p class="bad">Sync status failed: ${escapeHtml(e.message)}</p>`;
  }
}

function renderMiniQuiz(root, quiz = []) {
  if (!root) return;
  if (!Array.isArray(quiz) || !quiz.length) {
    root.innerHTML = '<p class="muted">No mini quiz available yet.</p>';
    return;
  }
  root.innerHTML = `
    <p><b>Mini Quiz from Synced Words</b></p>
    <ol class="question-list">${quiz.map((q) => `<li>${escapeHtml(q.q || '')}</li>`).join('')}</ol>
  `;
}

async function runSyncPull() {
  const root = qs('syncResult');
  const quizRoot = qs('syncMiniQuiz');
  root.innerHTML = '<p class="muted">Pulling sync state...</p>';
  try {
    const data = await api('/api/sync/pull');
    const stateSnap = data.state || {};
    root.innerHTML = `
      <p><b>Pulled at:</b> ${escapeHtml(data.updatedAt || '-')}</p>
      <p class="muted">myWords: ${escapeHtml(String((stateSnap.myWords || []).length))} • unknownWords: ${escapeHtml(String((stateSnap.unknownWords || []).length))} • customDecks: ${escapeHtml(String((stateSnap.customDecks || []).length))}</p>
    `;
    renderMiniQuiz(quizRoot, data.miniQuiz || []);
  } catch (e) {
    root.innerHTML = `<p class="bad">Sync pull failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function runSyncPush() {
  const root = qs('syncResult');
  const quizRoot = qs('syncMiniQuiz');
  root.innerHTML = '<p class="muted">Pushing demo sync payload...</p>';

  const payload = {
    clientId: SYNC_CLIENT_ID,
    state: {
      myWords: ['resilience', 'cohesion', 'mitigate', 'coherent argument'],
      unknownWords: ['substantiate', 'feasible', 'plausible', 'counterargument', 'pragmatic'],
      vocabStats: { reviewedToday: 12, streakDays: 5 },
      customDecks: [{ name: 'BUEPT Week Focus', count: 20 }],
      weeklyProgress: { week1: { done: 5, total: 7 }, week2: { done: 2, total: 7 } },
    },
  };

  try {
    const data = await api('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    root.innerHTML = `
      <p><b>Sync push completed.</b></p>
      <p class="muted">Touched fields: ${(data.touched || []).map((x) => escapeHtml(x)).join(', ') || '-'}</p>
    `;
    renderMiniQuiz(quizRoot, data.miniQuiz || []);
  } catch (e) {
    root.innerHTML = `<p class="bad">Sync push failed: ${escapeHtml(e.message)}</p>`;
  }
}

function saveListeningPrediction() {
  const input = qs('listeningPrediction').value.trim();
  const root = qs('listeningPredictionResult');
  if (!input) {
    root.innerHTML = '<p class="warn">Write a prediction first.</p>';
    return;
  }
  const ts = new Date().toLocaleString();
  root.innerHTML = `<p><b>Saved Prediction (${escapeHtml(ts)}):</b> ${escapeHtml(input)}</p><p class="muted">After listening, compare this with the transcript to train inference accuracy.</p>`;
}

function appendChat(role, text) {
  const log = qs('chatLog');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = escapeHtml(text).replace(/\n/g, '<br/>');
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function sendChat() {
  const input = qs('chatInput');
  const message = input.value.trim();
  if (!message) return;

  appendChat('user', message);
  input.value = '';

  try {
    const data = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    appendChat('bot', data.reply || 'No reply.');
    if (Array.isArray(data.suggestions) && data.suggestions.length) {
      appendChat('bot', `Suggestions: ${data.suggestions.join(' | ')}`);
    }
  } catch (e) {
    appendChat('bot', `Error: ${e.message}`);
  }
}

function bind() {
  qs('connectApi').addEventListener('click', connectApiBase);
  qs('useBrowserLocal').addEventListener('click', useBrowserFallbackMode);
  qs('apiBaseInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      connectApiBase();
    }
  });
  qs('refreshSummary').addEventListener('click', async () => {
    await loadTabData(state.ui.currentTab, true);
  });
  qs('apiStatus').addEventListener('click', async () => {
    try {
      const status = await api('/api/status');
      alert(`Mode: ${state.runtimeMode}\nService: ${status.service}\nTime: ${status.now}`);
    } catch (e) {
      alert(`Status check failed: ${e.message}`);
    }
  });
  qs('searchVocab').addEventListener('click', searchVocab);
  qs('randomVocab').addEventListener('click', randomVocab);
  qs('loadDepartmentWords').addEventListener('click', loadDepartmentWords);
  qs('vocabQuery').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchVocab();
  });

  qs('nextReading').addEventListener('click', loadReading);
  qs('nextGrammar').addEventListener('click', loadGrammar);
  qs('nextWriting').addEventListener('click', loadWritingPrompt);
  qs('aiWritingRevision').addEventListener('click', runAiWritingRevision);
  qs('speakingEvaluate').addEventListener('click', runSpeakingEvaluation);
  qs('generatePresentation').addEventListener('click', generatePresentation);
  qs('generateVideoLesson').addEventListener('click', generateVideoLesson);
  qs('generateMistakeCoach').addEventListener('click', generateMistakeCoach);
  qs('syncStatusBtn').addEventListener('click', runSyncStatus);
  qs('syncPullBtn').addEventListener('click', runSyncPull);
  qs('syncPushBtn').addEventListener('click', runSyncPush);
  qs('saveListeningPrediction').addEventListener('click', saveListeningPrediction);
  qs('reloadModules').addEventListener('click', loadModuleCatalog);
  qs('moduleSearch').addEventListener('input', (e) => {
    state.moduleFilter.query = String(e.target.value || '');
    renderModuleCatalog();
  });
  qs('moduleCategory').addEventListener('change', (e) => {
    state.moduleFilter.category = String(e.target.value || 'all');
    renderModuleCatalog();
  });

  qs('writingInput').addEventListener('input', () => {
    qs('wordCount').textContent = `${countWords(qs('writingInput').value)} words`;
  });

  qs('quickWritingFeedback').addEventListener('click', writingFeedback);
  qs('chatSend').addEventListener('click', sendChat);
  qs('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });

  document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTab(btn.getAttribute('data-tab'));
    });
  });

  document.querySelectorAll('.quick-tile[data-jump-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTab(btn.getAttribute('data-jump-tab'));
    });
  });
}

async function init() {
  state.apiBase = readStoredApiBase();
  bind();
  updateBackendHint();
  appendChat('bot', 'Coach is ready. Ask in English for strategy, vocabulary, grammar, or writing help.');
  qs('presentationTopic').value = 'How sleep quality affects academic performance';
  qs('videoTopic').value = 'Word formation strategies for BUEPT';
  qs('mistakePrompt').value = 'Question: Governments restrict social media before elections. My answer was option B, but it was wrong. Explain why.';
  await autoDetectApiBase();

  await setTab(getInitialTab());
}

init();
