import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Simulated complex historical data
const HISTORICAL_DATA = {
    grammar: { score: 45, label: 'Grammar Accuracy' },
    vocab: { score: 82, label: 'Lexical Resource' },
    reading: { score: 68, label: 'Reading Comprehension' },
    listening: { score: 55, label: 'Listening Retention' },
    writing: { score: 90, label: 'Academic Writing' }
};

export default function WeakPointAnalysisScreen({ navigation }) {
    // Animation Values
    const gramAnim = useRef(new Animated.Value(0)).current;
    const vocAnim = useRef(new Animated.Value(0)).current;
    const readAnim = useRef(new Animated.Value(0)).current;
    const listAnim = useRef(new Animated.Value(0)).current;
    const writAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(gramAnim, { toValue: HISTORICAL_DATA.grammar.score, duration: 800, useNativeDriver: false }),
            Animated.timing(vocAnim, { toValue: HISTORICAL_DATA.vocab.score, duration: 800, useNativeDriver: false }),
            Animated.timing(readAnim, { toValue: HISTORICAL_DATA.reading.score, duration: 800, useNativeDriver: false }),
            Animated.timing(listAnim, { toValue: HISTORICAL_DATA.listening.score, duration: 800, useNativeDriver: false }),
            Animated.timing(writAnim, { toValue: HISTORICAL_DATA.writing.score, duration: 800, useNativeDriver: false }),
        ]).start();
    }, [gramAnim, listAnim, readAnim, vocAnim, writAnim]);

    const weakPoints = Object.entries(HISTORICAL_DATA)
        .filter(([_, data]) => data.score < 60)
        .sort((a, b) => a[1].score - b[1].score); // Lowest first

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Diagnostic Engine</Text>
                    <Text style={styles.pageSub}>Weak Point Analysis</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionHeader}>Skill Matrix</Text>
                <Card style={styles.chartCard} glow>
                    <BarChartRow label={HISTORICAL_DATA.grammar.label} animValue={gramAnim} target={HISTORICAL_DATA.grammar.score} />
                    <BarChartRow label={HISTORICAL_DATA.listening.label} animValue={listAnim} target={HISTORICAL_DATA.listening.score} />
                    <BarChartRow label={HISTORICAL_DATA.reading.label} animValue={readAnim} target={HISTORICAL_DATA.reading.score} />
                    <BarChartRow label={HISTORICAL_DATA.vocab.label} animValue={vocAnim} target={HISTORICAL_DATA.vocab.score} />
                    <BarChartRow label={HISTORICAL_DATA.writing.label} animValue={writAnim} target={HISTORICAL_DATA.writing.score} isLast />
                </Card>

                <View style={styles.alertHeader}>
                    <Ionicons name="warning" size={24} color={colors.error} />
                    <Text style={styles.alertHeaderText}>Red Zones Detected</Text>
                </View>

                {weakPoints.map(([key, data]) => (
                    <Card key={key} style={styles.weakCard}>
                        <View style={styles.weakTop}>
                            <View style={[styles.weakBadge, { backgroundColor: 'rgba(231,76,60,0.1)' }]}>
                                <Text style={styles.weakBadgeText}>{data.score}%</Text>
                            </View>
                            <Text style={styles.weakTitle}>{data.label}</Text>
                        </View>
                        <Text style={styles.weakDesc}>
                            {key === 'grammar' && "Historical mock exams show severe weakness in Present Perfect Continuous and Relative Clauses."}
                            {key === 'listening' && "You frequently miss specific details in 3+ minute lectures. Focus on shorthand note-taking."}
                        </Text>
                        <TouchableOpacity style={styles.fixBtn}>
                            <Text style={styles.fixBtnText}>Launch Remedial Module</Text>
                            <Ionicons name="arrow-forward" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </Card>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </Screen>
    );
}

const BarChartRow = ({ label, animValue, target, isLast }) => {
    const color = target >= 75 ? colors.success : (target >= 50 ? '#f39c12' : colors.error);

    return (
        <View style={[styles.barRow, isLast && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
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

    scroll: { paddingHorizontal: spacing.xl },
    sectionHeader: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },

    chartCard: { padding: spacing.xl, borderRadius: radius.xl, marginBottom: spacing.xxl, backgroundColor: '#fff' },
    barRow: { marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    barLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
    barVal: { fontSize: 13, fontWeight: '900' },
    barBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4 },

    alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
    alertHeaderText: { fontSize: 18, fontWeight: '900', color: colors.error },

    weakCard: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' },
    weakTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md },
    weakBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    weakBadgeText: { fontSize: 13, fontWeight: '900', color: colors.error },
    weakTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
    weakDesc: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: spacing.md },

    fixBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
    fixBtnText: { fontSize: 12, fontWeight: '800', color: colors.primary }
});
