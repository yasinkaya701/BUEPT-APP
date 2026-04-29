/**
 * GenericHistoryScreen.js
 * A single reusable screen replacing 5 identical history screens:
 * ReadingHistoryScreen, ListeningHistoryScreen, GrammarHistoryScreen,
 * MockHistoryScreen, HistoryScreen (Writing)
 *
 * Usage (in RootNavigator.js):
 *   <Stack.Screen name="ReadingHistory" component={GenericHistoryScreen}
 *     initialParams={{ type: 'reading' }} />
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';

const HISTORY_CONFIG = {
  reading: {
    title: 'Reading History',
    icon: 'book-outline',
    color: '#3B82F6',
    getHistory: (state) => state.readingHistory || [],
    renderItem: (item) => ({
      label: 'Reading',
      date: item.createdAt,
      score: `${item.result?.score ?? item?.score ?? 0} / ${item.result?.total ?? item?.total ?? 10}`,
      pct: item.result?.total ? Math.round((item.result.score / item.result.total) * 100) : null,
    }),
  },
  listening: {
    title: 'Listening History',
    icon: 'headset-outline',
    color: '#8B5CF6',
    getHistory: (state) => state.listeningHistory || [],
    renderItem: (item) => ({
      label: 'Listening',
      date: item.createdAt,
      score: `${item.result?.score ?? 0} / ${item.result?.total ?? 10}`,
      pct: item.result?.total ? Math.round((item.result.score / item.result.total) * 100) : null,
    }),
  },
  grammar: {
    title: 'Grammar History',
    icon: 'school-outline',
    color: '#10B981',
    getHistory: (state) => state.grammarHistory || [],
    renderItem: (item) => ({
      label: 'Grammar',
      date: item.createdAt,
      score: `${item.result?.score ?? 0} / ${item.result?.total ?? 10}`,
      pct: item.result?.total ? Math.round((item.result.score / item.result.total) * 100) : null,
    }),
  },
  mock: {
    title: 'Mock Exam History',
    icon: 'clipboard-outline',
    color: '#F59E0B',
    getHistory: (state) => state.mockHistory || [],
    renderItem: (item) => ({
      label: 'Mock Exam',
      date: item.createdAt,
      score: `${item.result?.overall ?? 0}/100`,
      pct: item.result?.overall ?? null,
      detail: `Listening ${item.result?.listening ?? '—'} · Reading ${item.result?.reading ?? '—'} · Writing ${item.result?.writing ?? '—'}`,
    }),
    onPress: (item, navigation) => navigation.navigate('MockResult', { result: item.result }),
  },
  writing: {
    title: 'Writing History',
    icon: 'create-outline',
    color: '#EF4444',
    getHistory: (state) => state.history || [],
    renderItem: (item) => ({
      label: 'Writing',
      date: item.createdAt,
      score: `${item.report?.rubric?.Total ?? '—'}/20`,
      pct: item.report?.rubric?.Total ? Math.round((item.report.rubric.Total / 20) * 100) : null,
      detail: item.prompt ? `"${String(item.prompt).slice(0, 60)}..."` : null,
    }),
  },
};

function ScoreBadge({ pct, color }) {
  if (pct == null) return null;
  const bg = pct >= 80 ? '#D1FAE5' : pct >= 60 ? '#FEF3C7' : '#FEE2E2';
  const fg = pct >= 80 ? '#065F46' : pct >= 60 ? '#92400E' : '#991B1B';
  return (
    <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
      <Text style={[styles.scoreBadgeText, { color: fg }]}>{pct}%</Text>
    </View>
  );
}

function BarChart({ values = [], max = 1, color }) {
  if (!values.length) return null;
  return (
    <View style={styles.chartRow}>
      {values.map((v, i) => (
        <View key={i} style={styles.chartCol}>
          <View style={[styles.chartBar, { height: Math.max(4, (v / max) * 48), backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

export default function GenericHistoryScreen({ navigation, route }) {
  const type = route?.params?.type || 'reading';
  const config = HISTORY_CONFIG[type] || HISTORY_CONFIG.reading;
  const state = useAppState();
  const rawHistory = config.getHistory(state);

  const items = useMemo(() => {
    return [...rawHistory]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .map((item) => ({ raw: item, rendered: config.renderItem(item) }));
  }, [rawHistory]);

  // Build simple bar chart data from last 7 sessions
  const chartValues = useMemo(() => {
    return items.slice(0, 7).reverse().map((i) => i.rendered.pct ?? 0);
  }, [items]);
  const chartMax = Math.max(1, ...chartValues);

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={24} color={config.color} />
        </View>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.count}>{items.length} session{items.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Trend Chart */}
      {chartValues.length > 1 && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartLabel}>Last {chartValues.length} Sessions</Text>
          <BarChart values={chartValues} max={chartMax} color={config.color} />
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>Oldest</Text>
            <Text style={styles.chartFooterText}>Recent</Text>
          </View>
        </Card>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name={config.icon} size={48} color={colors.muted} />
          <Text style={styles.emptyText}>No sessions yet. Complete a {type} exercise to start tracking.</Text>
        </View>
      )}

      {/* History Items */}
      {items.map(({ raw, rendered }, idx) => (
        <TouchableOpacity
          key={raw.id || idx}
          activeOpacity={config.onPress ? 0.8 : 1}
          onPress={config.onPress ? () => config.onPress(raw, navigation) : undefined}
        >
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardLabel}>{rendered.label}</Text>
                <Text style={styles.cardDate}>
                  {rendered.date ? new Date(rendered.date).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  }) : 'Unknown date'}
                </Text>
                {rendered.detail && (
                  <Text style={styles.cardDetail} numberOfLines={1}>{rendered.detail}</Text>
                )}
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.cardScore, { color: config.color }]}>{rendered.score}</Text>
                <ScoreBadge pct={rendered.pct} color={config.color} />
              </View>
            </View>
            {config.onPress && (
              <View style={styles.cardFooter}>
                <Text style={[styles.viewDetail, { color: config.color }]}>View Details →</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h2 || 22,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: 4,
  },
  count: {
    fontSize: typography.small || 12,
    color: colors.muted,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  chartLabel: {
    fontSize: typography.small || 12,
    color: colors.muted,
    marginBottom: spacing.sm,
    fontFamily: typography.fontBody,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 56,
    gap: 6,
  },
  chartCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBar: {
    borderRadius: radius.sm || 4,
    minHeight: 4,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chartFooterText: {
    fontSize: 10,
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl || 48,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.body || 14,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
    fontFamily: typography.fontBody,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  cardLabel: {
    fontSize: typography.caption || 11,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: typography.body || 14,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  cardDetail: {
    fontSize: typography.small || 12,
    color: colors.muted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardScore: {
    fontSize: typography.h3 || 18,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill || 12,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border || 'rgba(0,0,0,0.06)',
  },
  viewDetail: {
    fontSize: typography.small || 12,
    fontFamily: typography.fontHeadline,
  },
});
