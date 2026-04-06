import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getDictionarySample } from '../utils/dictionary';
import { speakEnglish } from '../utils/ttsEnglish';

const STARTER_TERMS = ['citation', 'cohesion', 'framework', 'integrity', 'evidence', 'thesis'];
const TERM_DB = getDictionarySample(320).map((item, index) => {
    const rawWord = String(item.word || '').trim();
    const normalizedWord = rawWord ? rawWord.charAt(0).toUpperCase() + rawWord.slice(1) : `Term ${index + 1}`;
    const type = String(item.word_type || 'term').toLowerCase();
    return {
        id: `${normalizedWord}-${index}`,
        word: normalizedWord,
        key: rawWord.toLowerCase(),
        def: item.simple_definition || 'No definition available.',
        type,
        example: item.examples?.[0] || `Students can use "${rawWord}" in a formal academic response.`,
    };
});

function toTitle(value = '') {
    return String(value || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function TerminologyDictionaryScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredTerms = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        return TERM_DB.filter((term) => {
            const queryMatch = !normalizedQuery
                || term.word.toLowerCase().includes(normalizedQuery)
                || term.def.toLowerCase().includes(normalizedQuery)
                || term.example.toLowerCase().includes(normalizedQuery);
            return queryMatch;
        });
    }, [searchQuery]);

    const groupedTerms = useMemo(() => (
        filteredTerms.reduce((acc, term) => {
            const letter = term.word.charAt(0).toUpperCase();
            if (!acc[letter]) acc[letter] = [];
            acc[letter].push(term);
            return acc;
        }, {})
    ), [filteredTerms]);

    const groupedLetters = useMemo(
        () => Object.keys(groupedTerms).sort(),
        [groupedTerms],
    );

    const focusTerm = filteredTerms[0] || TERM_DB[0];
    const handleStarter = (term) => setSearchQuery(term);
    const openInteractiveLab = (term) => navigation.navigate('InteractiveVocabulary', { initialTerm: term });
    const openSynonymFinder = (term) => navigation.navigate('SynonymFinder', { initialWord: term });

    const highlightSearch = (text, query) => {
        if (!query.trim()) return <Text>{text}</Text>;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <Text>
                {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() 
                        ? <Text key={i} style={styles.highlight}>{part}</Text>
                        : part
                )}
            </Text>
        );
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Terminology Dictionary</Text>
                    <Text style={styles.pageSub}>Academic Lexicon Workspace</Text>
                </View>
            </View>

            <Card style={styles.heroCard}>
                <View style={styles.heroHead}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Academic Tool</Text>
                        <Text style={styles.heroTitle}>Terminology Desk</Text>
                        <Text style={styles.heroBody}>
                            Search academic terms, analyze word families, and jump into interactive practice tools without leaving the flow.
                        </Text>
                    </View>
                    <View style={styles.heroMetric}>
                        <Text style={styles.heroMetricValue}>{filteredTerms.length}</Text>
                        <Text style={styles.heroMetricLabel}>Terms</Text>
                    </View>
                </View>
                <View style={styles.heroActionRow}>
                    <Button label="Interactive Lab" variant="secondary" icon="flask-outline" onPress={() => openInteractiveLab(focusTerm?.key || '')} />
                    <Button label="Synonym Finder" variant="ghost" icon="git-compare-outline" onPress={() => openSynonymFinder(focusTerm?.key || '')} />
                </View>
                <View style={styles.quickChipRow}>
                    {STARTER_TERMS.map((term) => (
                        <TouchableOpacity key={term} style={styles.quickChip} onPress={() => handleStarter(term)}>
                            <Text style={styles.quickChipText}>{term}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            <View style={styles.searchWrap}>
                <Ionicons name="search" size={20} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search terms, definitions, or examples..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={20} color={colors.muted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {focusTerm ? (
                    <Card style={styles.focusCard}>
                        <View style={styles.focusHead}>
                            <View style={styles.focusCopy}>
                                <Text style={styles.focusWord}>{focusTerm.word}</Text>
                                <View style={styles.focusMetaRow}>
                                    <View style={styles.focusTypeBadge}>
                                        <Text style={styles.focusTypeText}>{toTitle(focusTerm.type)}</Text>
                                    </View>
                                    <Text style={styles.focusMetaText}>Current focus term</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => speakEnglish(focusTerm.word, { rate: 0.48 })} style={styles.speakerBtn}>
                                <Ionicons name="volume-medium" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.focusDefinition}>{focusTerm.def}</Text>
                        <Text style={styles.focusExample}>{focusTerm.example}</Text>
                        <View style={styles.focusActionRow}>
                            <Button label="Interactive Lab" variant="secondary" icon="search-outline" onPress={() => openInteractiveLab(focusTerm.key)} />
                            <Button label="Synonyms" variant="ghost" icon="git-compare-outline" onPress={() => openSynonymFinder(focusTerm.key)} />
                        </View>
                    </Card>
                ) : null}

                {groupedLetters.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="search-outline" size={28} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No matching terms</Text>
                        <Text style={styles.emptyBody}>Try a broader academic keyword or switch back to All types.</Text>
                    </Card>
                ) : (
                    groupedLetters.map((letter) => (
                        <View key={letter} style={styles.letterSection}>
                            <Text style={styles.letterHead}>{letter}</Text>
                            {groupedTerms[letter].map((term) => (
                                <Card key={term.id} style={styles.termCard}>
                                    <View style={styles.termHeader}>
                                        <View style={styles.termCopy}>
                                            <Text style={styles.termWord}>{term.word}</Text>
                                            <View style={styles.termMetaRow}>
                                                <View style={styles.typeBadge}>
                                                    <Text style={styles.typeText}>{toTitle(term.type)}</Text>
                                                </View>
                                                <Text style={styles.termMetaText}>Academic glossary entry</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => speakEnglish(term.word, { rate: 0.48 })} style={styles.ttsBtn}>
                                            <Ionicons name="volume-medium" size={18} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.termDef}>{highlightSearch(term.def, searchQuery)}</Text>
                                    <View style={styles.termExampleBox}>
                                        <Text style={styles.termExampleLabel}>Example</Text>
                                        <Text style={styles.termExample}>{highlightSearch(term.example, searchQuery)}</Text>
                                    </View>
                                    <View style={styles.termActionRow}>
                                        <TouchableOpacity 
                                            onPress={() => openInteractiveLab(term.key)}
                                            style={styles.termActionBtn}
                                        >
                                            <Ionicons name="flask-outline" size={14} color="#172554" />
                                            <Text style={styles.termActionText}>Lab</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => openSynonymFinder(term.key)}
                                            style={[styles.termActionBtn, styles.termActionBtnGhost]}
                                        >
                                            <Ionicons name="git-compare-outline" size={14} color="#64748B" />
                                            <Text style={styles.termActionTextGhost}>Synonyms</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    ))
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingTop: spacing.md, 
        paddingBottom: spacing.sm, 
        paddingHorizontal: spacing.xl,
        backgroundColor: '#172554'
    },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(255,255,255,0.1)' },
    pageTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: '#FFFFFF', fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: '#BFDBFE', fontWeight: '700', textTransform: 'uppercase' },

    heroCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: '#172554',
        borderColor: '#172554',
        padding: spacing.lg,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        ...shadow.md,
    },
    heroHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    heroCopy: { flex: 1 },
    heroEyebrow: {
        fontSize: 10,
        color: '#BFDBFE',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '900',
        marginBottom: 6,
    },
    heroBody: {
        fontSize: 13,
        color: '#DBEAFE',
        lineHeight: 18,
        opacity: 0.9,
    },
    heroMetric: {
        alignItems: 'flex-end',
    },
    heroMetricValue: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '900',
    },
    heroMetricLabel: {
        fontSize: 10,
        color: '#BFDBFE',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    heroActionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    quickChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    quickChip: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    quickChipText: {
        fontSize: 11,
        color: '#DBEAFE',
        fontWeight: '700'
    },

    workspaceCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: '#F8FBFF',
        borderColor: '#D7E4FA',
    },
    workspaceHead: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    workspaceCopy: { flex: 1 },
    workspaceTitle: {
        fontSize: typography.body,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
        marginBottom: 4,
    },
    workspaceBody: {
        fontSize: typography.small,
        color: colors.muted,
        lineHeight: 20,
    },
    workspaceMetric: {
        minWidth: 84,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#D7E4FA',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    workspaceMetricValue: {
        fontSize: typography.body,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
    },
    workspaceMetricLabel: {
        marginTop: 2,
        fontSize: typography.xsmall,
        color: colors.muted,
        textTransform: 'uppercase',
    },
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    typeChip: {
        borderWidth: 1,
        borderColor: '#D7E4FA',
        backgroundColor: '#FFFFFF',
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 7,
    },
    typeChipActive: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primaryDark,
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.primaryDark,
    },
    typeChipTextActive: {
        color: '#FFFFFF',
    },

    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderRadius: radius.lg,
        ...shadow.sm,
    },
    searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: 16, color: colors.text },
    clearBtn: { paddingLeft: spacing.sm },

    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    focusCard: {
        padding: spacing.lg,
        borderRadius: radius.xl,
        marginBottom: spacing.lg,
        backgroundColor: '#FFFFFF',
    },
    focusHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    focusCopy: { flex: 1 },
    focusWord: {
        fontSize: typography.h3,
        color: colors.primaryDark,
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.xs,
    },
    focusMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    focusTypeBadge: {
        backgroundColor: colors.primarySoft,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    focusTypeText: {
        fontSize: 11,
        color: colors.primaryDark,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    focusMetaText: { fontSize: 12, color: colors.muted, fontWeight: '700' },
    speakerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusDefinition: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    focusExample: {
        fontSize: 13,
        color: colors.muted,
        lineHeight: 20,
        fontStyle: 'italic',
        marginBottom: spacing.md,
    },
    focusActionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },

    letterSection: { marginBottom: spacing.lg },
    letterHead: {
        fontSize: 28,
        fontWeight: '900',
        color: 'rgba(0,0,0,0.12)',
        marginBottom: spacing.sm,
        fontFamily: typography.fontHeadline,
    },
    highlight: { backgroundColor: '#FFD700', fontWeight: '900', color: '#000' },
    termCard: {
        padding: spacing.lg,
        borderRadius: radius.xl,
        marginBottom: spacing.md,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...shadow.sm,
    },
    termHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: 12,
    },
    termCopy: { flex: 1 },
    termWord: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
    termMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    typeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
    typeText: { fontSize: 11, fontWeight: '800', color: '#172554', textTransform: 'uppercase' },
    termMetaText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
    ttsBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    termDef: { fontSize: 15, color: '#334155', lineHeight: 22, fontWeight: '500' },
    termExampleBox: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: '#E2E8F0' },
    termExampleLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
    termExample: { fontSize: 14, color: '#64748B', lineHeight: 20, fontStyle: 'italic' },
    termActionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: 16,
    },
    termActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    termActionBtnGhost: {
        backgroundColor: '#F8FAFC',
        borderColor: '#F1F5F9',
    },
    termActionText: { fontSize: 12, fontWeight: '800', color: '#172554' },
    termActionTextGhost: { fontSize: 12, fontWeight: '800', color: '#64748B' },

    emptyCard: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
        gap: spacing.sm,
    },
    emptyTitle: {
        fontSize: typography.body,
        color: colors.primaryDark,
        fontWeight: '800',
    },
    emptyBody: {
        fontSize: typography.small,
        color: colors.muted,
        textAlign: 'center',
    },
    bottomSpacer: { height: 80 },
});
