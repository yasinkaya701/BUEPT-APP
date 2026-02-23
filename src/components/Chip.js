import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadow } from '../theme/tokens';

export default function Chip({ label, onPress, active = false }) {
  return (
    <Pressable style={[styles.base, active && styles.active]} onPress={onPress}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 28,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadow.elev1
  },
  text: {
    fontSize: typography.small,
    color: colors.primaryDark
  },
  textActive: {
    color: '#FFFFFF'
  }
});
