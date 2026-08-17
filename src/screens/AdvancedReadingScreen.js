import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';
import { speakEnglish } from '../utils/ttsEnglish';
import { loadAiAccessConfig } from '../utils/appStorage';

// ---------------- Passages ----------------
const PASSAGE_GENERAL = `Economics is the social science that studies the production, distribution, and consumption of goods and services. Economics focuses on the behaviour and interactions of economic agents and how economies work. Microeconomics analyzes what's viewed as basic elements in the economy, including individual agents and markets, their interactions, and the outcomes of interactions. Individual agents may include, for example, households, firms, buyers, and sellers. Macroeconomics analyzes the economy as a system where production, consumption, saving, and investment interact, and factors affecting it: employment of the resources of labour, capital, and land, currency inflation, economic growth, and public policies that have impact on these elements.`;

const styles = StyleSheet.create({
    container: { paddingBottom: spacing.xl },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.md },
    backBtn: { padding: spacing.xs, marginRight: spacing.sm, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    h1: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    h3: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
    sub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.xs },
    card: { marginTop: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    hintTip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
    hintText: { fontSize: 13, color: colors.primaryDark, fontWeight: '700', marginLeft: spacing.sm },
    passageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
    passageChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.secondary },
    passageChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    passageChipText: { fontSize: typography.small, color: colors.text },
    passageChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
    passageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    passageTitle: { fontSize: 22, fontWeight: '900', color: colors.text, fontFamily: typography.fontHeadline },
    levelBadge: { fontSize: typography.small, color: colors.primary, fontWeight: '700', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    passageBody: { fontSize: 16, color: colors.text, lineHeight: 28 },
    interactiveWord: { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
    controlsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
    wpmText: { marginTop: spacing.xs, fontSize: typography.small, color: '#047857', fontWeight: '700' },
    quizQuestion: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm, lineHeight: 22 },
    quizScoreText: { fontSize: typography.body, fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.sm },
    body: { fontSize: typography.body, color: colors.text, lineHeight: 22, marginTop: 4 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: 40, ...shadow.lg },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    modalWordText: { fontSize: 24, fontWeight: '900', color: colors.primaryDark, flex: 1, textTransform: 'capitalize' },
    modalDefText: { fontSize: 16, color: colors.text, lineHeight: 24 },
    modalAudioIcon: { marginRight: 16 },
});

const PASSAGE_GENERAL_2 = `Education systems around the world are increasingly adopting student-centred learning models. In this approach, the teacher acts as a facilitator rather than the sole source of knowledge. Students are encouraged to develop critical thinking, collaborate with peers, and apply concepts to real-world problems. Research shows that active learning improves long-term retention compared with traditional lectures. Assessment methods have also evolved: portfolios, project-based evaluation, and peer review now complement standard examinations. The shift reflects a broader understanding that modern workplaces value adaptability and problem-solving over memorised knowledge.`;

const PASSAGE_ENGINEERING = `Thermodynamics is a branch of physics that deals with heat, work, and temperature, and their relation to energy, entropy, and the physical properties of matter and radiation. The behavior of these quantities is governed by the four laws of thermodynamics which convey a quantitative description using measurable macroscopic physical quantities, but may be explained in terms of microscopic constituents by statistical mechanics. Thermodynamics applies to a wide variety of topics in science and engineering, especially physical chemistry, biochemistry, chemical engineering and mechanical engineering.`;

const PASSAGE_ENGINEERING_2 = `Materials science studies the relationship between the structure of materials and their properties. The field encompasses elements of applied physics and chemistry, with attention also given to chemical, mechanical, civil and electrical engineering. Because of the significance of materials in virtually every engineering discipline, structural materials of any type are studied in great detail. Nanomaterials, whose building blocks measure less than 100 nanometres, exhibit remarkable electrical, magnetic, and optical properties that differ from bulk materials. Engineers exploit these phenomena to design lighter, stronger, and more durable components for aerospace, biomedical, and energy applications.`;

const PASSAGE_ECONOMICS = `Macroeconomics is a branch of economics dealing with performance, structure, behavior, and decision-making of an economy as a whole. This includes regional, national, and global economies. Macroeconomists study topics such as GDP, unemployment rates, national income, price indices, output, consumption, unemployment, inflation, saving, investment, energy, international trade, and international finance. Macroeconomics and microeconomics are the two most general fields in economics.`;

const PASSAGE_ECONOMICS_2 = `Central banks influence economic activity primarily through monetary policy tools. Open market operations, reserve requirements, and policy interest rates form the core toolkit. When inflation exceeds the target band, a central bank may raise its policy rate, which increases borrowing costs across the economy, dampening consumption and investment. Conversely, during a downturn, rate cuts and asset purchase programmes aim to stimulate demand. The effectiveness of these tools depends on transmission mechanisms through commercial banks, exchange rates, and inflation expectations. Since the global financial crisis, unconventional instruments such as forward guidance and quantitative easing have become standard components of monetary policy frameworks.`;

const PASSAGE_SOCIAL = `Sociology examines the development, structure, and functioning of human society. It involves the systematic study of social behaviour, institutions, and patterns of interaction. Classical theorists such as Durkheim, Weber, and Marx established foundational perspectives on social solidarity, rationalisation, and class conflict. Contemporary sociology addresses digital networks, migration, inequality, and identity formation. Quantitative surveys and qualitative fieldwork provide complementary evidence, while computational methods increasingly allow researchers to analyse large-scale social data generated by online platforms.`;

const PASSAGE_SCIENCE = `The scientific method provides a disciplined framework for investigating natural phenomena. Hypotheses are generated from observations, then tested through controlled experiments designed to minimise bias. Replication ensures that findings are reliable rather than artefacts of a single study. Peer review subjects manuscripts to scrutiny by independent experts before publication. Despite its strengths, the method faces challenges including publication bias, p-hacking, and the difficulty of generalising laboratory results to complex real-world systems. Open science initiatives promote data sharing, preregistration, and transparent reporting to strengthen research integrity.`;

// Offline dictionary for selected definitions
const MOCK_DICT = {
    'economics': 'n. The branch of knowledge concerned with the production, consumption, and transfer of wealth.',
    'distribution': 'n. The action of sharing something out among a number of recipients.',
    'consumption': 'n. The using up of a resource.',
    'macroeconomics': 'n. The part of economics concerned with large-scale or general economic factors.',
    'microeconomics': 'n. The part of economics concerned with single factors and the effects of individual decisions.',
    'inflation': 'n. A general increase in prices and fall in the purchasing value of money.',
    'thermodynamics': 'n. The branch of physical science that deals with the relations between heat and other forms of energy.',
    'entropy': 'n. A thermodynamic quantity representing the unavailability of a system\'s thermal energy for conversion into mechanical work.',
    'nanomaterials': 'n. Materials with structural components smaller than 100 nanometres, showing unusual properties.',
    'sociology': 'n. The study of the development, structure, and functioning of human society.',
    'hypotheses': 'n. Plural of hypothesis — proposed explanations made on the basis of limited evidence.',
    'replication': 'n. The repetition of an experiment to verify results.',
    'facilitator': 'n. A person who makes an action or process easier.',
    'monetary': 'adj. Relating to money or the supply of money.',
    'curated': 'adj. Selected, organised, and presented by an expert.',
};

const PASSAGES_BY_FOCUS = {
    'Economics': [
        { title: 'Foundations of Economics', body: PASSAGE_GENERAL, level: 'B1' },
        { title: 'Monetary Policy Toolkit', body: PASSAGE_ECONOMICS_2, level: 'B2' },
        { title: 'Macro vs Micro', body: PASSAGE_ECONOMICS, level: 'B1' },
    ],
    'Engineering': [
        { title: 'Thermodynamics Overview', body: PASSAGE_ENGINEERING, level: 'B2' },
        { title: 'Materials Science & Nanomaterials', body: PASSAGE_ENGINEERING_2, level: 'B2' },
        { title: 'Student-Centred Learning', body: PASSAGE_GENERAL_2, level: 'B1' },
    ],
    'Social Sciences': [
        { title: 'What Sociology Studies', body: PASSAGE_SOCIAL, level: 'B1' },
        { title: 'The Scientific Method', body: PASSAGE_SCIENCE, level: 'B2' },
        { title: 'Student-Centred Learning', body: PASSAGE_GENERAL_2, level: 'B1' },
    ],
    'General': [
        { title: 'Foundations of Economics', body: PASSAGE_GENERAL, level: 'B1' },
        { title: 'Student-Centred Learning', body: PASSAGE_GENERAL_2, level: 'B1' },
        { title: 'The Scientific Method', body: PASSAGE_SCIENCE, level: 'B2' },
    ],
};

const SPEED_BPS = { slow: 60, normal: 90, fast: 120 };

// Comprehension questions keyed per passage title
const QUIZ_BANK = {
    'Foundations of Economics': [
        { q: 'What does microeconomics analyse?', options: ['Whole economies', 'Individual agents and markets', 'Government budgets', 'International treaties'], answer: 'Individual agents and markets' },
        { q: 'Which factors does macroeconomics study?', options: ['Single household choices', 'Labour, capital, and public policies', 'Firm-level pricing only', 'Personal savings habits'], answer: 'Labour, capital, and public policies' },
    ],
    'Monetary Policy Toolkit': [
        { q: 'What may a central bank do when inflation exceeds target?', options: ['Cut rates', 'Raise its policy rate', 'Increase spending', 'Lower reserve requirements'], answer: 'Raise its policy rate' },
        { q: 'Which became standard after the global financial crisis?', options: ['Gold standard', 'Forward guidance and quantitative easing', 'Fixed exchange rates', 'Ban on lending'], answer: 'Forward guidance and quantitative easing' },
    ],
    'Thermodynamics Overview': [
        { q: 'How many laws govern thermodynamic quantities?', options: ['Two', 'Three', 'Four', 'Six'], answer: 'Four' },
        { q: 'Thermodynamics applies to all EXCEPT:', options: ['Physical chemistry', 'Mechanical engineering', 'Astrology', 'Biochemistry'], answer: 'Astrology' },
    ],
    'Materials Science & Nanomaterials': [
        { q: 'Nanomaterials are defined by structures smaller than:', options: ['1 mm', '100 nanometres', '10 micrometres', '1 metre'], answer: '100 nanometres' },
        { q: 'Engineers use nanomaterials to design components that are:', options: ['Heavier', 'Cheaper only', 'Lighter, stronger, and more durable', 'Radioactive'], answer: 'Lighter, stronger, and more durable' },
    ],
    'What Sociology Studies': [
        { q: 'Sociology studies the:', options: ['Chemistry of cells', 'Development and structure of human society', 'Stock markets', 'Animal behaviour only'], answer: 'Development and structure of human society' },
        { q: 'Which is NOT a classical theorist mentioned?', options: ['Durkheim', 'Weber', 'Marx', 'Darwin'], answer: 'Darwin' },
    ],
    'The Scientific Method': [
        { q: 'What ensures findings are reliable?', options: ['Speed', 'Replication', 'Secrecy', 'Popularity'], answer: 'Replication' },
        { q: 'What challenges does the method face?', options: ['None', 'Publication bias and p-hacking', 'Too much funding', 'Simple experiments'], answer: 'Publication bias and p-hacking' },
    ],
    'Macro vs Micro': [
        { q: 'Macroeconomics deals with:', options: ['Single firms', 'An economy as a whole', 'Household chores', 'Retail pricing'], answer: 'An economy as a whole' },
        { q: 'GDP and unemployment rates are studied by:', options: ['Microeconomists', 'Macroeconomists', 'Biologists', 'Linguists'], answer: 'Macroeconomists' },
    ],
    'Student-Centred Learning': [
        { q: 'In student-centred learning the teacher acts as a:', options: ['Dictator', 'Facilitator', 'Spectator', 'Examiner only'], answer: 'Facilitator' },
        { q: 'Active learning improves:', options: ['Short-term panic', 'Long-term retention', 'Absenteeism', 'Rote copying'], answer: 'Long-term retention' },
    ],
};

function cleanWord(raw) {
    return raw.replace(/[.,!?;:'"()]/g, '').toLowerCase();
}

export default function AdvancedReadingScreen({ navigation }) {
    const { academicFocus } = useAppState();
    const [selectedWord, setSelectedWord] = useState(null);
    const [speed, setSpeed] = useState('normal');
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [readStarted, setReadStarted] = useState(false);
    const [activePassageIdx, setActivePassageIdx] = useState(0);

    const focus = ['Economics', 'Engineering', 'Social Sciences'].includes(academicFocus) ? academicFocus : 'General';
    const passageSet = PASSAGES_BY_FOCUS[focus] || PASSAGES_BY_FOCUS.General;
    const passage = passageSet[activePassageIdx] || passageSet[0];

    const quiz = useMemo(() => QUIZ_BANK[passage.title] || [], [passage.title]);

    const wordsPerMinute = useMemo(() => {
        if (!readStarted) return null;
        const wc = String(passage.body).trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.round(elapsed / 60));
        return Math.round(wc / minutes);
    }, [elapsed, readStarted, passage]);

    const startReading = () => {
        setReadStarted(true);
        setElapsed(0);
        setQuizIdx(0);
        setQuizScore(0);
    };

    React.useEffect(() => {
        if (!readStarted) return undefined;
        const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(iv);
    }, [readStarted]);

    const aiExplain = async () => {
        if (!selectedWord) return;
        try {
            const cfg = await loadAiAccessConfig();
            const apiBase = cfg?.apiBase || cfg?.geminiApiBase;
            const apiKey = cfg?.apiKey || cfg?.geminiKey;
            if (!apiBase || !apiKey) {
                Alert.alert('AI not configured', 'Set up your Gemini API key in Settings → AI Access first.');
                return;
            }
            const res = await fetch(`${String(apiBase).replace(/\/$/, '')}/v1beta/models/gemini-2.0-flash:generateContent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Explain the English word "${selectedWord.text}" briefly for a B1-B2 learner: part of speech, definition, one simple example sentence.` }] }],
                    generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
                }),
            });
            const json = await res.json();
            const txt = json?.candidates?.[0]?.content?.parts?.[0]?.text || selectedWord.def;
            setSelectedWord((prev) => ({ ...prev, def: txt }));
        } catch (e) {
            // keep the offline definition
        }
    };

    const handleWordPress = (wordRaw) => {
        const word = cleanWord(wordRaw);
        const definition = MOCK_DICT[word] || 'Tap "Explain with AI" for a detailed breakdown.';
        setSelectedWord({ text: wordRaw.replace(/[.,!?;:'"()]/g, ''), def: definition });
    };

    const renderInteractiveText = () => {
        const words = String(passage.body).split(' ');
        return (
            <Text style={styles.passageBody}>
                {words.map((w, i) => (
                    <Text
                        key={i}
                        style={MOCK_DICT[cleanWord(w)] ? styles.interactiveWord : {}}
                        onPress={() => handleWordPress(w)}
                    >
                        {w}{' '}
                    </Text>
                ))}
            </Text>
        );
    };

    const answerQuiz = (option) => {
        if (quizAnswered || quiz.length === 0) return;
        const ok = String(option).trim().toLowerCase() === String(quiz[quizIdx]?.answer).trim().toLowerCase();
        setQuizScore((s) => s + (ok ? 1 : 0));
        setQuizAnswered(true);
    };

    const nextQuizQuestion = () => {
        setQuizAnswered(false);
        setQuizIdx((i) => i + 1);
    };

    const formatElapsed = () => {
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.h1}>Reading Lab</Text>
                    <Text style={styles.sub}>{focus} Track · Advanced Reading</Text>
                </View>
            </View>

            <View style={styles.hintTip}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={styles.hintText}>Tap highlighted words to define them. Time your reading and track wpm.</Text>
            </View>

            {/* Passage picker */}
            <View style={styles.passageRow}>
                {passageSet.map((p, i) => (
                    <TouchableOpacity
                        key={p.title}
                        style={[styles.passageChip, i === activePassageIdx && styles.passageChipActive]}
                        onPress={() => { setActivePassageIdx(i); setQuizIdx(0); setQuizScore(0); setReadStarted(false); }}
                    >
                        <Text style={[styles.passageChipText, i === activePassageIdx && styles.passageChipTextActive]}>{p.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Card style={styles.card}>
                <View style={styles.passageHead}>
                    <Text style={styles.passageTitle}>{passage.title}</Text>
                    <Text style={styles.levelBadge}>{passage.level}</Text>
                </View>
                {renderInteractiveText()}

                <View style={styles.controlsRow}>
                    <Button
                        label={readStarted ? `Stop (${formatElapsed()})` : 'Start Timer'}
                        variant={readStarted ? 'secondary' : 'primary'}
                        onPress={() => setReadStarted(false)}
                    />
                    {!readStarted ? <Button label="Start Timer" onPress={startReading} /> : null}
                    <Button label={`Speed · ${speed}`} variant="ghost" onPress={() => {
                        const next = speed === 'slow' ? 'normal' : speed === 'normal' ? 'fast' : 'slow';
                        setSpeed(next);
                    }} />
                    <Button label="Read Aloud" variant="ghost" icon="volume-high-outline" onPress={() => speakEnglish(passage.body, SPEED_BPS[speed])} />
                </View>

                {readStarted && wordsPerMinute != null ? (
                    <Text style={styles.wpmText}>Your speed: ~{wordsPerMinute} wpm (target 120+ wpm for BUSEPT Reading)</Text>
                ) : null}

                <Button label="Explain selected word with AI" variant="ghost" icon="sparkles-outline" onPress={aiExplain} />
            </Card>

            {/* Comprehension quiz */}
            <Card style={styles.card}>
                <Text style={styles.h3}>Comprehension Check — {passage.title}</Text>
                {quiz.length === 0 ? (
                    <Text style={styles.body}>Quiz coming soon for this passage.</Text>
                ) : quizIdx >= quiz.length ? (
                    <View>
                        <Text style={styles.quizScoreText}>Score: {quizScore}/{quiz.length} — {quizScore === quiz.length ? 'Excellent!' : quizScore >= quiz.length / 2 ? 'Good — review missed items.' : 'Re-read and try again.'}</Text>
                        <View style={styles.row}>
                            <Button label="Retry Quiz" variant="secondary" onPress={() => { setQuizIdx(0); setQuizScore(0); setQuizAnswered(false); }} />
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.quizQuestion}>Q{quizIdx + 1}. {quiz[quizIdx].q}</Text>
                        {quiz[quizIdx].options.map((opt) => {
                            const chosen = quizAnswered;
                            const isAnswer = String(opt).trim().toLowerCase() === String(quiz[quizIdx].answer).trim().toLowerCase();
                            return (
                                <Button
                                    key={opt}
                                    label={opt}
                                    variant={chosen ? (isAnswer ? 'primary' : 'secondary') : 'secondary'}
                                    onPress={() => answerQuiz(opt)}
                                />
                            );
                        })}
                        {quizAnswered ? (
                            <View style={styles.row}>
                                <Button label="Next Question" onPress={nextQuizQuestion} />
                            </View>
                        ) : null}
                    </View>
                )}
            </Card>

            <Card style={styles.card}>
                <Text style={styles.h3}>Reading strategies</Text>
                <Text style={styles.body}>• Skim the first sentence of each paragraph for the topic.</Text>
                <Text style={styles.body}>• Scan for numbers, names, and signposts (however, therefore).</Text>
                <Text style={styles.body}>• Paraphrase-heavy questions reward careful re-reading of the option wording.</Text>
                <Text style={styles.body}>• Track your wpm above; build toward 120+ with academic topics.</Text>
            </Card>

            {/* Definition Modal */}
            {selectedWord ? (
                <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedWord(null)}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalWordText}>{selectedWord.text}</Text>
                                <TouchableOpacity onPress={() => speakEnglish(selectedWord.text, SPEED_BPS.slow)}>
                                    <Ionicons name="volume-medium" size={24} color={colors.primary} style={styles.modalAudioIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedWord(null)}>
                                    <Ionicons name="close-circle" size={28} color={colors.muted} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalDefText}>{selectedWord.def}</Text>
                            <Button label="Explain with AI" variant="secondary" icon="sparkles-outline" onPress={aiExplain} />
                        </View>
                    </View>
                </Modal>
            ) : null}
        </Screen>
    );
}

