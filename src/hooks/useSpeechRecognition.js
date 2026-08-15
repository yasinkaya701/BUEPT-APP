/**
 * useSpeechRecognition.js — Real speech scoring for BUSEPT speaking practice.
 *
 * Uses the Web Speech Recognition API (web only) to capture the learner's
 * spoken transcript live, compares it against the target sentences, and
 * computes a word-level coverage score plus a fluency estimate (words per
 * minute and filler rate) that feeds evaluateSpeakingModel.
 *
 * On native iOS/Android it safely degrades (isAvailable === false) so the
 * app never crashes outside a browser.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const FILLERS = new Set(['um', 'uh', 'erm', 'er', 'hmm', 'like', 'you know']);

function isRecognitionAvailable() {
  if (Platform.OS !== 'web') return false;
  const w = typeof window !== 'undefined' ? window : null;
  return Boolean(w && (w.SpeechRecognition || w.webkitSpeechRecognition));
}

function normalizeWords(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Word coverage between the spoken transcript and the target sentences.
 * Returns 0–100: share of target words found in the transcript (fuzzy,
 * allowing plural/verb-variant near matches via simple stem strip).
 */
export function scoreTranscriptCoverage(transcript = '', targets = []) {
  const spoken = normalizeWords(transcript);
  if (!spoken.length) return 0;
  const strip = (w) => String(w).replace(/(s|es|ed|ing)$/, '');
  const spokenSet = new Map();
  spoken.forEach((w) => {
    const key = strip(w);
    spokenSet.set(key, Math.max(spokenSet.get(key) || 0, w.length));
  });
  let matched = 0;
  let total = 0;
  targets.forEach((t) => {
    normalizeWords(t).forEach((w) => {
      if (FILLERS.has(w)) return;
      total += 1;
      if (spokenSet.has(strip(w))) matched += 1;
    });
  });
  return total ? Math.round((matched / total) * 100) : 0;
}

/** Estimate speaking fluency from transcript duration and text. */
export function estimateFluency(transcript = '', elapsedSec = 0) {
  const words = normalizeWords(transcript);
  const fillerCount = words.filter((w) => FILLERS.has(w)).length;
  const minutes = Math.max(elapsedSec, 1) / 60;
  const wpm = Math.round(words.length / minutes);
  const sentences = String(transcript || '').split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  return { wpm: Number.isFinite(wpm) ? Math.min(Math.max(wpm, 0), 220) : 0, fillerCount, sentenceCount: sentences, wordCount: words.length };
}

export function useSpeechRecognition({ onTranscript, onEnd } = {}) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const onEndRef = useRef(onEnd);
  onTranscriptRef.current = onTranscript;
  onEndRef.current = onEnd;

  const isAvailable = isRecognitionAvailable();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!isAvailable) {
      setError('Speech recognition is only available in web browsers. Use a desktop browser to speak.');
      return false;
    }
    if (isListening) return false;
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      let full = '';
      rec.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const txt = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            full += `${full ? ' ' : ''}${txt}`;
          } else {
            interimText += txt;
          }
        }
        setTranscript(full);
        setInterim(interimText);
        if (onTranscriptRef.current) onTranscriptRef.current(full, interimText);
      };
      rec.onerror = (event) => {
        const msg = event.error === 'not-allowed'
          ? 'Microphone access was denied. Allow microphone permission and try again.'
          : `Speech recognition error: ${event.error}`;
        setError(msg);
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
        setInterim('');
        if (onEndRef.current) onEndRef.current();
      };
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
      setError(null);
      return true;
    } catch (e) {
      setError('Could not start speech recognition. Your browser may not support it.');
      return false;
    }
  }, [isAvailable, isListening]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterim('');
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  return { transcript, interim, isListening, error, isAvailable, start, stop, reset };
}
