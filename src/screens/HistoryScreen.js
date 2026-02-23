import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function HistoryScreen({ navigation }) {
  const { history, setActiveReportById } = useAppState();

  const openReport = (id) => {
    setActiveReportById(id);
    navigation.navigate('Feedback');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.h1}>Writing History</Text>
      {history.length === 0 && <Text style={styles.body}>No essays submitted yet.</Text>}
      {history.map((h) => (
        <Pressable key={h.id} onPress={() => openReport(h.id)}>
          <Card style={styles.card}>
            <Text style={styles.h3}>Essay • {new Date(h.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.body}>Score: {h.report.rubric.Total}/20</Text>
            <Text style={styles.sub}>CEFR: {h.report.cefr}</Text>
          </Card>
        </Pressable>
      ))}
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
