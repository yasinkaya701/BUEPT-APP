import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const ICON_COLORS = {
  blue: colors.primary,
  teal: colors.teal,
  amber: colors.accentBright,
  green: colors.success,
  red: colors.error,
  slate: colors.muted,
};

/**
 * Icon-led empty state with title, description and optional action button slot.
 */
export default function EmptyState({
  icon = 'document-text-outline',
  title = 'Nothing here yet',
  description,
  accent = 'blue',
  children,
  style,
}) {
  return (
    <View style={[styles.box, style]}>
      <View style={[styles.tile, { backgroundColor: `${ICON_COLORS[accent] || ICON_COLORS.blue}14` }]}>
        <Ionicons name={icon} size={24} color={ICON_COLORS[accent] || ICON_COLORS.blue} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.small,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
});
