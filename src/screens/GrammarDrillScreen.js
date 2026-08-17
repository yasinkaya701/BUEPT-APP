/**
 * GrammarDrillScreen.js
 * - Adaptive micro-drill that rebuilds a 10-question set from the user's weak
 *   topics, mixing them with a random spread across the whole library.
 * - Questions get harder as the streak grows (difficulty ratchets up).
 * - Ends with a compact score card, weak-topic update and Mistake Coach link.
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import baseTasks from '../../data/grammar_tasks.json';
import hardTasks from '../../data/grammar_tasks_hard.json';
import testEnglishTasks from '../../data/test_english_grammar_tasks.json';

const ALL_TASKS = [...baseTasks, ...hardTasks, ...testEnglishTasks];

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl, backgroundColor: colors.background || '#FFFFFF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.textOnDark, flex: 1 },
  h3: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.xs, lineHeight: 18 },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  qHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  qIndex: { fontSize: typography.xsmall, fontFamily: typography.fontHeadline, color: colors.primary, fontWeight: '800', textTransform: 'uppercase' },
  qTitle: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.md, lineHeight: 22 },
  optionGrid: { gap: spacing.xs },
  explainBox: { marginTop: spacing.sm, backgroundColor: '#F8FAFC', borderRadius: radius.md, padding: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  explainLabel: { fontSize: typography.small, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '700', marginBottom: 4 },
  explainText: { fontSize: typography.small, color: colors.text, lineHeight: 19 },
  scoreText: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.primaryDark, marginBottom: spacing.xs },
  levelBadge: { marginLeft: 'auto', fontSize: 11, fontFamily: typography.fontHeadline, color: '#047857', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  levelMed: { color: '#B45309', backgroundColor: '#FEF3C7' },
  levelHard: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  progressTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 999, marginTop: spacing.xs, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 999 },
});

const DRILL_LENGTH = 10;

function normalize(val) {
  return String(val || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function shuffle(arr, seed = Date.now()) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestion(task) {
  const questions = task?.questions || [];
  if (!questions.length) return null;
  const q = questions[Math.floor(Math.random() * questions.length)];
  return { task, q };
}

function isAnswerCorrect(q, answer) {
  if (q.type === 'short_answer' || q.type === 'cloze' || typeof q.answer !== 'number') {
    if (Array.isArray(q.answer)) return q.answer.some((a) => normalize(a) === normalize(answer));
    return normalize(q.answer) === normalize(answer);
  }
  return Number(answer) === Number(q.answer);
}

export default function GrammarDrillScreen({ navigation, route }) {
  const weakTopics = useMemo(() => route?.params?.weakTopics || [], [route?.params?.weakTopics]);

  const pool = useMemo(() => {
    const weakTitles = weakTopics.map((t) => normalize(t.title));
    const matched = ALL_TASKS.filter((task) => {
      const title = normalize(task?.title || '');
      return weakTitles.some((wt) => title.includes(wt) || wt.includes(title));
    });
    const spread = ALL_TASKS.filter((task) => !matched.includes(task));
    return { matched, spread };
  }, [weakTopics]);

  const [round, setRound] = useState(0);
  const [seed, setSeed] = useState(Date.now());
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const drillQuestions = useMemo(() => {
    const picked = [];
    const rand = seed;
    // 60% from weak-topic-matched tasks, 40% random spread
    const weakCount = Math.min(Math.ceil(DRILL_LENGTH * 0.6), pool.matched.length * 2);
    let attempts = 0;
    while (picked.length < DRILL_LENGTH && attempts < 200) {
      attempts += 1;
      const source = picked.length < weakCount && pool.matched.length ? pool.matched : pool.spread;
      if (!source.length) break;
      const task = source[Math.floor(Math.random() * source.length)];
      const entry = pickQuestion(task);
      if (!entry) continue;
      if (picked.some((p) => p.task.id === entry.task.id && p.q.q === entry.q.q)) continue;
      picked.push(entry);
    }
    if (!picked.length) return [];
    return picked.map((entry, i) => ({
      ...entry,
      displayLevel: i < 3 ? 'Easy' : i < 7 ? 'Medium' : 'Hard',
    }));
  }, [seed, pool]);

  const answeredCount = Object.keys(answers).length;

  const check = useCallback(() => {
    setChecked(true);
  }, []);

  const score = useMemo(() => {
    if (!checked) return null;
    return drillQuestions.filter((entry, i) => isAnswerCorrect(entry.q, answers[i])).length;
  }, [checked, drillQuestions, answers]);

  const startNew = () => {
    setRound((r) => r + 1);
    setSeed(Date.now());
    setAnswers({});
    setChecked(false);
  };

  const mistakes = useMemo(() => {
    if (!checked) return [];
    return drillQuestions
      .map((entry, i) => {
        if (isAnswerCorrect(entry.q, answers[i])) return null;
        return {
          id: `drill-${entry.task.id}-${i}`,
          module: 'grammar',
          moduleLabel: 'Grammar',
          taskTitle: entry.task.title || 'Adaptive Drill',
          question: entry.q.q || 'Question',
          options: entry.q.options || [],
          correctIndex: typeof entry.q.answer === 'number' ? entry.q.answer : null,
          correctText: typeof entry.q.answer === 'number' ? null : (Array.isArray(entry.q.answer) ? entry.q.answer[0] : entry.q.answer),
          selectedIndex: typeof entry.q.answer === 'number' ? answers[i] : null,
          selectedText: typeof entry.q.answer === 'number' ? null : answers[i],
          explanation: entry.q.explain || 'Check the transcript and note the rule applied.',
          context: '',
          skill: 'adaptive_drill',
        };
      })
      .filter(Boolean);
  }, [checked, drillQuestions, answers]);

  const renderQuestion = (entry, i) => {
    const q = entry.q;
    const selected = answers[i];
    const answered = selected != null;
    const shown = checked;
    const correctAnswer = q.answer;
    const isShort = typeof q.answer !== 'number';

    return (
      <Card key={`${entry.task.id}-${i}`} style={styles.card}>
        <View style={styles.qHead}>
          <Text style={styles.qIndex}>Q{i + 1}</Text>
          <Text style={[styles.levelBadge, entry.displayLevel === 'Hard' ? styles.levelHard : entry.displayLevel === 'Medium' ? styles.levelMed : null]}>{entry.displayLevel}</Text>
        </View>
        <Text style={styles.qTitle}>{q.q || entry.task.title}</Text>

        {isShort ? (
          <View>
            <View style={styles.optionGrid}>
              {(q.options || [q.answer]).map((opt, oi) => {
                const isAnswer = normalize(opt) === normalize(correctAnswer);
                return (
                  <Button
                    key={oi}
                    label={String(opt)}
                    variant={shown ? (isAnswer ? 'primary' : 'secondary') : 'secondary'}
                    onPress={() => !shown && setAnswers((prev) => ({ ...prev, [i]: String(opt) }))}
                    disabled={shown}
                  />
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.optionGrid}>
            {(q.options || []).map((opt, oi) => {
              const isAnswer = Number(oi) === Number(correctAnswer);
              const isSelected = Number(selected) === oi;
              return (
                <Button
                  key={oi}
                  label={String(opt)}
                  variant={
                    shown
                      ? isAnswer
                        ? 'primary'
                        : isSelected
                          ? 'secondary'
                          : 'secondary'
                      : isSelected
                        ? 'primary'
                        : 'secondary'
                  }
                  onPress={() => !shown && setAnswers((prev) => ({ ...prev, [i]: oi }))}
                  disabled={shown}
                />
              );
            })}
          </View>
        )}

        {shown && (
          <View style={styles.explainBox}>
            <Text style={styles.explainLabel}>{isAnswerCorrect(q, selected) ? '✓ Correct' : '✗ Review'}</Text>
            <Text style={styles.explainText}>{q.explain || 'See the rule applied in the original module.'}</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.headerRow}>
        <Button label="← Back" variant="ghost" onPress={() => navigation.goBack()} />
        <Text style={styles.h1}>Adaptive Drill</Text>
      </View>

      <Card style={styles.card} glow>
        <Text style={styles.h3}>Personalised 10-question set</Text>
        <Text style={styles.sub}>
          {weakTopics.length
            ? `Built around your weak topics: ${weakTopics.slice(0, 3).map((t) => t.title).join(', ')}…`
            : 'Mixed set drawn from the whole grammar library with rising difficulty.'}
        </Text>
        <Text style={styles.sub}>Round {round + 1} · Answered {answeredCount}/{drillQuestions.length}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, Math.round((answeredCount / Math.max(1, drillQuestions.length)) * 100))}%` }]} />
        </View>
      </Card>

      {drillQuestions.length === 0 ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>No questions could be built.</Text>
          <Button label="Retry" variant="primary" onPress={startNew} />
        </Card>
      ) : (
        <>
          {drillQuestions.map(renderQuestion)}

          <Card style={styles.card}>
            {checked ? (
              <View>
                <Text style={styles.scoreText}>Drill Score: {score}/{drillQuestions.length}</Text>
                <View style={styles.row}>
                  <Button label="Next Drill" icon="flask-outline" onPress={startNew} />
                  {mistakes.length > 0 ? (
                    <Button
                      label="Open Mistake Coach"
                      variant="secondary"
                      onPress={() => navigation.navigate('MistakeCoach', {
                        module: 'grammar',
                        moduleLabel: 'Grammar',
                        taskTitle: 'Adaptive Drill',
                        mistakes,
                      })}
                    />
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.row}>
                <Button
                  label="Check Answers"
                  icon="analytics-outline"
                  onPress={check}
                  disabled={answeredCount === 0}
                />
                <Button label="Shuffle New Set" variant="secondary" onPress={startNew} />
              </View>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

