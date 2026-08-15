import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius, shadow } from '../../theme/tokens';

const ACCENTS = {
  vocab: colors.skill.vocab,
  listening: colors.skill.listening,
  writing: colors.skill.writing,
  speaking: colors.skill.speaking,
  default: colors.primary,
};

const SOFTS = {
  vocab: colors.skillSoft.vocab,
  listening: colors.skillSoft.listening,
  writing: colors.skillSoft.writing,
  speaking: colors.skillSoft.speaking,
  default: colors.primaryLight,
};

/**
 * Premium skill-page header: eyebrow badge + big title + description,
 * branded by the core skill identity color (vocab/listening/writing/speaking).
 */
export default function SkillHeader({
  skill = 'default',
  eyebrow = 'STUDIO',
  title = '',
  description = '',
  icon = 'layers-outline',
  rightValue = null,
  rightLabel = null,
  style,
}) {
  const accent = ACCENTS[skill] || ACCENTS.default;
  const soft = SOFTS[skill] || SOFTS.default;
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={[styles.iconTile, { backgroundColor: soft, borderColor: `${accent}22` }]}>
          <Ionicons name={icon} size={20} color={accent} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description} numberOfLines={2}>{description}</Text> : null}
        </View>
        {rightValue != null ? (
          <View style={[styles.rightBox, { backgroundColor: soft }]}>
            <Text style={[styles.rightValue, { color: accent }]}>{rightValue}</Text>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
  },
  description: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 18,
    marginTop: 2,
  },
  rightBox: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
    flexShrink: 0,
    ...shadow.slight,
  },
  rightValue: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    lineHeight: 24,
  },
  rightLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
