import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function ReadingHistoryScreen() {
  const { readingHistory } = useAppState();

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Reading History</Text>
      {readingHistory.length === 0 && <Text style={styles.body}>No attempts yet.</Text>}
      {readingHistory.map((r) => (
        <Card key={r.id} style={styles.card}>
          <Text style={styles.h3}>Reading • {new Date(r.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.body}>Score: {r.result.score}/{r.result.total}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
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
  card: {
    marginBottom: spacing.lg
  }
});
