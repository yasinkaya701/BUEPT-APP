import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated, Easing, useWindowDimensions } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAiSourceMeta } from '../utils/aiWorkspace';

const TRANSITION_WORDS = ['furthermore', 'moreover', 'however', 'therefore', 'consequently', 'nevertheless', 'in addition', 'on the other hand', 'thus', 'subsequently', 'in contrast', 'significantly', 'notably', 'conversely', 'as a result', 'in particular', 'typically', 'generally', 'to illustrate'];
const ACADEMIC_WORDS = ['analyze', 'evaluate', 'synthesize', 'methodology', 'hypothesis', 'empirical', 'theoretical', 'paradigm', 'implication', 'comprehensive', 'validate', 'correlation', 'ambiguous', 'facilitate', 'perspective', 'framework', 'sustain', 'innovation', 'phenomenon', 'fundamental', 'transform', 'substantial', 'capacity', 'integrate', 'diminish', 'proponent', 'advocate', 'mitigate'];

const BASIC_UPGRADES = {
    good: 'beneficial',
    bad: 'detrimental',
    big: 'substantial',
    small: 'marginal',
    show: 'demonstrate',
    say: 'argue',
    think: 'assert',
    important: 'crucial',
    help: 'facilitate',
    problem: 'challenge',
    change: 'transform',
    idea: 'notion',
    make: 'generate',
    get: 'obtain',
    use: 'utilize'
};

const MOCK_OCR_TEXT = "The proliferation of digital technologies has fundamentally altered the landscape of modern education. Furthermore, the integration of instantaneous communication networks allows students to collaborate across geographic boundaries. Nevertheless, this shift is not without significant drawbacks. A primary concern is the degradation of sustained attention spans, which empirical studies have correlated with heavy social media consumption. In conclusion, while technological paradigms offer comprehensive benefits, educators must critically evaluate their long-term implications on cognitive development.";

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function progressFillStyle(pct, color) {
    return {
        width: `${pct}%`,
        backgroundColor: color,
    };
}

function borderColorStyle(color) {
    return color ? { borderColor: color } : null;
}

function backgroundColorStyle(color) {
    return color ? { backgroundColor: color } : null;
}

function textColorStyle(color) {
    return color ? { color } : null;
}

function tokenize(text = '') {
    return String(text || '').toLowerCase().match(/\b[a-z']+\b/g) || [];
}

function countMatches(text = '', list = []) {
    const lower = String(text || '').toLowerCase();
    return list.reduce((sum, item) => {
        const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return sum + ((lower.match(new RegExp(`\\b${escaped}\\b`, 'g')) || []).length);
    }, 0);
}

function buildEssayMetrics(text = '') {
    const safeText = String(text || '').trim();
    const words = tokenize(safeText);
    const wordCount = words.length;
    const uniqueWordCount = new Set(words).size;
    const sentenceCount = safeText.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length;
    const paragraphCount = safeText.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean).length || (safeText ? 1 : 0);
    const avgSentenceLength = sentenceCount ? Math.round(wordCount / sentenceCount) : 0;
    const transCount = countMatches(safeText, TRANSITION_WORDS);
    const acadCount = countMatches(safeText, ACADEMIC_WORDS);
    const lexicalVariety = wordCount ? Math.round((uniqueWordCount / wordCount) * 100) : 0;
    const passiveCount = (safeText.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
    const hedgeCount = (safeText.match(/\b(may|might|could|appears|seems|likely|tends to|suggests|indicates)\b/gi) || []).length;
    const punctuationErrors = (safeText.match(/\s[,.;:!?]/g) || []).length;
    const repeatedBasicWords = Object.keys(BASIC_UPGRADES).filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(safeText));

    const task = clamp(Math.round(
        (Math.min(wordCount, 260) / 260) * 5 +
        (paragraphCount >= 3 ? 2 : paragraphCount >= 2 ? 1 : 0) +
        (wordCount >= 140 ? 3 : wordCount >= 90 ? 1 : 0)
    ), 0, 10);
    const cohesion = clamp(Math.round(
        (Math.min(transCount, 7) / 7) * 5 +
        (avgSentenceLength >= 12 && avgSentenceLength <= 28 ? 3 : 1) +
        (paragraphCount >= 3 ? 2 : 1)
    ), 0, 10);
    const lexical = clamp(Math.round(
        (Math.min(acadCount, 8) / 8) * 5 +
        (lexicalVariety / 100) * 3 +
        (hedgeCount > 0 ? 1 : 0) +
        (passiveCount > 0 ? 1 : 0)
    ), 0, 10);
    const grammar = clamp(Math.round(
        6 +
        (avgSentenceLength >= 12 ? 2 : (avgSentenceLength >= 8 ? 1 : 0)) +
        (passiveCount > 1 ? 1 : 0) +
        (hedgeCount > 0 ? 1 : 0) -
        Math.min(4, punctuationErrors)
    ), 0, 10);

    const weighted = Math.round((task * 0.28 + cohesion * 0.27 + lexical * 0.25 + grammar * 0.20) * 10);
    const score = clamp(weighted, 0, 100);
    
    // Stricter BUEPT band mapping
    const band = score >= 90 ? 'C2' : score >= 78 ? 'C1' : score >= 65 ? 'B2' : score >= 50 ? 'B1' : 'A2';
    
    const bandColors = {
        C2: '#9333EA', // Purple
        C1: '#4F46E5', // Indigo
        B2: '#059669', // Emerald
        B1: '#D97706', // Amber
        A2: '#DC2626', // Red
    };

    const strengths = [];
    if (wordCount >= 140) strengths.push('Length is fully sufficient for a developed academic response.');
    if (transCount >= 3) strengths.push('Transition signals actively support coherence and argument flow.');
    if (acadCount >= 3) strengths.push('Academic vocabulary level is elevated, enhancing precision.');
    if (lexicalVariety >= 55) strengths.push('Word choice is varied, avoiding redundant phrasing.');
    if (hedgeCount > 0) strengths.push('Effective use of hedging makes your claims academically sound.');
    if (passiveCount > 1) strengths.push('Appropriate use of passive structures creates objective distance.');
    if (!strengths.length) strengths.push('The draft provides a usable base that can be upgraded quickly.');

    const fixes = [];
    if (wordCount < 120) fixes.push('Expand the argument. Add a concrete example or evidence paragraph.');
    if (transCount < 3) fixes.push('Improve cohesion: Insert connectors (however, therefore, furthermore).');
    if (acadCount < 3) fixes.push('Elevate the register: Replace simple verbs with academic alternatives.');
    if (paragraphCount < 3) fixes.push('Structure vertically: Ensure distinct intro, body, and conclusion logic.');
    if (avgSentenceLength < 11) fixes.push('Syntactic variety: Combine shorter clauses into complex sentences.');
    if (!fixes.length) fixes.push('Structural foundation is solid. Next step: Deepen the specificity of thesis.');

    const upgrades = repeatedBasicWords.slice(0, 5).map((word) => ({
        basic: word,
        advanced: BASIC_UPGRADES[word]
    }));

    const summary = `This draft demonstrates a solid ${band} level command of academic English. Its primary strength lies in ${cohesion >= lexical ? 'structural coherence' : 'lexical control'}. To breach the next proficiency band, prioritize ${wordCount < 140 ? 'argument expansion' : transCount < 3 ? 'sophisticated transitions' : 'advanced phrasing'}.`;

    return {
        score,
        band,
        bandColor: bandColors[band] || colors.primaryDark,
        wordCount,
        sentenceCount,
        paragraphCount,
        transCount,
        acadCount,
        lexicalVariety,
        passiveCount,
        hedgeCount,
        lexical,
        cohesion,
        grammar,
        task,
        strengths: strengths.slice(0, 4),
        fixes: fixes.slice(0, 4),
        upgrades,
        summary,
    };
}

const ProgressBar = ({ label, value, max = 10, color }) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <View style={styles.progContainer}>
            <View style={styles.progLabelRow}>
                <Text style={styles.progLabel}>{label}</Text>
                <Text style={[styles.progValue, { color }]}>{value}/{max}</Text>
            </View>
            <View style={styles.progTrack}>
                <View style={[styles.progFill, progressFillStyle(pct, color)]} />
            </View>
        </View>
    );
};

export default function EssayEvaluationScreen({ navigation }) {
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const [essay, setEssay] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [result, setResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    
    // UI Animations
    const laserAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    getAiSourceMeta('local-writing-analysis');

    const evaluateEssay = () => {
        setIsEvaluating(true);
        setResult(null);

        // Spinner pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
            ])
        ).start();

        setTimeout(() => {
            pulseAnim.stopAnimation();
            const metrics = buildEssayMetrics(essay);
            setResult(metrics);
            setIsEvaluating(false);
        }, 1200);
    };

    const startCameraScan = () => {
        setIsScanning(true);
        Animated.loop(
            Animated.sequence([
                Animated.timing(laserAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(laserAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();

        setTimeout(() => {
            setIsScanning(false);
            laserAnim.stopAnimation();
            setEssay(MOCK_OCR_TEXT);
        }, 3000);
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Professional Grader</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={styles.keyboard} enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    
                    {!result && !isEvaluating ? (
                        <View style={styles.inputSection}>
                            <View style={styles.welcomeBanner}>
                                <Ionicons name="sparkles" size={24} color="#6366F1" />
                                <View style={styles.welcomeTextWrap}>
                                    <Text style={styles.welcomeTitle}>BUEPT Essay Analysis</Text>
                                    <Text style={styles.welcomeBody}>
                                        Advanced heuristic engine checking for academic tone, passive voice, lexical variety, cohesion metrics, and structural task response.
                                    </Text>
                                </View>
                            </View>
                            
                            <TextInput
                                style={styles.editorArea}
                                multiline
                                placeholder="Paste your academic text here..."
                                placeholderTextColor="#94A3B8"
                                value={essay}
                                onChangeText={setEssay}
                                textAlignVertical="top"
                            />
                            
                            <View style={styles.editorFooter}>
                                <Text style={styles.wordCount}>{essay.split(/\s+/).filter(w => w.length > 0).length} words</Text>
                                <Button label="Run Analysis" onPress={evaluateEssay} disabled={essay.trim().length < 20} style={styles.analyzeBtn} />
                            </View>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.scanBox} onPress={startCameraScan} disabled={isScanning}>
                                {isScanning ? (
                                    <Animated.View style={[styles.scannerLine, { transform: [{ translateY: laserAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }) }] }]} />
                                ) : (
                                    <Ionicons name="camera-outline" size={32} color={colors.primaryDark} />
                                )}
                                <Text style={styles.scanText}>{isScanning ? 'Extracting text...' : 'Scan Handwritten Essay'}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : isEvaluating ? (
                        <Animated.View style={[styles.loadingSection, { transform: [{ scale: pulseAnim }] }]}>
                            <View style={styles.pulseDisk}>
                                <Ionicons name="analytics" size={64} color="#FFFFFF" />
                            </View>
                            <Text style={styles.loadingTitle}>Analyzing Academic Register...</Text>
                            <Text style={styles.loadingSub}>Checking lexical density and paragraph structures</Text>
                        </Animated.View>
                    ) : (
                        <View style={styles.reportSection}>
                            {/* Mega Score Card */}
                            <Card style={[styles.scoreCard, borderColorStyle(result.bandColor)]}>
                                <View style={styles.scoreRow}>
                                    <View>
                                        <Text style={styles.scoreTitle}>Overall Band</Text>
                                        <Text style={[styles.scoreSummary, { maxWidth: SCREEN_WIDTH - 160 }]} numberOfLines={3}>{result.summary}</Text>
                                    </View>
                                    <View style={[styles.bandBadge, backgroundColorStyle(result.bandColor)]}>
                                        <Text style={styles.bandLetter}>{result.band}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.subScoreGrid}>
                                    <ProgressBar label="Task Response" value={result.task} color={result.bandColor} />
                                    <ProgressBar label="Cohesion" value={result.cohesion} color={result.bandColor} />
                                    <ProgressBar label="Lexical Res." value={result.lexical} color={result.bandColor} />
                                    <ProgressBar label="Grammar Rule" value={result.grammar} color={result.bandColor} />
                                </View>
                            </Card>

                            {/* Stats Highlights */}
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{result.wordCount}</Text>
                                    <Text style={styles.statLab}>Words</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{result.transCount}</Text>
                                    <Text style={styles.statLab}>Connectors</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{result.acadCount}</Text>
                                    <Text style={styles.statLab}>Acad. Words</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{result.lexicalVariety}%</Text>
                                    <Text style={styles.statLab}>Variety</Text>
                                </View>
                            </View>

                            {/* Strengths & Fixes */}
                            <Text style={styles.sectionHeading}>Action Plan</Text>
                            
                            <View style={styles.listContainer}>
                                {result.strengths.map((str, i) => (
                                    <View key={`str-${i}`} style={styles.listItem}>
                                        <View style={[styles.listIconWrap, styles.listIconGood]}>
                                            <Ionicons name="checkmark" size={16} color="#059669" />
                                        </View>
                                        <Text style={styles.listText}>{str}</Text>
                                    </View>
                                ))}
                                {result.fixes.map((fix, i) => (
                                    <View key={`fix-${i}`} style={styles.listItem}>
                                        <View style={[styles.listIconWrap, styles.listIconWarn]}>
                                            <Ionicons name="construct" size={16} color="#D97706" />
                                        </View>
                                        <Text style={styles.listText}>{fix}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Upgrades */}
                            {result.upgrades.length > 0 && (
                                <>
                                    <Text style={styles.sectionHeading}>Vocabulary Upgrades</Text>
                                    <View style={styles.upgradesGrid}>
                                        {result.upgrades.map((u, i) => (
                                            <View key={'upg'+i} style={styles.upgradeBox}>
                                                <Text style={styles.upgradeBasic}>{u.basic}</Text>
                                                <Ionicons name="arrow-forward" size={14} color={colors.muted} />
                                                <Text style={[styles.upgradeAdv, textColorStyle(result.bandColor)]}>{u.advanced}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}

                            <View style={styles.actionRow}>
                                <Button label="Reset" variant="ghost" onPress={() => setResult(null)} style={styles.actionFlexBtn} />
                                <Button label="Open in Lab" onPress={() => navigation.navigate('WritingEditor', { draftText: essay })} style={styles.actionFlexBtn} />
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    iconBtn: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: typography.fontHeadline,
        fontWeight: '800',
        color: '#0F172A',
    },
    keyboard: {
        flex: 1,
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 40,
    },
    // INPUT STATE
    inputSection: {
        marginTop: spacing.md,
    },
    welcomeBanner: {
        backgroundColor: '#EEF2FF',
        padding: spacing.lg,
        borderRadius: 16,
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    welcomeTextWrap: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#3730A3',
        marginBottom: 4,
    },
    welcomeBody: {
        fontSize: 12,
        color: '#4F46E5',
        lineHeight: 18,
    },
    editorArea: {
        minHeight: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: spacing.lg,
        fontSize: 16,
        color: '#1E293B',
        lineHeight: 24,
        ...shadow.sm,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    editorFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    wordCount: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    analyzeBtn: {
        paddingHorizontal: spacing.xl,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: spacing.xl,
    },
    scanBox: {
        height: 100,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        overflow: 'hidden', // for the laser
    },
    scanText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    scannerLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#1D4ED8',
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 6,
    },

    // LOADING STATE
    loadingSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    pulseDisk: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        ...shadow.lg,
        shadowColor: '#6366F1',
    },
    loadingTitle: {
        fontSize: 22,
        fontFamily: typography.fontHeadline,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    loadingSub: {
        fontSize: 15,
        color: '#64748B',
    },

    // REPORT STATE
    reportSection: {
        marginTop: spacing.md,
    },
    scoreCard: {
        padding: spacing.xl,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
        marginBottom: spacing.lg,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    scoreTitle: {
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: 8,
    },
    scoreSummary: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 22,
    },
    bandBadge: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.md,
    },
    bandLetter: {
        fontSize: 32,
        fontFamily: typography.fontHeadline,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subScoreGrid: {
        gap: spacing.md,
    },
    progContainer: {
        width: '100%',
    },
    progLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    progValue: {
        fontSize: 13,
        fontWeight: '800',
    },
    progTrack: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progFill: {
        height: '100%',
        borderRadius: 3,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.xs,
        marginBottom: spacing.xl,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...shadow.sm,
    },
    statVal: {
        fontSize: 20,
        fontFamily: typography.fontHeadline,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 2,
    },
    statLab: {
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: '700',
        color: '#64748B',
    },
    sectionHeading: {
        fontSize: 18,
        fontFamily: typography.fontHeadline,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: spacing.md,
    },
    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: spacing.md,
        gap: spacing.md,
        marginBottom: spacing.xl,
        ...shadow.sm,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    listIconWrap: {
        padding: 4,
        borderRadius: 8,
        marginTop: 2,
    },
    listIconGood: {
        backgroundColor: '#ECFDF5',
    },
    listIconWarn: {
        backgroundColor: '#FFFBEB',
    },
    listText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 22,
    },
    upgradesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    upgradeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...shadow.sm,
    },
    upgradeBasic: {
        fontSize: 13,
        color: '#64748B',
        textDecorationLine: 'line-through',
    },
    upgradeAdv: {
        fontSize: 13,
        fontWeight: '800',
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    actionFlexBtn: {
        flex: 1,
    },
});
