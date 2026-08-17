import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import { levelFromXP, titleForLevel, xpToNextLevel, levelProgressPct } from '../utils/gamification';
import { useAppState } from '../context/AppState';

const LEVEL_ICONS = ['flask-outline', 'book-outline', 'reader-outline', 'albums-outline', 'document-text-outline', 'school-outline', 'trophy-outline', 'medal-outline', 'diamond-outline', 'star-outline'];

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  currentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  currentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  currentTile: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  currentMeta: {
    flex: 1,
  },
  currentTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  currentLevel: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  nextLabel: {
    fontSize: typography.xsmall,
    color: colors.textSecondary,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  currentTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  currentFill: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  currentPct: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  tierLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  tierList: {
    gap: spacing.sm,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tierRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tierIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierIconOn: {
    backgroundColor: colors.primary,
  },
  tierIconOff: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierMeta: {
    flex: 1,
  },
  tierTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    lineHeight: 20,
  },
  tierSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 1,
  },
  tierBadge: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tierBadgeText: {
    fontSize: typography.micro,
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default function LevelCardScreen() {
  const { xp = 0 } = useAppState();

  const current = useMemo(() => {
    const level = levelFromXP(xp);
    return {
      level,
      title: titleForLevel(level),
      progressPct: levelProgressPct(xp),
      nextLevelXP: xpToNextLevel(xp),
      remaining: Math.max(0, xpToNextLevel(xp) - xp),
    };
  }, [xp]);

  const tiers = useMemo(() => {
    const rows = [];
    for (let i = 1; i <= 10; i += 1) {
      const reached = i <= current.level;
      rows.push({
        level: i,
        title: titleForLevel(i),
        icon: LEVEL_ICONS[Math.min(i, LEVEL_ICONS.length) - 1],
        reached,
        active: i === current.level,
      });
    }
    return rows;
  }, [current.level]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>XP Ladder</Text>
      <Text style={styles.headerSub}>Earn XP with every practice action and climb the titles.</Text>

      <View style={[styles.currentCard, shadow.md]}>
        <View style={styles.currentTop}>
          <View style={[styles.currentTile, { backgroundColor: colors.primary }]}>
            <Ionicons name={tiers[current.level - 1]?.icon || 'diamond-outline'} size={28} color="#FFFFFF" />
          </View>
          <View style={styles.currentMeta}>
            <Text style={styles.currentTitle}>{current.title}</Text>
            <Text style={styles.currentLevel}>Level {current.level} • {xp} XP</Text>
          </View>
        </View>
        <Text style={styles.nextLabel}>Next: Level {current.level + 1} — {current.remaining} XP remaining</Text>
        <View style={styles.currentTrack}>
          <View style={[styles.currentFill, { width: `${current.progressPct}%` }]} />
        </View>
        <Text style={styles.currentPct}>{current.progressPct}% of the way up</Text>
      </View>

      <Text style={styles.tierLabel}>All tiers</Text>
      <View style={styles.tierList}>
        {tiers.map((tier) => (
          <View key={tier.level} style={[styles.tierRow, tier.active && styles.tierRowActive, shadow.elev1]}>
            <View style={[styles.tierIcon, tier.reached ? styles.tierIconOn : styles.tierIconOff]}>
              <Ionicons name={tier.icon} size={18} color={tier.reached ? '#FFFFFF' : colors.muted} />
            </View>
            <View style={styles.tierMeta}>
              <Text style={[styles.tierTitle, tier.reached ? { color: colors.primaryDark } : { color: colors.muted }]}>
                {tier.title}
              </Text>
              <Text style={styles.tierSub}>Level {tier.level}</Text>
            </View>
            {tier.active ? (
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>YOU ARE HERE</Text>
              </View>
            ) : tier.reached ? (
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            ) : (
              <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.footerNote}>Daily login, quizzes, essays, and speaking sessions all award XP.</Text>
    </Screen>
  );
}

