import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

function Chip({ label, onPress, active = false }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.base, active && styles.active, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

export default React.memo(Chip);

const styles = StyleSheet.create({
  base: {
    minHeight: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md - 2,
    backgroundColor: colors.primaryUltraLight || colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDeeper || colors.primaryDark,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  text: {
    fontSize: typography.xsmall,
    color: colors.primaryDeeper,
    fontFamily: typography.fontHeadline,
    fontWeight: '600',
  },
  textActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
});
