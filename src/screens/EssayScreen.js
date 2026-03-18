/**
 * EssayScreen.js
 * BUEPT Essay Writing Guide — Templates, Key Phrases, Sample Essays, Topic Lists.
 * Bogazici University BUEPT focused.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Clipboard, Animated
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography } from '../theme/tokens';
import templates from '../../data/essay_templates.json';

const TABS = ['Templates', 'Phrases', 'Sample', 'Topics', 'Mistakes'];

const TAB_ICONS = {
    Templates: '📝',
    Phrases: '💬',
    Sample: '📖',
    Topics: '🎯',
    Mistakes: '⚠️',
};

const PHRASE_CATEGORY_COLORS = {
    introducing_arguments: '#1E88E5',
    adding_points: '#43A047',
    giving_examples: '#F4511E',
    concession_rebuttal: '#8E24AA',
    conclusion_starters: '#00897B',
    academic_hedging: '#FB8C00',
    one_hand_other: '#E53935',
    balanced_view: '#039BE5',
    describing_increase: '#2E7D32',
    describing_decrease: '#C62828',
    describing_stability: '#1565C0',
    approximation: '#4527A0',
    comparison: '#00695C',
};

const PHRASE_CATEGORY_STYLES = {
    introducing_arguments: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.introducing_arguments }, text: { color: PHRASE_CATEGORY_COLORS.introducing_arguments } },
    adding_points: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.adding_points }, text: { color: PHRASE_CATEGORY_COLORS.adding_points } },
    giving_examples: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.giving_examples }, text: { color: PHRASE_CATEGORY_COLORS.giving_examples } },
    concession_rebuttal: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.concession_rebuttal }, text: { color: PHRASE_CATEGORY_COLORS.concession_rebuttal } },
    conclusion_starters: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.conclusion_starters }, text: { color: PHRASE_CATEGORY_COLORS.conclusion_starters } },
    academic_hedging: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.academic_hedging }, text: { color: PHRASE_CATEGORY_COLORS.academic_hedging } },
    one_hand_other: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.one_hand_other }, text: { color: PHRASE_CATEGORY_COLORS.one_hand_other } },
    balanced_view: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.balanced_view }, text: { color: PHRASE_CATEGORY_COLORS.balanced_view } },
    describing_increase: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.describing_increase }, text: { color: PHRASE_CATEGORY_COLORS.describing_increase } },
    describing_decrease: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.describing_decrease }, text: { color: PHRASE_CATEGORY_COLORS.describing_decrease } },
    describing_stability: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.describing_stability }, text: { color: PHRASE_CATEGORY_COLORS.describing_stability } },
    approximation: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.approximation }, text: { color: PHRASE_CATEGORY_COLORS.approximation } },
    comparison: { dot: { backgroundColor: PHRASE_CATEGORY_COLORS.comparison }, text: { color: PHRASE_CATEGORY_COLORS.comparison } },
};

function formatKey(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function CopyChip({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        Clipboard.setString(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <TouchableOpacity style={styles.phraseChip} onPress={handleCopy} activeOpacity={0.8}>
            <Text style={styles.phraseChipText}>{text}</Text>
            <Text style={styles.copyIcon}>{copied ? '✓' : '⧉'}</Text>
        </TouchableOpacity>
    );
}

export default function EssayScreen({ navigation }) {
    const [activeTemplate, setActiveTemplate] = useState(0);
    const [activeTab, setActiveTab] = useState('Templates');
    const [expandedSection, setExpandedSection] = useState(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const tmpl = templates[activeTemplate];

    const switchTab = useCallback((tab) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setActiveTab(tab);
        setExpandedSection(null);
    }, [fadeAnim]);

    return (
        <Screen scroll contentStyle={styles.container}>
            <Text style={styles.h1}>📝 Essay Writing</Text>
            <Text style={styles.sub}>Bogazici University BUEPT — Writing Guide</Text>

            {/* Essay type selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
                <View style={styles.typeRow}>
                    {templates.map((t, i) => (
                        <TouchableOpacity
                            key={t.id}
                            style={[styles.typeBtn, activeTemplate === i && styles.typeBtnActive]}
                            onPress={() => { setActiveTemplate(i); switchTab('Templates'); }}
                        >
                            <Text style={[styles.typeBtnText, activeTemplate === i && styles.typeBtnTextActive]}>
                                {t.type}
                            </Text>
                            <Text style={styles.typeNote}>{t.buept_note.slice(0, 28)}…</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* BUEPT note banner */}
            <View style={styles.bueptBanner}>
                <Text style={styles.bueptText}>📌 {tmpl.buept_note}</Text>
            </View>

            {/* Sub-tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
                <View style={styles.tabRow}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => switchTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {TAB_ICONS[tab]} {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Content */}
            <Animated.View style={{ opacity: fadeAnim }}>

                {/* ── Templates ── */}
                {activeTab === 'Templates' && (
                    <>
                        {Object.entries(tmpl.template).map(([section, lines]) => {
                            const isOpen = expandedSection === section;
                            return (
                                <Card key={section} style={styles.card}>
                                    <TouchableOpacity
                                        style={styles.sectionHeader}
                                        onPress={() => setExpandedSection(isOpen ? null : section)}
                                    >
                                        <Text style={styles.sectionTitle}>{formatKey(section)}</Text>
                                        <Text style={styles.toggle}>{isOpen ? '▲' : '▼'}</Text>
                                    </TouchableOpacity>
                                    {isOpen && lines.map((line, i) => (
                                        <View key={i} style={styles.templateRow}>
                                            <Text style={styles.templateNum}>{i + 1}.</Text>
                                            <Text style={styles.templateText}>{line}</Text>
                                            <TouchableOpacity
                                                style={styles.copyBtn}
                                                onPress={() => Clipboard.setString(line)}
                                            >
                                                <Text style={styles.copyBtnText}>Copy</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </Card>
                            );
                        })}
                    </>
                )}

                {/* ── Key Phrases ── */}
                {activeTab === 'Phrases' && (
                    <>
                        {Object.entries(tmpl.key_phrases).map(([cat, phrases]) => {
                            const styleSet = PHRASE_CATEGORY_STYLES[cat] || { dot: styles.catDotPrimary, text: styles.sectionTitlePrimary };
                            const isOpen = expandedSection === cat;
                            return (
                                <Card key={cat} style={styles.card}>
                                    <TouchableOpacity
                                        style={styles.sectionHeader}
                                        onPress={() => setExpandedSection(isOpen ? null : cat)}
                                    >
                                        <View style={[styles.catDot, styleSet.dot]} />
                                        <Text style={[styles.sectionTitle, styleSet.text, styles.sectionTitleFlex]}>{formatKey(cat)}</Text>
                                        <Text style={styles.toggle}>{isOpen ? '▲' : '▼'}</Text>
                                    </TouchableOpacity>
                                    {isOpen && (
                                        <View style={styles.chipRow}>
                                            {phrases.map((p, i) => <CopyChip key={i} text={p} />)}
                                        </View>
                                    )}
                                </Card>
                            );
                        })}
                    </>
                )}

                {/* ── Sample Essay ── */}
                {activeTab === 'Sample' && (
                    <Card style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Sample Essay</Text>
                            <TouchableOpacity
                                style={styles.copyBtn}
                                onPress={() => Clipboard.setString(tmpl.sample_essay)}
                            >
                                <Text style={styles.copyBtnText}>Copy All</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sampleText}>{tmpl.sample_essay}</Text>
                        <Text style={styles.wordCount}>
                            {tmpl.sample_essay.split(/\s+/).length} words
                        </Text>
                    </Card>
                )}

                {/* ── Topics ── */}
                {activeTab === 'Topics' && (
                    <>
                        {tmpl.bogazici_topics?.length > 0 ? (
                            <Card style={styles.card}>
                                <Text style={styles.sectionTitle}>🎯 Bogazici BUEPT Topics</Text>
                                {tmpl.bogazici_topics.map((topic, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.topicRow}
                                        onPress={() => Clipboard.setString(topic)}
                                        activeOpacity={0.75}
                                    >
                                        <View style={styles.topicNumBadge}>
                                            <Text style={styles.topicNum}>{i + 1}</Text>
                                        </View>
                                        <Text style={styles.topicText}>{topic}</Text>
                                        <Text style={styles.topicCopy}>⧉</Text>
                                    </TouchableOpacity>
                                ))}
                            </Card>
                        ) : (
                            <Card style={styles.card}>
                                <Text style={styles.sectionTitle}>Topics</Text>
                                <Text style={styles.sub}>See Task 2 topics for Bogazici-specific essay questions.</Text>
                            </Card>
                        )}

                        {/* General structure tips */}
                        <Card style={[styles.card, styles.structCard]}>
                            <Text style={styles.sectionTitle}>BUEPT Writing Structure</Text>
                            {[
                                ['Task 1', '180-200 words', '20 min', 'Graph/Table/Chart description'],
                                ['Task 2', '250-300 words', '40 min', 'Opinion/Discussion essay'],
                            ].map(([task, words, time, type]) => (
                                <View key={task} style={styles.structRow}>
                                    <View style={styles.structLeft}>
                                        <Text style={styles.structTask}>{task}</Text>
                                    </View>
                                    <View style={styles.structRight}>
                                        <Text style={styles.structWords}>{words}</Text>
                                        <Text style={styles.structTime}>⏱ {time}</Text>
                                        <Text style={styles.structType}>{type}</Text>
                                    </View>
                                </View>
                            ))}
                        </Card>
                    </>
                )}

                {/* ── Common Mistakes ── */}
                {activeTab === 'Mistakes' && (
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>⚠️ Common Mistakes to Avoid</Text>
                        {tmpl.common_mistakes.map((m, i) => (
                            <View key={i} style={styles.mistakeRow}>
                                <Text style={styles.mistakeIcon}>✗</Text>
                                <Text style={styles.mistakeText}>{m}</Text>
                            </View>
                        ))}
                    </Card>
                )}
            </Animated.View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 40 },

    h1: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md },

    sectionScroll: { marginBottom: spacing.md },
    typeRow: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.md },
    typeBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.secondary,
        backgroundColor: colors.surface,
        maxWidth: 200,
    },
    typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeBtnText: { fontSize: typography.small, fontFamily: typography.fontHeadline, color: colors.text },
    typeBtnTextActive: { color: '#fff' },
    typeNote: { fontSize: 10, color: colors.muted, marginTop: 2 },

    bueptBanner: {
        backgroundColor: '#EEF5FF',
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    bueptText: { fontSize: typography.small, color: colors.primaryDark, lineHeight: 20 },

    tabRow: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.md },
    tab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.secondary,
        backgroundColor: colors.surface,
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontSize: typography.small, color: colors.muted, fontFamily: typography.fontHeadline },
    tabTextActive: { color: '#fff' },

    card: { marginBottom: spacing.md },

    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
        color: colors.text,
    },
    toggle: { fontSize: typography.small, color: colors.primary, fontFamily: typography.fontHeadline },
    catDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
    catDotPrimary: { backgroundColor: colors.primary },
    sectionTitlePrimary: { color: colors.primary },
    sectionTitleFlex: { flex: 1 },

    // Template
    templateRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
    templateNum: { fontSize: typography.small, color: colors.muted, width: 18, paddingTop: 2 },
    templateText: { flex: 1, fontSize: typography.small, color: colors.text, lineHeight: 20, fontStyle: 'italic' },
    copyBtn: {
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 8,
    },
    copyBtnText: { fontSize: 11, color: colors.primary, fontFamily: typography.fontHeadline },

    // Phrases
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
    phraseChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    phraseChipText: { fontSize: typography.small, color: colors.text },
    copyIcon: { fontSize: 11, color: colors.primary },

    // Sample
    sampleText: {
        fontSize: typography.body,
        color: colors.text,
        lineHeight: 26,
        fontFamily: typography.fontBody,
        marginBottom: spacing.sm,
    },
    wordCount: { fontSize: typography.small, color: colors.muted, textAlign: 'right' },

    // Topics
    topicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.secondary,
    },
    topicNumBadge: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    topicNum: { color: '#fff', fontSize: 11, fontFamily: typography.fontHeadline },
    topicText: { flex: 1, fontSize: typography.small, color: colors.text },
    topicCopy: { fontSize: 14, color: colors.muted },

    structCard: { backgroundColor: colors.surfaceAlt },
    structRow: {
        flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.secondary,
    },
    structLeft: {
        width: 60, alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.primary, borderRadius: 10, padding: spacing.sm,
    },
    structTask: { color: '#fff', fontFamily: typography.fontHeadline, fontSize: typography.small },
    structRight: { flex: 1 },
    structWords: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text },
    structTime: { fontSize: typography.small, color: colors.muted },
    structType: { fontSize: typography.small, color: colors.primary, marginTop: 2 },

    // Mistakes
    mistakeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
    mistakeIcon: { fontSize: 16, color: '#C62828', width: 20 },
    mistakeText: { flex: 1, fontSize: typography.small, color: '#5D4037', lineHeight: 20 },
});
