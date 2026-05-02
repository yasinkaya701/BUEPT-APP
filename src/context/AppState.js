import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState as RNAppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildYS9Report } from '../utils/ys9Mock';
import { getWordEntry } from '../utils/dictionary';
import { loadUserWords, saveUserWords, loadUnknownWords, saveUnknownWords, loadVocabStats, saveVocabStats } from '../utils/storage';
import { resolveApiEndpoint, setRuntimeApiAccessConfig } from '../utils/runtimeApi';
import { scoreWritingRubric } from '../utils/rubricScoring';
import {
  loadAiAccessConfig,
  loadFavorites,
  loadHistory,
  loadLevel,
  loadWritingEngine,
  loadMockHistory,
  loadReadingHistory,
  loadListeningHistory,
  loadGrammarHistory,
  loadScreenTime,
  loadXP,
  loadWeeklyVocabProgress,
  saveFavorites,
  saveHistory,
  saveAiAccessConfig,
  saveLevel,
  saveWritingEngine,
  saveMockHistory,
  saveReadingHistory,
  saveListeningHistory,
  saveGrammarHistory,
  saveScreenTime,
  saveXP,
  saveWeeklyVocabProgress,
} from '../utils/appStorage';
import { createReviewItem } from '../utils/srs';
import { calculateXpForAction } from '../utils/gamification';
import { isVocabCloudSyncEnabled, pingVocabCloudSync, pullVocabCloudSync, pushVocabCloudSync } from '../utils/vocabCloudSync';

const STORAGE_ERROR_WORDS = '@buept_error_words';
const STORAGE_GRAMMAR_ERRORS = '@buept_grammar_errors';
const STORAGE_DEMO_SEEDED = '@buept_demo_seeded_v1';
const STORAGE_USER_PROFILE = '@buept_user_profile_v1';
const SCREEN_TIME_TICK_SECONDS = 5;
const SCREEN_TIME_PERSIST_MS = 15000;
async function loadErrorWords() { try { const v = await AsyncStorage.getItem(STORAGE_ERROR_WORDS); return v ? JSON.parse(v) : {}; } catch { return {}; } }
async function saveErrorWords(d) { try { await AsyncStorage.setItem(STORAGE_ERROR_WORDS, JSON.stringify(d)); } catch { } }
async function loadGrammarErrors() { try { const v = await AsyncStorage.getItem(STORAGE_GRAMMAR_ERRORS); return v ? JSON.parse(v) : {}; } catch { return {}; } }
async function saveGrammarErrors(d) { try { await AsyncStorage.setItem(STORAGE_GRAMMAR_ERRORS, JSON.stringify(d)); } catch { } }

const STORAGE_CUSTOM_DECKS = '@buept_custom_decks_v1';
async function loadCustomDecks() { try { const v = await AsyncStorage.getItem(STORAGE_CUSTOM_DECKS); return v ? JSON.parse(v) : []; } catch { return []; } }
async function saveCustomDecks(d) { try { await AsyncStorage.setItem(STORAGE_CUSTOM_DECKS, JSON.stringify(d)); } catch { } }

async function loadUserProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function saveUserProfile(profile) {
  try {
    if (profile) await AsyncStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(profile));
    else await AsyncStorage.removeItem(STORAGE_USER_PROFILE);
  } catch { }
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeWordKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z'-]/g, '');
}

function uniqueTextList(values = [], forceLowercase = false) {
  const list = Array.isArray(values) ? values : [values];
  const seen = new Set();
  const output = [];
  list.forEach((raw) => {
    const text = String(raw || '').trim();
    if (!text) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    output.push(forceLowercase ? key : text);
  });
  return output;
}

function normalizeWordEntry(rawEntry = null) {
  const entry = typeof rawEntry === 'string' ? { word: rawEntry } : rawEntry;
  if (!entry || typeof entry !== 'object') return null;
  const word = normalizeWordKey(entry?.word || entry?.sourceText || entry?.term || '');
  if (!word) return null;

  const sources = uniqueTextList([
    ...(Array.isArray(entry?.sources) ? entry.sources : []),
    entry?.source,
  ]);

  const inferredModules = sources
    .map((source) => {
      const lower = String(source || '').toLowerCase();
      if (lower.includes('listen')) return 'listening';
      return '';
    })
    .filter(Boolean);

  const sourceModules = uniqueTextList([
    ...(Array.isArray(entry?.sourceModules) ? entry.sourceModules : []),
    entry?.sourceModule,
    entry?.module,
    ...inferredModules,
  ], true);

  const sourceModule = String(entry?.sourceModule || sourceModules[0] || '').trim().toLowerCase();

  return {
    ...(entry || {}),
    word,
    synonyms: uniqueTextList(Array.isArray(entry?.synonyms) ? entry.synonyms : []),
    antonyms: uniqueTextList(Array.isArray(entry?.antonyms) ? entry.antonyms : []),
    sources,
    source: sources[0] || '',
    sourceModules,
    sourceModule,
  };
}

function mergeWordEntries(local = [], remote = []) {
  const merged = new Map();
  [...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])].forEach((rawEntry) => {
    const normalized = normalizeWordEntry(rawEntry);
    if (!normalized?.word) return;

    const existing = merged.get(normalized.word);
    if (!existing) {
      merged.set(normalized.word, normalized);
      return;
    }

    const sources = uniqueTextList([
      ...(Array.isArray(existing?.sources) ? existing.sources : []),
      ...(Array.isArray(normalized?.sources) ? normalized.sources : []),
      existing?.source,
      normalized?.source,
    ]);
    const sourceModules = uniqueTextList([
      ...(Array.isArray(existing?.sourceModules) ? existing.sourceModules : []),
      ...(Array.isArray(normalized?.sourceModules) ? normalized.sourceModules : []),
      existing?.sourceModule,
      normalized?.sourceModule,
    ], true);

    merged.set(normalized.word, {
      ...existing,
      ...normalized,
      word: normalized.word,
      synonyms: uniqueTextList([
        ...(Array.isArray(existing?.synonyms) ? existing.synonyms : []),
        ...(Array.isArray(normalized?.synonyms) ? normalized.synonyms : []),
      ]),
      antonyms: uniqueTextList([
        ...(Array.isArray(existing?.antonyms) ? existing.antonyms : []),
        ...(Array.isArray(normalized?.antonyms) ? normalized.antonyms : []),
      ]),
      sources,
      source: normalized.source || existing.source || sources[0] || '',
      sourceModules,
      sourceModule: normalized.sourceModule || existing.sourceModule || sourceModules[0] || '',
    });
  });
  return Array.from(merged.values());
}

function mergeVocabStats(local = {}, remote = {}) {
  const next = {};
  const keys = new Set([
    ...Object.keys(local && typeof local === 'object' ? local : {}),
    ...Object.keys(remote && typeof remote === 'object' ? remote : {}),
  ]);
  keys.forEach((rawWord) => {
    const word = normalizeWordKey(rawWord);
    if (!word) return;
    const localStat = local?.[rawWord] || local?.[word] || {};
    const remoteStat = remote?.[rawWord] || remote?.[word] || {};
    const known = Math.max(Number(localStat?.known || 0), Number(remoteStat?.known || 0));
    const unknown = Math.max(Number(localStat?.unknown || 0), Number(remoteStat?.unknown || 0));
    if (!known && !unknown) return;
    next[word] = { known, unknown };
  });
  return next;
}

function mergeDecks(local = [], remote = []) {
  const map = new Map();
  [...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])].forEach((deck) => {
    const title = String(deck?.title || '').trim().toLowerCase();
    const id = String(deck?.id || '').trim();
    const key = id || title;
    if (!key) return;
    if (!map.has(key)) map.set(key, deck);
  });
  return Array.from(map.values());
}

function mergeWeeklyProgress(local = {}, remote = {}) {
  const localWeekStats = local?.weekStats && typeof local.weekStats === 'object' ? local.weekStats : {};
  const remoteWeekStats = remote?.weekStats && typeof remote.weekStats === 'object' ? remote.weekStats : {};
  const localCount = Object.keys(localWeekStats).length;
  const remoteCount = Object.keys(remoteWeekStats).length;
  return remoteCount > localCount ? { ...local, ...remote, weekStats: remoteWeekStats } : { ...remote, ...local, weekStats: { ...remoteWeekStats, ...localWeekStats } };
}

function areWordListsEqual(a = [], b = []) {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  if (left.length !== right.length) return false;

  const toSignature = (entry) => {
    const normalized = normalizeWordEntry(entry);
    if (!normalized?.word) return '';
    return [
      normalized.word,
      normalized.updatedAt || '',
      (normalized.synonyms || []).length,
      (normalized.antonyms || []).length,
      (normalized.sources || []).length,
      (normalized.sourceModules || []).length,
    ].join('|');
  };

  const sigA = new Set(left.map(toSignature).filter(Boolean));
  if (sigA.size !== left.length) return false;
  for (const item of right) {
    const signature = toSignature(item);
    if (!signature || !sigA.has(signature)) return false;
  }
  return true;
}

function areStatsEqual(a = {}, b = {}) {
  const left = a && typeof a === 'object' ? a : {};
  const right = b && typeof b === 'object' ? b : {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const rawKey of keys) {
    const key = normalizeWordKey(rawKey);
    if (!key) continue;
    const lv = left[rawKey] || left[key] || {};
    const rv = right[rawKey] || right[key] || {};
    if (Number(lv.known || 0) !== Number(rv.known || 0)) return false;
    if (Number(lv.unknown || 0) !== Number(rv.unknown || 0)) return false;
  }
  return true;
}

function areDecksEqual(a = [], b = []) {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  if (left.length !== right.length) return false;
  const signature = (deck) => [
    String(deck?.id || '').trim(),
    String(deck?.title || '').trim().toLowerCase(),
    Array.isArray(deck?.words) ? deck.words.length : 0,
    String(deck?.updatedAt || ''),
  ].join('|');
  const sigA = new Set(left.map(signature));
  for (const deck of right) {
    if (!sigA.has(signature(deck))) return false;
  }
  return true;
}

function deriveAcademicFocus(profile = null) {
  const faculty = String(profile?.faculty || '').trim();
  return faculty || 'General';
}

function buildDemoProfile() {
  return {
    name: 'Demo Student',
    email: 'demo@buept.app',
    faculty: 'General',
    role: 'Demo Student',
    mode: 'demo',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

function normalizeAiConfig(config = {}) {
  const mode = String(config?.mode || 'hosted').trim().toLowerCase() === 'custom' ? 'custom' : 'hosted';
  const baseUrl = String(config?.baseUrl || '').trim().replace(/\/+$/, '');
  return {
    mode,
    baseUrl,
    provider: String(config?.provider || 'ollama').trim(),
    apiKey: String(config?.apiKey || '').trim(),
    ollamaUrl: String(config?.ollamaUrl || 'http://localhost:11434').trim(),
    ollamaModel: String(config?.ollamaModel || 'dolphin-llama3:8b').trim(),
    label: String(config?.label || (mode === 'custom' ? 'Custom AI Endpoint' : 'Hosted BUEPT AI')).trim() || 'Hosted BUEPT AI',
  };
}

const AppStateContext = createContext(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}


const STORAGE_AUTH_TOKEN = '@buept_auth_token';
async function loadAuthToken() { try { return await AsyncStorage.getItem(STORAGE_AUTH_TOKEN); } catch { return null; } }
async function saveAuthToken(t) { try { if (t) await AsyncStorage.setItem(STORAGE_AUTH_TOKEN, t); else await AsyncStorage.removeItem(STORAGE_AUTH_TOKEN); } catch { } }

export function AppStateProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [academicFocus, setAcademicFocus] = useState('General'); // Tied to Signup
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [postAuthRoute, setPostAuthRoute] = useState(null);
  const postAuthRouteRef = useRef(null);

  const [level, setLevel] = useState('P2');
  const [writingEngine, setWritingEngine] = useState('online');
  const [aiReady, setAiReady] = useState(false);
  const [aiAccessConfig, setAiAccessConfig] = useState(() => normalizeAiConfig());
  const [essayText, setEssayText] = useState('');
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [mockHistory, setMockHistory] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [grammarHistory, setGrammarHistory] = useState([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [ttsConfig, setTtsConfig] = useState({
    useExperimental: Platform.OS === 'web',
    rate: 0.55,
    voiceId: '',
  });
  const [screenTime, setScreenTime] = useState({ date: null, seconds: 0 });
  const screenTimeRef = useRef({ date: null, seconds: 0 });
  const lastScreenTimePersistRef = useRef(0);
  const appStateRef = useRef(RNAppState.currentState);
  const timerRef = useRef(null);
  const [userWords, setUserWords] = useState([]);
  const [unknownWords, setUnknownWords] = useState([]);
  const [vocabStats, setVocabStats] = useState({});
  const [favoritePrompts, setFavoritePrompts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [errorWords, setErrorWords] = useState({});
  const [grammarErrors, setGrammarErrors] = useState({});
  const [xp, setXp] = useState(0);
  const [customDecks, setCustomDecks] = useState([]);
  const userWordsRef = useRef([]);
  const unknownWordsRef = useRef([]);
  const vocabStatsRef = useRef({});
  const customDecksRef = useRef([]);
  const syncBusyRef = useRef(false);
  const syncDebounceRef = useRef(null);
  const localSyncDirtyRef = useRef(false);
  const remoteSyncStampRef = useRef('');
  const syncEnabled = useMemo(() => isVocabCloudSyncEnabled(), []);

  const applyDemoData = useCallback(async () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const demoReading = [
      { id: `r-${now}`, createdAt: new Date(now - day).toISOString(), result: { taskId: 'rdg_001', score: 7, total: 10 } },
      { id: `r-${now - 1}`, createdAt: new Date(now - (2 * day)).toISOString(), result: { taskId: 'rdg_hard_001', score: 6, total: 10 } },
    ];
    const demoListening = [
      { id: `l-${now}`, createdAt: new Date(now - day).toISOString(), result: { taskId: 'lst_001', score: 8, total: 10 } },
    ];
    const demoGrammar = [
      { id: `g-${now}`, createdAt: new Date(now - day).toISOString(), result: { taskId: 'grm_001', score: 8, total: 10 } },
      { id: `g-${now - 1}`, createdAt: new Date(now - (3 * day)).toISOString(), result: { taskId: 'grm_hard_001', score: 6, total: 10 } },
    ];
    const demoMock = [
      { id: `m-${now}`, createdAt: new Date(now - (4 * day)).toISOString(), result: { overall: 74, reading: 73, listening: 76, grammar: 72, writing: 75 } },
    ];
    const demoUserWords = [
      { word: 'infer', word_type: 'verb', synonyms: ['deduce'], antonyms: [], level: 'B2' },
      { word: 'coherent', word_type: 'adjective', synonyms: ['logical'], antonyms: [], level: 'C1' },
    ];
    const demoUnknownWords = [
      { word: 'mitigate', word_type: 'verb', synonyms: ['reduce'], antonyms: [], level: 'C1' },
      { word: 'viable', word_type: 'adjective', synonyms: ['workable'], antonyms: [], level: 'B2' },
    ];
    const demoStats = {
      infer: { known: 2, unknown: 0 },
      coherent: { known: 1, unknown: 1 },
      mitigate: { known: 0, unknown: 2 },
    };

    setLevel('P3');
    setReadingHistory(demoReading);
    setListeningHistory(demoListening);
    setGrammarHistory(demoGrammar);
    setMockHistory(demoMock);
    setUserWords(demoUserWords);
    setUnknownWords(demoUnknownWords);
    setVocabStats(demoStats);
    setXp(220);
    setScreenTime({ date: new Date().toISOString().slice(0, 10), seconds: 42 * 60 });
    setErrorWords({ infer: 2, coherent: 1 });
    setGrammarErrors({ grm_001: { title: 'Present Perfect vs Past Simple', count: 2 } });
    try {
      await AsyncStorage.setItem(STORAGE_DEMO_SEEDED, '1');
    } catch { }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
        try {
          const [loadedToken, loadedProfile] = await Promise.all([
            loadAuthToken(),
            loadUserProfile(),
          ]);

          if (!mounted) return;

          setUserProfile(loadedProfile);
          setAcademicFocus(deriveAcademicFocus(loadedProfile));
          setUserToken((prev) => (prev ? prev : loadedToken));
          setAuthReady(true);

          const results = await Promise.all([
            loadUserWords(),
            loadUnknownWords(),
            loadVocabStats(),
            loadAiAccessConfig(),
            loadLevel(),
            loadWritingEngine(),
            loadFavorites(),
            loadHistory(),
            loadMockHistory(),
            loadReadingHistory(),
            loadListeningHistory(),
            loadGrammarHistory(),
            loadScreenTime(),
            loadErrorWords(),
            loadGrammarErrors(),
            loadXP(),
            loadCustomDecks(),
          ]);

          if (!mounted) return;

          const [
            loadedUserWords,
            loadedUnknownWords,
            loadedVocabStats,
            loadedAiAccessConfig,
            loadedLevel,
            loadedWritingEngine,
            loadedFavorites,
            loadedHistory,
            loadedMockHistory,
            loadedReadingHistory,
            loadedListeningHistory,
            loadedGrammarHistory,
            loadedScreenTime,
            loadedErrorWords,
            loadedGrammarErrors,
            loadedXp,
            loadedCustomDecks,
          ] = results;

          setUserWords(Array.isArray(loadedUserWords) ? loadedUserWords : []);
          setUnknownWords(Array.isArray(loadedUnknownWords) ? loadedUnknownWords : []);
          setVocabStats(loadedVocabStats && typeof loadedVocabStats === 'object' ? loadedVocabStats : {});
          setAiAccessConfig(normalizeAiConfig(loadedAiAccessConfig));
          setLevel(loadedLevel || 'P2');
          setWritingEngine(loadedWritingEngine || 'online');
          setFavoritePrompts(Array.isArray(loadedFavorites) ? loadedFavorites : []);
          setHistory(Array.isArray(loadedHistory) ? loadedHistory : []);
          setMockHistory(Array.isArray(loadedMockHistory) ? loadedMockHistory : []);
          setReadingHistory(Array.isArray(loadedReadingHistory) ? loadedReadingHistory : []);
          setListeningHistory(Array.isArray(loadedListeningHistory) ? loadedListeningHistory : []);
          setGrammarHistory(Array.isArray(loadedGrammarHistory) ? loadedGrammarHistory : []);
          setScreenTime(loadedScreenTime || { date: null, seconds: 0 });
          setErrorWords(loadedErrorWords || {});
          setGrammarErrors(loadedGrammarErrors || {});
          setXp(Number(loadedXp) || 0);
          setCustomDecks(Array.isArray(loadedCustomDecks) ? loadedCustomDecks : []);
        } catch (e) {
          console.error('[AppState] Hydration failed:', e);
          if (mounted) setAuthReady(true);
        }
    })();
    return () => { mounted = false; };
  }, [applyDemoData]);

  useEffect(() => {
    setRuntimeApiAccessConfig(aiAccessConfig);
  }, [aiAccessConfig]);

  useEffect(() => {
    if (!authReady) return;

    const healthEndpoint = resolveApiEndpoint('BUEPT_HEALTH_API_URL', '/api/health');
    const fallbackEngine = (prev) => (prev === 'local' ? 'local' : 'online');

    if (!healthEndpoint) {
      setAiReady(false);
      setWritingEngine(fallbackEngine);
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2200);
    let alive = true;

    fetch(healthEndpoint, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`health ${res.status}`);
        return res.json().catch(() => ({}));
      })
      .then(() => {
        if (!alive) return;
        setAiReady(true);
        setWritingEngine('hybrid');
      })
      .catch(() => {
        if (!alive) return;
        setAiReady(false);
        setWritingEngine(fallbackEngine);
      })
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [authReady, aiAccessConfig]);

  useEffect(() => {
    saveUserWords(userWords);
    const reviewItems = userWords.map((w) => createReviewItem(w.word));
    setReviews(reviewItems);
  }, [userWords]);

  useEffect(() => {
    saveUnknownWords(unknownWords);
  }, [unknownWords]);

  useEffect(() => {
    saveVocabStats(vocabStats);
  }, [vocabStats]);

  useEffect(() => {
    saveLevel(level);
  }, [level]);

  useEffect(() => {
    saveAiAccessConfig(aiAccessConfig);
  }, [aiAccessConfig]);

  useEffect(() => {
    saveWritingEngine(writingEngine);
  }, [writingEngine]);
  useEffect(() => {
    saveFavorites(favoritePrompts);
  }, [favoritePrompts]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveMockHistory(mockHistory);
  }, [mockHistory]);

  useEffect(() => {
    saveReadingHistory(readingHistory);
  }, [readingHistory]);

  useEffect(() => {
    saveListeningHistory(listeningHistory);
  }, [listeningHistory]);

  useEffect(() => {
    saveGrammarHistory(grammarHistory);
  }, [grammarHistory]);

  useEffect(() => {
    screenTimeRef.current = screenTime;
  }, [screenTime]);

  useEffect(() => {
    const now = Date.now();
    if (now - lastScreenTimePersistRef.current >= SCREEN_TIME_PERSIST_MS || screenTime.seconds === 0) {
      lastScreenTimePersistRef.current = now;
      saveScreenTime(screenTime);
    }
  }, [screenTime]);

  useEffect(() => {
    saveXP(xp);
  }, [xp]);

  useEffect(() => {
    saveAuthToken(userToken);
  }, [userToken]);

  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveCustomDecks(customDecks);
  }, [customDecks]);

  useEffect(() => {
    userWordsRef.current = Array.isArray(userWords) ? userWords : [];
  }, [userWords]);

  useEffect(() => {
    unknownWordsRef.current = Array.isArray(unknownWords) ? unknownWords : [];
  }, [unknownWords]);

  useEffect(() => {
    vocabStatsRef.current = vocabStats && typeof vocabStats === 'object' ? vocabStats : {};
  }, [vocabStats]);

  useEffect(() => {
    customDecksRef.current = Array.isArray(customDecks) ? customDecks : [];
  }, [customDecks]);

  const runVocabCloudSync = useCallback(async () => {
    if (!syncEnabled) return;
    if (!authReady) return;
    if (syncBusyRef.current) return;
    syncBusyRef.current = true;
    try {
      const status = await pingVocabCloudSync().catch(() => null);
      const remoteUpdatedAt = String(status?.updatedAt || '').trim();
      const remoteChanged = !!remoteUpdatedAt && remoteUpdatedAt !== remoteSyncStampRef.current;
      const localDirty = localSyncDirtyRef.current;

      if (!remoteChanged && !localDirty) return;

      let mergedMyWords = userWordsRef.current;
      let mergedUnknownWords = unknownWordsRef.current;
      let mergedVocabStats = vocabStatsRef.current;
      let mergedDecks = customDecksRef.current;
      const localWeekly = await loadWeeklyVocabProgress();
      let mergedWeekly = localWeekly;

      if (remoteChanged) {
        const pulled = await pullVocabCloudSync({ client: 'app' });
        const remoteState = pulled?.state || {};
        const remoteMyWords = remoteState?.myWords?.value || [];
        const remoteUnknownWords = remoteState?.unknownWords?.value || [];
        const remoteVocabStats = remoteState?.vocabStats?.value || {};
        const remoteDecks = remoteState?.customDecks?.value || [];
        const remoteWeekly = remoteState?.weeklyProgress?.value || {};

        mergedMyWords = mergeWordEntries(userWordsRef.current, remoteMyWords);
        mergedUnknownWords = mergeWordEntries(unknownWordsRef.current, remoteUnknownWords);
        mergedVocabStats = mergeVocabStats(vocabStatsRef.current, remoteVocabStats);
        mergedDecks = mergeDecks(customDecksRef.current, remoteDecks);
        mergedWeekly = mergeWeeklyProgress(localWeekly, remoteWeekly);

        remoteSyncStampRef.current = String(pulled?.updatedAt || remoteUpdatedAt || '').trim();
      }

      if (!areWordListsEqual(mergedMyWords, userWordsRef.current)) {
        setUserWords(mergedMyWords);
      }
      if (!areWordListsEqual(mergedUnknownWords, unknownWordsRef.current)) {
        setUnknownWords(mergedUnknownWords);
      }
      if (!areStatsEqual(mergedVocabStats, vocabStatsRef.current)) {
        setVocabStats(mergedVocabStats);
      }
      if (!areDecksEqual(mergedDecks, customDecksRef.current)) {
        setCustomDecks(mergedDecks);
      }
      if (JSON.stringify(mergedWeekly) !== JSON.stringify(localWeekly)) {
        await saveWeeklyVocabProgress(mergedWeekly);
      }

      if (localDirty || remoteChanged) {
        const pushed = await pushVocabCloudSync({
          client: 'app',
          state: {
            myWords: mergedMyWords,
            unknownWords: mergedUnknownWords,
            vocabStats: mergedVocabStats,
            customDecks: mergedDecks,
            weeklyProgress: mergedWeekly,
          },
        });
        localSyncDirtyRef.current = false;
        if (pushed?.updatedAt) {
          remoteSyncStampRef.current = String(pushed.updatedAt);
        }
      }
    } catch (_) {
      // Sync should never break local usage.
    } finally {
      syncBusyRef.current = false;
    }
  }, [authReady, syncEnabled]);

  useEffect(() => {
    if (!syncEnabled) return undefined;
    if (!authReady) return undefined;
    runVocabCloudSync();
    const interval = setInterval(() => {
      runVocabCloudSync();
    }, 12000);
    const sub = RNAppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        runVocabCloudSync();
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [authReady, runVocabCloudSync, syncEnabled]);

  useEffect(() => {
    if (!syncEnabled) return undefined;
    if (!authReady) return undefined;
    localSyncDirtyRef.current = true;
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      runVocabCloudSync();
    }, 1200);
    return () => {
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
        syncDebounceRef.current = null;
      }
    };
  }, [authReady, userWords, unknownWords, vocabStats, customDecks, runVocabCloudSync, syncEnabled]);

  useEffect(() => {
    postAuthRouteRef.current = postAuthRoute;
  }, [postAuthRoute]);

  const login = useCallback(async (payload = null) => {
    if (payload && typeof payload === 'object') {
      const nextRoute = typeof payload.nextRoute === 'string' ? payload.nextRoute : null;
      if (payload.mode === 'demo') {
        const demoProfile = buildDemoProfile();
        await applyDemoData();
        setUserProfile(demoProfile);
        setAcademicFocus('General');
        setUserToken('demo_student');
        setPostAuthRoute(nextRoute);
        return { ok: true, mode: 'demo' };
      }

      const email = normalizeEmail(payload.email);
      const password = String(payload.password || '');
      if (!email || !password) {
        return { ok: false, error: 'Enter your university email and password.' };
      }
      const storedEmail = normalizeEmail(userProfile?.email);
      if (!storedEmail) {
        return { ok: false, error: 'No account found on this device. Create one first.' };
      }
      if (storedEmail !== email) {
        return { ok: false, error: 'This email does not match the saved account on this device.' };
      }
      if (String(userProfile?.password || '') !== password) {
        return { ok: false, error: 'Incorrect password.' };
      }
      const nextProfile = {
        ...userProfile,
        lastLoginAt: new Date().toISOString(),
        mode: userProfile?.mode || 'standard',
      };
      setUserProfile(nextProfile);
      setAcademicFocus(deriveAcademicFocus(nextProfile));
      setUserToken(email);
      setPostAuthRoute(nextRoute);
      return { ok: true, mode: 'standard' };
    }

    setUserToken(payload || 'student_token');
    return { ok: true };
  }, [applyDemoData, userProfile]);

  const register = useCallback(async ({
    name = '',
    email = '',
    password = '',
    faculty = '',
  } = {}) => {
    const trimmedName = String(name || '').trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedFaculty = String(faculty || '').trim() || 'General';
    const cleanPassword = String(password || '');

    if (trimmedName.length < 2) {
      return { ok: false, error: 'Enter your full name.' };
    }
    if (!normalizedEmail.endsWith('.edu.tr') && !normalizedEmail.endsWith('@boun.edu.tr')) {
      return { ok: false, error: 'Use a valid university email.' };
    }
    if (cleanPassword.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    const profile = {
      name: trimmedName,
      email: normalizedEmail,
      password: cleanPassword,
      faculty: normalizedFaculty,
      role: 'Student',
      mode: 'standard',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setUserProfile(profile);
    setAcademicFocus(deriveAcademicFocus(profile));
    setUserToken(normalizedEmail);
    setPostAuthRoute(null);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setPostAuthRoute(null);
    setUserToken(null);
  }, []);

  const consumePostAuthRoute = useCallback(() => {
    const nextRoute = postAuthRouteRef.current;
    if (nextRoute) {
      postAuthRouteRef.current = null;
      setPostAuthRoute(null);
    }
    return nextRoute;
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setScreenTime((prev) => (prev.date !== today ? { date: today, seconds: 0 } : prev));
  }, []);

  useEffect(() => {
    const tick = () => {
      const today = new Date().toISOString().slice(0, 10);
      setScreenTime((prev) => {
        if (prev.date !== today) return { date: today, seconds: SCREEN_TIME_TICK_SECONDS };
        return { ...prev, seconds: prev.seconds + SCREEN_TIME_TICK_SECONDS };
      });
    };

    const startTimer = () => {
      if (timerRef.current) return;
      timerRef.current = setInterval(tick, SCREEN_TIME_TICK_SECONDS * 1000);
    };
    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (appStateRef.current === 'active') startTimer();

    const sub = RNAppState.addEventListener('change', (next) => {
      appStateRef.current = next;
      if (next === 'active') startTimer();
      else {
        stopTimer();
        saveScreenTime(screenTimeRef.current);
      }
    });

    return () => {
      stopTimer();
      sub.remove();
    };
  }, []);

  const addXp = useCallback((amount) => {
    setXp(prev => prev + amount);
  }, []);

  const addReadingResult = useCallback((result) => {
    setReadingHistory((prev) => [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), result },
      ...prev
    ]);
    const scorePct = result.score / Math.max(1, result.total);
    addXp(calculateXpForAction('READING_PRACTICE', scorePct));
  }, [addXp]);

  const addListeningResult = useCallback((result) => {
    setListeningHistory((prev) => [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), result },
      ...prev
    ]);
    const scorePct = result.score / Math.max(1, result.total);
    addXp(calculateXpForAction('LISTENING_PRACTICE', scorePct));
  }, [addXp]);

  const addGrammarResult = useCallback((result) => {
    setGrammarHistory((prev) => [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), result },
      ...prev
    ]);
    const scorePct = result.score / Math.max(1, result.total);
    addXp(calculateXpForAction('GRAMMAR_QUIZ', scorePct));
  }, [addXp]);

  const generateReport = useCallback((meta = {}) => {
    const sourceText = meta?.text ?? essayText;
    const studentName = String(meta?.studentName || userProfile?.name || '').trim();
    const enrichedMeta = { ...meta, studentName: studentName || 'Student' };
    let r;
    try {
      r = buildYS9Report(sourceText, meta?.type, meta?.level, enrichedMeta);
    } catch (error) {
      console.error('[generateReport] fallback used:', error);
      r = {
        raw_text: sourceText || '',
        prompt_text: meta?.prompt || '',
        rubric: { Grammar: 0, Vocabulary: 0, Organization: 0, Content: 0, Mechanics: 0, Total: 0 },
        strengths: ['Draft saved successfully.'],
        issues: ['Automatic report generation failed. Open Tools for online/local checks.'],
        next_steps: ['Return to editor and retry feedback generation.'],
        full_report: 'Feedback engine recovered from a runtime issue. Please retry.',
      };
    }
    try {
      const targetWords = {
        P1: 80,
        P2: 120,
        P3: 180,
        P4: 250,
      }[String(meta?.level || level || 'P2').toUpperCase()] || 150;
      const officialRubric = scoreWritingRubric({
        text: sourceText,
        prompt: meta?.prompt || '',
        targetWords,
      });
      if (officialRubric && Array.isArray(officialRubric.categories)) {
        const officialRubricMap = officialRubric.categories.reduce((acc, category) => {
          acc[category.name] = Number(category.score || 0);
          return acc;
        }, {});
        r = {
          ...r,
          rubric: {
            Grammar: Number(officialRubricMap.Grammar || 0),
            Vocabulary: Number(officialRubricMap.Vocabulary || 0),
            Organization: Number(officialRubricMap.Organization || 0),
            Content: Number(officialRubricMap.Content || 0),
            Mechanics: Number(officialRubricMap.Mechanics || 0),
            Total: Number(officialRubric.total || 0),
          },
          official_rubric: officialRubric,
          wasc_band: officialRubric.wascBand || null,
          strengths: uniqueTextList([
            ...(officialRubric.strengths || []),
            ...(Array.isArray(r?.strengths) ? r.strengths : []),
          ]),
          issues: uniqueTextList([
            ...(officialRubric.improvements || []),
            ...(Array.isArray(r?.issues) ? r.issues : []),
          ]),
          priority_fixes: uniqueTextList([
            ...((officialRubric.priorityPlan || []).map((item) => `${item.area}: ${item.action}`)),
            ...(Array.isArray(r?.priority_fixes) ? r.priority_fixes : []),
          ]),
          next_steps: uniqueTextList([
            ...(officialRubric.nextStepChecklist || []),
            ...(Array.isArray(r?.next_steps) ? r.next_steps : []),
          ]),
          feedback_summary: officialRubric.feedbackSummary || r?.feedback_summary || '',
        };
      }
    } catch (error) {
      console.error('[generateReport] official rubric fallback used:', error);
    }
    setReport(r);
    setHistory((prev) => [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), report: r },
      ...prev
    ]);
    const scorePct = Number(r?.rubric?.Total || 0) / 20;
    addXp(calculateXpForAction('ESSAY_WRITTEN', scorePct));
  }, [essayText, addXp, userProfile]);

  const addUserWord = useCallback((word) => {
    if (!word || typeof word !== 'string') return;
    const w = word.trim().toLowerCase();
    if (!w) return;
    const entry = getWordEntry(w) || { word: w, word_type: '', synonyms: [], antonyms: [], level: '' };
    setUserWords((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.find((x) => x.word === w)) return list;
      return [entry, ...list];
    });
  }, []);

  const addUserWordObject = useCallback((entry) => {
    if (!entry || !entry.word) return;
    const w = entry.word.trim().toLowerCase();
    setUserWords((prev) => {
      if (prev.find((x) => x.word === w)) return prev;
      return [{ ...entry, word: w }, ...prev];
    });
  }, []);

  const removeUserWord = useCallback((word) => {
    if (!word || typeof word !== 'string') return;
    const w = word.trim().toLowerCase();
    if (!w) return;
    setUserWords((prev) => (Array.isArray(prev) ? prev.filter((item) => item?.word !== w) : prev));
  }, []);

  const addUnknownWord = useCallback((rawWord, meta = null) => {
    const payload = typeof rawWord === 'object' && rawWord != null
      ? rawWord
      : { word: rawWord, ...(meta && typeof meta === 'object' ? meta : {}) };
    const normalized = normalizeWordEntry(payload);
    if (!normalized?.word) return;

    const w = normalized.word;
    const lookupEntry = getWordEntry(w) || { word: w, word_type: '', synonyms: [], antonyms: [], level: '' };
    const incomingSources = uniqueTextList([
      ...(Array.isArray(normalized?.sources) ? normalized.sources : []),
      normalized?.source,
    ]);
    const incomingSourceModules = uniqueTextList([
      ...(Array.isArray(normalized?.sourceModules) ? normalized.sourceModules : []),
      normalized?.sourceModule,
    ], true);
    const incomingEntry = {
      ...lookupEntry,
      ...normalized,
      word: w,
      synonyms: uniqueTextList([
        ...(Array.isArray(lookupEntry?.synonyms) ? lookupEntry.synonyms : []),
        ...(Array.isArray(normalized?.synonyms) ? normalized.synonyms : []),
      ]),
      antonyms: uniqueTextList([
        ...(Array.isArray(lookupEntry?.antonyms) ? lookupEntry.antonyms : []),
        ...(Array.isArray(normalized?.antonyms) ? normalized.antonyms : []),
      ]),
      sources: incomingSources,
      source: normalized.source || incomingSources[0] || '',
      sourceModules: incomingSourceModules,
      sourceModule: normalized.sourceModule || incomingSourceModules[0] || '',
      addedAt: normalized.addedAt || normalized.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUnknownWords((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const existingIndex = list.findIndex((item) => normalizeWordKey(item?.word || item) === w);
      if (existingIndex === -1) return [incomingEntry, ...list];

      const existingNormalized = normalizeWordEntry(list[existingIndex]) || { word: w, synonyms: [], antonyms: [] };
      const mergedSources = uniqueTextList([
        ...(Array.isArray(existingNormalized?.sources) ? existingNormalized.sources : []),
        ...(Array.isArray(incomingEntry?.sources) ? incomingEntry.sources : []),
        existingNormalized?.source,
        incomingEntry?.source,
      ]);
      const mergedSourceModules = uniqueTextList([
        ...(Array.isArray(existingNormalized?.sourceModules) ? existingNormalized.sourceModules : []),
        ...(Array.isArray(incomingEntry?.sourceModules) ? incomingEntry.sourceModules : []),
        existingNormalized?.sourceModule,
        incomingEntry?.sourceModule,
      ], true);
      const mergedEntry = {
        ...existingNormalized,
        ...incomingEntry,
        word: w,
        synonyms: uniqueTextList([
          ...(Array.isArray(existingNormalized?.synonyms) ? existingNormalized.synonyms : []),
          ...(Array.isArray(incomingEntry?.synonyms) ? incomingEntry.synonyms : []),
        ]),
        antonyms: uniqueTextList([
          ...(Array.isArray(existingNormalized?.antonyms) ? existingNormalized.antonyms : []),
          ...(Array.isArray(incomingEntry?.antonyms) ? incomingEntry.antonyms : []),
        ]),
        sources: mergedSources,
        source: incomingEntry.source || existingNormalized.source || mergedSources[0] || '',
        sourceModules: mergedSourceModules,
        sourceModule: incomingEntry.sourceModule || existingNormalized.sourceModule || mergedSourceModules[0] || '',
        addedAt: existingNormalized.addedAt || incomingEntry.addedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const remaining = list.filter((_, index) => index !== existingIndex);
      return [mergedEntry, ...remaining];
    });
  }, []);

  const clearUnknownWords = useCallback(() => setUnknownWords([]), []);

  const recordKnown = useCallback((word) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    setVocabStats((prev) => {
      const entry = prev[w] || { known: 0, unknown: 0 };
      return { ...prev, [w]: { ...entry, known: entry.known + 1 } };
    });
    addXp(2); // Small bump for reviews
  }, [addXp]);

  const recordUnknown = useCallback((word) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    setVocabStats((prev) => {
      const entry = prev[w] || { known: 0, unknown: 0 };
      return { ...prev, [w]: { ...entry, unknown: entry.unknown + 1 } };
    });
  }, []);

  const rollbackVocabRecord = useCallback((word, status) => {
    const w = String(word || '').trim().toLowerCase();
    if (!w) return;
    setVocabStats((prev) => {
      const current = prev[w];
      if (!current) return prev;
      const nextKnown = status === 'known' ? Math.max(0, Number(current.known || 0) - 1) : Number(current.known || 0);
      const nextUnknown = status === 'unknown' ? Math.max(0, Number(current.unknown || 0) - 1) : Number(current.unknown || 0);
      if (nextKnown === 0 && nextUnknown === 0) {
        const clone = { ...prev };
        delete clone[w];
        return clone;
      }
      return { ...prev, [w]: { known: nextKnown, unknown: nextUnknown } };
    });
  }, []);

  const toggleFavoritePrompt = useCallback((promptText) => {
    setFavoritePrompts((prev) => {
      if (prev.includes(promptText)) return prev.filter((p) => p !== promptText);
      return [promptText, ...prev];
    });
  }, []);

  const setActiveReportById = useCallback((id) => {
    const item = history.find((h) => h.id === id);
    if (item) setReport(item.report);
  }, [history]);

  const addMockResult = useCallback((result) => {
    setMockHistory((prev) => [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), result },
      ...prev
    ]);
    const scorePct = result.overall / 100;
    addXp(calculateXpForAction('MOCK_EXAM', scorePct));
  }, [addXp]);

  /** Track a word that was answered incorrectly in a quiz */
  const recordQuizError = useCallback((word) => {
    if (!word?.trim()) return;
    const w = word.trim().toLowerCase();
    setErrorWords(prev => {
      const updated = { ...prev, [w]: (prev[w] || 0) + 1 };
      saveErrorWords(updated);
      return updated;
    });
  }, []);

  /** Track a grammar topic where user made an error */
  const recordGrammarError = useCallback((topicId, topicTitle) => {
    if (!topicId) return;
    setGrammarErrors(prev => {
      const existing = prev[topicId] || { title: topicTitle, count: 0 };
      const updated = { ...prev, [topicId]: { ...existing, title: topicTitle, count: existing.count + 1 } };
      saveGrammarErrors(updated);
      return updated;
    });
  }, []);

  const clearErrorWords = useCallback(() => { setErrorWords({}); saveErrorWords({}); }, []);
  const clearGrammarErrors = useCallback(() => { setGrammarErrors({}); saveGrammarErrors({}); }, []);

  const addCustomDeck = useCallback((title, words) => {
    if (!title?.trim()) return;
    setCustomDecks(prev => [
      { id: Date.now().toString(), title: title.trim(), words: words || [] },
      ...prev
    ]);
  }, []);

  const deleteCustomDeck = useCallback((id) => {
    let removedDeck = null;
    setCustomDecks((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      removedDeck = list.find((d) => d.id === id) || null;
      return list.filter((d) => d.id !== id);
    });
    return removedDeck;
  }, []);

  const restoreCustomDeck = useCallback((deck) => {
    if (!deck?.id || !deck?.title) return;
    setCustomDecks((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.some((d) => d.id === deck.id)) return list;
      return [deck, ...list];
    });
  }, []);

  const updateAiAccessConfig = useCallback((next = {}) => {
    setAiAccessConfig((prev) => normalizeAiConfig({ ...prev, ...(next || {}) }));
  }, []);

  const resetAiAccessConfig = useCallback(() => {
    setAiAccessConfig(normalizeAiConfig());
  }, []);

  const value = useMemo(() => ({
    userToken,
    authReady,
    userProfile,
    isDemoUser: userProfile?.mode === 'demo',
    postAuthRoute,
    consumePostAuthRoute,
    academicFocus,
    setAcademicFocus,
    login,
    register,
    logout,
    level,
    setLevel,
    writingEngine,
    setWritingEngine,
    aiReady,
    aiAccessConfig,
    essayText,
    setEssayText,
    report,
    history,
    mockHistory,
    readingHistory,
    listeningHistory,
    grammarHistory,
    isFocusMode,
    setIsFocusMode,
    ttsConfig,
    setTtsConfig,
    screenTime,
    userWords,
    unknownWords,
    vocabStats,
    favoritePrompts,
    reviews,
    errorWords,
    grammarErrors,
    xp,
    customDecks,
    setReviews,
    addCustomDeck,
    deleteCustomDeck,
    addUserWord,
    addUserWordObject,
    removeUserWord,
    addUnknownWord,
    clearUnknownWords,
    recordKnown,
    recordUnknown,
    rollbackVocabRecord,
    generateReport,
    setActiveReportById,
    addMockResult,
    addReadingResult,
    addListeningResult,
    addGrammarResult,
    toggleFavoritePrompt,
    recordQuizError,
    recordGrammarError,
    clearErrorWords,
    clearGrammarErrors,
    addXp,
    applyDemoData,
    restoreCustomDeck,
    updateAiAccessConfig,
    resetAiAccessConfig,
  }), [
    userToken, authReady, userProfile, postAuthRoute, academicFocus,
    level, writingEngine, aiReady, aiAccessConfig, essayText, report, history, mockHistory,
    readingHistory, listeningHistory, grammarHistory, isFocusMode, ttsConfig, screenTime,
    userWords, unknownWords, vocabStats, favoritePrompts, reviews,
    errorWords, grammarErrors, xp, customDecks,
    generateReport, setActiveReportById, addMockResult, addReadingResult,
    addListeningResult, addGrammarResult, addUserWord, addUserWordObject, removeUserWord, addUnknownWord,
    clearUnknownWords, recordKnown, recordUnknown, rollbackVocabRecord, toggleFavoritePrompt,
    recordQuizError, recordGrammarError, clearErrorWords, clearGrammarErrors,
    addCustomDeck, deleteCustomDeck, restoreCustomDeck,
    addXp, applyDemoData, login, register, logout, consumePostAuthRoute,
    setTtsConfig,
    updateAiAccessConfig, resetAiAccessConfig,
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

