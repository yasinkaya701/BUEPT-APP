import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { fetchDirectGeminiChat } from '../utils/runtimeApi';

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
  cardSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    minHeight: 92,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  levelLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  levelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sampleText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  suggestionBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestionLabel: {
    fontSize: typography.micro,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pairRowApplied: {
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
  },
  pairOriginal: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  pairUpgraded: {
    fontSize: typography.small,
    color: colors.accent,
    fontFamily: typography.fontHeadline,
  },
  pairReason: {
    flex: 1,
    fontSize: typography.micro,
    color: colors.muted,
  },
  errorText: {
    fontSize: typography.small,
    color: colors.error,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  footerNote: {
    fontSize: typography.micro,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 15,
  },
}

const SAMPLE_SENTENCES = [
  'The university requires students to achieve a high level of English proficiency before graduation.',
  'Many researchers argue that regular exercise significantly improves cognitive performance.',
  'The government has implemented new policies to reduce carbon emissions in major cities.',
  'Some people believe that technology will eventually replace traditional classroom teaching.',
  'Climate change poses serious threats to coastal communities around the world.',
];

const LEVELS = [
  { key: 'B1', label: 'B1', sub: 'Intermediate', color: colors.success },
  { key: 'B2', label: 'B2', sub: 'Upper-Int.', color: colors.primary },
  { key: 'C1', label: 'C1', sub: 'Advanced', color: colors.accentBright },
];

export default function ParaphraseStudioScreen({ navigation }) {
  const { aiReady, aiAccessConfig } = useAppState();
  const [sentence, setSentence] = useState('');
  const [targetLevel, setTargetLevel] = useState('C1');
  const [suggestions, setSuggestions] = useState([]);
  const [synonymPairs, setSynonymPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const aiEnabled = Boolean(aiReady && aiAccessConfig?.allowAiParaphrase !== false);

  const handleGenerate = async () => {
    if (!sentence.trim()) {
      Alert.alert('Paraphrase Studio', 'Write a sentence first, or pick a sample below.');
      return;
    }
    if (!aiEnabled) {
      Alert.alert('Paraphrase Studio', 'AI paraphrasing is not enabled in this environment.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestions([]);
    setSynonymPairs([]);
    try {
      const prompt = `You are an academic English paraphrase coach for the BUSEPT exam. The student wrote this sentence:\n\n"${sentence.trim()}"\n\nProvide:\n1. THREE paraphrases at ${targetLevel} level (clearly better vocabulary and structure, but keep the same meaning). Label them A, B, C.\n2. FIVE vocabulary upgrade suggestions for words in the original sentence, formatted exactly as one line each: "original_word → upgraded_word (reason)".\n\nReturn ONLY the paraphrases and the word upgrades, nothing else.`;
      const reply = await fetchDirectGeminiChat({ messages: [{ role: 'user', content: [{ text: prompt }] }] });
      const text = String(reply?.text || reply || '');
      const parts = text.split(/\n{2,}/);
      const paraphrases = parts[0]
        ? parts[0]
            .split(/\n/)
            .filter((line) => /^\s*[ABC][\.\)]\s/.test(line) || /^\s*\d+[\.\)]\s/.test(line))
            .map((line) => line.replace(/^\s*[ABC\d]+[\.\)]\s*/, '').trim())
            .filter(Boolean)
        : [];
      const pairs = (parts[1] || text)
        .split('\n')
        .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
        .filter((line) => /→|->/.test(line))
        .slice(0, 6)
        .map((line) => {
          const [original, rest] = line.split(/→|->/).map((s) => s.trim());
          const upgraded = rest ? rest.split('(')[0].trim() : '';
          const reason = rest && rest.includes('(') ? rest.match(/\(([^)]*)\)/)?.[1] || '' : '';
          return { original, upgraded, reason };
        })
        .filter((p) => p.original && p.upgraded);
      setSuggestions(paraphrases.slice(0, 3));
      setSynonymPairs(pairs.slice(0, 5));
      if (!paraphrases.length && !pairs.length) {
        setError('Could not parse suggestions — try rewording your sentence.');
      }
    } catch (e) {
      setError('Paraphrase generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = (pair) => {
    setSentence((prev) => {
      const regex = new RegExp(`\\b${pair.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const next = prev.replace(regex, pair.upgraded);
      return next === prev ? prev : next;
    });
  };

  const usedPairs = useMemo(() => {
    return synonymPairs.filter((p) => new RegExp(`\\b${p.upgraded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(sentence));
  }, [synonymPairs, sentence]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll contentStyle={styles.container}>
        <Text style={styles.h1}>Paraphrase Studio</Text>
        <Text style={styles.headerSub}>Rewrite sentences at B1–C1 level to build the flexible academic style BUSEPT graders reward.</Text>

        <Card style={[styles.card, shadow.elev1]}>
          <Text style={styles.cardTitle}>Your sentence</Text>
          <TextInput
            style={styles.input}
            placeholder="Type a sentence you want to paraphrase..."
            placeholderTextColor={colors.muted}
            multiline
            value={sentence}
            onChangeText={setSentence}
          />
          <Text style={styles.levelLabel}>Target level</Text>
          <View style={styles.levelRow}>
            {LEVELS.map((lv) => {
              const active = lv.key === targetLevel;
              return (
                <TouchableOpacity
                  key={lv.key}
                  activeOpacity={0.75}
                  onPress={() => setTargetLevel(lv.key)}
                  style={[styles.levelCell, active && { borderColor: lv.color, backgroundColor: `${lv.color}14` }, !active && { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.levelKey, active ? { color: lv.color } : { color: colors.muted }]}>{lv.label}</Text>
                  <Text style={styles.levelSub}>{lv.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button label={loading ? 'Generating...' : 'Paraphrase'} variant="primary" onPress={handleGenerate} disabled={loading} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Card>

        <Card style={[styles.card, shadow.elev1]}>
          <Text style={styles.cardTitle}>Sample sentences</Text>
          {SAMPLE_SENTENCES.map((sample, idx) => (
            <TouchableOpacity key={idx} activeOpacity={0.7} onPress={() => setSentence(sample)} style={styles.sampleRow}>
              <Ionicons name="copy-outline" size={14} color={colors.muted} />
              <Text style={styles.sampleText} numberOfLines={2}>{sample}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {suggestions.length > 0 ? (
          <Card style={[styles.card, shadow.elev1]}>
            <Text style={styles.cardTitle}>Paraphrases at {targetLevel}</Text>
            {suggestions.map((s, idx) => (
              <View key={idx} style={styles.suggestionBox}>
                <Text style={styles.suggestionLabel}>{['A', 'B', 'C'][idx]}</Text>
                <Text style={styles.suggestionText}>{s}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {synonymPairs.length > 0 ? (
          <Card style={[styles.card, shadow.elev1]}>
            <Text style={styles.cardTitle}>Word upgrades</Text>
            <Text style={styles.cardSub}>Tap swap to apply the upgrade directly into your sentence.</Text>
            {synonymPairs.map((pair, idx) => {
              const applied = usedPairs.includes(pair);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={() => handleSwap(pair)}
                  style={[styles.pairRow, applied && styles.pairRowApplied]}
                >
                  <Text style={[styles.pairOriginal, applied && { textDecorationLine: 'line-through', color: colors.muted }]}>{pair.original}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.accent} />
                  <Text style={styles.pairUpgraded}>{pair.upgraded}</Text>
                  {pair.reason ? <Text style={styles.pairReason}>— {pair.reason}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </Card>
        ) : null}

        <Text style={styles.footerNote}>Tip: BUSEPT graders look for varied sentence structure — mix paraphrase levels in your essays.</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

);
