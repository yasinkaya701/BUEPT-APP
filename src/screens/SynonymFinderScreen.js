/**
 * SynonymFinderScreen.js
 * Real-time synonym, antonym, collocation and example finder.
 * Tap any synonym/antonym to hear TTS pronunciation.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Animated, Keyboard
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { getWordEntry } from '../utils/dictionary';
import { speakEnglish } from '../utils/ttsEnglish';

const CHIP_COLORS = {
    synonym: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
    antonym: { bg: '#FFEBEE', text: '#B71C1C', border: '#EF9A9A' },
    collocation: { bg: '#E3F2FD', text: '#0D47A1', border: '#90CAF9' },
    derivative: { bg: '#FFF3E0', text: '#BF360C', border: '#FFCC80' },
};

async function speak(word) {
    try {
        await speakEnglish(word, { rate: 0.48 });
    } catch (_) { }
}

function WordChip({ word, type, onPress }) {
    const c = CHIP_COLORS[type] || CHIP_COLORS.synonym;
    const anim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(anim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        onPress?.(word);
        speak(word);
    };

    return (
        <Animated.View style={{ transform: [{ scale: anim }] }}>
            <TouchableOpacity
                style={[styles.chip, { backgroundColor: c.bg, borderColor: c.border }]}
                onPress={handlePress}
                activeOpacity={0.85}
            >
                <Text style={[styles.chipText, { color: c.text }]}>{word}</Text>
                <Text style={styles.chipSpeak}>🔊</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function SynonymFinderScreen() {
    const [query, setQuery] = useState('');
    const [committed, setCommitted] = useState('');
    const [history, setHistory] = useState([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(false);

    const mergeEntry = useCallback((online, local, word) => {
        const normWord = String(word || '').toLowerCase().trim();
        const pick = (a, b, fallback = '') => (String(a || '').trim() || String(b || '').trim() || fallback);
        const uniq = (arr = []) => [...new Set(arr.map((x) => String(x || '').trim()).filter(Boolean))];
        const examples = uniq([...(online?.examples || []), ...(local?.examples || [])]).slice(0, 5);
        return {
            word: pick(online?.word, local?.word, normWord),
            word_type: pick(online?.word_type, local?.word_type),
            simple_definition: pick(online?.simple_definition, local?.simple_definition, 'No definition available.'),
            synonyms: uniq([...(online?.synonyms || []), ...(local?.synonyms || [])]).slice(0, 15),
            antonyms: uniq([...(online?.antonyms || []), ...(local?.antonyms || [])]).slice(0, 15),
            collocations: uniq([...(online?.collocations || []), ...(local?.collocations || [])]).slice(0, 10),
            derivatives: uniq([...(online?.derivatives || []), ...(local?.derivatives || [])]).slice(0, 10),
            examples: examples.length ? examples : [`In academic writing, "${normWord}" is used in context.`],
            level: pick(online?.level, local?.level),
            common_errors: uniq([...(online?.common_errors || []), ...(local?.common_errors || [])]).slice(0, 6),
        };
    }, []);

    const fetchWord = useCallback(async (word) => {
        if (!word) return;
        setLoading(true);
        setEntry(null);
        const localFallback = getWordEntry(word);
        try {
            // 1. Try Free Dictionary API for rich synonyms and examples
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (res.ok) {
                const data = await res.json();
                const d = data[0];

                let allSyns = [];
                let allAnts = [];
                let allExs = [];
                let def = '';
                let type = '';

                d.meanings?.forEach(m => {
                    if (!type) type = m.partOfSpeech;
                    if (m.synonyms) allSyns.push(...m.synonyms);
                    if (m.antonyms) allAnts.push(...m.antonyms);
                    m.definitions?.forEach(df => {
                        if (!def) def = df.definition;
                        if (df.synonyms) allSyns.push(...df.synonyms);
                        if (df.antonyms) allAnts.push(...df.antonyms);
                        if (df.example) allExs.push(df.example);
                    });
                });

                const onlineEntry = {
                    word: d.word,
                    word_type: type,
                    simple_definition: def,
                    synonyms: [...new Set(allSyns)].slice(0, 15),
                    antonyms: [...new Set(allAnts)].slice(0, 15),
                    examples: allExs.slice(0, 5),
                    level: '' // API doesn't provide level
                };
                setEntry(mergeEntry(onlineEntry, localFallback, word));
            } else {
                // 2. Fallback to local dictionary if not found
                setEntry(mergeEntry(null, localFallback, word));
            }
        } catch (e) {
            // Fallback on network error
            setEntry(mergeEntry(null, localFallback, word));
        } finally {
            setLoading(false);
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }
    }, [fadeAnim, mergeEntry]);

    useEffect(() => {
        if (committed.trim()) {
            fetchWord(committed.toLowerCase().trim());
        }
    }, [committed, fetchWord]);

    const doSearch = useCallback((word) => {
        const w = (word || query).trim().toLowerCase();
        if (!w) return;
        Keyboard.dismiss();
        setCommitted(w);
        setQuery(w);
        setHistory(prev => {
            const filtered = prev.filter(h => h !== w);
            return [w, ...filtered].slice(0, 8);
        });
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    }, [query, fadeAnim]);

    return (
        <Screen scroll contentStyle={styles.container}>
            <Text style={styles.h1}>🔍 Synonym Finder</Text>
            <Text style={styles.sub}>Search a word to find synonyms, antonyms, and more</Text>

            {/* Search */}
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a word… e.g. significant"
                    placeholderTextColor={colors.muted}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => doSearch()}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch()}>
                    <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* History */}
            {history.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                    <View style={styles.historyRow}>
                        {history.map(w => (
                            <TouchableOpacity key={w} style={styles.histChip} onPress={() => doSearch(w)}>
                                <Text style={styles.histText}>{w}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

            {/* Loading */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Fetching definitions, synonyms & examples...</Text>
                </View>
            )}

            {/* Results */}
            {committed && !loading && !entry && (
                <Card style={styles.card}>
                    <Text style={styles.notFound}>No entry found for "{committed}"</Text>
                    <Text style={styles.sub}>Check spelling or try a simpler word form.</Text>
                </Card>
            )}

            {entry && !loading && (
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Word header */}
                    <Card style={[styles.wordCard, shadow.elev2]}>
                        <View style={styles.wordRow}>
                            <TouchableOpacity onPress={() => speak(entry.word)} style={styles.wordSpeak}>
                                <Text style={styles.word}>{entry.word}</Text>
                                <Text style={styles.speakIcon}>🔊</Text>
                            </TouchableOpacity>
                            {entry.level && (
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>{entry.level}</Text>
                                </View>
                            )}
                        </View>
                        {entry.word_type && <Text style={styles.wordType}>{entry.word_type}</Text>}
                        <Text style={styles.definition}>{entry.simple_definition || 'No definition available.'}</Text>
                    </Card>

                    {/* Synonyms */}
                    {entry.synonyms?.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>✅ Synonyms</Text>
                            <View style={styles.chipRow}>
                                {entry.synonyms.map((w, i) => (
                                    <WordChip
                                        key={i}
                                        word={w}
                                        type="synonym"
                                        onPress={doSearch}
                                    />
                                ))}
                            </View>
                        </Card>
                    )}

                    {/* Antonyms */}
                    {entry.antonyms?.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>🔴 Antonyms</Text>
                            <View style={styles.chipRow}>
                                {entry.antonyms.map((w, i) => (
                                    <WordChip key={i} word={w} type="antonym" onPress={doSearch} />
                                ))}
                            </View>
                        </Card>
                    )}

                    {/* Collocations */}
                    {entry.collocations?.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>🔗 Collocations</Text>
                            <View style={styles.chipRow}>
                                {entry.collocations.map((w, i) => (
                                    <WordChip key={i} word={w} type="collocation" onPress={() => speak(w)} />
                                ))}
                            </View>
                        </Card>
                    )}

                    {/* Word Forms */}
                    {entry.derivatives?.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>📝 Word Forms</Text>
                            <View style={styles.chipRow}>
                                {entry.derivatives.map((w, i) => (
                                    <WordChip key={i} word={w} type="derivative" onPress={() => speak(w)} />
                                ))}
                            </View>
                        </Card>
                    )}

                    {/* Examples */}
                    {entry.examples?.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>💬 Example Sentences</Text>
                            {entry.examples.slice(0, 3).map((ex, i) => (
                                <TouchableOpacity key={i} style={styles.exampleRow} onPress={() => speak(ex)}>
                                    <Text style={styles.exampleBullet}>{i + 1}.</Text>
                                    <Text style={styles.exampleText}>"{ex}"</Text>
                                    <Text style={styles.exampleSpeak}>🔊</Text>
                                </TouchableOpacity>
                            ))}
                        </Card>
                    )}

                    {/* Common Errors */}
                    {entry.common_errors?.length > 0 && (
                        <Card style={[styles.card, styles.errorCard]}>
                            <Text style={styles.sectionTitle}>⚠️ Common Mistakes</Text>
                            {entry.common_errors.map((e, i) => (
                                <Text key={i} style={styles.errorText}>• {e}</Text>
                            ))}
                        </Card>
                    )}
                </Animated.View>
            )}

            {!committed && (
                <Card style={styles.tipsCard}>
                    <Text style={styles.sectionTitle}>💡 Tips</Text>
                    <Text style={styles.tipText}>• Tap any synonym to search it instantly</Text>
                    <Text style={styles.tipText}>• Tap 🔊 on any word to hear its pronunciation</Text>
                    <Text style={styles.tipText}>• Your search history appears as quick chips</Text>
                    <Text style={styles.tipText}>• Try: significant, analyze, contribute, however</Text>
                </Card>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: spacing.xl },
    h1: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md },

    searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.body,
        color: colors.text,
        borderWidth: 1.5,
        borderColor: colors.secondary,
        fontFamily: typography.fontBody,
    },
    searchBtn: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBtnText: {
        color: '#fff',
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
    },

    historyRow: { flexDirection: 'row', gap: spacing.xs },
    histChip: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 999,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    histText: { fontSize: typography.small, color: colors.primary, fontFamily: typography.fontHeadline },

    card: { marginBottom: spacing.md },
    wordCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
    },
    wordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    wordSpeak: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    word: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: '#fff',
    },
    speakIcon: { fontSize: 20, color: '#A8C0FF' },
    levelBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 999,
    },
    levelText: { color: '#fff', fontSize: typography.small, fontFamily: typography.fontHeadline },
    wordType: { fontSize: typography.small, color: '#A8C0FF', marginBottom: spacing.sm },
    definition: { fontSize: typography.body, color: '#DDE8FF', lineHeight: 22 },

    sectionTitle: {
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 999,
        borderWidth: 1.5,
    },
    chipText: { fontSize: typography.small, fontFamily: typography.fontHeadline },
    chipSpeak: { fontSize: 12 },

    exampleRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
        alignItems: 'flex-start',
    },
    exampleBullet: { fontSize: typography.small, color: colors.muted, width: 16 },
    exampleText: { flex: 1, fontSize: typography.small, color: colors.text, fontStyle: 'italic', lineHeight: 20 },
    exampleSpeak: { fontSize: 14, marginTop: 2 },

    errorCard: { backgroundColor: '#FFF8F8', borderColor: '#FFCDD2' },
    errorText: { fontSize: typography.small, color: '#B71C1C', marginBottom: 4 },

    tipsCard: { marginBottom: spacing.md, backgroundColor: colors.surfaceAlt },
    tipText: { fontSize: typography.small, color: colors.muted, marginBottom: 4 },
    notFound: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
    loadingContainer: { padding: spacing.xl, alignItems: 'center' },
    loadingText: { fontSize: typography.body, color: colors.primary, fontFamily: typography.fontHeadline },
});
