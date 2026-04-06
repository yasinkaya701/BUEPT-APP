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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppState } from '../context/AppState';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { getWordEntry, getDictionarySample, sanitizeSynonymList, getWordFamily } from '../utils/dictionary';
import { speakEnglish } from '../utils/ttsEnglish';
import { lookupSynonymsForWord } from '../utils/synonymSuggest';
import { subscribeSmokeActions } from '../dev/smokeBus';

const CHIP_COLORS = {
    synonym: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
    antonym: { bg: '#FFEBEE', text: '#B71C1C', border: '#EF9A9A' },
    collocation: { bg: '#E3F2FD', text: '#0D47A1', border: '#90CAF9' },
    derivative: { bg: '#FFF3E0', text: '#BF360C', border: '#FFCC80' },
};
const SEARCH_HISTORY_KEY = '@synonym_finder_history_v2';
const STARTER_WORDS = ['significant', 'coherent', 'through', 'analyze', 'contribute', 'although'];

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

export default function SynonymFinderScreen({ navigation, route }) {
    const [query, setQuery] = useState('');
    const [committed, setCommitted] = useState('');
    const [history, setHistory] = useState([]);
    const [relatedHints, setRelatedHints] = useState([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [entry, setEntry] = useState(null);
    const [entrySource, setEntrySource] = useState('');
    const [savedWord, setSavedWord] = useState('');
    const [loading, setLoading] = useState(false);
    const { addUserWord } = useAppState();
    const smokeDoneRef = useRef(false);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
                const parsed = JSON.parse(raw || '[]');
                if (Array.isArray(parsed)) {
                    setHistory(parsed.filter(Boolean).slice(0, 8));
                }
            } catch (_) { }
        })();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8))).catch(() => { });
    }, [history]);

    const mergeEntry = useCallback((online, local, word) => {
        const normWord = String(word || '').toLowerCase().trim();
        const pick = (a, b, fallback = '') => (String(a || '').trim() || String(b || '').trim() || fallback);
        const uniq = (arr = []) => [...new Set(arr.map((x) => String(x || '').trim()).filter(Boolean))];
        const examples = uniq([...(online?.examples || []), ...(local?.examples || [])]).slice(0, 5);
        const fallbackExamples = [
            `${normWord} is often used in academic writing to make claims more precise.`,
            `In a BUEPT response, ${normWord} can strengthen the main argument when used clearly.`,
            `A useful study habit is writing one original sentence with ${normWord} after each lesson.`,
        ];
        // Build derivatives from getWordFamily
        const wordType = pick(online?.word_type, local?.word_type);
        const family = getWordFamily(normWord, local);
        const familyDerivatives = [
            ...(family?.noun || []),
            ...(family?.verb || []),
            ...(family?.adjective || []),
            ...(family?.adverb || []),
        ].filter((w) => w && w !== normWord);
        const providedDerivatives = uniq([...(online?.derivatives || []), ...(local?.derivatives || [])]);
        const allDerivatives = uniq([...providedDerivatives, ...familyDerivatives]).slice(0, 12);
        // Antonyms: merge online + local + curated (already in local via hydrateEntry)
        const allAntonyms = uniq([...(online?.antonyms || []), ...(local?.antonyms || [])]).slice(0, 12);
        return {
            word: pick(online?.word, local?.word, normWord),
            word_type: wordType,
            simple_definition: pick(online?.simple_definition, local?.simple_definition, 'No definition available.'),
            synonyms: sanitizeSynonymList(normWord, wordType, uniq([...(online?.synonyms || []), ...(local?.synonyms || [])])).slice(0, 15),
            antonyms: allAntonyms,
            collocations: uniq([...(online?.collocations || []), ...(local?.collocations || [])]).slice(0, 10),
            derivatives: allDerivatives,
            examples: examples.length ? examples : fallbackExamples,
            level: pick(online?.level, local?.level),
            common_errors: uniq([...(online?.common_errors || []), ...(local?.common_errors || [])]).slice(0, 6),
        };
    }, []);

    const buildRelatedHints = useCallback((word) => {
        const norm = String(word || '').toLowerCase().trim();
        if (!norm) return [];
        const root = norm
            .replace(/ing$/, '')
            .replace(/ed$/, '')
            .replace(/es$/, '')
            .replace(/s$/, '');
        return getDictionarySample(1400)
            .map((e) => String(e?.word || '').toLowerCase().trim())
            .filter(Boolean)
            .filter((w) => w !== norm)
            .filter((w) => w.startsWith(root.slice(0, Math.min(4, root.length))) || w.includes(root))
            .slice(0, 10);
    }, []);

    const fetchWord = useCallback(async (word) => {
        if (!word) return;
        setLoading(true);
        setEntry(null);
        setEntrySource('');
        setRelatedHints([]);
        const localFallback = getWordEntry(word);
        const fallbackHints = buildRelatedHints(word);
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
                const merged = mergeEntry(onlineEntry, localFallback, word);
                const extraSynonyms = sanitizeSynonymList(word, onlineEntry.word_type, lookupSynonymsForWord(word, 12));
                setEntrySource('Live API');
                setEntry({
                    ...merged,
                    synonyms: sanitizeSynonymList(word, merged.word_type, [...new Set([...(merged.synonyms || []), ...extraSynonyms])]).slice(0, 15),
                });
                setRelatedHints(fallbackHints);
            } else {
                // 2. Fallback to local dictionary if not found
                const merged = mergeEntry(null, localFallback, word);
                const extraSynonyms = sanitizeSynonymList(word, merged.word_type, lookupSynonymsForWord(word, 12));
                const synonyms = sanitizeSynonymList(word, merged.word_type, [...new Set([...(merged.synonyms || []), ...extraSynonyms])]).slice(0, 15);
                const hasSignal = Boolean(
                    (merged.simple_definition && merged.simple_definition !== 'No definition available.') ||
                    synonyms.length ||
                    merged.antonyms?.length ||
                    merged.examples?.length
                );
                setEntrySource(hasSignal ? 'Local bank' : '');
                setEntry(hasSignal ? { ...merged, synonyms } : null);
                setRelatedHints(fallbackHints);
            }
        } catch (e) {
            // Fallback on network error
            const merged = mergeEntry(null, localFallback, word);
            const extraSynonyms = sanitizeSynonymList(word, merged.word_type, lookupSynonymsForWord(word, 12));
            const synonyms = sanitizeSynonymList(word, merged.word_type, [...new Set([...(merged.synonyms || []), ...extraSynonyms])]).slice(0, 15);
            const hasSignal = Boolean(
                (merged.simple_definition && merged.simple_definition !== 'No definition available.') ||
                synonyms.length ||
                merged.antonyms?.length ||
                merged.examples?.length
            );
            setEntrySource(hasSignal ? 'Local bank' : '');
            setEntry(hasSignal ? { ...merged, synonyms } : null);
            setRelatedHints(fallbackHints);
        } finally {
            setLoading(false);
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }
    }, [buildRelatedHints, fadeAnim, mergeEntry]);

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
        setSavedWord('');
        setHistory(prev => {
            const filtered = prev.filter(h => h !== w);
            return [w, ...filtered].slice(0, 8);
        });
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    }, [query, fadeAnim]);

    useEffect(() => {
        if (!__DEV__) return undefined;
        const unsubscribe = subscribeSmokeActions((action) => {
            if (action?.target !== 'SynonymFinder') return;
            if (smokeDoneRef.current) return;
            if (action?.type !== 'search') return;
            smokeDoneRef.current = true;
            const word = action?.word || 'significant';
            doSearch(word);
        });
        return unsubscribe;
    }, [doSearch]);

    useEffect(() => {
        const initialWord = String(route?.params?.initialWord || '').trim();
        if (!initialWord) return;
        doSearch(initialWord);
    }, [route?.params?.initialWord, doSearch]);

    const handleAddWord = useCallback(() => {
        if (!entry?.word) return;
        addUserWord(entry.word);
        setSavedWord(entry.word);
    }, [addUserWord, entry]);

    return (
        <Screen scroll contentStyle={styles.container}>
            <Text style={styles.h1}>Synonym Finder</Text>
            <Text style={styles.headerSub}>Search one word and get definition, synonyms, antonyms, collocations and examples.</Text>

            <Card style={styles.heroCard} glow>
                <View style={styles.heroHeader}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Lookup Tool</Text>
                        <Text style={styles.heroTitle}>Branch from one word into cleaner synonym and collocation choices.</Text>
                        <Text style={styles.heroBody}>
                            Use this before writing or speaking so you choose a synonym that fits the meaning, not just a similar-looking word.
                        </Text>
                    </View>
                    <View style={styles.heroMetric}>
                        <Text style={styles.heroMetricValue}>{history.length}</Text>
                        <Text style={styles.heroMetricLabel}>Recent</Text>
                    </View>
                </View>
                <View style={styles.heroActionRow}>
                    <Button
                        label="Interactive Dictionary"
                        variant="secondary"
                        icon="book-outline"
                        onPress={() => navigation.navigate('InteractiveVocabulary')}
                    />
                    <Button
                        label="Vocab Hub"
                        variant="ghost"
                        icon="grid-outline"
                        onPress={() => navigation.navigate('Vocab', { initialSection: 'Dictionary' })}
                    />
                </View>
            </Card>

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={17} color={colors.muted} />
                    <TextInput
                        style={styles.input}
                        placeholder="Type a word... e.g. significant"
                        placeholderTextColor={colors.muted}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => doSearch()}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={18} color={colors.muted} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch()}>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                    <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* History */}
            {history.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
                    <View style={styles.historyRow}>
                        {history.map(w => (
                            <TouchableOpacity key={w} style={styles.histChip} onPress={() => doSearch(w)}>
                                <Text style={styles.histText}>{w}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

            {!committed && (
                <Card style={styles.quickStartCard}>
                    <Text style={styles.sectionTitle}>Quick Start</Text>
                    <View style={styles.chipRow}>
                        {STARTER_WORDS.map((word) => (
                            <WordChip key={`starter-${word}`} word={word} type="synonym" onPress={doSearch} />
                        ))}
                    </View>
                </Card>
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
                    <Text style={styles.sub}>Check spelling or try one of these nearby words.</Text>
                    {relatedHints.length > 0 ? (
                        <View style={styles.chipRow}>
                            {relatedHints.map((w) => (
                                <WordChip key={`hint-${w}`} word={w} type="synonym" onPress={doSearch} />
                            ))}
                        </View>
                    ) : null}
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
                        <View style={styles.metaRow}>
                            <View style={styles.metaChip}>
                                <Text style={styles.metaChipText}>{entry.synonyms?.length || 0} synonyms</Text>
                            </View>
                            <View style={styles.metaChip}>
                                <Text style={styles.metaChipText}>{entry.examples?.length || 0} examples</Text>
                            </View>
                            {!!entrySource && (
                                <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{entrySource}</Text>
                                </View>
                            )}
                            {!!entry.word_type && (
                                <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{entry.word_type}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.actionRow}>
                            <Button
                                label={savedWord === entry.word ? 'Added to My Words' : 'Add to My Words'}
                                variant={savedWord === entry.word ? 'ghost' : 'secondary'}
                                icon="bookmark-outline"
                                onPress={handleAddWord}
                                style={styles.actionBtn}
                            />
                            <Button
                                label="Open Vocab"
                                variant="ghost"
                                icon="book-outline"
                                onPress={() => navigation.navigate('Vocab')}
                                style={styles.actionBtn}
                            />
                        </View>
                        {savedWord === entry.word ? (
                            <Text style={styles.savedText}>Saved. You can review it later in Vocab → My Words.</Text>
                        ) : null}
                        {/* ── Quick quiz access ── */}
                        <View style={[styles.actionRow, { marginTop: spacing.xs }]}>
                            <Button
                                label="📝 Word Quiz"
                                variant="secondary"
                                onPress={() => navigation.navigate('VocabQuiz', { size: 10 })}
                                style={styles.actionBtn}
                            />
                            <Button
                                label="🔀 Synonym Quiz"
                                variant="secondary"
                                onPress={() => navigation.navigate('VocabSynonymQuiz', { size: 10 })}
                                style={styles.actionBtn}
                            />
                        </View>
                        <View style={styles.actionRow}>
                            <Button
                                label="✏️ Cloze Quiz"
                                variant="secondary"
                                onPress={() => navigation.navigate('VocabClozeQuiz', { size: 10 })}
                                style={styles.actionBtn}
                            />
                            <Button
                                label="🔗 Collocation Quiz"
                                variant="secondary"
                                onPress={() => navigation.navigate('VocabCollocationQuiz', { size: 10 })}
                                style={styles.actionBtn}
                            />
                        </View>
                    </Card>

                    {relatedHints.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>Related Words</Text>
                            <View style={styles.chipRow}>
                                {relatedHints.map((w) => (
                                    <WordChip key={`related-${w}`} word={w} type="synonym" onPress={doSearch} />
                                ))}
                            </View>
                        </Card>
                    )}

                    {/* Synonyms */}
                    {entry.synonyms?.length > 0 && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>✅ Synonyms</Text>
                            <View style={styles.chipRow}>
                                {entry.synonyms.map((w, i) => (
                                    <WordChip
                                        key={`syn-${w}-${i}`}
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
                                    <WordChip key={`ant-${w}-${i}`} word={w} type="antonym" onPress={doSearch} />
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
                                    <WordChip key={`col-${w}-${i}`} word={w} type="collocation" onPress={() => speak(w)} />
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
                                    <WordChip key={`der-${w}-${i}`} word={w} type="derivative" onPress={doSearch} />
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
                    <Text style={styles.tipText}>• Use “Add to My Words” to save useful vocabulary</Text>
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
        marginBottom: 2,
    },
    headerSub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md },
    sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.md },
    heroCard: {
        marginBottom: spacing.md,
        backgroundColor: '#172554',
        borderColor: '#172554',
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    heroCopy: {
        flex: 1,
    },
    heroEyebrow: {
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.xs,
    },
    heroTitle: {
        fontSize: typography.h3,
        color: '#FFFFFF',
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.xs,
    },
    heroBody: {
        fontSize: typography.small,
        color: '#DBEAFE',
        lineHeight: 20,
    },
    heroMetric: {
        minWidth: 78,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    heroMetricValue: {
        fontSize: typography.h3,
        color: '#FFFFFF',
        fontFamily: typography.fontHeadline,
    },
    heroMetricLabel: {
        marginTop: 2,
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        textTransform: 'uppercase',
    },
    heroActionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },

    searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'stretch' },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingHorizontal: spacing.md,
        borderWidth: 1.5,
        borderColor: colors.secondary,
    },
    input: {
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: spacing.md,
        fontSize: typography.body,
        color: colors.text,
        fontFamily: typography.fontBody,
    },
    searchBtn: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    searchBtnText: {
        color: '#fff',
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
    },

    historyScroll: { marginBottom: spacing.md },
    historyRow: { flexDirection: 'row', gap: spacing.xs },
    quickStartCard: { marginBottom: spacing.md },
    histChip: {
        backgroundColor: '#EEF4FF',
        borderRadius: 999,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderWidth: 1,
        borderColor: '#D5E2FF',
    },
    histText: { fontSize: typography.small, color: colors.primaryDark, fontFamily: typography.fontHeadline },

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
    metaRow: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    metaChip: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.24)',
        borderRadius: 999,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    metaChipText: {
        color: '#DDE8FF',
        fontSize: typography.xsmall,
        fontFamily: typography.fontHeadline,
    },
    actionRow: {
        marginTop: spacing.md,
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionBtn: {
        flex: 1,
    },
    savedText: {
        marginTop: spacing.sm,
        fontSize: typography.small,
        color: '#DDE8FF',
    },

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
