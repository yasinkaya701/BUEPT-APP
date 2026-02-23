import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState as RNAppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildYS9Report } from '../utils/ys9Mock';
import { getWordEntry } from '../utils/dictionary';
import { loadUserWords, saveUserWords, loadUnknownWords, saveUnknownWords, loadVocabStats, saveVocabStats } from '../utils/storage';
import {
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
  saveFavorites,
  saveHistory,
  saveLevel,
  saveWritingEngine,
  saveMockHistory,
  saveReadingHistory,
  saveListeningHistory,
  saveGrammarHistory,
  saveScreenTime,
  saveXP
} from '../utils/appStorage';
import { createReviewItem } from '../utils/srs';
import { calculateXpForAction } from '../utils/gamification';

const STORAGE_ERROR_WORDS = '@buept_error_words';
const STORAGE_GRAMMAR_ERRORS = '@buept_grammar_errors';
const STORAGE_DEMO_SEEDED = '@buept_demo_seeded_v1';
async function loadErrorWords() { try { const v = await AsyncStorage.getItem(STORAGE_ERROR_WORDS); return v ? JSON.parse(v) : {}; } catch { return {}; } }
async function saveErrorWords(d) { try { await AsyncStorage.setItem(STORAGE_ERROR_WORDS, JSON.stringify(d)); } catch { } }
async function loadGrammarErrors() { try { const v = await AsyncStorage.getItem(STORAGE_GRAMMAR_ERRORS); return v ? JSON.parse(v) : {}; } catch { return {}; } }
async function saveGrammarErrors(d) { try { await AsyncStorage.setItem(STORAGE_GRAMMAR_ERRORS, JSON.stringify(d)); } catch { } }

const AppStateContext = createContext(null);

const STORAGE_AUTH_TOKEN = '@buept_auth_token';
async function loadAuthToken() { try { return await AsyncStorage.getItem(STORAGE_AUTH_TOKEN); } catch { return null; } }
async function saveAuthToken(t) { try { if (t) await AsyncStorage.setItem(STORAGE_AUTH_TOKEN, t); else await AsyncStorage.removeItem(STORAGE_AUTH_TOKEN); } catch { } }

export function AppStateProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [academicFocus, setAcademicFocus] = useState('General'); // Tied to Signup

  const [level, setLevel] = useState('P2');
  const [writingEngine, setWritingEngine] = useState('online');
  const [essayText, setEssayText] = useState('');
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [mockHistory, setMockHistory] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [grammarHistory, setGrammarHistory] = useState([]);
  const [screenTime, setScreenTime] = useState({ date: null, seconds: 0 });
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
        const [
          loadedUserWords,
          loadedUnknownWords,
          loadedVocabStats,
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
          loadedToken,
          seededFlag,
        ] = await Promise.all([
          loadUserWords(),
          loadUnknownWords(),
          loadVocabStats(),
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
          loadAuthToken(),
          AsyncStorage.getItem(STORAGE_DEMO_SEEDED),
        ]);
        if (!mounted) return;
        setUserWords(loadedUserWords);
        setUnknownWords(loadedUnknownWords);
        setVocabStats(loadedVocabStats);
        setLevel(loadedLevel);
        setWritingEngine(loadedWritingEngine);
        setFavoritePrompts(loadedFavorites);
        setHistory(loadedHistory);
        setMockHistory(loadedMockHistory);
        setReadingHistory(loadedReadingHistory);
        setListeningHistory(loadedListeningHistory);
        setGrammarHistory(loadedGrammarHistory);
        setScreenTime(loadedScreenTime);
        setErrorWords(loadedErrorWords);
        setGrammarErrors(loadedGrammarErrors);
        setXp(loadedXp);
        setUserToken(loadedToken);

        const isFreshProfile =
          !loadedHistory.length &&
          !loadedMockHistory.length &&
          !loadedReadingHistory.length &&
          !loadedListeningHistory.length &&
          !loadedGrammarHistory.length &&
          !loadedUserWords.length &&
          !loadedUnknownWords.length;
        if (isFreshProfile && seededFlag !== '1') {
          applyDemoData();
        }
      } catch {
        // keep defaults
      }
    })();
    return () => { mounted = false; };
  }, [applyDemoData]);

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
    saveScreenTime(screenTime);
  }, [screenTime]);

  useEffect(() => {
    saveXP(xp);
  }, [xp]);

  useEffect(() => {
    saveAuthToken(userToken);
  }, [userToken]);

  const login = useCallback((tokenPayload) => {
    setUserToken(tokenPayload || 'student_token');
    // In a real app we would parse JWT here to extract academicFocus.
    if (tokenPayload === 'Engineering' || tokenPayload === 'Economics') {
      setAcademicFocus(tokenPayload);
    }
  }, []);

  const logout = useCallback(() => {
    setUserToken(null);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setScreenTime((prev) => (prev.date !== today ? { date: today, seconds: 0 } : prev));
  }, []);

  useEffect(() => {
    const tick = () => {
      const today = new Date().toISOString().slice(0, 10);
      setScreenTime((prev) => {
        if (prev.date !== today) return { date: today, seconds: 1 };
        return { ...prev, seconds: prev.seconds + 1 };
      });
    };

    const startTimer = () => {
      if (timerRef.current) return;
      timerRef.current = setInterval(tick, 1000);
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
      else stopTimer();
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
    const r = buildYS9Report(sourceText, meta?.type, meta?.level, meta);
    setReport(r);
    setHistory((prev) => [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), report: r },
      ...prev
    ]);
    const scorePct = r.rubric.Total / 20;
    addXp(calculateXpForAction('ESSAY_WRITTEN', scorePct));
  }, [essayText, addXp]);

  const addUserWord = useCallback((word) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    const entry = getWordEntry(w) || { word: w, word_type: '', synonyms: [], antonyms: [], level: '' };
    setUserWords((prev) => {
      if (prev.find((x) => x.word === w)) return prev;
      return [entry, ...prev];
    });
  }, []);

  const addUnknownWord = useCallback((word) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    const entry = getWordEntry(w) || { word: w, word_type: '', synonyms: [], antonyms: [], level: '' };
    setUnknownWords((prev) => {
      if (prev.find((x) => x.word === w)) return prev;
      return [entry, ...prev];
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

  const value = useMemo(() => ({
    userToken,
    academicFocus,
    setAcademicFocus,
    login,
    logout,
    level,
    setLevel,
    writingEngine,
    setWritingEngine,
    essayText,
    setEssayText,
    report,
    history,
    mockHistory,
    readingHistory,
    listeningHistory,
    grammarHistory,
    screenTime,
    userWords,
    unknownWords,
    vocabStats,
    favoritePrompts,
    reviews,
    errorWords,
    grammarErrors,
    xp,
    setReviews,
    addUserWord,
    addUnknownWord,
    clearUnknownWords,
    recordKnown,
    recordUnknown,
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
  }), [
    userToken, academicFocus,
    level, writingEngine, essayText, report, history, mockHistory,
    readingHistory, listeningHistory, grammarHistory, screenTime,
    userWords, unknownWords, vocabStats, favoritePrompts, reviews,
    errorWords, grammarErrors, xp,
    generateReport, setActiveReportById, addMockResult, addReadingResult,
    addListeningResult, addGrammarResult, addUserWord, addUnknownWord,
    clearUnknownWords, recordKnown, recordUnknown, toggleFavoritePrompt,
    recordQuizError, recordGrammarError, clearErrorWords, clearGrammarErrors,
    addXp, applyDemoData, login, logout,
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
