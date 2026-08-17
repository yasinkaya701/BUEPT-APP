import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { spacing, shadow, colors, radius } from '../theme/tokens';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  topTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(29,78,216,0.16)',
  },
  compact: {
    padding: spacing.sm + 2,
  },
  glow: {
    ...shadow.glow,
    borderColor: colors.primarySoft,
  },
}

function Card({ children, style, glow = false, compact = false }) {
  const hover = React.useRef(new Animated.Value(0)).current;
  const lift = hover.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const scale = hover.interpolate({ inputRange: [0, 1], outputRange: [1, 1.008] });

  const handleHoverIn = React.useCallback(() => {
    Animated.timing(hover, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [hover]);

  const handleHoverOut = React.useCallback(() => {
    Animated.timing(hover, { toValue: 0, duration: 180, useNativeDriver: true }).start();
  }, [hover]);

  return (
    <Animated.View
      onHoverIn={Platform.OS === 'web' ? handleHoverIn : undefined}
      onHoverOut={Platform.OS === 'web' ? handleHoverOut : undefined}
      style={{ transform: [{ translateY: lift }, { scale }] }}
    >
      <View style={[styles.card, compact && styles.compact, glow && styles.glow, style]}>
        <View pointerEvents="none" style={styles.topTint} />
        {children}
      </View>
    </Animated.View>
  );
}

export default React.memo(Card);

);
