import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { ScoreRing, ScoreBandChip, Sparkline, TimelineStep, TabPill, EmptyState } from '../components/ui';
import { useAppState } from '../context/AppState';

const SECTION_KEYS = ['listening-selective', 'listening-careful', 'reading-1', 'reading-2', 'writing'];

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
    marginBottom: spacing.xs,
  },
  cardSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
  timeline: {
    marginBottom: spacing.sm,
  },
  schemaNote: {
    fontSize: typography.xsmall,
    color: colors.muted,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  bouRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tabPill: {
    marginBottom: spacing.md,
  },
  sectionHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionIconTile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionMeta: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  sectionDuration: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
  },
  sectionDetail: {
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  buseptNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.tintBlue,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  buseptNoteText: {
    flex: 1,
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    lineHeight: 17,
  },
  levelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  levelCell: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  levelKey: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
  },
  levelSub: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: 2,
  },
  levelNote: {
    fontSize: typography.micro,
    color: colors.muted,
    lineHeight: 15,
  },
  trendWrap: {
    alignItems: 'center',
  },
  trendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
  },
  trendMetaLeft: {
    alignItems: 'flex-start',
  },
  trendBest: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    lineHeight: 26,
  },
  trendBestLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  trendChip: {
    backgroundColor: colors.surfaceAlt,
  },
  emptyState: {
    paddingVertical: spacing.md,
    marginBottom: 0,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recentMeta: {
    flex: 1,
  },
  recentScore: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    lineHeight: 26,
  },
  recentDate: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
  },
  recentTotal: {
    fontSize: typography.xsmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  recentLink: {
    padding: spacing.sm,
  },
  footerNote: {
    fontSize: typography.micro,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 15,
  },
});

const SECTIONS = {
  'listening-selective': {
    label: 'Selective Listening',
    icon: 'headset',
    duration: 'Short dialogues',
    detail: 'Choose the answer closest to the meaning of the short conversation. ~15 min.',
    buseptNote: 'BUSEPT Listening Bölüm 1 — kısa diyalogları dinleyip anlam seçme.',
  },
  'listening-careful': {
    label: 'Careful Listening',
    icon: 'mic',
    duration: 'Lectures & talks',
    detail: 'Answer detailed questions after longer audio texts. ~15 min.',
    buseptNote: 'BUSEPT Listening Bölüm 2 — dikkatli dinleme ve uzun konuşmalar.',
  },
  'reading-1': {
    label: 'Reading I',
    icon: 'book',
    duration: 'Timed passages',
    detail: 'Main ideas, vocabulary, and references across academic texts. ~20 min.',
    buseptNote: 'BUSEPT Reading Bölüm 1 — metin içi sorular ve ana fikir.',
  },
  'reading-2': {
    label: 'Reading II',
    icon: 'grid',
    duration: 'Matching',
    detail: 'Statement matching and inference across longer articles. ~20 min.',
    buseptNote: 'BUSEPT Reading Bölüm 2 — ifade eşleştirme.',
  },
  'writing': {
    label: 'Writing',
    icon: 'create',
    duration: 'Essay (2 tasks)',
    detail: 'Two timed essays: preference/argument + opinion, written from scratch. ~30 min.',
    buseptNote: 'BUSEPT Writing — iki ayrı yazım görevi, el yazısı veya klavye.',
  },
};

const LEVELS = [
  { key: 'P1', label: 'P1', sub: 'Starter', color: colors.success },
  { key: 'P2', label: 'P2', sub: 'Foundation', color: colors.primary },
  { key: 'P3', label: 'P3', sub: 'Intermediate', color: colors.accentBright },
  { key: 'P4', label: 'P4', sub: 'Advanced', color: colors.error },
];

const BUSEPT_EXAM = [
  { key: 'listening', label: 'Listening', duration: '30 min', icon: 'headset' },
  { key: 'reading', label: 'Reading', duration: '40 min', icon: 'book' },
  { key: 'writing', label: 'Writing', duration: '30 min', icon: 'create' },
];

export default function MockScreen({ navigation }) {
  const { mockHistory = [], aiAccessConfig, profileLevel } = useAppState();
  const [activeSection, setActiveSection] = useState('listening-selective');
  const [level, setLevel] = useState(profileLevel || 'P2');

  const section = SECTIONS[activeSection];

  const scoreSeries = useMemo(() => {
    const scores = mockHistory
      .map((r) => Number(r?.score || 0))
      .filter((s) => Number.isFinite(s))
      .reverse()
      .slice(-12);
    return scores;
  }, [mockHistory]);

  const bestScore = useMemo(() => {
    const scores = mockHistory.map((r) => Number(r?.score || 0)).filter((s) => Number.isFinite(s));
    return scores.length ? Math.max(...scores) : null;
  }, [mockHistory]);

  const recentAttempt = mockHistory[0] || null;
  const canAiMock = Boolean(aiAccessConfig?.allowAiMockGeneration || aiAccessConfig?.aiMockGeneration || aiAccessConfig?.allowAIMock);

  const openOfficialSim = () => navigation?.navigate('OfficialSim');
  const openAIMock = () => {
    if (!canAiMock) {
      Alert.alert('AI Mock Generator', 'Enable the AI Mock Generator in Developer settings first.');
    }
    navigation?.navigate('AIMockGenerator');
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Exam Hub</Text>
      <Text style={styles.headerSub}>Pick a BUSEPT section, choose your level, and launch a real-format mock.</Text>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Official BUSEPT Structure</Text>
        <TimelineStep steps={BUSEPT_EXAM} activeIndex={-1} style={styles.timeline} />
        <Text style={styles.schemaNote}>The real YADYOK exam: 30 min Listening → 40 min Reading → 30 min Writing, in one sitting.</Text>
        <View style={styles.bouRow}>
          <Button label="Official Simulation" variant="primary" onPress={openOfficialSim} />
          <Button label="AI Mock Generator" variant="secondary" onPress={openAIMock} />
        </View>
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Choose a section</Text>
        <TabPill
          activeKey={activeSection}
          onPress={setActiveSection}
          style={styles.tabPill}
          options={SECTION_KEYS.map((key) => ({ key, label: SECTIONS[key].label }))}
        />
        <View style={styles.sectionHero}>
          <View style={styles.sectionIconTile}>
            <Ionicons name={section.icon} size={26} color={colors.primary} />
          </View>
          <View style={styles.sectionMeta}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            <Text style={styles.sectionDuration}>{section.duration}</Text>
          </View>
        </View>
        <Text style={styles.sectionDetail}>{section.detail}</Text>
        <View style={styles.buseptNoteBox}>
          <Ionicons name="school-outline" size={15} color={colors.primary} />
          <Text style={styles.buseptNoteText}>{section.buseptNote}</Text>
        </View>
        <Button label={`Start ${section.label} Mock`} variant="primary" onPress={() => navigation?.navigate('ProficiencyMock', { section: activeSection, level })} />
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Difficulty level</Text>
        <Text style={styles.cardSub}>AI-generated mocks can be tuned between P1 (easiest) and P4 (hardest).</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((lv) => {
            const active = lv.key === level;
            return (
              <TouchableOpacity
                key={lv.key}
                activeOpacity={0.75}
                onPress={() => setLevel(lv.key)}
                style={[styles.levelCell, active && { borderColor: lv.color, backgroundColor: `${lv.color}14` }, !active && { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={[styles.levelKey, active ? { color: lv.color } : { color: colors.muted }]}>{lv.label}</Text>
                <Text style={styles.levelSub}>{lv.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.levelNote}>Selected level will be used by the AI Mock Generator and proficiency mocks.</Text>
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Mock score trend</Text>
        {scoreSeries.length === 0 ? (
          <EmptyState icon="stats-chart-outline" title="No mock scores yet" description="Complete your first mock and the trend line will appear here." accent="blue" style={styles.emptyState} />
        ) : (
          <View style={styles.trendWrap}>
            <View style={styles.trendMeta}>
              <View style={styles.trendMetaLeft}>
                <Text style={styles.trendBest}>{bestScore ?? '—'}</Text>
                <Text style={styles.trendBestLabel}>best score</Text>
              </View>
              <ScoreBandChip score={scoreSeries[scoreSeries.length - 1]} label={`${scoreSeries.length} mock${scoreSeries.length > 1 ? 's' : ''}`} style={styles.trendChip} />
            </View>
            <Sparkline data={scoreSeries} width={320} height={72} filled />
          </View>
        )}
      </Card>

      {recentAttempt ? (
        <Card style={[styles.card, shadow.elev1]}>
          <Text style={styles.cardTitle}>Last attempt</Text>
          <View style={styles.recentRow}>
            <ScoreRing value={Number(recentAttempt.score) || 0} size={68} stroke={7} />
            <View style={styles.recentMeta}>
              <Text style={styles.recentScore}>{Number(recentAttempt.score) || 0}%</Text>
              <Text style={styles.recentDate}>{new Date(recentAttempt.createdAt).toLocaleString()}</Text>
              {recentAttempt.total ? <Text style={styles.recentTotal}>{recentAttempt.score}/{recentAttempt.total} correct</Text> : null}
            </View>
            <TouchableOpacity activeOpacity={0.75} onPress={() => navigation?.navigate('MockHistory')} style={styles.recentLink}>
              <Ionicons name="analytics-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      ) : null}

      <Text style={styles.footerNote}>All mocks follow the official BUSEPT question types. Writing sections award partial scores for task completion.</Text>
    </Screen>
  );
}

