import { Platform } from 'react-native';
import Tts from 'react-native-tts';

const isWeb = Platform.OS === 'web';

function normalizeWebSpeechRate(rate = 0.5) {
  const safe = Number(rate);
  if (!Number.isFinite(safe)) return 0.78;
  if (safe <= 0.32) return 0.62;
  if (safe <= 0.42) return 0.72;
  if (safe <= 0.52) return 0.82;
  if (safe <= 0.62) return 0.92;
  return 1.0;
}

function normalizeNativeSpeechRate(rate = 0.5) {
  const safe = Number(rate);
  if (!Number.isFinite(safe)) return 0.4;
  if (safe <= 0.32) return 0.28;
  if (safe <= 0.42) return 0.34;
  if (safe <= 0.52) return 0.4;
  if (safe <= 0.62) return 0.46;
  return 0.54;
}

function pickBestWebEnglishVoice(voiceId = '') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const normalizedId = String(voiceId || '').toLowerCase();
  if (!voices.length) return null;
  const matching = voices.find((voice) => {
    const voiceName = String(voice?.name || '').toLowerCase();
    return normalizedId && (voiceName === normalizedId || voiceName.includes(normalizedId));
  });
  if (matching) return matching;
  const ranked = [...voices]
    .filter((voice) => String(voice?.lang || '').toLowerCase().startsWith('en'))
    .sort((a, b) => {
      const score = (voice) => {
        const lang = String(voice?.lang || '').toLowerCase();
        const name = String(voice?.name || '').toLowerCase();
        let total = 0;
        if (lang.startsWith('en-us')) total += 30;
        else if (lang.startsWith('en-gb')) total += 24;
        else if (lang.startsWith('en')) total += 18;
        if (/natural|premium|enhanced|neural/.test(name)) total += 18;
        if (/google|samantha|ava|allison|daniel|microsoft/.test(name)) total += 12;
        if (/compact/.test(name)) total -= 4;
        return total;
      };
      return score(b) - score(a);
    });
  return ranked[0] || voices[0] || null;
}

/**
 * Web Speech Synthesis implementation for the utility
 */
const WebTts = {
  speak: (text, options = {}) => {
    if (!window.speechSynthesis) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = Number.isFinite(Number(options.rate))
      ? Number(options.rate)
      : normalizeWebSpeechRate(0.55);
    utterance.lang = 'en-US';

    const bestVoice = pickBestWebEnglishVoice(options.iosVoiceId);
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
    })).sort((a, b) => {
      const aEn = String(a.language || '').toLowerCase().startsWith('en') ? 1 : 0;
      const bEn = String(b.language || '').toLowerCase().startsWith('en') ? 1 : 0;
      return bEn - aEn;
    });
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
      try { Tts.setDefaultPitch(1.0); } catch (_) { }

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

  const semanticRate = Number.isFinite(Number(options.rate)) ? Number(options.rate) : 0.55;
  const rate = isWeb
    ? normalizeWebSpeechRate(semanticRate)
    : normalizeNativeSpeechRate(semanticRate);
  const speakOptions = { rate, androidParams: options.androidParams };
  const effectiveVoiceId = options.iosVoiceId || selectedEnglishVoiceId;
  if (effectiveVoiceId) {
    speakOptions.iosVoiceId = effectiveVoiceId;
  }

  try {
    if (!isWeb) {
      Tts.setDefaultLanguage('en-US');
      try { Tts.setDefaultPitch(1.0); } catch (_) { }
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
