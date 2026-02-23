import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { loadDraftSnapshots } from '../utils/essayStorage';

export default function DraftsScreen({ navigation }) {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    loadDraftSnapshots().then(setDrafts);
  }, []);

  const openDraft = (text) => {
    navigation.navigate('DraftRestore', { draftText: text });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.h1}>Draft History</Text>
      {drafts.length === 0 && <Text style={styles.body}>No drafts saved yet.</Text>}
      {drafts.map((d) => (
        <Pressable key={d.id} onPress={() => openDraft(d.text)}>
          <Card style={styles.card}>
            <Text style={styles.h3}>Draft • {new Date(d.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.sub} numberOfLines={2}>{d.text}</Text>
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
