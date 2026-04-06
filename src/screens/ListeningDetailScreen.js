/**
 * ListeningDetailScreen.js
 * – useTts hook (iOS silent switch fix, proper init)
 * – Animated sentence highlight with left-border progress bar
 * – Word-level tap pronunciation
 * – Play/Pause, speed (0.3–1.0), voice selector
 */
import React, {
  useEffect, useMemo, useRef, useState, useCallback
} from 'react';
import {
  Text, StyleSheet, View, TouchableOpacity,
  ScrollView, Animated, TextInput, Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTts } from '../hooks/useTts';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, spacing, typography } from '../theme/tokens';
import baseTasks from '../../data/listening_tasks.json';
import hardTasks from '../../data/listening_tasks_hard.json';
import { useAppState } from '../context/AppState';
import { buildSimilarQuestion } from '../utils/similarQuestion';
import { buildListeningOpenEndedPrompts } from '../utils/openEndedPrompts';
import { deriveListeningKeywords, evaluateListeningModel } from '../utils/listeningModel';

const tasks = [...baseTasks, ...hardTasks];
const RATES = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0];
const SIGNPOSTS = [
  'however',
  'therefore',
  'in conclusion',
  'for example',
  'on the other hand',
  'as a result',
  'in contrast',
  'first',
  'second',
  'finally',
];
const LISTENING_VOCAB_STOPWORDS = new Set([
  'the', 'and', 'that', 'with', 'from', 'this', 'have', 'were', 'when', 'what', 'which', 'while',
  'where', 'would', 'there', 'their', 'about', 'into', 'after', 'before', 'between', 'because',
  'through', 'under', 'among', 'during', 'being', 'over', 'could', 'should', 'might', 'must',
  'speaker', 'question', 'option', 'correct', 'answer', 'audio', 'passage', 'listening',
]);

function buildListeningFeedback(task, answers = {}) {
  const qs = task?.questions || [];
  const total = qs.length;
  if (!total) return null;
  let correct = 0;
  const missed = [];
  qs.forEach((q, i) => {
    if (answers[i] === q.answer) correct += 1;
    else missed.push({ index: i + 1, q: q.q, explain: q.explain });
  });
  const accuracy = Math.round((correct / total) * 100);
  const strengths = [];
  const fixes = [];
  if (accuracy >= 80) strengths.push('Strong gist and detail comprehension.');
  if (accuracy >= 60) strengths.push('Core ideas are mostly understood.');
  if (accuracy < 60) fixes.push('Replay once at 0.6x and write 5 keywords per paragraph.');
  if (missed.length >= 2) fixes.push('Focus on qualifiers (however, although, mainly, only, at least).');
  if (missed.length >= 3) fixes.push('Do not choose answer early; wait until full option is confirmed.');
  const retryPlan = [
    'First listen: main idea only',
    'Second listen: note numbers/names/contrast words',
    'Final pass: verify 2 doubtful questions',
  ];
  return { total, correct, accuracy, missed, strengths, fixes, retryPlan };
}

function splitIntoSentences(text) {
  if (!text) return [];
  return (text.match(/[^.!?]+[.!?]*/g) || [text]).map(s => s.trim()).filter(Boolean);
}

// Estimate ms per sentence based on word count and rate
function msPerSentence(sentence, rate) {
  const words = sentence.split(/\s+/).length;
  const wpm = 150 * rate; // baseline 150 wpm at rate=1
  return Math.max(1500, (words / wpm) * 60000);
}

function normalizeDictationText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDictationTarget(sentences = [], seed = 0) {
  if (!sentences.length) return null;
  const base = sentences[seed % sentences.length] || sentences[0];
  const words = base.split(/\s+/);
  if (words.length < 6) return { masked: base, original: base };
  const hideIndexes = [1, Math.floor(words.length / 2), words.length - 2]
    .filter((idx, i, arr) => idx > 0 && idx < words.length && arr.indexOf(idx) === i);
  const maskedWords = words.map((w, i) => (hideIndexes.includes(i) ? '____' : w));
  return { original: base, masked: maskedWords.join(' ') };
}

function detectSignposts(text = '') {
  const lower = String(text || '').toLowerCase();
  return SIGNPOSTS.filter((item) => lower.includes(item));
}

function parsePredictionKeywords(text = '') {
  return Array.from(
    new Set(
      String(text || '')
        .toLowerCase()
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 3)
    )
  ).slice(0, 8);
}

function extractListeningTokens(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !LISTENING_VOCAB_STOPWORDS.has(word));
}

function ModelBar({ label, value }) {
  return (
    <View style={styles.modelBarBlock}>
      <View style={styles.modelBarHeader}>
        <Text style={styles.modelBarLabel}>{label}</Text>
        <Text style={styles.modelBarValue}>{value}%</Text>
      </View>
      <View style={styles.modelBarTrack}>
        <View style={[styles.modelBarFill, { width: `${Math.max(0, Math.min(100, Number(value || 0)))}%` }]} />
      </View>
    </View>
  );
}

export default function ListeningDetailScreen({ route, navigation }) {
  const taskId = route?.params?.taskId;
  const task = useMemo(
    () => tasks.find(t => t.id === taskId) || tasks[0],
    [taskId]
  );
  const openEndedPrompts = useMemo(() => buildListeningOpenEndedPrompts(task), [task]);
  const sentences = useMemo(() => splitIntoSentences(task.transcript), [task]);

  // ── TTS hook ──────────────────────────────────────────────────────────────
  const { isPlaying, voices, voiceId, rate, speakWord, stopAll, setRate, setVoiceId } = useTts();

  // ── State ─────────────────────────────────────────────────────────────────
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [checked, setChecked] = useState(false);
  const [activeSentence, setActiveSentence] = useState(-1);
  const [showTranscript, setShowTranscript] = useState(true);
  const [similarQuestions, setSimilarQuestions] = useState({});
  const [similarAnswers, setSimilarAnswers] = useState({});
  const [similarChecked, setSimilarChecked] = useState({});
  const [similarSeed, setSimilarSeed] = useState(1);
  const [shadowIndex, setShadowIndex] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [dictationSeed, setDictationSeed] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationResult, setDictationResult] = useState(null);
  const [listeningModel, setListeningModel] = useState(null);
  const [followTranscript, setFollowTranscript] = useState(true);
  const [shadowingMode, setShadowingMode] = useState(false);
  const [shadowingAuto, setShadowingAuto] = useState(false);
  const [predictionDraft, setPredictionDraft] = useState({
    gist: '',
    keywords: '',
    trap: '',
  });
  const [predictionLocked, setPredictionLocked] = useState(false);
  const listeningFeedback = useMemo(() => (checked ? buildListeningFeedback(task, answers) : null), [checked, task, answers]);
  const derivedKeywords = useMemo(() => deriveListeningKeywords(task), [task]);
  const keywordScore = useMemo(() => {
    const keys = derivedKeywords.map((k) => String(k || '').toLowerCase());
    if (!keys.length) return { used: 0, total: 0 };
    const lowerNotes = String(noteText || '').toLowerCase();
    const used = keys.filter((k) => lowerNotes.includes(k)).length;
    return { used, total: keys.length };
  }, [derivedKeywords, noteText]);
  const dictationTarget = useMemo(() => buildDictationTarget(sentences, dictationSeed), [sentences, dictationSeed]);
  const signposts = useMemo(() => detectSignposts(task?.transcript || ''), [task?.transcript]);
  const predictedKeywordList = useMemo(
    () => parsePredictionKeywords(predictionDraft.keywords),
    [predictionDraft.keywords]
  );
  const predictionReady = useMemo(
    () =>
      predictionDraft.gist.trim().length >= 16 &&
      predictedKeywordList.length >= 2 &&
      predictionDraft.trap.trim().length >= 8,
    [predictionDraft.gist, predictedKeywordList, predictionDraft.trap]
  );

  const intervalRef = useRef(null);
  const sentenceIdxRef = useRef(0);
  const shadowTimerRef = useRef(null);
  const shadowingAutoRef = useRef(false);
  const transcriptScrollRef = useRef(null);
  const sentenceOffsetsRef = useRef({});
  const webviewRef = useRef(null);
  const [webviewPlaying, setWebviewPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const { addListeningResult, addUnknownWord } = useAppState();

  const getExplanation = useCallback((q, selected) => {
    if (q.explain) return q.explain;
    if (selected !== q.answer) {
      return `Your choice is not supported by the audio. The correct answer "${q.options[q.answer]}" is confirmed by the transcript.`;
    }
    return `Correct: "${q.options[q.answer]}". This is stated in the listening passage.`;
  }, []);

  const mistakeItems = useMemo(() => {
    if (!checked || !task?.questions?.length) return [];
    return task.questions.map((q, i) => {
      const selected = answers[i];
      if (selected === q.answer) return null;
      return {
        id: `${task.id || 'listening'}-${i}`,
        module: 'listening',
        moduleLabel: 'Listening',
        taskTitle: task.title || 'Listening Practice',
        question: q.q || 'Question',
        options: q.options || [],
        correctIndex: q.answer,
        selectedIndex: Number.isFinite(selected) ? selected : null,
        explanation: getExplanation(q, selected),
        context: task.transcript || '',
        skill: q.skill || 'comprehension',
      };
    }).filter(Boolean);
  }, [checked, task, answers, getExplanation]);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Stop when unmounting
  useEffect(() => () => {
    stopAll();
    clearInterval(intervalRef.current);
    if (intervalRef._timeouts) {
      intervalRef._timeouts.forEach(clearTimeout);
      intervalRef._timeouts = [];
    }
    shadowingAutoRef.current = false;
    if (shadowTimerRef.current) clearTimeout(shadowTimerRef.current);
  }, [stopAll]);

  // ── Sentence progress interval ────────────────────────────────────────────
  const startSentenceProgress = useCallback(() => {
    sentenceIdxRef.current = 0;
    setActiveSentence(0);
    clearInterval(intervalRef.current);

    // Schedule each sentence switch based on its word count
    let elapsed = 0;
    sentences.forEach((s, i) => {
      if (i === 0) return; // Already at 0
      const delay = msPerSentence(sentences[i - 1], rate);
      elapsed += delay;
      const t = setTimeout(() => {
        sentenceIdxRef.current = i;
        setActiveSentence(i);
        Animated.sequence([
          Animated.timing(highlightAnim, { toValue: 0, duration: 80, useNativeDriver: false }),
          Animated.timing(highlightAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]).start();
      }, elapsed);
      // Store timeouts to clear on stop
      if (!intervalRef._timeouts) intervalRef._timeouts = [];
      intervalRef._timeouts.push(t);
    });
    highlightAnim.setValue(1);
  }, [sentences, rate, highlightAnim]);

  const clearProgress = useCallback(() => {
    clearInterval(intervalRef.current);
    if (intervalRef._timeouts) {
      intervalRef._timeouts.forEach(clearTimeout);
      intervalRef._timeouts = [];
    }
    setActiveSentence(-1);
  }, []);

  const stopShadowingAuto = useCallback(() => {
    shadowingAutoRef.current = false;
    setShadowingAuto(false);
    if (shadowTimerRef.current) {
      clearTimeout(shadowTimerRef.current);
      shadowTimerRef.current = null;
    }
  }, []);

  const playShadowSentence = useCallback((index) => {
    const sentence = sentences[index] || '';
    if (!sentence) return;
    setShadowIndex(index);
    setActiveSentence(index);
    speakWord(sentence);
  }, [sentences, speakWord]);

  const runShadowingSequence = useCallback((startIndex = 0) => {
    if (!sentences.length) return;
    stopAll();
    clearProgress();
    clearTimeout(shadowTimerRef.current);
    shadowingAutoRef.current = true;
    setShadowingAuto(true);
    const run = (index) => {
      if (!shadowingAutoRef.current) return;
      if (index >= sentences.length) {
        stopShadowingAuto();
        setActiveSentence(-1);
        return;
      }
      playShadowSentence(index);
      const waitMs = msPerSentence(sentences[index], Math.max(0.3, rate)) + 1400;
      shadowTimerRef.current = setTimeout(() => run(index + 1), waitMs);
    };
    run(Math.max(0, Math.min(sentences.length - 1, startIndex)));
  }, [sentences, rate, stopAll, clearProgress, playShadowSentence, stopShadowingAuto]);

  // Listen for TTS finish
  useEffect(() => {
    const onFinish = () => clearProgress();
    const onCancel = () => clearProgress();
    
    // We already have useTts polyfilled, but if this screen uses 
    // internal listeners, they should be platform-gated or use the hook.
    if (Platform.OS !== 'web') {
      // Direct native listeners if needed, but hook is preferred.
    }
  }, [clearProgress]);

  useEffect(() => {
    if (!followTranscript || activeSentence < 0) return;
    const y = sentenceOffsetsRef.current[activeSentence];
    if (Number.isFinite(y)) {
      transcriptScrollRef.current?.scrollTo({
        y: Math.max(0, y - spacing.sm),
        animated: true,
      });
    }
  }, [activeSentence, followTranscript]);

  useEffect(() => {
    stopShadowingAuto();
    setPredictionDraft({ gist: '', keywords: '', trap: '' });
    setPredictionLocked(false);
    setAnswers({});
    setChecked(false);
    setScore(null);
  }, [task?.id, stopShadowingAuto]);

  useEffect(() => {
    if (!shadowingMode) stopShadowingAuto();
  }, [shadowingMode, stopShadowingAuto]);

  // ── Play / Pause ──────────────────────────────────────────────────────────
  const handleWebviewMessage = (event) => {
    const msg = event.nativeEvent.data;
    if (msg.startsWith('playing:') || msg.startsWith('next:')) {
      const idx = parseInt(msg.split(':')[1], 10);
      setActiveSentence(idx);
      setWebviewPlaying(true);
      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 0, duration: 80, useNativeDriver: false }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]).start();
    } else if (msg === 'ended') {
      setWebviewPlaying(false);
      setActiveSentence(-1);
      stopShadowingAuto();
    }
  };

  const handlePlayPause = useCallback(async () => {
    if (shadowingMode) {
      if (shadowingAuto) {
        stopShadowingAuto();
        return;
      }
      setWebviewPlaying(false);
      webviewRef.current?.injectJavaScript(`if(window.currentAudio){window.currentAudio.pause();}`);
      runShadowingSequence(shadowIndex || 0);
      return;
    }

    if (webviewPlaying || isPlaying) {
      stopAll();
      clearProgress();
      stopShadowingAuto();
      setWebviewPlaying(false);
      webviewRef.current?.injectJavaScript(`if(window.currentAudio){window.currentAudio.pause();}`);
      return;
    }

    stopShadowingAuto();
    setWebviewPlaying(true);
    
    // Fallback logic: Native MP3 URL vs Voice TTS (now polyfilled for web)
    if (Platform.OS === 'web') {
      if (task.audioUrl) {
        if (window._currentAudio) { window._currentAudio.pause(); }
        const audio = new window.Audio(task.audioUrl);
        window._currentAudio = audio;
        audio.playbackRate = rate;
        audio.onplay = () => {
          setWebviewPlaying(true);
          setActiveSentence(0);
        };
        audio.onended = function() {
          setWebviewPlaying(false);
          setActiveSentence(-1);
          stopShadowingAuto();
        };
        audio.play().catch(e => console.log('Audio blocked:', e));
        setWebviewPlaying(true);
      } else {
        // useTts will now handle the transcription readout via runShadowingSequence
        stopAll();
        runShadowingSequence(0);
      }
      return;
    }

    if (task.audioUrl) {
      const script = `
          if(window.currentAudio) { window.currentAudio.pause(); }
          window.currentAudio = new Audio('${task.audioUrl}');
          window.currentAudio.playbackRate = ${rate};
          window.currentAudio.onended = function() {
              window.ReactNativeWebView.postMessage('ended');
          };
          window.currentAudio.play();
          window.ReactNativeWebView.postMessage('playing:0'); // Generic playing state
          true;
      `;
      webviewRef.current?.injectJavaScript(script);
      
      startSentenceProgress();
    } else {
      // Play using Google Translate Neural TTS Chunking
      const urls = sentences.map(s => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&hl=en-US&q=${encodeURIComponent(s.slice(0, 199))}`);
      const script = `
          window.audioList = ${JSON.stringify(urls)};
          window.audioIdx = 0;
          if(window.currentAudio) { window.currentAudio.pause(); }
          window.currentAudio = new Audio(window.audioList[window.audioIdx]);
          window.currentAudio.playbackRate = ${rate};
          window.currentAudio.onended = function() {
             window.audioIdx++;
             if (window.audioIdx < window.audioList.length) {
                window.currentAudio.src = window.audioList[window.audioIdx];
                window.currentAudio.playbackRate = ${rate};
                window.currentAudio.play();
                window.ReactNativeWebView.postMessage('next:' + window.audioIdx);
             } else {
                window.ReactNativeWebView.postMessage('ended');
             }
          };
          window.currentAudio.play();
          window.ReactNativeWebView.postMessage('playing:0');
          true;
      `;
      webviewRef.current?.injectJavaScript(script);
    }
  }, [
    shadowingMode,
    shadowingAuto,
    stopShadowingAuto,
    runShadowingSequence,
    shadowIndex,
    webviewPlaying,
    isPlaying,
    stopAll,
    clearProgress,
    sentences,
    rate,
    task.audioUrl,
    startSentenceProgress,
  ]);

  // ── Answers / Score ───────────────────────────────────────────────────────
  const select = (qi, oi) => {
    if (!checked && predictionLocked) setAnswers(p => ({ ...p, [qi]: oi }));
  };

  const check = () => {
    if (checked) return;
    if (!predictionLocked) return;
    let correct = 0;
    task.questions?.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(`${correct} / ${task.questions?.length}`);
    addListeningResult({ taskId: task.id, score: correct, total: task.questions?.length });

    const listeningWordPool = [];
    (task.questions || []).forEach((question, index) => {
      if (answers[index] === question?.answer) return;
      listeningWordPool.push(...extractListeningTokens(question?.q || ''));
      const correctOption = Array.isArray(question?.options) ? question.options[question.answer] : '';
      listeningWordPool.push(...extractListeningTokens(correctOption || ''));
      listeningWordPool.push(...extractListeningTokens(question?.explain || ''));
    });
    const listeningWords = Array.from(
      new Set([
        ...listeningWordPool,
        ...derivedKeywords,
      ]
        .map((word) => String(word || '').toLowerCase().trim())
        .filter((word) => word.length >= 4))
    ).slice(0, 18);
    listeningWords.forEach((word) => {
      addUnknownWord({
        word,
        source: 'listening',
        sourceModule: 'listening',
        sourceTaskId: task?.id || '',
        sourceTitle: task?.title || '',
      });
    });

    setListeningModel(evaluateListeningModel({
      task,
      answers,
      noteText,
      dictationResult,
      signposts,
    }));
    setChecked(true);
  };

  const createSimilar = (qi) => {
    const base = task.questions[qi];
    if (!base) return;
    const gen = buildSimilarQuestion(base, similarSeed + qi);
    setSimilarQuestions(p => ({ ...p, [qi]: gen }));
    setSimilarSeed(s => s + 1);
    setSimilarAnswers(p => ({ ...p, [qi]: null }));
    setSimilarChecked(p => ({ ...p, [qi]: false }));
  };

  const checkDictation = () => {
    if (!dictationTarget?.original) return;
    const typed = normalizeDictationText(dictationInput);
    const expected = normalizeDictationText(dictationTarget.original);
    if (!typed) {
      setDictationResult({ ok: false, score: 0, message: 'Type what you hear first.' });
      return;
    }
    const typedWords = typed.split(' ');
    const expectedWords = expected.split(' ');
    let match = 0;
    expectedWords.forEach((w, i) => {
      if (typedWords[i] === w) match += 1;
    });
    const scorePct = Math.round((match / Math.max(1, expectedWords.length)) * 100);
    setDictationResult({
      ok: scorePct >= 70,
      score: scorePct,
      message: scorePct >= 70 ? 'Good dictation accuracy.' : 'Replay and focus on missing words.',
    });
  };

  const nextDictation = () => {
    setDictationSeed((s) => s + 1);
    setDictationInput('');
    setDictationResult(null);
  };

  const lockPrediction = () => {
    if (!predictionReady) return;
    setPredictionLocked(true);
  };

  const editPrediction = () => {
    setPredictionLocked(false);
    setAnswers({});
    setChecked(false);
    setScore(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;

  return (
    <Screen scroll contentStyle={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.h1}>{task.title}</Text>
        <Text style={styles.sub}>Level {task.level} • {task.skill}</Text>

        {/* ── Player Card ── */}
        <Card style={styles.playerCard}>
          {/* Play / Pause */}
          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} activeOpacity={0.85}>
            <Text style={styles.playIcon}>
              {shadowingMode ? (shadowingAuto ? '⏹' : '🎙') : webviewPlaying || isPlaying ? '⏸' : '▶'}
            </Text>
            <Text style={styles.playLabel}>
              {shadowingMode
                ? shadowingAuto ? 'Stop Shadowing' : 'Start Shadowing'
                : webviewPlaying || isPlaying ? 'Pause' : 'Play Audio'}
            </Text>
          </TouchableOpacity>

          <View style={styles.modeSwitchRow}>
            <TouchableOpacity
              style={[styles.modeSwitch, !shadowingMode && styles.modeSwitchActive]}
              onPress={() => setShadowingMode(false)}
            >
              <Text style={[styles.modeSwitchText, !shadowingMode && styles.modeSwitchTextActive]}>Audio Track</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeSwitch, shadowingMode && styles.modeSwitchActive]}
              onPress={() => setShadowingMode(true)}
            >
              <Text style={[styles.modeSwitchText, shadowingMode && styles.modeSwitchTextActive]}>Shadowing Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeSwitch, followTranscript && styles.modeSwitchActive]}
              onPress={() => setFollowTranscript((value) => !value)}
            >
              <Text style={[styles.modeSwitchText, followTranscript && styles.modeSwitchTextActive]}>
                Follow Transcript {followTranscript ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Speed selector */}
          <Text style={styles.controlLabel}>Speed</Text>
          <View style={styles.rateRow}>
            {RATES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rateBtn, rate === r && styles.rateBtnActive]}
                onPress={() => { setRate(r); if (isPlaying) { stopAll(); clearProgress(); } }}
              >
                <Text style={[styles.rateTxt, rate === r && styles.rateTxtActive]}>{r}x</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Voice selector */}
          {voices.length > 1 && (
            <>
              <Text style={styles.controlLabel}>Voice</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.voiceRow}>
                  {voices.map(v => (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.voiceBtn, voiceId === v.id && styles.voiceBtnActive]}
                      onPress={() => setVoiceId(v.id)}
                    >
                      <Text style={[styles.voiceTxt, voiceId === v.id && styles.voiceTxtActive]}>
                        {(v.name || v.id).replace('com.apple.ttsbundle.', '').replace(/-compact/i, '').split('.').pop()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </Card>

        {/* ── Transcript ── */}
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.transcriptHeader}
            onPress={() => setShowTranscript(s => !s)}
          >
            <Text style={styles.h3}>Transcript</Text>
            <Text style={styles.toggleIcon}>{showTranscript ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showTranscript ? (
            <ScrollView
              ref={transcriptScrollRef}
              style={styles.transcriptScroll}
              contentContainerStyle={styles.transcriptScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {sentences.map((sentence, si) => {
                const isActive = activeSentence === si;
                return (
                  <View
                    key={si}
                    style={[styles.sentenceRow, isActive && styles.sentenceRowActive]}
                    onLayout={(event) => {
                      sentenceOffsetsRef.current[si] = event.nativeEvent.layout.y;
                    }}
                  >
                    {/* Left bar */}
                    <Animated.View style={[
                      styles.sentenceBar,
                      isActive && styles.sentenceBarActive,
                    ]} />
                    <View style={styles.sentenceWords}>
                      {sentence.split(' ').map((word, wi) => {
                        const clean = word.replace(/[^A-Za-z'-]/g, '');
                        return (
                          <TouchableOpacity
                            key={wi}
                            onPress={() => clean && speakWord(clean)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.wordText, isActive && styles.wordTextActive]}>
                              {word}{' '}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Prediction Step (Before Questions)</Text>
          <Text style={styles.sub}>Predict main idea, expected keywords, and one common trap before solving.</Text>
          {predictionLocked ? (
            <View style={styles.predictionLockedBox}>
              <Text style={styles.bodyLine}>Main idea: {predictionDraft.gist}</Text>
              <Text style={styles.bodyLine}>Keywords: {predictedKeywordList.join(', ')}</Text>
              <Text style={styles.bodyLine}>Trap to avoid: {predictionDraft.trap}</Text>
              <View style={styles.row}>
                <Button label="Edit Prediction" variant="secondary" onPress={editPrediction} />
              </View>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.predictionInput}
                value={predictionDraft.gist}
                onChangeText={(value) => setPredictionDraft((prev) => ({ ...prev, gist: value }))}
                placeholder="What do you think the passage is mainly about?"
                placeholderTextColor={colors.muted}
              />
              <TextInput
                style={styles.predictionInput}
                value={predictionDraft.keywords}
                onChangeText={(value) => setPredictionDraft((prev) => ({ ...prev, keywords: value }))}
                placeholder="Predict at least 2 keywords (comma separated)"
                placeholderTextColor={colors.muted}
              />
              <TextInput
                style={styles.predictionInput}
                value={predictionDraft.trap}
                onChangeText={(value) => setPredictionDraft((prev) => ({ ...prev, trap: value }))}
                placeholder="What trap answer should you avoid?"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.sub}>
                Suggested keywords: {derivedKeywords.slice(0, 6).join(', ') || 'No keyword hints'}
              </Text>
              <View style={styles.row}>
                <Button label="Lock Prediction & Start Questions" onPress={lockPrediction} disabled={!predictionReady} />
              </View>
            </>
          )}
        </Card>

        <OpenEndedPracticeCard
          title="Open-Ended Listening Questions"
          prompts={openEndedPrompts}
          idealClusters={task?.ideal_clusters || null}
          placeholder="Write your listening response..."
        />

        <Card style={styles.card}>
          <Text style={styles.h3}>Shadowing Drill</Text>
          <Text style={styles.sub}>Repeat sentence-by-sentence after audio. Auto mode follows current speed ({rate}x).</Text>
          <View style={styles.shadowBox}>
            <Text style={styles.sub}>Sentence {Math.min(shadowIndex + 1, sentences.length)}/{sentences.length}</Text>
            <Text style={styles.shadowSentence}>{sentences[shadowIndex] || 'No sentence found.'}</Text>
            <View style={styles.row}>
              <Button label="Prev" variant="secondary" onPress={() => setShadowIndex((i) => Math.max(0, i - 1))} disabled={shadowIndex <= 0} />
              <Button
                label="Play"
                variant="secondary"
                onPress={() => {
                  stopShadowingAuto();
                  playShadowSentence(shadowIndex);
                }}
              />
              <Button label="Next" onPress={() => setShadowIndex((i) => Math.min(sentences.length - 1, i + 1))} disabled={shadowIndex >= sentences.length - 1} />
            </View>
            <View style={styles.row}>
              <Button
                label={shadowingAuto ? 'Stop Auto Shadowing' : 'Start Auto Shadowing'}
                variant={shadowingAuto ? 'secondary' : 'primary'}
                onPress={() => {
                  if (shadowingAuto) stopShadowingAuto();
                  else runShadowingSequence(shadowIndex);
                }}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Cornell Notes</Text>
          <Text style={styles.sub}>Aim to capture these high-value lecture words: {derivedKeywords.slice(0, 6).join(', ') || 'No keyword set available.'}</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Main ideas, evidence, examples..."
            textAlignVertical="top"
          />
          <Text style={styles.sub}>Keyword coverage: {keywordScore.used}/{keywordScore.total}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Signpost Detector</Text>
          <Text style={styles.sub}>Listen for transition signals to catch structure faster.</Text>
          <View style={styles.signpostRow}>
            {signposts.length > 0 ? signposts.map((sp) => (
              <TouchableOpacity key={sp} style={styles.signpostChip} onPress={() => speakWord(sp)}>
                <Text style={styles.signpostText}>{sp}</Text>
              </TouchableOpacity>
            )) : <Text style={styles.sub}>No signposts detected in this transcript.</Text>}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Dictation Mode</Text>
          <Text style={styles.sub}>Fill the missing words and check your accuracy.</Text>
          <View style={styles.dictationBox}>
            <Text style={styles.dictationMasked}>{dictationTarget?.masked || 'No sentence available.'}</Text>
            <View style={styles.row}>
              <Button label="Play Sentence" variant="secondary" onPress={() => speakWord(dictationTarget?.original || '')} />
              <Button label="Next Dictation" variant="secondary" onPress={nextDictation} />
            </View>
            <TextInput
              style={styles.notesInput}
              value={dictationInput}
              onChangeText={setDictationInput}
              placeholder="Type the full sentence you heard..."
              multiline
              textAlignVertical="top"
            />
            <View style={styles.row}>
              <Button label="Check Dictation" onPress={checkDictation} />
            </View>
            {dictationResult ? (
              <Text style={dictationResult.ok ? styles.correct : styles.incorrect}>
                {dictationResult.message} ({dictationResult.score}%)
              </Text>
            ) : null}
          </View>
        </Card>

        {/* ── Progress ── */}
        <Card style={styles.card}>
          <Text style={styles.h3}>Questions</Text>
          <Text style={styles.sub}>Answered: {answeredCount}/{task.questions?.length}</Text>
          {!predictionLocked ? (
            <Text style={styles.incorrect}>Complete the Prediction Step first to unlock questions.</Text>
          ) : null}
          <View style={styles.row}>
            <Button
              label={checked ? '✓ Checked' : 'Check Answers'}
              onPress={check}
              disabled={checked || answeredCount === 0 || !predictionLocked}
            />
            <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
          </View>
          {score && <Text style={styles.score}>Score: {score}</Text>}
        </Card>

        {listeningFeedback && (
          <Card style={styles.card}>
            <Text style={styles.h3}>Listening Feedback</Text>
            <Text style={styles.sub}>Accuracy: {listeningFeedback.accuracy}% ({listeningFeedback.correct}/{listeningFeedback.total})</Text>

            {listeningFeedback.strengths.length > 0 && (
              <>
                <Text style={styles.feedbackTitle}>Strong Areas</Text>
                {listeningFeedback.strengths.map((item) => (
                  <Text key={item} style={styles.correct}>• {item}</Text>
                ))}
              </>
            )}

            {listeningFeedback.fixes.length > 0 && (
              <>
                <Text style={styles.feedbackTitle}>Top Fixes</Text>
                {listeningFeedback.fixes.map((item) => (
                  <Text key={item} style={styles.incorrect}>• {item}</Text>
                ))}
              </>
            )}

            {listeningFeedback.missed.length > 0 && (
              <>
                <Text style={styles.feedbackTitle}>Missed Questions</Text>
                {listeningFeedback.missed.slice(0, 3).map((m) => (
                  <View key={`miss-${m.index}`} style={styles.missedRow}>
                    <Text style={styles.bodyLine}>Q{m.index}: {m.q}</Text>
                    {m.explain ? <Text style={styles.explain}>{m.explain}</Text> : null}
                  </View>
                ))}
              </>
            )}

            <Text style={styles.feedbackTitle}>Retry Plan</Text>
            {listeningFeedback.retryPlan.map((step) => (
              <Text key={step} style={styles.bodyLine}>• {step}</Text>
            ))}
          </Card>
        )}

        {listeningFeedback && mistakeItems.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.h3}>Mistake Coach</Text>
            <Text style={styles.sub}>Ask why your answer is wrong and get targeted fixes for this listening.</Text>
            <Button
              label={`Open Mistake Coach (${mistakeItems.length})`}
              onPress={() => navigation.navigate('MistakeCoach', {
                module: 'listening',
                moduleLabel: 'Listening',
                taskTitle: task.title || 'Listening Practice',
                mistakes: mistakeItems,
              })}
            />
          </Card>
        )}

        {listeningModel && (
          <Card style={styles.card}>
            <Text style={styles.h3}>Listening Model</Text>
            <Text style={styles.sub}>Overall: {listeningModel.overall}% • {listeningModel.band}</Text>
            <View style={styles.modelTrack}>
              <View style={[styles.modelFill, { width: `${listeningModel.overall}%` }]} />
            </View>
            <View style={styles.modelPillRow}>
              <View style={styles.modelPill}>
                <Text style={styles.modelPillLabel}>Weakest area</Text>
                <Text style={styles.modelPillValue}>{listeningModel.weakestDimension?.label || '—'}</Text>
              </View>
              <View style={styles.modelPill}>
                <Text style={styles.modelPillLabel}>Keyword notes</Text>
                <Text style={styles.modelPillValue}>{listeningModel.noteQuality.keywordHits}/{listeningModel.noteQuality.keywordTarget}</Text>
              </View>
              <View style={styles.modelPill}>
                <Text style={styles.modelPillLabel}>Signposts used</Text>
                <Text style={styles.modelPillValue}>{listeningModel.signpost.noteHits}/{listeningModel.signpost.transcriptCount}</Text>
              </View>
            </View>

            <Text style={styles.feedbackTitle}>Dimension Scores</Text>
            <ModelBar label="Comprehension" value={listeningModel.dimensions.comprehension} />
            <ModelBar label="Detail Tracking" value={listeningModel.dimensions.detailTracking} />
            <ModelBar label="Main Idea" value={listeningModel.dimensions.gistTracking} />
            <ModelBar label="Inference / Tone" value={listeningModel.dimensions.inferenceControl} />
            <ModelBar label="Note Taking" value={listeningModel.dimensions.noteTaking} />
            <ModelBar label="Dictation" value={listeningModel.dimensions.dictationPrecision} />

            {listeningModel.strongest.length > 0 ? (
              <>
                <Text style={styles.feedbackTitle}>Strongest Areas</Text>
                {listeningModel.strongest.map((item) => (
                  <Text key={item} style={styles.correct}>• {item}</Text>
                ))}
              </>
            ) : null}
            {listeningModel.weaknesses.length > 0 ? (
              <>
                <Text style={styles.feedbackTitle}>Weak Areas</Text>
                {listeningModel.weaknesses.map((item) => (
                  <Text key={item} style={styles.incorrect}>• {item}</Text>
                ))}
              </>
            ) : null}
            {listeningModel.insights.length > 0 ? (
              <>
                <Text style={styles.feedbackTitle}>Model Insights</Text>
                {listeningModel.insights.map((item) => (
                  <Text key={item} style={styles.bodyLine}>• {item}</Text>
                ))}
              </>
            ) : null}
            <Text style={styles.feedbackTitle}>Target Keywords</Text>
            <View style={styles.signpostRow}>
              {listeningModel.derivedKeywords.slice(0, 8).map((item) => (
                <View key={item} style={styles.signpostChip}>
                  <Text style={styles.signpostText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.feedbackTitle}>Question Skill Breakdown</Text>
            {[
              ['Detail', listeningModel.skillBreakdown.detail],
              ['Main idea', listeningModel.skillBreakdown.gist],
              ['Inference', listeningModel.skillBreakdown.inference],
              ['Vocabulary', listeningModel.skillBreakdown.vocabulary],
            ].map(([label, bucket]) => (
              bucket?.total ? (
                <Text key={label} style={styles.bodyLine}>
                  • {label}: {bucket.correct}/{bucket.total} ({bucket.score}%)
                </Text>
              ) : null
            ))}
            <Text style={styles.feedbackTitle}>Next Actions</Text>
            {listeningModel.actions.map((step) => (
              <Text key={step} style={styles.bodyLine}>• {step}</Text>
            ))}
          </Card>
        )}

        {/* ── Questions ── */}
        {task.questions?.map((q, qi) => (
          <Card key={qi} style={styles.card}>
            <Text style={styles.h3}>Q{qi + 1}. {q.q}</Text>
            {q.options.map((opt, oi) => (
              <TouchableOpacity
                key={oi}
                style={[
                  styles.optionBtn,
                  answers[qi] === oi && !checked && styles.optionSelected,
                  checked && oi === q.answer && styles.optionCorrect,
                  checked && answers[qi] === oi && oi !== q.answer && styles.optionWrong,
                ]}
                onPress={() => select(qi, oi)}
                disabled={checked || !predictionLocked}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.optionText,
                  checked && oi === q.answer && styles.optionTextCorrect,
                  checked && answers[qi] === oi && oi !== q.answer && styles.optionTextWrong,
                ]}>{opt}</Text>
              </TouchableOpacity>
            ))}
            {checked && (
              <>
                <Text style={answers[qi] === q.answer ? styles.correct : styles.incorrect}>
                  {answers[qi] === q.answer ? '✓ Correct' : `✗ Incorrect — Correct: ${q.options[q.answer]}`}
                </Text>
                {q.explain && <Text style={styles.explain}>{q.explain}</Text>}
                {answers[qi] !== q.answer && (
                  <>
                    <Button
                      label="Open Mistake Coach"
                      variant="secondary"
                      onPress={() => {
                        const item = mistakeItems.find((m) => m.id === `${task.id || 'listening'}-${qi}`);
                        if (item) {
                          navigation.navigate('MistakeCoach', {
                            module: 'listening',
                            moduleLabel: 'Listening',
                            taskTitle: task.title || 'Listening Practice',
                            mistakes: [item],
                          });
                        }
                      }}
                      style={styles.mistakeBtn}
                    />
                    <Button
                      label={similarQuestions[qi] ? 'New Similar Question' : 'Try Similar'}
                      variant="secondary"
                      onPress={() => createSimilar(qi)}
                    />
                  </>
                )}
              </>
            )}
            {similarQuestions[qi] && (
              <View style={styles.similarBox}>
                <Text style={styles.h3}>{similarQuestions[qi].q}</Text>
                {similarQuestions[qi].options.map((opt, oi) => (
                  <TouchableOpacity
                    key={oi}
                    style={[
                      styles.optionBtn,
                      similarAnswers[qi] === oi && !similarChecked[qi] && styles.optionSelected,
                      similarChecked[qi] && oi === similarQuestions[qi].answer && styles.optionCorrect,
                      similarChecked[qi] && similarAnswers[qi] === oi && oi !== similarQuestions[qi].answer && styles.optionWrong,
                    ]}
                    onPress={() => !similarChecked[qi] && setSimilarAnswers(p => ({ ...p, [qi]: oi }))}
                    disabled={similarChecked[qi]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                {!similarChecked[qi] && (
                  <Button label="Check" onPress={() => setSimilarChecked(p => ({ ...p, [qi]: true }))} disabled={similarAnswers[qi] == null} />
                )}
                {similarChecked[qi] && (
                  <>
                    <Text style={similarAnswers[qi] === similarQuestions[qi].answer ? styles.correct : styles.incorrect}>
                      {similarAnswers[qi] === similarQuestions[qi].answer ? '✓ Correct' : '✗ Incorrect'}
                    </Text>
                    <Text style={styles.explain}>{similarQuestions[qi].explain}</Text>
                    <Button label="New Similar" variant="secondary" onPress={() => createSimilar(qi)} />
                  </>
                )}
              </View>
            )}
          </Card>
        ))}
      </Animated.View>
      <WebView 
        ref={webviewRef} 
        source={{ html: '<html><body></body></html>' }} 
        style={styles.hiddenWebView}
        onMessage={handleWebviewMessage}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
    top: -100,
    left: -100,
  },
  container: { paddingBottom: 40 },

  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
  h3: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },

  // Player
  playerCard: {
    marginBottom: spacing.md,
    backgroundColor: '#0A1628',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    marginBottom: spacing.md, alignSelf: 'flex-start',
  },
  playIcon: { fontSize: 22, color: '#fff' },
  playLabel: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: '#fff' },
  modeSwitchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modeSwitch: {
    borderWidth: 1,
    borderColor: '#2A3D5F',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#0F213D',
  },
  modeSwitchActive: {
    backgroundColor: '#1E3A66',
    borderColor: colors.primary,
  },
  modeSwitchText: {
    fontSize: typography.xsmall,
    color: '#A8C0FF',
    fontFamily: typography.fontHeadline,
  },
  modeSwitchTextActive: {
    color: '#FFFFFF',
  },

  controlLabel: { fontSize: typography.small, color: '#A8C0FF', fontFamily: typography.fontHeadline, marginBottom: spacing.xs },
  rateRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  rateBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: 8, borderWidth: 1, borderColor: '#2A3D5F',
  },
  rateBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rateTxt: { fontSize: typography.small, color: '#A8C0FF' },
  rateTxtActive: { color: '#fff', fontFamily: typography.fontHeadline },

  voiceRow: { flexDirection: 'row', gap: spacing.xs },
  voiceBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: 8, borderWidth: 1, borderColor: '#2A3D5F',
  },
  voiceBtnActive: { backgroundColor: '#1A3A6B', borderColor: colors.primary },
  voiceTxt: { fontSize: 11, color: '#A8C0FF' },
  voiceTxtActive: { color: '#fff' },

  // Transcript
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  toggleIcon: { fontSize: typography.small, color: colors.primary },
  transcriptScroll: {
    maxHeight: 320,
  },
  transcriptScrollContent: {
    paddingBottom: spacing.xs,
  },

  sentenceRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sentenceRowActive: {
    backgroundColor: '#EEF5FF',
  },
  sentenceBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginRight: spacing.sm,
    alignSelf: 'stretch',
    minHeight: 20,
  },
  sentenceBarActive: {
    backgroundColor: colors.primary,
  },
  sentenceWords: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: spacing.xs,
    paddingRight: spacing.xs,
  },
  wordText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  wordTextActive: {
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },

  // Options
  optionBtn: {
    padding: spacing.md, borderRadius: 10, marginBottom: spacing.xs,
    borderWidth: 1.5, borderColor: colors.secondary, backgroundColor: colors.surface,
  },
  optionSelected: { backgroundColor: colors.secondary, borderColor: colors.primary },
  optionCorrect: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  optionWrong: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  optionText: { fontSize: typography.body, color: colors.text },
  optionTextCorrect: { color: '#1B5E20', fontFamily: typography.fontHeadline },
  optionTextWrong: { color: '#B71C1C', fontFamily: typography.fontHeadline },

  correct: { fontSize: typography.small, color: '#1F8B4C', marginTop: spacing.xs, fontFamily: typography.fontHeadline },
  incorrect: { fontSize: typography.small, color: '#B42318', marginTop: spacing.xs, fontFamily: typography.fontHeadline },
  mistakeBtn: { marginBottom: spacing.xs, alignSelf: 'flex-start' },
  explain: { fontSize: typography.small, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.sm },
  score: { marginTop: spacing.sm, fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.primary },
  feedbackTitle: {
    fontSize: typography.small,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontFamily: typography.fontHeadline,
  },
  bodyLine: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: 4,
  },
  shadowBox: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
  },
  predictionInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  predictionLockedBox: {
    borderWidth: 1,
    borderColor: '#CFE0FF',
    borderRadius: 10,
    backgroundColor: '#F6FAFF',
    padding: spacing.sm,
  },
  shadowSentence: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  notesInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dictationBox: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
  },
  dictationMasked: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
    fontFamily: typography.fontHeadline,
  },
  signpostRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  signpostChip: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
  },
  signpostText: {
    fontSize: typography.small,
    color: '#1D4ED8',
    fontFamily: typography.fontHeadline,
  },
  missedRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },

  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modelTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  modelFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  modelPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modelPill: {
    flexGrow: 1,
    flexBasis: 120,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
    padding: spacing.sm,
  },
  modelPillLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: typography.fontHeadline,
  },
  modelPillValue: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  modelBarBlock: {
    marginBottom: spacing.sm,
  },
  modelBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modelBarLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  modelBarValue: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  modelBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E6EEF9',
    overflow: 'hidden',
  },
  modelBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  similarBox: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.secondary },
});
