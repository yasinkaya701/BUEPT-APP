import { Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

const isWeb = Platform.OS === 'web';

function normalizeTranscript(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function mergeTranscript(base = '', addition = '') {
  const baseText = normalizeTranscript(base);
  const additionText = normalizeTranscript(addition);
  if (!additionText) return baseText;
  if (!baseText) return additionText;
  if (baseText === additionText) return baseText;
  if (additionText.startsWith(baseText)) return additionText;
  if (baseText.endsWith(additionText)) return baseText;
  return `${baseText} ${additionText}`.replace(/\s+/g, ' ').trim();
}

/**
 * Web Speech Recognition Implementation
 */
const WebVoice = {
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechError: null,
  onSpeechPartialResults: null,
  onSpeechResults: null,
  onSpeechVolumeChanged: null,
  
  _recognition: null,
  _audioContext: null,
  _audioStream: null,
  _analyser: null,
  _dataArray: null,
  _animationFrame: null,
  _restartTimer: null,
  _shouldContinue: false,
  _sessionActive: false,
  _finalTranscript: '',
  _interimTranscript: '',

  _emitSessionEnd: () => {
    if (!WebVoice._sessionActive) return;
    WebVoice._sessionActive = false;
    WebVoice.onSpeechEnd && WebVoice.onSpeechEnd();
  },

  _createRecognition: (lang = 'en-US') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported in this browser.');
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      WebVoice._startMeter();
      if (!WebVoice._sessionActive) {
        WebVoice._sessionActive = true;
        WebVoice.onSpeechStart && WebVoice.onSpeechStart();
      }
    };

    recognition.onend = () => {
      if (WebVoice._animationFrame) {
        cancelAnimationFrame(WebVoice._animationFrame);
        WebVoice._animationFrame = null;
      }
      if (WebVoice._shouldContinue) {
        clearTimeout(WebVoice._restartTimer);
        WebVoice._restartTimer = setTimeout(() => {
          if (!WebVoice._shouldContinue || !WebVoice._recognition) return;
          try {
            WebVoice._recognition.start();
          } catch (_) {
            // Browser may still be settling; keep the current session state.
          }
        }, 180);
        return;
      }
      WebVoice._emitSessionEnd();
    };

    recognition.onerror = (event) => {
      const code = String(event?.error || 'unknown');
      const fatalCodes = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported']);
      const ignoredCodes = new Set(['aborted', 'no-speech']);
      if (fatalCodes.has(code)) {
        WebVoice._shouldContinue = false;
      }
      if (!ignoredCodes.has(code)) {
        WebVoice.onSpeechError && WebVoice.onSpeechError({
          error: {
            code,
            message: String(event?.message || event?.error || 'Speech recognition error'),
          },
        });
      }
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = normalizeTranscript(result?.[0]?.transcript);
        if (!transcript) continue;
        if (result.isFinal) {
          WebVoice._finalTranscript = mergeTranscript(WebVoice._finalTranscript, transcript);
        } else {
          interim = mergeTranscript(interim, transcript);
        }
      }

      WebVoice._interimTranscript = interim;
      const combined = mergeTranscript(WebVoice._finalTranscript, interim);
      if (combined && WebVoice.onSpeechPartialResults) {
        WebVoice.onSpeechPartialResults({ value: [combined] });
      }
      if (WebVoice._finalTranscript && WebVoice.onSpeechResults) {
        WebVoice.onSpeechResults({ value: [WebVoice._finalTranscript] });
      }
    };

    WebVoice._recognition = recognition;
  },

  _ensureMeter: async () => {
    try {
      if (WebVoice._audioContext && WebVoice._analyser && WebVoice._dataArray) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      const audioContext = new AudioContextCtor();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      WebVoice._audioContext = audioContext;
      WebVoice._audioStream = stream;
      WebVoice._analyser = analyser;
      WebVoice._dataArray = dataArray;
    } catch (error) {
      console.log('Mic volume blocked or failed:', error);
    }
  },

  _startMeter: () => {
    if (!WebVoice._analyser || !WebVoice._dataArray) return;
    if (WebVoice._animationFrame) cancelAnimationFrame(WebVoice._animationFrame);
    const updateVolume = () => {
      if (!WebVoice._analyser || !WebVoice._dataArray || !WebVoice._shouldContinue) {
        WebVoice._animationFrame = null;
        return;
      }
      WebVoice._analyser.getByteFrequencyData(WebVoice._dataArray);
      let sum = 0;
      for (let i = 0; i < WebVoice._dataArray.length; i += 1) {
        sum += WebVoice._dataArray[i];
      }
      const average = sum / WebVoice._dataArray.length;
      if (WebVoice.onSpeechVolumeChanged) {
        WebVoice.onSpeechVolumeChanged({ value: average / 5 });
      }
      WebVoice._animationFrame = requestAnimationFrame(updateVolume);
    };
    WebVoice._animationFrame = requestAnimationFrame(updateVolume);
  },

  start: async (lang = 'en-US') => {
    WebVoice._shouldContinue = true;
    WebVoice._sessionActive = false;
    WebVoice._finalTranscript = '';
    WebVoice._interimTranscript = '';
    clearTimeout(WebVoice._restartTimer);

    if (!WebVoice._recognition) {
      WebVoice._createRecognition(lang);
    } else {
      WebVoice._recognition.lang = lang;
    }

    await WebVoice._ensureMeter();
    try {
      WebVoice._recognition.start();
    } catch (e) {
      if (!/already started/i.test(String(e?.message || ''))) {
        throw e;
      }
    }
  },

  stop: async () => {
    WebVoice._shouldContinue = false;
    clearTimeout(WebVoice._restartTimer);
    if (WebVoice._recognition) WebVoice._recognition.stop();
    if (WebVoice._animationFrame) {
      cancelAnimationFrame(WebVoice._animationFrame);
      WebVoice._animationFrame = null;
    }
  },

  destroy: async () => {
    WebVoice._shouldContinue = false;
    clearTimeout(WebVoice._restartTimer);
    if (WebVoice._recognition) WebVoice._recognition.abort();
    if (WebVoice._audioContext) {
      try { await WebVoice._audioContext.close(); } catch (_) { }
    }
    if (WebVoice._audioStream) {
      try {
        WebVoice._audioStream.getTracks().forEach((track) => track.stop());
      } catch (_) {
        // ignore stream shutdown issues
      }
    }
    WebVoice._recognition = null;
    WebVoice._audioContext = null;
    WebVoice._audioStream = null;
    WebVoice._analyser = null;
    WebVoice._dataArray = null;
    WebVoice._finalTranscript = '';
    WebVoice._interimTranscript = '';
    if (WebVoice._animationFrame) {
      cancelAnimationFrame(WebVoice._animationFrame);
      WebVoice._animationFrame = null;
    }
    WebVoice._emitSessionEnd();
  },

  removeAllListeners: () => {
    WebVoice.onSpeechStart = null;
    WebVoice.onSpeechEnd = null;
    WebVoice.onSpeechError = null;
    WebVoice.onSpeechPartialResults = null;
    WebVoice.onSpeechResults = null;
    WebVoice.onSpeechVolumeChanged = null;
  }
};

const voiceEngine = isWeb ? WebVoice : Voice;

export default voiceEngine;
