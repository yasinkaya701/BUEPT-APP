import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_WORDS_KEY = 'user_words_v1';
const UNKNOWN_WORDS_KEY = 'unknown_words_v1';
const VOCAB_STATS_KEY = 'vocab_stats_v1';

export async function loadUserWords() {
  try {
    const raw = await AsyncStorage.getItem(USER_WORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveUserWords(words) {
  try {
    await AsyncStorage.setItem(USER_WORDS_KEY, JSON.stringify(words));
  } catch (e) {
    // ignore for now
  }
}

export async function loadUnknownWords() {
  try {
    const raw = await AsyncStorage.getItem(UNKNOWN_WORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveUnknownWords(words) {
  try {
    await AsyncStorage.setItem(UNKNOWN_WORDS_KEY, JSON.stringify(words));
  } catch (e) {
    // ignore for now
  }
}

export async function loadVocabStats() {
  try {
    const raw = await AsyncStorage.getItem(VOCAB_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export async function saveVocabStats(stats) {
  try {
    await AsyncStorage.setItem(VOCAB_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    // ignore for now
  }
}
