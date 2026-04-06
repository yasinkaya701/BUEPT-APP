import { Platform } from 'react-native';
import Tts from 'react-native-tts';

const isWeb = Platform.OS === 'web';

/**
 * Web Speech Synthesis implementation for the utility
 */
const WebTts = {
  speak: (text, options = {}) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.8;
    utterance.lang = 'en-US';
    
    // Voices are better handled by the browser default or first English voice
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (bestVoice) utterance.voice = bestVoice;

    window.speechSynthesis.speak(utterance);
  },
  stop: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
  voices: async () => {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices().map(v => ({
      id: v.name,
      name: v.name,
      language: v.lang,
    }));
  }
};

const ttsEngine = isWeb ? WebTts : Tts;

let initPromise = null;
let selectedEnglishVoiceId = null;
let hasEnglishVoice = false;
let missingVoiceNoticeLogged = false;

const VOICE_PREFERENCES = ['samantha', 'ava', 'allison', 'alex', 'daniel'];

async function ensureEnglishTts() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (isWeb) {
      hasEnglishVoice = true;
      return;
    }
    try {
      await Tts.getInitStatus();
      Tts.setIgnoreSilentSwitch('ignore');
      Tts.setDucking(true);
      Tts.setDefaultLanguage('en-US');

      const voices = await ttsEngine.voices();
      const enVoices = (voices || []).filter(
        (v) => (v.language || '').toLowerCase().startsWith('en') && !v.notInstalled
      );
      const preferred =
        enVoices.find((v) => VOICE_PREFERENCES.some((name) => (v.name || '').toLowerCase().includes(name))) ||
        enVoices[0];
      hasEnglishVoice = enVoices.length > 0 || isWeb;
      selectedEnglishVoiceId = preferred?.id || null;
      if (preferred?.id && !isWeb) {
        try { Tts.setDefaultVoice(preferred.id); } catch (_) { }
      }
    } catch (_) {
      // keep silent; callers can fallback naturally
    }
  })();
  return initPromise;
}

export async function stopEnglishTts() {
  try { await ttsEngine.stop(); } catch (_) { }
}

export async function speakEnglish(text, options = {}) {
  const value = String(text || '').trim();
  if (!value) return;
  await ensureEnglishTts();
  try { await ttsEngine.stop(); } catch (_) { }

  const rate = typeof options.rate === 'number' ? options.rate : 0.5;
  const speakOptions = { rate, androidParams: options.androidParams };
  const effectiveVoiceId = options.iosVoiceId || selectedEnglishVoiceId;
  if (effectiveVoiceId) {
    speakOptions.iosVoiceId = effectiveVoiceId;
  }

  try {
    if (!isWeb) {
      Tts.setDefaultLanguage('en-US');
      if (effectiveVoiceId) {
        Tts.setDefaultVoice(effectiveVoiceId);
      }
    }
  } catch (_) { }

  if (!hasEnglishVoice) {
    if (!missingVoiceNoticeLogged && !isWeb) {
      missingVoiceNoticeLogged = true;
      console.log('[TTS] No installed English voice found on device. Install an English iOS voice in Settings.');
    }
  }

  ttsEngine.speak(value, speakOptions);
}
