import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../theme/tokens';

export default function LogoMark({ size = 56, label = 'B' }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={styles.bridge} />
      <View style={styles.bridgeSmall} />
      <Text style={[styles.text, { fontSize: Math.round(size * 0.45) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bridge: {
    position: 'absolute',
    top: '28%',
    width: '68%',
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.85
  },
  bridgeSmall: {
    position: 'absolute',
    top: '40%',
    width: '48%',
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.65
  },
  text: {
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline
  }
});
