import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getV2Theme, v2Typography } from '../../theme/v2';
import { useUniversity } from '../../context/UniversityContext';

export default function ReadinessRing({ value = 0, size = 132, label = 'Readiness' }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (safe / 100);

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: safe }}
      accessibilityLabel={label}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.primarySoft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.interactive}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.value, { color: theme.text }]}>{safe}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>/ 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: v2Typography.h1, fontWeight: '900', lineHeight: 36 },
  label: { fontSize: 12, fontWeight: '700' },
});
