import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'essay_draft_v1';
const DRAFTS_KEY = 'essay_drafts_v1';

export async function saveDraft(text) {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, text || '');
  } catch (e) {
    // ignore
  }
}

export async function loadDraft() {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    return raw || '';
  } catch (e) {
    return '';
  }
}

export async function saveDraftSnapshot(text) {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const entry = { id: Date.now().toString(), createdAt: new Date().toISOString(), text };
    const updated = [entry, ...list].slice(0, 10);
    await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }
}

export async function loadDraftSnapshots() {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
