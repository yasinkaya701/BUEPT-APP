import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, shadow, colors, radius } from '../theme/tokens';

function Card({ children, style, glow = false, compact = false }) {
  return (
    <View style={[styles.card, compact && styles.compact, glow && styles.glow, style]}>
      <View pointerEvents="none" style={styles.topTint} />
      {children}
    </View>
  );
}

export default React.memo(Card);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  topTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(29,78,216,0.16)',
  },
  compact: {
    padding: spacing.sm + 2,
  },
  glow: {
    ...shadow.glow,
    borderColor: colors.primarySoft,
  },
});
