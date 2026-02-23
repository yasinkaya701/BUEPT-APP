import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getDictionarySample } from '../utils/dictionary';
import { speakEnglish } from '../utils/ttsEnglish';

const TERM_DB = getDictionarySample(320).map((item) => {
    const capWord = `${item.word.charAt(0).toUpperCase()}${item.word.slice(1)}`;
    return {
        word: capWord,
        def: item.simple_definition,
        type: item.word_type || 'term',
        example: item.examples?.[0] || `In this lesson, we practiced the word "${item.word}".`,
    };
});

export default function TerminologyDictionaryScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const scrollRef = useRef();

    // Grouping
    const grouped = TERM_DB.reduce((acc, curr) => {
        const letter = curr.word.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(curr);
        return acc;
    }, {});

    const filteredKeys = Object.keys(grouped).sort().filter(k =>
        grouped[k].some(t => t.word.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Dictionary</Text>
                    <Text style={styles.pageSub}>Academic Lexicon</Text>
                </View>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons name="search" size={20} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search terms (e.g. Paradigm)..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.muted} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.mainArea}>
                <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {filteredKeys.length === 0 && (
                        <Text style={styles.emptyText}>No matching terms found.</Text>
                    )}

                    {filteredKeys.map(letter => (
                        <View key={letter} style={styles.letterSection}>
                            <Text style={styles.letterHead}>{letter}</Text>
                            {grouped[letter].filter(t => t.word.toLowerCase().includes(searchQuery.toLowerCase())).map(term => (
                                <Card key={term.word} style={styles.termCard}>
                                    <View style={styles.termHeader}>
                                        <Text style={styles.termWord}>{term.word}</Text>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeText}>{term.type}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => speakEnglish(term.word, { rate: 0.48 })} style={styles.ttsBtn}>
                                            <Ionicons name="volume-medium" size={18} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.termDef}>{term.def}</Text>
                                    <Text style={styles.termExample}>Example: {term.example}</Text>
                                </Card>
                            ))}
                        </View>
                    ))}
                    <View style={{ height: 80 }} />
                </ScrollView>

                {/* Alphabet Jump List (Visual Only for simplicity in RN without complex layout meas) */}
                <View style={styles.jumpList}>
                    {ALPHABET.map(l => (
                        <TouchableOpacity key={l} style={styles.jumpItem} disabled={!grouped[l]}>
                            <Text style={[styles.jumpText, !grouped[l] && styles.jumpTextDisabled]}>{l}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: spacing.xl, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.lg, ...shadow.sm },
    searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: 16, color: colors.text },

    mainArea: { flex: 1, flexDirection: 'row' },
    scroll: { paddingHorizontal: spacing.xl, paddingRight: spacing.md },

    letterSection: { marginBottom: spacing.lg },
    letterHead: { fontSize: 28, fontWeight: '900', color: 'rgba(0,0,0,0.1)', marginBottom: spacing.sm, fontFamily: typography.fontHeadline },

    termCard: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: '#fff' },
    termHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    termWord: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
    typeBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: spacing.md },
    typeText: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
    ttsBtn: { padding: 4, borderRadius: 12, backgroundColor: 'rgba(52, 152, 219, 0.1)' },
    termDef: { fontSize: 14, color: colors.muted, lineHeight: 20 },
    termExample: { fontSize: 12, color: colors.primaryLight, lineHeight: 18, marginTop: 6, fontStyle: 'italic' },

    emptyText: { textAlign: 'center', color: colors.muted, marginTop: 40, fontSize: 14 },

    jumpList: { width: 30, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.05)' },
    jumpItem: { marginVertical: 2 },
    jumpText: { fontSize: 10, fontWeight: '800', color: colors.primary },
    jumpTextDisabled: { color: 'rgba(0,0,0,0.1)' }
});
