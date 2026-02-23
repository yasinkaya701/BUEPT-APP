import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function MockHistoryScreen({ navigation }) {
  const { mockHistory } = useAppState();

  const openMock = (result) => {
    navigation.navigate('MockResult', { result });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.h1}>Mock History</Text>
      {mockHistory.length === 0 && <Text style={styles.body}>No mock results yet.</Text>}
      {mockHistory.map((m) => (
        <Pressable key={m.id} onPress={() => openMock(m.result)}>
          <Card style={styles.card}>
            <Text style={styles.h3}>Mock • {new Date(m.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.body}>Overall: {m.result.overall}/100</Text>
            <Text style={styles.sub}>Listening {m.result.listening} • Reading {m.result.reading} • Writing {m.result.writing}</Text>
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
