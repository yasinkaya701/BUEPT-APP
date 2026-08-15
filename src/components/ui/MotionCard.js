import React, { useRef } from 'react';
import { View, Animated, Easing, Platform, StyleSheet, Pressable } from 'react-native';
import { motion, shadow as shadows } from '../../theme/tokens';

/**
 * MotionCard — a card with premium micro-interactions on web.
 *
 * - Entrance: fade + 10px rise (when `entrance` is true, typically via MotionGroup)
 * - Hover: lift 3px, scale 1.012, stronger shadow, eased transition
 * - Press: scale 0.985 with quick ease
 *
 * On native it renders a plain View with the provided style.
 */
export default function MotionCard({
  children,
  style,
  pressable = false,
  onPress,
  lift = true,
  entrance = true,
}) {
  const isWeb = Platform.OS === 'web';
  const hoverRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(isWeb && entrance ? 0.96 : 1)).current;
  const liftAnim = useRef(new Animated.Value(isWeb ? 10 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
  const started = useRef(false);

  React.useEffect(() => {
    if (!isWeb || !entrance || started.current) return;
    started.current = true;
    const raf = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: motion.pageIn,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: motion.pageIn,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: motion.pageIn,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }, 16);
    return () => clearTimeout(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animate = (toValue) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue,
        duration: motion.ultra,
        easing: Easing.bezier(0.22, 0.61, 0.36, 1),
        useNativeDriver: true,
      }),
      lift && isWeb
        ? Animated.timing(liftAnim, {
            toValue: toValue >= 1 ? -3 : 0,
            duration: motion.ultra,
            easing: Easing.bezier(0.22, 0.61, 0.36, 1),
            useNativeDriver: true,
          })
        : null,
    ].filter(Boolean)).start();
  };

  const hoverHandlers = isWeb
    ? {
        onMouseEnter: () => {
          hoverRef.current = true;
          animate(1.012);
        },
        onMouseLeave: () => {
          hoverRef.current = false;
          animate(1);
        },
      }
    : {};

  const pressHandlers = pressable
    ? {
        onPressIn: () => animate(0.985),
        onPressOut: () => animate(hoverRef.current ? 1.012 : 1),
      }
    : {};

  const animStyle = {
    opacity: fadeAnim,
    transform: [
      { scale: scaleAnim },
      { translateY: liftAnim },
    ],
  };

  const inner = (
    <Animated.View style={[styles.base, style, animStyle]} {...hoverHandlers}>
      {children}
    </Animated.View>
  );

  if (!pressable || !onPress) return inner;

  return (
    <Pressable onPress={onPress} style={{ borderRadius: 18 }} {...pressHandlers}>
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    ...shadows.md,
    overflow: 'hidden',
  },
});
