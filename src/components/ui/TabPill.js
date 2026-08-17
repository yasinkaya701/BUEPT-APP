import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../../theme/tokens';

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  pillActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillLabel: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.small,
  },
  pillLabelActive: {
    color: '#FFFFFF',
  },
  pillLabelInactive: {
    color: colors.muted,
  },
  badge: {
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  badgeInactive: {
    backgroundColor: colors.surfaceAlt,
  },
  badgeText: {
    fontSize: typography.micro,
    fontFamily: typography.fontHeadline,
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  badgeTextInactive: {
    color: colors.muted,
  },
}

/**
 * Segmented tab control.
 * options: [{ key, label, badge? }]
 */
export default function TabPill({ options = [], activeKey, onPress, style }) {
  return (
    <View style={[styles.group, style, shadow.elev1]}>
      {options.map((option) => {
        const active = option.key === activeKey;
        return (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.75}
            onPress={() => onPress && onPress(option.key)}
            style={[
              styles.pill,
              active && styles.pillActive,
              !active && { backgroundColor: 'transparent' },
            ]}
          >
            <Text style={[styles.pillLabel, active && styles.pillLabelActive, !active && styles.pillLabelInactive]}>
              {option.label}
            </Text>
            {option.badge ? (
              <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{option.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

);
