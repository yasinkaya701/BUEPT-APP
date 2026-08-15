import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import { BADGE_DEFS } from '../utils/gamification';
import { useAppState } from '../context/AppState';

export default function BadgeCaseScreen({ navigation }) {
  const { badges = [], streakDays, userWords, wordLabWords, readingDone, listeningDone, grammarDone, writingDone, mockCount, mockMaxScore, perfectQuiz } = useAppState();

  const held = useMemo(() => new Set(Array.isArray(badges) ? badges : []), [badges]);

  const summary = useMemo(() => {
    const unlocked = BADGE_DEFS.filter((b) => held.has(b.id)).length;
    return { unlocked, total: BADGE_DEFS.length };
  }, [held]);

  const context = {
    streakDays,
    savedWords: userWords?.length || 0,
    wordLabSentences: wordLabWords?.length || 0,
    readingDone: Boolean(readingDone),
    listeningDone: Boolean(listeningDone),
    grammarDone: Boolean(grammarDone),
    writingDone: Boolean(writingDone),
    mockCount: mockCount || 0,
    mockMaxScore: mockMaxScore || 0,
    perfectQuiz: Boolean(perfectQuiz),
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h1}>Badge Case</Text>
        <Text style={styles.headerSub}>{summary.unlocked}/{summary.total} unlocked</Text>
      </View>

      <View style={[styles.progressCard, shadow.elev1]}>
        <Text style={styles.progressLabel}>Collection progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(summary.unlocked / Math.max(1, summary.total)) * 100}%` }]} />
        </View>
        <Text style={styles.progressHint}>Practice daily, beat your best mock, and collect words to unlock more.</Text>
      </View>

      <View style={styles.grid}>
        {BADGE_DEFS.map((badge) => {
          const unlocked = held.has(badge.id);
          const achievable = badge.check(context);
          return (
            <View key={badge.id} style={[styles.badgeCard, unlocked ? shadow.sm : styles.badgeCardLocked]}>
              <View style={[styles.badgeIconTile, unlocked ? styles.badgeIconTileOn : styles.badgeIconTileOff]}>
                <Ionicons name={badge.icon} size={26} color={unlocked ? '#FFFFFF' : colors.muted} />
              </View>
              <Text style={[styles.badgeTitle, unlocked ? { color: colors.primaryDark } : { color: colors.muted }]}>{badge.title}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
              <View style={styles.badgeFooter}>
                {unlocked ? (
                  <View style={styles.badgeStatusOn}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.badgeStatusTextOn}>Unlocked</Text>
                  </View>
                ) : achievable ? (
                  <View style={styles.badgeStatusNew}>
                    <Ionicons name="flash" size={14} color={colors.accentBright} />
                    <Text style={styles.badgeStatusTextNew}>Available now</Text>
                  </View>
                ) : (
                  <View style={styles.badgeStatusOff}>
                    <Ionicons name="lock-closed" size={14} color={colors.muted} />
                    <Text style={styles.badgeStatusTextOff}>Locked</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footerHint}>
        {navigation ? 'Badge progress is saved automatically across sessions.' : ''}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  progressHint: {
    fontSize: typography.xsmall,
    color: colors.muted,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  badgeCardLocked: {
    opacity: 0.85,
  },
  badgeIconTile: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badgeIconTileOn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badgeIconTileOff: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
    lineHeight: 20,
  },
  badgeDescription: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  badgeFooter: {
    marginTop: 'auto',
  },
  badgeStatusOn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeStatusNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningLight,
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeStatusOff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeStatusTextOn: {
    fontSize: typography.micro,
    color: colors.successDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeStatusTextNew: {
    fontSize: typography.micro,
    color: colors.accent,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeStatusTextOff: {
    fontSize: typography.micro,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footerHint: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
