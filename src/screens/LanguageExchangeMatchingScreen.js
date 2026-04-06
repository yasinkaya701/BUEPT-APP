import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, useWindowDimensions } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';


const MATCHES = [
    { id: '1', name: 'Laura', from: 'Spain', faculty: 'Architecture', fluent: 'Spanish', learning: 'Turkish', avatar: '🇪🇸', bio: "Looking to practice Turkish for my exchange semester." },
    { id: '2', name: 'Chen', from: 'China', faculty: 'Engineering', fluent: 'Mandarin', learning: 'English', avatar: '🇨🇳', bio: "Need help with academic English pronunciation." },
    { id: '3', name: 'Hans', from: 'Germany', faculty: 'Business', fluent: 'German', learning: 'Turkish', avatar: '🇩🇪', bio: "Happy to help with German while learning Turkish slang." },
    { id: '4', name: 'Emma', from: 'UK', faculty: 'Literature', fluent: 'English', learning: 'Turkish', avatar: '🇬🇧', bio: "Let's grab a coffee and exchange languages!" }
];

export default function LanguageExchangeMatchingScreen({ navigation }) {
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);

    const position = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 120) {
                    forceSwipe('right');
                } else if (gestureState.dx < -120) {
                    forceSwipe('left');
                } else {
                    resetPosition();
                }
            }
        })
    ).current;

    const forceSwipe = (dir) => {
        Animated.timing(position, {
            toValue: { x: dir === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100, y: dir === 'up' ? -500 : 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => nextCard());
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false
        }).start();
    };

    const nextCard = () => {
        setCurrentIndex(prev => prev + 1);
        position.setValue({ x: 0, y: 0 });
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ['-10deg', '0deg', '10deg'],
            extrapolate: 'clamp'
        });

        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        };
    };

    const renderCards = () => {
        if (currentIndex >= MATCHES.length) {
            return (
                <View style={styles.noMoreCards}>
                    <Ionicons name="sad-outline" size={64} color={colors.secondary} />
                    <Text style={styles.noMoreTitle}>No More Profiles</Text>
                    <Text style={styles.noMoreDesc}>We've run out of international students matching your preferences today.</Text>
                    <TouchableOpacity style={styles.refreshBtn} onPress={() => setCurrentIndex(0)}>
                        <Text style={styles.btnText}>Refresh Pool</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return MATCHES.map((item, i) => {
            if (i < currentIndex) return null;
            if (i === currentIndex) {
                return (
                    <Animated.View
                        key={item.id}
                        {...panResponder.panHandlers}
                        style={[getCardStyle(), styles.cardStackItem, { width: SCREEN_WIDTH - 40 }]}
                    >
                        <MatchCard item={item} />
                    </Animated.View>
                );
            }

            return (
                <Animated.View
                    key={item.id}
                    style={[styles.cardStackItem, { width: SCREEN_WIDTH - 40, top: 10 * (i - currentIndex), zIndex: -i, opacity: 1 - (i - currentIndex) * 0.2, transform: [{ scale: 1 - 0.05 * (i - currentIndex) }] }]}
                >
                    <MatchCard item={item} />
                </Animated.View>
            );
        }).reverse();
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Match & Speak</Text>
                    <Text style={styles.pageSub}>Swipe to Connect</Text>
                </View>
            </View>

            <View style={styles.cardContainer}>
                {renderCards()}
            </View>

            {currentIndex < MATCHES.length && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnError]} onPress={() => forceSwipe('left')}>
                        <Ionicons name="close" size={32} color={colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnAccent]} onPress={() => forceSwipe('up')}>
                        <Ionicons name="star" size={28} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSuccess]} onPress={() => forceSwipe('right')}>
                        <Ionicons name="heart" size={32} color={colors.success} />
                    </TouchableOpacity>
                </View>
            )}
        </Screen>
    );
}

const MatchCard = ({ item }) => (
    <Card style={styles.matchCard}>
        <View style={styles.heroWrap}>
            <View style={styles.avatarWrap}>
                <Text style={styles.emojiText}>{item.avatar}</Text>
            </View>
            <Text style={styles.nameText}>{item.name}, 20</Text>
            <Text style={styles.facultyText}>{item.faculty} Student</Text>
            <View style={styles.badgeLine}>
                <Ionicons name="location" size={12} color={colors.text} />
                <Text style={styles.badgeText}>{item.from}</Text>
            </View>
        </View>

        <View style={styles.langsBox}>
            <View style={styles.langItem}>
                <Text style={styles.langLabel}>Fluent In</Text>
                <Text style={styles.langValue}>{item.fluent}</Text>
            </View>
            <View style={styles.langDivider} />
            <View style={styles.langItem}>
                <Text style={styles.langLabel}>Learning</Text>
                <Text style={styles.langValue}>{item.learning}</Text>
            </View>
        </View>

        <View style={styles.bioBox}>
            <Text style={styles.bioHead}>About Me</Text>
            <Text style={styles.bioText}>"{item.bio}"</Text>
        </View>
    </Card>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl, zIndex: 100 },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cardStackItem: { position: 'absolute', height: 450 },

    matchCard: { padding: 0, overflow: 'hidden', height: '100%', backgroundColor: '#fff', borderRadius: radius.xl, ...shadow.lg },
    heroWrap: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.primarySoft, borderBottomColor: 'rgba(0,0,0,0.05)', borderBottomWidth: 1 },
    avatarWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, ...shadow.sm },
    emojiText: { fontSize: 48 },
    nameText: { fontSize: 28, fontFamily: typography.fontHeadline, fontWeight: '900', color: colors.primaryDark, marginBottom: 4 },
    facultyText: { fontSize: 16, color: colors.primary, fontWeight: '700', marginBottom: 8 },
    badgeLine: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    badgeText: { fontSize: 12, fontWeight: '800', color: colors.text, textTransform: 'uppercase' },

    langsBox: { flexDirection: 'row', padding: spacing.lg, borderBottomColor: 'rgba(0,0,0,0.05)', borderBottomWidth: 1 },
    langItem: { flex: 1, alignItems: 'center' },
    langLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
    langValue: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, textAlign: 'center' },

    bioBox: { padding: spacing.lg, flex: 1, justifyContent: 'center' },
    bioHead: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
    bioText: { fontSize: 15, color: colors.muted, fontStyle: 'italic', lineHeight: 22 },

    actionRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingBottom: spacing.xxl, paddingTop: spacing.md },
    actionBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, ...shadow.slight },
    actionBtnError: { borderColor: colors.error },
    actionBtnSuccess: { borderColor: colors.success },
    actionBtnAccent: { borderColor: colors.accent, width: 60, height: 60, borderRadius: 30 },

    langDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.1)', height: 30 },

    noMoreCards: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    noMoreTitle: { fontSize: typography.h2, fontWeight: '800', color: colors.primary, marginVertical: spacing.sm },
    noMoreDesc: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
    refreshBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
