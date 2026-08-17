import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 1,
  },
  bodyText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: typography.micro,
    fontWeight: '600',
  },
}

const BADGE_TONES = {
  gold: { bg: colors.accentSoft, text: colors.accent },
  blue: { bg: colors.primaryLight, text: colors.primaryDark },
  teal: { bg: colors.tealSoft, text: colors.teal },
  soft: { bg: colors.surfaceAlt, text: colors.muted },
  red: { bg: colors.errorLight, text: colors.error },
  green: { bg: colors.successLight, text: colors.successDark },
};

/**
 * Premium library row for practice tasks and prompts.
 * Optional icons for level + type, badge pills, meta line and a chevron CTA.
 */
export default function PracticeTaskRow({
  title,
  meta,
  badges = [],
  body,
  levelIcon = 'bookmark-outline',
  onPress,
  tone = 'blue',
}) {
  const accent = colors.skill[tone] || colors.skill.listening;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.9}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={styles.row}
    >
      <View style={[styles.iconTile, { backgroundColor: `${accent}14` }]}>
        <Ionicons name={levelIcon} size={16} color={accent} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>
        {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : null}
        {body ? <Text style={styles.bodyText} numberOfLines={2}>{body}</Text> : null}
        {badges.length > 0 ? (
          <View style={styles.badgeRow}>
            {badges.map((badge) => (
              <View key={`${title}-${badge.label || badge}`} style={[styles.badge, BADGE_TONES[badge.tone || 'soft']?.bg ? { backgroundColor: BADGE_TONES[badge.tone || 'soft'].bg } : null]}>
                <Text style={[styles.badgeText, BADGE_TONES[badge.tone || 'soft']?.text ? { color: BADGE_TONES[badge.tone || 'soft'].text } : null]}>{badge.label != null ? badge.label : badge}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

);
