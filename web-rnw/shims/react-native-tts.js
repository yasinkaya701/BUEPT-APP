const listeners = new Map();

let currentLanguage = 'en-US';
let currentVoiceId = '';
let currentRate = 0.5;
let currentPitch = 1;
let activeUtterance = null;

function emit(event, payload = {}) {
  const set = listeners.get(event);
  if (!set || !set.size) return;
  Array.from(set).forEach((fn) => {
    try {
      fn(payload);
    } catch (_) {
      // no-op
    }
  });
}

function addEventListener(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return {
    remove: () => {
      try {
        listeners.get(event)?.delete(handler);
      } catch (_) {
        // ignore
      }
    },
  };
}

function removeEventListener(event, handler) {
  try {
    listeners.get(event)?.delete(handler);
  } catch (_) {
    // ignore
  }
}

function getSpeech() {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) return window.speechSynthesis;
  } catch (_) {
    // ignore
  }
  return null;
}

function normalizeRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return currentRate;
  return Math.max(0.1, Math.min(1.5, n));
}

function normalizePitch(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return currentPitch;
  return Math.max(0.5, Math.min(2, n));
}

function listVoices() {
  const speech = getSpeech();
  if (!speech || typeof speech.getVoices !== 'function') return [];
  const voices = speech.getVoices() || [];
  return voices.map((voice) => ({
    id: voice.voiceURI || voice.name || '',
    name: voice.name || 'Web Voice',
    language: voice.lang || 'en-US',
    quality: 500,
    latency: 100,
    networkConnectionRequired: false,
    notInstalled: false,
  }));
}

function pickVoiceById(utterance, id) {
  if (!id) return;
  const voices = listVoices();
  const match = voices.find((voice) => voice.id === id);
  if (!match) return;
  const speech = getSpeech();
  const nativeVoices = speech?.getVoices?.() || [];
  const nativeMatch = nativeVoices.find((voice) => (voice.voiceURI || voice.name) === id);
  if (nativeMatch) utterance.voice = nativeMatch;
}

function stopInternal(cancelEvent = true) {
  const speech = getSpeech();
  if (speech) {
    try {
      speech.cancel();
    } catch (_) {
      // ignore
    }
  }
  activeUtterance = null;
  if (cancelEvent) emit('tts-cancel', {});
}

const Tts = {
  getInitStatus: () => Promise.resolve('ready'),
  setDefaultLanguage: (language) => {
    currentLanguage = String(language || currentLanguage || 'en-US');
    return Promise.resolve();
  },
  setDefaultVoice: (voiceId) => {
    currentVoiceId = String(voiceId || '');
    return Promise.resolve();
  },
  setDefaultRate: (rate) => {
    currentRate = normalizeRate(rate);
    return Promise.resolve();
  },
  setDefaultPitch: (pitch) => {
    currentPitch = normalizePitch(pitch);
    return Promise.resolve();
  },
  setIgnoreSilentSwitch: () => Promise.resolve(),
  setDucking: () => Promise.resolve(),
  voices: () => Promise.resolve(listVoices()),
  speak: (text, options = {}) => {
    const value = String(text || '').trim();
    if (!value) return Promise.resolve();

    const speech = getSpeech();
    if (!speech || typeof window === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined') {
      emit('tts-start', {});
      emit('tts-finish', {});
      return Promise.resolve();
    }

    stopInternal(false);

    const utterance = new window.SpeechSynthesisUtterance(value);
    utterance.lang = String(
      options.language ||
      options.lang ||
      currentLanguage ||
      'en-US'
    );
    utterance.rate = normalizeRate(options.rate != null ? options.rate : currentRate);
    utterance.pitch = normalizePitch(options.pitch != null ? options.pitch : currentPitch);

    const voiceId = String(options.iosVoiceId || options.voice || currentVoiceId || '');
    pickVoiceById(utterance, voiceId);

    utterance.onstart = () => emit('tts-start', {});
    utterance.onend = () => {
      activeUtterance = null;
      emit('tts-finish', {});
    };
    utterance.onerror = () => {
      activeUtterance = null;
      emit('tts-cancel', {});
    };

    activeUtterance = utterance;
    try {
      speech.speak(utterance);
    } catch (_) {
      activeUtterance = null;
      emit('tts-cancel', {});
    }
    return Promise.resolve();
  },
  stop: () => {
    stopInternal(true);
    return Promise.resolve();
  },
  addEventListener,
  removeEventListener,
  removeAllListeners: (event) => {
    if (event) listeners.delete(event);
    else listeners.clear();
  },
};

module.exports = Tts;
module.exports.default = Tts;
