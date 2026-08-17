import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.xsmall,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontFamily: typography.fontBody,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  helper: {
    fontSize: typography.micro,
    color: colors.muted,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  helperActive: {
    color: colors.primary,
    backgroundColor: colors.surface,
  },
}

/**
 * Single filter chip (used inside FilterBar).
 */
export function FilterChip({ label, active, onPress, helper, style }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      style={[styles.chip, active && styles.chipActive, style]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {helper ? <Text style={[styles.helper, active && styles.helperActive]}>{helper}</Text> : null}
    </TouchableOpacity>
  );
}

/**
 * Horizontally scrollable filter bar with a label above it.
 * Shared by Vocab / Listening / Writing / Speaking filter surfaces.
 */
export default function FilterBar({ label = null, children, style, scroll = false }) {
  const inner = <View style={styles.row}>{children}</View>;
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.scrollContent}>{inner}</View>
      )}
    </View>
  );
}

FilterBar.Chip = FilterChip;

);
