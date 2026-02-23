import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { advanceReview } from '../utils/srs';

export default function ReviewScreen() {
  const { reviews, setReviews } = useAppState();
  const [index, setIndex] = useState(0);
  const due = reviews.filter((r) => r.nextReviewAt <= Date.now());
  const current = due[index];

  // Calculate mastery statistics (Stage 4+ is mastered)
  const masteredCount = reviews.filter((r) => r.stage >= 4).length;
  const totalWords = Math.max(1, reviews.length);
  const masteryPercentage = (masteredCount / totalWords) * 100;

  const onAnswer = (correct) => {
    if (!current) return;
    const updated = reviews.map((r) => (r.word === current.word ? advanceReview(r, correct) : r));
    setReviews(updated);
    setIndex((i) => i + 1);
  };

  return (
    <Screen contentStyle={styles.container}>
      <Text style={styles.h1}>Daily Review</Text>

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
          <Text style={styles.sub}>Stage {current.stage}</Text>
          <Button label="I knew it" onPress={() => onAnswer(true)} />
          <Button label="I forgot" variant="secondary" onPress={() => onAnswer(false)} />
        </Card>
      )}
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
    fontFamily: typography.fontBody
  },
  card: {
    marginTop: spacing.lg
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
  }
});
