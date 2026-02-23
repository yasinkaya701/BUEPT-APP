import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import readingTasks from '../../data/reading_tasks.json';
import listeningTasks from '../../data/listening_tasks.json';
import grammarTasks from '../../data/grammar_tasks.json';
import { buildAdaptivePlan } from '../utils/studyPlan';
import { triggerBootNotification } from '../utils/MockNotificationEngine';

// Extracted Sub-components
import HeroWidget from '../components/Home/HeroWidget';
import QuickActions from '../components/Home/QuickActions';
import LearningPaths from '../components/Home/LearningPaths';
import DailyTasks from '../components/Home/DailyTasks';
import FeatureGrid from '../components/Home/FeatureGrid';

export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { level, setLevel, academicFocus, history, mockHistory, reviews, screenTime, readingHistory, listeningHistory, grammarHistory } = useAppState();

  React.useEffect(() => {
    // Fire the mock notification 3 seconds after reaching home screen
    if (academicFocus) {
      triggerBootNotification(academicFocus);
    }
  }, [academicFocus]);

  // Stats
  const latestMock = mockHistory[0]?.result;
  const dueCount = reviews.filter((r) => r.nextReviewAt <= Date.now()).length;
  const minutes = Math.floor((screenTime?.seconds || 0) / 60);

  // Resume Trackers
  const lastReadingId = readingHistory[0]?.result?.taskId;
  const lastListeningId = listeningHistory[0]?.result?.taskId;
  const lastGrammarId = grammarHistory[0]?.result?.taskId;
  const lastReading = readingTasks.find((t) => t.id === lastReadingId);
  const lastListening = listeningTasks.find((t) => t.id === lastListeningId);
  const lastGrammar = grammarTasks.find((t) => t.id === lastGrammarId);

  // Adaptive Plan
  const adaptive = buildAdaptivePlan({
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    writingHistory: history
  });

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LogoMark size={48} label="B" />
        <View>
          <Text style={styles.h1}>Boğaziçi Prep</Text>
          <Text style={styles.sub}>{
            level === 'P1' ? 'P1 (A1) • Beginner' :
              level === 'P2' ? 'P2 (A2) • Pre-Int' :
                level === 'P3' ? 'P3 (B1) • Intermediate' :
                  level === 'P4' ? 'P4 (B2) • Upper-Int' : level
          } • {academicFocus}</Text>
        </View>
      </View>

      <HeroWidget adaptive={adaptive} navigation={navigation} />

      <QuickActions navigation={navigation} />

      <LearningPaths setLevel={setLevel} navigation={navigation} />

      <DailyTasks adaptive={adaptive} navigation={navigation} />

      {/* Resume Section (Only visible if active) */}
      {(lastReading || lastListening || lastGrammar) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Resume Progress</Text>
          {lastReading && (
            <View style={styles.resumeRow}>
              <Text style={styles.resumeText} numberOfLines={1}>📖 {lastReading.title}</Text>
              <Button label="Continue" variant="secondary" style={styles.resumeBtn} textStyle={{ fontSize: 12 }} onPress={() => navigation.navigate('ReadingDetail', { taskId: lastReading.id })} />
            </View>
          )}
          {lastListening && (
            <View style={styles.resumeRow}>
              <Text style={styles.resumeText} numberOfLines={1}>🎧 {lastListening.title}</Text>
              <Button label="Continue" variant="secondary" style={styles.resumeBtn} textStyle={{ fontSize: 12 }} onPress={() => navigation.navigate('ListeningDetail', { taskId: lastListening.id })} />
            </View>
          )}
          {lastGrammar && (
            <View style={styles.resumeRow}>
              <Text style={styles.resumeText} numberOfLines={1}>✍️ {lastGrammar.title}</Text>
              <Button label="Continue" variant="secondary" style={styles.resumeBtn} textStyle={{ fontSize: 12 }} onPress={() => navigation.navigate('GrammarDetail', { taskId: lastGrammar.id })} />
            </View>
          )}
        </Card>
      )}

      {/* Analytics Mini-Dashboard */}
      <View style={[styles.statsRow, isLandscape && styles.statsRowLandscape]}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{minutes}</Text>
          <Text style={styles.statLabel}>Min Today</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{dueCount}</Text>
          <Text style={styles.statLabel}>Vocab Due</Text>
          {dueCount > 0 && <View style={styles.statBadge} />}
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{latestMock ? latestMock.overall : '--'}</Text>
          <Text style={styles.statLabel}>Mock Score</Text>
        </Card>
      </View>

      <Text style={[styles.sectionTitle, { marginLeft: spacing.xs, marginBottom: spacing.md }]}>University Expansion</Text>
      <Card style={[styles.card, { backgroundColor: colors.accent, padding: spacing.lg, borderRadius: 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={[styles.h3, { color: '#fff', fontSize: 18, marginBottom: 4 }]} numberOfLines={1}>Academic Roadmap</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 }}>Preview upcoming modules and AI tools.</Text>
          </View>
          <Button label="Demos" variant="secondary" style={{ height: 40, paddingHorizontal: spacing.md, minWidth: 0 }} onPress={() => navigation.navigate('DemoFeatures')} />
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { marginLeft: spacing.xs, marginBottom: spacing.md, marginTop: spacing.sm }]}>Explore Content</Text>
      <FeatureGrid navigation={navigation} />

      <Text style={[styles.sectionTitle, { marginLeft: spacing.xs, marginBottom: spacing.md, marginTop: spacing.sm }]}>Boğaziçi Toolkit</Text>
      <Card style={styles.bouCard}>
        <Text style={styles.bouTitle}>Prep Control Center</Text>
        <Text style={styles.bouBody}>Calendar, mock, weak-point analysis, and official resources in one place.</Text>
        <View style={styles.bouRow}>
          <Button label="Boğaziçi Hub" onPress={() => navigation.navigate('BogaziciHub')} />
          <Button label="Academic Calendar" variant="secondary" onPress={() => navigation.navigate('ClassScheduleCalendar')} />
          <Button label="Proficiency Mock" variant="secondary" onPress={() => navigation.navigate('ProficiencyMock')} />
          <Button label="Weak Analysis" variant="secondary" onPress={() => navigation.navigate('WeakPointAnalysis')} />
        </View>
        <View style={styles.bouRow}>
          <Button label="Official Calendar" variant="ghost" onPress={() => navigation.navigate('WebViewer', { title: 'Boğaziçi Academic Calendar', url: 'https://www.boun.edu.tr/en_US/Content/Academic/Academic_Calendar' })} />
          <Button label="Announcements" variant="ghost" onPress={() => navigation.navigate('WebViewer', { title: 'Boğaziçi Announcements', url: 'https://www.boun.edu.tr/en_US/Content/Announcements' })} />
        </View>
      </Card>

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100, // Extra bottom padding for floating tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  sub: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark, // Colored subtitle for premium feel
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
    letterSpacing: -0.3,
  },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  resumeText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.text,
    paddingRight: spacing.md,
  },
  resumeBtn: {
    height: 36,
    minWidth: 80,
    paddingHorizontal: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statsRowLandscape: {
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: 0,
    position: 'relative'
  },
  statValue: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  bouCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  bouTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: '#1D4ED8',
    marginBottom: spacing.xs,
  },
  bouBody: {
    fontSize: typography.small,
    color: '#334155',
    marginBottom: spacing.sm,
  },
  bouRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
});
