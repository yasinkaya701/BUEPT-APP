/**
 * useTts.js — Central TTS hook for the whole app.
 *
 * Why: iOS requires getInitStatus() before speaking, and the silent switch
 * must be explicitly overridden. All screens should use this hook instead of
 * calling Tts directly to avoid race conditions.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import Tts from 'react-native-tts';

let _initialized = false;
let _initPromise = null;
let _englishVoiceAvailable = false;
let _missingVoiceNoticeLogged = false;

const isWeb = Platform.OS === 'web';

function normalizeWebSpeechRate(rate = 0.5) {
    const safe = Number(rate);
    if (!Number.isFinite(safe)) return 1.0;
    // Native 0.5 is roughly Web 1.0
    return safe * 2;
}

function normalizeNativeSpeechRate(rate = 0.5) {
    const safe = Number(rate);
    if (!Number.isFinite(safe)) return 0.5;
    return safe;
}

function scoreVoiceCandidate(voice = {}) {
    const lang = String(voice?.language || voice?.lang || '').toLowerCase();
    const name = String(voice?.name || '').toLowerCase();
    let total = 0;
    if (lang.startsWith('en-us')) total += 34;
    else if (lang.startsWith('en-gb')) total += 28;
    else if (lang.startsWith('en-au') || lang.startsWith('en-ca')) total += 24;
    else if (lang.startsWith('en')) total += 18;
    if (/premium|enhanced|neural|natural/.test(name)) total += 18;
    if (/samantha|ava|allison|daniel|alex|karen|moira|google/.test(name)) total += 12;
    if (/compact/.test(name)) total -= 4;
    return total;
}

function pickBestWebEnglishVoice(voiceId = '') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const normalizedId = String(voiceId || '').toLowerCase();
    if (!voices.length) return null;
    const byId = voices.find((voice) => {
        const voiceName = String(voice?.name || '').toLowerCase();
        return normalizedId && (voiceName === normalizedId || voiceName.includes(normalizedId));
    });
    if (byId) return byId;

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
 * Web Speech Synthesis implementation
 */
const WebTts = {
    speak: (text, options = {}) => {
        if (!window.speechSynthesis) return;
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.rate = Number.isFinite(Number(options.rate))
            ? Number(options.rate)
            : normalizeWebSpeechRate(0.55);
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        const bestVoice = pickBestWebEnglishVoice(options.iosVoiceId);
        if (bestVoice) utterance.voice = bestVoice;

        utterance.onstart = () => {
            window.dispatchEvent(new window.CustomEvent('tts-start'));
        };
        utterance.onend = () => {
            window.dispatchEvent(new window.CustomEvent('tts-finish'));
        };
        utterance.onerror = () => {
            window.dispatchEvent(new window.CustomEvent('tts-error'));
        };

        window.speechSynthesis.speak(utterance);
    },
    stop: () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            window.dispatchEvent(new window.CustomEvent('tts-cancel'));
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
    },
    addEventListener: (event, cb) => {
        const handler = () => cb();
        window.addEventListener(event, handler);
        return { remove: () => window.removeEventListener(event, handler) };
    }
};

const ttsEngine = isWeb ? WebTts : Tts;

/** Call once to initialise TTS engine. Safe to call multiple times. */
async function ensureInit() {
    if (_initialized) return;
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
        if (isWeb) {
            _initialized = true;
            return;
        }
        try {
            await Tts.getInitStatus();
            await Tts.setDefaultLanguage('en-US');
            await Tts.setIgnoreSilentSwitch('ignore');
            try { await Tts.setDefaultPitch(1.0); } catch (_) { }
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
// iOS'ta yüklü olan İngilizce sesleri arar
async function findBestEnglishVoiceId() {
    if (isWeb) return 'web-default';
    try {
        const list = await Tts.voices();
        // Priority ranking for natural sounding voices
        const ranked = (list || [])
            .filter((v) => {
                const lang = (v.language || '').toLowerCase();
                return (lang.startsWith('en') || lang.startsWith('eng')) && !v.notInstalled;
            })
            .sort((a, b) => scoreVoiceCandidate(b) - scoreVoiceCandidate(a));
        
        return ranked[0]?.id || null;
    } catch (_) {
        return null;
    }
}

export async function speakText(text, customOptions = {}) {
    if (!text?.trim()) return;
    try {
        await ensureInit();
        try { ttsEngine.stop(); } catch (_) { }
        await new Promise(r => setTimeout(r, 60));

        // Natural variation for "Lecture Mode"
        const isLecture = customOptions.isLecture;
        const baseRate = Number.isFinite(Number(customOptions.rate)) ? Number(customOptions.rate) : 0.55;
        
        // Add subtle variation if in lecture mode to sound more natural
        const variation = isLecture ? (Math.random() * 0.04 - 0.02) : 0;
        const semanticRate = baseRate + variation;
        const nativeRate = normalizeNativeSpeechRate(semanticRate);
        const pitch = isLecture ? (1.0 + (Math.random() * 0.1 - 0.05)) : 1.0;

        if (!isWeb) await Tts.setDefaultLanguage('en-US');
        try { if (!isWeb) await Tts.setDefaultRate(nativeRate); } catch (_) { }
        try { if (!isWeb) await Tts.setDefaultPitch(pitch); } catch (_) { }

        let voiceId = customOptions.iosVoiceId;
        if (!voiceId) {
            voiceId = await findBestEnglishVoiceId();
        }

        const speakOptions = {
            rate: isWeb ? normalizeWebSpeechRate(semanticRate) : nativeRate,
            androidParams: {
                KEY_PARAM_PAN: 0,
                KEY_PARAM_VOLUME: 1,
                KEY_PARAM_STREAM: 'STREAM_MUSIC',
            },
        };
        if (voiceId) {
            speakOptions.iosVoiceId = voiceId;
        }

        ttsEngine.speak(text.trim(), speakOptions);
    } catch (_) {
        // Sessizce geç
    }
}

/**
 * React hook — provides speakWord, isPlaying, available voices.
 * Also returns a stopAll() and a setRate() helper.
 */
export function useTts() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [voices, setVoices] = useState([]);
    const [activeVoiceId, setActiveVoiceIdState] = useState('');
    const [rate, setRateState] = useState(0.55);
    const [useExperimental, setUseExperimental] = useState(isWeb); // On by default for Web for "Real Person" feel
    const [apiEndpoint, setApiEndpoint] = useState('https://translate.google.com/translate_tts?ie=UTF-8&q={{TEXT}}&tl=en&client=tw-ob'); 
    const cleanupRef = useRef([]);
    const _speakId = useRef(0);
    const audioRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const applyVoiceList = (list = []) => {
            if (!mounted) return;
            const en = (list || []).filter(
                v => {
                    const lang = (v.language || '').toLowerCase();
                    return (lang.startsWith('en') || lang.startsWith('eng')) && !v.notInstalled;
                }
            );
            en.sort((a, b) => scoreVoiceCandidate(b) - scoreVoiceCandidate(a));
            _englishVoiceAvailable = en.length > 0;
            setVoices(en.slice(0, 6));
            
            const pref = ['daniel', 'google us english', 'samantha', 'ava', 'allison', 'nicky', 'alex', 'karen', 'moira'];
            const best =
                en.find(v => pref.some(n => (v.name || '').toLowerCase().includes(n))) ||
                en.find(v => (v.language || '').toLowerCase().includes('us')) ||
                en[0];

            if (best?.id) {
                setActiveVoiceIdState(best.id);
                try { 
                    if (!isWeb) Tts.setDefaultVoice(best.id); 
                    if (!isWeb) Tts.setDefaultLanguage('en-US');
                } catch (_) { }
            }
        };

        ensureInit().then(() => {
            if (!mounted) return;
            ttsEngine.voices().then(list => {
                applyVoiceList(list);
            }).catch(() => { });
        });

        let removeVoicesChanged = null;
        if (isWeb && typeof window !== 'undefined' && window.speechSynthesis?.addEventListener) {
            const refreshVoices = () => {
                ttsEngine.voices().then((list) => applyVoiceList(list)).catch(() => {});
            };
            window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
            removeVoicesChanged = () => window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
        }

        const onStart = () => setIsPlaying(true);
        const onFinish = () => setIsPlaying(false);
        const onCancel = () => setIsPlaying(false);
        const onError = () => setIsPlaying(false);

        const subStart = ttsEngine.addEventListener('tts-start', onStart);
        const subFinish = ttsEngine.addEventListener('tts-finish', onFinish);
        const subCancel = ttsEngine.addEventListener('tts-cancel', onCancel);

        cleanupRef.current = [onStart, onFinish, onCancel, onError];

        return () => {
            mounted = false;
            try { ttsEngine.stop(); } catch (_) { }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (subStart) subStart.remove();
            if (subFinish) subFinish.remove();
            if (subCancel) subCancel.remove();
            if (removeVoicesChanged) removeVoicesChanged();
        };
    }, []);

    const speakWord = useCallback(async (text, options = {}) => {
        if (!text?.trim()) return;
        _speakId.current += 1;
        const currentId = _speakId.current;

        // "Real Human" Model (GitHub/Web Neural Fallback)
        if (useExperimental && isWeb) {
            setIsPlaying(true);
            try {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                }
                const encoded = encodeURIComponent(text.trim().slice(0, 200)); // Google limits to 200 chars per request
                const url = apiEndpoint.replace('{{TEXT}}', encoded);
                
                const audio = new Audio(url);
                audioRef.current = audio;
                audio.playbackRate = rate * 2; // Normalize to human speed
                audio.onended = () => {
                    if (currentId === _speakId.current) setIsPlaying(false);
                };
                audio.onerror = () => {
                    console.warn('Natural TTS failed, falling back to system.');
                    setUseExperimental(false);
                };
                await audio.play();
                return;
            } catch (e) {
                console.warn('Natural TTS play failed.', e);
            }
        }

        try {
            await ensureInit();
            try { ttsEngine.stop(); } catch (_) { }
            await new Promise(r => setTimeout(r, 60));
            if (_speakId.current !== currentId) return;

            if (!isWeb) await Tts.setDefaultLanguage('en-US');

            const isLecture = options?.isLecture;
            const variation = isLecture ? (Math.random() * 0.04 - 0.02) : 0;
            const effectiveRate = isWeb ? Number(rate + variation) : normalizeNativeSpeechRate(rate + variation);
            const pitch = isLecture ? (1.0 + (Math.random() * 0.08 - 0.04)) : 1.0;

            try { if (!isWeb) await Tts.setDefaultRate(effectiveRate); } catch (_) { }
            try { if (!isWeb) await Tts.setDefaultPitch(pitch); } catch (_) { }

            let bestId = activeVoiceId;
            if (!bestId) {
                bestId = await findBestEnglishVoiceId();
            }

            const speakOptions = { rate: isWeb ? normalizeWebSpeechRate(rate + variation) : effectiveRate };
            speakOptions.iosVoiceId = bestId || 'com.apple.ttsbundle.Samantha-compact';
            speakOptions.isLecture = isLecture;

            ttsEngine.speak(text.trim(), speakOptions);
        } catch (_) { }
    }, [rate, activeVoiceId, useExperimental, apiEndpoint]);

    const speakWordAsync = useCallback(async (text, options = {}) => {
        if (!text?.trim()) return;
        if (useExperimental && isWeb) {
            await speakWord(text, options);
            // Real human audio duration estimation (roughly 1 sec per 15 chars)
            await new Promise(r => {
                const timer = setTimeout(r, Math.max(1000, text.length * 75));
                if (audioRef.current) {
                    audioRef.current.onended = () => {
                        clearTimeout(timer);
                        r();
                    };
                }
            });
            return;
        }
        
        // ... rest of the existing async logic ...
        await new Promise((resolve) => {
            let settled = false;
            const settle = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                finishSub?.remove?.();
                cancelSub?.remove?.();
                errorSub?.remove?.();
                resolve();
            };
            const finishSub = ttsEngine.addEventListener('tts-finish', settle);
            const cancelSub = ttsEngine.addEventListener('tts-cancel', settle);
            const errorSub = ttsEngine.addEventListener('tts-error', settle);
            const timer = setTimeout(settle, Math.max(2200, String(text).length * 90));
            speakWord(text, options).catch(settle);
        });
    }, [speakWord, useExperimental]);

    const stopAll = useCallback(() => {
        _speakId.current += 1;
        try { ttsEngine.stop(); } catch (_) { }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
        setIsPlaying(false);
    }, []);

    const setRate = useCallback((r) => {
        setRateState(r);
        try { if (!isWeb) Tts.setDefaultRate(normalizeNativeSpeechRate(r)); } catch (_) { }
    }, []);

    const setVoiceId = useCallback((id) => {
        setActiveVoiceIdState(id);
        try {
            if (!isWeb) Tts.setDefaultVoice(id);
            if (!isWeb) Tts.setDefaultLanguage('en-US');
        } catch (_) { }
    }, []);

    return { 
        isPlaying, voices, activeVoiceId, rate, 
        useExperimental, setUseExperimental, apiEndpoint, setApiEndpoint,
        speakWord, speakWordAsync, stopAll, setRate, setVoiceId 
    };
}
