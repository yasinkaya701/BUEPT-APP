import Tts from 'react-native-tts';

let initPromise = null;
let selectedEnglishVoiceId = null;
let hasEnglishVoice = false;
let missingVoiceNoticeLogged = false;

const VOICE_PREFERENCES = ['samantha', 'ava', 'allison', 'alex', 'daniel'];

async function ensureEnglishTts() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await Tts.getInitStatus();
      Tts.setIgnoreSilentSwitch('ignore');
      Tts.setDucking(true);
      Tts.setDefaultLanguage('en-US');

      const voices = await Tts.voices();
      const enVoices = (voices || []).filter(
        (v) => (v.language || '').toLowerCase().startsWith('en') && !v.notInstalled
      );
      const preferred =
        enVoices.find((v) => VOICE_PREFERENCES.some((name) => (v.name || '').toLowerCase().includes(name))) ||
        enVoices[0];
      hasEnglishVoice = enVoices.length > 0;
      selectedEnglishVoiceId = preferred?.id || null;
      if (preferred?.id) {
        try { Tts.setDefaultVoice(preferred.id); } catch (_) { }
      }
    } catch (_) {
      // keep silent; callers can fallback naturally
    }
  })();
  return initPromise;
}

export async function stopEnglishTts() {
  try { await Tts.stop(); } catch (_) { }
}

export async function speakEnglish(text, options = {}) {
  const value = String(text || '').trim();
  if (!value) return;
  await ensureEnglishTts();
  try { await Tts.stop(); } catch (_) { }

  const rate = typeof options.rate === 'number' ? options.rate : 0.5;
  const speakOptions = { rate, androidParams: options.androidParams };
  const effectiveVoiceId = options.iosVoiceId || selectedEnglishVoiceId;
  if (effectiveVoiceId) {
    speakOptions.iosVoiceId = effectiveVoiceId;
  }

  try {
    Tts.setDefaultLanguage('en-US');
    if (effectiveVoiceId) {
      Tts.setDefaultVoice(effectiveVoiceId);
    }
  } catch (_) { }

  if (!hasEnglishVoice) {
    if (!missingVoiceNoticeLogged) {
      missingVoiceNoticeLogged = true;
      console.log('[TTS] No installed English voice found on device. Install an English iOS voice in Settings.');
    }
  }

  Tts.speak(value, speakOptions);
}
