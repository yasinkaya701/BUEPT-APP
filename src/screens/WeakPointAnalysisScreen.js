import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isDemoAiConfigured, requestDemoModule } from '../utils/demoAi';
import { useAppState } from '../context/AppState';

// Simulated complex historical data
const HISTORICAL_DATA = {
    grammar: { score: 45, label: 'Grammar Accuracy' },
    vocab: { score: 82, label: 'Lexical Resource' },
    reading: { score: 68, label: 'Reading Comprehension' },
    listening: { score: 55, label: 'Listening Retention' },
    writing: { score: 90, label: 'Academic Writing' }
};

function normalizeSkills(payload = {}) {
    const raw = payload.skills && typeof payload.skills === 'object'
        ? payload.skills
        : (payload.data && typeof payload.data === 'object' ? payload.data : null);
    if (!raw) return null;
    const keys = ['grammar', 'vocab', 'reading', 'listening', 'writing'];
    const next = {};
    keys.forEach((key) => {
        const item = raw[key] || {};
        const score = Number(item.score);
        next[key] = {
            score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : HISTORICAL_DATA[key].score,
            label: item.label || HISTORICAL_DATA[key].label,
        };
    });
    return next;
}

export default function WeakPointAnalysisScreen({ navigation }) {
    // Animation Values
    const gramAnim = useRef(new Animated.Value(0)).current;
    const vocAnim = useRef(new Animated.Value(0)).current;
    const readAnim = useRef(new Animated.Value(0)).current;
    const listAnim = useRef(new Animated.Value(0)).current;
    const writAnim = useRef(new Animated.Value(0)).current;
    const [historicalData, setHistoricalData] = useState(HISTORICAL_DATA);
    const [insights, setInsights] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState(isDemoAiConfigured('generic') ? 'online-ready' : 'offline');
    const { readingHistory, listeningHistory, grammarHistory, mockHistory, history, vocabStats, errorWords } = useAppState();

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(gramAnim, { toValue: historicalData.grammar.score, duration: 800, useNativeDriver: false }),
            Animated.timing(vocAnim, { toValue: historicalData.vocab.score, duration: 800, useNativeDriver: false }),
            Animated.timing(readAnim, { toValue: historicalData.reading.score, duration: 800, useNativeDriver: false }),
            Animated.timing(listAnim, { toValue: historicalData.listening.score, duration: 800, useNativeDriver: false }),
            Animated.timing(writAnim, { toValue: historicalData.writing.score, duration: 800, useNativeDriver: false }),
        ]).start();
    }, [gramAnim, historicalData, listAnim, readAnim, vocAnim, writAnim]);

    useEffect(() => {
        let active = true;
        (async () => {
            setIsLoading(true);
            try {
                const payload = await requestDemoModule('weak_point_analysis', {
                    period: 'last_30_days',
                    readingHistory,
                    listeningHistory,
                    grammarHistory,
                    mockHistory,
                    history,
                    vocabStats,
                    errorWords,
                });
                const normalized = normalizeSkills(payload || {});
                if (!active) return;
                if (normalized) {
                    setHistoricalData(normalized);
                    setInsights(payload?.insights || {});
                    setSource(payload?.source || 'online');
                } else {
                    setSource('offline');
                }
            } catch (_) {
                if (active) setSource('offline');
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [errorWords, grammarHistory, history, listeningHistory, mockHistory, readingHistory, vocabStats]);

    const weakPoints = useMemo(() => Object.entries(historicalData)
        .filter(([_, data]) => data.score < 60)
        .sort((a, b) => a[1].score - b[1].score), [historicalData]); // Lowest first

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Diagnostic Engine</Text>
                    <Text style={styles.pageSub}>Weak Point Analysis</Text>
                    <Text style={styles.sourceText}>Data source: {source}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>Refreshing diagnostics...</Text>
                    </View>
                ) : null}

                <Text style={styles.sectionHeader}>Skill Matrix</Text>
                <Card style={styles.chartCard} glow>
                    <BarChartRow label={historicalData.grammar.label} animValue={gramAnim} target={historicalData.grammar.score} />
                    <BarChartRow label={historicalData.listening.label} animValue={listAnim} target={historicalData.listening.score} />
                    <BarChartRow label={historicalData.reading.label} animValue={readAnim} target={historicalData.reading.score} />
                    <BarChartRow label={historicalData.vocab.label} animValue={vocAnim} target={historicalData.vocab.score} />
                    <BarChartRow label={historicalData.writing.label} animValue={writAnim} target={historicalData.writing.score} isLast />
                </Card>

                <View style={styles.alertHeader}>
                    <Ionicons name="warning" size={24} color={colors.error} />
                    <Text style={styles.alertHeaderText}>Red Zones Detected</Text>
                </View>

                {weakPoints.map(([key, data]) => (
                    <Card key={key} style={styles.weakCard}>
                        <View style={styles.weakTop}>
                            <View style={[styles.weakBadge, styles.weakBadgeDanger]}>
                                <Text style={styles.weakBadgeText}>{data.score}%</Text>
                            </View>
                            <Text style={styles.weakTitle}>{data.label}</Text>
                        </View>
                        <Text style={styles.weakDesc}>
                            {insights?.[key]?.summary
                                || (key === 'grammar' ? 'Grammar remains one of the lowest scoring areas in recent data.' : '')
                                || (key === 'listening' ? 'Listening still needs tighter note-taking and retention control.' : '')
                                || 'Recent performance data shows this area needs more work.'}
                        </Text>
                        <TouchableOpacity style={styles.fixBtn}>
                            <Text style={styles.fixBtnText}>Launch Remedial Module</Text>
                            <Ionicons name="arrow-forward" size={16} color={colors.primary} style={styles.fixBtnIcon} />
                        </TouchableOpacity>
                    </Card>
                ))}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </Screen>
    );
}

const BarChartRow = ({ label, animValue, target, isLast }) => {
    const color = target >= 75 ? colors.success : (target >= 50 ? '#f39c12' : colors.error);

    return (
        <View style={[styles.barRow, isLast && styles.barRowLast]}>
            <View style={styles.barRowHeader}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={[styles.barVal, { color }]}>{target}%</Text>
            </View>
            <View style={styles.barBg}>
                <Animated.View style={[styles.barFill, {
                    backgroundColor: color, width: animValue.interpolate({
                        inputRange: [0, 100], outputRange: ['0%', '100%']
                    })
                }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    sourceText: { fontSize: 12, color: colors.muted, marginTop: 2 },

    scroll: { paddingHorizontal: spacing.xl },
    loadingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    loadingText: { marginLeft: 8, color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
    sectionHeader: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },

    chartCard: { padding: spacing.xl, borderRadius: radius.xl, marginBottom: spacing.xxl, backgroundColor: '#fff' },
    barRow: { marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    barRowLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
    barRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    barLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
    barVal: { fontSize: 13, fontWeight: '900' },
    barBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4 },

    alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
    alertHeaderText: { fontSize: 18, fontWeight: '900', color: colors.error },

    weakCard: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' },
    weakTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md },
    weakBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    weakBadgeDanger: { backgroundColor: 'rgba(231,76,60,0.1)' },
    weakBadgeText: { fontSize: 13, fontWeight: '900', color: colors.error },
    weakTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
    weakDesc: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: spacing.md },

    fixBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
    fixBtnText: { fontSize: 12, fontWeight: '800', color: colors.primary },
    fixBtnIcon: { marginLeft: 4 },

    bottomSpacer: { height: 40 }
});
