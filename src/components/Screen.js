import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';

export default function Screen({ children, scroll = false, style, contentStyle, animate = true }) {
  const fade = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const translate = useRef(new Animated.Value(animate ? 8 : 0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 260, useNativeDriver: true })
    ]).start();
  }, [animate, fade, translate]);

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]}>
        <ScrollView contentContainerStyle={[styles.content, contentStyle]}>
          <Animated.View style={[styles.animated, { opacity: fade, transform: [{ translateY: translate }] }]}>
            {children}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <Animated.View style={[styles.content, styles.animated, contentStyle, { opacity: fade, transform: [{ translateY: translate }] }]}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    padding: spacing.xl
  },
  animated: {
    flex: 1
  }
});
