import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../../theme/tokens';

const ACCENT_COLORS = {
  blue: colors.primary,
  teal: colors.teal,
  amber: colors.accentBright,
  purple: '#7C3AED',
  green: colors.success,
  red: colors.error,
  slate: colors.muted,
};

/**
 * Compact metric tile with a colored accent bar, big value and label.
 * Used across Vocab / Listening / Writing / Speaking surfaces.
 */
export function MetricTile({ value = '—', label = 'Metric', accent = 'blue', style }) {
  const accentColor = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;
  return (
    <View style={[styles.tile, { borderColor: `${accentColor}33` }, style]}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <Text style={[styles.value, { color: accentColor }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

/**
 * Horizontal rail of up to four MetricTile cards.
 */
export default function MetricRail({ children, style }) {
  return <View style={[styles.rail, style]}>{children}</View>;
}

MetricRail.Tile = MetricTile;

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingLeft: spacing.sm + 4,
    ...shadow.slight,
  },
  accentBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    lineHeight: 24,
  },
  label: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
