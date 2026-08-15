import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View, Alert } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { advanceReview, createReviewItem, dueNow, upcomingReviews } from '../utils/srs';

/** Dedupe reviews; prefer the existing entry's stage/ease when the word already exists. */
function mergeWords(into, from) {
  const existing = new Set((into || []).map((r) => String(r.word).toLowerCase()));
  const extra = (from || []).filter((w) => {
    const word = typeof w === 'string' ? w : w?.word;
    if (!word) return false;
    return !existing.has(String(word).toLowerCase());
  });
  return [...into, ...extra.map((w) => createReviewItem(typeof w === 'string' ? w : w.word))];
}

export default function ReviewScreen() {
  const { reviews, setReviews, unknownWords = [], userWords = [] } = useAppState();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Sync weak/unknown words into the SRS queue (never duplicating).
  const merged = useMemo(
    () => {
      const unknownMerged = mergeWords(reviews, unknownWords);
      const wordPool = Array.isArray(userWords) ? userWords.map((w) => w?.word).filter(Boolean) : [];
      return mergeWords(unknownMerged, wordPool);
    },
    [reviews, unknownWords, userWords]
  );

  const due = merged.filter((r) => dueNow(r));
  const current = due[index];
  const upcoming = upcomingReviews(merged, 3);

  // Calculate mastery statistics (Stage 4+ is mastered)
  const masteredCount = merged.filter((r) => r.stage >= 4).length;
  const totalWords = Math.max(1, merged.length);
  const masteryPercentage = (masteredCount / totalWords) * 100;

  const onAnswer = (correct) => {
    if (!current) return;
    const updated = merged.map((r) => (r.word === current.word ? advanceReview(r, correct) : r));
    setReviews(updated);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  const onMastered = () => {
    if (!current) return;
    const updated = merged.map((r) =>
      r.word === current.word ? { ...r, stage: 5, ease: Math.max(1.3, r.ease || 2.5), nextReviewAt: Date.now() + 30 * 24 * 60 * 60 * 1000 } : r
    );
    setReviews(updated);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Daily Review</Text>
      <Text style={styles.subTop}>Spaced repetition keeps weak words in memory. Words from your weak list join the queue automatically.</Text>

      {/* Progress & Stats Dashboard */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{due.length - index}</Text>
            <Text style={styles.statLabel}>To Review</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{masteredCount}</Text>
            <Text style={styles.statLabel}>Mastered (Stage 4+)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarFill, { width: `${masteryPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{masteryPercentage.toFixed(1)}% Mastered</Text>
      </View>

      {!current && <Text style={styles.body}>No reviews due right now. Great job!</Text>}
      {current && (
        <Card style={styles.card}>
          <Text style={styles.word}>{current.word}</Text>
          <Text style={styles.sub}>Stage {current.stage} · Ease {(current.ease || 2.5).toFixed(1)}</Text>
          {revealed ? (
            <View style={styles.answerRow}>
              <Text style={styles.body}>Tap a button below to grade your recall.</Text>
              <Button label="I knew it" onPress={() => onAnswer(true)} />
              <Button label="Hard — almost knew" variant="secondary" onPress={() => onAnswer(false)} />
              <Button label="Mastered — skip 30 days" variant="ghost" onPress={onMastered} />
            </View>
          ) : (
            <View style={styles.answerRow}>
              <Button label="Reveal word" onPress={() => setRevealed(true)} />
            </View>
          )}
        </Card>
      )}

      {upcoming.length > 0 ? (
        <Card style={styles.upcomingCard}>
          <Text style={styles.upcomingTitle}>Coming up next</Text>
          {upcoming.map((u) => {
            const hours = Math.max(1, Math.round((u.nextReviewAt - Date.now()) / (60 * 60 * 1000)));
            return (
              <Text key={u.word} style={styles.upcomingLine}>◦ {u.word} — in {hours}h</Text>
            );
          })}
        </Card>
      ) : null}
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
    marginBottom: spacing.sm
  },
  subTop: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 18
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody
  },
  card: {
    marginTop: spacing.lg
  },
  answerRow: {
    marginTop: spacing.md,
    gap: spacing.sm
  },
  word: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md
  },
  statsCard: {
    backgroundColor: '#0A1628',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.lg
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: '#DDE8FF'
  },
  statLabel: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 4
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  progressText: {
    fontSize: 10,
    color: colors.primary,
    textAlign: 'right',
    fontFamily: typography.fontHeadline
  },
  upcomingCard: {
    marginTop: spacing.lg
  },
  upcomingTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs
  },
  upcomingLine: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 20
  }
});
