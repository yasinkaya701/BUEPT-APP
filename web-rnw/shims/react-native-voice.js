let recognition = null;
let isRecording = false;
let volumeTimer = null;
let lastFinalText = '';

function getRecognitionCtor() {
  try {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  } catch (_) {
    return null;
  }
}

function emitVolumeTick() {
  if (!isRecording || typeof Voice.onSpeechVolumeChanged !== 'function') return;
  try {
    Voice.onSpeechVolumeChanged({ value: Math.random() * 10 });
  } catch (_) {
    // no-op
  }
}

function startVolumeLoop() {
  if (volumeTimer) clearInterval(volumeTimer);
  volumeTimer = setInterval(emitVolumeTick, 180);
}

function stopVolumeLoop() {
  if (volumeTimer) {
    clearInterval(volumeTimer);
    volumeTimer = null;
  }
}

function normalizeResults(event) {
  const finalParts = [];
  let partial = '';
  try {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const transcript = String(result?.[0]?.transcript || '').trim();
      if (!transcript) continue;
      if (result.isFinal) finalParts.push(transcript);
      else partial = transcript;
    }
  } catch (_) {
    // no-op
  }
  return { finalParts, partial };
}

const Voice = {
  onSpeechStart: null,
  onSpeechRecognized: null,
  onSpeechEnd: null,
  onSpeechError: null,
  onSpeechResults: null,
  onSpeechPartialResults: null,
  onSpeechVolumeChanged: null,

  isAvailable: async () => !!getRecognitionCtor(),

  start: async (language = 'en-US') => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      if (typeof Voice.onSpeechError === 'function') {
        Voice.onSpeechError({ error: { message: 'SpeechRecognition not available in this browser.' } });
      }
      return false;
    }

    try {
      if (recognition && isRecording) {
        recognition.stop();
      }
    } catch (_) {
      // ignore previous instance errors
    }

    recognition = new Ctor();
    recognition.lang = String(language || 'en-US');
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    lastFinalText = '';

    recognition.onstart = () => {
      isRecording = true;
      startVolumeLoop();
      if (typeof Voice.onSpeechStart === 'function') Voice.onSpeechStart({});
      if (typeof Voice.onSpeechRecognized === 'function') Voice.onSpeechRecognized({});
    };

    recognition.onresult = (event) => {
      const { finalParts, partial } = normalizeResults(event);

      if (partial && typeof Voice.onSpeechPartialResults === 'function') {
        Voice.onSpeechPartialResults({ value: [partial] });
      }

      if (finalParts.length) {
        lastFinalText = [lastFinalText, ...finalParts].join(' ').replace(/\s+/g, ' ').trim();
        if (typeof Voice.onSpeechResults === 'function') {
          Voice.onSpeechResults({ value: [lastFinalText] });
        }
      }
    };

    recognition.onerror = (event) => {
      if (typeof Voice.onSpeechError === 'function') {
        Voice.onSpeechError({
          error: {
            message: String(event?.error || 'Speech recognition error'),
            code: String(event?.error || 'unknown'),
          },
        });
      }
    };

    recognition.onend = () => {
      const wasRecording = isRecording;
      isRecording = false;
      stopVolumeLoop();
      if (wasRecording && typeof Voice.onSpeechEnd === 'function') Voice.onSpeechEnd({});
    };

    try {
      recognition.start();
      return true;
    } catch (error) {
      isRecording = false;
      stopVolumeLoop();
      if (typeof Voice.onSpeechError === 'function') {
        Voice.onSpeechError({
          error: {
            message: String(error?.message || 'Could not start speech recognition'),
            code: 'start_failed',
          },
        });
      }
      return false;
    }
  },

  stop: async () => {
    try {
      recognition?.stop?.();
    } catch (_) {
      // no-op
    }
    return true;
  },

  cancel: async () => {
    try {
      recognition?.abort?.();
    } catch (_) {
      // no-op
    }
    isRecording = false;
    stopVolumeLoop();
    return true;
  },

  destroy: async () => {
    try {
      recognition?.abort?.();
    } catch (_) {
      // no-op
    }
    recognition = null;
    isRecording = false;
    stopVolumeLoop();
    return true;
  },

  removeAllListeners: () => {
    Voice.onSpeechStart = null;
    Voice.onSpeechRecognized = null;
    Voice.onSpeechEnd = null;
    Voice.onSpeechError = null;
    Voice.onSpeechResults = null;
    Voice.onSpeechPartialResults = null;
    Voice.onSpeechVolumeChanged = null;
    return true;
  },
};

module.exports = Voice;
module.exports.default = Voice;
