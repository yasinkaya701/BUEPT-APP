import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Platform, StyleSheet } from 'react-native';
import { motion } from '../../theme/tokens';

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0, width: '100%' },
  page: { flex: 1, minHeight: 0, width: '100%' },
}

/**
 * PageTransition — premium page entrance for the web app.
 *
 * On web, every top-level page wrapped with this component fades in while
 * rising 14px into place with a soft overshoot easing. Children stay static
 * on native, where the Screen wrapper already handles entrance animation.
 */
export default function PageTransition({ children, delay = 0 }) {
  const isWeb = Platform.OS === 'web';
  const fade = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
  const rise = useRef(new Animated.Value(isWeb ? 14 : 0)).current;
  const scale = useRef(new Animated.Value(isWeb ? 0.99 : 1)).current;
  const started = useRef(false);

  useEffect(() => {
    if (!isWeb || started.current) return;
    started.current = true;
    // Wait one frame so the mounted state is painted before animating.
    const raf = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: motion.pageIn,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: motion.pageIn,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: motion.pageIn,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }, 16);
    return () => clearTimeout(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = {
    opacity: fade,
    transform: [{ translateY: rise }, { scale: scale }],
  };

  if (delay > 0 && isWeb) {
    return (
      <View style={styles.wrap}>
        <Animated.View style={[animStyle, { position: 'absolute', opacity: 0 }]} />
        {children}
      </View>
    );
  }

  if (!isWeb) return <>{children}</>;

  return (
    <Animated.View style={[styles.page, animStyle]} pointerEvents="box-none">
      {children}
    </Animated.View>
  );
}

);
