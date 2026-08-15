import React, { Fragment, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 140;
const CHART_PAD = 24;

function XPChart({ points }) {
  if (!points.length) return <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT }} />;
  const max = Math.max(...points.map((p) => p.value), 1);
  const positions = points.map((p, i) => ({
    x: CHART_PAD + (points.length > 1 ? (i / (points.length - 1)) * (CHART_WIDTH - CHART_PAD * 2) : CHART_WIDTH / 2),
    y: CHART_HEIGHT - CHART_PAD - (p.value / max) * (CHART_HEIGHT - CHART_PAD * 2),
    ...p,
  }));
  const line = positions.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const zeroY = CHART_HEIGHT - CHART_PAD;
  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <Line x1={CHART_PAD} y1={zeroY} x2={CHART_WIDTH - CHART_PAD} y2={zeroY} stroke={colors.border} strokeWidth={1} />
      <Polyline points={line} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {positions.map((p, i) => (
        <Fragment key={i}>
          <Circle cx={p.x} cy={p.y} r={5} fill={colors.surface} stroke={colors.primary} strokeWidth={2.5} />
          <Text x={p.x} y={CHART_HEIGHT - 6} fontSize={9} fill={colors.muted} textAnchor="middle">{p.day}</Text>
        </Fragment>
      ))}
    </Svg>
  );
}

export default function XPTimelineScreen() {
  const { xp = 0, xpLog = [], streakDays = 0 } = useAppState();
  const log = useMemo(() => (Array.isArray(xpLog) ? xpLog : []), [xpLog]);

  const weekPoints = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const byDay = new Array(7).fill(0);
    log.forEach((entry) => {
      const date = new Date(entry?.date || entry?.createdAt || Date.now());
      const dayIndex = (date.getDay() + 6) % 7;
      byDay[dayIndex] += entry?.xp || 0;
    });
    return days.map((day, i) => ({ day, value: byDay[i] }));
  }, [log]);

  const totalThisWeek = weekPoints.reduce((sum, p) => sum + p.value, 0);

  const recentEntries = useMemo(() => log.slice(-10).reverse(), [log]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>XP Timeline</Text>
      <Text style={styles.headerSub}>{totalThisWeek} XP earned this week • {streakDays} day streak</Text>

      <Card style={[styles.chartCard, shadow.elev1]}>
        <Text style={styles.chartLabel}>Last 7 days</Text>
        <XPChart points={weekPoints} />
      </Card>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryTile, shadow.elev1]}>
          <Text style={styles.summaryValue}>{totalThisWeek}</Text>
          <Text style={styles.summaryLabel}>This Week</Text>
        </View>
        <View style={[styles.summaryTile, shadow.elev1]}>
          <Text style={styles.summaryValue}>{xp}</Text>
          <Text style={styles.summaryLabel}>Total XP</Text>
        </View>
        <View style={[styles.summaryTile, shadow.elev1]}>
          <Text style={styles.summaryValue}>{log.length}</Text>
          <Text style={styles.summaryLabel}>Entries</Text>
        </View>
      </View>

      <Text style={styles.logLabel}>Recent activity</Text>
      {recentEntries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="trending-up-outline" size={22} color={colors.muted} />
          <Text style={styles.emptyText}>No XP recorded yet. Complete a quiz or mock to start the timeline.</Text>
        </Card>
      ) : (
        recentEntries.map((entry, idx) => (
          <View key={`xpt-${idx}-${entry?.createdAt || idx}`} style={[styles.entryRow, shadow.elev1]}>
            <View style={styles.entryDot}>
              <Ionicons name="flash" size={14} color={colors.accentBright} />
            </View>
            <View style={styles.entryMeta}>
              <Text style={styles.entryTitle}>{entry?.action || 'Practice'}</Text>
              <Text style={styles.entryDate}>{new Date(entry?.createdAt || Date.now()).toLocaleString()}</Text>
            </View>
            <Text style={styles.entryXp}>+{entry?.xp || 0} XP</Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  summaryLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  logLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryMeta: {
    flex: 1,
  },
  entryTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  entryDate: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: 1,
  },
  entryXp: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.accent,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.small,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
