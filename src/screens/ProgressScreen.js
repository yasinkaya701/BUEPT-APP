import React, { useMemo } from 'react';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function ProgressScreen({ navigation }) {
  const { history, mockHistory, favoritePrompts, readingHistory, listeningHistory, grammarHistory } = useAppState();
  const count = history.length;
  const latestMock = mockHistory[0]?.result;

  const avgReading = readingHistory.length
    ? Math.round(readingHistory.reduce((a, r) => a + (r.result.score / r.result.total) * 100, 0) / readingHistory.length)
    : null;
  const avgListening = listeningHistory.length
    ? Math.round(listeningHistory.reduce((a, r) => a + (r.result.score / r.result.total) * 100, 0) / listeningHistory.length)
    : null;
  const avgGrammar = grammarHistory.length
    ? Math.round(grammarHistory.reduce((a, r) => a + (r.result.score / r.result.total) * 100, 0) / grammarHistory.length)
    : null;

  const weakest = [
    { name: 'Reading', val: avgReading },
    { name: 'Listening', val: avgListening },
    { name: 'Grammar', val: avgGrammar }
  ].filter((x) => x.val !== null).sort((a, b) => a.val - b.val).slice(0, 2);

  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    const countByDay = {};
    [...history, ...mockHistory, ...readingHistory, ...listeningHistory, ...grammarHistory].forEach((item) => {
      const day = (item.createdAt || '').slice(0, 10);
      if (!day) return;
      countByDay[day] = (countByDay[day] || 0) + 1;
    });
    const values = days.map((d) => countByDay[d] || 0);
    const max = Math.max(1, ...values);
    return { days, values, max };
  }, [history, mockHistory, readingHistory, listeningHistory, grammarHistory]);

  const streak = useMemo(() => {
    const activeDays = new Set(
      [...history, ...mockHistory, ...readingHistory, ...listeningHistory, ...grammarHistory]
        .map((x) => (x.createdAt || '').slice(0, 10))
        .filter(Boolean)
    );
    let s = 0;
    while (true) {
      const d = new Date();
      d.setDate(d.getDate() - s);
      const key = d.toISOString().slice(0, 10);
      if (!activeDays.has(key)) break;
      s += 1;
    }
    return s;
  }, [history, mockHistory, readingHistory, listeningHistory, grammarHistory]);

  const progressModules = [
    { key: 'reading', name: 'Reading', val: avgReading, attempts: readingHistory.length, nav: 'ReadingHistory' },
    { key: 'listening', name: 'Listening', val: avgListening, attempts: listeningHistory.length, nav: 'ListeningHistory' },
    { key: 'grammar', name: 'Grammar', val: avgGrammar, attempts: grammarHistory.length, nav: 'GrammarHistory' },
  ];

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Your Progress</Text>

      {/* Gamification Dashboard */}
      <View style={styles.dashboardRow}>
        <Card style={[styles.dashboardCard, { backgroundColor: colors.accent }]} glow>
          <Text style={styles.dashLabel}>Streak</Text>
          <Text style={styles.dashValue}>{streak} 🔥</Text>
          <Text style={styles.dashSub}>Days active</Text>
        </Card>
        <Card style={[styles.dashboardCard, { backgroundColor: colors.primary }]} glow>
          <Text style={styles.dashLabel}>Writing</Text>
          <Text style={styles.dashValue}>{count} 📝</Text>
          <Text style={styles.dashSub}>Essays sent</Text>
        </Card>
      </View>

      <Card style={styles.card}>
        <Text style={styles.h3}>Activity This Week</Text>
        <View style={styles.chartRow}>
          {weekly.values.map((v, i) => {
            const heightPct = Math.max(10, Math.round((v / weekly.max) * 100));
            const isToday = i === 6;
            return (
              <View key={weekly.days[i]} style={styles.chartItem}>
                <View style={[styles.barContainer]}>
                  <View style={[styles.bar, { height: `${heightPct}%`, backgroundColor: isToday ? colors.primary : colors.secondary }]} />
                </View>
                <Text style={[styles.barLabel, isToday && styles.barLabelActive]}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(weekly.days[i]).getDay()]}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Precision Analytics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {progressModules.map((m) => (
          <Card key={m.key} style={styles.miniCard}>
            <Text style={styles.miniCardTitle}>{m.name}</Text>
            <Text style={styles.miniCardValue}>{m.val !== null ? `${m.val}%` : '--'}</Text>
            <Text style={styles.miniCardSub}>{m.attempts} attempts</Text>
            <Button
              label="History"
              variant="ghost"
              style={styles.miniBtn}
              textStyle={styles.miniBtnText}
              onPress={() => navigation.navigate(m.nav)}
            />
          </Card>
        ))}
        <Card style={styles.miniCard}>
          <Text style={styles.miniCardTitle}>Mock Exams</Text>
          <Text style={styles.miniCardValue}>{latestMock ? latestMock.overall : '--'}</Text>
          <Text style={styles.miniCardSub}>Last Score</Text>
          <Button
            label="History"
            variant="ghost"
            style={styles.miniBtn}
            textStyle={styles.miniBtnText}
            onPress={() => navigation.navigate('MockHistory')}
          />
        </Card>
      </ScrollView>

      {weakest.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Focus Areas</Text>
          <Text style={styles.body}>We recommend extra practice here based on your recent performance:</Text>
          <View style={styles.weakBadgeRow}>
            {weakest.map((w) => (
              <View key={w.name} style={styles.weakBadge}>
                <Text style={styles.weakBadgeText}>{w.name} ({w.val}%)</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <Text style={[styles.sectionTitle, styles.sectionTitleTight]}>Tools & Resources</Text>

      <Card style={styles.actionCard}>
        <View style={styles.actionInfo}>
          <Text style={styles.h3}>Drafts & Favorites</Text>
          <Text style={styles.body}>{favoritePrompts.length} prompts saved</Text>
        </View>
        <View style={styles.col}>
          <Button label="Favorites" variant="secondary" style={styles.halfBtn} onPress={() => navigation.navigate('Favorites')} />
          <Button label="Drafts" variant="secondary" style={styles.halfBtn} onPress={() => navigation.navigate('Drafts')} />
        </View>
      </Card>

      <Card style={styles.actionCard}>
        <View style={styles.actionInfo}>
          <Text style={styles.h3}>Analytics Panel</Text>
          <Text style={styles.body}>Deep dive data</Text>
        </View>
        <Button label="Open" variant="ghost" onPress={() => navigation.navigate('Analytics')} />
      </Card>

      <Card style={styles.actionCard}>
        <View style={styles.actionInfo}>
          <Text style={styles.h3}>Error Tracker</Text>
          <Text style={styles.body}>Mistakes review</Text>
        </View>
        <Button label="Open" variant="ghost" onPress={() => navigation.navigate('ErrorStats')} />
      </Card>

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitleTight: {
    marginTop: spacing.md,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: typography.small,
    fontFamily: typography.fontBody,
    color: colors.muted,
    marginBottom: spacing.md
  },
  card: {
    marginBottom: spacing.lg
  },

  // Dashboard Metrics
  dashboardRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dashboardCard: {
    flex: 1,
    padding: spacing.xl,
    borderWidth: 0,
    marginBottom: 0,
  },
  dashLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  dashValue: {
    color: '#fff',
    fontSize: 36,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    marginVertical: spacing.sm,
  },
  dashSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.xsmall,
  },

  // Chart styling (Apple health style)
  chartRow: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden'
  },
  bar: {
    width: '100%',
    borderRadius: radius.pill
  },
  barLabel: {
    marginTop: spacing.sm,
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    fontWeight: '600'
  },
  barLabelActive: {
    color: colors.primaryDark,
    fontWeight: '800'
  },

  // Horizontal Mini Cards
  horizontalScroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingRight: spacing.xl, // End padding
  },
  miniCard: {
    width: 140,
    marginBottom: 0,
  },
  miniCardTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  miniCardValue: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  miniCardSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  miniBtn: {
    height: 32,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  miniBtnText: {
    fontSize: 12,
  },

  // Focus Area Badges
  weakBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  weakBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  weakBadgeText: {
    color: colors.error,
    fontSize: typography.small,
    fontWeight: '600',
  },

  // Action Cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  col: {
    gap: spacing.sm,
  },
  halfBtn: {
    height: 36,
    minWidth: 100,
  }
});
