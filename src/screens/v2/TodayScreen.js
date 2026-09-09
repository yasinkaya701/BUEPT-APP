import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import CampusHero from '../../components/v2/CampusHero';
import Page from '../../components/v2/Page';
import ReadinessRing from '../../components/v2/ReadinessRing';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useAppState } from '../../context/AppState';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Assets } from '../../config/bueptAssets';
import { getV2Theme, v2Radius, v2Spacing, v2Typography } from '../../theme/v2';
import { averageHistory, computeReadiness, latestHistoryPercent, readinessLabel, weakestSkill } from '../../utils/v2Metrics';

const ROUTES = {
  reading: 'Reading',
  listening: 'Listening',
  grammar: 'Grammar',
  writing: 'Writing',
};

function TaskRow({ icon, title, meta, onPress, theme }) {
  return (
    <SurfaceCard onPress={onPress} style={styles.task}>
      <View style={[styles.taskIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.taskCopy}>
        <Text style={[styles.taskTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.taskMeta, { color: theme.muted }]}>{meta}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={theme.interactive} />
    </SurfaceCard>
  );
}

export default function TodayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const {
    userProfile,
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    history,
    mockHistory,
    streakDays,
    xp,
  } = useAppState();

  const metrics = useMemo(() => {
    const reading = averageHistory(readingHistory);
    const listening = averageHistory(listeningHistory);
    const grammar = averageHistory(grammarHistory);
    const writing = averageHistory(history);
    const mock = latestHistoryPercent(mockHistory);
    const readiness = computeReadiness({ reading, listening, grammar, writing, mock });
    const weakest = weakestSkill([
      { key: 'reading', label: 'Reading', score: reading },
      { key: 'listening', label: 'Listening', score: listening },
      { key: 'grammar', label: 'Grammar', score: grammar },
      { key: 'writing', label: 'Writing', score: writing },
    ]);
    return { reading, listening, grammar, writing, mock, readiness, weakest };
  }, [grammarHistory, history, listeningHistory, mockHistory, readingHistory]);

  const firstName = String(userProfile?.name || '').trim().split(/\s+/)[0] || 'Student';
  const weakest = metrics.weakest;

  return (
    <Page>
      <CampusHero
        asset={assets.editorial.today}
        eyebrow="TODAY"
        title={`Good to see you, ${firstName}.`}
        body="One clear next step is more useful than twenty shortcuts. Your plan is built around recent performance."
      >
        <Button label="Start today's plan" onPress={() => navigation.navigate(weakest ? ROUTES[weakest.key] : 'StudyPlan')} />
        <Button label="Full study plan" variant="secondary" onPress={() => navigation.navigate('StudyPlan')} />
      </CampusHero>

      <View style={[styles.heroGrid, compact && styles.stack]}>
        <SurfaceCard style={styles.readinessCard}>
          <View style={styles.readinessRow}>
            <ReadinessRing value={metrics.readiness} />
            <View style={styles.readinessCopy}>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>BUEPT READINESS</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{readinessLabel(metrics.readiness)}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>
                {metrics.readiness > 0
                  ? 'Built from your recent practice and mock results.'
                  : 'Complete a first practice set to establish your baseline.'}
              </Text>
              <View style={[styles.levelPill, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.levelText, { color: theme.primaryDark }]}>{level || 'P2'} track</Text>
              </View>
            </View>
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.snapshotCard}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>MOMENTUM</Text>
          <View style={styles.snapshotRow}>
            <View>
              <Text style={[styles.bigNumber, { color: theme.text }]}>{streakDays || 0}</Text>
              <Text style={[styles.caption, { color: theme.muted }]}>day streak</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View>
              <Text style={[styles.bigNumber, { color: theme.text }]}>{xp || 0}</Text>
              <Text style={[styles.caption, { color: theme.muted }]}>XP earned</Text>
            </View>
          </View>
          <Button label="See progress" variant="ghost" onPress={() => navigation.navigate('ProgressHub')} />
        </SurfaceCard>
      </View>

      <View style={styles.sectionHead}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's plan</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Three focused actions. Nothing else competes for attention.</Text>
        </View>
      </View>

      <View style={styles.taskList}>
        <TaskRow
          theme={theme}
          icon={weakest?.key === 'listening' ? 'headset-outline' : weakest?.key === 'writing' ? 'create-outline' : weakest?.key === 'grammar' ? 'git-branch-outline' : 'book-outline'}
          title={weakest ? `${weakest.label} focus` : 'Diagnostic practice'}
          meta={weakest ? `Recent average: ${weakest.score}% · 20–30 min` : 'Build your first measurable skill baseline'}
          onPress={() => navigation.navigate(weakest ? ROUTES[weakest.key] : 'PlacementTest')}
        />
        <TaskRow theme={theme} icon="refresh-outline" title="Review recent mistakes" meta="SRS review · 10–15 min" onPress={() => navigation.navigate('Review')} />
        <TaskRow theme={theme} icon="create-outline" title="One writing task" meta="Plan, write, evaluate · 25–35 min" onPress={() => navigation.navigate('WritingEditor')} />
      </View>

      <View style={[styles.twoCol, compact && styles.stack]}>
        <SurfaceCard style={styles.flexCard}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>SKILL SNAPSHOT</Text>
          {[
            ['Reading', metrics.reading],
            ['Listening', metrics.listening],
            ['Grammar', metrics.grammar],
            ['Writing', metrics.writing],
          ].map(([label, value]) => (
            <View key={label} style={styles.skillRow}>
              <Text style={[styles.skillLabel, { color: theme.text }]}>{label}</Text>
              <View style={[styles.barTrack, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.barFill, { width: `${Math.max(4, value || 0)}%`, backgroundColor: theme.interactive }]} />
              </View>
              <Text style={[styles.skillValue, { color: theme.muted }]}>{value == null ? '—' : value}</Text>
            </View>
          ))}
          <Button label="Open practice hub" variant="ghost" onPress={() => navigation.navigate('Practice')} />
        </SurfaceCard>

        <SurfaceCard style={styles.flexCard}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>LAST MOCK</Text>
          <Text style={[styles.mockValue, { color: theme.text }]}>{metrics.mock == null ? 'No attempt yet' : `${metrics.mock} / 100`}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>
            {metrics.mock == null ? 'Use a full mock when you want a realistic baseline.' : 'Use the result to decide what deserves the next focused session.'}
          </Text>
          <View style={styles.actionRow}>
            <Button label={metrics.mock == null ? 'Start a mock' : 'Mock hub'} onPress={() => navigation.navigate('MockHub')} />
            {metrics.mock != null ? <Button label="History" variant="secondary" onPress={() => navigation.navigate('MockHistory')} /> : null}
          </View>
        </SurfaceCard>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  heroGrid: { flexDirection: 'row', gap: v2Spacing.lg, marginBottom: v2Spacing.xl },
  twoCol: { flexDirection: 'row', gap: v2Spacing.lg, marginTop: v2Spacing.xl },
  stack: { flexDirection: 'column' },
  readinessCard: { flex: 1.45 },
  snapshotCard: { flex: 0.75, justifyContent: 'space-between' },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.lg },
  readinessCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  cardTitle: { fontSize: v2Typography.h2, fontWeight: '900', marginBottom: 6 },
  body: { fontSize: v2Typography.small, lineHeight: 21 },
  levelPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: v2Radius.pill, marginTop: v2Spacing.md },
  levelText: { fontSize: 12, fontWeight: '800' },
  snapshotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: v2Spacing.lg },
  bigNumber: { fontSize: 34, fontWeight: '900' },
  caption: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  divider: { width: 1, height: 52 },
  sectionHead: { marginTop: v2Spacing.sm, marginBottom: v2Spacing.md },
  sectionTitle: { fontSize: v2Typography.h2, fontWeight: '900', letterSpacing: -0.5 },
  taskList: { gap: v2Spacing.sm },
  task: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.md, paddingVertical: v2Spacing.md },
  taskIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '800' },
  taskMeta: { fontSize: 13, marginTop: 3 },
  flexCard: { flex: 1 },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm, marginVertical: 8 },
  skillLabel: { width: 74, fontSize: 13, fontWeight: '700' },
  barTrack: { flex: 1, height: 8, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  skillValue: { width: 26, textAlign: 'right', fontSize: 12, fontWeight: '800' },
  mockValue: { fontSize: 30, fontWeight: '900', marginVertical: v2Spacing.sm },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm, marginTop: v2Spacing.lg },
});
