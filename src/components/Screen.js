import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, motion } from '../theme/tokens';

const BG_IMAGE = require('../assets/images/boun_campus.png');

export default function Screen({
  children,
  scroll = false,
  style,
  contentStyle,
  animate = false,
  noBg = false,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const isPhone = width < 500;
  const fade = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const translate = useRef(new Animated.Value(animate ? 8 : 0)).current;

  // Force a re-render every time this screen comes into focus.
  // Fixes the react-native-screens bug where native stack dismissal
  // leaves the underlying screen's pointerEvents permanently frozen.
  const [, setFocusTick] = useState(0);
  useFocusEffect(useCallback(() => {
    setFocusTick(n => n + 1);
  }, []));

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: motion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: motion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
    ]).start();
  }, [animate, fade, translate]);

  const contentNode = (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.content,
        isWide && styles.contentWide,
        isPhone && styles.contentPhone,
        !scroll && styles.animatedFill,
        { opacity: fade, transform: [{ translateY: translate }] },
        !scroll && contentStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  const scrollNode = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
    >
      {contentNode}
    </ScrollView>
  ) : contentNode;

  if (noBg) {
    return (
      <SafeAreaView style={[styles.safe, style]} pointerEvents="box-none">
        {scrollNode}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Image source={BG_IMAGE} style={styles.bgImageFull} resizeMode="cover" pointerEvents="none" />
      <View style={styles.overlay} pointerEvents="none" />
      <SafeAreaView style={[styles.safeClear, style]} pointerEvents="box-none">
        {scrollNode}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  bgImageFull: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.9 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  safeClear: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: spacing.xxl + 84 },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  contentWide: { maxWidth: 1120, paddingHorizontal: spacing.xl },
  contentPhone: { paddingHorizontal: spacing.sm + 2 },
  animatedFill: { flex: 1 },
});
