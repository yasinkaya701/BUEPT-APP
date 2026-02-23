import React, { useEffect, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { buildMockAdvice } from '../utils/mockAdvice';

export default function MockResultScreen({ route }) {
  const { addMockResult } = useAppState();
  const passed = route?.params?.result;

  const result = useMemo(() => (
    passed || {
      listening: 62,
      reading: 58,
      writing: 55,
      overall: 58,
      cefr: 'B1+'
    }
  ), [passed]);

  useEffect(() => {
    if (!passed) addMockResult(result);
  }, [passed, addMockResult, result]);

  const advice = buildMockAdvice(result);

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.h1}>Mock Result</Text>
      <Card style={styles.card}>
        <Text style={styles.h3}>Overall</Text>
        <Text style={styles.body}>{result.overall} / 100</Text>
        <Text style={styles.sub}>CEFR: {result.cefr}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Section Scores</Text>
        <Text style={styles.body}>Listening: {result.listening}</Text>
        <Text style={styles.body}>Reading: {result.reading}</Text>
        <Text style={styles.body}>Writing: {result.writing}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Focus Next</Text>
        {advice.map((a, i) => (
          <Text key={i} style={styles.body}>• {a}</Text>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.md
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted
  },
  card: {
    marginBottom: spacing.lg
  }
});
