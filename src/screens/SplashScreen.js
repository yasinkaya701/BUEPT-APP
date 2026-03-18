import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground } from 'react-native';

const BG_IMAGE = require('../assets/images/boun_splash.png');

export default function SplashScreen({ onFinish }) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Background fades in
      Animated.timing(bgOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      // 2. Logo scales up with spring
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 3. Title slides up
      Animated.parallel([
        Animated.timing(titleY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // 4. Subtitle slides up
      Animated.parallel([
        Animated.timing(subtitleY, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 5. Decorative line expands
      Animated.timing(lineWidth, { toValue: 1, duration: 400, useNativeDriver: false }),
      // 6. Hold
      Animated.delay(1200),
      // 7. Fade out everything
      Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, [bgOpacity, logoScale, logoOpacity, titleY, titleOpacity, subtitleY, subtitleOpacity, lineWidth, fadeOut, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
        </ImageBackground>
      </Animated.View>

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }]}>
          <View style={styles.logoBorder}>
            <View style={styles.logoInner}>
              <Text style={styles.logoLetter}>BÜ</Text>
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleY }],
        }}>
          <Text style={styles.title}>BOĞAZİÇİ</Text>
          <Text style={styles.titleSub}>University English Proficiency</Text>
        </Animated.View>

        {/* Decorative line */}
        <View style={styles.lineContainer}>
          <Animated.View style={[styles.line, {
            width: lineWidth.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
          }]} />
        </View>

        {/* Subtitle */}
        <Animated.View style={{
          opacity: subtitleOpacity,
          transform: [{ translateY: subtitleY }],
        }}>
          <Text style={styles.subtitle}>BUEPT Prep App</Text>
          <Text style={styles.version}>Powered by Boğaziçi University</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#0A1628',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,22,40,0.65)',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoWrap: {
    marginBottom: 28,
  },
  logoBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37,99,235,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoLetter: {
    fontSize: 32,
    fontFamily: 'Avenir Next',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Avenir Next',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
  },
  titleSub: {
    fontSize: 13,
    fontFamily: 'Avenir Next',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  lineContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  line: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Avenir Next',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  version: {
    fontSize: 11,
    fontFamily: 'Avenir Next',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 6,
  },
});
