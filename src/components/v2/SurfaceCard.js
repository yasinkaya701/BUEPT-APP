import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { getV2Theme, v2Radius, v2Shadow, v2Spacing } from '../../theme/v2';
import { useUniversity } from '../../context/UniversityContext';

export default function SurfaceCard({ children, style, onPress, accessibilityLabel }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const base = [
    styles.card,
    { backgroundColor: theme.surface, borderColor: theme.border },
    v2Shadow.card,
    style,
  ];

  if (!onPress) return <View style={base}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: v2Radius.lg,
    padding: v2Spacing.lg,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
});
