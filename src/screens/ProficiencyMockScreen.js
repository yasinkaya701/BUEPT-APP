import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MOCK_QUESTIONS = [
    { id: 1, type: 'grammar', text: 'By the time the manager arrived, the team ________ the project.', options: ['has finished', 'have finished', 'had finished', 'was finishing'], correct: 2 },
    { id: 2, type: 'reading', text: 'According to the passage, what is the primary cause of urban heat islands?', options: ['Increased vegetation', 'High concentration of dark surfaces', 'Ozone layer depletion', 'Wind patterns'], correct: 1 },
    { id: 3, type: 'vocab', text: 'The new policy is designed to ________ the negative effects of the economic downturn.', options: ['ameliorate', 'exacerbate', 'proliferate', 'obfuscate'], correct: 0 },
    { id: 4, type: 'grammar', text: 'Not only ________ late, but he also forgot his notes.', options: ['did he arrive', 'he arrived', 'he did arrive', 'arrived he'], correct: 0 }
];

export default function ProficiencyMockScreen({ navigation }) {
    const [examState, setExamState] = useState('intro'); // intro, active, result
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for demo
    const [score, setScore] = useState(0);

    const submitExam = useCallback(() => {
        let correctCt = 0;
        MOCK_QUESTIONS.forEach((q, idx) => {
            if (answers[idx] === q.correct) correctCt++;
        });
        setScore(Math.round((correctCt / MOCK_QUESTIONS.length) * 100));
        setExamState('result');
    }, [answers]);

    useEffect(() => {
        let timer;
        if (examState === 'active' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && examState === 'active') {
            submitExam();
        }
        return () => clearInterval(timer);
    }, [examState, timeLeft, submitExam]);

    const startExam = () => {
        setExamState('active');
        setCurrentQIndex(0);
        setAnswers({});
        setTimeLeft(120);
    };

    const handleSelectOption = (idx) => {
        setAnswers({ ...answers, [currentQIndex]: idx });
    };

    const nextQ = () => {
        if (currentQIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            Alert.alert("Complete Exam", "Are you sure you want to view your results?", [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit', style: 'destructive', onPress: submitExam }
            ]);
        }
    };

    const prevQ = () => {
        if (currentQIndex > 0) setCurrentQIndex(prev => prev - 1);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (examState === 'active') {
                        Alert.alert("Warning", "Quitting will lose your progress.", [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Quit', style: 'destructive', onPress: () => navigation.goBack() }
                        ]);
                    } else {
                        navigation.goBack();
                    }
                }} style={styles.backBtn}>
                    <Ionicons name={examState === 'active' ? 'close' : 'arrow-back'} size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.pageTitle}>Proficiency Exam</Text>
                    <Text style={styles.pageSub}>Hazırlık Atlama</Text>
                </View>
                {examState === 'active' && (
                    <View style={[styles.timerBadge, timeLeft < 30 && { backgroundColor: colors.error }]}>
                        <Ionicons name="time" size={14} color="#fff" />
                        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {examState === 'intro' && (
                    <View style={{ marginTop: spacing.xl }}>
                        <Ionicons name="document-text" size={64} color={colors.primary} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
                        <Text style={styles.introTitle}>Live BUEPT Simulation</Text>
                        <Text style={styles.introDesc}>This module simulates the actual university proficiency test under timed conditions.</Text>

                        <Card style={styles.rulesCard}>
                            <Text style={styles.rulesHead}>Exam Rules</Text>
                            <Rule label="Timed Session" desc="You have exactly 2 minutes for this short 4-question demo." />
                            <Rule label="No Pausing" desc="Once started, the timer cannot be stopped." />
                            <Rule label="Auto-Submit" desc="When the timer reaches 0:00, the exam forces submission." />
                        </Card>

                        <Button label="Begin Simulation" icon="play" onPress={startExam} />
                    </View>
                )}

                {examState === 'active' && (
                    <View>
                        <View style={styles.progressRow}>
                            <Text style={styles.qCounter}>Question {currentQIndex + 1} of {MOCK_QUESTIONS.length}</Text>
                            <View style={styles.progBg}>
                                <View style={[styles.progFill, { width: `${((currentQIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }]} />
                            </View>
                        </View>

                        <Card style={styles.qCard}>
                            <View style={styles.qTypeBadge}>
                                <Text style={styles.qTypeText}>{MOCK_QUESTIONS[currentQIndex].type}</Text>
                            </View>
                            <Text style={styles.qText}>{MOCK_QUESTIONS[currentQIndex].text}</Text>
                        </Card>

                        <View style={styles.optionsWrap}>
                            {MOCK_QUESTIONS[currentQIndex].options.map((opt, idx) => {
                                const isSelected = answers[currentQIndex] === idx;
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => handleSelectOption(idx)}
                                        style={[styles.optBtn, isSelected && styles.optBtnSelected]}
                                    >
                                        <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                                        <Text style={[styles.optText, isSelected && styles.optTextSelected]}>{opt}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.navRow}>
                            <Button label="Previous" variant="secondary" onPress={prevQ} disabled={currentQIndex === 0} style={{ width: '48%' }} />
                            <Button label={currentQIndex === MOCK_QUESTIONS.length - 1 ? "Submit" : "Next"} onPress={nextQ} style={{ width: '48%' }} />
                        </View>
                    </View>
                )}

                {examState === 'result' && (
                    <View style={{ marginTop: spacing.lg }}>
                        <View style={styles.resultHero}>
                            <Text style={styles.resultLabel}>Final Score</Text>
                            <Text style={[styles.resultVal, { color: score >= 60 ? colors.success : colors.error }]}>{score}</Text>
                            <Text style={styles.passFailText}>{score >= 60 ? 'PASSED (C)' : 'FAILED (F)'}</Text>
                        </View>

                        <Text style={styles.reviewHead}>Detailed Review</Text>
                        {MOCK_QUESTIONS.map((q, qIdx) => {
                            const usrAns = answers[qIdx];
                            const isCorrect = usrAns === q.correct;
                            return (
                                <Card key={qIdx} style={[styles.reviewCard, { borderColor: isCorrect ? colors.success : colors.error, borderWidth: 1 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                        <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={20} color={isCorrect ? colors.success : colors.error} />
                                        <Text style={{ marginLeft: 8, fontWeight: '800', color: colors.text }}>Q{qIdx + 1}: {q.type}</Text>
                                    </View>
                                    <Text style={styles.reviewQText}>{q.text}</Text>
                                    {!isCorrect && <Text style={styles.yourAnsText}>You chose: {usrAns !== undefined ? q.options[usrAns] : 'Skipped'}</Text>}
                                    <Text style={styles.corrAnsText}>Correct: {q.options[q.correct]}</Text>
                                </Card>
                            )
                        })}

                        <Button label="Retry Simulation" icon="refresh" onPress={startExam} style={{ marginTop: spacing.xl }} />
                        <View style={{ height: 40 }} />
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}

const Rule = ({ label, desc }) => (
    <View style={styles.ruleItem}>
        <View style={styles.ruleBullet} />
        <View>
            <Text style={styles.ruleLabel}>{label}</Text>
            <Text style={styles.ruleDesc}>{desc}</Text>
        </View>
    </View>
)

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryDark, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, gap: 4 },
    timerText: { color: '#fff', fontSize: 13, fontWeight: '900', fontFamily: 'Courier' },

    scroll: { paddingHorizontal: spacing.xl },

    introTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 8 },
    introDesc: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    rulesCard: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.xxl },
    rulesHead: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', color: colors.primaryDark, marginBottom: spacing.sm },
    ruleItem: { flexDirection: 'row', marginTop: spacing.md, paddingRight: spacing.xl },
    ruleBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6, marginRight: spacing.sm },
    ruleLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
    ruleDesc: { fontSize: 13, color: colors.muted, lineHeight: 18, marginTop: 2 },

    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
    qCounter: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
    progBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3 },
    progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

    qCard: { padding: spacing.xl, borderRadius: radius.lg, marginBottom: spacing.xl, minHeight: 180, justifyContent: 'center' },
    qTypeBadge: { alignSelf: 'flex-start', backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: spacing.md },
    qTypeText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    qText: { fontSize: 18, color: colors.text, lineHeight: 28, fontWeight: '600' },

    optionsWrap: { gap: spacing.md, marginBottom: spacing.xxl },
    optBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent', ...shadow.slight },
    optBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.muted, marginRight: spacing.md, justifyContent: 'center', alignItems: 'center' },
    radioDotSelected: { borderColor: colors.primary, borderWidth: 5 },
    optText: { fontSize: 15, color: colors.text, fontWeight: '500', flex: 1 },
    optTextSelected: { color: colors.primaryDark, fontWeight: '800' },

    navRow: { flexDirection: 'row', justifyContent: 'space-between' },

    resultHero: { alignItems: 'center', padding: spacing.xxl, backgroundColor: '#fff', borderRadius: radius.xl, ...shadow.md, marginBottom: spacing.xl },
    resultLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
    resultVal: { fontSize: 64, fontWeight: '900', lineHeight: 70 },
    passFailText: { fontSize: 16, fontWeight: '900', color: colors.text, marginTop: spacing.xs },

    reviewHead: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
    reviewCard: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
    reviewQText: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.sm },
    yourAnsText: { fontSize: 13, color: colors.error, fontWeight: '700', marginBottom: 2 },
    corrAnsText: { fontSize: 13, color: colors.success, fontWeight: '800' }
});
