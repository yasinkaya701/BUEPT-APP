import React from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, radius, typography, shadow } from '../theme/tokens';

export default function Button({
  label,
  onPress,
  variant = 'primary', // primary, secondary, ghost, errorGhost
  disabled = false,
  style,
  textStyle
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isErrorGhost = variant === 'errorGhost';

  // Subtle scale animation on press
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          isPrimary && styles.primary,
          isSecondary && styles.secondary,
          isGhost && styles.ghost,
          isErrorGhost && styles.errorGhost,
          disabled && styles.disabled,
          pressed && !isPrimary && styles.pressed, // Primary animation handled via Animated
          style
        ]}
      >
        <Text style={[
          styles.text,
          isPrimary && styles.textPrimary,
          isSecondary && styles.textSecondary,
          isGhost && styles.textGhost,
          isErrorGhost && styles.textErrorGhost,
          textStyle
        ]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56, // Generous touch target
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    minWidth: 120,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadow.glow, // Beautiful modern glow
  },
  secondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0, // Solid soft bg instead of borders
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  errorGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: colors.primaryDark,
  },
  textGhost: {
    color: colors.primary,
  },
  textErrorGhost: {
    color: colors.error,
  }
});
