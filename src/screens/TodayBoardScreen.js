import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { ScoreRing, Sparkline } from '../components/ui';
import { useAppState } from '../context/AppState';
import { useUniversity } from '../context/UniversityContext';

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headValue: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    lineHeight: 26,
  },
  percentBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  percentText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  trendMeta: {
    flex: 1,
  },
  trendAvg: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    lineHeight: 24,
  },
  trendNote: {
    fontSize: typography.micro,
    color: colors.muted,
  },
  trendStreak: {
    fontSize: typography.micro,
    color: colors.success,
    fontFamily: typography.fontHeadline,
    marginTop: 2,
  },
  sparkBox: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkEmpty: {
    fontSize: typography.small,
    color: colors.muted,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  missionDone: {
    opacity: 0.75,
  },
  missionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionMeta: {
    flex: 1,
  },
  missionLabel: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    lineHeight: 17,
  },
  missionDetail: {
    fontSize: typography.micro,
    color: colors.muted,
    lineHeight: 15,
  },
  missionGo: {
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  missionGoText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  allDoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  allDoneText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.success,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  wordChip: {
    backgroundColor: colors.tintRed,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  wordChipText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    color: colors.error,
  },
  emptyNote: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
}

const TODAY_MISSIONS = [
  {
    id: 'vocab-srs',
    label: 'Review SRS due words',
    detail: 'Clear your spaced-repetition queue to keep weak words in circulation.',
    route: 'Vocabulary',
    icon: 'swap-horizontal-outline',
  },
  {
    id: 'reading',
    label: 'Complete one Reading passage',
    detail: 'Finish a passage with its comprehension quiz to hold your streak.',
    route: 'Reading',
    icon: 'reader-outline',
  },
  {
    id: 'listening',
    label: 'Listen to one lecture',
    detail: 'Selective Listening practice with the signpost detector.',
    route: 'Listening',
    icon: 'ear-outline',
  },
  {
    id: 'writing',
    label: 'Write a body paragraph',
    detail: '120 words minimum with at least 2 connectors in the Essay Bank.',
    route: 'EssayBank',
    icon: 'create-outline',
  },
  {
    id: 'speaking',
    label: 'Run one mock interview stage',
    detail: 'Speak into the mic and beat your last coverage score.',
    route: 'SpeakingMockInterview',
    icon: 'mic-outline',
  },
  {
    id: 'full-mock',
    label: 'Run one full-format mock',
    detail: 'Complete a timed official-format mock from the offline bank and see your band report.',
    route: 'AIMockGenerator',
    icon: 'school-outline',
  },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getTodayMap() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    return JSON.parse(window.localStorage.getItem(`busept.today.${todayKey()}`) || '{}');
  } catch (e) {
    return {};
  }
}

function setTodayMap(map) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(`busept.today.${todayKey()}`, JSON.stringify(map));
  } catch (e) {
    // ignore storage errors
  }
}

export default function TodayBoardScreen({ navigation }) {
  const { streakDays = 0, xp = 0, errorWords = [], mockHistory = [], addXp } = useAppState();
  const { uniKey } = useUniversity();
  const isOdtu = uniKey === 'odtu';
  // Back-compat aliases so the board works even if AppState renames fields.
  // errorWords is a {word: missCount} object in AppState — map to an array for the board.
  const weakWords = Array.isArray(errorWords)
    ? errorWords
    : Array.isArray(Object.entries(errorWords || {}))
      ? Object.entries(errorWords || {})
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([word, count]) => ({ word, count: Number(count) || 0 }))
      : [];
  const mockResults = Array.isArray(mockHistory) ? mockHistory : [];

  const completedToday = useMemo(() => getTodayMap(), []);

  const completedCount = Object.values(completedToday).filter(Boolean).length;

  const trend = useMemo(() => {
    const last = (mockResults || []).slice(-7).map((r) => Number(r?.score || 0));
    return last.length >= 2 ? last : [];
  }, [mockResults]);

  const avgScore = useMemo(() => {
    if (!mockResults.length) return 0;
    const recent = mockResults.slice(-7);
    return Math.round(recent.reduce((s, r) => s + Number(r?.score || 0), 0) / recent.length);
  }, [mockResults]);

  const markDone = (id) => {
    setTodayMap({ ...getTodayMap(), [id]: true });
    addXp(15, 'Daily Mission');
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Today's Board</Text>
      <Text style={styles.headerSub}>
        {isOdtu
          ? 'Günlük görevler İYS\u2019in tüm bölümlerini canlı tutar: dinleme, okuma, not alma, yazma ve konuşma. Bugünkülerin tamamla, zincirin büyüsün.'
          : 'Günlük görevler tüm BUSEPT modüllerini canlı tutar. Bugünkülerin tamamla, zincirin büyüsün.'}
      </Text>

      <Card style={[styles.card, shadow.elev1]}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.headLabel}>Today's progress</Text>
            <Text style={styles.headValue}>{completedCount} / {TODAY_MISSIONS.length} missions</Text>
          </View>
          <View style={[styles.percentBadge, completedCount === TODAY_MISSIONS.length ? { backgroundColor: colors.successLight } : { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.percentText, completedCount === TODAY_MISSIONS.length ? { color: colors.successDark } : { color: colors.primaryDark }]}>{Math.round((completedCount / TODAY_MISSIONS.length) * 100)}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(completedCount / TODAY_MISSIONS.length) * 100}%` }]} />
        </View>
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Last 7 mocks</Text>
        <View style={styles.trendRow}>
          <ScoreRing value={avgScore} size={66} stroke={6} />
          <View style={styles.trendMeta}>
            <Text style={styles.trendAvg}>{avgScore} avg</Text>
            <Text style={styles.trendNote}>Most recent 7 official mocks</Text>
            <Text style={styles.trendStreak}>{streakDays} day streak</Text>
          </View>
        </View>
        {trend.length >= 2 ? (
          <View style={styles.sparkBox}>
            <Sparkline data={trend} height={54} stroke={colors.primary} color={colors.primary} />
          </View>
        ) : (
          <View style={styles.sparkBox}>
            <Text style={styles.sparkEmpty}>Run a mock to start your trend line.</Text>
          </View>
        )}
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Daily missions</Text>
        {TODAY_MISSIONS.map((mission) => {
          const done = !!completedToday[mission.id];
          return (
            <TouchableOpacity
              key={mission.id}
              activeOpacity={0.75}
              onPress={() => markDone(mission.id)}
              style={[styles.missionRow, done && styles.missionDone]}
            >
              <View style={[styles.missionIcon, done ? { backgroundColor: colors.successLight } : { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={done ? 'checkmark' : mission.icon} size={16} color={done ? colors.success : colors.primary} />
              </View>
              <View style={styles.missionMeta}>
                <Text style={styles.missionLabel}>{mission.label}</Text>
                <Text style={styles.missionDetail}>{mission.detail}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate(mission.route)}
                style={styles.missionGo}
              >
                <Text style={styles.missionGoText}>Open</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        {completedCount === TODAY_MISSIONS.length ? (
          <View style={styles.allDoneBox}>
            <Ionicons name="trophy-outline" size={18} color={colors.success} />
            <Text style={styles.allDoneText}>All missions complete — +{TODAY_MISSIONS.length * 15} XP earned today.</Text>
          </View>
        ) : null}
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Weak words watchlist</Text>
        {weakWords.length ? (
          <View style={styles.wordGrid}>
            {weakWords.slice(0, 10).map((w) => (
              <View key={w?.word || w} style={styles.wordChip}>
                <Text style={styles.wordChipText}>
                  {typeof w === 'string' ? w : w?.word || '?'}
                  {w?.count ? `  · ${w.count}` : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyNote}>No weak words collected yet — keep practicing SRS reviews.</Text>
        )}
        <Button label="Review weak words" variant="secondary" onPress={() => navigation.navigate('Review')} />
      </Card>
    </Screen>
  );
}

);
