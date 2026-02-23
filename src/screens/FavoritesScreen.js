import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function FavoritesScreen({ navigation }) {
  const { favoritePrompts } = useAppState();

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.h1}>Favorite Prompts</Text>
      {favoritePrompts.length === 0 && <Text style={styles.body}>No favorites yet.</Text>}
      {favoritePrompts.map((p, i) => (
        <Card key={i} style={styles.card}>
          <Text style={styles.body}>{p}</Text>
          <Button label="Start Writing" variant="secondary" onPress={() => navigation.navigate('WritingEditor', { prompt: p })} />
        </Card>
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
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  card: {
    marginBottom: spacing.lg
  }
});
