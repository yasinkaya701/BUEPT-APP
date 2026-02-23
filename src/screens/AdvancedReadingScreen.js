import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';
import { speakEnglish } from '../utils/ttsEnglish';

const PASSAGE_GENERAL = `Economics is the social science that studies the production, distribution, and consumption of goods and services. Economics focuses on the behaviour and interactions of economic agents and how economies work. Microeconomics analyzes what's viewed as basic elements in the economy, including individual agents and markets, their interactions, and the outcomes of interactions. Individual agents may include, for example, households, firms, buyers, and sellers. Macroeconomics analyzes the economy as a system where production, consumption, saving, and investment interact, and factors affecting it: employment of the resources of labour, capital, and land, currency inflation, economic growth, and public policies that have impact on these elements.`;
const PASSAGE_ENGINEERING = `Thermodynamics is a branch of physics that deals with heat, work, and temperature, and their relation to energy, entropy, and the physical properties of matter and radiation. The behavior of these quantities is governed by the four laws of thermodynamics which convey a quantitative description using measurable macroscopic physical quantities, but may be explained in terms of microscopic constituents by statistical mechanics. Thermodynamics applies to a wide variety of topics in science and engineering, especially physical chemistry, biochemistry, chemical engineering and mechanical engineering.`;
const PASSAGE_ECONOMICS = `Macroeconomics is a branch of economics dealing with performance, structure, behavior, and decision-making of an economy as a whole. This includes regional, national, and global economies. Macroeconomists study topics such as GDP, unemployment rates, national income, price indices, output, consumption, unemployment, inflation, saving, investment, energy, international trade, and international finance. Macroeconomics and microeconomics are the two most general fields in economics.`;

// Mock dictionary for selected definitions
const MOCK_DICT = {
    'economics': 'n. The branch of knowledge concerned with the production, consumption, and transfer of wealth.',
    'distribution': 'n. The action of sharing something out among a number of recipients.',
    'consumption': 'n. The using up of a resource.',
    'macroeconomics': 'n. The part of economics concerned with large-scale or general economic factors.',
    'microeconomics': 'n. The part of economics concerned with single factors and the effects of individual decisions.',
    'inflation': 'n. A general increase in prices and fall in the purchasing value of money.',
    'thermodynamics': 'n. The branch of physical science that deals with the relations between heat and other forms of energy.',
    'entropy': 'n. A thermodynamic quantity representing the unavailability of a system\'s thermal energy for conversion into mechanical work.',
};

export default function AdvancedReadingScreen({ navigation }) {
    const { academicFocus } = useAppState();
    const [selectedWord, setSelectedWord] = useState(null);

    const getPassage = () => {
        if (academicFocus === 'Engineering') return PASSAGE_ENGINEERING;
        if (academicFocus === 'Economics') return PASSAGE_ECONOMICS;
        return PASSAGE_GENERAL;
    };

    const handleWordPress = (wordRaw) => {
        // Clean punctuation
        const word = wordRaw.replace(/[.,]/g, '').toLowerCase();

        let definition = MOCK_DICT[word] || 'No specific definition available in offline dictionary. Please try root words.';
        setSelectedWord({ text: wordRaw.replace(/[.,]/g, ''), def: definition });
    };

    const renderInteractiveText = () => {
        const textToRender = getPassage();
        const words = textToRender.split(' ');
        return (
            <Text style={styles.passageBody}>
                {words.map((w, i) => (
                    <Text
                        key={i}
                        onPress={() => handleWordPress(w)}
                        style={MOCK_DICT[w.replace(/[.,]/g, '').toLowerCase()] ? styles.interactiveWord : {}}
                    >
                        {w}{' '}
                    </Text>
                ))}
            </Text>
        );
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Reading Lab</Text>
                    <Text style={styles.pageSub}>{academicFocus} Track - Core Reading</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.hintTip}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={styles.hintText}>Tap on highlighted blue words to define them instantly.</Text>
                </View>

                <Card style={styles.readingCard}>
                    <Text style={styles.articleHead}>Foundations of Market Economies</Text>
                    <Text style={styles.articleMeta}>Published: Oct 2023 • Length: 15 mins</Text>
                    <View style={styles.divider} />

                    {renderInteractiveText()}

                </Card>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Definition Modal */}
            {selectedWord && (
                <View style={styles.absoluteModalWrapper}>
                    <Modal visible transparent animationType="slide">
                        <View style={styles.modalBg}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalWordText}>{selectedWord.text}</Text>
                                    <TouchableOpacity onPress={() => speakEnglish(selectedWord.text, { rate: 0.48 })}>
                                        <Ionicons name="volume-medium" size={24} color={colors.primary} style={{ marginRight: 16 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setSelectedWord(null)}>
                                        <Ionicons name="close-circle" size={28} color={colors.muted} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.modalDefText}>{selectedWord.def}</Text>
                            </View>
                        </View>
                    </Modal>
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    scroll: { paddingHorizontal: spacing.xl },

    hintTip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
    hintText: { fontSize: 13, color: colors.primaryDark, fontWeight: '700', marginLeft: spacing.sm },

    readingCard: { padding: spacing.xl, borderRadius: radius.xl, backgroundColor: '#fff' },
    articleHead: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4, fontFamily: typography.fontHeadline },
    articleMeta: { fontSize: 12, color: colors.muted, fontWeight: '700', textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: spacing.lg },

    passageBody: { fontSize: 16, color: colors.text, lineHeight: 28 },
    interactiveWord: { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },

    absoluteModalWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: 40, ...shadow.lg },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    modalWordText: { fontSize: 24, fontWeight: '900', color: colors.primaryDark, flex: 1, textTransform: 'capitalize' },
    modalDefText: { fontSize: 16, color: colors.text, lineHeight: 24 }
});
