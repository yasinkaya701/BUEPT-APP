import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Button from '../../components/Button';
import CampusHero from '../../components/v2/CampusHero';
import Page from '../../components/v2/Page';
import SkillCard from '../../components/v2/SkillCard';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useAppState } from '../../context/AppState';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Assets } from '../../config/bueptAssets';
import { getV2Theme, v2Spacing, v2Typography } from '../../theme/v2';
import { averageHistory } from '../../utils/v2Metrics';

export default function PracticeHubScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const { readingHistory, listeningHistory, grammarHistory, history, userWords } = useAppState();

  const skills = useMemo(() => [
    { key: 'reading', title: 'Reading', subtitle: 'Academic passages, inference and detail.', icon: 'book-outline', score: averageHistory(readingHistory), route: 'Reading', asset: assets.skills.reading },
    { key: 'listening', title: 'Listening', subtitle: 'Selective and careful listening practice.', icon: 'headset-outline', score: averageHistory(listeningHistory), route: 'Listening', asset: assets.skills.listening },
    { key: 'writing', title: 'Writing', subtitle: 'Plan, draft and revise with the BUEPT rubric.', icon: 'create-outline', score: averageHistory(history), route: 'Writing', asset: assets.skills.writing },
    { key: 'grammar', title: 'Grammar', subtitle: 'Accuracy patterns that repeatedly cost points.', icon: 'git-branch-outline', score: averageHistory(grammarHistory), route: 'Grammar', asset: assets.skills.grammar },
    { key: 'vocab', title: 'Vocabulary', subtitle: `${Array.isArray(userWords) ? userWords.length : 0} saved words · spaced review`, icon: 'library-outline', score: null, route: 'Vocab', asset: assets.skills.vocabulary },
  ], [assets, grammarHistory, history, listeningHistory, readingHistory, userWords]);

  const twoCol = width >= 760;

  return (
    <Page>
      <CampusHero
        asset={assets.campus.northCampus}
        eyebrow="PRACTICE"
        title="Build the skill that matters next."
        body="Every core skill now follows one clear practice architecture instead of a separate mini-product."
        compact
      />

      <View style={styles.heading}>
        <Text style={[styles.title, { color: theme.text }]}>Core skills</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Open a skill, continue where you left off, and see the same hierarchy every time.</Text>
      </View>

      <View style={styles.grid}>
        {skills.map((skill) => (
          <View key={skill.key} style={[styles.cell, twoCol && styles.cellWide]}>
            <SkillCard {...skill} onPress={() => navigation.navigate(skill.route)} />
          </View>
        ))}
      </View>

      <SurfaceCard style={styles.moreCard}>
        <Text style={[styles.title, { color: theme.text }]}>More practice</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Useful supporting tools stay available without competing with the five exam-prep pillars.</Text>
        <View style={styles.actions}>
          <Button label="Speaking practice" variant="secondary" onPress={() => navigation.navigate('Speaking')} />
          <Button label="Pronunciation" variant="secondary" onPress={() => navigation.navigate('ConfusingPronunciations')} />
          <Button label="Academic phrases" variant="secondary" onPress={() => navigation.navigate('AcademicPhraseStudio')} />
          <Button label="AI study coach" variant="ghost" onPress={() => navigation.navigate('Chatbot')} />
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: v2Spacing.lg },
  title: { fontSize: v2Typography.h2, fontWeight: '900', letterSpacing: -0.4 },
  body: { fontSize: v2Typography.small, lineHeight: 21, marginTop: 5, maxWidth: 720 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.lg },
  cell: { width: '100%' },
  cellWide: { width: '48%' },
  moreCard: { marginTop: v2Spacing.xl },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm, marginTop: v2Spacing.lg },
});
