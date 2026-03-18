import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { typography, shadow } from '../theme/tokens';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  icon = null,
  iconColor = null,
}) {
  const tone = BUTTON_TONES[variant] || BUTTON_TONES.primary;
  const fallbackIconColor = disabled ? '#9CA3AF' : (iconColor || tone.iconColor);
  const resolvedLeftIcon = iconLeft || (icon ? <Ionicons name={icon} size={14} color={fallbackIconColor} /> : null);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        tone.base,
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {resolvedLeftIcon ? <View style={styles.iconSlotLeft}>{resolvedLeftIcon}</View> : null}
        <Text style={[styles.text, tone.text, disabled && styles.textDisabled, textStyle]} numberOfLines={1}>
          {label}
        </Text>
        {iconRight ? <View style={styles.iconSlotRight}>{iconRight}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    borderWidth: 1.5,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  iconSlotLeft: { marginRight: 1 },
  iconSlotRight: { marginLeft: 1 },
  text: { fontSize: 13, fontFamily: typography.fontHeadline, fontWeight: '700', letterSpacing: 0.1 },
  textDisabled: { color: '#9CA3AF' },

  // ── Blue solid primary ──
  primaryBase: { backgroundColor: '#2563EB', borderColor: '#1D4ED8', ...shadow.sm },
  primaryText: { color: '#FFFFFF' },

  // ── White solid secondary ──
  secondaryBase: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', ...shadow.slight },
  secondaryText: { color: '#111827' },

  // ── Light blue ghost ──
  ghostBase: { backgroundColor: '#EFF6FF', borderColor: 'transparent' },
  ghostText: { color: '#2563EB' },

  // ── Error ──
  errorGhostBase: { backgroundColor: '#FEF2F2', borderColor: 'transparent' },
  errorGhostText: { color: '#DC2626' },
});

const BUTTON_TONES = {
  primary: { base: styles.primaryBase, text: styles.primaryText, textColor: '#FFFFFF', iconColor: '#FFFFFF' },
  secondary: { base: styles.secondaryBase, text: styles.secondaryText, textColor: '#111827', iconColor: '#2563EB' },
  ghost: { base: styles.ghostBase, text: styles.ghostText, textColor: '#2563EB', iconColor: '#2563EB' },
  errorGhost: { base: styles.errorGhostBase, text: styles.errorGhostText, textColor: '#DC2626', iconColor: '#DC2626' },
};
