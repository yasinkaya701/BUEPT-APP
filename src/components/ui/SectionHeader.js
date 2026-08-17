import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius } from '../../theme/tokens';

/**
 * Numbered section header with optional accent tile and count pill.
 * Shared across Vocab / Listening / Writing / Speaking surfaces.
 */
export default function SectionHeader({
  number = null,
  icon = null,
  title,
  description = null,
  count = null,
  accent = colors.primary,
  style,
}) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.numberTile, { backgroundColor: `${accent}14` }]}>
            {icon ? <Ionicons name={icon} size={13} color={accent} /> : (
              <Text style={[styles.numberText, { color: accent }]}>{number}</Text>
            )}
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description} numberOfLines={2}>{description}</Text> : null}
          </View>
        </View>
        {count != null ? (
          <View style={[styles.countPill, { backgroundColor: `${accent}14` }]}>
            <Text style={[styles.countText, { color: accent }]}>{count}</Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.rule, { backgroundColor: `${accent}22` }]} />
    </View>
  );

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  numberTile: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 1,
  },
  countPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  rule: {
    height: 1,
    marginTop: spacing.sm,
  },
});

}

