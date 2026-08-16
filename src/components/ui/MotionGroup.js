import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Platform, StyleSheet } from 'react-native';
import { motion } from '../../theme/tokens';

/**
 * MotionGroup — staggered entrance for a row/column of cards or list items.
 *
 * Each direct child fades in while rising 12px, with a per-child delay of
 * motion.stagger. On native the animation is skipped (Screen handles it).
 * Use `style` to constrain the wrapper (defaults to a transparent row).
 */
export default function MotionGroup({ children, style, axis = 'row', stagger }) {
  const isWeb = Platform.OS === 'web';
  const count = React.Children.count(children);
  const fades = useRef(
    Array.from({ length: count }, () => new Animated.Value(isWeb ? 0 : 1))
  ).current;
  const rises = useRef(
    Array.from({ length: count }, () => new Animated.Value(isWeb ? 12 : 0))
  ).current;
  const started = useRef(false);

  useEffect(() => {
    if (!isWeb || started.current) return;
    started.current = true;
    const raf = setTimeout(() => {
      children &&
        fades.forEach((f, i) => {
          Animated.parallel([
            Animated.timing(f, {
              toValue: 1,
              duration: motion.pageIn,
              delay: i * (stagger ?? motion.stagger),
              easing: Easing.bezier(0.22, 0.61, 0.36, 1),
              useNativeDriver: true,
            }),
            Animated.timing(rises[i], {
              toValue: 0,
              duration: motion.pageIn,
              delay: i * (stagger ?? motion.stagger),
              easing: Easing.bezier(0.22, 0.61, 0.36, 1),
              useNativeDriver: true,
            }),
          ]).start();
        });
    }, 16);
    return () => clearTimeout(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[isWeb ? styles.wrap : undefined, style]} pointerEvents="box-none">
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        return (
          <Animated.View
            key={child.key ?? i}
            style={{
              opacity: fades[i],
              transform: [{ translateY: rises[i] }],
              overflow: 'hidden',
            }}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
