import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, ImageBackground, Dimensions } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashAnimationScreen({ navigation }) {
    const { userToken, authReady } = useAppState();
    
    // Animation Values
    const bgFadeAnim = useRef(new Animated.Value(0)).current;
    const bgScaleAnim = useRef(new Animated.Value(1.1)).current; // Zoom out effect
    
    const logoScaleAnim = useRef(new Animated.Value(0.3)).current;
    const logoFadeAnim = useRef(new Animated.Value(0)).current;
    
    const textSlideAnim = useRef(new Animated.Value(30)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    const subSlideAnim = useRef(new Animated.Value(20)).current;
    const subFadeAnim = useRef(new Animated.Value(0)).current;

    const timeoutRef = useRef(null);
    const mountedRef = useRef(true);
    const authReadyRef = useRef(authReady);
    const userTokenRef = useRef(userToken);

    useEffect(() => { userTokenRef.current = userToken; }, [userToken]);
    useEffect(() => { authReadyRef.current = authReady; }, [authReady]);

    useEffect(() => {
        if (process.env.JEST_WORKER_ID) {
            return undefined;
        }

        // 1. Background fades in and zooms out slowly
        Animated.parallel([
            Animated.timing(bgFadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(bgScaleAnim, {
                toValue: 1,
                duration: 3500, // Lingers longer for a majestic feel
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();

        // 2. Sequence for the Logo and Text
        const introAnim = Animated.sequence([
            Animated.delay(400), // Wait for bg to become visible
            
            // Logo pops in
            Animated.parallel([
                Animated.timing(logoScaleAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.back(1.7)),
                    useNativeDriver: true,
                }),
                Animated.timing(logoFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]),

            // Main Title slides up
            Animated.parallel([
                Animated.timing(textFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(textSlideAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                })
            ]),

            // Subtitle / Crest slides up
            Animated.parallel([
                Animated.timing(subFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(subSlideAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                })
            ])
        ]);

        introAnim.start(() => {
            if (!mountedRef.current) return;
            
            // Wait on screen for a moment to let user appreciate the photo
            const finishNavigation = () => {
                if (!mountedRef.current) return;
                if (!authReadyRef.current) {
                    timeoutRef.current = setTimeout(finishNavigation, 200);
                    return;
                }
                const dest = userTokenRef.current ? 'MainTabs' : 'Login';
                navigation.reset({
                    index: 0,
                    routes: [{ name: dest }],
                });
            };
            timeoutRef.current = setTimeout(finishNavigation, 1500); // 1.5s freeze at the end
        });

        return () => {
            mountedRef.current = false;
            introAnim.stop();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    return (
        <View style={styles.container}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFadeAnim, transform: [{ scale: bgScaleAnim }] }]}>
                <ImageBackground
                    source={require('../assets/images/real_south_gate.jpg')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.85)']}
                        style={StyleSheet.absoluteFill}
                    />
                </ImageBackground>
            </Animated.View>

            <View style={styles.contentContainer}>
                <Animated.View style={[styles.brandContainer, {
                    opacity: logoFadeAnim,
                    transform: [{ scale: logoScaleAnim }]
                }]}>
                    <View style={styles.glassRing}>
                        <View style={styles.solidCore}>
                            <Animated.Text style={styles.bText}>BÜ</Animated.Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={[
                    styles.textBlock,
                    {
                        opacity: textFadeAnim,
                        transform: [{ translateY: textSlideAnim }],
                    },
                ]}>
                    <Animated.Text style={styles.titleText}>Boğaziçi Prep</Animated.Text>
                </Animated.View>

                <Animated.View style={[
                    styles.subBlock,
                    {
                        opacity: subFadeAnim,
                        transform: [{ translateY: subSlideAnim }],
                    },
                ]}>
                    <View style={styles.subBadge}>
                        <Animated.Text style={styles.subText}>PROFICIENCY STUDIO</Animated.Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark navy fallback
    },
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    glassRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    solidCore: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.primary, // The signature blue
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
    },
    bText: {
        fontSize: 48,
        fontFamily: typography.fontHeadline,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
    },
    textBlock: {
        alignItems: 'center',
    },
    titleText: {
        fontSize: 42,
        fontFamily: typography.fontHeadline,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    subBlock: {
        alignItems: 'center',
        marginTop: 16,
    },
    subBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    subText: {
        fontSize: 14,
        fontFamily: typography.fontHeadline,
        fontWeight: '800',
        color: '#E2E8F0',
        letterSpacing: 4,
    }
});
