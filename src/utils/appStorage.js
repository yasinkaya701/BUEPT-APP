import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  level: 'app_level_v1',
  writingEngine: 'writing_engine_v1',
  favorites: 'favorite_prompts_v1',
  history: 'essay_history_v1',
  mockHistory: 'mock_history_v1',
  readingHistory: 'reading_history_v1',
  listeningHistory: 'listening_history_v1',
  grammarHistory: 'grammar_history_v1',
  screenTime: 'screen_time_v1',
  xp: 'user_xp_v1'
};

async function loadJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export const loadLevel = () => loadJson(KEYS.level, 'P2');
export const saveLevel = (v) => saveJson(KEYS.level, v);

export const loadWritingEngine = () => loadJson(KEYS.writingEngine, 'hybrid');
export const saveWritingEngine = (v) => saveJson(KEYS.writingEngine, v);

export const loadFavorites = () => loadJson(KEYS.favorites, []);
export const saveFavorites = (v) => saveJson(KEYS.favorites, v);

export const loadHistory = () => loadJson(KEYS.history, []);
export const saveHistory = (v) => saveJson(KEYS.history, v);

export const loadMockHistory = () => loadJson(KEYS.mockHistory, []);
export const saveMockHistory = (v) => saveJson(KEYS.mockHistory, v);

export const loadReadingHistory = () => loadJson(KEYS.readingHistory, []);
export const saveReadingHistory = (v) => saveJson(KEYS.readingHistory, v);

export const loadListeningHistory = () => loadJson(KEYS.listeningHistory, []);
export const saveListeningHistory = (v) => saveJson(KEYS.listeningHistory, v);

export const loadGrammarHistory = () => loadJson(KEYS.grammarHistory, []);
export const saveGrammarHistory = (v) => saveJson(KEYS.grammarHistory, v);

export const loadScreenTime = () => loadJson(KEYS.screenTime, { date: null, seconds: 0 });
export const saveScreenTime = (v) => saveJson(KEYS.screenTime, v);
export const loadXP = () => loadJson(KEYS.xp, 0);
export const saveXP = (v) => saveJson(KEYS.xp, v);
