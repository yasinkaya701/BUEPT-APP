import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { TabPill } from '../components/ui';
import { useAppState } from '../context/AppState';

const ESSAY_TOPICS = [
  {
    id: 'eb-preference-1',
    type: 'Preference',
    level: 'B2',
    title: 'Online vs. in-person learning',
    prompt: 'Some students prefer taking courses online, while others prefer attending classes in person. Which do you prefer and why?',
    wordTarget: [180, 260],
    modelSnippet: 'Although online courses offer flexibility, attending classes in person provides immediate interaction with instructors and peers, which I believe leads to deeper learning.',
    keyVocab: ['flexibility', 'interaction', 'immediate feedback', 'self-paced', 'engagement'],
  },
  {
    id: 'eb-preference-2',
    type: 'Preference',
    level: 'B2',
    title: 'City life vs. small town life',
    prompt: 'Would you rather live in a big city or a small town? Give reasons and examples to support your choice.',
    wordTarget: [180, 260],
    modelSnippet: 'Living in a small town offers a quieter lifestyle and stronger community bonds, but big cities provide far more career opportunities and cultural experiences.',
    keyVocab: ['community bonds', 'career opportunities', 'pace of life', 'amenities', 'isolation'],
  },
  {
    id: 'eb-opinion-1',
    type: 'Opinion',
    level: 'C1',
    title: 'Technology in education',
    prompt: 'Do you agree or disagree with the statement: "Technology will eventually replace teachers"? Support your opinion with examples.',
    wordTarget: [200, 300],
    modelSnippet: 'While technology can deliver content efficiently, it cannot replicate the empathy, motivation, and adaptive guidance that skilled teachers provide in the classroom.',
    keyVocab: ['replicate', 'empathy', 'adaptive guidance', 'pedagogy', 'facilitator'],
  },
  {
    id: 'eb-opinion-2',
    type: 'Opinion',
    level: 'C1',
    title: 'Remote work trend',
    prompt: 'Many companies now allow employees to work remotely. Is this a positive or negative development? Discuss.',
    wordTarget: [200, 300],
    modelSnippet: 'Remote work has increased autonomy and reduced commuting stress, yet it can blur the boundary between professional and personal life, harming long-term well-being.',
    keyVocab: ['autonomy', 'commuting stress', 'boundary', 'well-being', 'isolation'],
  },
  {
    id: 'eb-argument-1',
    type: 'Argument',
    level: 'B2',
    title: 'Should universities be free?',
    prompt: 'Some people argue that university education should be free for everyone. Do you agree?',
    wordTarget: [180, 260],
    modelSnippet: 'Free university education would equalize opportunity across income groups, but it could also strain public budgets and lower the perceived value of a degree.',
    keyVocab: ['equalize opportunity', 'strain public budgets', 'perceived value', 'subsidize', 'merit-based'],
  },
  {
    id: 'eb-argument-2',
    type: 'Argument',
    level: 'C1',
    title: 'Artificial intelligence regulation',
    prompt: 'Governments should strictly regulate the development of artificial intelligence. Do you agree or disagree?',
    wordTarget: [200, 300],
    modelSnippet: 'Unregulated AI development risks amplifying bias and displacing jobs, so proportionate regulation protects society without stifling innovation.',
    keyVocab: ['proportionate', 'amplifying bias', 'displacing jobs', 'stifling innovation', 'oversight'],
  },
];

export default function EssayBankScreen({ navigation }) {
  const { writingEngine } = useAppState();
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return ESSAY_TOPICS;
    return ESSAY_TOPICS.filter((t) => t.type === typeFilter);
  }, [typeFilter]);

  const targetRoute = useMemo(() => {
    if (writingEngine === 'WritingEditor' || writingEngine === 'EssayScreen' || writingEngine === 'WritingScreen') return writingEngine;
    return 'WritingEditor';
  }, [writingEngine]);

  const openWithTopic = (topic) => {
    navigation?.navigate(targetRoute, { prefillPrompt: topic.prompt, wordTargetMin: topic.wordTarget[0], wordTargetMax: topic.wordTarget[1] });
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Essay Bank</Text>
      <Text style={styles.headerSub}>BUSEPT-style writing prompts with model openings and target vocabulary. Pick a topic and write your essay in the Writing Editor.</Text>

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Filter by task type</Text>
        <TabPill
          style={styles.tabPill}
          activeKey={typeFilter}
          onPress={setTypeFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'Preference', label: 'Preference' },
            { key: 'Opinion', label: 'Opinion' },
            { key: 'Argument', label: 'Argument' },
          ]}
        />
        <Text style={styles.typeNote}>BUSEPT Writing tests both a preference question and an opinion/argument essay. Practice each type.</Text>
      </Card>

      {filtered.map((topic) => {
        const isOpen = expanded === topic.id;
        return (
          <Card key={topic.id} style={[styles.card, shadow.elev1]}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setExpanded(isOpen ? null : topic.id)} style={styles.topicHeader}>
              <View style={[styles.topicBadge, { backgroundColor: topic.type === 'Preference' ? colors.primaryLight : topic.type === 'Opinion' ? colors.tealLight : colors.accentLight }]}>
                <Text style={styles.topicBadgeText}>{topic.type}</Text>
              </View>
              <View style={styles.topicMeta}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSub}>{topic.level} • target {topic.wordTarget[0]}–{topic.wordTarget[1]} words</Text>
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </TouchableOpacity>
            {isOpen ? (
              <View style={styles.topicBody}>
                <Text style={styles.promptLabel}>Prompt</Text>
                <Text style={styles.promptText}>"{topic.prompt}"</Text>
                <Text style={styles.modelLabel}>Model opening</Text>
                <View style={styles.modelBox}>
                  <Ionicons name="bulb-outline" size={14} color={colors.accent} />
                  <Text style={styles.modelText}>{topic.modelSnippet}</Text>
                </View>
                <Text style={styles.vocabLabel}>Target vocabulary</Text>
                <View style={styles.vocabRow}>
                  {topic.keyVocab.map((w) => (
                    <View key={w} style={styles.vocabChip}>
                      <Text style={styles.vocabChipText}>{w}</Text>
                    </View>
                  ))}
                </View>
                <Button label="Write this essay" variant="primary" onPress={() => openWithTopic(topic)} />
              </View>
            ) : null}
          </Card>
        );
      })}

      <Card style={[styles.card, shadow.elev1]}>
        <Text style={styles.cardTitle}>Writing success tips</Text>
        <View style={styles.tipRow}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Aim for {200} words per essay — BUSEPT graders reward developed ideas, not length alone.</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="layers-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Use the target vocabulary at least once; the writing editor tracks your keyword usage.</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="list-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Plan with a thesis → 2 supporting paragraphs → conclusion structure before you write.</Text>
        </View>
      </Card>

      <Text style={styles.footerNote}>Topics mirror the real BUSEPT Writing section format. Model openings are starting points, not complete essays.</Text>
    </Screen>
  );
}

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
  tabPill: {
    marginBottom: spacing.sm,
  },
  typeNote: {
    fontSize: typography.micro,
    color: colors.muted,
    lineHeight: 15,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topicBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  topicBadgeText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  topicMeta: {
    flex: 1,
  },
  topicTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  topicSub: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: 2,
  },
  topicBody: {
    marginTop: spacing.sm,
  },
  promptLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  promptText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 21,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  modelLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  modelBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  modelText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  vocabLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  vocabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  vocabChip: {
    backgroundColor: colors.tintBlue,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  vocabChipText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
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
  footerNote: {
    fontSize: typography.micro,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 15,
  },
});
