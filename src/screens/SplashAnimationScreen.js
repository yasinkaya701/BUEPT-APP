import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function SplashAnimationScreen({ navigation }) {
    const { userToken } = useAppState();
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const timeoutRef = useRef(null);
    const mountedRef = useRef(true);

    const userTokenRef = useRef(userToken);
    useEffect(() => { userTokenRef.current = userToken; }, [userToken]);

    useEffect(() => {
        if (process.env.JEST_WORKER_ID) {
            return undefined;
        }
        const introAnim = Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
        ]);
        introAnim.start(() => {
            if (!mountedRef.current) return;
            // Wait a little before navigating away
            timeoutRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                const dest = userTokenRef.current ? 'MainTabs' : 'Login';
                navigation.reset({
                    index: 0,
                    routes: [{ name: dest }],
                });
            }, 800);
        });
        return () => {
            mountedRef.current = false;
            introAnim.stop();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run animation ONCE — read token via ref at callback time

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
            }]}>
                <View style={styles.bCircle}>
                    <Animated.Text style={styles.bText}>B</Animated.Text>
                </View>
                <Animated.Text style={styles.titleText}>Boğaziçi Prep</Animated.Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    bCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    bText: {
        fontSize: 50,
        fontFamily: typography.fontHeadline,
        color: '#FFFFFF',
    },
    titleText: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        letterSpacing: 1,
    }
});
