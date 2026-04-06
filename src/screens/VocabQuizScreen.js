import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { getDictionarySample, subscribeDictionaryBuild } from '../utils/dictionary';
import { useAppState } from '../context/AppState';
import { speakText } from '../hooks/useTts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import testEnglishVocabItems from '../../data/test_english_vocab_items.json';


/** Fisher-Yates shuffle — inline fallback to guard against Metro resolution issues */
function shuffle(arr) {
  const result = Array.isArray(arr) ? [...arr] : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function VocabQuizScreen({ navigation, route }) {
  const size = route?.params?.size || 10;
  const mode = route?.params?.mode === 'test_english' ? 'test_english' : 'default';
  const topic = String(route?.params?.topic || 'all').toLowerCase();
  const level = String(route?.params?.level || 'all').toUpperCase();
  const isTestEnglish = mode === 'test_english';
  const { addUnknownWord, recordKnown, recordUnknown, recordQuizError, unknownWords = [] } = useAppState();
  const [dictionaryReady, setDictionaryReady] = useState(false);

  useEffect(() => {
    return subscribeDictionaryBuild(({ status }) => {
      if (status === 'ready') setDictionaryReady(true);
    });
  }, []);


  const resolvePool = useCallback(() => {
    if (isTestEnglish) {
      const base = Array.isArray(testEnglishVocabItems) ? testEnglishVocabItems : [];
      const filtered = base.filter(
        (w) =>
          w.simple_definition &&
          (topic === 'all' || String(w.topic || '').toLowerCase() === topic) &&
          (level === 'ALL' || String(w.level || '').toUpperCase() === level)
      );
      if (filtered.length) return filtered;
      const levelOnly = base.filter((w) => w.simple_definition && (level === 'ALL' || String(w.level || '').toUpperCase() === level));
      if (levelOnly.length) return levelOnly;
      return base.filter((w) => w.simple_definition);
    }
    return getDictionarySample(400).filter((w) => w.simple_definition);
  }, [isTestEnglish, topic, level]);

  const seedItems = useMemo(() => {
    if (!isTestEnglish && !dictionaryReady) {
      return [];
    }
    const pool = resolvePool();
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
  }, [resolvePool, size, unknownWords, dictionaryReady, isTestEnglish]);
  
  const [quizItems, setQuizItems] = useState(seedItems);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);
  const [mistakeItems, setMistakeItems] = useState([]);
  
  // Bugfix: ensure quiz items populate if initial seed was delayed
  useEffect(() => {
    if (quizItems.length === 0 && seedItems.length > 0) {
      setQuizItems(seedItems);
    }
  }, [seedItems, quizItems.length]);
  
  // Removed duplicate useAppState
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakScaleAnim = useRef(new Animated.Value(1)).current;
  const bottomSlideAnim = useRef(new Animated.Value(200)).current;

  const items = quizItems;
  const current = items[index];

  // Map progress to bar width
  useEffect(() => {
    let progress = 0;
    if (items.length > 0) {
      progress = finished ? 1 : index / items.length;
    }
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      friction: 8,
      tension: 50
    }).start();
  }, [index, finished, items.length, progressAnim]);

  // Slide up bottom action bar when ready
  useEffect(() => {
    if (selected || finished || revealed) {
      Animated.spring(bottomSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80
      }).start();
    } else {
      Animated.timing(bottomSlideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [selected, finished, revealed, bottomSlideAnim]);

  const triggerStreakAnimation = () => {
    streakScaleAnim.setValue(1.5);
    Animated.spring(streakScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const options = useMemo(() => {
    if (!current) return [];
    const distractorBase = resolvePool();
    const distractors = shuffle(distractorBase.filter((w) => w.word !== current.word)).slice(0, 3);
    return shuffle([current, ...distractors]);
  }, [current, resolvePool]);

  const pick = (word) => {
    if (!current || revealed) return;
    setSelected(word);
  };

  const next = (knew) => {
    if (!current || (!selected && !revealed)) return;
    const correct = selected === current.word;
    
    if (!revealed) {
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          if (newStreak >= 3) triggerStreakAnimation();
          return newStreak;
        });
      } else {
        setStreak(0);
        recordQuizError(current.word);
        setWrongWords((prev) => {
          if (prev.some((w) => w.word === current.word)) return prev;
          return [...prev, current];
        });
        const optionWords = options.map((o) => o.word);
        const selectedIdx = optionWords.findIndex((w) => w === selected);
        const correctIdx = optionWords.findIndex((w) => w === current.word);
        const example = current.examples?.[0];
        const explanation = example
          ? `In the sentence "${example}", "${current.word}" means: ${current.simple_definition}.`
          : `The definition "${current.simple_definition}" matches "${current.word}".`;
        setMistakeItems((prev) => {
          if (prev.some((m) => m.word === current.word)) return prev;
          return [
            ...prev,
            {
              id: `vocab-${current.word}`,
              word: current.word,
              module: 'vocab',
              moduleLabel: 'Vocabulary',
              taskTitle: 'Meaning Match',
              question: `Which word matches: "${current.simple_definition}"?`,
              options: optionWords,
              correctIndex: correctIdx >= 0 ? correctIdx : null,
              selectedIndex: selectedIdx >= 0 ? selectedIdx : null,
              correctText: current.word,
              selectedText: selected,
              explanation,
              context: example || '',
            },
          ];
        });
      }
      setRevealed(true);
      return;
    }
    
    if (knew) recordKnown(current.word);
    else {
      addUnknownWord(current.word);
      recordUnknown(current.word);
    }
    
    if (index < items.length - 1) {
      setSelected(null);
      setRevealed(false);
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const selectionCorrect = selected === current?.word;
  const accuracy = items.length ? Math.round((score / items.length) * 100) : 0;
  const isPerfect = accuracy === 100 && finished;

  const restartAll = () => {
    const freshItems = shuffle(resolvePool()).slice(0, size);
    setQuizItems(freshItems);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setWrongWords([]);
    setMistakeItems([]);
  };

  const retryWrong = () => {
    if (!wrongWords.length) return;
    setQuizItems(shuffle(wrongWords));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setWrongWords([]);
    setMistakeItems([]);
  };

  const renderOption = (o) => {
    let stateStyle = styles.optDefault;
    let textStyle = styles.optTextDefault;
    let icon = null;

    if (revealed) {
      if (o.word === current.word) {
        stateStyle = styles.optCorrect;
        textStyle = styles.optTextCorrect;
        icon = <Ionicons name="checkmark-circle" size={20} color="#059669" />;
      } else if (selected === o.word) {
        stateStyle = styles.optIncorrect;
        textStyle = styles.optTextIncorrect;
        icon = <Ionicons name="close-circle" size={20} color="#DC2626" />;
      } else {
        stateStyle = styles.optDisabled;
        textStyle = styles.optTextDisabled;
      }
    } else if (selected === o.word) {
      stateStyle = styles.optSelected;
      textStyle = styles.optTextSelected;
    }

    return (
      <TouchableOpacity
        key={o.word}
        activeOpacity={0.7}
        style={[styles.optionBox, stateStyle]}
        onPress={() => pick(o.word)}
        disabled={revealed || finished}
      >
        <Text style={[styles.optionText, textStyle]}>{o.word}</Text>
        <View style={styles.optionActions}>
          {icon}
          <TouchableOpacity onPress={() => speakText(o.word)} style={styles.speakerBtn}>
            <Ionicons name="volume-medium" size={18} color={revealed ? textStyle.color : colors.primaryDark} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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

  return (
    <View style={styles.master}>
      {/* HEADER: Gamified Progress Bar */}
      <View style={styles.header}>
        <View style={styles.topStats}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
              }]} />
            </View>
          </View>
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakScaleAnim }] }]}>
            <Text style={styles.streakEmoji}>{streak >= 3 ? '🔥' : '⭐'}</Text>
            <Text style={styles.streakScore}>{streak}</Text>
          </Animated.View>
        </View>
      </View>

      <Screen contentStyle={styles.container} scroll >
        {!finished && items.length === 0 ? (
          <View style={styles.summarySection}>
             <Text style={styles.celebrationSub}>Loading quiz data or no words found for this category...</Text>
             <Button label="Go Back" onPress={() => navigation.goBack()} />
          </View>
        ) : !finished && current ? (
          <>
            <View style={styles.questionSection}>
              <Text style={styles.questionLabel}>What does this mean?</Text>
              <Text style={styles.questionText}>"{current.simple_definition}"</Text>
            </View>

            <View style={styles.optionsSection}>
              {options.map(renderOption)}
            </View>

            {revealed && current.examples?.[0] && (
              <Animated.View style={styles.exampleBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.exampleText}>"{current.examples[0]}"</Text>
              </Animated.View>
            )}
          </>
        ) : finished ? (
          <View style={styles.summarySection}>
            <View style={styles.celebration}>
              <Text style={styles.celebrationEmoji}>{isPerfect ? '🏆' : '🎯'}</Text>
              <Text style={styles.celebrationTitle}>{isPerfect ? 'Perfect Score!' : 'Quiz Complete'}</Text>
              <Text style={styles.celebrationSub}>You scored {score} out of {items.length}</Text>
            </View>

            <Card style={styles.statsCard}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={[styles.statValue, isPerfect ? styles.colorSuccess : styles.colorPrimary]}>{accuracy}%</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Streak</Text>
                  <Text style={[styles.statValue, styles.colorError]}>🔥 {bestStreak}</Text>
                </View>
              </View>
            </Card>

            {wrongWords.length > 0 && (
              <View style={styles.missedSection}>
                <Text style={styles.missedTitle}>Words to Review</Text>
                {wrongWords.slice(0, 5).map(w => (
                  <View key={w.word} style={styles.missedRow}>
                    <Text style={styles.missedWord}>{w.word}</Text>
                    <Text style={styles.missedDef} numberOfLines={1}>{w.simple_definition}</Text>
                  </View>
                ))}
              </View>
            )}
            {mistakeItems.length > 0 && (
              <View style={styles.missedSection}>
                <Button
                  label={`Ask Mistake Coach (${mistakeItems.length})`}
                  onPress={() => navigation.navigate('MistakeCoach', {
                    module: 'vocab',
                    moduleLabel: 'Vocabulary',
                    taskTitle: 'Meaning Match',
                    mistakes: mistakeItems,
                  })}
                />
              </View>
            )}
          </View>
        ) : null}
      </Screen>

      {/* FLOATING ACTION BOTTOM BAR */}
      <Animated.View style={[styles.bottomBar, { transform: [{ translateY: bottomSlideAnim }] }]}>
        {!revealed && !finished ? (
          <Button 
            label="Check Answer" 
            onPress={() => next(true)} 
            disabled={!selected}
            style={styles.actionBtn}
          />
        ) : finished ? (
          <View style={styles.dualBtnRow}>
            {wrongWords.length > 0 ? (
              <Button label={`Retry Missed (${wrongWords.length})`} onPress={retryWrong} style={styles.dualBtn} variant="secondary" />
            ) : (
              <Button label="Restart" onPress={restartAll} style={styles.dualBtn} variant="secondary" />
            )}
            <Button label="Continue" onPress={() => navigation.goBack()} style={styles.dualBtn} />
          </View>
        ) : (
          <View style={[styles.feedbackBanner, selectionCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}>
            <Text style={[styles.bannerTitle, selectionCorrect ? styles.bannerTextCorrect : styles.bannerTextIncorrect]}>
              {selectionCorrect ? 'Excellent!' : `Correct Answer: ${current?.word}`}
            </Text>
            <View style={styles.dualBtnRow}>
              <Button 
                label={selectionCorrect ? 'Continue' : 'Got it'} 
                onPress={() => next(selectionCorrect)} 
                style={styles.dualBtn} 
                variant={selectionCorrect ? 'primary' : 'secondary'}
              />
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  master: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  backBtn: {
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressTrack: {
    flex: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 7,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakScore: {
    fontSize: 14,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: '#E11D48',
  },
  container: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: 140, // space for bottom bar
  },
  questionSection: {
    marginBottom: spacing.xl,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontSize: 24,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 34,
  },
  optionsSection: {
    gap: spacing.sm,
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    ...shadow.sm,
  },
  optDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowOpacity: 0.05,
  },
  optSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  optCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  optIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  optDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.6,
  },
  optionText: {
    fontSize: 18,
    fontFamily: typography.fontHeadline,
    fontWeight: '600',
  },
  optTextDefault: { color: '#334155' },
  optTextSelected: { color: '#1D4ED8' },
  optTextCorrect: { color: '#047857' },
  optTextIncorrect: { color: '#B91C1C' },
  optTextDisabled: { color: '#94A3B8' },
  optionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  speakerBtn: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  exampleBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  exampleText: {
    flex: 1,
    fontSize: 15,
    color: '#172554',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  summarySection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  celebration: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  celebrationTitle: {
    fontSize: 28,
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: spacing.xs,
  },
  celebrationSub: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 0, // internal row padding handles it
    marginBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 32,
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
  },
  missedSection: {
    width: '100%',
  },
  missedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: spacing.md,
  },
  missedRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  missedWord: {
    fontSize: 16,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: '#E11D48',
    marginBottom: 4,
  },
  missedDef: {
    fontSize: 14,
    color: '#64748B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...shadow.lg,
  },
  actionBtn: {
    height: 56,
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dualBtn: {
    flex: 1,
    height: 52,
  },
  feedbackBanner: {
    marginHorizontal: -spacing.xl,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bannerCorrect: { backgroundColor: '#ECFDF5' },
  bannerIncorrect: { backgroundColor: '#FEF2F2' },
  bannerTitle: {
    fontSize: 20,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  bannerTextCorrect: { color: '#047857' },
  bannerTextIncorrect: { color: '#B91C1C' },
});
