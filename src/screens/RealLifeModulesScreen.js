import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Complex Q&A State Tree
const SCENARIO_TREE = {
    start: {
        scenario: "You are currently facing a bureaucratic issue at the university. Which department do you need to contact?",
        options: [
            { text: "Dormitory / Housing Office", next: 'dorm' },
            { text: "Erasmus / International Office", next: 'erasmus' }
        ]
    },
    dorm: {
        scenario: "You have arrived at the Dormitory Office. What is your primary concern?",
        options: [
            { text: "I need to request a maintenance repair.", next: 'dorm_repair' },
            { text: "I want to apply for a room change.", next: 'dorm_change' }
        ]
    },
    dorm_repair: {
        scenario: "The clerk asks you to describe the maintenance issue. How do you respond?",
        options: [
            { text: "My radiator is leaking water and the room is very cold.", next: 'dorm_repair_success' },
            { text: "Fix my room now.", next: 'fail_rude' }
        ]
    },
    dorm_change: {
        scenario: "The clerk states: 'Room changes are only permitted under extenuating circumstances.' What do you say?",
        options: [
            { text: "My roommate's sleep schedule is severely disrupting my academic performance.", next: 'dorm_change_success' },
            { text: "I just don't like my roommate.", next: 'fail_casual' }
        ]
    },
    erasmus: {
        scenario: "You are at the International Office. The coordinator asks how they can help.",
        options: [
            { text: "I need to submit my Learning Agreement.", next: 'era_learning' },
            { text: "I want to ask about grant payments.", next: 'era_grant' }
        ]
    },
    era_learning: {
        scenario: "The coordinator checks your file: 'You are missing the signature of your departmental coordinator.'",
        options: [
            { text: "I will contact Prof. Yılmaz immediately to obtain the signature.", next: 'era_success' },
            { text: "Can you just sign it for them?", next: 'fail_protocol' }
        ]
    },
    era_grant: {
        scenario: "The coordinator explains: 'Grants are disbursed within 30 days of arrival documentation.' What is your follow-up?",
        options: [
            { text: "Understood. I submitted my arrival forms yesterday, so I will wait.", next: 'era_grant_success' },
            { text: "But I need the money today to pay rent!", next: 'fail_impatient' }
        ]
    }
};

const ENDINGS = {
    dorm_repair_success: { title: "Success!", desc: "You clearly articulated the problem. Maintenance has been dispatched.", win: true },
    dorm_change_success: { title: "Success!", desc: "You provided a valid academic reason. You will be given a form to fill out.", win: true },
    era_success: { title: "Success!", desc: "You understood the protocol and took correct action.", win: true },
    era_grant_success: { title: "Success!", desc: "You showed patience and understood the bureaucratic timeline.", win: true },
    fail_rude: { title: "Failed", desc: "Being overly demanding or rude will not help in academic settings. Try a more polite approach.", win: false },
    fail_casual: { title: "Failed", desc: "This reason is not considered 'extenuating'. You need a stronger argument.", win: false },
    fail_protocol: { title: "Failed", desc: "You must follow the strict signature protocols. The coordinator cannot bypass this.", win: false },
    fail_impatient: { title: "Failed", desc: "While frustrating, you must respect the stated timelines of the Erasmus program.", win: false }
};

export default function RealLifeModulesScreen({ navigation }) {
    const [currentNode, setCurrentNode] = useState('start');
    const [history, setHistory] = useState([]);

    const handleOptionSelect = (nextId) => {
        setHistory([...history, currentNode]);
        setCurrentNode(nextId);
    };

    const resetScenario = () => {
        setCurrentNode('start');
        setHistory([]);
    };

    const nodeData = SCENARIO_TREE[currentNode];
    const isEnding = !!ENDINGS[currentNode];
    const endData = ENDINGS[currentNode];

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Situational Lab</Text>
                    <Text style={styles.pageSub}>Real Campus Scenarios</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.progressRow}>
                    <Text style={styles.progText}>Turn {history.length + 1}</Text>
                    <TouchableOpacity onPress={resetScenario}>
                        <Ionicons name="refresh" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {isEnding ? (
                    <Card style={[styles.endCard, endData.win ? styles.endCardSuccess : styles.endCardFail]}>
                        <View style={[styles.iconWrap, endData.win ? styles.iconWrapSuccess : styles.iconWrapFail]}>
                            <Ionicons name={endData.win ? "checkmark-circle" : "close-circle"} size={64} color={endData.win ? colors.success : colors.error} />
                        </View>
                        <Text style={[styles.endTitle, endData.win ? styles.endTitleSuccess : styles.endTitleFail]}>{endData.title}</Text>
                        <Text style={styles.endDesc}>{endData.desc}</Text>

                        <TouchableOpacity style={styles.restartBtn} onPress={resetScenario}>
                            <Text style={styles.restartBtnText}>Try Another Scenario</Text>
                        </TouchableOpacity>
                    </Card>
                ) : (
                    <>
                        <Card style={styles.scenarioCard} glow>
                            <View style={styles.speakerBadge}>
                                <Ionicons name="chatbubbles" size={16} color={colors.primary} />
                                <Text style={styles.speakerText}>SITUATION</Text>
                            </View>
                            <Text style={styles.scenarioText}>{nodeData.scenario}</Text>
                        </Card>

                        <Text style={styles.optionsHead}>Select your response:</Text>

                        <View style={styles.optionsWrap}>
                            {nodeData.options.map((opt, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.optionBtn}
                                    onPress={() => handleOptionSelect(opt.next)}
                                >
                                    <View style={styles.optIconWrap}>
                                        <Text style={styles.optLetter}>{String.fromCharCode(65 + idx)}</Text>
                                    </View>
                                    <Text style={styles.optionText}>{opt.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    scroll: { paddingHorizontal: spacing.xl },

    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    progText: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },

    scenarioCard: { padding: spacing.xl, borderRadius: radius.xl, backgroundColor: '#fff', marginBottom: spacing.xl },
    speakerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start', marginBottom: spacing.sm },
    speakerText: { fontSize: 11, fontWeight: '800', color: colors.primaryDark, marginLeft: 4, letterSpacing: 0.5 },
    scenarioText: { fontSize: 18, color: colors.text, lineHeight: 28, fontWeight: '600' },

    optionsHead: { fontSize: 14, fontWeight: '800', color: colors.muted, marginBottom: spacing.md, textTransform: 'uppercase' },
    optionsWrap: { gap: spacing.md },
    optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', ...shadow.slight },
    optIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    optLetter: { fontSize: 14, fontWeight: '900', color: colors.primary },
    optionText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 22 },

    endCard: { padding: spacing.xxl, alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 2 },
    endCardSuccess: { borderColor: colors.success },
    endCardFail: { borderColor: colors.error },
    iconWrap: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    iconWrapSuccess: { backgroundColor: 'rgba(46, 204, 113, 0.1)' },
    iconWrapFail: { backgroundColor: 'rgba(231, 76, 60, 0.1)' },
    endTitle: { fontSize: 28, fontWeight: '900', marginBottom: spacing.sm, fontFamily: typography.fontHeadline },
    endTitleSuccess: { color: colors.success },
    endTitleFail: { color: colors.error },
    endDesc: { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
    restartBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: radius.pill },
    restartBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    bottomSpacer: { height: 40 }
});
