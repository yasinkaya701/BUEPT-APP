import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function Chip({ label, onPress, active = false }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.base, active && styles.active, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md - 2,
    backgroundColor: colors.primaryUltraLight || colors.surfaceAlt,
    borderWidth: 1,
    borderColor: '#D3DFF2',
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
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: typography.xsmall,
    color: '#28466F',
    fontFamily: typography.fontHeadline,
    fontWeight: '600',
  },
  textActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
});
