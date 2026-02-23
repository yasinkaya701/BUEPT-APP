import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme/tokens';

export default function Card({ children, style, glow = false }) {
  return (
    <View style={[styles.card, shadow.elev1, style]}>
      {glow && <View style={styles.glowBorder} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden' // Important for the glow border to stay within bounds
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.1,
    borderRadius: radius.lg,
  }
});
