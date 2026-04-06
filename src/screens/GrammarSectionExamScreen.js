import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, View, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import baseTasks from '../../data/grammar_tasks.json';
import hardTasks from '../../data/grammar_tasks_hard.json';
import testEnglishTasks from '../../data/test_english_grammar_tasks.json';
import { useAppState } from '../context/AppState';

const allTasks = [...baseTasks, ...hardTasks, ...testEnglishTasks];

function shuffle(list, seed = 1) {
  const arr = [...list];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

function buildSectionExam(tasks, weakMode, seed) {
  const source = Array.isArray(tasks) && tasks.length ? tasks : allTasks;
  const prioritized = [...source].sort((a, b) => {
    const aCloze = (a.questions || []).some((q) => q.type === 'cloze');
    const bCloze = (b.questions || []).some((q) => q.type === 'cloze');
    const aWeak = weakMode === 'cloze' ? aCloze : !aCloze;
    const bWeak = weakMode === 'cloze' ? bCloze : !bCloze;
    if (aWeak === bWeak) return 0;
    return aWeak ? -1 : 1;
  });
  const selectedTasks = shuffle(prioritized, seed).slice(0, 4);
  const questions = [];
  selectedTasks.forEach((task, taskIdx) => {
    const qs = shuffle(task.questions || [], seed + taskIdx).slice(0, 5);
    qs.forEach((q, idx) => {
      questions.push({
        ...q,
        sourceTaskId: task.id,
        sourceTaskTitle: task.title,
        sourceIndex: idx + 1,
      });
    });
  });
  return shuffle(questions, seed + 71).slice(0, 20);
}

function groupBySource(questions = [], answers = {}) {
  const map = {};
  questions.forEach((q, idx) => {
    const key = q.sourceTaskId || 'unknown';
    if (!map[key]) map[key] = { title: q.sourceTaskTitle || key, total: 0, correct: 0 };
    map[key].total += 1;
    if (answers[idx] === q.answer) map[key].correct += 1;
  });
  return Object.values(map).map((x) => ({
    ...x,
    pct: Math.round((x.correct / Math.max(1, x.total)) * 100),
  }));
}

function buildMistakeItem(q, selectedIdx) {
  const options = Array.isArray(q.options) ? q.options : [];
  const correctIdx = Number.isFinite(q.answer) ? q.answer : null;
  const selected = Number.isFinite(selectedIdx) ? selectedIdx : null;
  return {
    module: 'grammar',
    moduleLabel: 'Grammar • Section Exam',
    taskTitle: q.sourceTaskTitle || 'Section Exam',
    question: q.q || '',
    options,
    correctIndex: correctIdx,
    selectedIndex: selected,
    correctText: correctIdx != null ? options[correctIdx] : '',
    selectedText: selected != null ? options[selected] : 'Skipped',
  };
}

export default function GrammarSectionExamScreen({ route, navigation }) {
  const weakMode = route?.params?.weakMode || 'mcq';
  const taskIds = useMemo(
    () => (Array.isArray(route?.params?.taskIds) ? route.params.taskIds : []),
    [route?.params?.taskIds]
  );
  const selectedTasks = useMemo(() => {
    if (!taskIds.length) return allTasks;
    const set = new Set(taskIds);
    const filtered = allTasks.filter((t) => set.has(t.id));
    return filtered.length ? filtered : allTasks;
  }, [taskIds]);
  const examSeed = useMemo(() => Number(route?.params?.seed || Date.now()), [route?.params?.seed]);
  const questions = useMemo(
    () => buildSectionExam(selectedTasks, weakMode, examSeed),
    [selectedTasks, weakMode, examSeed]
  );
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(30 * 60);
  const [timerOn, setTimerOn] = useState(true);
  const { addGrammarResult, recordGrammarError } = useAppState();

  const unanswered = useMemo(
    () => questions.filter((_, idx) => answers[idx] == null).length,
    [questions, answers]
  );
  const score = useMemo(() => {
    if (!checked) return null;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });
    return { correct, total: questions.length, pct: Math.round((correct / Math.max(1, questions.length)) * 100) };
  }, [checked, questions, answers]);
  const bySource = useMemo(
    () => (checked ? groupBySource(questions, answers) : []),
    [checked, questions, answers]
  );

  useEffect(() => {
    if (!timerOn || checked || remainingSec <= 0) return undefined;
    const t = setInterval(() => setRemainingSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timerOn, checked, remainingSec]);

  const submit = useCallback(() => {
    if (checked) return;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });
    addGrammarResult({ taskId: 'section_exam', score: correct, total: questions.length });
    questions.forEach((q, i) => {
      if (answers[i] !== q.answer) {
        recordGrammarError(q.sourceTaskId, q.sourceTaskTitle);
      }
    });
    setChecked(true);
    setTimerOn(false);
  }, [checked, questions, answers, addGrammarResult, recordGrammarError]);

  useEffect(() => {
    if (!checked && remainingSec === 0) submit();
  }, [checked, remainingSec, submit]);

  const submitWithConfirm = useCallback(() => {
    if (checked) return;
    if (unanswered > 0) {
      Alert.alert(
        'Submit exam?',
        `${unanswered} question(s) unanswered.`,
        [{ text: 'Continue', style: 'cancel' }, { text: 'Submit', onPress: submit }]
      );
      return;
    }
    submit();
  }, [checked, unanswered, submit]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Grammar Section Exam</Text>
      <Text style={styles.sub}>20 questions - mixed tasks</Text>
      <Card style={styles.card}>
        <Text style={styles.body}>Timer: {formatTime(remainingSec)}</Text>
        <Text style={styles.note}>Unanswered: {unanswered}</Text>
        <View style={styles.row}>
          <Button label={timerOn ? 'Pause' : 'Resume'} variant="secondary" onPress={() => setTimerOn((v) => !v)} disabled={checked} />
          <Button label={checked ? 'Submitted' : 'Submit'} onPress={submitWithConfirm} disabled={checked} />
        </View>
      </Card>

      {score ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Score</Text>
          <Text style={styles.body}>{score.correct}/{score.total} ({score.pct}%)</Text>
          {bySource.map((item) => (
            <Text key={item.title} style={styles.note}>
              {item.title}: {item.pct}% ({item.correct}/{item.total})
            </Text>
          ))}
          <View style={styles.row}>
            <Button label="Retry New Set" variant="secondary" onPress={() => navigation.replace('GrammarSectionExam', { weakMode, taskIds, seed: Date.now() })} />
            <Button label="Back to Grammar" onPress={() => navigation.goBack()} />
          </View>
        </Card>
      ) : null}

      {questions.map((q, qi) => (
        <Card key={`q-${qi}`} style={styles.card}>
          <Text style={styles.h3}>Q{qi + 1}. {q.q}</Text>
          <Text style={styles.note}>Source: {q.sourceTaskTitle}</Text>
          {q.options.map((opt, oi) => (
            <Button
              key={`o-${oi}`}
              label={opt}
              variant={
                checked
                  ? (oi === q.answer ? 'primary' : (answers[qi] === oi ? 'ghost' : 'secondary'))
                  : (answers[qi] === oi ? 'primary' : 'secondary')
              }
              onPress={() => !checked && setAnswers((prev) => ({ ...prev, [qi]: oi }))}
              disabled={checked}
            />
          ))}
          {checked ? (
            <>
              <Text style={answers[qi] === q.answer ? styles.correct : styles.incorrect}>
                {answers[qi] === q.answer ? 'Correct' : `Wrong - Correct: ${q.options[q.answer]}`}
              </Text>
              {answers[qi] !== q.answer && (
                <Button
                  label="Open Mistake Coach"
                  variant="secondary"
                  onPress={() => navigation.navigate('MistakeCoach', { mistakes: [buildMistakeItem(q, answers[qi])] })}
                  style={styles.mistakeBtn}
                />
              )}
            </>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  note: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  correct: {
    fontSize: typography.small,
    color: '#1F8B4C',
    fontFamily: typography.fontHeadline,
    marginTop: spacing.xs,
  },
  incorrect: {
    fontSize: typography.small,
    color: '#B42318',
    fontFamily: typography.fontHeadline,
    marginTop: spacing.xs,
  },
  mistakeBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
