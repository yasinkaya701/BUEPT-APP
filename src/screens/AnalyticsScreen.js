/**
 * AnalyticsScreen.js
 * Full analytics dashboard with visual charts, skill breakdown,
 * streak tracking, and performance trends.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function MiniBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <View style={styles.miniBarRow}>
      <Text style={styles.miniBarLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.miniBarTrack}>
        <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.miniBarValue, { color }]}>{value}</Text>
    </View>
  );
}

// ── Trend Sparkline (last 7 sessions) ────────────────────────────────────────
function Sparkline({ values = [], color }) {
  const max = Math.max(1, ...values);
  return (
    <View style={styles.spark}>
      {values.map((v, i) => (
        <View key={i} style={styles.sparkCol}>
          <View style={[styles.sparkBar, {
            height: Math.max(3, (v / max) * 40),
            backgroundColor: v > 0 ? color : 'rgba(255,255,255,0.08)',
          }]} />
        </View>
      ))}
    </View>
  );
}

// ── Stat Tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, icon, color, subtitle }) {
  return (
    <View style={[styles.tile, { borderLeftColor: color }]}>
      <Text style={[styles.tileIcon]}>{icon}</Text>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      {subtitle ? <Text style={styles.tileSub}>{subtitle}</Text> : null}
    </View>
  );
}

// ── Skill Card ────────────────────────────────────────────────────────────────
function SkillCard({ name, avg, sessions, color, icon }) {
  const pct = avg ?? 0;
  return (
    <Card style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.skillName}>{name}</Text>
          <Text style={styles.skillSessions}>{sessions} session{sessions !== 1 ? 's' : ''}</Text>
        </View>
        <Text style={[styles.skillPct, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.skillTrack}>
        <View style={[styles.skillFill, {
          width: `${pct}%`,
          backgroundColor: color,
        }]} />
      </View>
    </Card>
  );
}

// ── Streak Calculator ─────────────────────────────────────────────────────────
function calcStreak(allHistory) {
  const activeDays = new Set(
    allHistory
      .map((x) => (x.createdAt || '').slice(0, 10))
      .filter(Boolean)
  );
  let streak = 0;
  while (true) {
    const d = new Date();
    d.setDate(d.getDate() - streak);
    const key = d.toISOString().slice(0, 10);
    if (!activeDays.has(key)) break;
    streak += 1;
  }
  return streak;
}

function avgPct(history, getScore, getTotal) {
  if (!history.length) return null;
  const sum = history.reduce((acc, h) => acc + (getScore(h) / Math.max(1, getTotal(h))) * 100, 0);
  return Math.round(sum / history.length);
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const { history, mockHistory, readingHistory, listeningHistory, grammarHistory } = useAppState();
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const allHistory = useMemo(() => [
    ...history, ...mockHistory, ...readingHistory, ...listeningHistory, ...grammarHistory,
  ], [history, mockHistory, readingHistory, listeningHistory, grammarHistory]);

  const streak = useMemo(() => calcStreak(allHistory), [allHistory]);

  const totalSessions = history.length + mockHistory.length + readingHistory.length + listeningHistory.length + grammarHistory.length;

  const writingAvg = useMemo(() => avgPct(history, h => h.report?.rubric?.Total ?? 0, () => 20), [history]);
  const readingAvg = useMemo(() => avgPct(readingHistory, h => h.result?.score ?? 0, h => h.result?.total ?? 10), [readingHistory]);
  const listeningAvg = useMemo(() => avgPct(listeningHistory, h => h.result?.score ?? 0, h => h.result?.total ?? 10), [listeningHistory]);
  const grammarAvg = useMemo(() => avgPct(grammarHistory, h => h.result?.score ?? 0, h => h.result?.total ?? 10), [grammarHistory]);
  const mockAvg = useMemo(() => {
    if (!mockHistory.length) return null;
    return Math.round(mockHistory.reduce((a, m) => a + (m.result?.overall ?? 0), 0) / mockHistory.length);
  }, [mockHistory]);

  // Last 7 sessions bar data per skill
  const writingTrend = useMemo(() => history.slice(0, 7).reverse().map(h => Math.round(((h.report?.rubric?.Total ?? 0) / 20) * 100)), [history]);
  const readingTrend = useMemo(() => readingHistory.slice(0, 7).reverse().map(h => Math.round((h.result.score / Math.max(1, h.result.total)) * 100)), [readingHistory]);
  const listeningTrend = useMemo(() => listeningHistory.slice(0, 7).reverse().map(h => Math.round((h.result.score / Math.max(1, h.result.total)) * 100)), [listeningHistory]);
  const grammarTrend = useMemo(() => grammarHistory.slice(0, 7).reverse().map(h => Math.round((h.result.score / Math.max(1, h.result.total)) * 100)), [grammarHistory]);

  // Weekly activity counts
  const weekActivity = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    const countByDay = {};
    allHistory.forEach(item => {
      const day = (item.createdAt || '').slice(0, 10);
      if (!day) return;
      countByDay[day] = (countByDay[day] || 0) + 1;
    });
    return days.map(d => countByDay[d] || 0);
  }, [allHistory]);
  const weekMax = Math.max(1, ...weekActivity);

  // Best skill
  const skills = [
    { name: 'Reading', avg: readingAvg },
    { name: 'Listening', avg: listeningAvg },
    { name: 'Grammar', avg: grammarAvg },
    { name: 'Writing', avg: writingAvg },
  ].filter(s => s.avg !== null);
  const bestSkill = skills.sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))[0];
  const weakSkill = [...skills].sort((a, b) => (a.avg ?? 100) - (b.avg ?? 100))[0];

  const gradeColor = (pct) => {
    if (pct === null || pct === undefined) return colors.muted;
    if (pct >= 80) return '#10B981';
    if (pct >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics</Text>
        <Text style={styles.subtitle}>Your BUEPT performance at a glance</Text>
      </View>

      {/* Top Stat Tiles */}
      <View style={[styles.tilesRow, isWide && styles.tilesRowWide]}>
        <StatTile label="Total Sessions" value={totalSessions} icon="🎯" color="#3B82F6" />
        <StatTile label="Day Streak" value={`${streak}🔥`} icon="📅" color="#F59E0B" />
        {bestSkill && <StatTile label="Best Skill" value={bestSkill.name} icon="⭐" color="#10B981" subtitle={`${bestSkill.avg}%`} />}
        {weakSkill && <StatTile label="Focus On" value={weakSkill.name} icon="📌" color="#EF4444" subtitle={`${weakSkill.avg}%`} />}
      </View>

      {/* Weekly Activity */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📅 Weekly Activity</Text>
        <Text style={styles.sectionSub}>Sessions completed in the last 7 days</Text>
        <View style={styles.weekRow}>
          {weekActivity.map((count, i) => {
            const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const day = dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1];
            return (
              <View key={i} style={styles.weekCol}>
                <View style={[styles.weekBar, {
                  height: Math.max(4, (count / weekMax) * 60),
                  backgroundColor: count > 0 ? '#3B82F6' : 'rgba(59,130,246,0.12)',
                }]} />
                <Text style={styles.weekDay}>{day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Skill Breakdown */}
      <Text style={styles.sectionHeader}>Skill Performance</Text>

      <SkillCard name="Reading" avg={readingAvg ?? 0} sessions={readingHistory.length} color="#3B82F6" icon="📖" />
      <SkillCard name="Listening" avg={listeningAvg ?? 0} sessions={listeningHistory.length} color="#8B5CF6" icon="🎧" />
      <SkillCard name="Grammar" avg={grammarAvg ?? 0} sessions={grammarHistory.length} color="#10B981" icon="✏️" />
      <SkillCard name="Writing" avg={writingAvg ?? 0} sessions={history.length} color="#EF4444" icon="📝" />
      {mockHistory.length > 0 && (
        <SkillCard name="Mock Exam" avg={mockAvg ?? 0} sessions={mockHistory.length} color="#F59E0B" icon="📋" />
      )}

      {/* Trend Charts */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📈 Score Trends (Last 7)</Text>
        <Text style={styles.sectionSub}>Each bar = one session's score %</Text>
        {writingTrend.length > 0 && (
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Writing</Text>
            <Sparkline values={writingTrend} color="#EF4444" />
          </View>
        )}
        {readingTrend.length > 0 && (
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Reading</Text>
            <Sparkline values={readingTrend} color="#3B82F6" />
          </View>
        )}
        {listeningTrend.length > 0 && (
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Listening</Text>
            <Sparkline values={listeningTrend} color="#8B5CF6" />
          </View>
        )}
        {grammarTrend.length > 0 && (
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Grammar</Text>
            <Sparkline values={grammarTrend} color="#10B981" />
          </View>
        )}
        {writingTrend.length === 0 && readingTrend.length === 0 && listeningTrend.length === 0 && grammarTrend.length === 0 && (
          <Text style={styles.emptyText}>Complete exercises to see your trends.</Text>
        )}
      </Card>

      {/* Session counts summary */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📋 Session Summary</Text>
        <MiniBar label="Writing" value={history.length} max={Math.max(1, totalSessions)} color="#EF4444" />
        <MiniBar label="Reading" value={readingHistory.length} max={Math.max(1, totalSessions)} color="#3B82F6" />
        <MiniBar label="Listening" value={listeningHistory.length} max={Math.max(1, totalSessions)} color="#8B5CF6" />
        <MiniBar label="Grammar" value={grammarHistory.length} max={Math.max(1, totalSessions)} color="#10B981" />
        <MiniBar label="Mock" value={mockHistory.length} max={Math.max(1, totalSessions)} color="#F59E0B" />
      </Card>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  header: { paddingVertical: spacing.lg, alignItems: 'center' },
  title: { fontSize: typography.h2 || 22, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: typography.small || 12, color: colors.muted },
  tilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  tilesRowWide: { flexWrap: 'nowrap' },
  tile: {
    flex: 1, minWidth: 120, padding: spacing.md,
    backgroundColor: colors.surface || '#1E293B',
    borderRadius: radius.lg || 12,
    borderLeftWidth: 3,
    alignItems: 'center',
  },
  tileIcon: { fontSize: 22, marginBottom: 4 },
  tileValue: { fontSize: typography.h3 || 18, fontWeight: '800', fontFamily: typography.fontHeadline },
  tileLabel: { fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' },
  tileSub: { fontSize: 10, color: colors.muted, fontWeight: '700' },
  card: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.h3 || 16, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: colors.muted, marginBottom: spacing.md },
  sectionHeader: { fontSize: typography.h3 || 16, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  weekRow: { flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 6 },
  weekCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  weekBar: { width: '80%', borderRadius: radius.sm || 4, minHeight: 4 },
  weekDay: { fontSize: 9, color: colors.muted, marginTop: 4 },
  skillCard: { marginBottom: spacing.sm },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  skillIcon: { fontSize: 20, marginRight: spacing.sm },
  skillName: { fontSize: typography.body || 14, fontFamily: typography.fontHeadline, color: colors.text },
  skillSessions: { fontSize: 11, color: colors.muted },
  skillPct: { fontSize: typography.h3 || 18, fontWeight: '800' },
  skillTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 3 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  trendLabel: { width: 64, fontSize: 11, color: colors.muted, fontFamily: typography.fontBody },
  spark: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 3 },
  sparkCol: { flex: 1, justifyContent: 'flex-end' },
  sparkBar: { borderRadius: 2, minHeight: 3 },
  miniBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  miniBarLabel: { width: 64, fontSize: 12, color: colors.muted },
  miniBarTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 4 },
  miniBarValue: { width: 32, fontSize: 11, fontWeight: '700', textAlign: 'right' },
  emptyText: { fontSize: typography.body || 14, color: colors.muted, textAlign: 'center', padding: spacing.md },
});
