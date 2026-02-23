import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MOCK_PRESENTATION_DATA = {
    "Climate Change": [
        { title: "Introduction", points: ["Definition of Climate Change", "The greenhouse effect mechanism", "Historical data overview"], script: "Welcome everyone. Today we are exploring the existential threat of climate change, specifically how the greenhouse effect functions as a thermal blanket for our planet.", cues: "Maintain eye contact, open palms." },
        { title: "Causes", points: ["Industrial emissions", "Deforestation", "Methane from agriculture"], script: "The primary drivers are anthropogenic. We see a direct correlation between industrial CO2 output and global temperature spikes.", cues: "Point to a hypothetical chart on your left." },
        { title: "Solutions", points: ["Renewable energy transition", "Carbon sequestration", "Policy frameworks"], script: "To mitigate these effects, we must pivot to wind and solar, while enforcing international treaties like the Paris Agreement.", cues: "Use a firm, authoritative tone." },
        { title: "Conclusion", points: ["Summary of risks", "Call to action", "Closing Q&A"], script: "In summary, the time to act is now. Let's move to the floor for any questions you might have regarding policy implementation.", cues: "Smile and invite questions with a nod." }
    ]
};

export default function AIPresentationPrepScreen({ navigation }) {
    const [topic, setTopic] = useState('');
    const [step, setStep] = useState('input'); // input, generating, results
    const [slides, setSlides] = useState([]);
    const [error, setError] = useState('');
    const spinLoopRef = useRef(null);

    // Animation for generating state
    const spinAnim = useRef(new Animated.Value(0)).current;
    const normalizedTopic = useMemo(() => topic.trim(), [topic]);

    useEffect(() => {
        return () => {
            if (spinLoopRef.current) spinLoopRef.current.stop();
            spinAnim.stopAnimation();
        };
    }, [spinAnim]);

    const getTopicSlides = (subject) => {
        const lower = subject.toLowerCase();
        if (lower.includes('climate')) return MOCK_PRESENTATION_DATA['Climate Change'];
        const base = subject.replace(/\s+/g, ' ').trim();
        return [
            {
                title: 'Introduction',
                points: [`What is ${base}?`, 'Why this topic matters', 'Scope of today’s talk'],
                script: `Good day everyone. In this presentation, I will introduce ${base} and explain why it is important in an academic context.`,
                cues: 'Start calm, make eye contact, define key terms clearly.',
            },
            {
                title: 'Current Landscape',
                points: ['Key trends and data', 'Main challenges', 'Stakeholder perspectives'],
                script: `Next, I will review the current landscape of ${base}, highlighting major trends and the challenges researchers and practitioners face.`,
                cues: 'Use moderate pace and point to key figures.',
            },
            {
                title: 'Case / Evidence',
                points: ['One concrete case study', 'Findings and interpretation', 'What we can learn'],
                script: `To make this concrete, let us examine a representative case and discuss what the evidence suggests about ${base}.`,
                cues: 'Pause after each finding; emphasize takeaway sentence.',
            },
            {
                title: 'Conclusion',
                points: ['Summary of key ideas', 'Recommendations', 'Questions & discussion'],
                script: `To conclude, ${base} requires a balanced, evidence-based approach. Thank you for listening, and I welcome your questions.`,
                cues: 'End confidently; invite questions with an open gesture.',
            }
        ];
    };

    const generatePresentation = () => {
        if (!normalizedTopic) {
            setError('Please enter a topic.');
            return;
        }
        setError('');
        setStep('generating');
        setSlides([]);
        spinAnim.setValue(0);

        spinLoopRef.current = Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 1400, useNativeDriver: true })
        );
        spinLoopRef.current.start();

        // Simulate AI generation
        setTimeout(() => {
            const data = getTopicSlides(normalizedTopic);
            setSlides(data);
            setStep('results');
            if (spinLoopRef.current) spinLoopRef.current.stop();
            spinAnim.setValue(0);
        }, 3000);
    };

    return (
        <Screen contentStyle={styles.container}>
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
                            <Text style={styles.introText}>Enter your presentation topic, and our AI will generate professional slides, a full script, and body language cues.</Text>
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

                        <View style={styles.optionGrid}>
                            <OptionToggle label="Duration" value="10 Mins" icon="time-outline" />
                            <OptionToggle label="Tone" value="Academic" icon="school-outline" />
                        </View>

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

                        {slides.map((slide, index) => (
                            <Card key={index} style={styles.slideCard}>
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
                            }}
                            style={{ marginTop: spacing.xl, marginBottom: 40 }}
                        />
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}

const OptionToggle = ({ label, value, icon }) => (
    <View style={styles.optionBox}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <View style={{ marginLeft: 8 }}>
            <Text style={styles.optionLabel}>{label}</Text>
            <Text style={styles.optionValue}>{value}</Text>
        </View>
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

    optionGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    optionBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: '#E2E8F0' },
    optionLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
    optionValue: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },

    loadingArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    loadingTitle: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, marginTop: spacing.xl },
    loadingSub: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },

    resultsArea: { paddingTop: spacing.sm },
    resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: 8 },
    resultHeading: { fontSize: 18, fontWeight: '800', color: colors.success },

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
