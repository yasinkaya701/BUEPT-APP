import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  wrap: {
    marginVertical: spacing.xs,
  },
  label: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontHeadline,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 7,
  },
  cellLabel: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
});

/**
 * 3-level confidence selector strip (Unsure / Moderate / Sure)
 * used for marking question confidence during exams.
 */
export default function ConfidenceStrip({ value = 'moderate', onChange, style }) {
  const levels = [
    { key: 'low', label: 'Unsure', icon: 'help-circle-outline', color: colors.error },
    { key: 'moderate', label: 'Maybe', icon: 'remove-circle-outline', color: colors.accentBright },
    { key: 'high', label: 'Sure', icon: 'checkmark-circle-outline', color: colors.success },
  ];
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>Confidence</Text>
      <View style={styles.row}>
        {levels.map((level) => {
          const active = level.key === value;
          return (
            <TouchableOpacity
              key={level.key}
              activeOpacity={0.75}
              onPress={() => onChange && onChange(level.key)}
              style={[
                styles.cell,
                active && { backgroundColor: `${level.color}1A`, borderColor: level.color },
                !active && { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name={level.icon} size={16} color={active ? level.color : colors.muted} />
              <Text style={[styles.cellLabel, active ? { color: level.color } : { color: colors.muted }]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

