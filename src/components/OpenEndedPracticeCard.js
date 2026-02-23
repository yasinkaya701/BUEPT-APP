import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Card from './Card';
import { colors, spacing, typography } from '../theme/tokens';

function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
}

export default function OpenEndedPracticeCard({
  title = 'Open-Ended Practice',
  prompts = [],
  placeholder = 'Write your answer here...',
}) {
  const [responses, setResponses] = useState({});

  const normalizedPrompts = useMemo(
    () => (Array.isArray(prompts) ? prompts.filter(Boolean).slice(0, 4) : []),
    [prompts]
  );

  if (!normalizedPrompts.length) return null;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Write short paragraph answers. No single correct option.</Text>

      {normalizedPrompts.map((prompt, index) => {
        const response = responses[index] || '';
        return (
          <View key={`${index}-${prompt}`} style={styles.block}>
            <Text style={styles.question}>{index + 1}. {prompt}</Text>
            <TextInput
              multiline
              value={response}
              onChangeText={(text) => setResponses((prev) => ({ ...prev, [index]: text }))}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
              textAlignVertical="top"
            />
            <View style={styles.metaRow}>
              <Text style={styles.wordCount}>Words: {countWords(response)}</Text>
              {response.length > 0 && (
                <TouchableOpacity onPress={() => setResponses((prev) => ({ ...prev, [index]: '' }))}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  block: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  question: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
    backgroundColor: '#fff',
  },
  metaRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 11,
    color: colors.muted,
  },
  clearText: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
});
