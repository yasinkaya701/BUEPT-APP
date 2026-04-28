import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, useWindowDimensions, View, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, motion, colors } from '../theme/tokens';

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
  const isWeb = Platform.OS === 'web';
  const shouldUseNativeDriver = !isWeb;
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
        useNativeDriver: shouldUseNativeDriver
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: motion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver
      }),
    ]).start();
  }, [animate, fade, translate, shouldUseNativeDriver]);

  const contentNode = (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.content,
        isWide && styles.contentWide,
        isWeb && styles.contentWeb,
        isPhone && styles.contentPhone,
        !scroll && styles.animatedFill,
        { opacity: fade, transform: [{ translateY: translate }] },
        contentStyle,   // always apply — scroll screens use it inside ScrollView contentContainer
      ]}
    >
      {children}
    </Animated.View>
  );

  const scrollNode = scroll ? (
    <ScrollView
      style={styles.scrollWrapper}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[
        styles.scrollContent,
        isWeb && styles.scrollContentWeb,
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      bounces={!isWeb}
      overScrollMode="never"
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
      <View style={[styles.overlay, isWeb && styles.overlayWeb]} pointerEvents="none" />
      <SafeAreaView style={[styles.safeClear, style]} pointerEvents="box-none">
        {scrollNode}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, backgroundColor: colors.bg },
  bgImageFull: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 1.0 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayWeb: { backgroundColor: 'rgba(2,8,23,0.85)' },
  safe: { flex: 1, minHeight: 0, backgroundColor: '#F3F4F6' },
  safeClear: { flex: 1, minHeight: 0, backgroundColor: 'transparent' },

  // The scroll wrapper: flex:1 + minHeight:0 gives ScrollView a fixed height on web.
  // Without minHeight:0, a flex child can grow beyond its parent and collapse the scroll.
  scrollWrapper: {
    flex: 1,
    minHeight: 0,
  },

  // contentContainer inside ScrollView
  scrollContent: { paddingBottom: spacing.xxl + 96, flexGrow: 1 },
  scrollContentWeb: { paddingBottom: 72, flexGrow: 1 },

  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  contentWide: { maxWidth: 1120, paddingHorizontal: spacing.xl },
  contentWeb: { maxWidth: 1280, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  contentPhone: { paddingHorizontal: spacing.sm + 2 },
  animatedFill: { flex: 1, minHeight: 0 },
});
