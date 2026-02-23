import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';

export default function DraftRestoreScreen({ navigation, route }) {
  const draftText = route?.params?.draftText || '';

  return (
    <Screen contentStyle={styles.container}>
      <Text style={styles.h1}>Restore Draft</Text>
      <Text style={styles.body}>Do you want to restore this draft?</Text>
      <Text style={styles.preview} numberOfLines={6}>{draftText}</Text>
      <Button label="Restore" onPress={() => navigation.navigate('WritingEditor', { draftText })} />
      <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
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
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  preview: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg
  }
});
