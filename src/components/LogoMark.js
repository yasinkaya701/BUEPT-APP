import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { typography } from '../theme/tokens';

export default function LogoMark({ size = 40, label }) {
  const fs = Math.round(size * 0.36);
  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.inner, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 }]}>
        <Text style={[styles.text, { fontSize: fs }]}>{label || 'BÜ'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
