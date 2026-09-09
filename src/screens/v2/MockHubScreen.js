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
import { getV2Theme, v2Spacing, v2Typography } from '../../theme/v2';
import { averageHistory, computeReadiness, latestHistoryPercent } from '../../utils/v2Metrics';

function LaunchCard({ icon, title, body, onPress, theme }) {
  return (
    <SurfaceCard onPress={onPress} style={styles.launchCard}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={23} color={theme.primary} />
      </View>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      <Text style={[styles.open, { color: theme.interactive }]}>Open →</Text>
    </SurfaceCard>
  );
}

export default function MockHubScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 800;
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const { readingHistory, listeningHistory, grammarHistory, history, mockHistory } = useAppState();

  const readiness = useMemo(() => computeReadiness({
    reading: averageHistory(readingHistory),
    listening: averageHistory(listeningHistory),
    grammar: averageHistory(grammarHistory),
    writing: averageHistory(history),
    mock: latestHistoryPercent(mockHistory),
  }), [grammarHistory, history, listeningHistory, mockHistory, readingHistory]);

  const lastMock = latestHistoryPercent(mockHistory);

  return (
    <Page>
      <CampusHero
        asset={assets.editorial.mock}
        eyebrow="MOCK EXAM"
        title="Practice the test, not the dashboard."
        body="When the exam begins, BUEPT-APP switches into a focused test environment with no marketing, streaks or unrelated tools."
        compact
      >
        <Button label="Start full mock" onPress={() => navigation.navigate('Exams')} />
        <Button label="View history" variant="secondary" onPress={() => navigation.navigate('MockHistory')} />
      </CampusHero>

      <View style={[styles.summary, compact && styles.stack]}>
        <SurfaceCard style={styles.readiness}>
          <ReadinessRing value={readiness} />
          <View style={styles.summaryCopy}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>CURRENT READINESS</Text>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>{readiness ? `${readiness}/100` : 'Build a baseline'}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>A guide for when a full simulation will be most informative.</Text>
          </View>
        </SurfaceCard>
        <SurfaceCard style={styles.last}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>LAST MOCK</Text>
          <Text style={[styles.lastScore, { color: theme.text }]}>{lastMock == null ? '—' : lastMock}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{lastMock == null ? 'No completed mock yet.' : 'Latest overall score.'}</Text>
        </SurfaceCard>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose the right simulation</Text>
      <View style={styles.grid}>
        <LaunchCard theme={theme} icon="document-text-outline" title="Full BUEPT mock" body="Open the real exam bank and complete a full timed simulation." onPress={() => navigation.navigate('Exams')} />
        <LaunchCard theme={theme} icon="flash-outline" title="Quick mock" body="A shorter practice run when you do not have time for the full exam." onPress={() => navigation.navigate('Mock')} />
        <LaunchCard theme={theme} icon="sparkles-outline" title="AI mock generator" body="Generate a new practice set when the built-in bank is no longer enough." onPress={() => navigation.navigate('AIMockGenerator')} />
        <LaunchCard theme={theme} icon="analytics-outline" title="Review mock history" body="Compare attempts and turn misses into the next practice plan." onPress={() => navigation.navigate('MockHistory')} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: v2Spacing.lg, marginBottom: v2Spacing.xl },
  stack: { flexDirection: 'column' },
  readiness: { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: v2Spacing.lg },
  last: { flex: 0.7, justifyContent: 'center' },
  summaryCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
  summaryTitle: { fontSize: v2Typography.h2, fontWeight: '900', marginBottom: 6 },
  lastScore: { fontSize: 46, fontWeight: '900', marginVertical: 4 },
  body: { fontSize: v2Typography.small, lineHeight: 21 },
  sectionTitle: { fontSize: v2Typography.h2, fontWeight: '900', marginBottom: v2Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.lg },
  launchCard: { width: '48%', minWidth: 240 },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: v2Spacing.md },
  cardTitle: { fontSize: v2Typography.h3, fontWeight: '900' },
  open: { fontSize: 13, fontWeight: '900', marginTop: v2Spacing.lg },
});
