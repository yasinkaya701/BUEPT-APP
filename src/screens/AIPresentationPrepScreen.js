import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { generatePresentationDeck, isDemoAiConfigured } from '../utils/demoAi';
import { getAiSourceMeta } from '../utils/aiWorkspace';

const DURATION_OPTIONS = [5, 8, 10, 15];
const TONE_OPTIONS = ['Academic', 'Persuasive', 'Conference', 'Student-Friendly'];
const LEVEL_OPTIONS = ['B1', 'B2', 'C1'];
const TOPIC_SUGGESTIONS = [
    'The ethics of artificial intelligence in higher education',
    'Why effective note-taking improves academic performance',
    'The role of renewable energy in sustainable cities',
    'How social media shapes university student behavior',
    'The benefits and risks of remote learning',
];

function sourceLabel(source = '') {
    if (source === 'openai') return 'OpenAI Live';
    if (source === 'online') return 'Online AI';
    if (source === 'online-ready') return 'API Ready';
    if (source === 'local-api-mock') return 'Local AI';
    if (source === 'offline-fallback') return 'Offline Fallback';
    return 'Offline Generator';
}

export default function AIPresentationPrepScreen({ navigation, route }) {
    const [topic, setTopic] = useState('');
    const [step, setStep] = useState('input'); // input, generating, results
    const [slides, setSlides] = useState([]);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState({
        title: '',
        summary: '',
        model: '',
        audience: '',
        opener: '',
        closer: '',
        transitions: [],
        qaTips: [],
        deliveryNotes: [],
        diagnostic: '',
    });
    const [durationMin, setDurationMin] = useState(10);
    const [tone, setTone] = useState('Academic');
    const [level, setLevel] = useState('B2');
    const [source, setSource] = useState(isDemoAiConfigured('presentation') ? 'online-ready' : 'offline');
    const spinLoopRef = useRef(null);

    // Animation for generating state
    const spinAnim = useRef(new Animated.Value(0)).current;
    const normalizedTopic = useMemo(() => topic.trim(), [topic]);
    const sourceMeta = useMemo(() => getAiSourceMeta(source), [source]);
    const minutesPerSlide = useMemo(
        () => (slides.length ? Math.max(1, Math.round(durationMin / slides.length)) : 0),
        [durationMin, slides.length]
    );
    const timingPlan = useMemo(
        () => slides.map((slide, index) => ({
            id: `${slide.title}-${index}`,
            title: slide.title,
            time: `${Math.max(1, Math.round(durationMin / Math.max(1, slides.length)))} min`,
            goal: slide.points?.[0] || 'Explain the main idea clearly.',
        })),
        [durationMin, slides]
    );
    const presenterChecklist = useMemo(() => {
        const list = [
            'Open with the thesis before showing evidence.',
            'Keep one main claim per slide.',
            'Use one transition sentence between every two slides.',
            'Leave 30 seconds for questions or recap.',
        ];
        if (meta.opener) list.unshift('Memorize your first 1-2 lines so the opening sounds controlled.');
        if (meta.closer) list.push('Finish with a final judgement, not just a summary.');
        return list.slice(0, 5);
    }, [meta.closer, meta.opener]);
    const likelyQuestions = useMemo(() => {
        const base = normalizedTopic || meta.title || 'your topic';
        return [
            `What is the strongest real-world example that supports ${base}?`,
            `What is one limitation or counter-argument related to ${base}?`,
            `How would you explain ${base} to a first-year student in one sentence?`,
        ];
    }, [meta.title, normalizedTopic]);

    useEffect(() => {
        return () => {
            if (spinLoopRef.current) spinLoopRef.current.stop();
            spinAnim.stopAnimation();
        };
    }, [spinAnim]);

    useEffect(() => {
        const incomingTopic = String(route?.params?.topic || '').trim();
        if (incomingTopic) {
            setTopic(incomingTopic);
        }
    }, [route?.params?.topic]);

    const generatePresentation = async () => {
        if (!normalizedTopic) {
            setError('Please enter a topic.');
            return;
        }
        setError('');
        setStep('generating');
        setSlides([]);
        setMeta({
            title: '',
            summary: '',
            model: '',
            audience: '',
            opener: '',
            closer: '',
            transitions: [],
            qaTips: [],
            deliveryNotes: [],
            diagnostic: '',
        });
        spinAnim.setValue(0);

        spinLoopRef.current = Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 1400, useNativeDriver: true })
        );
        spinLoopRef.current.start();

        try {
            const data = await generatePresentationDeck({
                topic: normalizedTopic,
                durationMin,
                tone,
                level,
            });
            setSlides(Array.isArray(data?.slides) ? data.slides : []);
            setSource(data?.source || 'offline');
            setMeta({
                title: String(data?.title || normalizedTopic),
                summary: String(data?.summary || ''),
                model: String(data?.model || ''),
                audience: String(data?.audience || ''),
                opener: String(data?.opener || ''),
                closer: String(data?.closer || ''),
                transitions: Array.isArray(data?.transitions) ? data.transitions : [],
                qaTips: Array.isArray(data?.qaTips) ? data.qaTips : [],
                deliveryNotes: Array.isArray(data?.deliveryNotes) ? data.deliveryNotes : [],
                diagnostic: String(data?.diagnostic || ''),
            });
            setStep('results');
        } catch (_) {
            setError('Generation failed. Please try again.');
            setStep('input');
        } finally {
            if (spinLoopRef.current) spinLoopRef.current.stop();
            spinAnim.setValue(0);
        }
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>AI Presentation Prep</Text>
                    <Text style={styles.subtitle}>Academic Presentation Architect</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {step === 'input' && (
                    <View style={styles.inputSection}>
                        <Card style={styles.introCard} glow>
                            <Ionicons name="bulb-outline" size={28} color={colors.primary} />
                            <Text style={styles.introText}>Enter a topic and generate a usable slide flow, talk track, and delivery cues. The output adapts to your time limit, tone, and target level.</Text>
                        </Card>

                        <Text style={styles.label}>What is your topic?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. The impact of AI on medicine"
                            value={topic}
                            onChangeText={setTopic}
                            placeholderTextColor={colors.muted}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Card compact style={styles.briefCard}>
                            <View style={styles.briefRow}>
                                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                                <Text style={styles.briefText}>
                                    {tone} • {level} • {durationMin} min
                                </Text>
                            </View>
                            <Text style={styles.briefSub}>
                                Best for BUEPT-style academic talks, classroom presentations, and speaking demos.
                            </Text>
                        </Card>

                        <OptionSelector
                            label="Duration"
                            icon="time-outline"
                            options={DURATION_OPTIONS}
                            selected={durationMin}
                            onChange={setDurationMin}
                            formatLabel={(item) => `${item} min`}
                        />

                        <OptionSelector
                            label="Tone"
                            icon="school-outline"
                            options={TONE_OPTIONS}
                            selected={tone}
                            onChange={setTone}
                        />

                        <OptionSelector
                            label="Level"
                            icon="stats-chart-outline"
                            options={LEVEL_OPTIONS}
                            selected={level}
                            onChange={setLevel}
                        />

                        <Text style={styles.sectionLabel}>Suggested topics</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicSuggestionRow}>
                            {TOPIC_SUGGESTIONS.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.topicSuggestionChip}
                                    onPress={() => setTopic(item)}
                                    activeOpacity={0.88}
                                >
                                    <Ionicons name="flash-outline" size={14} color={colors.primaryDark} />
                                    <Text style={styles.topicSuggestionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Button
                            label="Generate Presentation"
                            icon="color-wand-outline"
                            onPress={generatePresentation}
                            disabled={!normalizedTopic}
                            style={{ marginTop: spacing.lg }}
                        />
                    </View>
                )}

                {step === 'generating' && (
                    <View style={styles.loadingArea}>
                        <Animated.View style={{ transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                            <Ionicons name="sync" size={60} color={colors.primary} />
                        </Animated.View>
                        <Text style={styles.loadingTitle}>Architecting Slides...</Text>
                        <Text style={styles.loadingSub}>Analyzing topic structure and drafting academic scripts.</Text>
                    </View>
                )}

                {step === 'results' && (
                    <View style={styles.resultsArea}>
                        <View style={styles.resultHeader}>
                            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                            <Text style={styles.resultHeading}>Presentation Ready!</Text>
                        </View>
                        <Card compact style={styles.sourceCard}>
                            <View style={styles.sourceRow}>
                                <View>
                                    <Text style={styles.sourceTitle}>{sourceMeta.label}</Text>
                                    <Text style={styles.sourceText}>{sourceMeta.detail}</Text>
                                </View>
                                <View style={styles.sourceBadge}>
                                    <Text style={styles.sourceBadgeText}>{sourceLabel(source)}</Text>
                                </View>
                            </View>
                        </Card>

                        <Card style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>{meta.title || normalizedTopic}</Text>
                            <View style={styles.summaryGrid}>
                                <SummaryMetric label="Slides" value={String(slides.length)} />
                                <SummaryMetric label="Pace" value={`${minutesPerSlide} min`} />
                                <SummaryMetric label="Tone" value={tone} />
                                <SummaryMetric label="Level" value={level} />
                                {meta.model ? <SummaryMetric label="Model" value={meta.model} /> : null}
                            </View>
                            {meta.summary ? (
                                <Text style={styles.summaryBody}>{meta.summary}</Text>
                            ) : null}
                            <Text style={styles.summaryFootnote}>
                                Use each slide as one clear speaking block. Keep examples concrete and leave 30-45 seconds for transitions.
                            </Text>
                        </Card>

                        <Card style={styles.coachCard}>
                            <Text style={styles.coachTitle}>Timing Plan</Text>
                            {timingPlan.map((item) => (
                                <View key={item.id} style={styles.planRow}>
                                    <View style={styles.planTimePill}>
                                        <Text style={styles.planTimeText}>{item.time}</Text>
                                    </View>
                                    <View style={styles.planCopy}>
                                        <Text style={styles.planTitle}>{item.title}</Text>
                                        <Text style={styles.planBody}>{item.goal}</Text>
                                    </View>
                                </View>
                            ))}
                        </Card>

                        {meta.diagnostic ? (
                            <Card style={styles.warningCard}>
                                <View style={styles.warningRow}>
                                    <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
                                    <Text style={styles.warningTitle}>Live AI status</Text>
                                </View>
                                <Text style={styles.warningText}>{meta.diagnostic}</Text>
                            </Card>
                        ) : null}

                        {(meta.opener || meta.closer || meta.transitions.length > 0 || meta.qaTips.length > 0 || meta.deliveryNotes.length > 0) ? (
                            <Card style={styles.coachCard}>
                                <Text style={styles.coachTitle}>Speaker Notes</Text>
                                {meta.audience ? (
                                    <Text style={styles.coachSub}>Audience: {meta.audience}</Text>
                                ) : null}
                                {meta.opener ? (
                                    <View style={styles.noteBlock}>
                                        <Text style={styles.noteLabel}>Opening line</Text>
                                        <Text style={styles.noteText}>{meta.opener}</Text>
                                    </View>
                                ) : null}
                                {meta.closer ? (
                                    <View style={styles.noteBlock}>
                                        <Text style={styles.noteLabel}>Closing line</Text>
                                        <Text style={styles.noteText}>{meta.closer}</Text>
                                    </View>
                                ) : null}
                                {meta.transitions.length > 0 ? (
                                    <View style={styles.noteBlock}>
                                        <Text style={styles.noteLabel}>Transitions</Text>
                                        {meta.transitions.map((item, index) => (
                                            <Text key={`transition-${index}`} style={styles.noteListItem}>• {item}</Text>
                                        ))}
                                    </View>
                                ) : null}
                                {meta.deliveryNotes.length > 0 ? (
                                    <View style={styles.noteBlock}>
                                        <Text style={styles.noteLabel}>Delivery notes</Text>
                                        {meta.deliveryNotes.map((item, index) => (
                                            <Text key={`delivery-${index}`} style={styles.noteListItem}>• {item}</Text>
                                        ))}
                                    </View>
                                ) : null}
                                {meta.qaTips.length > 0 ? (
                                    <View style={styles.noteBlock}>
                                        <Text style={styles.noteLabel}>Q&A tips</Text>
                                        {meta.qaTips.map((item, index) => (
                                            <Text key={`qa-${index}`} style={styles.noteListItem}>• {item}</Text>
                                        ))}
                                    </View>
                                ) : null}
                            </Card>
                        ) : null}

                        <Card style={styles.coachCard}>
                            <Text style={styles.coachTitle}>Presenter Checklist</Text>
                            {presenterChecklist.map((item, index) => (
                                <Text key={`check-${index}`} style={styles.noteListItem}>• {item}</Text>
                            ))}
                            <Text style={[styles.noteLabel, styles.noteLabelGap]}>Likely Q&A</Text>
                            {likelyQuestions.map((item, index) => (
                                <Text key={`qa-predict-${index}`} style={styles.noteListItem}>• {item}</Text>
                            ))}
                        </Card>

                        <View style={styles.resultsActionRow}>
                            <Button
                                label="Regenerate"
                                variant="secondary"
                                icon="refresh-outline"
                                onPress={generatePresentation}
                                style={styles.resultActionBtn}
                            />
                            <Button
                                label="Edit Brief"
                                variant="ghost"
                                icon="create-outline"
                                onPress={() => setStep('input')}
                                style={styles.resultActionBtn}
                            />
                        </View>

                        {slides.map((slide, index) => (
                            <Card key={`${slide.title}-${index}`} style={styles.slideCard}>
                                <View style={styles.slideNumber}>
                                    <Text style={styles.slideNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.slideTitle}>{slide.title}</Text>

                                <View style={styles.pointsList}>
                                    {slide.points.map((p, i) => (
                                        <View key={i} style={styles.pointRow}>
                                            <View style={styles.bullet} />
                                            <Text style={styles.pointText}>{p}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.scriptSection}>
                                    <Text style={styles.scriptLabel}>Pro Script:</Text>
                                    <Text style={styles.scriptText}>"{slide.script}"</Text>
                                </View>

                                <View style={styles.cueBadge}>
                                    <Ionicons name="walk-outline" size={14} color={colors.accent} />
                                    <Text style={styles.cueText}>{slide.cues}</Text>
                                </View>
                            </Card>
                        ))}

                        <Button
                            label="Start Over"
                            variant="secondary"
                            onPress={() => {
                                setStep('input');
                                setSlides([]);
                                setTopic('');
                                setError('');
                                setMeta({
                                    title: '',
                                    summary: '',
                                    model: '',
                                    audience: '',
                                    opener: '',
                                    closer: '',
                                    transitions: [],
                                    qaTips: [],
                                    deliveryNotes: [],
                                    diagnostic: '',
                                });
                                setSource(isDemoAiConfigured('presentation') ? 'online-ready' : 'offline');
                            }}
                            style={styles.startOverBtn}
                        />
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}

const OptionSelector = ({ label, options, selected, onChange, icon, formatLabel = (value) => String(value) }) => (
    <View style={styles.optionSection}>
        <View style={styles.optionHeadingRow}>
            <Ionicons name={icon} size={16} color={colors.primaryDark} />
            <Text style={styles.optionHeading}>{label}</Text>
        </View>
        <View style={styles.optionPillRow}>
            {options.map((item) => {
                const isActive = item === selected;
                return (
                    <TouchableOpacity
                        key={String(item)}
                        style={[styles.selectionChip, isActive && styles.selectionChipActive]}
                        onPress={() => onChange(item)}
                    >
                        <Text style={[styles.selectionChipText, isActive && styles.selectionChipTextActive]}>
                            {formatLabel(item)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);

const SummaryMetric = ({ label, value }) => (
    <View style={styles.summaryMetric}>
        <Text style={styles.summaryMetricLabel}>{label}</Text>
        <Text style={styles.summaryMetricValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, paddingTop: spacing.md },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    title: { fontSize: 24, fontWeight: '800', color: colors.primaryDark, fontFamily: typography.fontHeadline },
    subtitle: { fontSize: 12, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

    introCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.primarySoft, borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: spacing.xl, gap: spacing.md },
    introText: { flex: 1, fontSize: 14, color: colors.primaryDark, lineHeight: 20 },

    label: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    input: { backgroundColor: '#fff', borderRadius: radius.md, padding: spacing.md, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', ...shadow.slight, marginBottom: spacing.lg },
    errorText: { color: colors.error, fontSize: 12, fontWeight: '700', marginTop: -10, marginBottom: spacing.md },
    briefCard: { marginBottom: spacing.lg, backgroundColor: '#FFFFFF' },
    briefRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    briefText: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },
    briefSub: { fontSize: 13, color: colors.muted, lineHeight: 18 },
    optionSection: { marginBottom: spacing.lg },
    optionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
    optionHeading: { fontSize: 13, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 0.4 },
    optionPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    selectionChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: '#D6E3F8',
        backgroundColor: '#FFFFFF',
    },
    selectionChipActive: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primaryDark,
    },
    selectionChipText: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
    selectionChipTextActive: { color: '#FFFFFF' },
    sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.sm },
    topicSuggestionRow: { gap: 10, paddingBottom: 2 },
    topicSuggestionChip: {
        maxWidth: 280,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderColor: '#D6E3F8',
        borderRadius: radius.lg,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    topicSuggestionText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700', lineHeight: 18 },

    loadingArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    loadingTitle: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, marginTop: spacing.xl },
    loadingSub: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },

    resultsArea: { paddingTop: spacing.sm },
    resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: 8 },
    resultHeading: { fontSize: 18, fontWeight: '800', color: colors.success },
    sourceCard: { marginBottom: spacing.md, backgroundColor: '#FBFDFF' },
    sourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    sourceTitle: { fontSize: 14, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
    sourceText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 18 },
    sourceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.pill,
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderColor: '#D6E3F8',
    },
    sourceBadgeText: { fontSize: 11, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase' },
    summaryCard: { marginBottom: spacing.md },
    summaryTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.md, lineHeight: 24 },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    summaryMetric: {
        minWidth: 110,
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    summaryMetricLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
    summaryMetricValue: { fontSize: 16, fontWeight: '800', color: colors.primaryDark },
    summaryBody: { marginTop: spacing.md, fontSize: 14, lineHeight: 21, color: colors.text },
    summaryFootnote: { marginTop: spacing.md, fontSize: 13, lineHeight: 19, color: colors.muted },
    warningCard: { backgroundColor: colors.warningLight, borderColor: '#F3D5A6' },
    warningRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    warningTitle: { fontSize: 14, fontWeight: '800', color: colors.warning },
    warningText: { fontSize: 13, color: '#7C5A12', lineHeight: 19 },
    coachCard: { marginBottom: spacing.md },
    coachTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
    coachSub: { fontSize: 13, color: colors.muted, marginBottom: spacing.md },
    noteBlock: { marginTop: spacing.sm },
    noteLabel: { fontSize: 12, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', marginBottom: 6 },
    noteLabelGap: { marginTop: spacing.md },
    noteText: { fontSize: 14, color: colors.text, lineHeight: 21 },
    noteListItem: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 3 },
    planRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F7',
    },
    planTimePill: {
        minWidth: 62,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: radius.pill,
        backgroundColor: colors.primarySoft,
    },
    planTimeText: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },
    planCopy: { flex: 1 },
    planTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 2 },
    planBody: { fontSize: 13, color: colors.muted, lineHeight: 18 },
    resultsActionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    resultActionBtn: { flex: 1 },
    startOverBtn: { marginTop: spacing.xl, marginBottom: 40 },

    slideCard: { padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.lg, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    slideNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
    slideNumberText: { color: '#fff', fontSize: 14, fontWeight: '900' },
    slideTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },

    pointsList: { marginBottom: spacing.md },
    pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 8 },
    pointText: { fontSize: 15, color: colors.text, lineHeight: 22 },

    scriptSection: { backgroundColor: '#F1F5F9', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
    scriptLabel: { fontSize: 12, fontWeight: '800', color: colors.primary, marginBottom: 4, textTransform: 'uppercase' },
    scriptText: { fontSize: 14, color: colors.text, fontStyle: 'italic', lineHeight: 20 },

    cueBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(230, 126, 34, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, alignSelf: 'flex-start' },
    cueText: { fontSize: 11, fontWeight: '700', color: colors.accent }
});
