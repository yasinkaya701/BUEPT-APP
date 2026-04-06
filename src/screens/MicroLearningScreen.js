import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { speakEnglish } from '../utils/ttsEnglish';

const MICRO_PACKS = [
    {
        id: 'core',
        label: 'Core Academic',
        subtitle: 'High-frequency academic terms',
        cards: [
            { id: '1', term: 'Ubiquitous', type: 'Adj', def: 'Present or appearing everywhere in a context.', ex: 'Digital platforms are now ubiquitous in university life.', note: 'Useful for reading passages about technology or society.' },
            { id: '2', term: 'Paradigm', type: 'Noun', def: 'A model or pattern that shapes how something is understood.', ex: 'The article describes a new paradigm in language assessment.', note: 'Common in academic reading and presentation tasks.' },
            { id: '3', term: 'Empirical', type: 'Adj', def: 'Based on observation, evidence, or experience rather than theory alone.', ex: 'The report relies on empirical evidence from several case studies.', note: 'High-value word for BUEPT writing and reading.' },
            { id: '4', term: 'Synthesis', type: 'Noun', def: 'A combination of ideas or materials into a unified whole.', ex: 'The conclusion requires a synthesis of the main arguments.', note: 'Strong word for summary and essay tasks.' },
        ],
    },
    {
        id: 'writing',
        label: 'Writing Moves',
        subtitle: 'Terms for essays and feedback',
        cards: [
            { id: '5', term: 'Coherent', type: 'Adj', def: 'Logical, well-organized, and easy to follow.', ex: 'A coherent paragraph guides the reader smoothly.', note: 'Use when discussing organization or paragraph quality.' },
            { id: '6', term: 'Justify', type: 'Verb', def: 'To give clear reasons or evidence in support of something.', ex: 'You must justify the claim with relevant evidence.', note: 'Essential for task response and argumentation.' },
            { id: '7', term: 'Concise', type: 'Adj', def: 'Expressing much information clearly and in few words.', ex: 'A concise thesis statement improves control and clarity.', note: 'Useful in feedback and revision language.' },
            { id: '8', term: 'Evaluate', type: 'Verb', def: 'To judge the value, quality, or significance of something carefully.', ex: 'The prompt asks students to evaluate both advantages and risks.', note: 'Frequent in B2-C1 prompts.' },
        ],
    },
    {
        id: 'seminar',
        label: 'Seminar Talk',
        subtitle: 'Speaking and presentation language',
        cards: [
            { id: '9', term: 'Illustrate', type: 'Verb', def: 'To explain or clarify by using examples.', ex: 'The speaker used a graph to illustrate the trend.', note: 'Useful for presentations and explanation tasks.' },
            { id: '10', term: 'Inference', type: 'Noun', def: 'A conclusion reached from evidence and reasoning.', ex: 'The listener must make an inference from the lecture.', note: 'High-value reading and listening term.' },
            { id: '11', term: 'Heuristic', type: 'Adj', def: 'Helping someone discover or learn by active problem-solving.', ex: 'The instructor used a heuristic method in the discussion.', note: 'Advanced academic vocabulary with strong demo value.' },
            { id: '12', term: 'Dichotomy', type: 'Noun', def: 'A sharp division between two opposing ideas or categories.', ex: 'The article challenges the false dichotomy between theory and practice.', note: 'Good term for higher-level speaking and essay topics.' },
        ],
    },
];

export default function MicroLearningScreen({ navigation }) {
    const [packId, setPackId] = useState(MICRO_PACKS[0].id);
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewIds, setReviewIds] = useState([]);
    const flipAnim = useRef(new Animated.Value(0)).current;

    const currentPack = useMemo(
        () => MICRO_PACKS.find((pack) => pack.id === packId) || MICRO_PACKS[0],
        [packId],
    );
    const currentCard = currentPack.cards[index];
    const progressPct = ((index + 1) / currentPack.cards.length) * 100;
    const reviewedInPack = currentPack.cards.filter((card) => reviewIds.includes(card.id)).length;

    const frontRot = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
    const backRot = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
    const frontAnimatedStyle = { transform: [{ rotateY: frontRot }] };
    const backAnimatedStyle = { transform: [{ rotateY: backRot }] };

    const resetFace = () => {
        flipAnim.setValue(0);
        setIsFlipped(false);
    };

    const flipCard = () => {
        Animated.timing(flipAnim, {
            toValue: isFlipped ? 0 : 180,
            duration: 320,
            useNativeDriver: true,
        }).start(() => setIsFlipped((value) => !value));
    };

    const moveCard = (direction) => {
        resetFace();
        setIndex((value) => {
            const nextValue = value + direction;
            if (nextValue < 0 || nextValue >= currentPack.cards.length) return value;
            return nextValue;
        });
    };

    const switchPack = (nextPackId) => {
        if (nextPackId === packId) return;
        setPackId(nextPackId);
        setIndex(0);
        resetFace();
    };

    const toggleReview = () => {
        setReviewIds((current) => (
            current.includes(currentCard.id)
                ? current.filter((id) => id !== currentCard.id)
                : [...current, currentCard.id]
        ));
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Micro-Learning</Text>
                    <Text style={styles.pageSub}>Flash Session Workspace</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Card style={styles.heroCard}>
                    <View style={styles.heroHead}>
                        <View style={styles.heroCopy}>
                            <Text style={styles.heroEyebrow}>Demo Tool</Text>
                            <Text style={styles.heroTitle}>5-minute vocab sprint</Text>
                            <Text style={styles.heroBody}>
                                Move through curated academic packs, hear each word, and mark weak items for later review without leaving the demo flow.
                            </Text>
                        </View>
                        <View style={styles.heroMetric}>
                            <Text style={styles.heroMetricValue}>{currentPack.cards.length}</Text>
                            <Text style={styles.heroMetricLabel}>Cards</Text>
                        </View>
                    </View>
                    <View style={styles.heroActionRow}>
                        <Button label="Demo Hub" variant="ghost" icon="sparkles-outline" onPress={() => navigation.navigate('DemoFeatures')} />
                        <Button label="Vocab Hub" variant="secondary" icon="grid-outline" onPress={() => navigation.navigate('Vocab', { initialSection: 'Dictionary' })} />
                    </View>
                    <View style={styles.packRow}>
                        {MICRO_PACKS.map((pack) => (
                            <TouchableOpacity
                                key={pack.id}
                                onPress={() => switchPack(pack.id)}
                                style={[styles.packChip, packId === pack.id && styles.packChipActive]}
                            >
                                <Text style={[styles.packChipText, packId === pack.id && styles.packChipTextActive]}>{pack.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Card style={styles.workspaceCard}>
                    <View style={styles.workspaceHead}>
                        <View style={styles.workspaceCopy}>
                            <Text style={styles.workspaceTitle}>{currentPack.label}</Text>
                            <Text style={styles.workspaceBody}>{currentPack.subtitle}</Text>
                        </View>
                        <View style={styles.workspaceMetric}>
                            <Text style={styles.workspaceMetricValue}>{reviewedInPack}</Text>
                            <Text style={styles.workspaceMetricLabel}>Review</Text>
                        </View>
                    </View>
                    <View style={styles.progressRow}>
                        <Text style={styles.progText}>Word {index + 1} of {currentPack.cards.length}</Text>
                        <View style={styles.progBg}>
                            <View style={[styles.progFill, { width: `${progressPct}%` }]} />
                        </View>
                    </View>
                </Card>

                <View style={styles.cardStack}>
                    <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                        <TouchableOpacity style={styles.cardSurface} onPress={flipCard} activeOpacity={0.92}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeText}>{currentCard.type}</Text>
                            </View>
                            <Text style={styles.termText}>{currentCard.term}</Text>
                            <Text style={styles.cardHint}>Tap to reveal definition and usage</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                        <TouchableOpacity style={styles.cardBackSurface} onPress={flipCard} activeOpacity={0.92}>
                            <Text style={styles.defTitle}>Definition</Text>
                            <Text style={styles.defText}>{currentCard.def}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.defTitle}>Academic Example</Text>
                            <Text style={styles.exText}>{currentCard.ex}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.defTitle}>Why it matters</Text>
                            <Text style={styles.noteText}>{currentCard.note}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <Card style={styles.toolRowCard}>
                    <View style={styles.toolRow}>
                        <Button label="Hear Word" variant="secondary" icon="volume-high-outline" onPress={() => speakEnglish(currentCard.term, { rate: 0.46 })} />
                        <Button label={isFlipped ? 'Show Front' : 'Flip Card'} variant="ghost" icon="sync-outline" onPress={flipCard} />
                        <Button
                            label={reviewIds.includes(currentCard.id) ? 'Clear Review' : 'Mark Review'}
                            variant={reviewIds.includes(currentCard.id) ? 'secondary' : 'ghost'}
                            icon="bookmark-outline"
                            onPress={toggleReview}
                        />
                    </View>
                </Card>

                <Card style={styles.sessionNoteCard}>
                    <Text style={styles.sessionTitle}>Session route</Text>
                    <Text style={styles.sessionBody}>
                        Learn the term, hear it once, say it once, then use it in one short academic sentence before moving to the next card.
                    </Text>
                </Card>

                <View style={styles.controlsRow}>
                    <TouchableOpacity style={[styles.navBtn, index === 0 && styles.navBtnDisabled]} onPress={() => moveCard(-1)} disabled={index === 0}>
                        <Ionicons name="chevron-back" size={24} color={index === 0 ? colors.muted : colors.primary} />
                        <Text style={[styles.navText, index === 0 && styles.navTextDisabled]}>Previous</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.navBtn, index === currentPack.cards.length - 1 && styles.navBtnDisabled]} onPress={() => moveCard(1)} disabled={index === currentPack.cards.length - 1}>
                        <Text style={[styles.navText, index === currentPack.cards.length - 1 && styles.navTextDisabled]}>Next</Text>
                        <Ionicons name="chevron-forward" size={24} color={index === currentPack.cards.length - 1 ? colors.muted : colors.primary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

    heroCard: {
        marginBottom: spacing.md,
        backgroundColor: '#172554',
        borderColor: '#172554',
    },
    heroHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    heroCopy: { flex: 1 },
    heroEyebrow: {
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        fontFamily: typography.fontHeadline,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    heroTitle: {
        fontSize: typography.h3,
        color: '#FFFFFF',
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.xs,
    },
    heroBody: {
        fontSize: typography.small,
        color: '#DBEAFE',
        lineHeight: 20,
    },
    heroMetric: {
        minWidth: 86,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    heroMetricValue: {
        fontSize: typography.body,
        color: '#FFFFFF',
        fontFamily: typography.fontHeadline,
    },
    heroMetricLabel: {
        marginTop: 2,
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        textTransform: 'uppercase',
    },
    heroActionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    packRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    packChip: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
    },
    packChipActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    packChipText: {
        fontSize: typography.small,
        color: '#DBEAFE',
        fontFamily: typography.fontHeadline,
    },
    packChipTextActive: {
        color: colors.primaryDark,
    },

    workspaceCard: {
        marginBottom: spacing.md,
        backgroundColor: '#F8FBFF',
        borderColor: '#D7E4FA',
    },
    workspaceHead: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    workspaceCopy: { flex: 1 },
    workspaceTitle: {
        fontSize: typography.body,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
        marginBottom: 4,
    },
    workspaceBody: {
        fontSize: typography.small,
        color: colors.muted,
        lineHeight: 20,
    },
    workspaceMetric: {
        minWidth: 82,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#D7E4FA',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    workspaceMetricValue: {
        fontSize: typography.body,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
    },
    workspaceMetricLabel: {
        marginTop: 2,
        fontSize: typography.xsmall,
        color: colors.muted,
        textTransform: 'uppercase',
    },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    progText: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
    progBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3 },
    progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

    cardStack: {
        height: 360,
        marginBottom: spacing.md,
        perspective: 1200,
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: radius.xl,
        backfaceVisibility: 'hidden',
        ...shadow.md,
    },
    cardFront: {
        zIndex: 2,
        backgroundColor: '#FFFFFF',
    },
    cardBack: {
        zIndex: 1,
        backgroundColor: '#EEF5FF',
        borderWidth: 1,
        borderColor: '#D4E3FD',
    },
    cardSurface: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    cardBackSurface: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    typeBadge: {
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: radius.pill,
        position: 'absolute',
        top: spacing.xl,
    },
    typeText: { fontSize: 15, fontWeight: '900', color: colors.primaryDark, textTransform: 'uppercase' },
    termText: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.text,
        fontFamily: typography.fontHeadline,
        textAlign: 'center',
    },
    cardHint: {
        position: 'absolute',
        bottom: spacing.xl,
        fontSize: 14,
        color: colors.muted,
        fontWeight: '700',
        textAlign: 'center',
    },
    defTitle: { fontSize: 13, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', marginBottom: spacing.xs },
    defText: { fontSize: 18, color: colors.primaryDark, fontWeight: '600', lineHeight: 28 },
    divider: { height: 1, backgroundColor: 'rgba(52, 152, 219, 0.18)', marginVertical: spacing.lg },
    exText: { fontSize: 16, color: colors.text, lineHeight: 24, fontStyle: 'italic' },
    noteText: { fontSize: 14, color: colors.muted, lineHeight: 22 },

    toolRowCard: {
        marginBottom: spacing.md,
    },
    toolRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    sessionNoteCard: {
        marginBottom: spacing.md,
        backgroundColor: '#F8FBFF',
        borderColor: '#D7E4FA',
    },
    sessionTitle: {
        fontSize: typography.body,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.xs,
    },
    sessionBody: {
        fontSize: typography.small,
        color: colors.muted,
        lineHeight: 20,
    },

    controlsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingBottom: spacing.xl },
    navBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        ...shadow.slight,
    },
    navBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
    navText: { fontSize: 16, fontWeight: '800', color: colors.primary, marginHorizontal: 8 },
    navTextDisabled: { color: colors.muted },
});
