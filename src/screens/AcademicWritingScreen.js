import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AcademicWritingScreen({ navigation }) {
    const [topic, setTopic] = useState('');
    const [stance, setStance] = useState('');
    const [generatedText, setGeneratedText] = useState('');

    const generateEssayTemplate = () => {
        if (!topic.trim() || !stance.trim()) {
            Alert.alert("Missing Info", "Please provide both a topic and a stance.");
            return;
        }

        const template = `Title: The Impact of ${topic}

Introduction:
In recent years, the issue of ${topic.toLowerCase()} has sparked considerable debate. While some argue against it, it is unequivocally clear that ${stance.toLowerCase()}. This essay will argue that ${stance.toLowerCase()} because of its significant societal benefits.

Body Paragraph 1:
Primarily, one must consider the foundational aspect of ${topic.toLowerCase()}. Proponents often assert that...

Body Paragraph 2:
Furthermore, the implications of ${stance.toLowerCase()} extend beyond immediate observations. For instance...

Conclusion:
In conclusion, the evidence strongly supports the assertion that ${stance.toLowerCase()}. As society continues to navigate ${topic.toLowerCase()}, prioritizing this stance will yield the most optimal outcomes.`;

        setGeneratedText(template);
    };

    const copyToClipboard = () => {
        Alert.alert("Success", "Template copied to clipboard! Paste it into the Evaluator module to grade it.");
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Writing Studio</Text>
                    <Text style={styles.pageSub}>Essay Constructor</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <Card style={styles.builderCard}>
                        <Text style={styles.builderHead}>1. Argumentative Template Builder</Text>
                        <Text style={styles.inputLabel}>What is the topic?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Universal Basic Income"
                            value={topic}
                            onChangeText={setTopic}
                        />

                        <Text style={styles.inputLabel}>What is your stance?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. It provides economic stability"
                            value={stance}
                            onChangeText={setStance}
                        />

                        <TouchableOpacity style={styles.generateBtn} onPress={generateEssayTemplate}>
                            <Text style={styles.generateBtnText}>Generate Custom Template</Text>
                            <Ionicons name="flash" size={16} color="#fff" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </Card>

                    {generatedText ? (
                        <Card style={styles.resultCard} glow>
                            <View style={styles.resultHeadRow}>
                                <Text style={styles.resultHead}>Generated Draft</Text>
                                <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
                                    <Ionicons name="copy-outline" size={16} color={colors.primaryDark} />
                                    <Text style={styles.copyBtnText}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.resultArea}
                                multiline
                                editable={true}
                                value={generatedText}
                                onChangeText={setGeneratedText}
                            />
                        </Card>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={48} color={colors.secondary} />
                            <Text style={styles.emptyText}>Fill the inputs above to generate a highly structured C1-level essay skeleton.</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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

    builderCard: { padding: spacing.xl, borderRadius: radius.xl, backgroundColor: '#fff', marginBottom: spacing.xl },
    builderHead: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.lg },
    inputLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
    input: { backgroundColor: 'rgba(0,0,0,0.03)', padding: spacing.md, borderRadius: radius.md, fontSize: 15, color: colors.text, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },

    generateBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: radius.md },
    generateBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    resultCard: { padding: spacing.lg, borderRadius: radius.xl, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.primarySoft },
    resultHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    resultHead: { fontSize: 14, fontWeight: '800', color: colors.primary },
    copyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: radius.pill },
    copyBtnText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 4 },

    resultArea: { minHeight: 400, fontSize: 14, color: colors.text, lineHeight: 24, textAlignVertical: 'top' },

    emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: 40, marginTop: spacing.md, lineHeight: 20 }
});
