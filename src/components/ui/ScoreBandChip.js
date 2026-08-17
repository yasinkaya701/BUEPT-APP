import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
  },
  sizesm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  sizemd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  sizelg: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelsm: {
    fontSize: typography.micro,
  },
  labelmd: {
    fontSize: typography.xsmall,
  },
  labellg: {
    fontSize: typography.small,
  },
}

export const BANDS = {
  EXCELLENT: { label: '90+', color: colors.success, bg: colors.successLight },
  STRONG: { label: '80–89', color: colors.primary, bg: colors.primaryLight },
  GOOD: { label: '70–79', color: '#2563EB', bg: colors.tintBlue },
  BORDERLINE: { label: '60–69', color: colors.accentBright, bg: colors.warningLight },
  BELOW: { label: '<60', color: colors.error, bg: colors.errorLight },
};

export function bandForScore(score, total = 100) {
  if (typeof score !== 'number' || typeof total !== 'number' || total === 0) return BANDS.BELOW;
  const pct = (score / total) * 100;
  if (pct >= 90) return BANDS.EXCELLENT;
  if (pct >= 80) return BANDS.STRONG;
  if (pct >= 70) return BANDS.GOOD;
  if (pct >= 60) return BANDS.BORDERLINE;
  return BANDS.BELOW;
}

export function bandForLetter(letter) {
  switch (String(letter).toUpperCase()) {
    case 'S': return BANDS.EXCELLENT;
    case 'A': return BANDS.STRONG;
    case 'B': return BANDS.GOOD;
    case 'C': return BANDS.BORDERLINE;
    case 'F': return BANDS.BELOW;
    default: return BANDS.BELOW;
  }
}

/**
 * Colored chip reflecting BUSEPT pass/fail score bands.
 */
export default function ScoreBandChip({ score, total = 100, letter, label, size = 'md', style }) {
  const band = letter ? bandForLetter(letter) : bandForScore(score, total);
  const displayLabel = label || band.label;
  return (
    <View style={[styles.chip, styles[`size${size}`], { backgroundColor: band.bg, borderColor: `${band.color}4D` }, style]}>
      <View style={[styles.dot, { backgroundColor: band.color }]} />
      <Text style={[styles.label, styles[`label${size}`], { color: band.color }]}>{displayLabel}</Text>
    </View>
  );
}

);
