import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, Easing, Modal } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TRANSITION_WORDS = ['furthermore', 'moreover', 'however', 'therefore', 'consequently', 'nevertheless', 'in addition', 'on the other hand', 'thus', 'subsequently', 'in contrast', 'significantly', 'notably', 'conversely'];
const ACADEMIC_WORDS = ['analyze', 'evaluate', 'synthesize', 'methodology', 'hypothesis', 'empirical', 'theoretical', 'paradigm', 'implication', 'comprehensive', 'validate', 'correlation', 'ambiguous'];
const MOCK_OCR_TEXT = "The proliferation of digital technologies has fundamentally altered the landscape of modern education. Furthermore, the integration of instantaneous communication networks allows students to collaborate across geographic boundaries. Nevertheless, this shift is not without significant drawbacks. A primary concern is the degradation of sustained attention spans, which empirical studies have correlated with heavy social media consumption. In conclusion, while technological paradigms offer comprehensive benefits, educators must critically evaluate their long-term implications on cognitive development.";

export default function EssayEvaluationScreen({ navigation }) {
    const [essay, setEssay] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [result, setResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const laserAnim = useRef(new Animated.Value(0)).current;

    const evaluateEssay = () => {
        setIsEvaluating(true);
        setResult(null);

        // Simulate API delay for UX
        setTimeout(() => {
            const metrics = calculateMetrics(essay);
            setResult(metrics);
            setIsEvaluating(false);
        }, 2500);
    };

    const startCameraScan = () => {
        setIsScanning(true);
        Animated.loop(
            Animated.sequence([
                Animated.timing(laserAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(laserAnim, { toValue: 0, duration: 1500, easing: Easing.linear, useNativeDriver: true })
            ])
        ).start();

        // Simulate OCR ending
        setTimeout(() => {
            setIsScanning(false);
            laserAnim.stopAnimation();
            setEssay(MOCK_OCR_TEXT);
        }, 4000);
    };

    const calculateMetrics = (text) => {
        const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
        const wordCount = words.length;

        let transCount = 0;
        let acadCount = 0;

        TRANSITION_WORDS.forEach(tw => { if (text.toLowerCase().includes(tw)) transCount++; });
        ACADEMIC_WORDS.forEach(aw => { if (text.toLowerCase().includes(aw)) acadCount++; });

        // Heuristic Scoring logic
        let baseScore = Math.min(60 + (wordCount * 0.1), 80); // Length matters
        baseScore += (transCount * 2); // Flow
        baseScore += (acadCount * 1.5); // Lexical

        const finalScore = Math.min(Math.round(baseScore), 100);

        let band = 'B1';
        if (finalScore > 85) band = 'C2';
        else if (finalScore > 75) band = 'C1';
        else if (finalScore > 65) band = 'B2';

        return {
            score: finalScore,
            band: band,
            wordCount,
            transCount,
            acadCount,
            lexical: Math.min(10, 5 + acadCount),
            cohesion: Math.min(10, 4 + transCount * 1.5),
            grammar: Math.min(10, 7 + (wordCount > 150 ? 1 : 0) - (Math.random() * 2)), // slight variance
            task: wordCount > 250 ? 9.0 : (wordCount > 150 ? 7.5 : 5.0)
        };
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>AI Essay Grader</Text>
                    <Text style={styles.pageSub}>Heuristic Evaluation Engine</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {!isEvaluating && !result && (
                        <>
                            <Card style={styles.infoCard}>
                                <Ionicons name="information-circle" size={20} color={colors.primary} />
                                <Text style={styles.infoText}>Paste your essay below or scan a handwritten document. Our engine analyzes lexical resource and cohesive devices.</Text>
                            </Card>

                            <Button
                                label="Scan Handwritten Essay"
                                icon="camera"
                                variant="secondary"
                                style={{ marginBottom: spacing.md, backgroundColor: '#EDF2F7', borderColor: '#E2E8F0' }}
                                textStyle={{ color: colors.primaryDark }}
                                onPress={startCameraScan}
                            />

                            <TextInput
                                style={styles.inputArea}
                                multiline
                                placeholder="Paste your academic text here (Minimum 50 words recommended)..."
                                value={essay}
                                onChangeText={setEssay}
                                textAlignVertical="top"
                            />

                            <View style={styles.footerRow}>
                                <Text style={styles.wordCountBadge}>{essay.split(/\s+/).filter(w => w.length > 0).length} Words</Text>
                                <Button
                                    label="Analyze text"
                                    icon="analytics"
                                    onPress={evaluateEssay}
                                    disabled={essay.trim().length < 20}
                                />
                            </View>
                        </>
                    )}

                    {isScanning && (
                        <Modal visible transparent animationType="fade">
                            <View style={styles.cameraModal}>
                                <View style={styles.cameraViewfinder}>
                                    <Text style={styles.cameraInstruction}>Hold steady over the document...</Text>
                                    <View style={styles.documentTarget}>
                                        <Ionicons name="document-text-outline" size={120} color="rgba(255,255,255,0.2)" />
                                        <Animated.View style={[styles.laserLine, {
                                            transform: [{
                                                translateY: laserAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-150, 150]
                                                })
                                            }]
                                        }]} />
                                    </View>
                                    <Text style={styles.ocrLoadingText}>Extracting text via BUEPT Vision Engine...</Text>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {isEvaluating && (
                        <View style={styles.loadingContainer}>
                            <View style={styles.loaderCircle}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                            <Text style={styles.loadingTitle}>Analyzing Syntax...</Text>
                            <Text style={styles.loadingSub}>Cross-referencing academic lexicons and checking cohesion.</Text>
                        </View>
                    )}

                    {result && !isEvaluating && (
                        <View style={styles.resultsContainer}>
                            <View style={styles.scoreBoard}>
                                <View style={styles.mainScore}>
                                    <Text style={styles.scoreVal}>{result.score}</Text>
                                    <Text style={styles.scoreMax}>/100</Text>
                                </View>
                                <View style={styles.bandBox}>
                                    <Text style={styles.bandTitle}>CEFR Band</Text>
                                    <Text style={styles.bandVal}>{result.band}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Breakdown Metrics</Text>
                            <Card style={styles.metricCard}>
                                <MetricRow label="Task Achievement" val={result.task.toFixed(1)} max="10.0" />
                                <MetricRow label="Coherence & Cohesion" val={result.cohesion.toFixed(1)} max="10.0" />
                                <MetricRow label="Lexical Resource" val={result.lexical.toFixed(1)} max="10.0" />
                                <MetricRow label="Grammar Accuracy" val={result.grammar.toFixed(1)} max="10.0" />
                            </Card>

                            <Text style={styles.sectionTitle}>Engine Findings</Text>
                            <View style={styles.findingsGrid}>
                                <StatBox label="Words" val={result.wordCount} icon="document-text" color="#3498db" />
                                <StatBox label="Transitions" val={result.transCount} icon="git-network" color="#9b59b6" />
                                <StatBox label="Academic Vocab" val={result.acadCount} icon="school" color="#e67e22" />
                            </View>

                            <Card style={styles.feedbackCard} glow>
                                <Text style={styles.feedbackHead}>AI Heuristic Feedback</Text>
                                <Text style={styles.feedbackBody}>
                                    {result.wordCount < 100 ? "Your essay is quite short, limiting task achievement. " : "Good length achieved. "}
                                    {result.transCount < 2 ? "You need to use more transitional devices (however, therefore) to connect your ideas. " : "Excellent use of bridging words. "}
                                    {result.acadCount < 2 ? "Try to elevate your vocabulary with more academic terminology." : "Strong academic phrasing detected."}
                                </Text>
                            </Card>

                            <Button
                                label="Evaluate Another Essay"
                                variant="secondary"
                                icon="refresh"
                                onPress={() => { setResult(null); setEssay(''); }}
                                style={{ marginTop: spacing.xl }}
                            />
                            <View style={{ height: 40 }} />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const MetricRow = ({ label, val, max }) => {
    const percentage = (val / max) * 100;
    const color = percentage >= 80 ? colors.success : (percentage >= 60 ? '#f39c12' : colors.error);

    return (
        <View style={styles.metricRowWrap}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={styles.metricVal}>{val}</Text>
            </View>
            <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

const StatBox = ({ label, val, icon, color }) => (
    <View style={[styles.statBox, { borderColor: color }]}>
        <Ionicons name={icon} size={20} color={color} style={{ marginBottom: 4 }} />
        <Text style={[styles.statVal, { color: color }]}>{val}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.md, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, gap: spacing.sm },
    infoText: { flex: 1, fontSize: 13, color: colors.primaryDark, lineHeight: 18 },
    inputArea: { height: 350, backgroundColor: '#fff', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.secondary, fontSize: typography.body, color: colors.text, ...shadow.sm },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
    wordCountBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, fontSize: 13, fontWeight: '700', color: colors.muted },

    // Loading State
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    loaderCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    loadingTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
    loadingSub: { fontSize: typography.body, color: colors.muted, textAlign: 'center', paddingHorizontal: spacing.xl },

    // Results
    resultsContainer: { paddingTop: spacing.sm },
    scoreBoard: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
    mainScore: { flex: 1, backgroundColor: colors.primaryDark, borderRadius: radius.xl, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', ...shadow.md },
    scoreVal: { fontSize: 48, fontWeight: '900', color: '#fff', lineHeight: 54 },
    scoreMax: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
    bandBox: { width: 120, backgroundColor: colors.accent, borderRadius: radius.xl, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', ...shadow.md },
    bandTitle: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    bandVal: { fontSize: 36, fontWeight: '900', color: '#fff' },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
    metricCard: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.lg },
    metricRowWrap: { marginBottom: spacing.md },
    metricLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
    metricVal: { fontSize: 13, fontWeight: '900', color: colors.primaryDark },
    barBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },

    findingsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
    statBox: { flex: 1, borderWidth: 1, borderRadius: radius.md, backgroundColor: '#fff', padding: spacing.md, alignItems: 'center', justifyContent: 'center' },
    statVal: { fontSize: 24, fontWeight: '900', marginVertical: 4 },
    statLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },

    feedbackCard: { padding: spacing.lg, borderRadius: radius.lg },
    feedbackHead: { fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm, textTransform: 'uppercase' },
    feedbackBody: { fontSize: 15, color: colors.text, lineHeight: 24 },

    // Camera Scan Modal
    cameraModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    cameraViewfinder: { alignItems: 'center', width: '100%' },
    cameraInstruction: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 40 },
    documentTarget: { width: 300, height: 400, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderStyle: 'dashed' },
    laserLine: { position: 'absolute', width: '100%', height: 3, backgroundColor: '#00FF00', shadowColor: '#00FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
    ocrLoadingText: { color: colors.primary, fontSize: 14, fontWeight: '800', marginTop: 40, textTransform: 'uppercase', letterSpacing: 1 }
});
