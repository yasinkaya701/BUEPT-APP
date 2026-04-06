/**
 * VocabCollocationQuizScreen.js
 * – Given a word, pick the correct collocation from 4 options
 * – Uses test_english_vocab_items.json collocations array
 * – Animated progress, flip reveal, streak badge
 */
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  Text, StyleSheet, View, TouchableOpacity, Animated, ScrollView,
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { speakText } from '../hooks/useTts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import testEnglishVocabItems from '../../data/test_english_vocab_items.json';

function shuffle(arr) {
  const result = Array.isArray(arr) ? [...arr] : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getBand(pct) {
  if (pct >= 90) return { label: 'Excellent!', emoji: '🏆', color: '#047857' };
  if (pct >= 70) return { label: 'Good', emoji: '🎉', color: '#1D4ED8' };
  if (pct >= 50) return { label: 'Fair', emoji: '👍', color: '#D97706' };
  return { label: 'Keep Practising', emoji: '💪', color: '#DC2626' };
}

const SIZE_OPTIONS = [10, 15, 20];

export default function VocabCollocationQuizScreen({ route, navigation }) {
  const mode = route?.params?.mode === 'test_english' ? 'test_english' : 'default';
  const topic = String(route?.params?.topic || 'all').toLowerCase();
  const level = String(route?.params?.level || 'all').toUpperCase();
  const isTestEnglish = mode === 'test_english';

  const [size, setSize] = useState(route?.params?.size || 10);
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

  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakScaleAnim = useRef(new Animated.Value(1)).current;

  const { recordKnown, recordUnknown, addUnknownWord, recordQuizError, unknownWords = [] } = useAppState();

  // Build pool: words that have ≥1 collocation
  const getPool = useCallback(() => {
    const base = Array.isArray(testEnglishVocabItems) ? testEnglishVocabItems : [];
    let filtered = base.filter(
      (w) =>
        Array.isArray(w.collocations) &&
        w.collocations.length > 0 &&
        (topic === 'all' || String(w.topic || '').toLowerCase() === topic) &&
        (level === 'ALL' || String(w.level || '').toUpperCase() === level)
    );
    if (!filtered.length) {
      filtered = base.filter(
        (w) =>
          Array.isArray(w.collocations) &&
          w.collocations.length > 0 &&
          (level === 'ALL' || String(w.level || '').toUpperCase() === level)
      );
    }
    if (!filtered.length) {
      filtered = base.filter((w) => Array.isArray(w.collocations) && w.collocations.length > 0);
    }
    return filtered;
  }, [topic, level]);

  const seededItems = useMemo(() => {
    const pool = getPool();
    if (!unknownWords || unknownWords.length === 0) {
      return shuffle(pool).slice(0, size);
    }
    const unknownKeys = new Set(unknownWords.map(w => (w?.word || '').toLowerCase()));
    const priority = [];
    const rest = [];
    pool.forEach(item => {
      if (unknownKeys.has((item?.word || '').toLowerCase())) priority.push(item);
      else rest.push(item);
    });
    const combined = [...shuffle(priority), ...shuffle(rest)];
    return combined.slice(0, size);
  }, [getPool, size, unknownWords]);
  const [items, setItems] = useState(seededItems);

  useEffect(() => {
    if (!started && seededItems.length > 0) setItems(seededItems);
  }, [seededItems, started]);

  const current = items[index];

  // Correct answer = first collocation of current word
  // Distractors = first collocations of other words
  const options = useMemo(() => {
    if (!current || !current.collocations?.length) return [];
    const correctAnswer = current.collocations[0];
    const pool = getPool();
    const distractors = shuffle(
      pool.filter((w) => w.word !== current.word && w.collocations?.length > 0)
    )
      .slice(0, 5)
      .map((w) => w.collocations[0])
      .filter((c) => c !== correctAnswer);
    return shuffle([correctAnswer, ...distractors.slice(0, 3)]);
  }, [current, getPool]);

  // Progress animation
  useEffect(() => {
    const progress = items.length > 0 ? (finished ? 1 : index / items.length) : 0;
    Animated.spring(progressAnim, { toValue: progress, useNativeDriver: false, friction: 8 }).start();
  }, [index, finished, items.length, progressAnim]);

  const triggerStreak = useCallback(() => {
    streakScaleAnim.setValue(1.5);
    Animated.spring(streakScaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  }, [streakScaleAnim]);

  const revealAnswer = useCallback(() => {
    if (revealed || !selected || !current) return;
    const correct = current.collocations[0];
    const isCorrect = selected === correct;

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        if (next >= 3) triggerStreak();
        return next;
      });
    } else {
      setStreak(0);
      recordQuizError(current.word);
      setMissedWords((prev) =>
        prev.some((w) => w.word === current.word) ? prev : [...prev, current]
      );
      const selectedIdx = options.indexOf(selected);
      const correctIdx = options.indexOf(correct);
      const example = current.examples?.[0];
      const explanation = `The most common collocation of "${current.word}" is "${correct}".${
        example ? ` Example: "${example}"` : ''
      }`;
      setMistakeItems((prev) =>
        prev.some((m) => m.word === current.word)
          ? prev
          : [
              ...prev,
              {
                id: `coll-${current.word}`,
                word: current.word,
                module: 'vocab',
                moduleLabel: 'Vocabulary',
                taskTitle: 'Collocation Quiz',
                question: `Which phrase best collocates with "${current.word}"?`,
                options,
                correctIndex: correctIdx >= 0 ? correctIdx : null,
                selectedIndex: selectedIdx >= 0 ? selectedIdx : null,
                correctText: correct,
                selectedText: selected,
                explanation,
                context: example || '',
              },
            ]
      );
    }
    setRevealed(true);
    speakText(correct);
  }, [revealed, selected, current, options, recordQuizError, triggerStreak]);

  const next = useCallback(
    (knew) => {
      if (!revealed) { revealAnswer(); return; }
      const word = current?.word;
      if (word) {
        if (knew) recordKnown(word);
        else { addUnknownWord(word); recordUnknown(word); }
      }
      if (index < items.length - 1) {
        setSelected(null);
        setRevealed(false);
        setIndex((i) => i + 1);
      } else {
        setFinished(true);
      }
    },
    [revealed, revealAnswer, current, index, items.length, recordKnown, addUnknownWord, recordUnknown]
  );

  const restart = () => {
    const nextItems = shuffle(getPool()).slice(0, size);
    setItems(nextItems);
    setIndex(0); setScore(0); setSelected(null);
    setRevealed(false); setFinished(false); setStreak(0); setBestStreak(0);
    setMissedWords([]); setMistakeItems([]);
  };

  const retryMissed = () => {
    if (!missedWords.length) return;
    setItems(shuffle(missedWords));
    setIndex(0); setScore(0); setSelected(null);
    setRevealed(false); setFinished(false); setStreak(0); setBestStreak(0);
    setMissedWords([]); setMistakeItems([]);
  };

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

  // ── Start screen ─────────────────────────────────────────────────────────
  if (!started) {
    return (
      <Screen scroll contentStyle={styles.centeredContainer}>
        <Text style={styles.emoji}>🔗</Text>
        <Text style={styles.h1}>Collocation Quiz</Text>
        <Text style={styles.sub}>
          {isTestEnglish
            ? `Test-English ${level === 'ALL' ? 'all levels' : level} collocations${topic !== 'all' ? `: ${topic}` : ''}.`
            : 'Pick the phrase that collocates best with the target word.'}
        </Text>
        <Card style={styles.card}>
          <Text style={styles.label}>How many questions?</Text>
          <View style={styles.sizeRow}>
            {SIZE_OPTIONS.map((n) => (
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
        <Button label="Start Quiz →" onPress={() => { setItems(shuffle(getPool()).slice(0, size)); setStarted(true); }} />
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} style={styles.backBtn} />
      </Screen>
    );
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / items.length) * 100);
    const band = getBand(pct);
    return (
      <Screen scroll contentStyle={styles.centeredContainer}>
        <Text style={styles.bandEmoji}>{band.emoji}</Text>
        <Text style={styles.h1}>Quiz Complete!</Text>
        <Card style={styles.card}>
          <Text style={[styles.bigScore, { color: band.color }]}>{pct}%</Text>
          <Text style={styles.bandLabel}>{band.label}</Text>
          <Text style={styles.sub}>{score} / {items.length} correct</Text>
          <Text style={styles.sub}>Best Streak: 🔥 {bestStreak}</Text>
        </Card>
        {missedWords.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.label}>Words to Review</Text>
            {missedWords.map((w) => (
              <View key={w.word} style={styles.missedRow}>
                <Text style={styles.missedWord}>{w.word}</Text>
                <Text style={styles.missedDef} numberOfLines={1}>{w.collocations?.[0]}</Text>
              </View>
            ))}
          </Card>
        )}
        <View style={styles.actionRow}>
          <Button label="Try Again" onPress={restart} />
          {missedWords.length > 0 && (
            <Button label={`Retry Missed (${missedWords.length})`} variant="secondary" onPress={retryMissed} />
          )}
          {mistakeItems.length > 0 && (
            <Button
              label={`Mistake Coach (${mistakeItems.length})`}
              variant="secondary"
              onPress={() =>
                navigation.navigate('MistakeCoach', {
                  module: 'vocab',
                  moduleLabel: 'Vocabulary',
                  taskTitle: 'Collocation Quiz',
                  mistakes: mistakeItems,
                })
              }
            />
          )}
          <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  const correct = current?.collocations?.[0];
  const isCorrect = selected === correct;

  return (
    <View style={styles.master}>
      {/* Header + Progress */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakScaleAnim }] }]}>
            <Text style={styles.streakEmoji}>{streak >= 3 ? '🔥' : '⭐'}</Text>
            <Text style={styles.streakScore}>{streak}</Text>
          </Animated.View>
        </View>
        <Text style={styles.headerProgress}>{index + 1} / {items.length}  •  Score: {score}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Word card */}
        <Card style={styles.wordCard}>
          <Text style={styles.questionLabel}>Which phrase collocates with...</Text>
          <TouchableOpacity onPress={() => speakText(current?.word || '')} style={styles.wordRow}>
            <Text style={styles.bigWord}>{current?.word}</Text>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
          {current?.word_type && <Text style={styles.wordType}>{current.word_type}</Text>}
          {current?.simple_definition && (
            <Text style={styles.wordDef}>{current.simple_definition}</Text>
          )}
        </Card>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {options.map((opt) => {
            let optStyle = styles.optDefault;
            let textStyle = styles.optTextDefault;
            if (revealed && opt === correct) { optStyle = styles.optCorrect; textStyle = styles.optTextCorrect; }
            else if (revealed && selected === opt && opt !== correct) { optStyle = styles.optIncorrect; textStyle = styles.optTextIncorrect; }
            else if (!revealed && selected === opt) { optStyle = styles.optSelected; textStyle = styles.optTextSelected; }
            else if (revealed) { optStyle = styles.optDisabled; textStyle = styles.optTextDisabled; }

            return (
              <TouchableOpacity
                key={opt}
                style={[styles.optionBtn, optStyle]}
                onPress={() => { if (!revealed) setSelected(opt); }}
                disabled={revealed}
                activeOpacity={0.8}
              >
                {revealed && opt === correct && (
                  <Ionicons name="checkmark-circle" size={18} color="#047857" style={styles.optIcon} />
                )}
                {revealed && selected === opt && opt !== correct && (
                  <Ionicons name="close-circle" size={18} color="#DC2626" style={styles.optIcon} />
                )}
                <Text style={[styles.optionText, textStyle]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Revealed example */}
        {revealed && current?.examples?.[0] && (
          <Card style={styles.exampleCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
            <Text style={styles.exampleText}>"{current.examples[0]}"</Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        {!revealed ? (
          <Button label="Check Answer" onPress={revealAnswer} disabled={!selected} style={styles.actionBtn} />
        ) : (
          <View style={[styles.feedbackBanner, isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}>
            <Text style={[styles.bannerTitle, isCorrect ? styles.bannerTextCorrect : styles.bannerTextIncorrect]}>
              {isCorrect ? '✓ Correct!' : `✗ Answer: ${correct}`}
            </Text>
            <View style={styles.dualRow}>
              <Button
                label={isCorrect ? '✓ I Knew It' : '✗ Review Later'}
                onPress={() => next(isCorrect)}
                style={styles.dualBtn}
                variant={isCorrect ? 'primary' : 'secondary'}
              />
              {!isCorrect && (
                <Button label="Got It" onPress={() => next(false)} style={styles.dualBtn} />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  master: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  closeBtn: { padding: 4 },
  progressTrack: { flex: 1, height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 5 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF1F2', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: '#FECDD3',
  },
  streakEmoji: { fontSize: 14, marginRight: 3 },
  streakScore: { fontSize: 14, fontFamily: typography.fontHeadline, fontWeight: '800', color: '#E11D48' },
  headerProgress: { fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: '600' },

  scrollContent: { padding: spacing.xl, paddingBottom: 160 },

  // Word card
  wordCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: spacing.xl,
    ...shadow.md,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  bigWord: { fontSize: 32, fontFamily: typography.fontHeadline, fontWeight: '800', color: '#0F172A' },
  speakIcon: { fontSize: 22 },
  wordType: { fontSize: 12, color: '#8B5CF6', fontWeight: '600', marginBottom: spacing.xs },
  wordDef: { fontSize: 14, color: '#475569', lineHeight: 20 },

  // Options
  optionsGrid: { gap: spacing.sm, marginBottom: spacing.md },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, borderWidth: 2,
    ...shadow.sm,
  },
  optIcon: { marginRight: spacing.sm },
  optDefault: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  optSelected: { backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' },
  optCorrect: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  optIncorrect: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  optDisabled: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', opacity: 0.6 },
  optionText: { flex: 1, fontSize: 16, fontFamily: typography.fontHeadline, fontWeight: '600' },
  optTextDefault: { color: '#334155' },
  optTextSelected: { color: '#6D28D9' },
  optTextCorrect: { color: '#047857' },
  optTextIncorrect: { color: '#B91C1C' },
  optTextDisabled: { color: '#94A3B8' },

  exampleCard: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#DDD6FE',
    borderRadius: 12, padding: spacing.md,
  },
  exampleText: { flex: 1, fontSize: 14, color: '#4C1D95', fontStyle: 'italic', lineHeight: 20 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0',
    padding: spacing.xl, paddingBottom: 40, ...shadow.lg,
  },
  actionBtn: { height: 52 },
  feedbackBanner: { borderRadius: 16, padding: spacing.lg },
  bannerCorrect: { backgroundColor: '#ECFDF5' },
  bannerIncorrect: { backgroundColor: '#FEF2F2' },
  bannerTitle: { fontSize: 17, fontFamily: typography.fontHeadline, fontWeight: '800', marginBottom: spacing.md },
  bannerTextCorrect: { color: '#047857' },
  bannerTextIncorrect: { color: '#B91C1C' },
  dualRow: { flexDirection: 'row', gap: spacing.sm },
  dualBtn: { flex: 1 },

  // Start/Finish
  centeredContainer: { paddingBottom: 40, alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: spacing.md },
  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md, textAlign: 'center' },
  label: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  card: { width: '100%', marginBottom: spacing.lg },
  sizeRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  sizeBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 14, borderWidth: 1.5, borderColor: colors.secondary },
  sizeBtnActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  sizeBtnText: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text },
  sizeBtnTextActive: { color: '#fff' },
  backBtn: { marginTop: spacing.sm },
  actionRow: { gap: spacing.sm, width: '100%' },
  bandEmoji: { fontSize: 60, textAlign: 'center', marginBottom: spacing.md },
  bigScore: { fontSize: 64, fontFamily: typography.fontHeadline, textAlign: 'center' },
  bandLabel: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  missedRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  missedWord: { fontSize: 15, fontFamily: typography.fontHeadline, fontWeight: '700', color: '#E11D48' },
  missedDef: { fontSize: 13, color: '#64748B' },
});
