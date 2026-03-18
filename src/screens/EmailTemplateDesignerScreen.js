import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function EmailTemplateDesignerScreen({ navigation }) {
    const [profName, setProfName] = useState('');
    const [course, setCourse] = useState('');
    const [reasonType, setReasonType] = useState('extension'); // extension, recommendation
    const [generatedEmail, setGeneratedEmail] = useState('');

    const generateEmail = () => {
        if (!profName.trim() || !course.trim()) {
            Alert.alert("Missing Fields", "Please enter both the Professor's name and the Course name.");
            return;
        }

        let template = "";
        const formattedProf = profName.trim().replace(/^Dr\.\s*|^Prof\.\s*/i, ''); // Strip prefix if they added it

        if (reasonType === 'extension') {
            template = `Subject: Extension Request - ${course}

Dear Professor ${formattedProf},

I hope this email finds you well. I am enrolled in your ${course} class. I am writing to respectfully request a short extension for the upcoming assignment. 

Due to unforeseen academic circumstances this week, I am struggling to complete the work to the standard I expect of myself. I would greatly appreciate it if you could grant me an additional 48 hours to submit the paper.

Thank you for your time and understanding.

Best regards,
[Your Name]
[Your ID]`;
        } else {
            template = `Subject: Letter of Recommendation Request - ${course}

Dear Professor ${formattedProf},

I hope this email finds you well. I thoroughly enjoyed being a student in your ${course} class last semester. 

I am currently applying for a graduate program and I am reaching out to see if you would be willing to write a strong letter of recommendation on my behalf. Given your insights into my academic performance in ${course}, I believe your endorsement would greatly strengthen my application.

I have attached my resume and the program details for your reference. 

Thank you for your consideration.

Best regards,
[Your Name]
[Your ID]`;
        }

        setGeneratedEmail(template);
    };

    const copyToClipboard = () => {
        Alert.alert("Success", "Email copied to clipboard! You can paste it into Gmail/Outlook.");
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Email Etiquette</Text>
                    <Text style={styles.pageSub}>Academic Comms Wizard</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <Card style={styles.builderCard}>
                        <Text style={styles.builderHead}>Configure Variables</Text>

                        <View style={styles.row}>
                            <View style={styles.colLeft}>
                                <Text style={styles.inputLabel}>Professor Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Jenkins"
                                    value={profName}
                                    onChangeText={setProfName}
                                />
                            </View>
                            <View style={styles.colRight}>
                                <Text style={styles.inputLabel}>Course Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. ECON201"
                                    value={course}
                                    onChangeText={setCourse}
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Email Objective</Text>
                        <View style={styles.typeWrap}>
                            <TouchableOpacity
                                style={[styles.typeBtn, reasonType === 'extension' && styles.typeBtnActive]}
                                onPress={() => setReasonType('extension')}
                            >
                                <Ionicons name="time-outline" size={16} color={reasonType === 'extension' ? '#fff' : colors.primaryDark} />
                                <Text style={[styles.typeBtnText, reasonType === 'extension' && styles.typeBtnTextActive]}>Extension</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, reasonType === 'recommendation' && styles.typeBtnActive]}
                                onPress={() => setReasonType('recommendation')}
                            >
                                <Ionicons name="document-text-outline" size={16} color={reasonType === 'recommendation' ? '#fff' : colors.primaryDark} />
                                <Text style={[styles.typeBtnText, reasonType === 'recommendation' && styles.typeBtnTextActive]}>Recommendation</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.generateBtn} onPress={generateEmail}>
                            <Text style={styles.generateBtnText}>Generate Email</Text>
                        </TouchableOpacity>
                    </Card>

                    {generatedEmail ? (
                        <Card style={styles.resultCard} glow>
                            <View style={styles.resultHeadRow}>
                                <Text style={styles.resultHead}>Draft Output</Text>
                                <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
                                    <Ionicons name="copy-outline" size={16} color={colors.primaryDark} />
                                    <Text style={styles.copyBtnText}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.resultArea}
                                multiline
                                editable={true}
                                value={generatedEmail}
                                onChangeText={setGeneratedEmail}
                            />
                        </Card>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="mail-unread-outline" size={48} color={colors.secondary} />
                            <Text style={styles.emptyText}>Fill out the parameters to generate a professionally formatted academic email.</Text>
                        </View>
                    )}

                    <View style={styles.bottomSpacer} />
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
    row: { flexDirection: 'row', marginBottom: spacing.sm },
    inputLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
    input: { backgroundColor: 'rgba(0,0,0,0.03)', padding: spacing.md, borderRadius: radius.md, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },

    typeWrap: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    typeBtnActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
    typeBtnText: { fontSize: 13, fontWeight: '800', color: colors.primaryDark, marginLeft: 6 },
    typeBtnTextActive: { color: '#fff' },

    generateBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: radius.md },
    generateBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    resultCard: { padding: spacing.lg, borderRadius: radius.xl, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.primarySoft },
    resultHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    resultHead: { fontSize: 14, fontWeight: '800', color: colors.primary },
    copyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: radius.pill },
    copyBtnText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 4 },

    resultArea: { minHeight: 250, fontSize: 14, color: colors.text, lineHeight: 22, textAlignVertical: 'top' },

    emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: 40, marginTop: spacing.md, lineHeight: 20 },

    flexFill: { flex: 1 },
    colLeft: { flex: 1, marginRight: spacing.sm },
    colRight: { flex: 1 },
    bottomSpacer: { height: 40 }
});
