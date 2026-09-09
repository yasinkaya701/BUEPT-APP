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
import { averageHistory } from '../../utils/v2Metrics';

const CONFIG = {
  Reading: {
    key: 'reading',
    title: 'Reading',
    eyebrow: 'CORE SKILL',
    icon: 'book-outline',
    tagline: 'Read for structure, inference and evidence.',
    body: 'Academic passages become easier when practice separates main ideas, implication, detail and vocabulary in context.',
    library: 'ReadingLibrary',
    history: 'ReadingHistory',
    primaryLabel: 'Open reading library',
    action: 'AdvancedReading',
    actionLabel: 'Advanced reading',
  },
  Listening: {
    key: 'listening',
    title: 'Listening',
    eyebrow: 'CORE SKILL',
    icon: 'headset-outline',
    tagline: 'Listen for the signal, not every word.',
    body: 'Selective and careful listening practice stays connected to note-taking, qualifiers and the details that change an answer.',
    library: 'ListeningLibrary',
    history: 'ListeningHistory',
    primaryLabel: 'Open listening library',
    action: 'LectureListeningLab',
    actionLabel: 'Listening lab',
  },
  Writing: {
    key: 'writing',
    title: 'Writing',
    eyebrow: 'CORE SKILL',
    icon: 'create-outline',
    tagline: 'Plan clearly. Write under pressure. Revise deliberately.',
    body: 'Use one writing workflow for task understanding, drafting, rubric feedback and targeted revision.',
    library: 'WritingLibrary',
    history: 'History',
    primaryLabel: 'Open writing practice',
    action: 'WritingEditor',
    actionLabel: 'Start a writing task',
  },
  Grammar: {
    key: 'grammar',
    title: 'Grammar',
    eyebrow: 'SUPPORT SKILL',
    icon: 'git-branch-outline',
    tagline: 'Fix the patterns that keep costing points.',
    body: 'Grammar remains a supporting practice layer for reading and writing accuracy rather than pretending to be a separate official BUSEPT section.',
    library: 'GrammarLibrary',
    history: 'GrammarHistory',
    primaryLabel: 'Open grammar library',
    action: 'GrammarDrill',
    actionLabel: 'Quick grammar drill',
  },
};

function getHistory(key, state) {
  if (key === 'reading') return state.readingHistory;
  if (key === 'listening') return state.listeningHistory;
  if (key === 'grammar') return state.grammarHistory;
  if (key === 'writing') return state.history;
  return [];
}

export default function SkillOverviewScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const compact = width < 800;
  const config = CONFIG[route?.name] || CONFIG.Reading;
  const appState = useAppState();
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const history = getHistory(config.key, appState);
  const score = averageHistory(history);
  const attempts = Array.isArray(history) ? history.length : 0;

  const trendLabel = useMemo(() => {
    if (!attempts) return 'No measured sessions yet';
    if (score >= 80) return 'Strong recent performance';
    if (score >= 65) return 'On track — keep consolidating';
    return 'A useful area to prioritize';
  }, [attempts, score]);

  return (
    <Page>
      <CampusHero
        asset={assets.skills[config.key]}
        eyebrow={config.eyebrow}
        title={config.tagline}
        body={config.body}
        compact
      >
        <Button label={config.primaryLabel} onPress={() => navigation.navigate(config.library)} />
        <Button label={config.actionLabel} variant="secondary" onPress={() => navigation.navigate(config.action)} />
      </CampusHero>

      <View style={[styles.summary, compact && styles.stack]}>
        <SurfaceCard style={styles.scoreCard}>
          <ReadinessRing value={score || 0} label={`${config.title} recent average`} />
          <View style={styles.scoreCopy}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>{config.title.toUpperCase()} SNAPSHOT</Text>
            <Text style={[styles.title, { color: theme.text }]}>{score == null ? 'Build a baseline' : `${score}/100`}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{trendLabel}</Text>
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.attemptCard}>
          <View style={[styles.bigIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name={config.icon} size={24} color={theme.primary} />
          </View>
          <Text style={[styles.bigNumber, { color: theme.text }]}>{attempts}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>recorded sessions</Text>
          <Button label="View history" variant="ghost" onPress={() => navigation.navigate(config.history)} />
        </SurfaceCard>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.title, { color: theme.text }]}>One consistent skill workflow</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Every core skill now enters through the same hierarchy instead of presenting a different dashboard grammar on every screen.</Text>
      </View>

      <View style={styles.steps}>
        {[
          ['locate-outline', '1. Choose the right practice', 'Use level, topic and recent weakness to pick a focused session.'],
          ['play-circle-outline', '2. Complete the task', 'Stay inside the task instead of bouncing through feature shortcuts.'],
          ['checkmark-circle-outline', '3. Review the result', 'See the score, mistakes and what the result actually means.'],
          ['arrow-forward-circle-outline', '4. Decide the next step', 'Resume, review mistakes or move to a mock only when it is useful.'],
        ].map(([icon, title, body]) => (
          <SurfaceCard key={title} style={styles.stepCard}>
            <View style={[styles.stepIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name={icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
          </SurfaceCard>
        ))}
      </View>

      <SurfaceCard style={styles.libraryCard}>
        <View style={styles.libraryCopy}>
          <Text style={[styles.title, { color: theme.text }]}>{config.title} library</Text>
          <Text style={[styles.body, { color: theme.muted }]}>The existing content bank and filters remain intact while the primary product surface is simplified.</Text>
        </View>
        <Button label={config.primaryLabel} onPress={() => navigation.navigate(config.library)} />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: v2Spacing.lg, marginBottom: v2Spacing.xl },
  stack: { flexDirection: 'column' },
  scoreCard: { flex: 1.35, flexDirection: 'row', alignItems: 'center', gap: v2Spacing.lg },
  scoreCopy: { flex: 1 },
  attemptCard: { flex: 0.65, justifyContent: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 6 },
  title: { fontSize: v2Typography.h2, fontWeight: '900', letterSpacing: -0.4 },
  body: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  bigIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: v2Spacing.md },
  bigNumber: { fontSize: 34, fontWeight: '900' },
  sectionHeading: { marginTop: v2Spacing.sm, marginBottom: v2Spacing.md, maxWidth: 760 },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.md },
  stepCard: { width: '48%', minWidth: 230 },
  stepIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: v2Spacing.md },
  stepTitle: { fontSize: 15, fontWeight: '900' },
  libraryCard: { marginTop: v2Spacing.xl, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: v2Spacing.lg },
  libraryCopy: { flex: 1, minWidth: 260 },
});
