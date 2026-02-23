/**
 * useTts.js — Central TTS hook for the whole app.
 *
 * Why: iOS requires getInitStatus() before speaking, and the silent switch
 * must be explicitly overridden. All screens should use this hook instead of
 * calling Tts directly to avoid race conditions.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import Tts from 'react-native-tts';

let _initialized = false;
let _initPromise = null;
let _englishVoiceAvailable = false;

/** Call once to initialise TTS engine. Safe to call multiple times. */
async function ensureInit() {
    if (_initialized) return;
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
        try {
            await Tts.getInitStatus();
            Tts.setDefaultLanguage('en-US');
            Tts.setIgnoreSilentSwitch('ignore');
            _initialized = true;
        } catch (e) {
            console.error('TTS Init Error:', e);
            _initPromise = null;
        }
    })();
    return _initPromise;
}

/**
 * Speak a word/phrase. Safe to call from anywhere.
 * Always stops any in-progress speech first.
 */
export async function speakText(text, customOptions = {}) {
    if (!text?.trim()) return;
    try {
        await ensureInit();
        try { Tts.stop(); } catch (e) { }
        // Small delay lets stop() settle on iOS before next speak
        await new Promise(r => setTimeout(r, 60));

        const rate = customOptions.rate || 0.5;
        try { Tts.setDefaultRate(rate); } catch (e) { }

        Tts.speak(text.trim(), {
            iosVoiceId: customOptions.iosVoiceId || 'com.apple.ttsbundle.Samantha-compact',
            rate: rate
        });
    } catch (e) {
        // Silently handle — TTS is a non-critical feature
    }
}

/**
 * React hook — provides speakWord, isPlaying, available voices.
 * Also returns a stopAll() and a setRate() helper.
 */
export function useTts() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [voices, setVoices] = useState([]);
    const [voiceId, setVoiceIdState] = useState('');
    const [rate, setRateState] = useState(0.5);
    const cleanupRef = useRef([]);
    const _speakId = useRef(0);

    useEffect(() => {
        let mounted = true;

        ensureInit().then(() => {
            if (!mounted) return;
            Tts.voices().then(list => {
                if (!mounted) return;
                const en = (list || []).filter(
                    v => (v.language || '').toLowerCase().startsWith('en') && !v.notInstalled
                );
                _englishVoiceAvailable = en.length > 0;
                setVoices(en.slice(0, 8));
                // Prefer Samantha > Ava > Alex on iOS
                const pref = ['samantha', 'ava', 'allison', 'nicky', 'alex'];
                const best =
                    en.find(v => pref.some(n => (v.name || '').toLowerCase().includes(n))) ||
                    en[0];
                if (best?.id) {
                    setVoiceIdState(best.id);
                    try { Tts.setDefaultVoice(best.id); } catch (_) { }
                }
            }).catch(() => { });
        });

        const onStart = () => setIsPlaying(true);
        const onFinish = () => setIsPlaying(false);
        const onCancel = () => setIsPlaying(false);
        const onError = () => setIsPlaying(false);

        const subStart = Tts.addEventListener('tts-start', onStart);
        const subFinish = Tts.addEventListener('tts-finish', onFinish);
        const subCancel = Tts.addEventListener('tts-cancel', onCancel);

        cleanupRef.current = [onStart, onFinish, onCancel, onError];

        return () => {
            mounted = false;
            try { Tts.stop(); } catch (_) { }
            if (subStart) subStart.remove();
            if (subFinish) subFinish.remove();
            if (subCancel) subCancel.remove();
        };
    }, []);

    const speakWord = useCallback(async (text) => {
        if (!text?.trim()) return;
        _speakId.current += 1;
        const currentId = _speakId.current;
        try {
            await ensureInit();
            try { Tts.stop(); } catch (e) { }
            await new Promise(r => setTimeout(r, 60));
            // If another speakWord or stopAll was called, abort!
            if (_speakId.current !== currentId) return;

            try { Tts.setDefaultRate(rate); } catch (e) { }

            const options = { rate };
            if (voiceId) options.iosVoiceId = voiceId;
            if (!voiceId && !_englishVoiceAvailable) {
                console.warn('[TTS] No installed English voice found on device. Install an English iOS voice in Settings.');
            }
            Tts.speak(text.trim(), options);
        } catch (_) { }
    }, [rate, voiceId]);

    const stopAll = useCallback(() => {
        _speakId.current += 1;
        try { Tts.stop(); } catch (_) { }
        setIsPlaying(false);
    }, []);

    const setRate = useCallback((r) => {
        setRateState(r);
        try { Tts.setDefaultRate(r); } catch (_) { }
    }, []);

    const setVoiceId = useCallback((id) => {
        setVoiceIdState(id);
        try {
            Tts.setDefaultVoice(id);
            Tts.setDefaultLanguage('en-US'); // Setting voice requires language reset on iOS
        } catch (_) { }
    }, []);

    return { isPlaying, voices, voiceId, rate, speakWord, stopAll, setRate, setVoiceId };
}
