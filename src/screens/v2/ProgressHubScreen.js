import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Button from '../../components/Button';
import CampusHero from '../../components/v2/CampusHero';
import Page from '../../components/v2/Page';
import ReadinessRing from '../../components/v2/ReadinessRing';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useAppState } from '../../context/AppState';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Assets } from '../../config/bueptAssets';
import { getV2Theme, v2Spacing, v2Typography } from '../../theme/v2';
import { averageHistory, computeReadiness, latestHistoryPercent } from '../../utils/v2Metrics';

export default function ProgressHubScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const { readingHistory, listeningHistory, grammarHistory, history, mockHistory, streakDays, xp, badges } = useAppState();

  const stats = useMemo(() => {
    const reading = averageHistory(readingHistory);
    const listening = averageHistory(listeningHistory);
    const grammar = averageHistory(grammarHistory);
    const writing = averageHistory(history);
    const mock = latestHistoryPercent(mockHistory);
    return {
      reading, listening, grammar, writing, mock,
      readiness: computeReadiness({ reading, listening, grammar, writing, mock }),
    };
  }, [grammarHistory, history, listeningHistory, mockHistory, readingHistory]);

  const skills = [
    ['Reading', stats.reading],
    ['Listening', stats.listening],
    ['Writing', stats.writing],
    ['Grammar', stats.grammar],
  ];

  return (
    <Page>
      <CampusHero asset={assets.editorial.progress} eyebrow="PROGRESS" title="See the pattern, then act on it." body="Progress is useful only when it changes the next practice decision." compact />

      <View style={[styles.topGrid, compact && styles.stack]}>
        <SurfaceCard style={styles.readinessCard}>
          <ReadinessRing value={stats.readiness} />
          <View style={styles.copy}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>BUEPT READINESS</Text>
            <Text style={[styles.title, { color: theme.text }]}>{stats.readiness || 'No baseline'}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>Weighted across recent skill work and your latest mock.</Text>
          </View>
        </SurfaceCard>
        <SurfaceCard style={styles.momentumCard}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>MOMENTUM</Text>
          <View style={styles.metrics}>
            <View><Text style={[styles.metric, { color: theme.text }]}>{streakDays || 0}</Text><Text style={[styles.caption, { color: theme.muted }]}>day streak</Text></View>
            <View><Text style={[styles.metric, { color: theme.text }]}>{xp || 0}</Text><Text style={[styles.caption, { color: theme.muted }]}>XP</Text></View>
            <View><Text style={[styles.metric, { color: theme.text }]}>{Array.isArray(badges) ? badges.length : 0}</Text><Text style={[styles.caption, { color: theme.muted }]}>badges</Text></View>
          </View>
        </SurfaceCard>
      </View>

      <View style={[styles.twoCol, compact && styles.stack]}>
        <SurfaceCard style={styles.flex}>
          <Text style={[styles.title, { color: theme.text }]}>Skill mastery</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Recent average / 100</Text>
          <View style={styles.skillList}>
            {skills.map(([label, score]) => (
              <View key={label} style={styles.skillRow}>
                <Text style={[styles.skillName, { color: theme.text }]}>{label}</Text>
                <View style={[styles.track, { backgroundColor: theme.primarySoft }]}>
                  <View style={[styles.fill, { width: `${Math.max(3, score || 0)}%`, backgroundColor: theme.interactive }]} />
                </View>
                <Text style={[styles.skillScore, { color: theme.muted }]}>{score == null ? '—' : score}</Text>
              </View>
            ))}
          </View>
          <Button label="Detailed analytics" variant="ghost" onPress={() => navigation.navigate('Analytics')} />
        </SurfaceCard>

        <SurfaceCard style={styles.flex}>
          <Text style={[styles.title, { color: theme.text }]}>Mock signal</Text>
          <Text style={[styles.mockScore, { color: theme.text }]}>{stats.mock == null ? 'No mock yet' : `${stats.mock}/100`}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Pair the mock score with skill practice instead of treating it as a standalone grade.</Text>
          <View style={styles.actions}>
            <Button label="Mock history" variant="secondary" onPress={() => navigation.navigate('MockHistory')} />
            <Button label="Error tracker" variant="secondary" onPress={() => navigation.navigate('ErrorStats')} />
          </View>
        </SurfaceCard>
      </View>

      <SurfaceCard style={styles.tools}>
        <Text style={[styles.title, { color: theme.text }]}>Your learning record</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Deep views stay one level below the main dashboard.</Text>
        <View style={styles.actions}>
          <Button label="Reading history" variant="ghost" onPress={() => navigation.navigate('ReadingHistory')} />
          <Button label="Listening history" variant="ghost" onPress={() => navigation.navigate('ListeningHistory')} />
          <Button label="Grammar history" variant="ghost" onPress={() => navigation.navigate('GrammarHistory')} />
          <Button label="Writing history" variant="ghost" onPress={() => navigation.navigate('History')} />
          <Button label="Badge case" variant="ghost" onPress={() => navigation.navigate('BadgeCase')} />
          <Button label="XP timeline" variant="ghost" onPress={() => navigation.navigate('XPTimeline')} />
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  topGrid: { flexDirection: 'row', gap: v2Spacing.lg, marginBottom: v2Spacing.lg },
  twoCol: { flexDirection: 'row', gap: v2Spacing.lg },
  stack: { flexDirection: 'column' },
  readinessCard: { flex: 1.4, flexDirection: 'row', alignItems: 'center', gap: v2Spacing.lg },
  momentumCard: { flex: 0.8 },
  copy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: v2Typography.h2, fontWeight: '900', marginBottom: 5 },
  body: { fontSize: v2Typography.small, lineHeight: 21 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', gap: v2Spacing.md, marginTop: v2Spacing.lg },
  metric: { fontSize: 30, fontWeight: '900' },
  caption: { fontSize: 12, fontWeight: '700' },
  flex: { flex: 1 },
  skillList: { marginVertical: v2Spacing.lg },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm, marginVertical: 9 },
  skillName: { width: 76, fontSize: 13, fontWeight: '800' },
  track: { flex: 1, height: 9, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  skillScore: { width: 26, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  mockScore: { fontSize: 36, fontWeight: '900', marginVertical: v2Spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm, marginTop: v2Spacing.lg },
  tools: { marginTop: v2Spacing.lg },
});
