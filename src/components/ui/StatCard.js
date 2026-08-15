import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius, shadow } from '../../theme/tokens';

const ACCENT_COLORS = {
  blue: colors.primary,
  teal: colors.teal,
  amber: colors.accentBright,
  purple: '#7C3AED',
  green: colors.success,
  red: colors.error,
  slate: colors.muted,
};

/**
 * Compact metric card with icon tile, big value, label and optional sparkline slot.
 */
export default function StatCard({
  icon = 'stats-chart',
  label = 'Metric',
  value = '—',
  accent = 'blue',
  valueColor,
  onPress,
  sub,
  children,
  style,
}) {
  const body = (
    <View style={[styles.card, style, shadow.elev1]}>
      <View style={[styles.tile, { backgroundColor: `${ACCENT_COLORS[accent] || ACCENT_COLORS.blue}1A` }]}>
        <Ionicons name={icon} size={18} color={ACCENT_COLORS[accent] || ACCENT_COLORS.blue} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor || colors.primaryDark }]}>{value}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        {children}
      </View>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {body}
      </TouchableOpacity>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  label: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    lineHeight: 26,
  },
  sub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
  },
});
