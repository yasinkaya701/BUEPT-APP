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

/**
 * Web Speech Synthesis implementation
 */
const WebTts = {
    speak: (text, options = {}) => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 0.8;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        // Attempt to find a natural English voice
        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0];
        if (bestVoice) utterance.voice = bestVoice;

        utterance.onstart = () => {
            window.dispatchEvent(new CustomEvent('tts-start'));
        };
        utterance.onend = () => {
            window.dispatchEvent(new CustomEvent('tts-finish'));
        };
        utterance.onerror = () => {
            window.dispatchEvent(new CustomEvent('tts-error'));
        };

        window.speechSynthesis.speak(utterance);
    },
    stop: () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            window.dispatchEvent(new CustomEvent('tts-cancel'));
        }
    },
    voices: async () => {
        if (!window.speechSynthesis) return [];
        return window.speechSynthesis.getVoices().map(v => ({
            id: v.name,
            name: v.name,
            language: v.lang,
        }));
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
            _initialized = true;
        } catch (e) {
            console.error('TTS Init Error:', e);
            _initPromise = null;
        }
    })();
    return _initPromise;
}

/** 
 * Forces the engine back to English if it drifted or was reset by the OS.
 */
async function forceEnglish() {
    try {
        await Tts.setDefaultLanguage('en-US');
    } catch (e) {}
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
        const EN_PREFERRED = [
            'samantha', 'ava', 'karen', 'moira', 'nicky',
            'aaron', 'alex', 'allison', 'daniel', 'oliver',
        ];
        const enVoices = (list || []).filter((v) => {
            const lang = (v.language || '').toLowerCase();
            return (lang.startsWith('en') || lang.startsWith('eng')) && !v.notInstalled;
        });
        if (!enVoices.length) return null;
        // Tercih sırasına göre arama
        for (const pref of EN_PREFERRED) {
            const match = enVoices.find((v) => (v.name || '').toLowerCase().includes(pref));
            if (match?.id) return match.id;
        }
        // Tercih bulunamazsa herhangi bir en-US sesi
        return enVoices.find((v) => (v.language || '').toLowerCase().includes('us'))?.id
            || enVoices[0]?.id
            || null;
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

        const rate = customOptions.rate || 0.45;
        // Her seferinde dili en-US'e çek — cihazın dili Türkçe olsa bile
        if (!isWeb) await Tts.setDefaultLanguage('en-US');
        try { if (!isWeb) await Tts.setDefaultRate(rate); } catch (_) { }

        // En iyi İngilizce voice'u bul (veya sabit Samantha ID'lerini dene)
        let voiceId = customOptions.iosVoiceId;
        if (!voiceId) {
            voiceId = await findBestEnglishVoiceId();
        }
        // Samantha'nın bilinen iOS ID'leri — fallback zinciri
        const fallbackIds = [
            'com.apple.ttsbundle.Samantha-compact',
            'com.apple.voice.compact.en-US.Samantha',
            'com.apple.ttsbundle.Ava-compact',
            'com.apple.voice.compact.en-US.Nicky',
        ];

        const speakOptions = {
            rate,
            androidParams: {
                KEY_PARAM_PAN: 0,
                KEY_PARAM_VOLUME: 1,
                KEY_PARAM_STREAM: 'STREAM_MUSIC',
            },
        };
        if (voiceId) {
            speakOptions.iosVoiceId = voiceId;
        } else {
            // Hiç İngilizce ses bulunamazsa language zorlaması yeterli
            speakOptions.iosVoiceId = fallbackIds[0];
        }

        ttsEngine.speak(text.trim(), speakOptions);
    } catch (_) {
        // Sessizce geç — TTS kritik değil
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
            ttsEngine.voices().then(list => {
                if (!mounted) return;
                const en = (list || []).filter(
                    v => {
                        const lang = (v.language || '').toLowerCase();
                        return (lang.startsWith('en') || lang.startsWith('eng')) && !v.notInstalled;
                    }
                );
                _englishVoiceAvailable = en.length > 0;
                setVoices(en.slice(0, 10));
                
                // Prioritize specific high-quality English voices
                const pref = ['samantha', 'ava', 'allison', 'nicky', 'alex', 'daniel', 'karen', 'moira'];
                const best =
                    en.find(v => pref.some(n => (v.name || '').toLowerCase().includes(n))) ||
                    en.find(v => (v.language || '').toLowerCase().includes('us')) ||
                    en[0];

                if (best?.id) {
                    setVoiceIdState(best.id);
                    try { 
                        if (!isWeb) Tts.setDefaultVoice(best.id); 
                        if (!isWeb) Tts.setDefaultLanguage('en-US');
                    } catch (_) { }
                }
            }).catch(() => { });
        });

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
            try { ttsEngine.stop(); } catch (_) { }
            await new Promise(r => setTimeout(r, 60));
            if (_speakId.current !== currentId) return;

            // Her seferinde dili İngilizce'ye çek
            if (!isWeb) await Tts.setDefaultLanguage('en-US');
            try { if (!isWeb) await Tts.setDefaultRate(rate); } catch (_) { }

            // En iyi yüklü İngilizce sesi bul
            let bestId = voiceId;
            if (!bestId) {
                bestId = await findBestEnglishVoiceId();
            }

            const options = { rate };
            options.iosVoiceId = bestId || 'com.apple.ttsbundle.Samantha-compact';

            if (!bestId && !_englishVoiceAvailable) {
                if (!_missingVoiceNoticeLogged && !isWeb) {
                    _missingVoiceNoticeLogged = true;
                    console.log('[TTS] No installed English voice found. Install an English voice in iOS Settings > Accessibility > Spoken Content.');
                }
            }
            ttsEngine.speak(text.trim(), options);
        } catch (_) { }
    }, [rate, voiceId]);

    const stopAll = useCallback(() => {
        _speakId.current += 1;
        try { ttsEngine.stop(); } catch (_) { }
        setIsPlaying(false);
    }, []);

    const setRate = useCallback((r) => {
        setRateState(r);
        try { if (!isWeb) Tts.setDefaultRate(r); } catch (_) { }
    }, []);

    const setVoiceId = useCallback((id) => {
        setVoiceIdState(id);
        try {
            if (!isWeb) Tts.setDefaultVoice(id);
            if (!isWeb) Tts.setDefaultLanguage('en-US'); // Setting voice requires language reset on iOS
        } catch (_) { }
    }, []);

    return { isPlaying, voices, voiceId, rate, speakWord, stopAll, setRate, setVoiceId };
}
