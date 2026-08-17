import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { ScoreBandChip, TabPill, EmptyState } from '../components/ui';
import { useAppState } from '../context/AppState';

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
    lineHeight: 18,
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
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  levelChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  levelChipText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  metaText: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  tabPill: {
    marginBottom: spacing.md,
  },
  paraBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paraNum: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    color: colors.primary,
    lineHeight: 20,
  },
  paraText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  statementBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  correctBox: {
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  wrongBox: {
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  statementText: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  statementHint: {
    fontSize: typography.micro,
    color: colors.muted,
    marginBottom: spacing.xs,
    fontFamily: typography.fontHeadline,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  option: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  feedbackText: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  bouRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  scoreNote: {
    flex: 1,
    fontSize: typography.xsmall,
    color: colors.muted,
    lineHeight: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
}

const PASSAGES = [
  {
    id: 'pr-urban-heat',
    level: 'P2',
    title: 'Urban Heat Islands',
    paragraphs: [
      'Cities are consistently warmer than the surrounding countryside. This phenomenon, known as the urban heat island effect, happens because dense concentrations of buildings, roads, and pavements absorb and retain the sun\'s heat during the day.',
      'Another major factor is the reduction of green space. Trees and vegetation cool the air through evaporation, a process that is severely limited when concrete replaces soil and grass.',
      'Researchers have proposed several solutions, including reflective roof materials, urban forestry programs, and "cool pavement" technologies that reduce surface temperatures by reflecting rather than absorbing sunlight.',
      'Studies from Athens and Phoenix show that well-planned interventions can lower daytime surface temperatures by up to five degrees, which in turn reduces the energy demand for air conditioning.',
    ],
    statements: [
      { text: 'Urban areas tend to be hotter than nearby rural regions.', match: 0, type: 'Explicit' },
      { text: 'Vegetation helps regulate urban temperatures naturally.', match: 1, type: 'Explicit' },
      { text: 'Reflective building materials are among the proposed remedies.', match: 2, type: 'Explicit' },
      { text: 'Temperature reductions have been measured in specific cities.', match: 3, type: 'Explicit' },
      { text: 'Heat islands increase cooling costs for residents.', match: 3, type: 'Inference' },
      { text: 'The problem worsens at night when surfaces release stored heat.', match: -1, type: 'NG' },
    ],
    questionType: 'matching',
  },
  {
    id: 'pr-sleep-memory',
    level: 'P3',
    title: 'Sleep and Memory Consolidation',
    paragraphs: [
      'During sleep, the brain actively processes experiences from the day. Scientists now believe that this process, called memory consolidation, transfers information from short-term storage to more permanent neural networks.',
      'Slow-wave sleep appears especially critical for factual memory. Experiments that disrupted this stage found significant impairments in participants\' ability to recall newly learned vocabulary and dates.',
      'REM sleep, by contrast, seems to support emotional and procedural learning. Dream-rich sleep helps people integrate new skills, from playing an instrument to navigating complex social situations.',
      'The practical implication for students is clear: cramming all night before an exam undermines the very process that makes learning stick. Consistent sleep schedules outperform extended study marathons.',
    ],
    statements: [
      { text: 'The brain reorganizes daily experiences while we sleep.', match: 0, type: 'Explicit' },
      { text: 'Deep sleep stages are essential for remembering facts.', match: 1, type: 'Explicit' },
      { text: 'REM sleep contributes to learning physical and emotional skills.', match: 2, type: 'Explicit' },
      { text: 'Short, regular sleep is more beneficial than long study sessions.', match: 3, type: 'Explicit' },
      { text: 'Pulling an all-nighter weakens long-term retention.', match: 3, type: 'Inference' },
      { text: 'Teenagers need more sleep than adults to consolidate memory.', match: -1, type: 'NG' },
    ],
    questionType: 'matching',
  },
  {
    id: 'pr-language-attrition',
    level: 'P3',
    title: 'First Language Attrition',
    paragraphs: [
      'People who live abroad for many years sometimes notice that their native language feels less fluent. Linguists call this first language attrition, and it is far more common than most people assume.',
      'The strongest predictor is not time away but daily usage. Immigrants who speak their mother tongue every day retain far more fluency than those who use it only on special occasions.',
      'Interestingly, attrition affects less frequent vocabulary before basic grammar. Long-time emigrants may forget the word for a specific kitchen utensil while their core sentence structures remain untouched.',
      'Recent studies suggest the process is reversible. Intensive re-immersion courses have restored native-like fluency in adult learners within a single academic year.',
    ],
    statements: [
      { text: 'Long-term residents abroad may experience a decline in native fluency.', match: 0, type: 'Explicit' },
      { text: 'Daily use of the first language slows down attrition.', match: 1, type: 'Explicit' },
      { text: 'Rare words are lost before fundamental grammatical patterns.', match: 2, type: 'Explicit' },
      { text: 'Targeted training can rebuild lost fluency.', match: 3, type: 'Explicit' },
      { text: 'The decline is stronger in children than adults.', match: -1, type: 'NG' },
      { text: 'Losing vocabulary does not necessarily mean losing fluency.', match: 2, type: 'Inference' },
    ],
    questionType: 'matching',
  },
];

export default function PassageReaderScreen({ navigation }) {
  const { readingHistory = [] } = useAppState();
  const [passageIdx, setPassageIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const passage = PASSAGES[passageIdx];

  const score = useMemo(() => {
    if (!checked) return null;
    const items = passage.statements;
    const correct = items.filter((s) => answers[s.text] === s.match).length;
    return { correct, total: items.length, pct: Math.round((correct / items.length) * 100) };
  }, [checked, answers, passage]);

  const handleCheck = () => {
    const answered = Object.keys(answers).length;
    if (answered < passage.statements.length) {
      Alert.alert('Passage Reader', `Match all ${passage.statements.length} statements before checking answers.`);
      return;
    }
    setChecked(true);
  };

  const handleReset = () => {
    setChecked(false);
    setAnswers({});
  };

  const handleNext = () => {
    if (passageIdx < PASSAGES.length - 1) {
      setPassageIdx((i) => i + 1);
      handleReset();
    } else {
      Alert.alert('Passage Reader', 'You completed all passages. Try another one from the Reading section.');
    }
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Passage Reader</Text>
      <Text style={styles.headerSub}>Reading II-style matching practice. Assign each statement to the paragraph it comes from — or mark it Not Given.</Text>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>{passage.title}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.levelChip, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.levelChipText}>{passage.level}</Text>
          </View>
          <Text style={styles.metaText}>{passage.paragraphs.length} paragraphs • {passage.statements.length} statements</Text>
        </View>
        <TabPill
          style={styles.tabPill}
          activeKey={passageIdx}
          onPress={(idx) => { setPassageIdx(idx); handleReset(); }}
          options={PASSAGES.map((p, i) => ({ key: i, label: p.title }))}
        />
        {passage.paragraphs.map((para, i) => (
          <View key={i} style={styles.paraBox}>
            <Text style={styles.paraNum}>¶{i + 1}</Text>
            <Text style={styles.paraText}>{para}</Text>
          </View>
        ))}
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Match the statements</Text>
        {passage.statements.map((s, i) => {
          const selected = answers[s.text];
          const correct = checked && selected === s.match;
          const wrong = checked && selected !== s.match;
          return (
            <View key={i} style={[styles.statementBox, checked && correct && styles.correctBox, checked && wrong && styles.wrongBox]}>
              <Text style={styles.statementText}>{s.text}</Text>
              <Text style={styles.statementHint}>{s.type}</Text>
              <View style={styles.optionRow}>
                {passage.paragraphs.map((_, pi) => (
                  <TouchableOpacity
                    key={pi}
                    activeOpacity={0.75}
                    onPress={() => !checked && setAnswers((prev) => ({ ...prev, [s.text]: pi }))}
                    style={[styles.option, selected === pi ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={[styles.optionText, selected === pi ? { color: '#FFFFFF' } : { color: colors.text }]}>{`¶${pi + 1}`}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => !checked && setAnswers((prev) => ({ ...prev, [s.text]: -1 }))}
                  style={[styles.option, selected === -1 ? { backgroundColor: colors.muted, borderColor: colors.muted } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.optionText, selected === -1 ? { color: '#FFFFFF' } : { color: colors.text }]}>NG</Text>
                </TouchableOpacity>
              </View>
              {checked ? (
                <Text style={[styles.feedbackText, correct ? { color: colors.success } : { color: colors.error }]}>
                  {correct ? '✓ Correct' : `✗ This comes from paragraph ${s.match + 1}`}
                </Text>
              ) : null}
            </View>
          );
        })}
        <View style={styles.bouRow}>
          {!checked ? (
            <Button label="Check Answers" variant="primary" onPress={handleCheck} />
          ) : (
            <>
              <Button label="Reset" variant="secondary" onPress={handleReset} />
              <Button label="Next Passage" variant="primary" onPress={handleNext} />
            </>
          )}
        </View>
        {checked ? (
          <View style={styles.scoreRow}>
            <ScoreBandChip score={score.pct} label={`${score.correct}/${score.total} correct`} />
            <Text style={styles.scoreNote}>{score.pct >= 80 ? 'Excellent — BUSEPT Reading II ready' : score.pct >= 60 ? 'Good — watch the NG traps' : 'Review explicit vs inferred statements'}</Text>
          </View>
        ) : null}
      </Card>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Strategy notes</Text>
        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Read the statements first — they often mirror one paragraph almost word for word.</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>If a statement needs an extra assumption, mark it Not Given rather than guessing a paragraph.</Text>
        </View>
      </Card>
    </Screen>
  );
}

);
