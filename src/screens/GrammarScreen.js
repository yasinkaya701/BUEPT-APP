import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import baseTasks from '../../data/grammar_tasks.json';
import hardTasks from '../../data/grammar_tasks_hard.json';
import { useAppState } from '../context/AppState';
import { buildAdaptivePlan, buildRecommendedTask } from '../utils/studyPlan';

const tasks = [...baseTasks, ...hardTasks];

function buildGrammarChallenge(list = [], seed = 1) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const index = Math.abs((seed * 17 + 11) % list.length);
  const task = list[index];
  const qs = task?.questions || [];
  if (!qs.length) return null;
  const qIndex = Math.abs((seed * 31 + 5) % qs.length);
  return { task, question: qs[qIndex], qIndex };
}

function pickWeakGrammarMode(history = []) {
  const stats = {
    cloze: { c: 0, t: 0 },
    mcq: { c: 0, t: 0 },
  };
  history.forEach((item) => {
    const result = item?.result;
    const taskId = result?.taskId;
    const score = Number(result?.score || 0);
    const total = Number(result?.total || 0);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !total) return;
    const hasCloze = (task.questions || []).some((q) => q.type === 'cloze');
    const key = hasCloze ? 'cloze' : 'mcq';
    stats[key].c += score;
    stats[key].t += total;
  });
  const clozePct = stats.cloze.t ? Math.round((stats.cloze.c / stats.cloze.t) * 100) : null;
  const mcqPct = stats.mcq.t ? Math.round((stats.mcq.c / stats.mcq.t) * 100) : null;
  if (clozePct == null && mcqPct == null) return { weak: 'mcq', clozePct: null, mcqPct: null };
  if (clozePct == null) return { weak: 'cloze', clozePct, mcqPct };
  if (mcqPct == null) return { weak: 'mcq', clozePct, mcqPct };
  return clozePct <= mcqPct
    ? { weak: 'cloze', clozePct, mcqPct }
    : { weak: 'mcq', clozePct, mcqPct };
}

function buildGrammarStreak(history = []) {
  const uniqueDays = Array.from(
    new Set(
      history
        .map((item) => String(item?.createdAt || '').slice(0, 10))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    )
  ).sort((a, b) => (a < b ? 1 : -1));
  if (!uniqueDays.length) return 0;
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const first = new Date(uniqueDays[0]);
  first.setHours(0, 0, 0, 0);
  const dayDiff = Math.floor((start - first) / (24 * 60 * 60 * 1000));
  if (dayDiff > 1) return 0;
  let streak = 0;
  let cursor = first;
  for (let i = 0; i < uniqueDays.length; i += 1) {
    const d = new Date(uniqueDays[i]);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() !== cursor.getTime()) break;
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function GrammarScreen({ navigation }) {
  const { readingHistory, listeningHistory, grammarHistory, history, level, grammarErrors } = useAppState();
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [challengeSeed, setChallengeSeed] = useState(1);
  const [challengeChoice, setChallengeChoice] = useState(null);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    grammarHistory.forEach((h) => {
      const s = Number(h?.result?.score || 0);
      const t = Number(h?.result?.total || 0);
      if (!t) return;
      correct += s;
      total += t;
    });
    const accuracy = total ? Math.round((correct / total) * 100) : null;
    return { correct, total, accuracy, attempts: grammarHistory.length };
  }, [grammarHistory]);
  const filtered = useMemo(
    () => tasks.filter((t) => {
      const levelOk = levelFilter === 'ALL' || t.level === levelFilter;
      const q = query.trim().toLowerCase();
      const queryOk = !q || `${t.title} ${t.explain || ''}`.toLowerCase().includes(q);
      const hasCloze = (t.questions || []).some((x) => x.type === 'cloze');
      const modeOk = modeFilter === 'ALL' || (modeFilter === 'CLOZE' ? hasCloze : !hasCloze);
      return levelOk && queryOk && modeOk;
    }),
    [levelFilter, query, modeFilter]
  );
  const adaptive = buildAdaptivePlan({
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    writingHistory: history
  });
  const rec = useMemo(
    () => buildRecommendedTask(filtered, grammarHistory, level),
    [filtered, grammarHistory, level]
  );
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const done = grammarHistory.filter((item) => {
      const d = new Date(item?.createdAt || 0);
      return Number.isFinite(d.getTime()) && d >= start;
    }).length;
    const target = 6;
    return { done, target, pct: Math.min(100, Math.round((done / target) * 100)) };
  }, [grammarHistory]);
  const modeStats = useMemo(() => pickWeakGrammarMode(grammarHistory), [grammarHistory]);
  const streakDays = useMemo(() => buildGrammarStreak(grammarHistory), [grammarHistory]);
  const readiness = useMemo(() => {
    const recent = grammarHistory.slice(0, 5);
    if (!recent.length) return null;
    const avg = Math.round(
      recent.reduce((sum, item) => {
        const score = Number(item?.result?.score || 0);
        const total = Math.max(1, Number(item?.result?.total || 0));
        return sum + (score / total) * 100;
      }, 0) / recent.length
    );
    const latest = recent[0];
    const prev = recent[1];
    const latestPct = latest
      ? Math.round((Number(latest?.result?.score || 0) / Math.max(1, Number(latest?.result?.total || 0))) * 100)
      : null;
    const prevPct = prev
      ? Math.round((Number(prev?.result?.score || 0) / Math.max(1, Number(prev?.result?.total || 0))) * 100)
      : null;
    const delta = latestPct != null && prevPct != null ? latestPct - prevPct : null;
    const band = avg >= 80 ? 'Ready' : avg >= 65 ? 'Almost Ready' : 'Needs Core Review';
    return { avg, latestPct, delta, band };
  }, [grammarHistory]);
  const modeTask = useMemo(() => {
    if (modeStats.weak === 'cloze') {
      return filtered.find((t) => (t.questions || []).some((q) => q.type === 'cloze')) || filtered[0];
    }
    return filtered.find((t) => !(t.questions || []).some((q) => q.type === 'cloze')) || filtered[0];
  }, [filtered, modeStats.weak]);
  const quickDrillTask = useMemo(() => {
    if (!filtered.length) return null;
    const byAttempts = filtered
      .map((t) => {
        const attempts = grammarHistory.filter((h) => h?.result?.taskId === t.id).length;
        return { t, attempts };
      })
      .sort((a, b) => a.attempts - b.attempts);
    return byAttempts[0]?.t || filtered[0];
  }, [filtered, grammarHistory]);
  const topErrorTopics = useMemo(() => {
    const list = Object.entries(grammarErrors || {})
      .map(([id, meta]) => ({ id, title: meta?.title || id, count: Number(meta?.count || 0) }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return list;
  }, [grammarErrors]);
  const dailyChallenge = useMemo(() => buildGrammarChallenge(filtered, challengeSeed), [filtered, challengeSeed]);
  const checkChallenge = () => {
    if (challengeChoice == null) return;
    setChallengeChecked(true);
  };
  const nextChallenge = () => {
    setChallengeSeed((s) => s + 1);
    setChallengeChoice(null);
    setChallengeChecked(false);
  };
  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Grammar</Text>
      <Text style={styles.sub}>Core accuracy practice</Text>

      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>Tip</Text>
        <Text style={styles.bannerBody}>Focus on patterns: S‑V agreement, tense, and prepositions.</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Filter by Level</Text>
        <View style={styles.row}>
          {['ALL', 'P1', 'P2', 'P3', 'P4'].map((lv) => (
            <Text
              key={lv}
              onPress={() => setLevelFilter(lv)}
              style={[styles.filterChip, levelFilter === lv && styles.filterChipActive]}
            >
              {lv}
            </Text>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search grammar topic..."
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />
        <View style={styles.row}>
          {['ALL', 'CLOZE', 'MCQ'].map((mode) => (
            <Text
              key={mode}
              onPress={() => setModeFilter(mode)}
              style={[styles.filterChip, modeFilter === mode && styles.filterChipActive]}
            >
              {mode}
            </Text>
          ))}
        </View>
        <Text style={styles.sub}>Showing {filtered.length} task(s)</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Grammar Accuracy</Text>
        <Text style={styles.body}>{stats.accuracy != null ? `${stats.accuracy}%` : 'No attempts yet'}</Text>
        <Text style={styles.sub}>Attempts: {stats.attempts} • Total Qs: {stats.total}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Daily Grammar Challenge</Text>
        {!dailyChallenge ? (
          <Text style={styles.note}>No challenge available for this filter.</Text>
        ) : (
          <>
            <Text style={styles.note}>From: {dailyChallenge.task.title}</Text>
            <Text style={styles.body}>{dailyChallenge.question.q}</Text>
            {dailyChallenge.question.options.map((opt, i) => {
              const selected = challengeChoice === i;
              const correct = challengeChecked && i === dailyChallenge.question.answer;
              const wrong = challengeChecked && selected && i !== dailyChallenge.question.answer;
              return (
                <Text
                  key={`challenge-${i}`}
                  onPress={() => !challengeChecked && setChallengeChoice(i)}
                  style={[
                    styles.challengeOption,
                    selected && styles.challengeOptionSelected,
                    correct && styles.challengeOptionCorrect,
                    wrong && styles.challengeOptionWrong,
                  ]}
                >
                  {opt}
                </Text>
              );
            })}
            <View style={styles.row}>
              <Button label="Check" variant="secondary" onPress={checkChallenge} disabled={challengeChoice == null || challengeChecked} />
              <Button label="Next" variant="secondary" onPress={nextChallenge} />
              <Button label="Open Task" onPress={() => navigation.navigate('GrammarDetail', { taskId: dailyChallenge.task.id })} />
            </View>
            {challengeChecked && dailyChallenge.question.explain ? (
              <Text style={styles.note}>{dailyChallenge.question.explain}</Text>
            ) : null}
          </>
        )}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>7-Day Grammar Mission</Text>
        <Text style={styles.body}>Completed: {weeklyProgress.done}/{weeklyProgress.target} sets</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${weeklyProgress.pct}%` }]} />
        </View>
        <Text style={styles.note}>Target: 6 grammar sets per week.</Text>
        <Text style={styles.note}>Current streak: {streakDays} day(s)</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Exam Readiness</Text>
        {!readiness ? (
          <Text style={styles.note}>Solve at least 1 task to get readiness tracking.</Text>
        ) : (
          <>
            <Text style={styles.body}>
              Readiness: {readiness.band} ({readiness.avg}% last 5)
            </Text>
            <Text style={styles.note}>
              Latest set: {readiness.latestPct}% {readiness.delta == null ? '' : `• Trend ${readiness.delta >= 0 ? '+' : ''}${readiness.delta}%`}
            </Text>
            <View style={styles.row}>
              <Button
                label="Start Focus Block"
                onPress={() => modeTask && navigation.navigate('GrammarDetail', { taskId: modeTask.id })}
                disabled={!modeTask}
              />
              <Button
                label="Mixed Practice"
                variant="secondary"
                onPress={() => quickDrillTask && navigation.navigate('GrammarDetail', { taskId: quickDrillTask.id })}
                disabled={!quickDrillTask}
              />
            </View>
          </>
        )}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Recommended For You</Text>
        <Text style={styles.body}>{adaptive.focusTitle}</Text>
        <Text style={styles.note}>{adaptive.focusAction}</Text>
        {rec?.task ? (
          <>
            <Text style={styles.note}>{rec.reason}</Text>
            <Button label={`Start: ${rec.task.title}`} onPress={() => navigation.navigate('GrammarDetail', { taskId: rec.task.id })} />
          </>
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Strategy Coach</Text>
        <Text style={styles.body}>
          Weak mode: {modeStats.weak}
          {modeStats.clozePct != null ? ` • Cloze ${modeStats.clozePct}%` : ''}
          {modeStats.mcqPct != null ? ` • MCQ ${modeStats.mcqPct}%` : ''}
        </Text>
        <Text style={styles.note}>
          {modeStats.weak === 'cloze'
            ? 'Train tense/article/collocation around blanks before picking options.'
            : 'Train rule recall: eliminate options by grammar pattern.'}
        </Text>
        {modeTask ? (
          <Button label={`Practice ${modeStats.weak}`} onPress={() => navigation.navigate('GrammarDetail', { taskId: modeTask.id })} />
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Exam Simulator</Text>
        <Text style={styles.note}>Randomized grammar sets with timer-ready flow.</Text>
        <View style={styles.row}>
          <Button
            label="Quick 5Q"
            variant="secondary"
            onPress={() =>
              modeTask &&
              navigation.navigate('GrammarDetail', {
                taskId: modeTask.id,
                questionLimit: 5,
                shuffleSeed: Date.now(),
                examMode: true,
              })
            }
            disabled={!modeTask}
          />
          <Button
            label="Standard 10Q"
            onPress={() =>
              quickDrillTask &&
              navigation.navigate('GrammarDetail', {
                taskId: quickDrillTask.id,
                questionLimit: 10,
                shuffleSeed: Date.now(),
                examMode: true,
              })
            }
            disabled={!quickDrillTask}
          />
        </View>
        <Button
          label="Full Section Exam 20Q"
          onPress={() =>
            navigation.navigate('GrammarSectionExam', {
              weakMode: modeStats.weak,
              taskIds: filtered.map((t) => t.id),
              seed: Date.now(),
            })
          }
          disabled={!filtered.length}
        />
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Frequent Error Topics</Text>
        {topErrorTopics.length === 0 ? (
          <Text style={styles.note}>No repeated grammar mistakes recorded yet.</Text>
        ) : (
          topErrorTopics.map((topic) => (
            <View key={topic.id} style={styles.topicRow}>
              <View style={styles.topicBody}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.note}>Mistakes: {topic.count}</Text>
              </View>
              <Button
                label="Practice"
                variant="secondary"
                onPress={() => navigation.navigate('GrammarDetail', { taskId: topic.id })}
              />
            </View>
          ))
        )}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Grammar Recovery Plan</Text>
        <Text style={styles.note}>1. 10-minute drill on least-practiced topic</Text>
        <Text style={styles.note}>2. Review top error topic notes</Text>
        <Text style={styles.note}>3. Re-test with missed-only mode</Text>
        <View style={styles.row}>
          <Button
            label="Start 10m Drill"
            variant="secondary"
            onPress={() => quickDrillTask && navigation.navigate('GrammarDetail', { taskId: quickDrillTask.id })}
            disabled={!quickDrillTask}
          />
          <Button
            label="Error Stats"
            variant="secondary"
            onPress={() => navigation.navigate('ErrorStats')}
          />
        </View>
      </Card>
      {filtered.map((t) => (
        <Card key={t.id} style={styles.card}>
          <Text style={styles.h3}>{t.title}</Text>
          <Text style={styles.body}>Level {t.level} • {t.time}</Text>
          <View style={styles.row}>
            <Text style={styles.tag}>{t.difficulty || 'core'}</Text>
            <Text style={styles.tag}>10 Qs</Text>
          </View>
          <Text style={styles.note}>{t.explain}</Text>
          <Button label="Start" onPress={() => navigation.navigate('GrammarDetail', { taskId: t.id })} />
        </Card>
      ))}

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  banner: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline
  },
  bannerBody: {
    color: '#DDE8FF',
    marginTop: spacing.xs,
    fontSize: typography.body
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  note: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md
  },
  section: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  card: {
    marginBottom: spacing.lg
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  tag: {
    backgroundColor: colors.secondary,
    color: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999
  },
  filterChip: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999
  },
  filterChipActive: {
    backgroundColor: colors.primaryDark,
    color: '#FFFFFF'
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  topicRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  topicBody: {
    flex: 1,
  },
  topicTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  challengeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  challengeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  challengeOptionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF3',
    color: '#14532D',
  },
  challengeOptionWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    color: '#7F1D1D',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
