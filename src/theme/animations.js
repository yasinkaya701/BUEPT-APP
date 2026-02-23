/**
 * animations.js — Reusable animated view wrappers
 */
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

/** Fades in children on mount */
export function FadeInView({ style, delay = 0, duration = 350, children }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        }).start();
    }, [anim, delay, duration]);
    return (
        <Animated.View style={[style, { opacity: anim }]}>
            {children}
        </Animated.View>
    );
}

/** Slides up + fades in on mount */
export function SlideUpView({ style, delay = 0, distance = 24, duration = 380, children }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(distance)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration, delay, useNativeDriver: true }),
        ]).start();
    }, [delay, duration, opacity, translateY]);
    return (
        <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
}

/** Scales down on press, back up on release — wrap any pressable */
export function SpringPress({ style, onPress, children, disabled = false }) {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
    };
    const onPressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
    };

    return (
        <TouchableOpacity
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={1}
        >
            <Animated.View style={[style, { transform: [{ scale }] }]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
}

/** Pulsing glow — use for "playing" indicators */
export function PulseView({ style, children }) {
    const scale = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.04, duration: 700, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [scale]);
    return (
        <Animated.View style={[style, { transform: [{ scale }] }]}>
            {children}
        </Animated.View>
    );
}

/** Staggered list entrance — wrap a FlatList/ScrollView item */
export function StaggerItem({ index, style, children }) {
    return (
        <SlideUpView delay={index * 60} duration={320} distance={18} style={style}>
            {children}
        </SlideUpView>
    );
}
