import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  wrap: {
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
  },
  headerRatio: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  track: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
    backgroundColor: colors.surfaceAlt,
  },
  segment: {
    flexDirection: 'row',
    paddingRight: 2,
  },
  segmentTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  segmentFill: {
    height: 10,
    borderRadius: 5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: typography.micro,
    color: colors.muted,
  },
  legendCount: {
    fontSize: typography.micro,
    color: colors.textSecondary,
    fontFamily: typography.fontHeadline,
  },
}

/**
 * Stacked keyword usage density bar for writing practice.
 * segments: [{ key, label, used, total, color }]
 */
export default function KeywordDensityBar({ segments = [], label, style }) {
  const grandTotal = segments.reduce((sum, s) => sum + (s.total || 0), 0);
  const grandUsed = segments.reduce((sum, s) => sum + (s.used || 0), 0);
  const ratio = grandTotal > 0 ? grandUsed / grandTotal : 0;

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <View style={styles.header}>
          <Text style={styles.headerLabel}>{label}</Text>
          <Text style={styles.headerRatio}>{Math.round(ratio * 100)}% coverage</Text>
        </View>
      ) : null}
      <View style={styles.track}>
        {segments.map((segment) => {
          const segmentTotal = segment.total || 0;
          const segmentUsed = segment.used || 0;
          const widthPct = grandTotal > 0 ? (segmentTotal / grandTotal) * 100 : 0;
          const fillPct = segmentTotal > 0 ? (segmentUsed / segmentTotal) * 100 : 0;
          return (
            <View key={segment.key} style={[styles.segment, { width: `${Math.max(0, widthPct)}%` }]}>
              <View style={[styles.segmentTrack, { backgroundColor: `${segment.color || colors.primary}26` }]}>
                <View style={[styles.segmentFill, { width: `${Math.min(100, fillPct)}%`, backgroundColor: segment.color || colors.primary }]} />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: segment.color || colors.primary }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendCount}>{segment.used || 0}/{segment.total || 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

);
