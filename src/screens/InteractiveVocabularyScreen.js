import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { speakEnglish } from '../utils/ttsEnglish';
import { isDemoAiConfigured, requestDemoModule } from '../utils/demoAi';
import { getWordEntry, getWordFamily } from '../utils/dictionary';
import { getAiSourceMeta } from '../utils/aiWorkspace';

const STARTER_TERMS = ['significant', 'analyze', 'equilibrium', 'synthesis'];

// Word Family: shows how a word transforms across parts of speech
const DICTIONARY_API_MOCK = {
    'equilibrium': {
        word: 'equilibrium',
        phonetic: '/ˌiːkwɪˈlɪbriəm/',
        partOfSpeech: 'noun',
        definition: 'A state in which opposing forces or influences are balanced.',
        translation: 'Denge',
        synonyms: ['balance', 'symmetry', 'evenness', 'stability'],
        antonyms: ['imbalance', 'instability'],
        forms: [
            { pos: 'Noun', word: 'equilibrium' },
            { pos: 'Adjective', word: 'equilibrant' },
            { pos: 'Verb', word: 'equilibrate' },
            { pos: 'Adverb', word: 'equilibrantly' },
        ],
        examples: [
            { en: 'The market needs equilibrium to function properly.', tr: 'Piyasanın düzgün işleyebilmesi için dengeye ihtiyacı var.' },
            { en: 'Chemical equilibrium was reached after several hours.', tr: 'Kimyasal denge birkaç saat sonra sağlandı.' },
            { en: 'She maintained her emotional equilibrium despite the pressure.', tr: 'Baskıya rağmen duygusal dengesini korudu.' },
        ],
    },
    'qualitative': {
        word: 'qualitative',
        phonetic: '/ˈkwɒlɪtətɪv/',
        partOfSpeech: 'adjective',
        definition: 'Relating to, measuring, or measured by the quality of something rather than its quantity.',
        translation: 'Niteliksel',
        synonyms: ['subjective', 'descriptive', 'interpretive'],
        antonyms: ['quantitative', 'objective', 'numerical'],
        forms: [
            { pos: 'Adjective', word: 'qualitative' },
            { pos: 'Adverb', word: 'qualitatively' },
            { pos: 'Noun', word: 'quality' },
            { pos: 'Verb', word: 'qualify' },
        ],
        examples: [
            { en: 'We conducted a qualitative analysis of the interviews.', tr: 'Görüşmelerin niteliksel bir analizini yaptık.' },
            { en: 'The qualitative data revealed unexpected patterns.', tr: 'Niteliksel veriler beklenmedik örüntüler ortaya koydu.' },
        ],
    },
    'paradigm': {
        word: 'paradigm',
        phonetic: '/ˈpærədaɪm/',
        partOfSpeech: 'noun',
        definition: 'A typical example or pattern of something; a model or framework.',
        translation: 'Model/Örneklem',
        synonyms: ['model', 'pattern', 'standard', 'prototype', 'framework'],
        antonyms: [],
        forms: [
            { pos: 'Noun', word: 'paradigm' },
            { pos: 'Adjective', word: 'paradigmatic' },
            { pos: 'Adverb', word: 'paradigmatically' },
        ],
        examples: [
            { en: 'There is a new paradigm in public health research.', tr: 'Halk sağlığı araştırmalarında yeni bir paradigma var.' },
            { en: 'This discovery represents a paradigm shift in physics.', tr: 'Bu keşif, fizikte bir paradigma değişimini temsil ediyor.' },
            { en: 'The Newtonian paradigm dominated science for centuries.', tr: 'Newton paradigması yüzyıllarca bilime hâkim oldu.' },
        ],
    },
    'empirical': {
        word: 'empirical',
        phonetic: '/ɪmˈpɪrɪkl/',
        partOfSpeech: 'adjective',
        definition: 'Based on, concerned with, or verifiable by observation or experience rather than theory.',
        translation: 'Deneysel / Ampirik',
        synonyms: ['observational', 'factual', 'pragmatic', 'experimental'],
        antonyms: ['theoretical', 'hypothetical', 'speculative'],
        forms: [
            { pos: 'Adjective', word: 'empirical' },
            { pos: 'Adverb', word: 'empirically' },
            { pos: 'Noun', word: 'empiricism' },
            { pos: 'Noun (person)', word: 'empiricist' },
        ],
        examples: [
            { en: 'Our findings are strictly empirical and reproducible.', tr: 'Bulgularımız tamamen ampirik ve yeniden üretilebilir niteliktedir.' },
            { en: 'Empirical evidence is essential in scientific research.', tr: 'Bilimsel araştırmalarda ampirik kanıt şarttır.' },
            { en: 'The theory lacks empirical support.', tr: 'Teorinin ampirik bir desteği yoktur.' },
        ],
    },
    'synthesis': {
        word: 'synthesis',
        phonetic: '/ˈsɪnθəsɪs/',
        partOfSpeech: 'noun',
        definition: 'The combination of components or elements to form a connected whole.',
        translation: 'Sentez',
        synonyms: ['combination', 'integration', 'amalgamation', 'fusion'],
        antonyms: ['analysis', 'separation', 'decomposition'],
        forms: [
            { pos: 'Noun', word: 'synthesis' },
            { pos: 'Verb', word: 'synthesize' },
            { pos: 'Adjective', word: 'synthetic' },
            { pos: 'Adverb', word: 'synthetically' },
            { pos: 'Noun (person)', word: 'synthesist' },
        ],
        examples: [
            { en: 'The essay requires a synthesis of these three sources.', tr: 'Makale, bu üç kaynağın sentezini gerektiriyor.' },
            { en: 'Chemists synthesize new compounds in the laboratory.', tr: 'Kimyacılar laboratuvarda yeni bileşikler sentezler.' },
            { en: 'Her argument was a brilliant synthesis of history and philosophy.', tr: 'Argümanı, tarih ve felsefenin parlak bir senteziydi.' },
        ],
    },
    'history': {
        word: 'history',
        phonetic: '/ˈhɪstri/',
        partOfSpeech: 'noun',
        definition: 'The study of past events, particularly in human affairs; the whole series of past events connected with a person or thing.',
        translation: 'Tarih',
        synonyms: ['chronicle', 'record', 'past', 'annals', 'heritage'],
        antonyms: ['future', 'present'],
        forms: [
            { pos: 'noun', word: 'history' },
            { pos: 'noun', word: 'historian' },
            { pos: 'adj', word: 'historic' },
            { pos: 'adj', word: 'historical' },
            { pos: 'adv', word: 'historically' },
            { pos: 'verb', word: 'historicize' },
        ],
        examples: [
            { en: 'History repeats itself if we fail to learn from the past.', tr: 'Geçmişten ders almazsak tarih kendini tekrar eder.' },
            { en: 'The historian published a landmark paper on Ottoman history.', tr: 'Tarihçi, Osmanlı tarihi üzerine çığır açan bir makale yayımladı.' },
            { en: 'The signing of the treaty was a historically significant moment.', tr: 'Antlaşmanın imzalanması tarihsel açıdan çok önemli bir andı.' },
        ],
    },
    'analyze': {
        word: 'analyze',
        phonetic: '/ˈænəlaɪz/',
        partOfSpeech: 'verb',
        definition: 'To examine something methodically and in detail, in order to explain and interpret it.',
        translation: 'Analiz etmek / İncelemek',
        synonyms: ['examine', 'investigate', 'study', 'dissect', 'evaluate'],
        antonyms: ['synthesize', 'combine', 'overlook'],
        forms: [
            { pos: 'verb', word: 'analyze' },
            { pos: 'noun', word: 'analysis' },
            { pos: 'noun', word: 'analyst' },
            { pos: 'adj', word: 'analytic' },
            { pos: 'adj', word: 'analytical' },
            { pos: 'adv', word: 'analytically' },
        ],
        examples: [
            { en: 'The researchers analyzed the data collected over three years.', tr: 'Araştırmacılar üç yıl boyunca toplanan verileri analiz etti.' },
            { en: 'A thorough analysis of the results was presented at the conference.', tr: 'Konferansta sonuçların ayrıntılı bir analizi sunuldu.' },
            { en: 'She has a naturally analytical mind.', tr: 'Doğası gereği analitik bir zekâya sahip.' },
        ],
    },
    'significant': {
        word: 'significant',
        phonetic: '/sɪɡˈnɪfɪkənt/',
        partOfSpeech: 'adjective',
        definition: 'Sufficiently great or important to be worthy of attention; noteworthy.',
        translation: 'Önemli / Anlamlı',
        synonyms: ['important', 'notable', 'considerable', 'meaningful', 'substantial'],
        antonyms: ['insignificant', 'trivial', 'minor', 'negligible'],
        forms: [
            { pos: 'adj', word: 'significant' },
            { pos: 'adv', word: 'significantly' },
            { pos: 'noun', word: 'significance' },
            { pos: 'verb', word: 'signify' },
        ],
        examples: [
            { en: 'There was a significant improvement in student performance this semester.', tr: 'Bu dönem öğrenci başarısında kayda değer bir gelişme oldu.' },
            { en: 'The significance of this discovery cannot be overstated.', tr: 'Bu keşfin önemi abartılamaz.' },
            { en: 'Test scores improved significantly after the intervention.', tr: 'Müdahaleden sonra test puanları önemli ölçüde yükseldi.' },
        ],
    },
};

/** Highlights the keyword inside an example sentence with bold blue text */
function HighlightedSentence({ sentence, keyword, style }) {
    const lower = sentence.toLowerCase();
    const kwLower = keyword.toLowerCase();
    const idx = lower.indexOf(kwLower);
    if (idx === -1) return <Text style={style}>{sentence}</Text>;
    const before = sentence.slice(0, idx);
    const match = sentence.slice(idx, idx + keyword.length);
    const after = sentence.slice(idx + keyword.length);
    return (
        <Text style={style}>
            {before}
            <Text style={styles.exampleKeyword}>{match}</Text>
            {after}
        </Text>
    );
}

export default function InteractiveVocabularyScreen({ navigation, route }) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [source, setSource] = useState(isDemoAiConfigured('generic') ? 'online-ready' : 'offline');
    const sourceMeta = getAiSourceMeta(source);

    const playAudio = (text) => {
        speakEnglish(text, { rate: 0.4 });
    };
    const jumpToTerm = (term) => {
        const value = String(term || '').trim().toLowerCase();
        if (!value) return;
        setQuery(value);
        handleSearch(value);
    };

    const normalizeEntry = (entry = {}, fallbackWord = '') => {
        const word = String(entry.word || fallbackWord).toLowerCase();
        const baseForms = Array.isArray(entry.forms) ? entry.forms.filter((f) => f && f.word).map((f) => ({
            pos: String(f.pos || 'noun'),
            word: String(f.word),
        })) : [];
        const family = getWordFamily(word, getWordEntry(word) || null);
        const familyForms = [
            ...(Array.isArray(family?.noun) ? family.noun.map((item) => ({ pos: 'noun', word: item })) : []),
            ...(Array.isArray(family?.verb) ? family.verb.map((item) => ({ pos: 'verb', word: item })) : []),
            ...(Array.isArray(family?.adjective) ? family.adjective.map((item) => ({ pos: 'adj', word: item })) : []),
            ...(Array.isArray(family?.adverb) ? family.adverb.map((item) => ({ pos: 'adv', word: item })) : []),
            ...(Array.isArray(family?.negative) ? family.negative.map((item) => ({ pos: 'negative', word: item })) : []),
        ];
        const seenForms = new Set();
        const forms = [...baseForms, ...familyForms].filter((item) => {
            const key = `${item.pos}:${String(item.word || '').toLowerCase()}`;
            if (!item.word || seenForms.has(key)) return false;
            seenForms.add(key);
            return true;
        });
        return {
            word,
            phonetic: String(entry.phonetic || '/-/'),
            partOfSpeech: String(entry.partOfSpeech || entry.pos || 'noun'),
            definition: String(entry.definition || 'No definition available.'),
            translation: String(entry.translation || 'N/A'),
            synonyms: Array.isArray(entry.synonyms) ? entry.synonyms.filter(Boolean) : [],
            antonyms: Array.isArray(entry.antonyms) ? entry.antonyms.filter(Boolean) : [],
            forms,
            examples: Array.isArray(entry.examples) ? entry.examples.filter((ex) => ex && ex.en).map((ex) => ({
                en: String(ex.en),
                tr: String(ex.tr || ''),
            })) : [],
        };
    };

    const buildLocalDictionaryEntry = useCallback((term) => {
        const entry = getWordEntry(term);
        if (!entry) return null;
        const family = getWordFamily(term, entry);
        const forms = [
            ...(Array.isArray(family?.noun) ? family.noun.map((word) => ({ pos: 'noun', word })) : []),
            ...(Array.isArray(family?.verb) ? family.verb.map((word) => ({ pos: 'verb', word })) : []),
            ...(Array.isArray(family?.adjective) ? family.adjective.map((word) => ({ pos: 'adj', word })) : []),
            ...(Array.isArray(family?.adverb) ? family.adverb.map((word) => ({ pos: 'adv', word })) : []),
            ...(Array.isArray(family?.negative) ? family.negative.map((word) => ({ pos: 'negative', word })) : []),
        ];
        return normalizeEntry({
            word: entry.word,
            phonetic: '',
            partOfSpeech: entry.word_type || 'noun',
            definition: entry.simple_definition || 'No definition available.',
            translation: '',
            synonyms: entry.synonyms || [],
            antonyms: entry.antonyms || [],
            forms,
            examples: Array.isArray(entry.examples)
                ? entry.examples.map((en) => ({ en, tr: '' }))
                : [],
        }, term);
    }, []);

    const handleSearch = useCallback(async (forcedTerm = '') => {
        const rawTerm = String(forcedTerm || query).trim();
        if (!rawTerm) return;
        setIsSearching(true);
        setResult(null);
        setErrorMsg('');
        const term = rawTerm.toLowerCase();
        setQuery(term);
        try {
            const payload = await requestDemoModule('interactive_dictionary', { term, include: ['forms', 'examples', 'synonyms'] });
            const entry = payload?.entry || payload?.result || null;
            if (entry && entry.word) {
                setResult(normalizeEntry(entry, term));
                setSource(payload?.source || 'online');
                setIsSearching(false);
                return;
            }
        } catch (_) {
            // fall through to offline fallback
        }
        const localEntry = buildLocalDictionaryEntry(term);
        if (localEntry) {
            setResult(localEntry);
            setSource('local-dictionary');
        } else {
            const res = DICTIONARY_API_MOCK[term];
            if (res) {
                setResult(normalizeEntry(res, term));
                setSource('legacy-fallback');
            } else {
                setErrorMsg(`No academic entry found for "${query}". Try: history, analyze, significant, paradigm, synthesis, empirical.`);
            }
        }
        setIsSearching(false);
    }, [buildLocalDictionaryEntry, query]);

    useEffect(() => {
        const initialTerm = String(route?.params?.initialTerm || '').trim();
        if (!initialTerm) return;
        setQuery(initialTerm);
        handleSearch(initialTerm);
    }, [handleSearch, route?.params?.initialTerm]);

    const POS_COLORS = {
        // short labels (used in new entries)
        'noun': '#1D4ED8',
        'verb': '#10B981',
        'adj': '#8B5CF6',
        'adv': '#F59E0B',
        // long labels (legacy entries)
        'Noun': '#1D4ED8',
        'Verb': '#10B981',
        'Adjective': '#8B5CF6',
        'Adverb': '#F59E0B',
        'Noun (person)': '#1D4ED8',
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Interactive Vocab</Text>
                    <Text style={styles.pageSub}>Academic Dictionary API</Text>
                    <Text style={styles.sourceText}>Result source: {source}</Text>
                </View>
            </View>

            <Card style={styles.heroCard} glow>
                <View style={styles.heroHeader}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Deep Lookup</Text>
                        <Text style={styles.heroTitle}>Inspect one academic word in depth before you reuse it.</Text>
                        <Text style={styles.heroBody}>
                            Word family, synonyms, antonyms, and bilingual examples are kept on one screen so you can judge fit, not just meaning.
                        </Text>
                    </View>
                    <View style={styles.heroMetric}>
                        <Text style={styles.heroMetricValue}>{source === 'offline' ? 'Local' : 'Live'}</Text>
                        <Text style={styles.heroMetricLabel}>Source</Text>
                    </View>
                </View>
                <View style={styles.heroActionRow}>
                    <Button label="Synonym Finder" variant="secondary" icon="git-compare-outline" onPress={() => navigation.navigate('SynonymFinder')} />
                    <Button label="Vocab Hub" variant="ghost" icon="grid-outline" onPress={() => navigation.navigate('Vocab', { initialSection: 'Dictionary' })} />
                </View>
                <View style={styles.quickChipRow}>
                    {STARTER_TERMS.map((term) => (
                        <TouchableOpacity key={term} style={styles.quickChip} onPress={() => handleSearch(term)}>
                            <Text style={styles.quickChipText}>{term}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ marginTop: spacing.md }}>
                    <Button label="Study with Flashcards" variant="secondary" icon="albums-outline" onPress={() => navigation.navigate('VocabFlashcard', { initialWords: result ? [result.word, ...result.synonyms] : STARTER_TERMS })} />
                </View>
            </Card>

            <Card style={styles.workspaceCard}>
                <View style={styles.workspaceHead}>
                    <View style={styles.workspaceCopy}>
                        <Text style={styles.workspaceTitle}>{sourceMeta.label}</Text>
                        <Text style={styles.workspaceBody}>{sourceMeta.detail}</Text>
                    </View>
                    <View style={styles.workspaceMetric}>
                        <Text style={styles.workspaceMetricValue}>{result?.forms?.length || 0}</Text>
                        <Text style={styles.workspaceMetricLabel}>Family</Text>
                    </View>
                </View>
                <View style={styles.heroActionRow}>
                    <Button label="Demo Hub" variant="ghost" icon="sparkles-outline" onPress={() => navigation.navigate('DemoFeatures')} />
                    <Button label="Search analyze" variant="secondary" icon="search-outline" onPress={() => jumpToTerm('analyze')} />
                </View>
            </Card>

            <KeyboardAvoidingView style={styles.keyboard} enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <View style={styles.searchWrap}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="e.g. equilibrium, paradigm..."
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => { setQuery(''); setResult(null); setErrorMsg(''); }} style={styles.searchClearButton}>
                                <Ionicons name="close-circle" size={20} color={colors.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>

                    {isSearching && (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Querying Academic Lexicon...</Text>
                        </View>
                    )}

                    {!isSearching && errorMsg ? (
                        <Card style={styles.errorCard}>
                            <Ionicons name="alert-circle" size={24} color={colors.error} style={styles.errorIcon} />
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        </Card>
                    ) : null}

                    {!isSearching && result && (
                        <Card style={styles.resultCard} glow>
                            {/* ── Header Row ── */}
                            <View style={styles.topRow}>
                                <View style={styles.resultHeaderCopy}>
                                    <View style={styles.titleRow}>
                                        <Text style={styles.wordText}>{result.word}</Text>
                                        <Text style={styles.phoneticText}>{result.phonetic}</Text>
                                    </View>
                                    <View style={styles.titleMetaRow}>
                                        <View style={styles.posBadge}>
                                            <Text style={styles.posText}>{result.partOfSpeech}</Text>
                                        </View>
                                        <Text style={styles.transText}>{result.translation}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => playAudio(result.word)} style={styles.speakerBtn}>
                                    <Ionicons name="volume-high" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* ── Definition ── */}
                            <View style={styles.definitionBox}>
                                <Text style={styles.definitionTxt}>{result.definition}</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.resultQuickRow}>
                                <Button label="Hear Word" variant="secondary" icon="volume-high-outline" onPress={() => playAudio(result.word)} />
                                <Button label="Synonym Finder" variant="ghost" icon="git-compare-outline" onPress={() => navigation.navigate('SynonymFinder', { term: result.word })} />
                                <Button label="Vocab Hub" variant="ghost" icon="grid-outline" onPress={() => navigation.navigate('Vocab', { initialSection: 'Dictionary' })} />
                            </View>

                            <View style={styles.moduleMetaRow}>
                                <View style={styles.moduleMetaPill}>
                                    <Ionicons name="git-branch-outline" size={12} color={colors.muted} />
                                    <Text style={styles.moduleMetaText}>{result.forms.length} forms</Text>
                                </View>
                                <View style={styles.moduleMetaPill}>
                                    <Ionicons name="swap-horizontal-outline" size={12} color={colors.muted} />
                                    <Text style={styles.moduleMetaText}>{result.synonyms.length} synonyms</Text>
                                </View>
                                <View style={styles.moduleMetaPill}>
                                    <Ionicons name="chatbox-ellipses-outline" size={12} color={colors.muted} />
                                    <Text style={styles.moduleMetaText}>{result.examples.length} examples</Text>
                                </View>
                            </View>

                            {/* ── Word Family / Forms ── */}
                            {result.forms && result.forms.length > 0 && (
                                <View style={styles.sectionRow}>
                                    <View style={styles.sectionLabelRow}>
                                        <Ionicons name="git-branch-outline" size={14} color={colors.muted} />
                                        <Text style={styles.sectionLabel}>Word Family</Text>
                                    </View>
                                    <View style={styles.formsList}>
                                        {result.forms.map((f, i) => {
                                            const isMain = f.word.toLowerCase() === result.word.toLowerCase();
                                            const posColor = POS_COLORS[f.pos] || colors.muted;
                                            return (
                                                <TouchableOpacity
                                                    key={i}
                                                    onPress={() => jumpToTerm(f.word)}
                                                    style={[styles.formRow, isMain && styles.formRowMain]}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.formRowLeft}>
                                                        {isMain && <View style={styles.formMainDot} />}
                                                        <Text style={[styles.formWord, isMain && styles.formWordMain]}>{f.word}</Text>
                                                    </View>
                                                    <View style={[styles.formPosBadge, { backgroundColor: posColor + '22', borderColor: posColor + '55' }]}>
                                                        <Text style={[styles.formPosText, { color: posColor }]}>{f.pos}</Text>
                                                    </View>
                                                    <Ionicons name="volume-high-outline" size={14} color={colors.muted} style={styles.formSpeakerIcon} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            <View style={styles.divider} />

                            {/* ── Synonyms ── */}
                            <View style={styles.sectionRow}>
                                <View style={styles.sectionLabelRow}>
                                    <Ionicons name="swap-horizontal-outline" size={14} color={colors.muted} />
                                    <Text style={styles.sectionLabel}>Synonyms</Text>
                                </View>
                                    <View style={styles.tagWrap}>
                                        {result.synonyms.map(s => (
                                            <TouchableOpacity key={s} onPress={() => jumpToTerm(s)} style={styles.tag} activeOpacity={0.6}>
                                                <Text style={styles.tagTxt}>{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    {result.synonyms.length === 0 && <Text style={styles.emptyText}>None found</Text>}
                                </View>
                            </View>

                            {/* ── Antonyms ── */}
                            <View style={styles.sectionRow}>
                                <View style={styles.sectionLabelRow}>
                                    <Ionicons name="close-circle-outline" size={14} color={colors.muted} />
                                    <Text style={styles.sectionLabel}>Antonyms</Text>
                                </View>
                                    <View style={styles.tagWrap}>
                                        {result.antonyms.map(a => (
                                            <TouchableOpacity key={a} onPress={() => jumpToTerm(a)} style={styles.antonymTag} activeOpacity={0.6}>
                                                <Text style={styles.antonymTagText}>{a}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    {result.antonyms.length === 0 && <Text style={styles.emptyText}>None found</Text>}
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* ── Example Sentences ── */}
                            <View style={styles.sectionRow}>
                                <View style={styles.sectionLabelRow}>
                                    <Ionicons name="chatbox-ellipses-outline" size={14} color={colors.muted} />
                                    <Text style={styles.sectionLabel}>Example Sentences</Text>
                                </View>
                                {result.examples.map((ex, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.exampleBox}
                                        onPress={() => playAudio(ex.en)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.exampleNumBadge}>
                                            <Text style={styles.exampleNum}>{idx + 1}</Text>
                                        </View>
                                        <View style={styles.exampleCopy}>
                                            <HighlightedSentence
                                                sentence={ex.en}
                                                keyword={result.word}
                                                style={styles.exampleEn}
                                            />
                                            <Text style={styles.exampleTr}>{ex.tr}</Text>
                                        </View>
                                        <Ionicons name="volume-high" size={14} color={colors.muted} style={styles.exampleSpeakerIcon} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>
                    )}

                    {!result && !isSearching && !errorMsg && (
                        <View style={styles.emptyState}>
                            <Ionicons name="book-outline" size={64} color={colors.secondary} />
                            <Text style={styles.emptyStateTitle}>Academic Dictionary</Text>
                            <Text style={styles.emptyStateDesc}>Type a word to see its definition, word family, synonyms, and bilingual example sentences.</Text>
                            <View style={styles.suggestionsWrap}>
                                {Object.keys(DICTIONARY_API_MOCK).map(k => (
                                    <TouchableOpacity key={k} onPress={() => { setQuery(k); }} style={styles.suggestionChip}>
                                        <Text style={styles.suggestionTxt}>{k}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboard: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    heroCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: '#172554',
        borderColor: '#172554',
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    heroCopy: {
        flex: 1,
    },
    heroEyebrow: {
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        fontFamily: typography.fontHeadline,
        textTransform: 'uppercase',
        letterSpacing: 1,
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
        minWidth: 84,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    heroMetricValue: {
        fontSize: typography.body,
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
        marginBottom: spacing.sm,
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
    workspaceCopy: {
        flex: 1,
    },
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
    quickChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    quickChip: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 999,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
    },
    quickChipText: {
        fontSize: typography.small,
        color: '#DBEAFE',
        fontFamily: typography.fontHeadline,
    },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    sourceText: { fontSize: 12, color: colors.muted, marginTop: 2 },

    searchWrap: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: radius.pill, height: 44, paddingRight: spacing.sm },
    searchIcon: { marginLeft: spacing.md },
    searchInput: { flex: 1, height: '100%', paddingHorizontal: spacing.sm, fontSize: 15, fontFamily: typography.fontHeadline, color: colors.text },
    searchClearButton: { padding: spacing.sm },

    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },

    loadingBox: { padding: spacing.xxl, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: spacing.md, color: colors.primaryDark, fontWeight: '700' },
    errorCard: {
        backgroundColor: 'rgba(231,76,60,0.1)',
        borderColor: colors.error,
        borderWidth: 1,
        padding: spacing.md,
        alignItems: 'center',
    },
    errorIcon: { marginBottom: 8 },
    errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },

    resultCard: { padding: spacing.xl, borderRadius: radius.lg },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    resultHeaderCopy: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
    titleMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    wordText: { fontSize: 28, fontFamily: typography.fontHeadline, fontWeight: '900', color: colors.text, textTransform: 'capitalize' },
    phoneticText: { fontSize: 13, color: colors.muted, fontFamily: 'Courier', marginBottom: 4 },
    posBadge: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    posText: { fontSize: 10, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
    transText: { fontSize: 15, color: colors.primary, fontWeight: '700' },
    speakerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' },

    definitionBox: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
    definitionTxt: { fontSize: 15, color: colors.text, lineHeight: 22, fontStyle: 'italic' },

    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: spacing.md },
    resultQuickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    moduleMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
    moduleMetaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#D7E4FA', borderRadius: radius.pill, backgroundColor: '#F8FBFF', paddingHorizontal: 10, paddingVertical: 6 },
    moduleMetaText: { fontSize: 11, color: colors.muted, fontWeight: '700' },

    sectionRow: { marginBottom: spacing.lg },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Word Family — list (Oxford / Cambridge style)
    formsList: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
    formRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
    formRowMain: { backgroundColor: colors.primarySoft },
    formRowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    formMainDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    formWord: { fontSize: 15, fontWeight: '700', color: colors.text },
    formWordMain: { color: colors.primaryDark, fontWeight: '900' },
    formPosBadge: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
    formPosText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
    formSpeakerIcon: { marginLeft: spacing.sm, opacity: 0.4 },

    // Synonyms / Antonyms
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
    tagTxt: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },
    antonymTag: { backgroundColor: 'rgba(231,76,60,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
    antonymTagText: { fontSize: 14, fontWeight: '700', color: colors.error },
    emptyText: { fontSize: 13, color: colors.muted, fontStyle: 'italic' },

    // Example Sentences
    exampleBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(59,130,246,0.04)', borderLeftWidth: 3, borderLeftColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.sm, marginBottom: spacing.md },
    exampleNumBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm, marginTop: 2, flexShrink: 0 },
    exampleNum: { fontSize: 11, fontWeight: '900', color: '#fff' },
    exampleCopy: { flex: 1 },
    exampleEn: { fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 4 },
    exampleKeyword: { fontWeight: '900', color: colors.primaryDark, textDecorationLine: 'underline' },
    exampleTr: { fontSize: 13, color: colors.muted, lineHeight: 18, fontStyle: 'italic' },
    exampleSpeakerIcon: { marginLeft: 6, opacity: 0.5 },

    // Empty State
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: spacing.xl },
    emptyStateTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.muted, marginTop: spacing.md, marginBottom: spacing.xs },
    emptyStateDesc: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
    suggestionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
    suggestionChip: { backgroundColor: colors.primarySoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
    suggestionTxt: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
});
