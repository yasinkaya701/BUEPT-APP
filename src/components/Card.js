import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, shadow } from '../theme/tokens';

export default function Card({ children, style, glow = false, compact = false }) {
  return (
    <View style={[styles.card, compact && styles.compact, glow && shadow.md, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  compact: {
    padding: spacing.sm + 2,
  },
});
