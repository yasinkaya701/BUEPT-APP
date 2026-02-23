import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

const STORAGE_CUSTOM_PLAN = '@buept_custom_daily_plan_v1';
const DEFAULT_WEEKLY_TARGETS = {
  weeklyEssays: 3,
  weeklyReadingSets: 5,
  weeklyListeningSets: 5,
  weeklyGrammarMinutes: 180,
  weeklyAppMinutes: 420,
};

function pct(correct, total) {
  if (!total) return null;
  return Math.round((correct / total) * 100);
}

function calcSkillStats(history = []) {
  let correct = 0;
  let total = 0;
  const recent = history.slice(0, 5);
  recent.forEach((item) => {
    correct += Number(item?.result?.score || 0);
    total += Number(item?.result?.total || 0);
  });
  return {
    attempts: history.length,
    accuracy: pct(correct, total),
  };
}

function computeFocus(stats) {
  const list = [
    { key: 'Reading', value: stats.reading.accuracy ?? 0, route: 'Reading' },
    { key: 'Listening', value: stats.listening.accuracy ?? 0, route: 'Listening' },
    { key: 'Grammar', value: stats.grammar.accuracy ?? 0, route: 'Grammar' },
  ].sort((a, b) => a.value - b.value);
  return list[0];
}

function statText(value) {
  return value == null ? '--' : `${value}%`;
}

function confidenceLabel(value) {
  if (value == null) return 'No Data';
  if (value >= 80) return 'Strong';
  if (value >= 65) return 'Stable';
  if (value >= 50) return 'Developing';
  return 'Needs Work';
}

function badgeForAccuracy(value) {
  if (value == null) return { label: 'Unranked', color: '#64748B' };
  if (value >= 85) return { label: 'Mastery', color: '#16A34A' };
  if (value >= 70) return { label: 'Skilled', color: '#2563EB' };
  if (value >= 55) return { label: 'Building', color: '#D97706' };
  return { label: 'Recovery', color: '#DC2626' };
}

function buildSessionQueue({ weakSkill, gap, attempts }) {
  const queue = [];
  if (gap != null && gap >= 3) queue.push('5-minute warm-up: 1 reading + 1 listening short item');
  queue.push(`Main session: ${weakSkill.key} focused practice (25 min)`);
  queue.push('Reinforcement: grammar accuracy drill (10 min)');
  if (attempts >= 6) queue.push('Checkpoint: run 1 mock section and review mistakes');
  queue.push('Wrap-up: add 5 new words to vocab and review connectors');
  return queue;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  const ms = new Date(`${todayIso()}T00:00:00`).getTime() - new Date(isoDate).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function clampPercent(done, target) {
  if (!target) return 0;
  return Math.max(0, Math.min(100, Math.round((done / target) * 100)));
}

function countEntriesInLastDays(history = [], days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);
  return history.filter((item) => {
    const iso = item?.createdAt;
    if (!iso) return false;
    const d = new Date(iso);
    return Number.isFinite(d.getTime()) && d >= cutoff;
  }).length;
}

export default function SkillsScreen({ navigation }) {
  const { readingHistory, listeningHistory, grammarHistory, mockHistory, history, screenTime, level } = useAppState();
  const [weeklyTargets, setWeeklyTargets] = useState(DEFAULT_WEEKLY_TARGETS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_CUSTOM_PLAN);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        setWeeklyTargets({
          weeklyEssays: Number(parsed.weeklyEssays) || DEFAULT_WEEKLY_TARGETS.weeklyEssays,
          weeklyReadingSets: Number(parsed.weeklyReadingSets) || DEFAULT_WEEKLY_TARGETS.weeklyReadingSets,
          weeklyListeningSets: Number(parsed.weeklyListeningSets) || DEFAULT_WEEKLY_TARGETS.weeklyListeningSets,
          weeklyGrammarMinutes: Number(parsed.weeklyGrammarMinutes) || DEFAULT_WEEKLY_TARGETS.weeklyGrammarMinutes,
          weeklyAppMinutes: Number(parsed.weeklyAppMinutes) || DEFAULT_WEEKLY_TARGETS.weeklyAppMinutes,
        });
      } catch (_) { }
    })();
  }, []);

  const stats = useMemo(() => ({
    reading: calcSkillStats(readingHistory),
    listening: calcSkillStats(listeningHistory),
    grammar: calcSkillStats(grammarHistory),
  }), [readingHistory, listeningHistory, grammarHistory]);

  const weakSkill = useMemo(() => computeFocus(stats), [stats]);
  const totalAttempts = stats.reading.attempts + stats.listening.attempts + stats.grammar.attempts;
  const minutesToday = Math.floor((screenTime?.seconds || 0) / 60);
  const compositeScore = useMemo(() => {
    const vals = [stats.reading.accuracy, stats.listening.accuracy, stats.grammar.accuracy].filter((v) => v != null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [stats]);

  const latestPracticeDate = useMemo(() => {
    const all = [...readingHistory, ...listeningHistory, ...grammarHistory]
      .map((x) => x?.createdAt)
      .filter(Boolean)
      .sort((a, b) => (a > b ? -1 : 1));
    return all[0] || null;
  }, [readingHistory, listeningHistory, grammarHistory]);

  const gap = daysSince(latestPracticeDate?.slice(0, 10));
  const writingAttempts = history.length;
  const speakingAttempts = mockHistory.filter((m) => m?.result?.speaking != null).length;
  const consistency = useMemo(() => {
    const allDays = [...readingHistory, ...listeningHistory, ...grammarHistory, ...history]
      .map((x) => x?.createdAt?.slice(0, 10))
      .filter(Boolean);
    const unique = Array.from(new Set(allDays)).sort((a, b) => (a > b ? -1 : 1));
    let streak = 0;
    let cursor = new Date();
    for (let i = 0; i < 14; i += 1) {
      const day = cursor.toISOString().slice(0, 10);
      if (unique.includes(day)) streak += 1;
      else break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { activeDays: unique.length, streak };
  }, [readingHistory, listeningHistory, grammarHistory, history]);
  const weeklySprint = useMemo(() => ([
    `2 x ${weakSkill.key} focused sessions`,
    '2 mixed skill sessions (Reading + Listening)',
    '1 grammar accuracy checkpoint',
    '1 full mock section review',
  ]), [weakSkill.key]);
  const sessionQueue = useMemo(
    () => buildSessionQueue({ weakSkill, gap, attempts: totalAttempts }),
    [weakSkill, gap, totalAttempts]
  );
  const readingBadge = badgeForAccuracy(stats.reading.accuracy);
  const listeningBadge = badgeForAccuracy(stats.listening.accuracy);
  const grammarBadge = badgeForAccuracy(stats.grammar.accuracy);
  const weeklyProgress = useMemo(() => {
    const essaysDone = countEntriesInLastDays(history, 7);
    const readingDone = countEntriesInLastDays(readingHistory, 7);
    const listeningDone = countEntriesInLastDays(listeningHistory, 7);
    const grammarDone = countEntriesInLastDays(grammarHistory, 7) * 10;
    const appMinutesDone = Math.floor((screenTime?.seconds || 0) / 60);

    return [
      {
        key: 'Reading Sets',
        done: readingDone,
        target: weeklyTargets.weeklyReadingSets,
      },
      {
        key: 'Listening Sets',
        done: listeningDone,
        target: weeklyTargets.weeklyListeningSets,
      },
      {
        key: 'Essays',
        done: essaysDone,
        target: weeklyTargets.weeklyEssays,
      },
      {
        key: 'Grammar Minutes',
        done: grammarDone,
        target: weeklyTargets.weeklyGrammarMinutes,
      },
      {
        key: 'App Minutes',
        done: appMinutesDone,
        target: weeklyTargets.weeklyAppMinutes,
      },
    ];
  }, [history, readingHistory, listeningHistory, grammarHistory, screenTime, weeklyTargets]);
  const readinessScore = useMemo(() => {
    const base = compositeScore || 0;
    const streakBonus = Math.min(12, (consistency.streak || 0) * 2);
    const attemptBonus = Math.min(8, Math.floor(totalAttempts / 4));
    return Math.max(0, Math.min(100, base + streakBonus + attemptBonus));
  }, [compositeScore, consistency.streak, totalAttempts]);
  const readinessBand = useMemo(() => {
    if (readinessScore >= 85) return 'Exam Ready';
    if (readinessScore >= 70) return 'Near Ready';
    if (readinessScore >= 55) return 'In Progress';
    return 'Foundation';
  }, [readinessScore]);
  const bogaziciChecklist = useMemo(() => ([
    `Placement level aligned: ${level}`,
    `Weak skill focus: ${weakSkill.key}`,
    `Weekly reading/listening targets: ${weeklyTargets.weeklyReadingSets}/${weeklyTargets.weeklyListeningSets}`,
    `Streak status: ${consistency.streak} day(s)`,
  ]), [level, weakSkill.key, weeklyTargets.weeklyReadingSets, weeklyTargets.weeklyListeningSets, consistency.streak]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Skills</Text>
      <Text style={styles.sub}>Roadmap + weak-skill targeting</Text>

      <Card style={styles.hero}>
        <Text style={styles.heroTitle}>Current Focus</Text>
        <Text style={styles.heroBody}>Priority: {weakSkill.key} ({statText(weakSkill.value)})</Text>
        <Text style={styles.heroMeta}>Level {level} • Attempts {totalAttempts} • Today {minutesToday} min</Text>
        <View style={styles.row}>
          <Button label={`Train ${weakSkill.key}`} onPress={() => navigation.navigate(weakSkill.route)} />
          <Button label="Mock" variant="secondary" onPress={() => navigation.navigate('Mock')} />
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{statText(stats.reading.accuracy)}</Text>
          <Text style={styles.statLabel}>Reading</Text>
          <Text style={styles.statSub}>{confidenceLabel(stats.reading.accuracy)}</Text>
          <Text style={[styles.badgePill, { backgroundColor: readingBadge.color }]}>{readingBadge.label}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{statText(stats.listening.accuracy)}</Text>
          <Text style={styles.statLabel}>Listening</Text>
          <Text style={styles.statSub}>{confidenceLabel(stats.listening.accuracy)}</Text>
          <Text style={[styles.badgePill, { backgroundColor: listeningBadge.color }]}>{listeningBadge.label}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{statText(stats.grammar.accuracy)}</Text>
          <Text style={styles.statLabel}>Grammar</Text>
          <Text style={styles.statSub}>{confidenceLabel(stats.grammar.accuracy)}</Text>
          <Text style={[styles.badgePill, { backgroundColor: grammarBadge.color }]}>{grammarBadge.label}</Text>
        </Card>
      </View>

      <Card style={styles.card}>
        <Text style={styles.h3}>Skill Health</Text>
        <Text style={styles.body}>Composite Score: {statText(compositeScore)}</Text>
        <View style={styles.healthBarTrack}>
          <View style={[styles.healthBarFill, { width: `${compositeScore || 0}%` }]} />
        </View>
        <Text style={styles.meta}>Interpretation: {confidenceLabel(compositeScore)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Boğaziçi Readiness</Text>
        <Text style={styles.body}>Readiness Score: {readinessScore}% ({readinessBand})</Text>
        <View style={styles.healthBarTrack}>
          <View style={[styles.healthBarFill, styles.readinessFill, { width: `${readinessScore}%` }]} />
        </View>
        {bogaziciChecklist.map((item) => (
          <Text key={item} style={styles.body}>• {item}</Text>
        ))}
        <View style={styles.row}>
          <Button label="Placement Retake" variant="secondary" onPress={() => navigation.navigate('PlacementTest')} />
          <Button label="Class Calendar" variant="secondary" onPress={() => navigation.navigate('ClassScheduleCalendar')} />
          <Button label="Mock Exam" onPress={() => navigation.navigate('Mock')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Smart Actions</Text>
        <Text style={styles.body}>If gap is high, start with short warm-up then full set.</Text>
        <Text style={styles.meta}>Last practice gap: {gap == null ? '--' : `${gap} day(s)`}</Text>
        <View style={styles.row}>
          <Button label="Reading 10m" variant="secondary" onPress={() => navigation.navigate('Reading')} />
          <Button label="Listening 10m" variant="secondary" onPress={() => navigation.navigate('Listening')} />
          <Button label="Grammar 10m" variant="secondary" onPress={() => navigation.navigate('Grammar')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>7-Day Sprint</Text>
        {weeklySprint.map((item) => (
          <Text key={item} style={styles.body}>• {item}</Text>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Weekly Goal Progress</Text>
        {weeklyProgress.map((item) => {
          const percent = clampPercent(item.done, item.target);
          return (
            <View key={item.key} style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>{item.key}</Text>
                <Text style={styles.goalMeta}>{item.done} / {item.target}</Text>
              </View>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${percent}%` }]} />
              </View>
            </View>
          );
        })}
        <View style={styles.row}>
          <Button label="Edit Plan" variant="secondary" onPress={() => navigation.navigate('StudyPlan')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Next Session Queue</Text>
        {sessionQueue.map((item, idx) => (
          <View key={item} style={styles.queueRow}>
            <Text style={styles.queueIndex}>{idx + 1}</Text>
            <Text style={styles.queueText}>{item}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Skill Tracks</Text>

        <View style={styles.trackRow}>
          <View style={styles.trackBody}>
            <Text style={styles.trackTitle}>Reading Track</Text>
            <Text style={styles.trackMeta}>Attempts: {stats.reading.attempts} • Accuracy: {statText(stats.reading.accuracy)}</Text>
          </View>
          <Button label="Open" onPress={() => navigation.navigate('Reading')} />
        </View>

        <View style={styles.trackRow}>
          <View style={styles.trackBody}>
            <Text style={styles.trackTitle}>Listening Track</Text>
            <Text style={styles.trackMeta}>Attempts: {stats.listening.attempts} • Accuracy: {statText(stats.listening.accuracy)}</Text>
          </View>
          <Button label="Open" onPress={() => navigation.navigate('Listening')} />
        </View>

        <View style={styles.trackRow}>
          <View style={styles.trackBody}>
            <Text style={styles.trackTitle}>Grammar Track</Text>
            <Text style={styles.trackMeta}>Attempts: {stats.grammar.attempts} • Accuracy: {statText(stats.grammar.accuracy)}</Text>
          </View>
          <Button label="Open" onPress={() => navigation.navigate('Grammar')} />
        </View>

        <View style={styles.trackRow}>
          <View style={styles.trackBody}>
            <Text style={styles.trackTitle}>Writing Track</Text>
            <Text style={styles.trackMeta}>Attempts: {writingAttempts} • Focus: coherence + argument quality</Text>
          </View>
          <Button label="Open" onPress={() => navigation.navigate('WritingEditor')} />
        </View>

        <View style={styles.trackRow}>
          <View style={styles.trackBody}>
            <Text style={styles.trackTitle}>Speaking Track</Text>
            <Text style={styles.trackMeta}>Attempts: {speakingAttempts} • Focus: fluency + clarity</Text>
          </View>
          <Button label="Open" onPress={() => navigation.navigate('AISpeakingPartner')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Consistency</Text>
        <Text style={styles.body}>Current streak: {consistency.streak} day(s)</Text>
        <Text style={styles.meta}>Active study days saved: {consistency.activeDays}</Text>
        <View style={styles.row}>
          <Button label="Review" variant="secondary" onPress={() => navigation.navigate('Review')} />
          <Button label="History" variant="secondary" onPress={() => navigation.navigate('History')} />
          <Button label="Progress" onPress={() => navigation.navigate('Progress')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>AI Skill Tools</Text>
        <Text style={styles.body}>Use AI assistants for speaking, presentation, and lesson video practice.</Text>
        <View style={styles.row}>
          <Button label="Chat Coach" variant="secondary" onPress={() => navigation.navigate('Chatbot')} />
          <Button label="Presentation" variant="secondary" onPress={() => navigation.navigate('AIPresentationPrep')} />
          <Button label="Lesson Video" onPress={() => navigation.navigate('AILessonVideoStudio')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Assessment & Planning</Text>
        <Text style={styles.body}>Placement, study plan, analytics and full mock in one place.</Text>
        <View style={styles.row}>
          <Button label="Placement" variant="secondary" onPress={() => navigation.navigate('PlacementTest')} />
          <Button label="Plan" variant="secondary" onPress={() => navigation.navigate('StudyPlan')} />
          <Button label="Analytics" variant="secondary" onPress={() => navigation.navigate('Analytics')} />
          <Button label="Exams" onPress={() => navigation.navigate('Exams')} />
        </View>
        <Text style={styles.meta}>Mock attempts: {mockHistory.length}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Resources</Text>
        <Text style={styles.body}>Boğaziçi prep pack: podcast + article + exam source hub.</Text>
        <View style={styles.row}>
          <Button label="Open Resources" variant="secondary" onPress={() => navigation.navigate('Resources')} />
          <Button label="Exams" variant="secondary" onPress={() => navigation.navigate('Exams')} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  hero: {
    marginBottom: spacing.lg,
    backgroundColor: '#0f172a',
    borderColor: '#1e3a8a',
  },
  heroTitle: {
    color: '#93c5fd',
    fontSize: typography.small,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroBody: {
    color: '#fff',
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  heroMeta: {
    color: '#cbd5e1',
    fontSize: typography.small,
    marginBottom: spacing.md,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.h2,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  statLabel: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  statSub: {
    marginTop: 4,
    fontSize: 11,
    color: colors.primaryDark,
  },
  badgePill: {
    marginTop: spacing.xs,
    color: '#fff',
    fontSize: 10,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  healthBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  readinessFill: {
    backgroundColor: '#0EA5E9',
  },
  trackRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  trackBody: {
    flex: 1,
  },
  trackTitle: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  trackMeta: {
    marginTop: 2,
    fontSize: typography.small,
    color: colors.muted,
  },
  queueRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  queueIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    color: '#1E3A8A',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontFamily: typography.fontHeadline,
  },
  queueText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 20,
  },
  goalRow: {
    marginBottom: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  goalMeta: {
    fontSize: typography.small,
    color: colors.muted,
  },
  goalTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
