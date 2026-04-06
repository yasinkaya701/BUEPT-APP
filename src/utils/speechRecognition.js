import { Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

const isWeb = Platform.OS === 'web';

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
  _analyser: null,
  _dataArray: null,
  _animationFrame: null,

  start: async (lang = 'en-US') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported in this browser.');
    }

    if (!WebVoice._recognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => WebVoice.onSpeechStart && WebVoice.onSpeechStart();
      recognition.onend = () => WebVoice.onSpeechEnd && WebVoice.onSpeechEnd();
      recognition.onerror = (e) => WebVoice.onSpeechError && WebVoice.onSpeechError({ error: e });
      recognition.onresult = (e) => {
        const results = Array.from(e.results);
        const transcript = results
          .map(result => result[0].transcript)
          .join('');
        
        const event = { value: [transcript] };
        if (results[results.length - 1].isFinal) {
          WebVoice.onSpeechResults && WebVoice.onSpeechResults(event);
        } else {
          WebVoice.onSpeechPartialResults && WebVoice.onSpeechPartialResults(event);
        }
      };
      WebVoice._recognition = recognition;
    }

    try {
        WebVoice._recognition.start();
    } catch (e) {
        // Recognition already started, keep going
    }

    // Browser Microphone Volume Logic
    try {
      if (!WebVoice._audioContext) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        WebVoice._audioContext = audioContext;
        WebVoice._analyser = analyser;
        WebVoice._dataArray = dataArray;
      }

      const updateVolume = () => {
        if (!WebVoice._analyser) return;
        WebVoice._analyser.getByteFrequencyData(WebVoice._dataArray);
        let sum = 0;
        for (let i = 0; i < WebVoice._dataArray.length; i++) {
          sum += WebVoice._dataArray[i];
        }
        const average = sum / WebVoice._dataArray.length;
        if (WebVoice.onSpeechVolumeChanged) {
          WebVoice.onSpeechVolumeChanged({ value: average / 5 });
        }
        if (WebVoice._recognition) {
           WebVoice._animationFrame = requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();
    } catch (e) {
      console.log('Mic volume blocked or failed:', e);
    }
  },

  stop: async () => {
    if (WebVoice._recognition) WebVoice._recognition.stop();
    if (WebVoice._animationFrame) cancelAnimationFrame(WebVoice._animationFrame);
  },

  destroy: async () => {
    if (WebVoice._recognition) WebVoice._recognition.stop();
    if (WebVoice._audioContext) {
        try { await WebVoice._audioContext.close(); } catch (_) { }
    }
    WebVoice._recognition = null;
    WebVoice._audioContext = null;
    if (WebVoice._animationFrame) cancelAnimationFrame(WebVoice._animationFrame);
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
