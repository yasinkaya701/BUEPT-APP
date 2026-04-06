import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RISK_PHRASES = [
    'according to recent studies',
    'has become a global issue',
    'it is widely believed that',
    'researchers have found that',
    'there is no doubt that',
    'playing a crucial role in',
    'the most important factor',
];

const SOURCE_BANK = [
    'https://academic-journals.org/article/',
    'https://researchgate.net/publication/',
    'https://library-index.edu/source/',
    'https://student-essay-bank.com/view/',
];

const SAMPLE_DOCUMENTS = [
    {
        id: 'risk',
        label: 'High-risk sample',
        text: 'According to recent studies, social media has become a global issue for university students. There is no doubt that it is widely believed that digital platforms are playing a crucial role in academic life. Researchers have found that the most important factor is access to fast online communication.',
    },
    {
        id: 'clean',
        label: 'Safer sample',
        text: 'Many university students use digital platforms to coordinate group work, but the academic value of these tools depends on how deliberately they are used. When tasks require reflection, evidence, and citation, technology can support learning rather than replace it.',
    },
];

function sentenceSplit(text = '') {
    return String(text || '')
        .split(/(?<=[.!?])\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function buildSourceUrl(index = 0) {
    const prefix = SOURCE_BANK[index % SOURCE_BANK.length];
    return `${prefix}${String(index + 1).padStart(4, '0')}`;
}

function analyzeDocument(text = '') {
    const cleanText = String(text || '').trim();
    const sentences = sentenceSplit(cleanText);
    const totalWords = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

    const flags = [];
    let matchedWordCount = 0;
    let citationRiskCount = 0;

    sentences.forEach((sentence, sentenceIndex) => {
        const lowerSentence = sentence.toLowerCase();
        RISK_PHRASES.forEach((phrase, phraseIndex) => {
            if (lowerSentence.includes(phrase)) {
                const matchWords = phrase.split(/\s+/).length;
                matchedWordCount += matchWords;
                flags.push({
                    id: `${sentenceIndex}-${phraseIndex}`,
                    sentence,
                    match: phrase,
                    url: buildSourceUrl(sentenceIndex + phraseIndex),
                    type: 'exact',
                });
            }
        });

        const looksCited = /\(|\)|\[|\]|et al\.|doi|202\d|19\d\d/.test(sentence);
        const claimsSource = /(according to|research|stud(y|ies)|report|article|survey|paper)/i.test(sentence);
        if (claimsSource && !looksCited) {
            citationRiskCount += 1;
            flags.push({
                id: `citation-${sentenceIndex}`,
                sentence,
                match: 'Citation signal without attribution',
                url: 'Add source attribution or rewrite with your own evidence trail.',
                type: 'citation',
            });
        }
    });

    const phraseSimilarity = totalWords ? (matchedWordCount / totalWords) * 100 : 0;
    const citationPenalty = citationRiskCount * 4;
    const similarity = Math.min(100, Math.round((phraseSimilarity + citationPenalty) * 10) / 10);
    const originality = Math.max(0, Math.round((100 - similarity) * 10) / 10);
    const flaggedSentences = new Set(flags.map((item) => item.sentence)).size;

    let riskBand = 'Low risk';
    if (similarity >= 20) riskBand = 'High risk';
    else if (similarity >= 10) riskBand = 'Medium risk';

    return {
        similarity,
        originality,
        riskBand,
        flags,
        totalSentences: sentences.length,
        totalWords,
        flaggedSentences,
        citationRiskCount,
    };
}

export default function PlagiarismCheckerScreen({ navigation }) {
    const [text, setText] = useState('');
    const [scanState, setScanState] = useState('idle');
    const [scanProgress, setScanProgress] = useState(0);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (scanState !== 'scanning') return undefined;
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setScanProgress(progress);
                setResults(analyzeDocument(text));
                setScanState('result');
                return;
            }
            setScanProgress(progress);
        }, 220);
        return () => clearInterval(interval);
    }, [scanState, text]);

    const samplePreview = useMemo(
        () => analyzeDocument(SAMPLE_DOCUMENTS[0].text),
        [],
    );

    const startScan = () => {
        setResults(null);
        setScanProgress(0);
        setScanState('scanning');
    };

    const loadSample = (sampleText) => {
        setText(sampleText);
        setResults(null);
        setScanState('idle');
        setScanProgress(0);
    };

    const progressStyle = { width: `${scanProgress}%` };
    const riskTone = results?.similarity > 15 ? 'high' : results?.similarity >= 10 ? 'medium' : 'low';
    const scoreCircleStyle = riskTone === 'high' ? styles.scoreCircleHigh : riskTone === 'medium' ? styles.scoreCircleMedium : styles.scoreCircleLow;
    const scoreTextStyle = riskTone === 'high' ? styles.scoreTextHigh : riskTone === 'medium' ? styles.scoreTextMedium : styles.scoreTextLow;

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Plagiarism Shield</Text>
                    <Text style={styles.pageSub}>Integrity Review Workspace</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={styles.keyboard} enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Card style={styles.heroCard}>
                        <View style={styles.heroHead}>
                            <View style={styles.heroCopy}>
                                <Text style={styles.heroEyebrow}>Demo Tool</Text>
                                <Text style={styles.heroTitle}>Similarity triage</Text>
                                <Text style={styles.heroBody}>
                                    Run a deterministic local integrity scan, inspect flagged sentences, and jump directly into revision when the draft needs repair.
                                </Text>
                            </View>
                            <View style={styles.heroMetric}>
                                <Text style={styles.heroMetricValue}>{samplePreview.similarity}%</Text>
                                <Text style={styles.heroMetricLabel}>Sample risk</Text>
                            </View>
                        </View>
                        <View style={styles.heroActionRow}>
                            <Button label="Use High-risk Sample" variant="ghost" icon="document-text-outline" onPress={() => loadSample(SAMPLE_DOCUMENTS[0].text)} />
                            <Button label="Demo Hub" variant="secondary" icon="sparkles-outline" onPress={() => navigation.navigate('DemoFeatures')} />
                        </View>
                        <View style={styles.quickChipRow}>
                            {SAMPLE_DOCUMENTS.map((sample) => (
                                <TouchableOpacity key={sample.id} style={styles.quickChip} onPress={() => loadSample(sample.text)}>
                                    <Text style={styles.quickChipText}>{sample.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    <Card style={styles.workspaceCard}>
                        <View style={styles.workspaceHead}>
                            <View style={styles.workspaceCopy}>
                                <Text style={styles.workspaceTitle}>Local integrity engine</Text>
                                <Text style={styles.workspaceBody}>
                                    The scanner checks common borrowed phrase patterns and citation-risk signals. It is a triage tool for demo flows, not a final academic misconduct verdict.
                                </Text>
                            </View>
                            <View style={styles.workspaceMetric}>
                                <Text style={styles.workspaceMetricValue}>{RISK_PHRASES.length}</Text>
                                <Text style={styles.workspaceMetricLabel}>Phrase rules</Text>
                            </View>
                        </View>
                    </Card>

                    {scanState === 'idle' ? (
                        <>
                            <Text style={styles.label}>Document Content</Text>
                            <TextInput
                                style={styles.inputArea}
                                multiline
                                placeholder="Paste your essay or short response here..."
                                value={text}
                                onChangeText={setText}
                                textAlignVertical="top"
                            />

                            <View style={styles.ctaRow}>
                                <Button
                                    label="Run Integrity Scan"
                                    icon="scan-outline"
                                    onPress={startScan}
                                    disabled={text.trim().length < 20}
                                />
                                <Button
                                    label="Open Writing Lab"
                                    variant="secondary"
                                    icon="create-outline"
                                    onPress={() => navigation.navigate('Writing')}
                                />
                            </View>
                        </>
                    ) : null}

                    {scanState === 'scanning' ? (
                        <Card style={styles.scanningCard}>
                            <View style={styles.radarCircle}>
                                <Ionicons name="scan" size={44} color={colors.primary} />
                            </View>
                            <Text style={styles.scanTitle}>Checking overlap patterns</Text>
                            <Text style={styles.scanSub}>Reviewing phrase matches and source-signal sentences.</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, progressStyle]} />
                            </View>
                            <Text style={styles.scanPercent}>{scanProgress}% Complete</Text>
                        </Card>
                    ) : null}

                    {scanState === 'result' && results ? (
                        <>
                            <View style={styles.resultHero}>
                                <View style={[styles.scoreCircle, scoreCircleStyle]}>
                                    <Text style={[styles.scoreText, scoreTextStyle]}>{results.similarity}%</Text>
                                    <Text style={[styles.scoreSub, scoreTextStyle]}>{results.riskBand}</Text>
                                </View>
                                <View style={styles.heroTextWrap}>
                                    <Text style={styles.heroTitlePlain}>
                                        {results.similarity >= 15 ? 'Revision needed before submission' : 'Low direct overlap detected'}
                                    </Text>
                                    <Text style={styles.heroDesc}>
                                        {results.similarity >= 15
                                            ? `The scan found ${results.flags.length} flagged items. Rewrite repeated phrasing and add attribution where the draft makes source-based claims.`
                                            : `The draft looks relatively safe. Review the flagged items to make sure evidence and citation language are still clear.`}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.metricRow}>
                                <Card style={styles.metricCard}>
                                    <Text style={styles.metricValue}>{results.originality}%</Text>
                                    <Text style={styles.metricLabel}>Originality</Text>
                                </Card>
                                <Card style={styles.metricCard}>
                                    <Text style={styles.metricValue}>{results.flaggedSentences}</Text>
                                    <Text style={styles.metricLabel}>Flagged sentences</Text>
                                </Card>
                                <Card style={styles.metricCard}>
                                    <Text style={styles.metricValue}>{results.citationRiskCount}</Text>
                                    <Text style={styles.metricLabel}>Citation risks</Text>
                                </Card>
                            </View>

                            <Card style={styles.routeCard}>
                                <Text style={styles.routeTitle}>Revision route</Text>
                                <Text style={styles.routeBody}>
                                    Fix repeated phrasing first, then add attribution, then re-scan. If the draft is for BUEPT writing practice, move directly into Writing after reviewing the flagged items.
                                </Text>
                                <View style={styles.ctaRow}>
                                    <Button label="Open Writing Lab" variant="secondary" icon="create-outline" onPress={() => navigation.navigate('Writing')} />
                                    <Button label="Scan Again" variant="ghost" icon="refresh-outline" onPress={() => setScanState('idle')} />
                                </View>
                            </Card>

                            <Text style={styles.sectionHeader}>Flagged Sentences</Text>
                            {results.flags.length === 0 ? (
                                <Card style={styles.safeCard}>
                                    <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                                    <Text style={styles.safeTitle}>No direct phrase matches</Text>
                                    <Text style={styles.safeBody}>Keep checking citation quality manually before submission.</Text>
                                </Card>
                            ) : (
                                results.flags.map((flag) => {
                                    const isExact = flag.type === 'exact';
                                    const flagCardStyle = isExact ? styles.flagCardExact : styles.flagCardCitation;
                                    const flagBadgeStyle = isExact ? styles.flagBadgeExact : styles.flagBadgeCitation;
                                    const flagBadgeTextStyle = isExact ? styles.flagBadgeTextExact : styles.flagBadgeTextCitation;
                                    const flagSentenceHighlightStyle = isExact ? styles.flagSentenceHighlightExact : styles.flagSentenceHighlightCitation;
                                    return (
                                        <Card key={flag.id} style={[styles.flagCard, flagCardStyle]}>
                                            <View style={styles.flagHeaderRow}>
                                                <View style={[styles.flagBadge, flagBadgeStyle]}>
                                                    <Ionicons name={isExact ? 'warning-outline' : 'alert-circle-outline'} size={14} color={isExact ? colors.error : '#B45309'} />
                                                    <Text style={[styles.flagBadgeText, flagBadgeTextStyle]}>
                                                        {isExact ? 'Phrase overlap' : 'Citation risk'}
                                                    </Text>
                                                </View>
                                                <Text style={styles.flagUrl} numberOfLines={1}>
                                                    {flag.url}
                                                </Text>
                                            </View>
                                            <Text style={styles.flagSentence}>
                                                <Text style={flagSentenceHighlightStyle}>{flag.sentence}</Text>
                                            </Text>
                                            <Text style={styles.flagMatch}>Trigger: {flag.match}</Text>
                                        </Card>
                                    );
                                })
                            )}
                        </>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboard: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

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
        minWidth: 90,
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
    quickChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    quickChip: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 999,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
    },
    quickChipText: {
        fontSize: typography.small,
        color: '#DBEAFE',
        fontFamily: typography.fontHeadline,
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
        minWidth: 88,
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

    label: { fontSize: typography.body, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    inputArea: {
        minHeight: 240,
        backgroundColor: '#fff',
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.secondary,
        fontSize: typography.body,
        color: colors.text,
        ...shadow.sm,
        marginBottom: spacing.md,
    },
    ctaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },

    scanningCard: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.lg,
    },
    radarCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    scanTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.text, marginBottom: 8 },
    scanSub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: spacing.xl },
    progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, overflow: 'hidden', marginBottom: spacing.sm },
    progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
    scanPercent: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },

    resultHero: { flexDirection: 'row', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: '#fff', alignItems: 'center', marginBottom: spacing.md, ...shadow.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    scoreCircle: { width: 94, height: 94, borderRadius: 47, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    scoreCircleLow: { borderColor: colors.success },
    scoreCircleMedium: { borderColor: '#D97706' },
    scoreCircleHigh: { borderColor: colors.error },
    scoreText: { fontSize: 24, fontWeight: '900' },
    scoreTextLow: { color: colors.success },
    scoreTextMedium: { color: '#D97706' },
    scoreTextHigh: { color: colors.error },
    scoreSub: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    heroTextWrap: { flex: 1 },
    heroTitlePlain: { fontSize: typography.body, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
    heroDesc: { fontSize: 13, color: colors.muted, lineHeight: 20 },

    metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    metricCard: { flex: 1, minWidth: 96, alignItems: 'center', paddingVertical: spacing.md },
    metricValue: { fontSize: 18, fontWeight: '900', color: colors.primaryDark },
    metricLabel: { marginTop: 4, fontSize: 11, color: colors.muted, textTransform: 'uppercase', fontWeight: '700' },

    routeCard: { marginBottom: spacing.md, backgroundColor: '#F8FBFF', borderColor: '#D7E4FA' },
    routeTitle: { fontSize: typography.body, color: colors.primaryDark, fontFamily: typography.fontHeadline, marginBottom: spacing.xs },
    routeBody: { fontSize: typography.small, color: colors.muted, lineHeight: 20, marginBottom: spacing.sm },

    sectionHeader: { fontSize: typography.body, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
    safeCard: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm, backgroundColor: colors.successLight, borderColor: colors.success },
    safeTitle: { fontSize: typography.body, color: colors.successDark, fontWeight: '800' },
    safeBody: { fontSize: typography.small, color: colors.successDark, textAlign: 'center' },

    flagCard: { marginBottom: spacing.sm, padding: spacing.md, borderWidth: 1 },
    flagCardExact: { borderColor: 'rgba(231,76,60,0.25)', backgroundColor: 'rgba(231,76,60,0.03)' },
    flagCardCitation: { borderColor: 'rgba(217,119,6,0.25)', backgroundColor: 'rgba(245,158,11,0.05)' },
    flagHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.sm },
    flagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
    flagBadgeExact: { backgroundColor: 'rgba(231,76,60,0.1)' },
    flagBadgeCitation: { backgroundColor: 'rgba(245,158,11,0.16)' },
    flagBadgeText: { fontSize: 12, fontWeight: '800' },
    flagBadgeTextExact: { color: colors.error },
    flagBadgeTextCitation: { color: '#B45309' },
    flagUrl: { flex: 1, fontSize: 11, color: colors.muted, textAlign: 'right' },
    flagSentence: { fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: spacing.xs },
    flagSentenceHighlightExact: { backgroundColor: 'rgba(231,76,60,0.14)', color: '#C0392B', fontWeight: '700' },
    flagSentenceHighlightCitation: { backgroundColor: 'rgba(245,158,11,0.14)', color: '#B45309', fontWeight: '700' },
    flagMatch: { fontSize: 12, color: colors.muted, fontWeight: '700' },
});
