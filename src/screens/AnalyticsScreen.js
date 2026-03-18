import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function AnalyticsScreen() {
  const { history, mockHistory } = useAppState();
  const avgWriting = history.length ? Math.round(history.reduce((a, h) => a + h.report.rubric.Total, 0) / history.length) : 0;
  const avgMock = mockHistory.length ? Math.round(mockHistory.reduce((a, m) => a + m.result.overall, 0) / mockHistory.length) : 0;

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Analytics</Text>
      <Card style={styles.card}>
        <Text style={styles.h3}>Writing Trend</Text>
        <Text style={styles.body}>Average score: {avgWriting}/20</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Mock Trend</Text>
        <Text style={styles.body}>Average overall: {avgMock}/100</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Consistency</Text>
        <Text style={styles.body}>{history.length} essays • {mockHistory.length} mocks</Text>
      </Card>
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
