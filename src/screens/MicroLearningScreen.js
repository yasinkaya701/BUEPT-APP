import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FLASHCARDS = [
    { id: '1', term: 'Ubiquitous', type: 'Adj', def: 'Present, appearing, or found everywhere.', ex: 'His ubiquitous influence was felt by all.' },
    { id: '2', term: 'Heuristic', type: 'Adj', def: 'Enabling a person to discover or learn something for themselves.', ex: 'A heuristic method of teaching.' },
    { id: '3', term: 'Dichotomy', type: 'Noun', def: 'A division or contrast between two things that are opposed.', ex: 'A rigid dichotomy between science and mysticism.' },
    { id: '4', term: 'Paradigm', type: 'Noun', def: 'A typical example or pattern of something; a model.', ex: 'There is a new paradigm for public art in this country.' }
];

export default function MicroLearningScreen({ navigation }) {
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnim = useRef(new Animated.Value(0)).current;

    const flipCard = () => {
        if (isFlipped) {
            Animated.timing(flipAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setIsFlipped(false));
        } else {
            Animated.timing(flipAnim, { toValue: 180, duration: 400, useNativeDriver: true }).start(() => setIsFlipped(true));
        }
    };

    const nextCard = () => {
        if (isFlipped) {
            // Reset to front instantly, then change index
            flipAnim.setValue(0);
            setIsFlipped(false);
        }
        if (index < FLASHCARDS.length - 1) setIndex(index + 1);
    };

    const prevCard = () => {
        if (isFlipped) {
            flipAnim.setValue(0);
            setIsFlipped(false);
        }
        if (index > 0) setIndex(index - 1);
    };

    const frontRot = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
    const backRot = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

    const currentData = FLASHCARDS[index];

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Micro-Learning</Text>
                    <Text style={styles.pageSub}>Daily 5-Min Vocabulary</Text>
                </View>
            </View>

            <View style={styles.progressRow}>
                <Text style={styles.progText}>Word {index + 1} of {FLASHCARDS.length}</Text>
                <View style={styles.progBg}>
                    <View style={[styles.progFill, { width: `${((index + 1) / FLASHCARDS.length) * 100}%` }]} />
                </View>
            </View>

            <View style={styles.cardContainer}>
                {/* Front */}
                <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRot }] }]}>
                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={flipCard} activeOpacity={0.9}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>{currentData.type}</Text>
                        </View>
                        <Text style={styles.termText}>{currentData.term}</Text>
                        <Text style={styles.tapHint}>Tap to flip</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Back */}
                <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRot }] }]}>
                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }} onPress={flipCard} activeOpacity={0.9}>
                        <Text style={styles.defTitle}>Definition</Text>
                        <Text style={styles.defText}>{currentData.def}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.defTitle}>Example Series</Text>
                        <Text style={styles.exText}>"{currentData.ex}"</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity style={[styles.navBtn, index === 0 && styles.navBtnDisabled]} onPress={prevCard} disabled={index === 0}>
                    <Ionicons name="chevron-back" size={24} color={index === 0 ? colors.muted : colors.primary} />
                    <Text style={[styles.navText, index === 0 && { color: colors.muted }]}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navBtn, index === FLASHCARDS.length - 1 && styles.navBtnDisabled]} onPress={nextCard} disabled={index === FLASHCARDS.length - 1}>
                    <Text style={[styles.navText, index === FLASHCARDS.length - 1 && { color: colors.muted }]}>Next</Text>
                    <Ionicons name="chevron-forward" size={24} color={index === FLASHCARDS.length - 1 ? colors.muted : colors.primary} />
                </TouchableOpacity>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xl, gap: spacing.md },
    progText: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
    progBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3 },
    progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

    cardContainer: { flex: 1, marginHorizontal: spacing.xl, marginBottom: spacing.xl, perspective: 1000 },
    card: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: radius.xl, ...shadow.md, backfaceVisibility: 'hidden' },
    cardFront: { zIndex: 2 },
    cardBack: { zIndex: 1, backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary },

    typeBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.pill, position: 'absolute', top: spacing.xl },
    typeText: { fontSize: 15, fontWeight: '900', color: colors.primaryDark, textTransform: 'uppercase' },
    termText: { fontSize: 44, fontWeight: '900', color: colors.text, fontFamily: typography.fontHeadline },
    tapHint: { position: 'absolute', bottom: spacing.xl, fontSize: 14, color: colors.muted, fontWeight: '700' },

    defTitle: { fontSize: 13, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', marginBottom: spacing.xs },
    defText: { fontSize: 18, color: colors.primaryDark, fontWeight: '600', lineHeight: 28 },
    divider: { height: 2, backgroundColor: 'rgba(52, 152, 219, 0.2)', marginVertical: spacing.lg },
    exText: { fontSize: 16, color: colors.text, fontStyle: 'italic', lineHeight: 24, opacity: 0.8 },

    controlsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    navBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill, ...shadow.slight },
    navBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
    navText: { fontSize: 16, fontWeight: '800', color: colors.primary, marginHorizontal: 8 }
});
