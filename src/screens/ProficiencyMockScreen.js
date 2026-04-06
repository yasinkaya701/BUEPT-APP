import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isDemoAiConfigured, requestDemoModule } from '../utils/demoAi';

const DEFAULT_MOCK_QUESTIONS = [
    { id: 1, type: 'grammar', text: 'By the time the manager arrived, the team ________ the project.', options: ['has finished', 'have finished', 'had finished', 'was finishing'], correct: 2 },
    { id: 2, type: 'reading', text: 'According to the passage, what is the primary cause of urban heat islands?', options: ['Increased vegetation', 'High concentration of dark surfaces', 'Ozone layer depletion', 'Wind patterns'], correct: 1 },
    { id: 3, type: 'vocab', text: 'The new policy is designed to ________ the negative effects of the economic downturn.', options: ['ameliorate', 'exacerbate', 'proliferate', 'obfuscate'], correct: 0 },
    { id: 4, type: 'grammar', text: 'Not only ________ late, but he also forgot his notes.', options: ['did he arrive', 'he arrived', 'he did arrive', 'arrived he'], correct: 0 }
];

function normalizeQuestion(item = {}, idx = 0) {
    const options = Array.isArray(item.options) ? item.options.filter(Boolean).slice(0, 4) : [];
    const correct = Number.isFinite(item.correct) ? item.correct : Number(item.answerIndex);
    if (!item.text || options.length < 2 || !Number.isFinite(correct)) return null;
    return {
        id: item.id || `q_${idx + 1}`,
        type: String(item.type || item.skill || 'general'),
        text: String(item.text).trim(),
        options,
        correct: Math.max(0, Math.min(options.length - 1, correct)),
    };
}

function buildMockMistakeItem(q, selectedIdx) {
    const options = Array.isArray(q.options) ? q.options : [];
    const correctIdx = Number.isFinite(q.correct) ? q.correct : null;
    const selected = Number.isFinite(selectedIdx) ? selectedIdx : null;
    const type = String(q.type || '').toLowerCase();
    const module = type.includes('grammar') ? 'grammar' : type.includes('reading') ? 'reading' : type.includes('listening') ? 'listening' : 'vocab';
    return {
        module,
        moduleLabel: `Proficiency Mock • ${q.type || 'Vocabulary'}`,
        taskTitle: 'Proficiency Mock',
        question: q.text || '',
        options,
        correctIndex: correctIdx,
        selectedIndex: selected,
        correctText: correctIdx != null ? options[correctIdx] : '',
        selectedText: selected != null ? options[selected] : 'Skipped',
    };
}

export default function ProficiencyMockScreen({ navigation }) {
    const [examState, setExamState] = useState('intro'); // intro, active, result
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(120);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState(DEFAULT_MOCK_QUESTIONS);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [source, setSource] = useState(isDemoAiConfigured('generic') ? 'online-ready' : 'offline');

    const submitExam = useCallback(() => {
        let correctCt = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct) correctCt++;
        });
        setScore(Math.round((correctCt / Math.max(1, questions.length)) * 100));
        setExamState('result');
    }, [answers, questions]);

    useEffect(() => {
        let active = true;
        (async () => {
            setLoadingQuestions(true);
            try {
                const payload = await requestDemoModule('proficiency_mock', { count: 8, level: 'B2' });
                const raw = Array.isArray(payload?.questions) ? payload.questions : [];
                const normalized = raw.map(normalizeQuestion).filter(Boolean);
                if (!active) return;
                if (normalized.length >= 4) {
                    setQuestions(normalized);
                    setSource(payload?.source || 'online');
                } else {
                    setSource('offline');
                }
            } catch (_) {
                if (active) setSource('offline');
            } finally {
                if (active) setLoadingQuestions(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

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
        setTimeLeft(Math.max(120, questions.length * 30));
    };

    const handleSelectOption = (idx) => {
        setAnswers({ ...answers, [currentQIndex]: idx });
    };

    const nextQ = () => {
        if (currentQIndex < questions.length - 1) {
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
        <Screen scroll contentStyle={styles.container}>
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
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.pageTitle}>Proficiency Exam</Text>
                    <Text style={styles.pageSub}>Hazırlık Atlama</Text>
                </View>
                {examState === 'active' && (
                    <View style={[styles.timerBadge, timeLeft < 30 && styles.timerBadgeDanger]}>
                        <Ionicons name="time" size={14} color="#fff" />
                        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {examState === 'intro' && (
                    <View style={styles.introWrap}>
                        <Ionicons name="document-text" size={64} color={colors.primary} style={styles.introIcon} />
                            <Text style={styles.introTitle}>Live BUEPT Simulation</Text>
                            <Text style={styles.introDesc}>This module simulates the actual university proficiency test under timed conditions.</Text>
                            <Text style={styles.sourceText}>Question source: {source}</Text>

                        <Card style={styles.rulesCard}>
                            <Text style={styles.rulesHead}>Exam Rules</Text>
                            <Rule label="Timed Session" desc={`You have a short timed session for ${questions.length} questions.`} />
                            <Rule label="No Pausing" desc="Once started, the timer cannot be stopped." />
                            <Rule label="Auto-Submit" desc="When the timer reaches 0:00, the exam forces submission." />
                        </Card>
                        {loadingQuestions ? (
                            <View style={styles.loadingInline}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.loadingInlineText}>Loading exam-bank questions...</Text>
                            </View>
                        ) : null}
                        <Button label="Begin Simulation" icon="play" onPress={startExam} disabled={loadingQuestions || !questions.length} />
                    </View>
                )}

                {examState === 'active' && (
                    <View>
                        <View style={styles.progressRow}>
                            <Text style={styles.qCounter}>Question {currentQIndex + 1} of {questions.length}</Text>
                            <View style={styles.progBg}>
                                <View style={[styles.progFill, { width: `${((currentQIndex + 1) / Math.max(1, questions.length)) * 100}%` }]} />
                            </View>
                        </View>

                        <Card style={styles.qCard}>
                            <View style={styles.qTypeBadge}>
                                <Text style={styles.qTypeText}>{questions[currentQIndex]?.type}</Text>
                            </View>
                            <Text style={styles.qText}>{questions[currentQIndex]?.text}</Text>
                        </Card>

                        <View style={styles.optionsWrap}>
                            {(questions[currentQIndex]?.options || []).map((opt, idx) => {
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
                            <Button label="Previous" variant="secondary" onPress={prevQ} disabled={currentQIndex === 0} style={styles.navButton} />
                            <Button label={currentQIndex === questions.length - 1 ? "Submit" : "Next"} onPress={nextQ} style={styles.navButton} />
                        </View>
                    </View>
                )}

                {examState === 'result' && (
                    <View style={styles.resultWrap}>
                        <View style={styles.resultHero}>
                            <Text style={styles.resultLabel}>Final Score</Text>
                            <Text style={[styles.resultVal, score >= 60 ? styles.resultValPass : styles.resultValFail]}>{score}</Text>
                            <Text style={styles.passFailText}>{score >= 60 ? 'PASSED (C)' : 'FAILED (F)'}</Text>
                        </View>

                        <Text style={styles.reviewHead}>Detailed Review</Text>
                        {questions.map((q, qIdx) => {
                            const usrAns = answers[qIdx];
                            const isCorrect = usrAns === q.correct;
                            return (
                                <Card key={qIdx} style={[styles.reviewCard, isCorrect ? styles.reviewCardCorrect : styles.reviewCardIncorrect]}>
                                    <View style={styles.reviewHeaderRow}>
                                        <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={20} color={isCorrect ? colors.success : colors.error} />
                                        <Text style={styles.reviewHeaderText}>Q{qIdx + 1}: {q.type}</Text>
                                    </View>
                                    <Text style={styles.reviewQText}>{q.text}</Text>
                                    {!isCorrect && <Text style={styles.yourAnsText}>You chose: {usrAns !== undefined ? q.options[usrAns] : 'Skipped'}</Text>}
                                    <Text style={styles.corrAnsText}>Correct: {q.options[q.correct]}</Text>
                                    {!isCorrect && (
                                        <Button
                                            label="Open Mistake Coach"
                                            variant="secondary"
                                            onPress={() => navigation.navigate('MistakeCoach', { mistakes: [buildMockMistakeItem(q, usrAns)] })}
                                            style={styles.reviewCoachBtn}
                                        />
                                    )}
                                </Card>
                            )
                        })}

                        <Button label="Retry Simulation" icon="refresh" onPress={startExam} style={styles.retryButton} />
                        <View style={styles.bottomSpacer} />
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

    headerTitleWrap: { flex: 1 },

    timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryDark, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, gap: 4 },
    timerText: { color: '#fff', fontSize: 13, fontWeight: '900', fontFamily: 'Courier' },
    timerBadgeDanger: { backgroundColor: colors.error },

    scroll: { paddingHorizontal: spacing.xl },

    introWrap: { marginTop: spacing.xl },
    introIcon: { alignSelf: 'center', marginBottom: spacing.md },
    introTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 8 },
    introDesc: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    sourceText: { fontSize: 12, color: colors.muted, textAlign: 'center', marginBottom: spacing.md },
    loadingInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    loadingInlineText: { marginLeft: 8, color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
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
    navButton: { width: '48%' },

    resultWrap: { marginTop: spacing.lg },
    resultHero: { alignItems: 'center', padding: spacing.xxl, backgroundColor: '#fff', borderRadius: radius.xl, ...shadow.md, marginBottom: spacing.xl },
    resultLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
    resultVal: { fontSize: 64, fontWeight: '900', lineHeight: 70 },
    resultValPass: { color: colors.success },
    resultValFail: { color: colors.error },
    passFailText: { fontSize: 16, fontWeight: '900', color: colors.text, marginTop: spacing.xs },

    reviewHead: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
    reviewCard: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
    reviewCardCorrect: { borderColor: colors.success, borderWidth: 1 },
    reviewCardIncorrect: { borderColor: colors.error, borderWidth: 1 },
    reviewHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    reviewHeaderText: { marginLeft: 8, fontWeight: '800', color: colors.text },
    reviewQText: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.sm },
    yourAnsText: { fontSize: 13, color: colors.error, fontWeight: '700', marginBottom: 2 },
    corrAnsText: { fontSize: 13, color: colors.success, fontWeight: '800' },
    reviewCoachBtn: { marginTop: spacing.xs, alignSelf: 'flex-start' },

    retryButton: { marginTop: spacing.xl },
    bottomSpacer: { height: 40 }
});
