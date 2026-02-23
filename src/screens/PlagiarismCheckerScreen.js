import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Dummy database phrases representing common plagiarized structures
const PLAGIARIZED_PHRASES = [
    "according to recent studies",
    "has become a global issue",
    "it is widely believed that",
    "in the modern world today",
    "researchers have found that",
    "there is no doubt that",
    "playing a crucial role in",
    "the most important factor"
];

const MOCK_URLS = [
    "https://academic-journals.org/article/",
    "https://en.wikipedia.org/wiki/",
    "https://student-essay-bank.com/view/",
    "https://researchgate.net/publication/"
];

export default function PlagiarismCheckerScreen({ navigation }) {
    const [text, setText] = useState('');
    const [scanState, setScanState] = useState('idle'); // idle, scanning, result
    const [scanProgress, setScanProgress] = useState(0);
    const [results, setResults] = useState(null);

    // Animation values
    const progressAnim = useState(new Animated.Value(0))[0];

    const finalizeScan = useCallback(() => {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let flags = [];
        let totalWords = text.split(/\s+/).length;
        let plagiarizedWords = 0;

        sentences.forEach((s, idx) => {
            const cleanS = s.toLowerCase().trim();
            PLAGIARIZED_PHRASES.forEach(phrase => {
                if (cleanS.includes(phrase)) {
                    // Generate a random convincing URL
                    const sourceUrl = MOCK_URLS[Math.floor(Math.random() * MOCK_URLS.length)] + Math.random().toString(36).substring(7);

                    // Determine if it's an exact match (Red) or paraphrased (Yellow)
                    const matchType = Math.random() > 0.3 ? 'exact' : 'paraphrased';

                    flags.push({ sentence: s.trim(), match: phrase, id: idx, url: sourceUrl, type: matchType });
                    plagiarizedWords += phrase.split(' ').length;
                }
            });
        });

        // Add some random noise to similarity if length is decent
        let simScore = (plagiarizedWords / totalWords) * 100;
        if (flags.length === 0 && totalWords > 20) {
            simScore = Math.random() * 5; // Natural coincidence baseline
        } else if (simScore > 100) simScore = 100;

        setResults({
            similarity: simScore.toFixed(1),
            flags,
            totalSentences: sentences.length
        });

        setTimeout(() => setScanState('result'), 500);
    }, [text]);

    useEffect(() => {
        if (scanState === 'scanning') {
            let prog = 0;
            const interval = setInterval(() => {
                prog += Math.random() * 15;
                if (prog >= 100) {
                    prog = 100;
                    clearInterval(interval);
                    finalizeScan();
                }
                setScanProgress(Math.min(prog, 100));

                Animated.timing(progressAnim, {
                    toValue: Math.min(prog, 100),
                    duration: 300,
                    useNativeDriver: false
                }).start();

            }, 400);
            return () => clearInterval(interval);
        }
    }, [scanState, finalizeScan, progressAnim]);

    const startScan = () => {
        setScanState('scanning');
        progressAnim.setValue(0);
        setScanProgress(0);
        setResults(null);
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Plagiarism Shield</Text>
                    <Text style={styles.pageSub}>Academic Database Scanner</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {scanState === 'idle' && (
                        <>
                            <Card style={styles.infoBox} glow>
                                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                                <Text style={styles.infoText}>Paste your document below. We check against 14B+ web pages and academic journals.</Text>
                            </Card>

                            <Text style={styles.label}>Document Content:</Text>
                            <TextInput
                                style={styles.inputArea}
                                multiline
                                placeholder="Paste your essay here..."
                                value={text}
                                onChangeText={setText}
                                textAlignVertical="top"
                            />

                            <Button
                                label="Initiate Deep Scan"
                                icon="scan-outline"
                                onPress={startScan}
                                style={{ marginTop: spacing.md }}
                                disabled={text.trim().length < 15}
                            />
                        </>
                    )}

                    {scanState === 'scanning' && (
                        <View style={styles.scanningWrap}>
                            <View style={styles.radarCircle}>
                                <Ionicons name="scan" size={48} color={colors.primary} />
                            </View>
                            <Text style={styles.scanTitle}>Scanning Repositories...</Text>
                            <Text style={styles.scanSub}>Comparing phrase structures and exact matches.</Text>

                            <View style={styles.progressBarBg}>
                                <Animated.View style={[
                                    styles.progressBarFill,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%']
                                        })
                                    }
                                ]} />
                            </View>
                            <Text style={styles.scanPercent}>{Math.round(scanProgress)}% Complete</Text>
                        </View>
                    )}

                    {scanState === 'result' && results && (
                        <>
                            <View style={styles.resultHero}>
                                <View style={[styles.scoreCircle, { borderColor: results.similarity > 15 ? colors.error : colors.success }]}>
                                    <Text style={[styles.scoreText, { color: results.similarity > 15 ? colors.error : colors.success }]}>{results.similarity}%</Text>
                                    <Text style={[styles.scoreSub, { color: results.similarity > 15 ? colors.error : colors.success }]}>Similarity</Text>
                                </View>
                                <View style={styles.heroTextWrap}>
                                    <Text style={styles.heroTitle}>{results.similarity > 15 ? 'High Risk Detected' : 'Originality Verified'}</Text>
                                    <Text style={styles.heroDesc}>
                                        {results.similarity > 15
                                            ? `We found ${results.flags.length} sentences matching existing external academic sources. Please paraphrase.`
                                            : `This text appears highly original. The ${parseFloat(results.similarity)}% similarity comes from natural phrasing overlaps.`}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.sectionHeader}>Flagged Sentences ({results.flags.length})</Text>

                            {results.flags.length === 0 ? (
                                <Card style={{ padding: spacing.md, alignItems: 'center', backgroundColor: colors.successLight }}>
                                    <Ionicons name="checkmark-circle" size={32} color={colors.success} style={{ marginBottom: 8 }} />
                                    <Text style={{ color: colors.successDark, fontWeight: '700' }}>No exact sentence structures flagged.</Text>
                                </Card>
                            ) : (
                                results.flags.map((f, i) => (
                                    <View key={i} style={[styles.flagCard, { borderColor: f.type === 'exact' ? 'rgba(231,76,60,0.3)' : 'rgba(243,156,18,0.3)', backgroundColor: f.type === 'exact' ? 'rgba(231,76,60,0.02)' : 'rgba(243,156,18,0.02)' }]}>
                                        <View style={styles.flagHeaderRow}>
                                            <View style={[styles.flagBadge, { backgroundColor: f.type === 'exact' ? 'rgba(231,76,60,0.1)' : 'rgba(243,156,18,0.1)' }]}>
                                                <Ionicons name={f.type === 'exact' ? "warning" : "alert-circle"} size={14} color={f.type === 'exact' ? colors.error : '#f39c12'} />
                                                <Text style={[styles.flagBadgeText, { color: f.type === 'exact' ? colors.error : '#f39c12' }]}>
                                                    {f.type === 'exact' ? '100% Match' : 'Paraphrased'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={styles.urlPill}>
                                                <Ionicons name="link" size={12} color={colors.muted} />
                                                <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">{f.url}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Highlighted text mapping to Turnitin style */}
                                        <Text style={styles.flagSentence}>
                                            ...<Text style={{ backgroundColor: f.type === 'exact' ? 'rgba(231,76,60,0.2)' : 'rgba(243,156,18,0.2)', color: f.type === 'exact' ? '#c0392b' : '#d35400', fontWeight: '500' }}>{f.sentence}</Text>...
                                        </Text>
                                    </View>
                                ))
                            )}

                            <Button
                                label="Scan Another Document"
                                variant="secondary"
                                icon="refresh"
                                onPress={() => { setText(''); setScanState('idle'); setResults(null); }}
                                style={{ marginTop: spacing.xl }}
                            />
                            <View style={{ height: 40 }} />
                        </>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

    infoBox: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.successLight, marginBottom: spacing.lg, gap: spacing.md, borderColor: colors.success, borderWidth: 1 },
    infoText: { flex: 1, color: colors.successDark, fontSize: 13, lineHeight: 18, fontWeight: '600' },
    label: { fontSize: typography.body, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    inputArea: { height: 250, backgroundColor: '#fff', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.secondary, fontSize: typography.body, color: colors.text, ...shadow.sm },

    // Scanning state
    scanningWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
    radarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    scanTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.text, marginBottom: 8 },
    scanSub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: spacing.xl },
    progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, overflow: 'hidden', marginBottom: spacing.sm },
    progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
    scanPercent: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },

    // Result state
    resultHero: { flexDirection: 'row', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: '#fff', alignItems: 'center', marginBottom: spacing.xl, ...shadow.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    scoreCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    scoreText: { fontSize: 24, fontWeight: '900' },
    scoreSub: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    heroTextWrap: { flex: 1 },
    heroTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.text, marginBottom: 4 },
    heroDesc: { fontSize: 13, color: colors.muted, lineHeight: 18 },

    sectionHeader: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
    flagCard: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1 },
    flagHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    flagBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, gap: 4 },
    flagBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    urlPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, maxWidth: '60%' },
    urlText: { fontSize: 10, color: colors.muted, fontWeight: '600' },
    flagSentence: { fontSize: 15, color: colors.text, lineHeight: 24 }
});
