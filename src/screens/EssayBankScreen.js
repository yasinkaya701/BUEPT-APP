import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import bueptScoredEssays from '../../data/buept_scored_essays.json';

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
  tabRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabBtnText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    textAlign: 'center',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sourceTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    flex: 1,
  },
  sourceText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  scoredSet: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  setHeading: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  setPrompt: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  essayCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  essayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  bandChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  bandChipText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
  },
  essayMeta: {
    flex: 1,
  },
  essayTitle: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  essaySub: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: 2,
  },
  essayBody: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  essayText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bandBannerText: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    flex: 1,
  },
  sourceAttrib: {
    fontSize: typography.micro,
    color: colors.muted,
    lineHeight: 15,
    marginTop: spacing.sm,
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

const BAND_STYLE = {
  E: { color: '#16a34a', label: 'Excellent', labelAlt: 'E' },
  VG: { color: '#0d9488', label: 'Very Good', labelAlt: 'VG' },
  MA: { color: '#2563eb', label: 'More Than Adequate', labelAlt: 'MA' },
  A: { color: '#0891b2', label: 'Adequate', labelAlt: 'A' },
  D: { color: '#d97706', label: 'Doubtful', labelAlt: 'D' },
  NA: { color: '#ea580c', label: 'Not Adequate', labelAlt: 'NA' },
  FBA: { color: '#dc2626', label: 'Far Below Adequate', labelAlt: 'FBA' },
  INS: { color: '#b91c1c', label: 'Insufficient', labelAlt: 'INS' },
};

const PASS_BANNER = {
  E: 'Passing — official WASC expectation exceeded',
  VG: 'Passing — strong academic English',
  MA: 'Passing — clearly more than adequate',
  A: 'Passing — adequate for university study',
  D: 'Borderline — doubts about adequacy',
  NA: 'Failing — not adequate',
  FBA: 'Failing — far below adequacy',
  INS: 'Insufficient — too short to score reliably',
};

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
  const route = useRoute();
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState(route.params?.tab === 'scored' ? 'scored' : 'practice');
  const [openEssay, setOpenEssay] = useState(null);

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
      <Text style={styles.headerSub}>BUSEPT-style writing prompts with model openings and target vocabulary, plus real scored essays from Boğaziçi's WASC archive.</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setTab('practice')} style={[styles.tabBtn, tab === 'practice' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, tab === 'practice' && styles.tabBtnTextActive]}>Practice Prompts</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setTab('scored')} style={[styles.tabBtn, tab === 'scored' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, tab === 'scored' && styles.tabBtnTextActive]}>Official Scored Essays</Text>
        </TouchableOpacity>
      </View>

      {tab === 'scored' ? (
        <Card style={[styles.card, shadow.elev1]}>
          <View style={styles.sourceHeader}>
            <Ionicons name="school-outline" size={18} color={colors.primary} />
            <Text style={styles.sourceTitle}>Real BUEPT essays scored by Boğaziçi University WASC</Text>
          </View>
          <Text style={styles.sourceText}>These are actual student essays from the official exam archive, each graded with the real 10-band rubric (E = Excellent down to WN = Wrote Nothing). The pass mark is band A (Adequate for University Study, 60). Study how higher bands develop ideas, vary vocabulary, and control grammar — then compare them to your own drafts in the Writing Editor.</Text>
          {bueptScoredEssays.sets.map((set) => (
            <View key={set.id} style={styles.scoredSet}>
              <Text style={styles.setHeading}>{set.type} Set</Text>
              <Text style={styles.setPrompt}>“{set.prompt}”</Text>
              {set.essays.map((essay) => {
                const band = BAND_STYLE[essay.band] || { color: colors.muted, label: essay.band };
                const isOpen = openEssay === `${set.id}-${essay.number}`;
                return (
                  <View key={essay.number} style={styles.essayCard}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setOpenEssay(isOpen ? null : `${set.id}-${essay.number}`)} style={styles.essayRow}>
                      <View style={[styles.bandChip, { backgroundColor: band.color + '22' }]}>
                        <Text style={[styles.bandChipText, { color: band.color }]}>{essay.band}</Text>
                      </View>
                      <View style={styles.essayMeta}>
                        <Text style={styles.essayTitle}>Essay {essay.number} — {essay.title}</Text>
                        <Text style={styles.essaySub}>{essay.text.split(/\s+/).length} words</Text>
                      </View>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                    </TouchableOpacity>
                    {isOpen ? (
                      <View style={styles.essayBody}>
                        <Text style={styles.essayText}>{essay.text}</Text>
                        <View style={styles.bandBanner}>
                          <Ionicons name={PASS_BANNER[essay.band] ? (PASS_BANNER[essay.band].startsWith('Passing') ? 'checkmark-circle-outline' : 'close-circle-outline') : 'information-circle-outline'} size={14} color={band.color} />
                          <Text style={[styles.bandBannerText, { color: band.color }]}>{PASS_BANNER[essay.band] || band.label}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
          <Text style={styles.sourceAttrib}>Source: Boğaziçi University Writing and Academic Support Center — real BUEPT sample essays with official scores.</Text>
        </Card>
      ) : (
        <View>
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
          <Text style={styles.cardTitle}>Filter by task type</Text>
        <View style={styles.filterRow}>
          {[{ key: 'all', label: 'All' }, { key: 'Preference', label: 'Preference' }, { key: 'Opinion', label: 'Opinion' }, { key: 'Argument', label: 'Argument' }].map((opt) => (
            <TouchableOpacity key={opt.key} activeOpacity={0.8} onPress={() => setTypeFilter(opt.key)} style={[styles.filterPill, typeFilter === opt.key && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, typeFilter === opt.key && styles.filterPillTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.typeNote}>BUSEPT Writing tests both a preference question and an opinion/argument essay. Practice each type.</Text>
      </Card>

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
        </View>
      )}
    </Screen>
  );
}

