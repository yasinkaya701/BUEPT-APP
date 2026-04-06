/**
 * VocabSynonymQuizScreen.js — Enhanced Synonym Quiz
 * – Animated card flip reveal
 * – Word definition + example sentence shown
 * – TTS to hear word and correct synonym
 * – 10/20/30 question selection
 * – Score + band at end
 */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  Text, StyleSheet, View, TouchableOpacity, Animated
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { getEntriesWithSynonyms, getDictionarySample, subscribeDictionaryBuild } from '../utils/dictionary';
import { useAppState } from '../context/AppState';
import { speakText } from '../hooks/useTts';
import testEnglishVocabItems from '../../data/test_english_vocab_items.json';

/** Fisher-Yates shuffle — inline to avoid any module resolution issues */
function shuffle(arr) {
  const result = Array.isArray(arr) ? [...arr] : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


const SIZE_OPTIONS = [10, 15, 20];

function getBand(pct) {
  if (pct >= 90) return { label: 'Excellent', emoji: '🏆', color: '#1B5E20' };
  if (pct >= 75) return { label: 'Good', emoji: '🎉', color: '#1565C0' };
  if (pct >= 55) return { label: 'Fair', emoji: '👍', color: '#E65100' };
  return { label: 'Keep Practising', emoji: '💪', color: '#B71C1C' };
}

export default function VocabSynonymQuizScreen({ route, navigation }) {
  const mode = route?.params?.mode === 'test_english' ? 'test_english' : 'default';
  const topic = String(route?.params?.topic || 'all').toLowerCase();
  const level = String(route?.params?.level || 'all').toUpperCase();
  const isTestEnglish = mode === 'test_english';
  const [size, setSize] = useState(route?.params?.size || 10);
  const getPool = useCallback(() => {
    if (isTestEnglish) {
      const base = Array.isArray(testEnglishVocabItems) ? testEnglishVocabItems : [];
      const filtered = base.filter(
        (w) =>
          Array.isArray(w.synonyms) &&
          w.synonyms.length > 0 &&
          (topic === 'all' || String(w.topic || '').toLowerCase() === topic) &&
          (level === 'ALL' || String(w.level || '').toUpperCase() === level)
      );
      if (filtered.length) return filtered;
      const levelOnly = base.filter(
        (w) =>
          Array.isArray(w.synonyms) &&
          w.synonyms.length > 0 &&
          (level === 'ALL' || String(w.level || '').toUpperCase() === level)
      );
      if (levelOnly.length) return levelOnly;
      return base.filter((w) => Array.isArray(w.synonyms) && w.synonyms.length > 0);
    }
    return getEntriesWithSynonyms(400);
  }, [isTestEnglish, topic, level]);
  const { addUnknownWord, recordKnown, recordUnknown, recordQuizError, unknownWords = [] } = useAppState();
  const [dictionaryReady, setDictionaryReady] = useState(false);

  useEffect(() => {
    return subscribeDictionaryBuild(({ status }) => {
      if (status === 'ready') setDictionaryReady(true);
    });
  }, []);

  const seededItems = useMemo(() => {
    if (!isTestEnglish && !dictionaryReady) {
      return [];
    }
    const list = getPool();
    if (!unknownWords || unknownWords.length === 0) {
      return shuffle(list).slice(0, size);
    }
    const unknownKeys = new Set(unknownWords.map(w => (w?.word || '').toLowerCase()));
    const priority = [];
    const rest = [];
    list.forEach(item => {
      if (unknownKeys.has((item?.word || '').toLowerCase())) priority.push(item);
      else rest.push(item);
    });
    const combined = [...shuffle(priority), ...shuffle(rest)];
    return combined.slice(0, size);
  }, [getPool, size, unknownWords, dictionaryReady, isTestEnglish]);
  const [items, setItems] = useState(seededItems);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missedWords, setMissedWords] = useState([]);
  const [mistakeItems, setMistakeItems] = useState([]);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!started) {
      setItems(seededItems);
    }
  }, [seededItems, started]);

  const current = items[index];

  const options = useMemo(() => {
    if (!current) return [];
    const synonym = current.synonyms[0];
    const distractorPool = getPool();
    const distractors = shuffle(
      (distractorPool.length ? distractorPool : getDictionarySample(400)).filter(w => w.word !== synonym && w.word !== current.word)
    ).slice(0, 3).map(w => w.word);
    return shuffle([synonym, ...distractors]);
  }, [current, getPool]);

  const revealAnswer = useCallback(() => {
    if (revealed || !selected) return;
    const correct = current?.synonyms[0];
    if (selected === correct) {
      setScore(s => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
      if (current?.word) recordQuizError(current.word);
      setMissedWords((prev) => {
        if (!current?.word || prev.some((w) => w.word === current.word)) return prev;
        return [...prev, current];
      });
      const selectedIdx = options.indexOf(selected);
      const correctIdx = options.indexOf(correct);
      const example = current?.examples?.[0];
      const explanation = current?.simple_definition
        ? `"${current.word}" means: ${current.simple_definition}. The closest synonym here is "${correct}".`
        : `The best synonym for "${current.word}" in this context is "${correct}".`;
      setMistakeItems((prev) => {
        if (!current?.word || prev.some((m) => m.word === current.word)) return prev;
        return [
          ...prev,
          {
            id: `syn-${current.word}`,
            word: current.word,
            module: 'vocab',
            moduleLabel: 'Vocabulary',
            taskTitle: 'Synonym Match',
            question: `Select the best synonym for "${current.word}".`,
            options,
            correctIndex: correctIdx >= 0 ? correctIdx : null,
            selectedIndex: selectedIdx >= 0 ? selectedIdx : null,
            correctText: correct,
            selectedText: selected,
            explanation,
            context: example || '',
          },
        ];
      });
    }
    // Flip animation
    Animated.timing(flipAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setRevealed(true);
    // Speak correct synonym
    speakText(correct || '');
  }, [revealed, selected, current, options, flipAnim, recordQuizError]);

  const next = useCallback((knew) => {
    if (!revealed) { revealAnswer(); return; }
    const word = current?.word;
    if (word) {
      if (knew) recordKnown(word);
      else { addUnknownWord(word); recordUnknown(word); }
    }
    if (index < items.length - 1) {
      flipAnim.setValue(0);
      setSelected(null);
      setRevealed(false);
      setIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  }, [revealed, current, index, items.length, flipAnim, revealAnswer, recordKnown, addUnknownWord, recordUnknown]);

  const restart = () => {
    const list = getPool();
    const nextItems = shuffle(list).slice(0, size);
    setItems(nextItems);
    flipAnim.setValue(0);
    setIndex(0); setScore(0); setSelected(null);
    setRevealed(false); setFinished(false); setStreak(0); setBestStreak(0); setMissedWords([]);
    setMistakeItems([]);
  };

  const retryMissed = () => {
    if (!missedWords.length) return;
    setItems(shuffle(missedWords));
    flipAnim.setValue(0);
    setIndex(0); setScore(0); setSelected(null);
    setRevealed(false); setFinished(false); setStreak(0); setBestStreak(0); setMissedWords([]);
    setMistakeItems([]);
  };

  // Card flip interpolations
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

    if (!items || items.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20, backgroundColor: '#F8FAFC' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 }}>Engine Syncing...</Text>
        <Text style={{ textAlign: 'center', color: '#64748B', marginBottom: 20, fontSize: 16 }}>
          The dictionary is currently building in the background. Please wait a few seconds and try again.
        </Text>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={{ padding: 15, backgroundColor: '#8B5CF6', borderRadius: 10 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Start screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <Screen scroll contentStyle={styles.startContainer}>
        <Text style={styles.h1}>🔤 Synonym Quiz</Text>
        <Text style={styles.sub}>
          {isTestEnglish
            ? `Test-English ${level === 'ALL' ? 'all levels' : level} synonym drill${topic !== 'all' ? `: ${topic}` : ''}. Tap 🔊 to hear pronunciation.`
            : 'Pick the best synonym for each word. Tap 🔊 to hear pronunciation.'}
        </Text>
        <Card style={styles.card}>
          <Text style={styles.label}>How many questions?</Text>
          <View style={styles.sizeRow}>
            {SIZE_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.sizeBtn, size === n && styles.sizeBtnActive]}
                onPress={() => setSize(n)}
              >
                <Text style={[styles.sizeBtnText, size === n && styles.sizeBtnTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        <Button label="Start Quiz →" onPress={() => setStarted(true)} />
      </Screen>
    );
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / items.length) * 100);
    const band = getBand(pct);
    return (
      <Screen scroll contentStyle={styles.startContainer}>
        <Text style={[styles.bandEmoji]}>{band.emoji}</Text>
        <Text style={styles.h1}>Quiz Complete!</Text>
        <Card style={[styles.card, shadow.elev2]}>
          <Text style={[styles.bigScore, { color: band.color }]}>{pct}%</Text>
          <Text style={styles.bandLabel}>{band.label}</Text>
          <Text style={styles.sub}>{score} / {items.length} correct</Text>
          <Text style={styles.sub}>Best Streak: {bestStreak}</Text>
        </Card>
        <View style={styles.actionRow}>
          <Button label="Try Again" onPress={restart} />
          {missedWords.length > 0 && <Button label={`Retry Missed (${missedWords.length})`} variant="secondary" onPress={retryMissed} />}
          {mistakeItems.length > 0 && (
            <Button
              label={`Ask Mistake Coach (${mistakeItems.length})`}
              variant="secondary"
              onPress={() => navigation.navigate('MistakeCoach', {
                module: 'vocab',
                moduleLabel: 'Vocabulary',
                taskTitle: 'Synonym Match',
                mistakes: mistakeItems,
              })}
            />
          )}
          <Button label="Change Size" variant="secondary" onPress={() => { restart(); setStarted(false); }} />
          <Button label="Back" variant="secondary" onPress={() => navigation?.goBack()} />
        </View>
      </Screen>
    );
  }

  const correct = current?.synonyms?.[0];

  // ── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((index) / items.length) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{index + 1} / {items.length}  •  Score: {score}  •  Streak: {streak}</Text>

      {/* Word card (front / back flip) */}
      <View style={styles.flipContainer}>
        {/* Front — word */}
        <Animated.View style={[styles.flipCard, styles.flipFront, { transform: [{ rotateY: frontRotate }], opacity: frontOpacity }]}>
          <TouchableOpacity onPress={() => speakText(current?.word || '')} style={styles.wordSpeak}>
            <Text style={styles.bigWord}>{current?.word}</Text>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
          {current?.word_type && <Text style={styles.wordType}>{current.word_type}</Text>}
          <Text style={styles.wordDef}>{current?.simple_definition || ''}</Text>
          {current?.examples?.[0] && (
            <Text style={styles.wordEx}>"{current.examples[0]}"</Text>
          )}
        </Animated.View>

        {/* Back — result */}
        <Animated.View style={[styles.flipCard, styles.flipBack, { transform: [{ rotateY: backRotate }], opacity: backOpacity }]}>
          <Text style={selected === correct ? styles.resultCorrect : styles.resultIncorrect}>
            {selected === correct ? '✓ Correct!' : '✗ Incorrect'}
          </Text>
          <TouchableOpacity onPress={() => speakText(correct || '')} style={styles.wordSpeak}>
            <Text style={styles.correctWord}>{correct}</Text>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
          {current?.simple_definition && (
            <Text style={styles.wordDef}>{current.simple_definition}</Text>
          )}
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.optionsGrid}>
        {options.map((opt) => {
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionBtn,
                selected === opt && !revealed && styles.optionSelected,
                revealed && opt === correct && styles.optionCorrect,
                revealed && selected === opt && opt !== correct && styles.optionWrong,
              ]}
              onPress={() => { if (!revealed) setSelected(opt); }}
              disabled={revealed}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionText,
                revealed && opt === correct && styles.optionTextCorrect,
                revealed && selected === opt && opt !== correct && styles.optionTextWrong,
              ]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {!revealed ? (
          <Button label="Check Answer" onPress={revealAnswer} disabled={!selected} />
        ) : (
          <>
            <Button label="✓ I Knew It" onPress={() => next(true)} />
            <Button label="✗ Review Later" variant="secondary" onPress={() => next(false)} />
          </>
        )}
      </View>

      <Button label="Skip Question" variant="ghost" onPress={() => next(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  startContainer: { paddingBottom: 40, alignItems: 'center', justifyContent: 'center', flex: 1 },

  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.lg, textAlign: 'center' },
  label: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  card: { width: '100%', marginBottom: spacing.lg },

  // Start
  sizeRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  sizeBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 14, borderWidth: 1.5, borderColor: colors.secondary },
  sizeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeBtnText: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text },
  sizeBtnTextActive: { color: '#fff' },

  // Progress
  progressBar: { height: 6, backgroundColor: colors.secondary, borderRadius: 999, marginBottom: spacing.sm },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 999 },
  progressText: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md, textAlign: 'center' },

  // Flip card
  flipContainer: { height: 200, marginBottom: spacing.lg, position: 'relative' },
  flipCard: {
    position: 'absolute', width: '100%', height: '100%',
    borderRadius: 20, padding: spacing.xl,
    backfaceVisibility: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  flipFront: { backgroundColor: colors.primaryDark, borderColor: colors.primary, borderWidth: 1 },
  flipBack: { backgroundColor: '#1B5E20', borderColor: '#4CAF50', borderWidth: 1 },

  wordSpeak: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  bigWord: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: '#fff' },
  speakIcon: { fontSize: 24, color: '#A8C0FF' },
  wordType: { fontSize: typography.small, color: '#A8C0FF', marginBottom: spacing.xs },
  wordDef: { fontSize: typography.small, color: '#DDE8FF', textAlign: 'center', lineHeight: 18 },
  wordEx: { fontSize: 11, color: '#A8C0FF', fontStyle: 'italic', marginTop: spacing.xs, textAlign: 'center' },
  resultCorrect: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: '#A5D6A7', marginBottom: spacing.sm },
  resultIncorrect: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: '#EF9A9A', marginBottom: spacing.sm },
  correctWord: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: '#fff' },

  // Options grid
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  optionBtn: {
    width: '47%', paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1.5,
    borderColor: colors.secondary, alignItems: 'center',
  },
  optionSelected: { backgroundColor: colors.secondary, borderColor: colors.primary },
  optionCorrect: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  optionWrong: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  optionText: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, textAlign: 'center' },
  optionTextCorrect: { color: '#1B5E20' },
  optionTextWrong: { color: '#B71C1C' },

  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },

  // Finish
  bandEmoji: { fontSize: 60, textAlign: 'center', marginBottom: spacing.md },
  bigScore: { fontSize: 64, fontFamily: typography.fontHeadline, textAlign: 'center' },
  bandLabel: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
});
