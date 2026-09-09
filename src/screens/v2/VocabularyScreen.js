import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import CampusHero from '../../components/v2/CampusHero';
import EmptyState from '../../components/v2/EmptyState';
import Page from '../../components/v2/Page';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useAppState } from '../../context/AppState';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Assets } from '../../config/bueptAssets';
import { getV2Theme, v2Spacing, v2Typography } from '../../theme/v2';

function ActionCard({ icon, title, body, onPress, theme }) {
  return (
    <SurfaceCard onPress={onPress} style={styles.actionCard}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={21} color={theme.primary} />
      </View>
      <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      <Text style={[styles.open, { color: theme.interactive }]}>Open →</Text>
    </SurfaceCard>
  );
}

export default function VocabularyScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const { userWords, unknownWords, vocabStats } = useAppState();

  const savedCount = Array.isArray(userWords) ? userWords.length : 0;
  const unknownCount = Array.isArray(unknownWords) ? unknownWords.length : 0;
  const reviewed = useMemo(() => {
    if (!vocabStats || typeof vocabStats !== 'object') return 0;
    return Object.values(vocabStats).filter((entry) => {
      if (typeof entry === 'number') return entry > 0;
      return Number(entry?.reviews || entry?.seen || entry?.count || 0) > 0;
    }).length;
  }, [vocabStats]);

  return (
    <Page>
      <CampusHero
        asset={assets.skills.vocabulary}
        eyebrow="VOCABULARY"
        title="Learn fewer words. Remember more of them."
        body="Vocabulary is now a focused overview. Review, flashcards and practice are primary; the legacy all-tools lab remains available one level deeper."
        compact
      >
        <Button label="Start review" onPress={() => navigation.navigate('Review')} />
        <Button label="Flashcards" variant="secondary" onPress={() => navigation.navigate('FlashcardHome')} />
      </CampusHero>

      <View style={[styles.stats, compact && styles.stack]}>
        {[
          ['Saved words', savedCount, 'bookmark-outline'],
          ['Unknown words', unknownCount, 'help-circle-outline'],
          ['Reviewed', reviewed, 'checkmark-circle-outline'],
        ].map(([label, value, icon]) => (
          <SurfaceCard key={label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name={icon} size={19} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
          </SurfaceCard>
        ))}
      </View>

      {savedCount === 0 ? (
        <EmptyState
          asset={assets.skills.vocabulary}
          title="No vocabulary saved yet"
          body="Save a word from Reading or Listening, or explore the vocabulary library to build your first review queue."
          actionLabel="Explore vocabulary"
          onAction={() => navigation.navigate('VocabLab')}
        />
      ) : null}

      <View style={styles.heading}>
        <Text style={[styles.title, { color: theme.text }]}>Practice modes</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Choose one task. The entire old vocabulary toolbox no longer competes on the first screen.</Text>
      </View>

      <View style={styles.grid}>
        <ActionCard theme={theme} icon="refresh-outline" title="Spaced review" body="Review words that are due rather than rereading the whole list." onPress={() => navigation.navigate('Review')} />
        <ActionCard theme={theme} icon="albums-outline" title="Flashcards" body="Use saved decks and focused recall sessions." onPress={() => navigation.navigate('FlashcardHome')} />
        <ActionCard theme={theme} icon="checkmark-done-outline" title="Vocabulary quiz" body="Test meaning and usage in a short session." onPress={() => navigation.navigate('VocabQuiz')} />
        <ActionCard theme={theme} icon="git-compare-outline" title="Collocations" body="Practice academic word partnerships in context." onPress={() => navigation.navigate('VocabCollocationQuiz')} />
        <ActionCard theme={theme} icon="swap-horizontal-outline" title="Synonyms" body="Build precise alternatives without memorizing random lists." onPress={() => navigation.navigate('VocabSynonymQuiz')} />
        <ActionCard theme={theme} icon="text-outline" title="Cloze practice" body="Recover vocabulary from sentence-level context." onPress={() => navigation.navigate('VocabClozeQuiz')} />
      </View>

      <SurfaceCard style={styles.lab}>
        <View style={styles.labCopy}>
          <Text style={[styles.title, { color: theme.text }]}>Advanced vocabulary lab</Text>
          <Text style={[styles.body, { color: theme.muted }]}>The existing large vocabulary workspace is preserved while its tools are migrated into smaller components. Open it only when you need the full library and specialist utilities.</Text>
        </View>
        <View style={styles.labActions}>
          <Button label="Open vocabulary lab" variant="secondary" onPress={() => navigation.navigate('VocabLab')} />
          <Button label="Photo capture" variant="ghost" onPress={() => navigation.navigate('PhotoVocabCapture')} />
          <Button label="Synonym finder" variant="ghost" onPress={() => navigation.navigate('SynonymFinder')} />
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: v2Spacing.md, marginBottom: v2Spacing.xl },
  stack: { flexDirection: 'column' },
  statCard: { flex: 1, minWidth: 160 },
  statIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: v2Spacing.md },
  statValue: { fontSize: 30, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  heading: { marginTop: v2Spacing.xl, marginBottom: v2Spacing.md },
  title: { fontSize: v2Typography.h2, fontWeight: '900', letterSpacing: -0.4 },
  body: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.md },
  actionCard: { width: '31%', minWidth: 220 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: v2Spacing.md },
  actionTitle: { fontSize: 16, fontWeight: '900' },
  open: { fontSize: 12, fontWeight: '900', marginTop: v2Spacing.md },
  lab: { marginTop: v2Spacing.xl, flexDirection: 'row', gap: v2Spacing.lg, alignItems: 'center', flexWrap: 'wrap' },
  labCopy: { flex: 1, minWidth: 260 },
  labActions: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm },
});
