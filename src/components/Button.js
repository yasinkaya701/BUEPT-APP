import React from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { typography, shadow, colors, radius } from '../theme/tokens';

function Button({
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
  const fallbackIconColor = disabled ? '#94A3B8' : (iconColor || tone.iconColor);
  const resolvedLeftIcon = iconLeft || (icon ? <Ionicons name={icon} size={14} color={fallbackIconColor} /> : null);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(255,255,255,0.18)', borderless: false } : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
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

export default React.memo(Button);

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 11,
    flexDirection: 'row',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.45 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  iconSlotLeft: { marginRight: 2 },
  iconSlotRight: { marginLeft: 2 },
  text: { fontSize: 13, fontFamily: typography.fontHeadline, fontWeight: '700', letterSpacing: 0.2 },
  textDisabled: { color: '#94A3B8' },

  // ── Premium Blue solid primary ──
  primaryBase: {
    backgroundColor: '#1D4ED8',
    borderColor: '#172554',
    ...shadow.sm,
  },
  primaryText: { color: '#FFFFFF' },

  // ── Soft blue secondary ──
  secondaryBase: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    ...shadow.slight,
  },
  secondaryText: { color: '#172554' },

  // ── Ghost ──
  ghostBase: {
    backgroundColor: '#F0F5FF',
    borderColor: 'transparent',
  },
  ghostText: { color: '#1D4ED8' },

  // ── Error ──
  errorGhostBase: { backgroundColor: colors.errorLight, borderColor: 'transparent' },
  errorGhostText: { color: colors.error },

  // ── Gold accent ──
  accentBase: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    ...shadow.slight,
  },
  accentText: { color: '#92400E' },

  // ── Success ──
  successBase: {
    backgroundColor: '#059669',
    borderColor: '#065F46',
    ...shadow.sm,
  },
  successText: { color: '#FFFFFF' },
});

const BUTTON_TONES = {
  primary: { base: styles.primaryBase, text: styles.primaryText, textColor: '#FFFFFF', iconColor: '#FFFFFF' },
  secondary: { base: styles.secondaryBase, text: styles.secondaryText, textColor: '#172554', iconColor: '#1D4ED8' },
  ghost: { base: styles.ghostBase, text: styles.ghostText, textColor: '#1D4ED8', iconColor: '#1D4ED8' },
  errorGhost: { base: styles.errorGhostBase, text: styles.errorGhostText, textColor: '#DC2626', iconColor: '#DC2626' },
  accent: { base: styles.accentBase, text: styles.accentText, textColor: '#92400E', iconColor: '#B45309' },
  success: { base: styles.successBase, text: styles.successText, textColor: '#FFFFFF', iconColor: '#FFFFFF' },
};
