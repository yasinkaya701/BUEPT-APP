import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, motion, colors } from '../theme/tokens';

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, backgroundColor: colors.bg || '#F7FAFF' },
  bgImageFull: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  safe: { flex: 1, minHeight: 0 },
  scrollWrapper: { flex: 1, minHeight: 0 },
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
  contentWeb: { maxWidth: 1280, paddingHorizontal: spacing.lg },
  contentPhone: { paddingHorizontal: spacing.sm + 2 },
  animatedFill: { flex: 1, minHeight: 0 },
});

export default function Screen({
  children,
  scroll = false,
  style,
  contentStyle,
  animate = false,
  noBg = false,
  backgroundImage = null,
  backgroundOverlay = 'rgba(8,23,42,0.58)',
}) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const shouldUseNativeDriver = !isWeb;
  const isWide = width >= 980;
  const isPhone = width < 500;
  const fade = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const translate = useRef(new Animated.Value(animate ? 8 : 0)).current;

  // Keep the existing focus refresh workaround, but make the visual background
  // deterministic: clean canvas by default, campus media only when explicit.
  const [, setFocusTick] = useState(0);
  useFocusEffect(useCallback(() => {
    setFocusTick((n) => n + 1);
  }, []));

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: motion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: motion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start();
  }, [animate, fade, shouldUseNativeDriver, translate]);

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
        contentStyle,
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
      contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      bounces={!isWeb}
      overScrollMode="never"
    >
      {contentNode}
    </ScrollView>
  ) : contentNode;

  const canvasColor = noBg ? (colors.bg || '#F7FAFF') : (colors.bg || '#F7FAFF');

  return (
    <View style={[styles.container, { backgroundColor: canvasColor }]} pointerEvents="box-none">
      {backgroundImage ? (
        <>
          <Image source={backgroundImage} style={styles.bgImageFull} resizeMode="cover" pointerEvents="none" />
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: backgroundOverlay }]}
            pointerEvents="none"
          />
        </>
      ) : null}
      <SafeAreaView
        style={[styles.safe, { backgroundColor: backgroundImage ? 'transparent' : canvasColor }, style]}
        pointerEvents="box-none"
      >
        {scrollNode}
      </SafeAreaView>
    </View>
  );
}
