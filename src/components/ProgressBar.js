import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/tokens';

export default function ProgressBar({ value = 0 }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary
  }
});
