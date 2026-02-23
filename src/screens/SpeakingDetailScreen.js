import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, Alert
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { analyzeSpeakingResponse } from '../utils/speakingCoach';
import { scoreSpeakingRubric } from '../utils/rubricScoring';
import { buildSpeakingOpenEndedPrompts } from '../utils/openEndedPrompts';
import { detectBasicErrors } from '../utils/basicErrorDetect';
import { suggestSynonyms } from '../utils/synonymSuggest';
import { speakEnglish, stopEnglishTts } from '../utils/ttsEnglish';

const LEVEL_COLORS = {
    P1: colors.success,
    P2: colors.primary,
    P3: colors.warning,
    P4: colors.accent,
};

const TYPE_COLORS = {
    description: colors.success,
    comparison: colors.primary,
    discussion: colors.warning,
    argument: colors.accent,
    'problem-solution': colors.error,
    'cause-effect': colors.primaryLight,
    critical: colors.text,
};

const FILLER_WORDS = ['like', 'you know', 'basically', 'actually', 'i mean', 'kind of', 'sort of'];

function getWordCount(text = '') {
    return (String(text || '').trim().match(/\b[\w']+\b/g) || []).length;
}

function buildFluencyStats(text = '', elapsedSec = 0) {
    const words = getWordCount(text);
    const minutes = Math.max(1 / 60, (elapsedSec || 0) / 60);
    const wpm = Math.round(words / minutes);
    const lower = String(text || '').toLowerCase();
    const fillerCount = FILLER_WORDS.reduce((sum, f) => {
        const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return sum + ((lower.match(new RegExp(`\\b${escaped}\\b`, 'g')) || []).length);
    }, 0);
    const sentenceCount = String(text || '').split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;
    return { words, wpm, fillerCount, sentenceCount };
}

function buildImprovedSpeakingDraft(text = '', fb = null) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    let out = raw
        .replace(/\b(i guess|kind of|sort of|you know|basically|actually)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    const hasIntro = /\b(in my opinion|i believe|this topic is important|i would argue)\b/i.test(out);
    if (!hasIntro) out = `In my opinion, ${out.charAt(0).toLowerCase()}${out.slice(1)}`;

    if (fb && fb.connectorCount < 2 && !/\b(however|therefore|moreover|for example|in conclusion)\b/i.test(out)) {
        out = `${out}. For example, this can be observed in daily academic settings. Therefore, the argument becomes more convincing.`;
    }
    if (!/[.!?]$/.test(out)) out = `${out}.`;
    return out;
}

export default function SpeakingDetailScreen({ route }) {
  const { prompt: item } = route.params;
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [rubricResult, setRubricResult] = useState(null);
    const [showModel, setShowModel] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [ttsReading, setTtsReading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [showStructure, setShowStructure] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [selfCheck, setSelfCheck] = useState({
        thesis: false,
        example: false,
        connector: false,
        conclusion: false,
    });
    const intervalRef = useRef(null);
    const ttsResetRef = useRef(null);

    React.useEffect(() => {
        Voice.onSpeechStart = () => setIsRecording(true);
        Voice.onSpeechEnd = () => setIsRecording(false);
        Voice.onSpeechError = (e) => {
            setIsRecording(false);
            if (e.error?.message !== '7/No match') {
                console.log('Voice Error:', e);
            }
        };
        Voice.onSpeechResults = (e) => {
            if (e.value && e.value.length > 0) {
                setNotes(prev => {
                    const existing = prev.trim();
                    const newText = e.value[0];
                    return existing ? existing + ' ' + newText : newText;
                });
            }
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
            if (ttsResetRef.current) clearTimeout(ttsResetRef.current);
            stopEnglishTts();
        };
    }, []);

    const toggleRecording = async () => {
        if (isRecording) {
            try {
                await Voice.stop();
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                await Voice.start('en-US');
            } catch (e) {
                console.log(e);
                Alert.alert('Microphone Error', 'Please ensure microphone and speech recognition permissions are granted in Settings.');
            }
        }
    };

    const speak = useCallback(async (text) => {
        try {
            await stopEnglishTts();
            if (ttsResetRef.current) clearTimeout(ttsResetRef.current);
            setTtsReading(true);
            await speakEnglish(text, { rate: 0.48 });
            const durationMs = Math.max(1200, Math.round(String(text || '').trim().split(/\s+/).length * 450));
            ttsResetRef.current = setTimeout(() => setTtsReading(false), durationMs);
        } catch (e) {
            setTtsReading(false);
        }
    }, []);

    const stopSpeak = useCallback(async () => {
        try { await stopEnglishTts(); } catch (_) { }
        if (ttsResetRef.current) clearTimeout(ttsResetRef.current);
        setTtsReading(false);
    }, []);

    const startTimer = () => {
        if (timerRunning) return;
        setTimerRunning(true);
        intervalRef.current = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(intervalRef.current);
        setTimerRunning(false);
    };

    const resetTimer = () => {
        clearInterval(intervalRef.current);
        setTimerRunning(false);
        setTimer(0);
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleAnalyze = () => {
        if (!notes.trim()) {
            Alert.alert('No response', 'Please write your spoken response in the notes box first.');
            return;
        }
    const result = analyzeSpeakingResponse(notes, item);
    setFeedback(result);
    setRubricResult(scoreSpeakingRubric({
      text: notes,
      prompt: item?.prompt || item?.title || '',
      targetWords: Math.max(90, Math.round((parseFloat(String(item?.time || '2')) || 2) * 60)),
    }));
  };

    // Derive speaking structure template from task type
    const structureTemplates = {
        description: ['Opening sentence: introduce the topic', 'Main details (3 points)', 'Closing sentence / personal opinion'],
        comparison: ['Introduce topic briefly', 'Point 1 (with contrast)', 'Point 2 (with contrast)', 'Balanced conclusion'],
        discussion: ['State the issue', 'Side A: advantages/support', 'Side B: disadvantages/opposition', 'Your view + reasoning'],
        argument: ['State your position clearly', 'Argument 1 + example', 'Counter-argument + refutation', 'Strong conclusion'],
        'problem-solution': ['Name the problem + causes', 'Consequence/impact', 'Solution 1 (individual)', 'Solution 2 (government/society)'],
        'cause-effect': ['Introduce phenomenon', 'Cause 1 → Effect', 'Cause 2 → Effect', 'Overall evaluation'],
        critical: ['Define / frame the debate', 'Side A evidence', 'Side B evidence + your nuanced stance', 'Qualified conclusion'],
    };

    const structure = structureTemplates[item.type] || [];
    const openEndedPrompts = buildSpeakingOpenEndedPrompts(item);
    const speakingIssues = React.useMemo(() => detectBasicErrors(notes).slice(0, 6), [notes]);
    const speakingWordUpgrades = React.useMemo(() => suggestSynonyms(notes).slice(0, 5), [notes]);
    const improvedDraft = React.useMemo(() => buildImprovedSpeakingDraft(notes, feedback), [notes, feedback]);
    const fluencyStats = React.useMemo(() => buildFluencyStats(notes, timer), [notes, timer]);
    const selfCheckDone = Object.values(selfCheck).filter(Boolean).length;

    return (
        <Screen scroll contentStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.badges}>
                    <View style={[styles.badge, { backgroundColor: LEVEL_COLORS[item.level] }]}>
                        <Text style={styles.badgeText}>{item.level}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[item.type] || colors.muted }]}>
                        <Text style={styles.badgeText}>{item.type}</Text>
                    </View>
                    <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>⏱ {item.time}</Text>
                    </View>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>📁 {item.category}</Text>
            </View>

            {/* Question Card */}
            <Card style={styles.questionCard} glow>
                <Text style={styles.questionLabel}>❓ Prompt</Text>
                <Text style={styles.questionText}>{item.prompt}</Text>
                <View style={styles.ttsRow}>
                    <Button
                        label={ttsReading ? '🔊 Stop' : '🔊 Listen'}
                        variant={ttsReading ? 'primary' : 'secondary'}
                        onPress={ttsReading ? stopSpeak : () => speak(item.prompt)}
                        style={styles.actionBtn}
                    />
                </View>
            </Card>

            {/* Structure Guide */}
            <Card style={styles.card}>
                <TouchableOpacity
                    onPress={() => setShowStructure(v => !v)}
                    style={styles.collapsibleHeader}
                >
                    <Text style={styles.sectionTitle}>📋 Response Structure</Text>
                    <Text style={styles.chevron}>{showStructure ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showStructure && (
                    <View style={styles.structureBody}>
                        {structure.map((s, i) => (
                            <View key={i} style={styles.structureItem}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepText}>{i + 1}</Text>
                                </View>
                                <Text style={styles.structureText}>{s}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Card>

            {/* Key Vocabulary */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>📖 Key Vocabulary</Text>
                <View style={styles.vocabRow}>
                    {item.vocab.map((w, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.vocabChip}
                            onPress={() => speak(w)}
                        >
                            <Text style={styles.vocabWord}>{w}</Text>
                            <Text style={styles.vocabTap}> 🔊</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.vocabHint}>Tap a word to hear its pronunciation</Text>
            </Card>

            {/* Tips */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>💡 Tips</Text>
                {item.tips.map((t, i) => (
                    <Text key={i} style={styles.tip}>• {t}</Text>
                ))}
            </Card>

            {/* Timer */}
            <Card style={styles.timerCard}>
                <Text style={styles.sectionTitle}>⏱ Practice Timer</Text>
                <Text style={styles.timerDisplay}>{formatTime(timer)}</Text>
                <View style={styles.timerButtons}>
                    <Button
                        label={timerRunning ? 'Stop Timer' : 'Start Timer'}
                        onPress={timerRunning ? stopTimer : startTimer}
                        variant={timerRunning ? 'primary' : 'secondary'}
                        style={styles.timerBtn}
                    />
                    <Button label="Reset" onPress={resetTimer} variant="ghost" style={styles.timerBtn} />
                </View>
            </Card>

            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>⚡ Fluency Tracker</Text>
                <View style={styles.scoreRow}>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreNum}>{fluencyStats.words}</Text>
                        <Text style={styles.scoreLabel}>Words</Text>
                    </View>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreNum}>{fluencyStats.wpm}</Text>
                        <Text style={styles.scoreLabel}>WPM</Text>
                    </View>
                    <View style={styles.scoreItem}>
                        <Text style={[styles.scoreNum, fluencyStats.fillerCount > 3 ? { color: colors.error } : null]}>{fluencyStats.fillerCount}</Text>
                        <Text style={styles.scoreLabel}>Fillers</Text>
                    </View>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreNum}>{fluencyStats.sentenceCount}</Text>
                        <Text style={styles.scoreLabel}>Sentences</Text>
                    </View>
                </View>
                <Text style={styles.subTextMuted}>Target: 90+ words, 90-140 WPM, low filler words.</Text>
            </Card>

            {/* Notes / Written Practice */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>🎙 Your Response</Text>
                <Text style={styles.notesHint}>
                    Tap the microphone to speak, or type your response manually below.
                </Text>
                <View style={styles.micRow}>
                    <TouchableOpacity
                        style={[styles.micBtn, isRecording && styles.micBtnActive]}
                        onPress={toggleRecording}
                    >
                        <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
                        <Text style={[styles.micText, isRecording && styles.micTextActive]}>
                            {isRecording ? 'Listening...' : 'Tap to Speak'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Write your answer here..."
                    placeholderTextColor={colors.muted}
                    textAlignVertical="top"
                />
                <View style={styles.analyzeRow}>
                    <Button label="Analyse Response" onPress={handleAnalyze} style={styles.analyzeMainBtn} />
                    {notes.trim() ? (
                        <Button label="🔊 Read" variant="secondary" onPress={() => speak(notes)} />
                    ) : null}
                </View>
                <View style={styles.selfCheckBox}>
                    <Text style={styles.fbSectionTitle}>Self-Check ({selfCheckDone}/4)</Text>
                    <View style={styles.rowWrap}>
                        {[
                            ['thesis', 'Thesis'],
                            ['example', 'Example'],
                            ['connector', 'Connector'],
                            ['conclusion', 'Conclusion'],
                        ].map(([key, label]) => (
                            <TouchableOpacity
                                key={key}
                                style={[styles.checkPill, selfCheck[key] && styles.checkPillActive]}
                                onPress={() => setSelfCheck((prev) => ({ ...prev, [key]: !prev[key] }))}
                            >
                                <Text style={[styles.checkPillText, selfCheck[key] && styles.checkPillTextActive]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Card>

            {/* AI Feedback */}
            {feedback && (
                <Card style={styles.feedbackCard} glow>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>📊 Response Analysis</Text>

                    {/* Band estimate */}
                    <View style={[styles.bandRow, { borderColor: LEVEL_COLORS[item.level] || colors.primaryDark }]}>
                        <Text style={styles.bandLabel}>Estimated Band</Text>
                        <Text style={[styles.bandValue, { color: LEVEL_COLORS[item.level] || colors.primaryDark }]}>
                            {feedback.band}
                        </Text>
                    </View>

                    {/* Score row */}
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreNum}>{feedback.wordCount}</Text>
                            <Text style={styles.scoreLabel}>Words</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={[styles.scoreNum, { color: feedback.lengthOk ? colors.success : colors.error }]}>
                                {feedback.lengthOk ? 'Good' : 'Short'}
                            </Text>
                            <Text style={styles.scoreLabel}>Length</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreNum}>{feedback.connectorCount}</Text>
                            <Text style={styles.scoreLabel}>Links</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreNum}>{feedback.vocabMatches}</Text>
                            <Text style={styles.scoreLabel}>Vocab</Text>
                        </View>
                    </View>

                    {/* Strengths */}
                    {feedback.strengths.length > 0 && (
                        <View style={styles.fbSection}>
                            <Text style={styles.fbSectionTitle}>✅ Strengths</Text>
                            {feedback.strengths.map((s, i) => (
                                <Text key={i} style={styles.fbPositive}>• {s}</Text>
                            ))}
                        </View>
                    )}

                    {/* Improvements */}
                    {feedback.improvements.length > 0 && (
                        <View style={styles.fbSection}>
                            <Text style={styles.fbSectionTitle}>⚠️ To Improve</Text>
                            {feedback.improvements.map((s, i) => (
                                <Text key={i} style={styles.fbNegative}>• {s}</Text>
                            ))}
                        </View>
                    )}

                    {/* Connector suggestions */}
                    {feedback.missingConnectors.length > 0 && (
                        <View style={styles.fbSection}>
                            <Text style={styles.fbSectionTitle}>🔗 Try These Connectors Next Time</Text>
                            <Text style={styles.connectorList}>{feedback.missingConnectors.join(' • ')}</Text>
                        </View>
                    )}

                    {/* Writing-like grammar/clarity alerts for speaking transcript */}
                    <View style={styles.fbSection}>
                        <Text style={styles.fbSectionTitle}>🛠 Grammar & Clarity Alerts</Text>
                        {speakingIssues.length > 0 ? (
                            speakingIssues.map((issue) => (
                                <Text key={issue} style={styles.fbNegative}>• {issue}</Text>
                            ))
                        ) : (
                            <Text style={styles.fbPositive}>• No major basic issues detected.</Text>
                        )}
                    </View>

                    {/* Lexical upgrade suggestions */}
                    <View style={styles.fbSection}>
                        <Text style={styles.fbSectionTitle}>📚 Word Upgrade Suggestions</Text>
                        {speakingWordUpgrades.length > 0 ? (
                            speakingWordUpgrades.map((w) => (
                                <Text key={w.word} style={styles.bodyLine}>• {w.word} → {w.synonyms.slice(0, 3).join(', ') || 'no suggestion'}</Text>
                            ))
                        ) : (
                            <Text style={styles.subTextMuted}>No repeated weak words found.</Text>
                        )}
                    </View>

                    {/* Improved response draft */}
                    {improvedDraft ? (
                        <View style={styles.fbSection}>
                            <Text style={styles.fbSectionTitle}>✨ Improved Version (AI Draft)</Text>
                            <Text style={styles.improvedDraft}>{improvedDraft}</Text>
                            <Button label="🔊 Read Improved Draft" variant="secondary" onPress={() => speak(improvedDraft)} />
                        </View>
                    ) : null}
                </Card>
            )}

            {rubricResult && (
                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>🧪 Auto Rubric (Speaking)</Text>
                    <Text style={styles.rubricTotal}>
                        {rubricResult.total}/{rubricResult.max} • {rubricResult.band}
                    </Text>
                    {rubricResult.categories.map((c) => (
                        <Text key={c.name} style={styles.bodyLine}>{c.name}: {c.score}/{c.max}</Text>
                    ))}
                    {rubricResult.strengths.length > 0 && (
                        <View style={styles.fbSection}>
                            <Text style={styles.fbSectionTitle}>Strong Areas</Text>
                            {rubricResult.strengths.map((s) => (
                                <Text key={s} style={styles.fbPositive}>• {s}</Text>
                            ))}
                        </View>
                    )}
                    {rubricResult.improvements.length > 0 && (
                        <View style={styles.fbSection}>
                            <Text style={styles.fbSectionTitle}>Next Fixes</Text>
                            {rubricResult.improvements.map((s) => (
                                <Text key={s} style={styles.fbNegative}>• {s}</Text>
                            ))}
                        </View>
                    )}
                </Card>
            )}

            <OpenEndedPracticeCard
                title="Open-Ended Speaking Practice"
                prompts={openEndedPrompts}
                placeholder="Write your speaking notes / answer..."
            />

            {/* Model Answer */}
            <Card style={styles.card}>
                <TouchableOpacity
                    onPress={() => setShowModel(v => !v)}
                    style={styles.collapsibleHeader}
                >
                    <Text style={styles.sectionTitle}>📝 Model Answer</Text>
                    <Text style={styles.chevron}>{showModel ? '▲ Hide' : '▼ Show'}</Text>
                </TouchableOpacity>
                {showModel && (
                    <View>
                        <Text style={styles.modelText}>{item.model_answer}</Text>
                        <Button
                            label="🔊 Read Model Answer"
                            variant="secondary"
                            onPress={() => speak(item.model_answer)}
                            style={{ marginTop: spacing.md }}
                        />
                    </View>
                )}
            </Card>

            {/* Follow-up Questions */}
            {item.follow_up?.length > 0 && (
                <Card style={styles.card}>
                    <TouchableOpacity
                        onPress={() => setShowFollowUp(v => !v)}
                        style={styles.collapsibleHeader}
                    >
                        <Text style={styles.sectionTitle}>🔄 Follow-up Questions</Text>
                        <Text style={styles.chevron}>{showFollowUp ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showFollowUp && item.follow_up.map((f, i) => (
                        <TouchableOpacity key={i} onPress={() => speak(f)} style={styles.followUpItem}>
                            <Text style={styles.followUpText}>{f}</Text>
                            <Text style={styles.followUpSpeak}>🔊</Text>
                        </TouchableOpacity>
                    ))}
                </Card>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: { paddingBottom: spacing.xl },
    header: { marginBottom: spacing.md },
    badges: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    badgeText: { color: '#fff', fontSize: typography.xsmall, fontFamily: typography.fontHeadline, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    timeBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
    },
    timeText: { fontSize: typography.xsmall, color: colors.muted, fontWeight: '600' },
    title: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    category: { fontSize: typography.small, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
    questionCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
        borderWidth: 0,
        borderRadius: radius.xl,
        paddingVertical: spacing.xl,
    },
    questionLabel: {
        fontSize: typography.xsmall,
        color: colors.primaryLight,
        marginBottom: spacing.sm,
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    questionText: {
        fontSize: typography.h3,
        color: '#fff',
        lineHeight: 28,
        marginBottom: spacing.xl,
        fontFamily: typography.fontBody,
    },
    ttsRow: { flexDirection: 'row' },
    actionBtn: { height: 40, paddingHorizontal: spacing.lg, minWidth: 0 },
    card: { marginBottom: spacing.md, borderRadius: radius.xl },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    chevron: { fontSize: typography.small, color: colors.primary, fontFamily: typography.fontHeadline, fontWeight: '700' },
    sectionTitle: {
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        fontWeight: '700',
    },
    structureBody: { marginTop: spacing.md },
    structureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: { color: colors.primaryDark, fontSize: 14, fontFamily: typography.fontHeadline, fontWeight: '700' },
    structureText: { flex: 1, fontSize: typography.body, color: colors.text, marginTop: 3, lineHeight: 22 },
    vocabRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    vocabChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: radius.pill,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    vocabWord: { fontSize: typography.small, color: colors.primaryDark, fontFamily: typography.fontHeadline, fontWeight: '600' },
    vocabTap: { fontSize: 13 },
    vocabHint: { fontSize: typography.xsmall, color: colors.muted, marginTop: spacing.xs },
    tip: { fontSize: typography.small, color: colors.muted, marginBottom: 8, marginTop: 4, lineHeight: 20 },
    timerCard: { marginBottom: spacing.md, alignItems: 'center', paddingVertical: spacing.xl },
    timerDisplay: {
        fontSize: 56,
        fontFamily: typography.fontHeadline,
        color: colors.primary,
        fontWeight: '800',
        marginVertical: spacing.lg,
    },
    timerButtons: { flexDirection: 'row', gap: spacing.md },
    timerBtn: { flex: 1, height: 48, minWidth: 0 },
    notesHint: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md, marginTop: spacing.xs },
    notesInput: {
        backgroundColor: colors.bg,
        borderRadius: radius.md,
        padding: spacing.md,
        minHeight: 160,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: typography.body,
        color: colors.text,
        marginBottom: spacing.md,
        lineHeight: 24,
    },
    micRow: { alignItems: 'center', marginBottom: spacing.lg },
    micBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
    },
    micBtnActive: {
        backgroundColor: colors.errorLight,
    },
    micIcon: { fontSize: 24, includeFontPadding: false },
    micText: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '700' },
    micTextActive: { color: colors.error },
    analyzeRow: { flexDirection: 'row', gap: spacing.md },
    analyzeMainBtn: { flex: 1 },
    selfCheckBox: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.sm,
        backgroundColor: colors.surface,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    checkPill: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        backgroundColor: colors.bg,
    },
    checkPillActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    checkPillText: {
        fontSize: typography.xsmall,
        color: colors.text,
        fontFamily: typography.fontHeadline,
    },
    checkPillTextActive: {
        color: colors.primaryDark,
    },
    feedbackCard: { marginBottom: spacing.md, paddingVertical: spacing.xl },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
        backgroundColor: colors.bg,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },
    scoreItem: { alignItems: 'center' },
    scoreNum: {
        fontSize: typography.h2,
        fontFamily: typography.fontHeadline,
        color: colors.primaryDark,
        fontWeight: '800',
    },
    scoreLabel: { fontSize: typography.xsmall, color: colors.muted, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
    bandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderWidth: 2,
        borderRadius: radius.md,
        marginVertical: spacing.lg,
        backgroundColor: colors.surface,
    },
    bandLabel: { fontSize: typography.body, color: colors.text, fontFamily: typography.fontHeadline, fontWeight: '700' },
    bandValue: { fontSize: typography.h3, fontFamily: typography.fontHeadline, fontWeight: '800' },
    fbSection: { marginBottom: spacing.md },
    fbSectionTitle: {
        fontSize: typography.small,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    fbPositive: { fontSize: typography.small, color: colors.success, marginBottom: 4, lineHeight: 20 },
    fbNegative: { fontSize: typography.small, color: colors.warning, marginBottom: 4, lineHeight: 20 },
    subTextMuted: { fontSize: typography.small, color: colors.muted },
    bodyLine: { fontSize: typography.small, color: colors.text, marginBottom: 4 },
    rubricTotal: {
        fontSize: typography.h3,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.sm,
    },
    connectorList: { fontSize: typography.small, color: colors.primaryDark, lineHeight: 22, fontWeight: '600', marginTop: spacing.xs },
    improvedDraft: {
        fontSize: typography.small,
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.sm,
    },
    modelText: {
        fontSize: typography.body,
        color: colors.text,
        lineHeight: 26,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        fontFamily: typography.fontBody,
    },
    followUpItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.sm,
    },
    followUpText: { flex: 1, fontSize: typography.small, color: colors.text, lineHeight: 22 },
    followUpSpeak: { fontSize: 20, marginTop: -2 },
});
