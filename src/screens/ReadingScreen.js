import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, TextInput, useWindowDimensions } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

import baseTasks from '../../data/reading_tasks.json';
import hardTasks from '../../data/reading_tasks_hard.json';
import clozeTasks from '../../data/reading_cloze.json';
import { useAppState } from '../context/AppState';
import { buildAdaptivePlan, buildRecommendedTask } from '../utils/studyPlan';

const tasks = [...baseTasks, ...hardTasks, ...clozeTasks];

function pickWeakReadingMode(history = []) {
  const stats = {
    cloze: { c: 0, t: 0 },
    comprehension: { c: 0, t: 0 },
  };
  history.forEach((item) => {
    const result = item?.result;
    const taskId = result?.taskId;
    const score = Number(result?.score || 0);
    const total = Number(result?.total || 0);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !total) return;
    const hasCloze = (task.questions || []).some((q) => q.type === 'cloze');
    const key = hasCloze ? 'cloze' : 'comprehension';
    stats[key].c += score;
    stats[key].t += total;
  });
  const clozePct = stats.cloze.t ? Math.round((stats.cloze.c / stats.cloze.t) * 100) : null;
  const compPct = stats.comprehension.t ? Math.round((stats.comprehension.c / stats.comprehension.t) * 100) : null;
  if (clozePct == null && compPct == null) return { weak: 'comprehension', clozePct: null, compPct: null };
  if (clozePct == null) return { weak: 'cloze', clozePct, compPct };
  if (compPct == null) return { weak: 'comprehension', clozePct, compPct };
  return clozePct <= compPct
    ? { weak: 'cloze', clozePct, compPct }
    : { weak: 'comprehension', clozePct, compPct };
}

export default function ReadingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { readingHistory, listeningHistory, grammarHistory, history, level } = useAppState();
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('READING_LEVEL_FILTER');
        if (saved) setLevelFilter(saved);
      } catch (e) { }
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('READING_LEVEL_FILTER', levelFilter).catch(() => { });
  }, [levelFilter]);
  const latest = readingHistory[0]?.result;
  const lastTask = useMemo(() => {
    const id = readingHistory[0]?.result?.taskId;
    return tasks.find((t) => t.id === id) || null;
  }, [readingHistory]);
  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    readingHistory.forEach((h) => {
      const s = Number(h?.result?.score || 0);
      const t = Number(h?.result?.total || 0);
      if (!t) return;
      correct += s;
      total += t;
    });
    const accuracy = total ? Math.round((correct / total) * 100) : null;
    return { correct, total, accuracy, attempts: readingHistory.length };
  }, [readingHistory]);
  const adaptive = buildAdaptivePlan({
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    writingHistory: history
  });
  const rec = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = tasks.filter((t) => {
      const levelOk = levelFilter === 'ALL' || t.level === levelFilter;
      const queryOk = !q || `${t.title} ${t.level}`.toLowerCase().includes(q);
      return levelOk && queryOk;
    });
    return buildRecommendedTask(pool, readingHistory, level);
  }, [levelFilter, query, readingHistory, level]);
  const filtered = useMemo(
    () => {
      const q = query.trim().toLowerCase();
      return tasks.filter((t) => {
        const levelOk = levelFilter === 'ALL' || t.level === levelFilter;
        const queryOk = !q || `${t.title} ${t.level}`.toLowerCase().includes(q);
        return levelOk && queryOk;
      });
    },
    [levelFilter, query]
  );
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const done = readingHistory.filter((item) => {
      const d = new Date(item?.createdAt || 0);
      return Number.isFinite(d.getTime()) && d >= start;
    }).length;
    const target = 5;
    return { done, target, pct: Math.min(100, Math.round((done / target) * 100)) };
  }, [readingHistory]);
  const modeStats = useMemo(() => pickWeakReadingMode(readingHistory), [readingHistory]);
  const weakModeTask = useMemo(() => {
    if (modeStats.weak === 'cloze') {
      return filtered.find((t) => (t.questions || []).some((q) => q.type === 'cloze')) || filtered[0];
    }
    return filtered.find((t) => !(t.questions || []).some((q) => q.type === 'cloze')) || filtered[0];
  }, [filtered, modeStats.weak]);
  const quickModes = useMemo(() => {
    const cloze = filtered.find((t) => (t.questions || []).some((q) => q.type === 'cloze'));
    const comprehension = filtered.find((t) => !(t.questions || []).some((q) => q.type === 'cloze'));
    return { cloze, comprehension };
  }, [filtered]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Reading</Text>
      <Text style={styles.sub}>Boğaziçi prep style academic texts</Text>
      {isLandscape ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Landscape Optimized</Text>
          <Text style={styles.sub}>Task list is displayed in 2 columns for faster selection.</Text>
        </Card>
      ) : null}

      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>Tip</Text>
        <Text style={styles.bannerBody}>Skim first, then answer using exact evidence from the passage.</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Latest Score</Text>
        <Text style={styles.body}>{latest ? `${latest.score}/${latest.total}` : 'No attempts yet'}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Reading Accuracy</Text>
        <Text style={styles.body}>{stats.accuracy != null ? `${stats.accuracy}%` : 'No attempts yet'}</Text>
        <Text style={styles.sub}>Attempts: {stats.attempts} • Total Qs: {stats.total}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>7-Day Reading Mission</Text>
        <Text style={styles.body}>Completed: {weeklyProgress.done}/{weeklyProgress.target} sets</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${weeklyProgress.pct}%` }]} />
        </View>
        <Text style={styles.sub}>Target: 5 reading sets per week.</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Recommended For You</Text>
        <Text style={styles.body}>{adaptive.focusTitle}</Text>
        <Text style={styles.sub}>{adaptive.focusAction}</Text>
        {rec?.task ? (
          <>
            <Text style={styles.meta}>{rec.reason}</Text>
            <Button label={`Start: ${rec.task.title}`} onPress={() => navigation.navigate('ReadingDetail', { taskId: rec.task.id })} />
          </>
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Strategy Coach</Text>
        <Text style={styles.body}>
          Weak mode: {modeStats.weak}
          {modeStats.clozePct != null ? ` • Cloze ${modeStats.clozePct}%` : ''}
          {modeStats.compPct != null ? ` • Comprehension ${modeStats.compPct}%` : ''}
        </Text>
        <Text style={styles.sub}>
          {modeStats.weak === 'cloze'
            ? 'Train context clues: grammar + collocation around blank words.'
            : 'Train evidence reading: locate exact sentence before answering.'}
        </Text>
        {weakModeTask ? (
          <Button label={`Practice ${modeStats.weak}`} onPress={() => navigation.navigate('ReadingDetail', { taskId: weakModeTask.id })} />
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Quick Reading Modes</Text>
        <Text style={styles.sub}>Jump directly to the mode you want to train.</Text>
        <View style={styles.row}>
          <Button
            label="Comprehension"
            variant="secondary"
            onPress={() => quickModes.comprehension && navigation.navigate('ReadingDetail', { taskId: quickModes.comprehension.id })}
            disabled={!quickModes.comprehension}
          />
          <Button
            label="Cloze Mode"
            variant="secondary"
            onPress={() => quickModes.cloze && navigation.navigate('ReadingDetail', { taskId: quickModes.cloze.id })}
            disabled={!quickModes.cloze}
          />
        </View>
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
        <Text style={styles.sub}>Showing {filtered.length} task(s)</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Find Task</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />
      </Card>
      {lastTask ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Continue Last Task</Text>
          <Text style={styles.body}>{lastTask.title}</Text>
          <Button label="Continue" onPress={() => navigation.navigate('ReadingDetail', { taskId: lastTask.id })} />
        </Card>
      ) : null}

      <Text style={styles.section}>In-App Practice</Text>
      <View style={isLandscape ? styles.grid : null}>
        {filtered.map((t) => (
          <View key={t.id} style={isLandscape ? styles.gridItem : null}>
            <Card style={styles.card}>
              <Text style={styles.h3}>{t.title}</Text>
              <Text style={styles.body}>Level {t.level} • {t.time}</Text>
              <View style={styles.row}>
                <Text style={styles.tag}>{t.questions.length} Qs</Text>
                {t.questions.some(q => q.type === 'cloze') && <Text style={[styles.tag, styles.tagCloze]}>Fill-in-Blank</Text>}
                <Text style={styles.tag}>Academic</Text>
              </View>
              <Button label="Start" onPress={() => navigation.navigate('ReadingDetail', { taskId: t.id })} />
            </Card>
          </View>
        ))}
      </View>

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
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm
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
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
  },
  tag: {
    backgroundColor: colors.secondary,
    color: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999
  },
  tagCloze: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text
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
});
