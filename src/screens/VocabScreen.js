import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity, ScrollView, FlatList, useWindowDimensions, InteractionManager } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { buildFallbackEntry, getDictionaryCount, getDictionarySample, getDictionarySlice, getVerbForms, getWordEntry, getWordFamily, searchDictionary, startDictionaryBuild, subscribeDictionaryBuild } from '../utils/dictionary';
import { fetchLiveEntry } from '../utils/liveDictionary';
import { speakEnglish } from '../utils/ttsEnglish';
import { useAppState } from '../context/AppState';
import { subscribeSmokeActions } from '../dev/smokeBus';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];
const DICTIONARY_VIEWS = ['All', 'Saved', 'Review', 'Unknown', 'Collocation'];
const DICTIONARY_SORTS = ['Match', 'A-Z', 'Level', 'Review'];
const TEST_ENGLISH_LEVEL_ORDER = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];
const SECTIONS = [
  { key: 'Dictionary', label: 'Dictionary' },
  { key: '24-Week Plan', label: '24-Week Plan' },
  { key: 'My Words', label: 'My Words' },
  { key: 'WASC Lists', label: 'WASC Lists' },
  { key: 'Academic', label: 'Academic' },
  { key: 'Academic Verbs', label: 'Academic Verbs' },
  { key: 'Confusing', label: 'Confusing' },
  { key: 'Listening Queue', label: 'Listening' },
  { key: 'Subtle Hover', label: 'Subtle Hover' },
  { key: 'Unknown', label: 'Unknown' },
  { key: 'Test-English', label: 'Test-English' },
  { key: 'Bogazici Dept', label: 'BUEPT Dept' },
];
const SECTION_META = {
  '24-Week Plan': {
    icon: 'calendar',
    title: '24-Week Quiz Plan',
    description: 'A 24-week daily workbook from A1 to C1 where days 1-5 are 20-question word formation sets and days 6-7 are 20-question collocation sets.',
  },
  'My Words': {
    icon: 'bookmark',
    title: 'Saved Vocabulary',
    description: 'Your personal bank for words you want to recycle in writing and speaking.',
  },
  Academic: {
    icon: 'school',
    title: 'Academic Core',
    description: 'High-value academic vocabulary with definitions, collocations, and examples.',
  },
  'Academic Verbs': {
    icon: 'leaf',
    title: 'Academic Verbs',
    description: 'Core verbs for claims, analysis, cause-effect, and academic argumentation.',
  },
  'Test-English': {
    icon: 'sparkles',
    title: 'Test-English Bank',
    description: 'Curated level-based vocabulary sets with quiz routes and topic filters.',
  },
  Confusing: {
    icon: 'swap-horizontal',
    title: 'Confusing Pairs',
    description: 'Minimal-pair style practice for easily confused forms and pronunciation traps.',
  },
  'Listening Queue': {
    icon: 'headset',
    title: 'Listening Vocabulary Queue',
    description: 'Words captured from listening quizzes and transcript-based checks are collected here for focused review.',
  },
  'Subtle Hover': {
    icon: 'logo-chrome',
    title: 'Subtle Hover Sync Queue',
    description: 'Words coming from the Subtle Hover extension are synced here in near real-time.',
  },
  Dictionary: {
    icon: 'book',
    title: 'Dictionary Workspace',
    description: 'Lookup, save, recycle, and practice words in one structured lexical workspace.',
  },
  'WASC Lists': {
    icon: 'reader',
    title: 'WASC Vocabulary Lists',
    description: 'Official WASC A2/B1/B2 glossary words with searchable lists and Quizlet-style flashcards.',
  },
  Unknown: {
    icon: 'alert-circle',
    title: 'Unknown Queue',
    description: 'Words you missed or flagged for review during practice.',
  },
  'Bogazici Dept': {
    icon: 'library',
    title: 'Department Packs',
    description: 'Boğaziçi department-specific vocabulary packs and challenge mode.',
  },
};

const VOCAB_TOOLS = [
  {
    key: 'vocab-flashcards',
    title: 'Flashcards',
    body: 'Study specialized BUEPT sets or create your own custom study decks.',
    icon: 'albums-outline',
    route: 'FlashcardHome',
    tone: 'purple',
  },
  {
    key: 'create-deck',
    title: 'New Flashcard Deck',
    body: 'Create a specific deck for your target words or department.',
    icon: 'add-circle-outline',
    route: 'CreateFlashcardDeck',
    tone: 'amber',
  },
  {
    key: 'synonym-finder',
    title: 'Synonym Finder',
    body: 'Lookup synonyms, antonyms, collocations, and example sentences from one search.',
    icon: 'git-compare-outline',
    route: 'SynonymFinder',
    tone: 'blue',
  },
  {
    key: 'interactive-dictionary',
    title: 'Interactive Dictionary',
    body: 'Inspect word family, synonyms, antonyms, and bilingual examples for one word.',
    icon: 'book-outline',
    route: 'InteractiveVocabulary',
    tone: 'teal',
  },
  {
    key: 'photo-ocr',
    title: 'Photo OCR',
    body: 'Extract advanced vocabulary from photos, then add selected words directly to My Words.',
    icon: 'scan-outline',
    route: 'PhotoVocabCapture',
    tone: 'amber',
  },
  {
    key: 'confusing-pairs',
    title: 'Confusing Pairs',
    body: 'Train tricky forms like though / through / tough with pronunciation support.',
    icon: 'volume-high-outline',
    route: 'ConfusingPronunciations',
    tone: 'purple',
  },
];

const LEVEL_COLORS = {
  A1: '#4CAF50', A2: '#8BC34A', B1: '#2196F3',
  B2: '#3F51B5', C1: '#9C27B0',
};
const DICTIONARY_CARD_BATCH = 12;
// Performance: Vocab tab'a girince sözlük hydration/hydrateEntry işleri JS'i kilitleyebiliyor.
// Başlangıç örneklemini küçük tutarak UI'nin donmasını önlüyoruz.
const DICTIONARY_DEFAULT_SAMPLE_LIMIT = 200;
const DICTIONARY_FILTERED_SAMPLE_LIMIT = 1200;
const DICTIONARY_WORD_OF_DAY_SAMPLE_LIMIT = 160;
const DICTIONARY_CHALLENGE_SAMPLE_LIMIT = 140;

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function seededIndex(seed, length) {
  if (!length) return 0;
  return Math.abs((seed * 9301 + 49297) % 233280) % length;
}

function seededShuffle(list = [], seed = 1) {
  const out = Array.isArray(list) ? [...list] : [];
  if (out.length < 2) return out;
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = seededIndex(seed + i * 17, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function normalizeAcademicVerbList(list = []) {
  const source = Array.isArray(list) ? list : [];
  const byWord = new Map();
  source.forEach((item) => {
    const rawWord = String(item?.word || '').trim();
    const key = rawWord.toLowerCase();
    if (!key) return;
    const prev = byWord.get(key);
    if (!prev) {
      byWord.set(key, {
        ...item,
        word: rawWord,
      });
      return;
    }
    byWord.set(key, {
      ...prev,
      definition: prev.definition || item.definition || '',
      example: prev.example || item.example || '',
    });
  });
  return Array.from(byWord.values());
}


function safeDictionaryCount() {
  try {
    return Number(getDictionaryCount() || 0);
  } catch (_) {
    return 0;
  }
}

function safeDictionarySample(limit = 50) {
  try {
    const list = getDictionarySample(limit);
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

function safeDictionarySlice(limit = 50) {
  try {
    const list = getDictionarySlice(limit);
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

function safeWordEntry(word) {
  try {
    return getWordEntry(word);
  } catch (_) {
    return null;
  }
}

function safeWordFamily(word, fallbackEntry = null) {
  try {
    const family = getWordFamily(word, fallbackEntry);
    if (family && typeof family === 'object') return family;
  } catch (_) { }
  return { noun: [], verb: [], adjective: [], adverb: [], negative: [], all: [] };
}

function safeVerbForms(word, fallbackEntry = null) {
  try {
    const forms = getVerbForms(word, fallbackEntry);
    if (forms && typeof forms === 'object') return forms;
  } catch (_) { }
  return null;
}

function formatTopicLabel(topic = '') {
  const raw = String(topic || '').trim();
  if (!raw) return 'Unknown';
  if (raw.toLowerCase() === 'all') return 'All';
  return raw
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeWordKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

function getLevelWeight(level = '') {
  return {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
  }[String(level || '').toUpperCase()] || 0;
}

function buildVocabChallenge(pool = [], seed = 1) {
  if (!Array.isArray(pool) || pool.length < 4) return null;
  const source = pool
    .filter((item) => item.word && item.def)
    .map((item) => ({ word: String(item.word).trim(), def: String(item.def).trim() }))
    .filter((item) => item.word && item.def);
  if (source.length < 4) return null;
  const uniqueByWord = new Map();
  source.forEach((item) => {
    if (!uniqueByWord.has(item.word.toLowerCase())) uniqueByWord.set(item.word.toLowerCase(), item);
  });
  const words = Array.from(uniqueByWord.values());
  if (words.length < 4) return null;
  const target = words[seededIndex(seed, words.length)];
  const distractorDefs = Array.from(
    new Set(
      words
        .filter((item) => item.word.toLowerCase() !== target.word.toLowerCase())
        .map((item) => item.def)
        .filter((def) => def && def !== target.def)
    )
  );
  if (distractorDefs.length < 3) return null;
  const wrong = seededShuffle(distractorDefs, seed + 11).slice(0, 3);
  const options = seededShuffle([target.def, ...wrong], seed + 97);
  const correctIndex = options.findIndex((o) => o === target.def);
  if (correctIndex < 0) return null;
  return { word: target.word, options, correctIndex };
}

function buildSentenceStarters(targetWord, entry = null) {
  const safeWord = String(targetWord || '').trim();
  if (!safeWord) return [];
  const topic = String(entry?.simple_definition || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');
  return [
    `In my essay, ${safeWord} helps explain `,
    `A practical example of ${safeWord} is `,
    `In BUEPT reading, ${safeWord} is used when `,
    topic ? `${safeWord} is strongly linked to ${topic} because ` : `I can define ${safeWord} as `,
  ];
}

function normalizeSentence(text = '') {
  const compact = String(text || '').trim().replace(/\s+/g, ' ');
  if (!compact) return '';
  const withPunc = /[.!?]$/.test(compact) ? compact : `${compact}.`;
  return withPunc.charAt(0).toUpperCase() + withPunc.slice(1);
}

function hasConnector(text = '') {
  return /\b(however|therefore|for example|for instance|moreover|in addition|as a result)\b/i.test(String(text || ''));
}

function buildVerbDrillSentence(sentence = '', targetWord = '', definition = '') {
  const base = normalizeSentence(sentence);
  const safeWord = String(targetWord || '').trim().toLowerCase();
  if (!base || !safeWord) return '';
  let out = base;
  const hasWord = new RegExp(`\\b${escapeRegExp(safeWord)}\\b`, 'i').test(out);
  if (!hasWord) {
    out = normalizeSentence(`Researchers ${safeWord} the evidence to clarify ${definition || 'the claim'}`);
  }
  if (!hasConnector(out)) {
    out = out.replace(/[.!?]$/, ', which strengthens the academic argument.');
  }
  return normalizeSentence(out);
}

function buildSentenceUpgrade(sentence = '', targetWord = '', entry = null) {
  const base = normalizeSentence(sentence);
  const safeWord = String(targetWord || '').trim().toLowerCase();
  if (!base || !safeWord) return '';
  let out = base;
  const hasWord = new RegExp(`\\b${escapeRegExp(safeWord)}\\b`, 'i').test(out);
  if (!hasWord) {
    out = normalizeSentence(`In academic writing, ${safeWord} is important because ${out.toLowerCase()}`);
  }
  if (!hasConnector(out)) {
    out = out.replace(/[.!?]$/, ', for example in a BUEPT response.');
  }
  const words = out.split(/\s+/).filter(Boolean).length;
  if (words < 13) {
    const topic = String(entry?.simple_definition || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .join(' ');
    out = out.replace(/[.!?]$/, `, which helps explain ${topic || 'the main idea'} more clearly.`);
  }
  return normalizeSentence(out);
}

/* Speak a word via TTS */
async function speakWord(word) {
  try {
    await speakEnglish(word, { rate: 0.48 });
  } catch (_) { }
}

const VocabCard = React.memo(function VocabCard({ item, expanded, onToggle, stats, cardKey }) {
  const navigation = useNavigation();
  const [selectedRelated, setSelectedRelated] = useState(null);
  const displayItem = useMemo(() => (expanded ? (safeWordEntry(item.word) || item) : item), [expanded, item]);
  const family = useMemo(() => (expanded ? safeWordFamily(displayItem.word, displayItem) : null), [expanded, displayItem]);
  const verbForms = useMemo(() => (expanded ? safeVerbForms(displayItem.word, displayItem) : null), [expanded, displayItem]);
  const selectedRelatedVerbForms = useMemo(
    () => (selectedRelated ? safeVerbForms(selectedRelated.word, selectedRelated.entry) : null),
    [selectedRelated]
  );
  const familyRows = family
    ? [
      { key: 'noun', label: 'Noun', values: Array.isArray(family.noun) ? family.noun : [] },
      { key: 'verb', label: 'Verb', values: Array.isArray(family.verb) ? family.verb : [] },
      { key: 'adjective', label: 'Adjective', values: Array.isArray(family.adjective) ? family.adjective : [] },
      { key: 'adverb', label: 'Adverb', values: Array.isArray(family.adverb) ? family.adverb : [] },
      { key: 'negative', label: 'Negative Form', values: Array.isArray(family.negative) ? family.negative : [] },
    ]
    : [];
  const hasFamily = familyRows.some((row) => row.values.length > 0);
  const openRelatedWord = (word, relationLabel, e) => {
    e?.stopPropagation?.();
    const cleanWord = String(word || '').trim();
    if (!cleanWord) return;

    let entry = safeWordEntry(cleanWord);
    const fallbackDefinition = displayItem?.simple_definition
      ? `Related to "${displayItem.word}": ${displayItem.simple_definition}`
      : `No definition found for "${cleanWord}" yet.`;
    if (!entry) {
      entry = buildFallbackEntry(cleanWord, fallbackDefinition, '');
    } else if (!Array.isArray(entry.examples) || entry.examples.length === 0) {
      const fallback = buildFallbackEntry(cleanWord, fallbackDefinition, entry.word_type || '');
      if (fallback?.examples?.length) {
        entry = { ...entry, examples: fallback.examples };
      }
    }

    setSelectedRelated({
      word: cleanWord,
      relationLabel: relationLabel || 'Related',
      entry,
      definition: entry?.simple_definition || fallbackDefinition,
    });
    speakWord(cleanWord);
  };

  useEffect(() => {
    if (!expanded) setSelectedRelated(null);
  }, [expanded]);

  const handleToggle = useCallback(() => {
    onToggle(cardKey);
  }, [cardKey, onToggle]);

  return (
    <Pressable onPress={handleToggle} style={{ width: '100%' }}>
      <Card style={[styles.card, { padding: 0 }]}>
        {/* Header row with word and audio */}
        <View style={{ paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); speakWord(displayItem.word); }}
            style={[styles.wordTapArea, { padding: 8, margin: -4, opacity: 1 }]}
          >
            <Text style={styles.word}>{displayItem.word}</Text>
            <Text style={styles.ttsIcon}>🔊</Text>
          </Pressable>
          {displayItem.level ? (
            <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[displayItem.level] || colors.secondary }]}>
              <Text style={styles.levelBadgeText}>{displayItem.level}</Text>
            </View>
          ) : null}
        </View>

        {/* Body (Clicks pass through to outer Pressable) */}
        <View style={{ paddingHorizontal: spacing.sm, paddingBottom: spacing.sm }}>
          <Text style={styles.meta}>{displayItem.word_type || '—'}</Text>
          <Text style={styles.def}>{displayItem.simple_definition || 'Definition pending'}</Text>
          {stats ? (
            <Text style={styles.stats}>Known: {stats.known || 0} • Unknown: {stats.unknown || 0}</Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={[styles.cardActions, { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm }]}>
          <Pressable
            style={({ pressed }) => [styles.cardActionBtn, { padding: 8, margin: -4, opacity: pressed ? 0.6 : 1 }]}
            onPress={(e) => { e.stopPropagation?.(); navigation.navigate('CreateFlashcardDeck', { initialWord: displayItem.word }); }}
          >
            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.cardActionText}>Add to Flashcard Deck</Text>
          </Pressable>
        </View>

        {expanded && (
          <View style={[styles.expandedSection, { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm }]}>
            {hasFamily ? (
              <>
                <Text style={styles.sectionTitle}>Word Family (Noun/Verb/Adj/Adv)</Text>
                {familyRows
                  .filter((row) => row.values.length > 0)
                  .map((row) => (
                    <View key={`${item.word}-${row.key}`} style={styles.familyRow}>
                      <Text style={styles.familyLabel}>{row.label}</Text>
                      <View style={styles.chipRow}>
                        {row.values.slice(0, 6).map((w, wi) => (
                          <Pressable
                            key={`${item.word}-${row.key}-${wi}-${w}`}
                            onPress={(e) => openRelatedWord(w, row.label, e)}
                            style={({ pressed }) => [styles.miniChip, row.key === 'negative' && styles.miniChipNegative, { padding: 8, margin: -4, opacity: pressed ? 0.6 : 1 }]}
                          >
                            <Text style={[styles.miniChipText, row.key === 'negative' && styles.miniChipTextNegative]}>{w} 🔊</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
              </>
            ) : displayItem.derivatives?.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Word Forms</Text>
                <Text style={styles.sub}>{displayItem.derivatives.slice(0, 6).join(', ')}</Text>
              </>
            ) : null}
            {displayItem.synonyms?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Synonyms</Text>
                <View style={styles.chipRow}>
                  {displayItem.synonyms.slice(0, 6).map((s, i) => (
                    <Pressable key={`${displayItem.word}-syn-${i}-${s}`} onPress={(e) => openRelatedWord(s, 'Synonym', e)} style={({ pressed }) => [styles.miniChip, { padding: 8, margin: -4, opacity: pressed ? 0.6 : 1 }]}>
                      <Text style={styles.miniChipText}>{s} 🔊</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            {displayItem.antonyms?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Antonyms</Text>
                <View style={styles.chipRow}>
                  {displayItem.antonyms.slice(0, 6).map((a, i) => (
                    <Pressable
                      key={`${displayItem.word}-ant-${i}-${a}`}
                      onPress={(e) => openRelatedWord(a, 'Antonym', e)}
                      style={({ pressed }) => [styles.miniChip, styles.miniChipOpposite, { padding: 8, margin: -4, opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text style={[styles.miniChipText, styles.miniChipTextOpposite]}>{a} 🔊</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            {displayItem.collocations?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Collocations</Text>
                <View style={styles.chipRow}>
                  {displayItem.collocations.slice(0, 6).map((c, i) => (
                    <Pressable key={`${displayItem.word}-col-${i}-${c}`} onPress={(e) => openRelatedWord(c, 'Collocation', e)} style={({ pressed }) => [styles.miniChip, { padding: 8, margin: -4, opacity: pressed ? 0.6 : 1 }]}>
                      <Text style={styles.miniChipText}>{c} 🔊</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.collocationTip}>Use these as fixed phrases in writing and speaking answers.</Text>
              </>
            )}
            {displayItem.source ? (
              <Text style={styles.sourceTag}>Source: {String(displayItem.source).toUpperCase()}</Text>
            ) : null}
            {selectedRelated ? (
              <View style={styles.relatedCard}>
                <View style={styles.relatedHeader}>
                  <View style={styles.relatedWordWrap}>
                    <Text style={styles.relatedWord}>{selectedRelated.word}</Text>
                    <Text style={styles.relatedTag}>{selectedRelated.relationLabel}</Text>
                    {selectedRelated.entry?.word_type ? (
                      <Text style={styles.relatedType}>{selectedRelated.entry.word_type}</Text>
                    ) : null}
                  </View>
                  <View style={styles.relatedActions}>
                    <Pressable
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        speakWord(selectedRelated.word);
                      }}
                      style={({ pressed }) => [styles.relatedActionBtn, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Ionicons name="volume-high-outline" size={15} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        setSelectedRelated(null);
                      }}
                      style={({ pressed }) => [styles.relatedActionBtn, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Ionicons name="close" size={15} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.relatedDef}>{selectedRelated.definition}</Text>
                {Array.isArray(selectedRelated.entry?.synonyms) && selectedRelated.entry.synonyms.length > 0 ? (
                  <Text style={styles.relatedSyn}>≈ {selectedRelated.entry.synonyms.slice(0, 4).join(', ')}</Text>
                ) : null}
                {Array.isArray(selectedRelated.entry?.antonyms) && selectedRelated.entry.antonyms.length > 0 ? (
                  <Text style={styles.relatedAnt}>↔ {selectedRelated.entry.antonyms.slice(0, 4).join(', ')}</Text>
                ) : null}
                {Array.isArray(selectedRelated.entry?.examples) && selectedRelated.entry.examples.length > 0 ? (
                  <Pressable
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      speakWord(selectedRelated.entry.examples[0]);
                    }}
                    style={({ pressed }) => [styles.relatedExampleRow, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text style={styles.relatedExample}>"{selectedRelated.entry.examples[0]}"</Text>
                    <Ionicons name="volume-medium-outline" size={14} color={colors.primary} />
                  </Pressable>
                ) : null}
                {selectedRelatedVerbForms ? (
                  <View style={styles.relatedVerbForms}>
                    <Text style={styles.relatedVerbFormsTitle}>Verb forms</Text>
                    <Text style={styles.relatedVerbFormsLine}>
                      {`Base: ${selectedRelatedVerbForms.base} · V2: ${selectedRelatedVerbForms.v2} · V3: ${selectedRelatedVerbForms.v3} · -ing: ${selectedRelatedVerbForms.ing}`}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            {displayItem.examples?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Example Sentences</Text>
                {displayItem.examples.slice(0, 3).map((ex, idx) => (
                  <Pressable key={`${displayItem.word}-ex-${idx}`} style={({ pressed }) => [styles.exampleRow, { opacity: pressed ? 0.6 : 1 }]} onPress={(e) => { e.stopPropagation?.(); speakWord(ex); }}>
                    <Text style={styles.exampleBullet}>{idx + 1}.</Text>
                    <Text style={styles.example}>{ex}</Text>
                    <Ionicons name="volume-high-outline" size={14} color={colors.primary} />
                  </Pressable>
                ))}
              </>
            )}
            {item.common_errors?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Common Errors</Text>
                <Text style={styles.commonErrorText}>{item.common_errors.slice(0, 2).join(' | ')}</Text>
              </>
            )}
            {verbForms ? (
              <>
                <Text style={styles.sectionTitle}>Verb Forms</Text>
                <View style={styles.verbFormsStrip}>
                  <Text style={styles.verbFormsText}>Base: {verbForms.base}</Text>
                  <Text style={styles.verbFormsText}>V2: {verbForms.v2}</Text>
                  <Text style={styles.verbFormsText}>V3: {verbForms.v3}</Text>
                  <Text style={styles.verbFormsText}>-ing: {verbForms.ing}</Text>
                  <Text style={styles.verbFormsText}>3rd person: {verbForms.thirdPerson}</Text>
                </View>
              </>
            ) : null}
          </View>
        )}

        <View style={{ width: '100%', alignItems: 'center', paddingVertical: spacing.sm, backgroundColor: '#F9FAFB' }}>
          <Text style={[styles.expandHint, { marginTop: 0 }]}>{expanded ? '▲ Collapse' : '▼ Tap to expand'}</Text>
        </View>
      </Card>
    </Pressable>
  );
}, (prev, next) => (
  prev.cardKey === next.cardKey
  && prev.expanded === next.expanded
  && prev.item === next.item
  && prev.stats === next.stats
));

function HubMetric({ value, label, accent = 'blue' }) {
  return (
    <View style={styles.hubMetricCard}>
      <View
        style={[
          styles.hubMetricAccent,
          accent === 'teal'
            ? styles.hubMetricAccentTeal
            : accent === 'amber'
              ? styles.hubMetricAccentAmber
              : accent === 'purple'
                ? styles.hubMetricAccentPurple
                : styles.hubMetricAccentBlue,
        ]}
      />
      <Text style={styles.hubMetricValue}>{value}</Text>
      <Text style={styles.hubMetricLabel}>{label}</Text>
    </View>
  );
}

function ToolShortcutCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.toolShortcutCard} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
      <View
        style={[
          styles.toolShortcutIcon,
          item.tone === 'teal'
            ? styles.toolShortcutIconTeal
            : item.tone === 'amber'
              ? styles.toolShortcutIconAmber
              : item.tone === 'purple'
                ? styles.toolShortcutIconPurple
                : styles.toolShortcutIconBlue,
        ]}
      >
        <Ionicons name={item.icon} size={18} color={colors.primaryDark} />
      </View>
      <Text style={styles.toolShortcutTitle}>{item.title}</Text>
      <Text style={styles.toolShortcutBody}>{item.body}</Text>
      <View style={styles.toolShortcutFooter}>
        <Text style={styles.toolShortcutFooterText}>Open tool</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

function WorkspaceIntroCard({ title, body, metricValue, metricLabel, actions = [], children = null }) {
  return (
    <Card style={styles.workspaceIntroCard}>
      <View style={styles.workspaceIntroHeader}>
        <View style={styles.workspaceIntroCopy}>
          <Text style={styles.workspaceIntroTitle}>{title}</Text>
          <Text style={styles.workspaceIntroBody}>{body}</Text>
        </View>
        <View style={styles.workspaceIntroMetric}>
          <Text style={styles.workspaceIntroMetricValue}>{metricValue}</Text>
          <Text style={styles.workspaceIntroMetricLabel}>{metricLabel}</Text>
        </View>
      </View>
      {actions.length ? (
        <View style={styles.workspaceIntroActions}>
          {actions.map((action) => (
            <Button
              key={action.key}
              label={action.label}
              variant={action.variant}
              icon={action.icon}
              onPress={action.onPress}
              disabled={action.disabled}
            />
          ))}
        </View>
      ) : null}
      {children}
    </Card>
  );
}

export default function VocabScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const [input, setInput] = useState('');
  const queryInputRef = useRef('');
  const searchInputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [queryDebounced, setQueryDebounced] = useState('');
  const [level, setLevel] = useState('All');
  const [dictionaryView, setDictionaryView] = useState('All');
  const [dictionarySort, setDictionarySort] = useState('Match');
  const [activeSection, setActiveSection] = useState('Dictionary');
  const [plannerLaunchDay, setPlannerLaunchDay] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [dictionaryReady, setDictionaryReady] = useState(false);
  const [dictionaryLoadRequested, setDictionaryLoadRequested] = useState(false);
  const [dictionaryProgress, setDictionaryProgress] = useState(0);
  const [dictionaryStatus, setDictionaryStatus] = useState('idle');
  const [dictionaryError, setDictionaryError] = useState('');
  const smokeDoneRef = useRef(false);
  const [dictionaryRenderLimit, setDictionaryRenderLimit] = useState(DICTIONARY_CARD_BATCH);
  const [academicData, setAcademicData] = useState([]);
  const [academicVerbData, setAcademicVerbData] = useState([]);
  const [testEnglishData, setTestEnglishData] = useState([]);
  const [confusingData, setConfusingData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [wascListsData, setWascListsData] = useState([]);
  const [wascDecksData, setWascDecksData] = useState([]);
  const [wascLevel, setWascLevel] = useState('ALL');
  const [wascQuery, setWascQuery] = useState('');
  const [wascRenderLimit, setWascRenderLimit] = useState(80);
  const [heavyReady, setHeavyReady] = useState(false);
  const [challengeSeed, setChallengeSeed] = useState(1);
  const [challengeSelected, setChallengeSelected] = useState(null);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const [sentenceInput, setSentenceInput] = useState('');
  const [sentenceFeedback, setSentenceFeedback] = useState(null);
  const [liveEntry, setLiveEntry] = useState(null);
  const [liveStatus, setLiveStatus] = useState('idle');
  const [liveError, setLiveError] = useState('');
  const [dept, setDept] = useState('');
  const [deptQuery, setDeptQuery] = useState('');
  const [deptChallengeSeed, setDeptChallengeSeed] = useState(1);
  const [deptChallengeSelected, setDeptChallengeSelected] = useState(null);
  const [deptChallengeChecked, setDeptChallengeChecked] = useState(false);
  const [academicRenderLimit, setAcademicRenderLimit] = useState(12);
  const [deptRenderLimit, setDeptRenderLimit] = useState(12);
  const [verbRenderLimit, setVerbRenderLimit] = useState(12);
  const [testEnglishLevel, setTestEnglishLevel] = useState('ALL');
  const [testEnglishTopic, setTestEnglishTopic] = useState('all');
  const [testEnglishQuery, setTestEnglishQuery] = useState('');
  const [testEnglishRenderLimit, setTestEnglishRenderLimit] = useState(12);
  const [testEnglishChallengeSeed, setTestEnglishChallengeSeed] = useState(1);
  const [testEnglishChallengeSelected, setTestEnglishChallengeSelected] = useState(null);
  const [testEnglishChallengeChecked, setTestEnglishChallengeChecked] = useState(false);
  const [confusingQuery, setConfusingQuery] = useState('');
  const [listInput, setListInput] = useState('');
  const [listFeedback, setListFeedback] = useState('');
  const [verbSeed, setVerbSeed] = useState(1);
  const [verbSentence, setVerbSentence] = useState('');
  const [verbFeedback, setVerbFeedback] = useState(null);
  const { userWords, unknownWords, addUserWord, addUserWordObject, clearUnknownWords, vocabStats } = useAppState();
  const [screenReady, setScreenReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!cancelled) setScreenReady(true);
    });
    return () => {
      cancelled = true;
      task.cancel?.();
    };
  }, []);

  useEffect(() => {
    if (screenReady) return undefined;
    const timer = setTimeout(() => setScreenReady(true), 800);
    return () => clearTimeout(timer);
  }, [screenReady]);

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (!cancelled) setHeavyReady(true);
      }, 80);
    });
    return () => {
      cancelled = true;
      task.cancel?.();
    };
  }, []);

  const loadAcademic = useCallback(() => {
    if (academicData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const data = require('../../data/academic_wordlist.json');
        setAcademicData(Array.isArray(data) ? data : []);
      } catch (_) {
        setAcademicData([]);
      }
    });
  }, [academicData.length]);

  const loadAcademicVerbs = useCallback(() => {
    if (academicVerbData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const data = require('../../data/academic_verbs.json');
        setAcademicVerbData(Array.isArray(data) ? data : []);
      } catch (_) {
        setAcademicVerbData([]);
      }
    });
  }, [academicVerbData.length]);

  const loadTestEnglish = useCallback(() => {
    if (testEnglishData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const data = require('../../data/test_english_vocab_items.json');
        setTestEnglishData(Array.isArray(data) ? data : []);
      } catch (_) {
        setTestEnglishData([]);
      }
    });
  }, [testEnglishData.length]);

  const loadConfusing = useCallback(() => {
    if (confusingData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const data = require('../../data/confusing_pronunciations.json');
        setConfusingData(Array.isArray(data) ? data : []);
      } catch (_) {
        setConfusingData([]);
      }
    });
  }, [confusingData.length]);

  const loadDepartments = useCallback(() => {
    if (deptData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const data = require('../../data/bogazici_department_vocab.json');
        setDeptData(Array.isArray(data) ? data : []);
      } catch (_) {
        setDeptData([]);
      }
    });
  }, [deptData.length]);

  const loadWascLists = useCallback(() => {
    if (wascListsData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const payload = require('../../data/wasc_vocab_lists.json');
        const lists = Array.isArray(payload?.lists) ? payload.lists : [];
        setWascListsData(lists);
      } catch (_) {
        setWascListsData([]);
      }
    });
  }, [wascListsData.length]);

  const loadWascDecks = useCallback(() => {
    if (wascDecksData.length) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        const decks = require('../../data/wasc_quizlet_decks.json');
        setWascDecksData(Array.isArray(decks) ? decks : []);
      } catch (_) {
        setWascDecksData([]);
      }
    });
  }, [wascDecksData.length]);

  useEffect(() => {
    if (activeSection === 'Academic') loadAcademic();
    if (activeSection === 'Academic Verbs') loadAcademicVerbs();
    if (activeSection === 'Test-English') loadTestEnglish();
    if (activeSection === 'Confusing') loadConfusing();
    if (activeSection === 'Bogazici Dept') loadDepartments();
    if (activeSection === 'WASC Lists') {
      loadWascLists();
      loadWascDecks();
    }
  }, [activeSection, loadAcademic, loadAcademicVerbs, loadConfusing, loadDepartments, loadTestEnglish, loadWascDecks, loadWascLists]);

  useEffect(() => {
    if (!dept && deptData.length) {
      setDept(deptData[0]?.id || '');
    }
  }, [dept, deptData]);

  useEffect(() => {
    const initialSection = String(route?.params?.initialSection || '');
    if (SECTIONS.some((section) => section.key === initialSection)) {
      setActiveSection(initialSection);
    }
  }, [route?.params?.initialSection]);

  useEffect(() => {
    if (activeSection !== 'Dictionary') {
      setDictionaryReady(false);
      setDictionaryRenderLimit(DICTIONARY_CARD_BATCH);
    }
  }, [activeSection]);

  const openPlannerDay = useCallback((day) => {
    setPlannerLaunchDay(day);
    setActiveSection('24-Week Plan');
  }, []);

  useEffect(() => {
    if (!dictionaryLoadRequested) return undefined;
    const unsubscribe = subscribeDictionaryBuild((status) => {
      const progress = Math.round((status?.progress || 0) * 100);
      setDictionaryProgress(progress);
      setDictionaryStatus(status?.status || 'idle');
      setDictionaryError(status?.error ? String(status.error) : '');
      if (status?.status === 'ready') {
        setDictionaryReady(true);
      }
    });
    startDictionaryBuild();
    return () => {
      unsubscribe?.();
    };
  }, [dictionaryLoadRequested]);

  useEffect(() => {
    setDictionaryRenderLimit(DICTIONARY_CARD_BATCH);
  }, [queryDebounced, level, dictionaryView, dictionarySort]);

  useEffect(() => {
    setWascRenderLimit(80);
  }, [wascLevel, wascQuery]);

  const setQueryImmediate = useCallback((value) => {
    const next = String(value || '');
    queryInputRef.current = next;
    searchInputRef.current?.setNativeProps?.({ text: next });
    setQuery(next);
    if (!next.trim()) {
      setLiveEntry(null);
      setLiveStatus('idle');
      setLiveError('');
    }
  }, []);

  const commitQuery = useCallback((value) => {
    const next = String(value || '').trim();
    setQuery(next);
    setQueryDebounced(next);
    if (!next) {
      setLiveEntry(null);
      setLiveStatus('idle');
      setLiveError('');
      return;
    }
    setLiveStatus('loading');
    setLiveError('');
    fetchLiveEntry(next)
      .then((entry) => {
        setLiveEntry(entry || null);
        setLiveStatus('ready');
      })
      .catch((err) => {
        setLiveEntry(null);
        setLiveStatus('error');
        setLiveError(err?.message || 'Live lookup failed');
      });
  }, []);

  const requestDictionaryLoad = useCallback(() => {
    if (dictionaryLoadRequested) return;
    setDictionaryReady(false);
    setDictionaryStatus('building');
    setDictionaryProgress(0);
    setDictionaryError('');
    setDictionaryLoadRequested(true);
  }, [dictionaryLoadRequested]);

  useEffect(() => {
    if (!__DEV__) return undefined;
    const unsubscribe = subscribeSmokeActions((action) => {
      if (action?.target !== 'Vocab') return;
      if (smokeDoneRef.current) return;
      if (action?.type !== 'dictionary_search') return;
      smokeDoneRef.current = true;
      const term = action?.query || 'benefit';
      requestDictionaryLoad();
      setActiveSection('Dictionary');
      setQueryImmediate(term);
      commitQuery(term);
    });
    return unsubscribe;
  }, [requestDictionaryLoad, setQueryImmediate, commitQuery]);

  useEffect(() => {
    if (!screenReady || dictionaryLoadRequested) return;
    const task = InteractionManager.runAfterInteractions(() => {
      const t = setTimeout(() => {
        requestDictionaryLoad();
      }, 220);
      return () => clearTimeout(t);
    });
    return () => task.cancel?.();
  }, [dictionaryLoadRequested, requestDictionaryLoad, screenReady]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQueryDebounced(String(query || '').trim());
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const total = useMemo(
    () => (screenReady && dictionaryLoadRequested ? safeDictionaryCount() : 0),
    [screenReady, dictionaryLoadRequested]
  );
  const normalizedAcademicVerbs = useMemo(
    () => normalizeAcademicVerbList(academicVerbData),
    [academicVerbData]
  );
  const dictionarySampleLimit = useMemo(() => {
    if (!dictionaryLoadRequested) return DICTIONARY_CARD_BATCH;
    const hasDeepFilter = String(queryDebounced || '').trim().length >= 2
      || level !== 'All'
      || dictionaryView !== 'All'
      || dictionarySort !== 'Match';
    return hasDeepFilter ? DICTIONARY_FILTERED_SAMPLE_LIMIT : DICTIONARY_DEFAULT_SAMPLE_LIMIT;
  }, [dictionaryLoadRequested, dictionarySort, dictionaryView, level, queryDebounced]);
  const challengePool = useMemo(() => {
    const dict = (dictionaryReady && dictionaryLoadRequested ? safeDictionarySlice(DICTIONARY_CHALLENGE_SAMPLE_LIMIT) : [])
      .map((v) => ({ word: v.word, def: v.simple_definition }))
      .filter((v) => v.word && v.def);
    const acad = (Array.isArray(academicData) ? academicData : [])
      .map((w) => ({ word: w.word, def: w.definition }))
      .filter((v) => v.word && v.def);
    const verbs = (Array.isArray(normalizedAcademicVerbs) ? normalizedAcademicVerbs : []).map((w) => ({ word: w.word, def: w.definition })).filter((v) => v.word && v.def);
    return [...dict, ...acad, ...verbs];
  }, [academicData, dictionaryLoadRequested, dictionaryReady, normalizedAcademicVerbs]);
  const challenge = useMemo(() => buildVocabChallenge(challengePool, challengeSeed), [challengePool, challengeSeed]);
  const wordOfDay = useMemo(() => {
    if (!dictionaryLoadRequested) return null;
    const daySeed = Number(new Date().toISOString().slice(8, 10)) || 1;
    const list = safeDictionarySlice(DICTIONARY_WORD_OF_DAY_SAMPLE_LIMIT).filter((v) => v.word && v.simple_definition);
    if (!list.length) return null;
    return list[seededIndex(daySeed * 17, list.length)];
  }, [dictionaryLoadRequested]);
  const savedWordSet = useMemo(
    () => new Set((userWords || []).map((item) => normalizeWordKey(item?.word || item))),
    [userWords]
  );
  const unknownWordSet = useMemo(
    () => new Set((unknownWords || []).map((item) => normalizeWordKey(item?.word || item))),
    [unknownWords]
  );
  const listeningUnknownWords = useMemo(() => {
    const list = Array.isArray(unknownWords) ? unknownWords : [];
    return list.filter((item) => {
      const sourceHints = [
        item?.sourceModule,
        ...(Array.isArray(item?.sourceModules) ? item.sourceModules : []),
        item?.source,
        ...(Array.isArray(item?.sources) ? item.sources : []),
      ]
        .map((value) => String(value || '').toLowerCase())
        .filter(Boolean);
      return sourceHints.some((hint) => hint.includes('listening'));
    });
  }, [unknownWords]);
  const subtleHoverWords = useMemo(() => {
    const list = Array.isArray(unknownWords) ? unknownWords : [];
    return list.filter((item) => {
      const sourceHints = [
        item?.sourceModule,
        ...(Array.isArray(item?.sourceModules) ? item.sourceModules : []),
        item?.source,
        ...(Array.isArray(item?.sources) ? item.sources : []),
      ]
        .map((value) => String(value || '').toLowerCase())
        .filter(Boolean);
      return sourceHints.some((hint) => hint.includes('subtle') || hint.includes('hover') || hint.includes('subtitle'));
    });
  }, [unknownWords]);
  const dictionaryQuery = String(queryDebounced || '').trim().toLowerCase();
  const dictionaryBase = useMemo(() => {
    if (!dictionaryLoadRequested || activeSection !== 'Dictionary') return [];
    if (dictionaryQuery) {
      return searchDictionary({ query: dictionaryQuery, level, limit: 1200, hydrate: false });
    }
    const list = safeDictionarySlice(dictionarySampleLimit);
    return list.filter((v) => {
      const matchLevel = level !== 'All' ? v.level === level : true;
      return matchLevel;
    });
  }, [activeSection, dictionaryLoadRequested, dictionaryQuery, dictionarySampleLimit, level]);
  const deptList = useMemo(
    () => (Array.isArray(deptData) ? deptData : []).map((d) => ({ id: d.id, department: d.department })),
    [deptData]
  );
  const selectedDeptConfig = useMemo(
    () => (Array.isArray(deptData) ? deptData : []).find((d) => d.id === dept)
      || (Array.isArray(deptData) ? deptData[0] : null)
      || { department: 'Bogazici Department', words: [] },
    [dept, deptData]
  );
  const selectedDeptRawWords = useMemo(
    () => (Array.isArray(selectedDeptConfig?.words) ? selectedDeptConfig.words : []),
    [selectedDeptConfig]
  );
  const deptWords = useMemo(() => {
    if (activeSection !== 'Bogazici Dept') return [];
    const q = String(deptQuery || '').trim().toLowerCase();
    return selectedDeptRawWords
      .filter((item) => !q || String(item.word || '').toLowerCase().includes(q) || String(item.definition || '').toLowerCase().includes(q))
      .map((item) => {
        const entry = safeWordEntry(item.word) || {};
        const safeSynonyms = Array.isArray(entry.synonyms) ? entry.synonyms : [];
        const safeAntonyms = Array.isArray(entry.antonyms) ? entry.antonyms : [];
        const safeCollocations = Array.isArray(entry.collocations) ? entry.collocations : [];
        const safeExamples = Array.isArray(entry.examples) ? entry.examples : [];
        return {
          ...entry,
          word: item.word,
          word_type: entry.word_type || 'departmental term',
          simple_definition: item.definition || entry.simple_definition || 'Definition pending',
          synonyms: safeSynonyms,
          antonyms: safeAntonyms,
          collocations: safeCollocations,
          examples: item.example ? [item.example, ...safeExamples] : safeExamples,
        };
      });
  }, [activeSection, deptQuery, selectedDeptRawWords]);
  const wascLevels = useMemo(() => {
    const levels = Array.from(
      new Set(
        (Array.isArray(wascListsData) ? wascListsData : [])
          .map((group) => String(group?.level || '').toUpperCase().trim())
          .filter(Boolean)
      )
    );
    return ['ALL', ...levels.sort((a, b) => a.localeCompare(b))];
  }, [wascListsData]);
  useEffect(() => {
    if (wascLevels.includes(wascLevel)) return;
    setWascLevel(wascLevels[0] || 'ALL');
  }, [wascLevel, wascLevels]);
  const wascSelectedGlossary = useMemo(() => {
    const source = Array.isArray(wascListsData) ? wascListsData : [];
    if (wascLevel === 'ALL') return null;
    return source.find((group) => String(group?.level || '').toUpperCase() === wascLevel) || null;
  }, [wascLevel, wascListsData]);
  const wascSourceUrl = wascSelectedGlossary?.source_url || (wascListsData[0]?.source_url || '');
  const wascQuizletProfileUrl = wascSelectedGlossary?.quizlet_source_url || (wascListsData[0]?.quizlet_source_url || 'https://quizlet.com/user/WASC_Bogazici/sets');
  const wascWords = useMemo(() => {
    if (activeSection !== 'WASC Lists') return [];
    const source = Array.isArray(wascListsData) ? wascListsData : [];
    const allEntries = source.flatMap((group) => {
      const levelLabel = String(group?.level || '').toUpperCase();
      const list = Array.isArray(group?.entries) ? group.entries : [];
      return list.map((item) => ({ ...item, level: item?.level || levelLabel }));
    });
    const queryText = String(wascQuery || '').trim().toLowerCase();
    return allEntries
      .filter((item) => {
        const levelOk = wascLevel === 'ALL' || String(item?.level || '').toUpperCase() === wascLevel;
        if (!levelOk) return false;
        if (!queryText) return true;
        const hay = `${item?.word || ''} ${item?.definition || ''} ${(item?.examples || []).join(' ')}`.toLowerCase();
        return hay.includes(queryText);
      })
      .map((item) => {
        const entry = safeWordEntry(item.word) || {};
        return {
          ...entry,
          word: item.word,
          level: String(item.level || entry.level || wascLevel || 'B1').toUpperCase(),
          word_type: entry.word_type || item.word_type || 'general',
          simple_definition: item.definition || entry.simple_definition || 'Definition pending',
          examples: Array.isArray(item.examples) && item.examples.length
            ? item.examples
            : (Array.isArray(entry.examples) ? entry.examples : []),
          synonyms: Array.isArray(entry.synonyms) ? entry.synonyms : [],
          antonyms: Array.isArray(entry.antonyms) ? entry.antonyms : [],
          collocations: Array.isArray(entry.collocations) ? entry.collocations : [],
          derivatives: Array.isArray(entry.derivatives) ? entry.derivatives : [],
          source: 'wasc-glossary',
        };
      });
  }, [activeSection, wascListsData, wascLevel, wascQuery]);
  const wascTotalWords = useMemo(
    () => (Array.isArray(wascListsData) ? wascListsData.reduce((sum, item) => sum + Number(item?.count || (item?.entries?.length || 0)), 0) : 0),
    [wascListsData]
  );
  const testEnglishTopics = useMemo(() => {
    if (!screenReady) return ['all'];
    const topics = Array.from(
      new Set(
        (Array.isArray(testEnglishData) ? testEnglishData : [])
          .map((item) => String(item?.topic || '').toLowerCase().trim())
          .filter(Boolean)
      )
    );
    return ['all', ...topics.sort((a, b) => a.localeCompare(b))];
  }, [screenReady, testEnglishData]);
  const testEnglishLevels = useMemo(() => {
    if (!screenReady) return ['ALL'];
    const present = new Set(
      (Array.isArray(testEnglishData) ? testEnglishData : [])
        .map((item) => String(item?.level || '').toUpperCase().trim())
        .filter(Boolean)
    );
    return TEST_ENGLISH_LEVEL_ORDER.filter((lv) => lv === 'ALL' || present.has(lv));
  }, [screenReady, testEnglishData]);
  const testEnglishWords = useMemo(() => {
    if (!screenReady || activeSection !== 'Test-English') return [];
    const base = Array.isArray(testEnglishData) ? testEnglishData : [];
    const queryText = String(testEnglishQuery || '').trim().toLowerCase();
    return base
      .filter((item) => {
        const levelOk = testEnglishLevel === 'ALL' || String(item?.level || '').toUpperCase() === testEnglishLevel;
        const topicOk = testEnglishTopic === 'all' || String(item?.topic || '').toLowerCase() === testEnglishTopic;
        const text = `${item?.word || ''} ${item?.simple_definition || ''}`.toLowerCase();
        const queryOk = !queryText || text.includes(queryText);
        return levelOk && topicOk && queryOk;
      })
      .map((item) => {
        const entry = safeWordEntry(item.word) || {};
        return {
          ...entry,
          word: item.word,
          word_type: item.word_type || entry.word_type || 'general academic',
          level: String(item.level || entry.level || 'B1').toUpperCase(),
          simple_definition: item.simple_definition || entry.simple_definition || 'Definition pending',
          synonyms: Array.isArray(item.synonyms) && item.synonyms.length ? item.synonyms : (entry.synonyms || []),
          antonyms: Array.isArray(item.antonyms) && item.antonyms.length ? item.antonyms : (entry.antonyms || []),
          collocations: Array.isArray(item.collocations) && item.collocations.length ? item.collocations : (entry.collocations || []),
          derivatives: Array.isArray(item.derivatives) ? item.derivatives : (entry.derivatives || []),
          examples: Array.isArray(item.examples) && item.examples.length ? item.examples : (entry.examples || []),
          topic: item.topic || 'general',
        };
      });
  }, [activeSection, screenReady, testEnglishData, testEnglishLevel, testEnglishTopic, testEnglishQuery]);
  const confusingList = useMemo(() => {
    if (!screenReady || activeSection !== 'Confusing') return [];
    const base = Array.isArray(confusingData) ? confusingData : [];
    const q = String(confusingQuery || '').trim().toLowerCase();
    if (!q) return base;
    return base.filter((item) => {
      const left = String(item?.pair?.[0] || '').toLowerCase();
      const right = String(item?.pair?.[1] || '').toLowerCase();
      const defA = String(item?.definitions?.[0] || '').toLowerCase();
      const defB = String(item?.definitions?.[1] || '').toLowerCase();
      return left.includes(q) || right.includes(q) || defA.includes(q) || defB.includes(q);
    });
  }, [activeSection, confusingData, confusingQuery, screenReady]);
  const academicList = useMemo(
    () => (Array.isArray(academicData) ? academicData : []).slice(0, academicRenderLimit),
    [academicData, academicRenderLimit]
  );
  const verbList = useMemo(() => normalizedAcademicVerbs.slice(0, verbRenderLimit), [normalizedAcademicVerbs, verbRenderLimit]);
  const deptVisibleWords = useMemo(() => deptWords.slice(0, deptRenderLimit), [deptWords, deptRenderLimit]);
  const testEnglishVisibleWords = useMemo(
    () => testEnglishWords.slice(0, testEnglishRenderLimit),
    [testEnglishWords, testEnglishRenderLimit]
  );
  const wascVisibleWords = useMemo(
    () => wascWords.slice(0, wascRenderLimit),
    [wascWords, wascRenderLimit]
  );
  const selectedDeptLabel = useMemo(
    () => (selectedDeptConfig?.department || 'Bogazici Department'),
    [selectedDeptConfig]
  );
  const deptChallenge = useMemo(
    () => buildVocabChallenge(deptWords.map((w) => ({ word: w.word, def: w.simple_definition })), deptChallengeSeed),
    [deptWords, deptChallengeSeed]
  );
  const testEnglishChallenge = useMemo(
    () => buildVocabChallenge(testEnglishWords.map((w) => ({ word: w.word, def: w.simple_definition })), testEnglishChallengeSeed),
    [testEnglishWords, testEnglishChallengeSeed]
  );
  const progress = useMemo(() => {
    const all = Object.values(vocabStats || {});
    let known = 0;
    let unknown = 0;
    all.forEach((x) => {
      known += Number(x?.known || 0);
      unknown += Number(x?.unknown || 0);
    });
    const totalChecks = known + unknown;
    const knownPct = totalChecks ? Math.round((known / totalChecks) * 100) : 0;
    return { known, unknown, totalChecks, knownPct };
  }, [vocabStats]);
  const smartReview = useMemo(() => {
    const keys = Object.keys(vocabStats || {});
    const weighted = keys
      .map((w) => {
        const st = vocabStats[w] || {};
        const k = Number(st.known || 0);
        const u = Number(st.unknown || 0);
        return { w, score: u * 3 - k };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => safeWordEntry(x.w))
      .filter(Boolean);
    return weighted;
  }, [vocabStats]);
  const reviewWordSet = useMemo(
    () => new Set((smartReview || []).map((item) => normalizeWordKey(item?.word || item))),
    [smartReview]
  );
  const dictionaryResults = useMemo(() => {
    if (activeSection !== 'Dictionary' || !dictionaryLoadRequested) return [];
    const filtered = dictionaryBase.filter((item) => {
      const key = normalizeWordKey(item?.word);
      if (dictionaryView === 'Saved') return savedWordSet.has(key);
      if (dictionaryView === 'Review') return reviewWordSet.has(key);
      if (dictionaryView === 'Unknown') return unknownWordSet.has(key);
      if (dictionaryView === 'Collocation') return Array.isArray(item?.collocations) && item.collocations.length > 0;
      return true;
    });
    const shouldSkipSort = dictionarySort === 'Match' && !query && dictionaryView === 'All';
    if (shouldSkipSort) return filtered;
    const scored = [...filtered].sort((a, b) => {
      if (dictionarySort === 'A-Z') return String(a.word || '').localeCompare(String(b.word || ''));
      if (dictionarySort === 'Level') return getLevelWeight(b.level) - getLevelWeight(a.level) || String(a.word || '').localeCompare(String(b.word || ''));
      if (dictionarySort === 'Review') {
        const scoreA = (Number(vocabStats[normalizeWordKey(a.word)]?.unknown || 0) * 3) - Number(vocabStats[normalizeWordKey(a.word)]?.known || 0);
        const scoreB = (Number(vocabStats[normalizeWordKey(b.word)]?.unknown || 0) * 3) - Number(vocabStats[normalizeWordKey(b.word)]?.known || 0);
        return scoreB - scoreA || String(a.word || '').localeCompare(String(b.word || ''));
      }
      if (!query) return String(a.word || '').localeCompare(String(b.word || ''));
      const exactA = normalizeWordKey(a.word) === normalizeWordKey(query) ? 1 : 0;
      const exactB = normalizeWordKey(b.word) === normalizeWordKey(query) ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;
      const startsA = normalizeWordKey(a.word).startsWith(normalizeWordKey(query)) ? 1 : 0;
      const startsB = normalizeWordKey(b.word).startsWith(normalizeWordKey(query)) ? 1 : 0;
      if (startsA !== startsB) return startsB - startsA;
      return String(a.word || '').localeCompare(String(b.word || ''));
    });
    return scored;
  }, [activeSection, dictionaryLoadRequested, dictionaryBase, dictionarySort, dictionaryView, query, reviewWordSet, savedWordSet, unknownWordSet, vocabStats]);
  const vocab = useMemo(
    () => dictionaryResults.slice(0, dictionaryRenderLimit),
    [dictionaryRenderLimit, dictionaryResults]
  );
  const dictionaryHasMore = dictionaryResults.length > dictionaryRenderLimit;
  const dictionaryFocusEntry = useMemo(() => {
    if (!dictionaryLoadRequested) return null;
    const exact = query ? dictionaryBase.find((item) => normalizeWordKey(item.word) === normalizeWordKey(query)) : null;
    return exact || dictionaryResults[0] || wordOfDay || null;
  }, [dictionaryLoadRequested, dictionaryBase, dictionaryResults, query, wordOfDay]);
  const focusEntry = liveEntry || dictionaryFocusEntry;
  const dictionaryFocusFamily = useMemo(
    () => (focusEntry && dictionaryLoadRequested ? safeWordFamily(focusEntry.word, focusEntry) : null),
    [focusEntry, dictionaryLoadRequested]
  );
  const dictionaryFocusFamilyRows = useMemo(() => {
    if (!dictionaryFocusFamily) return [];
    return [
      { key: 'noun', label: 'Noun', values: Array.isArray(dictionaryFocusFamily.noun) ? dictionaryFocusFamily.noun : [] },
      { key: 'verb', label: 'Verb', values: Array.isArray(dictionaryFocusFamily.verb) ? dictionaryFocusFamily.verb : [] },
      { key: 'adjective', label: 'Adjective', values: Array.isArray(dictionaryFocusFamily.adjective) ? dictionaryFocusFamily.adjective : [] },
      { key: 'adverb', label: 'Adverb', values: Array.isArray(dictionaryFocusFamily.adverb) ? dictionaryFocusFamily.adverb : [] },
      { key: 'negative', label: 'Negative', values: Array.isArray(dictionaryFocusFamily.negative) ? dictionaryFocusFamily.negative : [] },
    ].filter((row) => row.values.length > 0);
  }, [dictionaryFocusFamily]);
  const dictionaryFocusCollocations = useMemo(
    () => (Array.isArray(focusEntry?.collocations) ? focusEntry.collocations.slice(0, 8) : []),
    [focusEntry]
  );
  const dictionaryFocusSynonyms = useMemo(
    () => (Array.isArray(focusEntry?.synonyms) ? focusEntry.synonyms.slice(0, 8) : []),
    [focusEntry]
  );
  const dictionaryFocusAntonyms = useMemo(
    () => (Array.isArray(focusEntry?.antonyms) ? focusEntry.antonyms.slice(0, 8) : []),
    [focusEntry]
  );
  const dictionaryFocusExamples = useMemo(
    () => (Array.isArray(focusEntry?.examples) ? focusEntry.examples.slice(0, 4) : []),
    [focusEntry]
  );
  const dictionaryFocusVerbForms = useMemo(
    () => (focusEntry ? safeVerbForms(focusEntry.word, focusEntry) : null),
    [focusEntry]
  );
  const targetWord = focusEntry?.word || challenge?.word || wordOfDay?.word || '';
  const targetEntry = useMemo(() => {
    if (!targetWord) return null;
    return safeWordEntry(targetWord) || focusEntry || wordOfDay || null;
  }, [targetWord, focusEntry, wordOfDay]);
  const targetModelExamples = useMemo(() => {
    const examples = Array.isArray(targetEntry?.examples) ? targetEntry.examples : [];
    return examples.slice(0, 4);
  }, [targetEntry]);
  const activeSectionMeta = useMemo(() => SECTION_META[activeSection] || {}, [activeSection]);
  const deptWordCount = activeSection === 'Bogazici Dept' ? deptWords.length : selectedDeptRawWords.length;
  const testEnglishCount = activeSection === 'Test-English'
    ? testEnglishWords.length
    : (Array.isArray(testEnglishData) ? testEnglishData.length : 0);
  const confusingCount = activeSection === 'Confusing'
    ? confusingList.length
    : (Array.isArray(confusingData) ? confusingData.length : 0);
  const sectionCounts = useMemo(() => ({
    '24-Week Plan': 24,
    'My Words': userWords.length,
    'WASC Lists': activeSection === 'WASC Lists' ? wascWords.length : wascTotalWords,
    Academic: academicData.length,
    'Academic Verbs': normalizedAcademicVerbs.length,
    'Test-English': testEnglishCount,
    Confusing: confusingCount,
    'Listening Queue': listeningUnknownWords.length,
    'Subtle Hover': subtleHoverWords.length,
    Dictionary: total,
    Unknown: unknownWords.length,
    'Bogazici Dept': deptWordCount,
  }), [
    academicData.length,
    confusingCount,
    deptWordCount,
    normalizedAcademicVerbs.length,
    activeSection,
    wascTotalWords,
    wascWords.length,
    testEnglishCount,
    total,
    listeningUnknownWords.length,
    subtleHoverWords.length,
    unknownWords.length,
    userWords.length,
  ]);
  const activeWorkspaceCount = sectionCounts[activeSection] || 0;
  const workspaceQuickActions = useMemo(() => {
    const actions = [
      {
        key: 'goto-weekly',
        label: '24-week plan',
        variant: activeSection === '24-Week Plan' ? 'secondary' : 'ghost',
        icon: 'calendar-outline',
        onPress: () => setActiveSection('24-Week Plan'),
      },
      {
        key: 'tool-synonym',
        label: 'Synonym Finder',
        variant: 'secondary',
        icon: 'git-compare-outline',
        onPress: () => navigation.navigate('SynonymFinder'),
      },
    ];
    if (activeSection !== 'Dictionary') {
      actions.unshift({
        key: 'goto-dictionary',
        label: 'Open Dictionary',
        variant: 'ghost',
        icon: 'book-outline',
        onPress: () => setActiveSection('Dictionary'),
      });
    }
    if (activeSection !== 'My Words') {
      actions.push({
        key: 'goto-mywords',
        label: 'My Words',
        variant: 'ghost',
        icon: 'bookmark-outline',
        onPress: () => setActiveSection('My Words'),
      });
    }
    return actions.slice(0, 3);
  }, [activeSection, navigation]);
  const verbDrill = useMemo(() => {
    if (!normalizedAcademicVerbs.length) return null;
    return normalizedAcademicVerbs[seededIndex(verbSeed * 13, normalizedAcademicVerbs.length)];
  }, [normalizedAcademicVerbs, verbSeed]);

  const getSectionData = useCallback(() => {
    switch (activeSection) {
      case 'Dictionary': return vocab;
      case 'My Words': return userWords;
      case 'WASC Lists': return wascVisibleWords;
      case 'Academic': return academicList;
      case 'Academic Verbs': return normalizedAcademicVerbs;
      case 'Test-English': return testEnglishWords;
      case 'Confusing': return confusingList;
      case 'Listening Queue': return listeningUnknownWords;
      case 'Subtle Hover': return subtleHoverWords;
      case 'Unknown': return unknownWords;
      case 'Bogazici Dept': return deptVisibleWords;
      default: return [];
    }
  }, [activeSection, vocab, userWords, wascVisibleWords, academicList, normalizedAcademicVerbs, testEnglishWords, confusingList, listeningUnknownWords, subtleHoverWords, unknownWords, deptVisibleWords]);

  const renderVocabItem = useCallback(({ item, index }) => {
    const keyPrefix = activeSection.toLowerCase().replace(' ', '-') + '-';
    const baseWord = String(item?.word || `item-${index}`).trim() || `item-${index}`;
    const cardKey = `${keyPrefix}${baseWord.toLowerCase()}-${index}`;
    return (
      <View style={[styles.listItemWrap, isWide && styles.listItemWrapWide]}>
        <VocabCard
          item={item}
          expanded={!!expanded[cardKey]}
          onToggle={toggle}
          cardKey={cardKey}
          stats={vocabStats[baseWord] || vocabStats[baseWord.toLowerCase()]}
        />
      </View>
    );
  }, [activeSection, expanded, isWide, toggle, vocabStats]);

  const onAdd = () => {
    addUserWord(input.trim());
    setInput('');
  };

  const submitChallenge = () => {
    if (challengeSelected == null) return;
    setChallengeChecked(true);
  };

  const nextChallenge = () => {
    setChallengeSeed((s) => s + 1);
    setChallengeSelected(null);
    setChallengeChecked(false);
  };

  const checkSentence = () => {
    const sentence = String(sentenceInput || '').trim();
    if (!sentence || !targetWord) {
      setSentenceFeedback({ tone: 'warn', text: 'Write a sentence first.' });
      return;
    }
    const escaped = escapeRegExp(targetWord.toLowerCase());
    const hasWord = new RegExp(`\\b${escaped}\\b`).test(sentence.toLowerCase());
    const wc = sentence.split(/\s+/).filter(Boolean).length;
    const startsUpper = /^[A-Z]/.test(sentence);
    const endsPunc = /[.!?]$/.test(sentence);
    const notes = [];
    let score = 0;
    if (!hasWord) {
      setSentenceFeedback({ tone: 'warn', text: `Use the target word "${targetWord}" in your sentence.` });
      return;
    }
    if (wc < 8) {
      setSentenceFeedback({ tone: 'warn', text: 'Sentence is too short. Try 8+ words.' });
      return;
    }
    score += 2;
    notes.push('Target word usage is correct.');
    if (startsUpper) {
      score += 1;
    } else {
      notes.push('Start with a capital letter.');
    }
    if (endsPunc) {
      score += 1;
    } else {
      notes.push('End with punctuation (., !, ?).');
    }
    if (wc >= 12) {
      score += 1;
      notes.push('Great length for an exam-style sentence.');
    }
    if (hasConnector(sentence)) {
      score += 1;
      notes.push('Good connector usage.');
    } else {
      notes.push('Add one connector (for example, however, therefore).');
    }
    const tone = score >= 4 ? 'good' : 'warn';
    const headline = tone === 'good' ? `Strong sentence (score: ${score}/6).` : `Usable sentence (score: ${score}/6).`;
    const improved = buildSentenceUpgrade(sentence, targetWord, targetEntry);
    setSentenceFeedback({
      tone,
      text: `${headline} ${notes.join(' ')}`.trim(),
      improved,
    });
  };
  const checkVerbSentence = () => {
    const sentence = String(verbSentence || '').trim();
    if (!verbDrill?.word) return;
    if (!sentence) {
      setVerbFeedback({ tone: 'warn', text: 'Write one sentence first.' });
      return;
    }
    const escaped = escapeRegExp(verbDrill.word.toLowerCase());
    const hasWord = new RegExp(`\\b${escaped}\\b`).test(sentence.toLowerCase());
    const wc = sentence.split(/\s+/).filter(Boolean).length;
    if (!hasWord) {
      setVerbFeedback({ tone: 'warn', text: `Use the verb "${verbDrill.word}" in your sentence.` });
      return;
    }
    if (wc < 10) {
      setVerbFeedback({ tone: 'warn', text: 'Sentence is too short. Aim for 10+ words.' });
      return;
    }
    const improved = buildVerbDrillSentence(sentence, verbDrill.word, verbDrill.definition);
    setVerbFeedback({
      tone: 'good',
      text: 'Good. Now upgrade it with academic precision.',
      improved,
    });
  };

  const renderFlashcardHub = useCallback(() => (
    <Card style={styles.flashcardHubCard}>
      <View style={styles.flashcardHubHeader}>
        <View style={styles.flashcardHubCopy}>
          <Text style={styles.flashcardHubTitle}>Flashcard Ecosystem ⚡️</Text>
          <Text style={styles.flashcardHubBody}>Study specialized BUEPT sets or create your own custom decks with AI enrichment.</Text>
        </View>
        <Ionicons name="albums-outline" size={40} color={colors.secondary} style={{ opacity: 0.8 }} />
      </View>
      <View style={styles.flashcardHubActions}>
        <Button
          label="Open Library"
          variant="primary"
          icon="library-outline"
          onPress={() => navigation.navigate('FlashcardHome')}
          style={{ flex: 1 }}
        />
        <Button
          label="Create New Deck"
          variant="secondary"
          icon="add-circle-outline"
          onPress={() => navigation.navigate('CreateFlashcardDeck')}
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  ), [navigation]);

  const toggle = useCallback((w) => {
    setExpanded((prev) => ({ ...prev, [w]: !prev[w] }));
  }, []);
  const addList = () => {
    const raw = String(listInput || '');
    const words = raw
      .split(/[\n,;|]+/g)
      .map((w) => w.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(words.map((w) => w.toLowerCase()))).map((w) => words.find((x) => x.toLowerCase() === w));
    unique.forEach((w) => addUserWord(w));
    setListFeedback(unique.length ? `Added ${unique.length} words.` : 'No valid words found.');
    if (unique.length) setListInput('');
  };

  const importCsv = () => {
    const raw = String(listInput || '').trim();
    if (!raw) return;
    try {
      const splitCsv = (str) => {
        const res = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < str.length; i++) {
          const c = str[i];
          if (c === '"' && str[i + 1] === '"') { cur += '"'; i++; }
          else if (c === '"') { inQ = !inQ; }
          else if (c === ',' && !inQ) { res.push(cur); cur = ''; }
          else { cur += c; }
        }
        res.push(cur);
        return res;
      };

      const lines = raw.split(/\r?\n/);
      const start = lines[0].includes('sourceText') ? 1 : 0;
      let count = 0;

      for (let i = start; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = splitCsv(line);
        if (row.length < 13) continue;

        const sourceText = row[0].trim();
        const translatedText = row[1].trim();
        const dictDef = row[9] ? row[9].trim() : '';
        const synRaw = row[10] ? row[10].trim() : '';
        const examples = row[12] ? row[12].trim() : '';

        const synonyms = synRaw ? synRaw.split('|').map(s => s.trim()).filter(Boolean) : [];
        if (sourceText) {
          addUserWordObject({
            word: sourceText.toLowerCase(),
            word_type: 'phrase',
            definition: dictDef || translatedText,
            synonyms: synonyms,
            antonyms: [],
            example: examples,
            level: 'C1',
          });
          count++;
        }
      }
      setListFeedback(count ? `Imported ${count} words from Altyazı CSV.` : 'No valid CSV rows found.');
      if (count) setListInput('');
    } catch (err) {
      setListFeedback('Error parsing CSV format. Check your paste.');
    }
  };
  const addTopDeptWords = () => {
    deptWords.slice(0, 10).forEach((item) => addUserWord(item.word));
  };
  const addTopWascWords = () => {
    wascVisibleWords.slice(0, 25).forEach((item) => addUserWord(item.word));
  };
  const openWascDeck = useCallback((deckId) => {
    const decks = Array.isArray(wascDecksData) ? wascDecksData : [];
    const deck = decks.find((item) => item.id === deckId) || decks[0];
    if (!deck) return;
    navigation.navigate('VocabFlashcard', {
      initialWords: deck.cards || [],
      title: deck.title || 'WASC Quizlet Deck',
    });
  }, [navigation, wascDecksData]);
  const addTopTestEnglishWords = () => {
    testEnglishVisibleWords.slice(0, 20).forEach((item) => addUserWord(item.word));
  };
  const addTopListeningWords = () => {
    listeningUnknownWords.slice(0, 20).forEach((item) => addUserWord(item?.word || item));
  };
  const addTopSubtleHoverWords = () => {
    subtleHoverWords.slice(0, 20).forEach((item) => addUserWord(item?.word || item));
  };
  const checkDeptChallenge = () => {
    if (deptChallengeSelected == null) return;
    setDeptChallengeChecked(true);
  };
  const nextDeptChallenge = () => {
    setDeptChallengeSeed((s) => s + 1);
    setDeptChallengeSelected(null);
    setDeptChallengeChecked(false);
  };
  const checkTestEnglishChallenge = () => {
    if (testEnglishChallengeSelected == null) return;
    setTestEnglishChallengeChecked(true);
  };
  const nextTestEnglishChallenge = () => {
    setTestEnglishChallengeSeed((s) => s + 1);
    setTestEnglishChallengeSelected(null);
    setTestEnglishChallengeChecked(false);
  };

  const renderSectionHeader = () => {
    if (!heavyReady) {
      return (
        <Card style={styles.card}>
          <Text style={styles.h3}>Preparing Vocabulary Workspace...</Text>
          <Text style={styles.sub}>We are loading the core UI first so the screen stays smooth.</Text>
          <View style={styles.quizRow}>
            <Button label="Load Dictionary" onPress={requestDictionaryLoad} disabled={dictionaryLoadRequested} />
            <Button label="Open 24-Week Plan" variant="secondary" onPress={() => setActiveSection('24-Week Plan')} />
          </View>
        </Card>
      );
    }
    switch (activeSection) {
      case '24-Week Plan':
        try {
          const Planner = require('../components/vocab/VocabWeeklyPlanner').default;
          return <Planner initialDay={plannerLaunchDay} />;
        } catch (e) {
          return (
            <Card style={styles.card}>
              <Text style={styles.h3}>24-Week Planner</Text>
              <Text style={styles.sub}>The planner is still loading. Please try again.</Text>
            </Card>
          );
        }
      case 'My Words':
        return (
          <>
            <WorkspaceIntroCard
              title="My Words Workspace"
              body="Build and maintain your personal working vocabulary. Save words from tools, paste lists in bulk, then review them with full word family and collocation support."
              metricValue={userWords.length}
              metricLabel="saved"
              actions={[
                { key: 'my-photo', label: 'Photo OCR', variant: 'secondary', icon: 'scan-outline', onPress: () => navigation.navigate('PhotoVocabCapture') },
                { key: 'my-dict', label: 'Dictionary Lab', variant: 'ghost', icon: 'book-outline', onPress: () => setActiveSection('Dictionary') },
                { key: 'my-unknown', label: 'Unknown Queue', variant: 'ghost', icon: 'alert-circle-outline', onPress: () => setActiveSection('Unknown') },
              ]}
            >
              <View style={styles.workspaceSummaryRow}>
                <View style={styles.workspaceSummaryBox}>
                  <Text style={styles.workspaceSummaryValue}>{smartReview.length}</Text>
                  <Text style={styles.workspaceSummaryLabel}>Need review</Text>
                </View>
                <View style={styles.workspaceSummaryBox}>
                  <Text style={styles.workspaceSummaryValue}>{unknownWords.length}</Text>
                  <Text style={styles.workspaceSummaryLabel}>Unknown</Text>
                </View>
                <View style={styles.workspaceSummaryBox}>
                  <Text style={styles.workspaceSummaryValue}>{progress.totalChecks}</Text>
                  <Text style={styles.workspaceSummaryLabel}>Checks</Text>
                </View>
              </View>
            </WorkspaceIntroCard>
            <Card style={styles.card}>
              <Text style={styles.h3}>Add a Word</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. substantial"
                value={input}
                onChangeText={setInput}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <Button label="Add to My Words" onPress={onAdd} />
            </Card>
            <Card style={styles.card}>
              <Text style={styles.h3}>Add Word List</Text>
              <Text style={styles.sub}>Paste words separated by comma or new line.</Text>
              <TextInput
                style={[styles.input, styles.listInput]}
                placeholder="e.g. analyze, evaluate, synthesize"
                value={listInput}
                onChangeText={setListInput}
                multiline
              />
              <View style={styles.quizRow}>
                <Button label="Add Basic List" variant="secondary" onPress={addList} />
                <Button label="Import Altyazı CSV" variant="primary" style={styles.importCsvBtn} onPress={importCsv} />
                <Button label="Flashcards" variant="secondary" onPress={() => navigation.navigate('VocabFlashcard', { initialWords: userWords })} disabled={userWords.length === 0} />
              </View>
              {listFeedback ? <Text style={styles.sub}>{listFeedback}</Text> : null}
            </Card>
          </>
        );
      case 'Academic':
        return (
          <>
            <WorkspaceIntroCard
              title="Academic Core Bank"
              body="This is the broad academic vocabulary layer. Use it when you want clean definitions, reusable collocations, and higher-frequency essay language."
              metricValue={academicData.length}
              metricLabel="words"
              actions={[
                { key: 'acad-add', label: 'Add top 20', variant: 'secondary', icon: 'bookmark-outline', onPress: () => academicData.slice(0, 20).forEach((w) => addUserWord(w.word)) },
                { key: 'acad-syn', label: 'Synonym Finder', variant: 'ghost', icon: 'git-compare-outline', onPress: () => navigation.navigate('SynonymFinder') },
                { key: 'acad-more', label: 'Load more', variant: 'ghost', icon: 'add-outline', onPress: () => setAcademicRenderLimit((n) => n + 60), disabled: academicRenderLimit >= academicData.length },
              ]}
            />
          </>
        );
      case 'WASC Lists':
        return (
          <>
            <WorkspaceIntroCard
              title="WASC Vocabulary Lists"
              body="Official WASC glossary words (A2-B1-B2) extracted into searchable lists. You can push top words into My Words and open Quizlet-style flashcard decks instantly."
              metricValue={wascWords.length}
              metricLabel="matched"
              actions={[
                { key: 'wasc-add', label: 'Add top 25', variant: 'secondary', icon: 'bookmark-outline', onPress: addTopWascWords },
                { key: 'wasc-deck', label: 'Open mixed deck', variant: 'ghost', icon: 'albums-outline', onPress: () => openWascDeck('quizlet_wasc_mixed') },
                { key: 'wasc-quizlet', label: 'Quizlet profile', variant: 'ghost', icon: 'open-outline', onPress: () => navigation.navigate('WebViewer', { title: 'WASC Quizlet Sets', url: wascQuizletProfileUrl }) },
              ]}
            />
            <Card style={styles.card}>
              <Text style={styles.h3}>WASC Glossary Browser</Text>
              <Text style={styles.sub}>All lists: {wascTotalWords} words • Current filter: {wascWords.length}</Text>
              <Text style={styles.sub}>Level</Text>
              <View style={styles.levelRow}>
                {wascLevels.map((lv) => (
                  <Chip
                    key={`wasc-level-${lv}`}
                    label={lv}
                    active={wascLevel === lv}
                    onPress={() => setWascLevel(lv)}
                  />
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search in WASC glossary..."
                value={wascQuery}
                onChangeText={setWascQuery}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.dictMeta}>Showing {wascVisibleWords.length} / {wascWords.length} words</Text>
              <View style={styles.quizRow}>
                <Button label="WASC Mixed Deck" variant="secondary" onPress={() => openWascDeck('quizlet_wasc_mixed')} />
                <Button label={`WASC ${wascLevel === 'ALL' ? 'A2' : wascLevel} Deck`} variant="secondary" onPress={() => openWascDeck(`quizlet_wasc_${String((wascLevel === 'ALL' ? 'A2' : wascLevel)).toLowerCase()}`)} />
                <Button label="Open Glossary PDF" variant="ghost" onPress={() => navigation.navigate('WebViewer', { title: 'WASC Glossary', url: wascSourceUrl })} />
              </View>
            </Card>
          </>
        );
      case 'Academic Verbs':
        return (
          <>
            <WorkspaceIntroCard
              title="Academic Verb Bank"
              body="High-frequency verbs for claims, evaluation, comparison, evidence, and cause-effect writing. This section is optimized for active usage, not passive memorization."
              metricValue={normalizedAcademicVerbs.length}
              metricLabel="verbs"
              actions={[
                { key: 'verb-add', label: 'Add top 30', variant: 'secondary', icon: 'bookmark-outline', onPress: () => normalizedAcademicVerbs.slice(0, 30).forEach((w) => addUserWord(w.word)) },
                { key: 'verb-dict', label: 'Sentence drills', variant: 'ghost', icon: 'create-outline', onPress: () => setActiveSection('Dictionary') },
                { key: 'verb-more', label: 'Load more', variant: 'ghost', icon: 'add-outline', onPress: () => setVerbRenderLimit((n) => n + 60), disabled: verbRenderLimit >= normalizedAcademicVerbs.length },
              ]}
            />
          </>
        );
      case 'Test-English':
        return (
          <>
            <WorkspaceIntroCard
              title="Test-English Vocabulary Bank"
              body="Use this as a filtered exam bank. Narrow by CEFR and topic, then launch the exact quiz mode you need from the same panel."
              metricValue={testEnglishWords.length}
              metricLabel="matched"
              actions={[
                { key: 'te-meaning', label: 'Meaning quiz', variant: 'secondary', icon: 'help-circle-outline', onPress: () => navigation.navigate('VocabQuiz', { size: 20, mode: 'test_english', topic: testEnglishTopic, level: testEnglishLevel }) },
                { key: 'te-syn', label: 'Synonym quiz', variant: 'ghost', icon: 'git-compare-outline', onPress: () => navigation.navigate('VocabSynonymQuiz', { size: 20, mode: 'test_english', topic: testEnglishTopic, level: testEnglishLevel }) },
                { key: 'te-cloze', label: 'Cloze quiz', variant: 'ghost', icon: 'create-outline', onPress: () => navigation.navigate('VocabClozeQuiz', { size: 20, mode: 'test_english', topic: testEnglishTopic, level: testEnglishLevel }) },
                { key: 'te-colloc', label: '🔗 Collocations', variant: 'ghost', icon: 'link-outline', onPress: () => navigation.navigate('VocabCollocationQuiz', { size: 20, mode: 'test_english', topic: testEnglishTopic, level: testEnglishLevel }) },
              ]}
            />
            <Card style={styles.card}>
              <Text style={styles.h3}>Test-English Vocabulary Bank</Text>
              <Text style={styles.sub}>Curated vocabulary sets across A1-A2-B1-B2-C1 levels.</Text>
              <Text style={styles.dictMeta}>Matched words: {testEnglishWords.length}</Text>
              <Text style={styles.sub}>Level</Text>
              <View style={styles.levelRow}>
                {testEnglishLevels.map((lv) => (
                  <Chip
                    key={`te-lv-${lv}`}
                    label={lv}
                    active={testEnglishLevel === lv}
                    onPress={() => {
                      setTestEnglishLevel(lv);
                      setTestEnglishRenderLimit(80);
                      setTestEnglishChallengeChecked(false);
                      setTestEnglishChallengeSelected(null);
                    }}
                  />
                ))}
              </View>
              <Text style={styles.sub}>Topic</Text>
              <View style={styles.levelRow}>
                {testEnglishTopics.map((topic) => (
                  <Chip
                    key={`te-topic-${topic}`}
                    label={formatTopicLabel(topic)}
                    active={testEnglishTopic === topic}
                    onPress={() => {
                      setTestEnglishTopic(topic);
                      setTestEnglishRenderLimit(80);
                      setTestEnglishChallengeChecked(false);
                      setTestEnglishChallengeSelected(null);
                    }}
                  />
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search in Test-English words..."
                value={testEnglishQuery}
                onChangeText={(value) => {
                  setTestEnglishQuery(value);
                  setTestEnglishRenderLimit(80);
                  setTestEnglishChallengeChecked(false);
                  setTestEnglishChallengeSelected(null);
                }}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <View style={styles.quizRow}>
                <Button label="Add Top 20" variant="secondary" onPress={addTopTestEnglishWords} />
                <Button
                  label="Meaning Quiz"
                  variant="secondary"
                  onPress={() => navigation.navigate('VocabQuiz', {
                    size: 20,
                    mode: 'test_english',
                    topic: testEnglishTopic,
                    level: testEnglishLevel,
                  })}
                />
                <Button
                  label="Synonym Quiz"
                  variant="secondary"
                  onPress={() => navigation.navigate('VocabSynonymQuiz', {
                    size: 20,
                    mode: 'test_english',
                    topic: testEnglishTopic,
                    level: testEnglishLevel,
                  })}
                />
                <Button
                  label="Cloze Quiz"
                  variant="secondary"
                  onPress={() => navigation.navigate('VocabClozeQuiz', {
                    size: 20,
                    mode: 'test_english',
                    topic: testEnglishTopic,
                    level: testEnglishLevel,
                  })}
                />
              </View>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.h3}>Test-English Challenge</Text>
              {!testEnglishChallenge ? (
                <Text style={styles.sub}>Not enough words for challenge in current filter.</Text>
              ) : (
                <>
                  <Text style={styles.challengePrompt}>Best definition for: <Text style={styles.challengeWord}>{testEnglishChallenge.word}</Text></Text>
                  {testEnglishChallenge.options.map((option, idx) => {
                    const selected = testEnglishChallengeSelected === idx;
                    const isCorrect = testEnglishChallengeChecked && idx === testEnglishChallenge.correctIndex;
                    const isWrongSelected = testEnglishChallengeChecked && selected && idx !== testEnglishChallenge.correctIndex;
                    return (
                      <TouchableOpacity
                        key={`${testEnglishChallenge.word}-te-${idx}`}
                        style={[styles.challengeOption, selected && styles.challengeOptionSelected, isCorrect && styles.challengeOptionCorrect, isWrongSelected && styles.challengeOptionWrong]}
                        onPress={() => !testEnglishChallengeChecked && setTestEnglishChallengeSelected(idx)}
                      >
                        <Text style={styles.challengeOptionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={styles.quizRow}>
                    <Button label="Check" variant="secondary" onPress={checkTestEnglishChallenge} />
                    <Button label="Next" variant="secondary" onPress={nextTestEnglishChallenge} />
                    <Button label="Add Word" onPress={() => addUserWord(testEnglishChallenge.word)} />
                  </View>
                </>
              )}
            </Card>
          </>
        );
      case 'Confusing':
        return (
          <>
            <WorkspaceIntroCard
              title="Confusing Forms Workspace"
              body="Use this when the issue is not meaning alone but spelling, pronunciation, or near-identical forms under time pressure."
              metricValue={confusingList.length}
              metricLabel="pairs"
              actions={[
                { key: 'conf-lab', label: 'Pronunciation lab', variant: 'secondary', icon: 'volume-high-outline', onPress: () => navigation.navigate('ConfusingPronunciations') },
                { key: 'conf-clear', label: 'Clear search', variant: 'ghost', icon: 'close-outline', onPress: () => setConfusingQuery(''), disabled: !confusingQuery },
                { key: 'conf-my', label: 'My words', variant: 'ghost', icon: 'bookmark-outline', onPress: () => setActiveSection('My Words') },
              ]}
            />
            <Card style={styles.card}>
              <Text style={styles.h3}>Commonly Confused Words</Text>
              <Text style={styles.sub}>Practice tricky sets like though / through / tough / out.</Text>
              <TextInput
                style={styles.input}
                placeholder="Search confusing words..."
                value={confusingQuery}
                onChangeText={setConfusingQuery}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <View style={styles.quizRow}>
                <Button label="Pronunciation Lab" variant="secondary" onPress={() => navigation.navigate('ConfusingPronunciations')} />
                <Button label="Clear Search" variant="secondary" onPress={() => setConfusingQuery('')} disabled={!confusingQuery} />
              </View>
            </Card>
          </>
        );
      case 'Dictionary':
        return (
          <>
            <WorkspaceIntroCard
              title="Dictionary Workspace"
              body="Search a word, inspect its family, collocations, and examples, then move it into your own study flow. This is the main lexical workspace, not a demo panel."
              metricValue={total}
              metricLabel="entries"
              actions={[
                { key: 'dict-syn', label: 'Synonym Finder', variant: 'secondary', icon: 'git-compare-outline', onPress: () => navigation.navigate('SynonymFinder') },
                { key: 'dict-my', label: 'My words', variant: 'ghost', icon: 'bookmark-outline', onPress: () => setActiveSection('My Words') },
                { key: 'dict-weekly', label: '24-week plan', variant: 'ghost', icon: 'calendar-outline', onPress: () => setActiveSection('24-Week Plan') },
              ]}
            >
              <View style={styles.workspaceSummaryRow}>
                <View style={styles.workspaceSummaryBox}>
                  <Text style={styles.workspaceSummaryValue}>{vocab.length}</Text>
                  <Text style={styles.workspaceSummaryLabel}>Visible now</Text>
                </View>
                <View style={styles.workspaceSummaryBox}>
                  <Text style={styles.workspaceSummaryValue}>{userWords.length}</Text>
                  <Text style={styles.workspaceSummaryLabel}>Saved</Text>
                </View>
                <View style={styles.workspaceSummaryBox}>
                  <Text style={styles.workspaceSummaryValue}>{smartReview.length}</Text>
                  <Text style={styles.workspaceSummaryLabel}>Review queue</Text>
                </View>
              </View>
            </WorkspaceIntroCard>

            {!dictionaryReady ? (
              <Card style={styles.card}>
                <Text style={styles.h3}>
                  {dictionaryStatus === 'building'
                    ? `Preparing Dictionary (${dictionaryProgress}%)`
                    : 'Dictionary Loading'}
                </Text>
                <Text style={styles.sub}>
                  Loading the fast preview first so the vocab workspace opens without stalling. Search two or more letters for a deeper scan.
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, Math.max(2, dictionaryProgress || 0))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.min(100, Math.max(0, dictionaryProgress || 0))}%</Text>
                {dictionaryStatus && dictionaryStatus !== 'building' ? (
                  <Text style={styles.sub}>Status: {dictionaryStatus}</Text>
                ) : null}
                {dictionaryError ? (
                  <Text style={styles.sub}>Error: {dictionaryError}</Text>
                ) : null}
              </Card>
            ) : null}

            <Card style={styles.card}>
              <Text style={styles.h3}>Search and Filter</Text>
              <Text style={styles.sub}>Use the cards below as the main dictionary format. Search first, then expand for family, synonyms, collocations, and examples. The first load is a fast preview; deeper search unlocks when you type.</Text>
              <Text style={styles.dictMeta}>
                Showing {vocab.length} of {dictionaryResults.length} matched entries from {total} · View: {dictionaryView} · Sort: {dictionarySort}
              </Text>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={colors.muted} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search dictionary..."
                  onChangeText={(value) => {
                    queryInputRef.current = value;
                  }}
                  onSubmitEditing={() => commitQuery(queryInputRef.current)}
                  autoCapitalize="none"
                  placeholderTextColor={colors.muted}
                />
                <TouchableOpacity onPress={() => setQueryImmediate('')}>
                  <Ionicons name="close-circle" size={17} color={colors.muted} />
                </TouchableOpacity>
              </View>
              <View style={styles.quizRow}>
                <Button label="Search" onPress={() => commitQuery(queryInputRef.current)} />
                <Button label="Clear" variant="secondary" onPress={() => setQueryImmediate('')} />
              </View>
              <View style={styles.levelRow}>
                {LEVELS.map((lvl) => (
                  <Chip key={lvl} label={lvl} active={level === lvl} onPress={() => setLevel(lvl)} />
                ))}
              </View>
              <Text style={styles.filterLabel}>Workspace View</Text>
              <View style={styles.levelRow}>
                {DICTIONARY_VIEWS.map((item) => (
                  <Chip key={item} label={item} active={dictionaryView === item} onPress={() => setDictionaryView(item)} />
                ))}
              </View>
              <Text style={styles.filterLabel}>Sort</Text>
              <View style={styles.levelRow}>
                {DICTIONARY_SORTS.map((item) => (
                  <Chip key={item} label={item} active={dictionarySort === item} onPress={() => setDictionarySort(item)} />
                ))}
              </View>
              <View style={styles.quizRow}>
                <Button label="Word quiz" variant="secondary" onPress={() => navigation.navigate('VocabPractice')} />
                <Button label="Synonyms quiz" variant="secondary" onPress={() => navigation.navigate('VocabSynonymQuiz')} />
                <Button label="Fill blank" variant="secondary" onPress={() => navigation.navigate('VocabClozeQuiz')} />
                <Button label="🔗 Collocations" variant="secondary" onPress={() => navigation.navigate('VocabCollocationQuiz')} />
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.h3}>Sources</Text>
              <Text style={styles.sub}>
                Core dictionary entries are compiled from open lexical datasets (WordNet + word frequency lists) and the
                Boğaziçi academic lists included in the app.
              </Text>
              <Text style={styles.sub}>
                Live lookup uses dictionaryapi.dev for definitions and Datamuse for synonym expansion.
              </Text>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.h3}>Live Dictionary Lookup</Text>
              <Text style={styles.sub}>Uses a live dictionary source for clean definitions + synonyms + antonyms. Press Search to fetch.</Text>
              {!query ? (
                <Text style={styles.sub}>Type a word above and press Search.</Text>
              ) : liveStatus === 'loading' ? (
                <Text style={styles.sub}>Fetching live dictionary entry...</Text>
              ) : liveStatus === 'error' ? (
                <Text style={styles.sub}>Live lookup failed: {liveError}</Text>
              ) : liveEntry ? (
                <>
                  <View style={styles.wordRow}>
                    <TouchableOpacity onPress={() => speakWord(liveEntry.word)} style={styles.wordTapArea}>
                      <Text style={styles.word}>{liveEntry.word}</Text>
                      <Text style={styles.ttsIcon}>🔊</Text>
                    </TouchableOpacity>
                    {liveEntry.word_type ? (
                      <View style={[styles.levelBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.levelBadgeText}>{liveEntry.word_type}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.sub}>{liveEntry.simple_definition}</Text>
                  {Array.isArray(liveEntry.synonyms) && liveEntry.synonyms.length ? (
                    <View style={styles.tagRow}>
                      {liveEntry.synonyms.slice(0, 8).map((syn) => (
                        <View key={`live-syn-${syn}`} style={styles.tag}>
                          <Text style={styles.tagText}>{syn}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {Array.isArray(liveEntry.antonyms) && liveEntry.antonyms.length ? (
                    <View style={styles.tagRow}>
                      {liveEntry.antonyms.slice(0, 8).map((ant) => (
                        <View key={`live-ant-${ant}`} style={[styles.tag, styles.liveAntTag]}>
                          <Text style={[styles.tagText, styles.liveAntTagText]}>{ant}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {Array.isArray(liveEntry.examples) && liveEntry.examples.length ? (
                    <View style={styles.exampleBox}>
                      {liveEntry.examples.slice(0, 2).map((ex, idx) => (
                        <Text key={`live-ex-${idx}`} style={styles.exampleText}>• {ex}</Text>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={styles.sub}>No live entry found for "{query}".</Text>
              )}
            </Card>

            <View style={[styles.dictionaryStudioGrid, isWide && styles.dictionaryStudioGridWide]}>
              <View style={[styles.dictionaryStudioColumn, isWide && styles.dictionaryStudioColumnWide]}>
                <Card style={styles.card}>
                  <Text style={styles.h3}>Dictionary Focus</Text>
                  {!dictionaryLoadRequested ? (
                    <Text style={styles.sub}>Load the dictionary to unlock focus insights.</Text>
                  ) : !dictionaryReady ? (
                    <Text style={styles.sub}>Dictionary focus will appear after the preview finishes loading.</Text>
                  ) : !focusEntry ? (
                    <Text style={styles.sub}>No word available.</Text>
                  ) : (
                    <>
                      <View style={styles.wordRow}>
                        <TouchableOpacity onPress={() => speakWord(focusEntry.word)} style={styles.wordTapArea}>
                          <Text style={styles.word}>{focusEntry.word}</Text>
                          <Text style={styles.ttsIcon}>🔊</Text>
                        </TouchableOpacity>
                        {focusEntry.level ? (
                          <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[focusEntry.level] || colors.secondary }]}>
                            <Text style={styles.levelBadgeText}>{focusEntry.level}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.sub}>
                        {focusEntry.word_type || 'general academic'}{focusEntry.simple_definition ? ` · ${focusEntry.simple_definition}` : ''}
                      </Text>
                      <View style={styles.focusStatsRow}>
                        <View style={styles.focusStatBox}>
                          <Text style={styles.focusStatValue}>{savedWordSet.has(normalizeWordKey(focusEntry.word)) ? 'Yes' : 'No'}</Text>
                          <Text style={styles.focusStatLabel}>Saved</Text>
                        </View>
                        <View style={styles.focusStatBox}>
                          <Text style={styles.focusStatValue}>{unknownWordSet.has(normalizeWordKey(focusEntry.word)) ? 'Yes' : 'No'}</Text>
                          <Text style={styles.focusStatLabel}>Unknown</Text>
                        </View>
                        <View style={styles.focusStatBox}>
                          <Text style={styles.focusStatValue}>
                            {Number(vocabStats[normalizeWordKey(focusEntry.word)]?.known || 0)}/
                            {Number(vocabStats[normalizeWordKey(focusEntry.word)]?.unknown || 0)}
                          </Text>
                          <Text style={styles.focusStatLabel}>K/U</Text>
                        </View>
                      </View>
                      {dictionaryFocusFamilyRows.length > 0 ? (
                        <View style={styles.focusModule}>
                          <Text style={styles.focusModuleTitle}>Word Family Map</Text>
                          {dictionaryFocusFamilyRows.map((row) => (
                            <View key={`focus-family-${row.key}`} style={styles.focusFamilyRow}>
                              <Text style={styles.focusFamilyLabel}>{row.label}</Text>
                              <View style={styles.chipRow}>
                                {row.values.slice(0, 6).map((value) => (
                                  <TouchableOpacity
                                    key={`focus-family-${row.key}-${value}`}
                                    style={styles.miniChip}
                                    onPress={() => {
                                      setQueryImmediate(value);
                                      speakWord(value);
                                    }}
                                  >
                                    <Text style={styles.miniChipText}>{value}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {dictionaryFocusSynonyms.length > 0 ? (
                        <View style={styles.focusModule}>
                          <Text style={styles.focusModuleTitle}>Synonyms</Text>
                          <View style={styles.chipRow}>
                            {dictionaryFocusSynonyms.map((item) => (
                              <TouchableOpacity
                                key={`focus-synonym-${item}`}
                                style={styles.miniChip}
                                onPress={() => {
                                  setQueryImmediate(item);
                                  speakWord(item);
                                }}
                              >
                                <Text style={styles.miniChipText}>{item}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : null}
                      {dictionaryFocusAntonyms.length > 0 ? (
                        <View style={styles.focusModule}>
                          <Text style={styles.focusModuleTitle}>Antonyms</Text>
                          <View style={styles.chipRow}>
                            {dictionaryFocusAntonyms.map((item) => (
                              <TouchableOpacity
                                key={`focus-antonym-${item}`}
                                style={[styles.miniChip, styles.miniChipOpposite]}
                                onPress={() => {
                                  setQueryImmediate(item);
                                  speakWord(item);
                                }}
                              >
                                <Text style={[styles.miniChipText, styles.miniChipTextOpposite]}>{item}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : null}
                      {dictionaryFocusCollocations.length > 0 ? (
                        <View style={styles.focusModule}>
                          <Text style={styles.focusModuleTitle}>Collocation Bank</Text>
                          <View style={styles.chipRow}>
                            {dictionaryFocusCollocations.map((item) => (
                              <TouchableOpacity
                                key={`focus-collocation-${item}`}
                                style={styles.miniChip}
                                onPress={() => speakWord(item)}
                              >
                                <Text style={styles.miniChipText}>{item}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : null}
                      {dictionaryFocusVerbForms ? (
                        <View style={styles.focusModule}>
                          <Text style={styles.focusModuleTitle}>Verb Forms</Text>
                          <View style={styles.focusVerbFormsWrap}>
                            <Text style={styles.focusVerbFormChip}>Base: {dictionaryFocusVerbForms.base}</Text>
                            <Text style={styles.focusVerbFormChip}>V2: {dictionaryFocusVerbForms.v2}</Text>
                            <Text style={styles.focusVerbFormChip}>V3: {dictionaryFocusVerbForms.v3}</Text>
                            <Text style={styles.focusVerbFormChip}>-ing: {dictionaryFocusVerbForms.ing}</Text>
                            <Text style={styles.focusVerbFormChip}>3rd person: {dictionaryFocusVerbForms.thirdPerson}</Text>
                          </View>
                        </View>
                      ) : null}
                      <View style={styles.quizRow}>
                        <Button label="Add to My Words" variant="secondary" onPress={() => addUserWord(focusEntry.word)} />
                        <Button label="Read aloud" variant="ghost" onPress={() => speakWord(focusEntry.word)} />
                        <Button label="Use in studio" variant="ghost" onPress={() => setSentenceInput(dictionaryFocusExamples[0] || '')} />
                      </View>
                    </>
                  )}
                </Card>

                <Card style={styles.card}>
                  <Text style={styles.h3}>Sentence Studio</Text>
                  <Text style={styles.sub}>
                    Target word: {targetWord || 'N/A'}
                  </Text>
                  {!!targetWord && (
                    <View style={styles.starterRow}>
                      {buildSentenceStarters(targetWord, targetEntry).map((starter) => (
                        <TouchableOpacity
                          key={starter}
                          style={styles.starterChip}
                          onPress={() => setSentenceInput((prev) => (prev ? `${prev} ${starter}` : starter))}
                        >
                          <Text style={styles.starterText}>{starter}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {targetModelExamples.length > 0 ? (
                    <View style={styles.modelBox}>
                      <Text style={styles.modelTitle}>Model sentences</Text>
                      {targetModelExamples.map((ex, idx) => (
                        <TouchableOpacity
                          key={`${targetWord}-model-${idx}`}
                          style={styles.modelRow}
                          onPress={() => setSentenceInput(ex)}
                        >
                          <Text style={styles.modelBullet}>{idx + 1}.</Text>
                          <Text style={styles.modelText}>{ex}</Text>
                          <Ionicons name="copy-outline" size={14} color={colors.primary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                  <TextInput
                    style={[styles.input, styles.sentenceInput]}
                    placeholder="Write one sentence using the target word..."
                    value={sentenceInput}
                    onChangeText={setSentenceInput}
                    multiline
                  />
                  <View style={styles.quizRow}>
                    <Button label="Check sentence" variant="secondary" onPress={checkSentence} />
                    <Button label="Read sentence" variant="ghost" onPress={() => speakWord(sentenceInput)} />
                  </View>
                  {sentenceFeedback ? (
                    <View style={[styles.sentenceFeedbackBox, sentenceFeedback.tone === 'good' ? styles.sentenceFeedbackGood : styles.sentenceFeedbackWarn]}>
                      <Text style={styles.sentenceFeedbackText}>{sentenceFeedback.text}</Text>
                      {sentenceFeedback.improved ? (
                        <TouchableOpacity style={styles.upgradeBox} onPress={() => setSentenceInput(sentenceFeedback.improved)}>
                          <Text style={styles.upgradeTitle}>Suggested Upgrade</Text>
                          <Text style={styles.upgradeText}>{sentenceFeedback.improved}</Text>
                          <Text style={styles.upgradeAction}>Tap to use this sentence</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}
                </Card>
              </View>

              <View style={[styles.dictionaryStudioColumn, isWide && styles.dictionaryStudioColumnWide]}>
                <Card style={styles.card}>
                  <Text style={styles.h3}>Quick Drills</Text>
                  {!dictionaryReady ? (
                    <Text style={styles.sub}>Quick drills unlock after the fast preview is ready.</Text>
                  ) : !challenge ? (
                    <Text style={styles.sub}>Challenge data is loading.</Text>
                  ) : (
                    <>
                      <Text style={styles.challengePrompt}>Best definition for: <Text style={styles.challengeWord}>{challenge.word}</Text></Text>
                      {challenge.options.map((option, idx) => {
                        const selected = challengeSelected === idx;
                        const isCorrect = challengeChecked && idx === challenge.correctIndex;
                        const isWrongSelected = challengeChecked && selected && idx !== challenge.correctIndex;
                        return (
                          <TouchableOpacity
                            key={`${challenge.word}-${idx}`}
                            style={[styles.challengeOption, selected && styles.challengeOptionSelected, isCorrect && styles.challengeOptionCorrect, isWrongSelected && styles.challengeOptionWrong]}
                            onPress={() => !challengeChecked && setChallengeSelected(idx)}
                          >
                            <Text style={styles.challengeOptionText}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                      <View style={styles.quizRow}>
                        <Button label="Check" variant="secondary" onPress={submitChallenge} />
                        <Button label="Next" variant="secondary" onPress={nextChallenge} />
                        <Button label="Add word" onPress={() => addUserWord(challenge.word)} />
                      </View>
                    </>
                  )}
                </Card>

                <Card style={styles.card}>
                  <Text style={styles.h3}>Academic Verb Drill</Text>
                  {!verbDrill ? (
                    <Text style={styles.sub}>Verb list loading.</Text>
                  ) : (
                    <>
                      <View style={styles.wordRow}>
                        <TouchableOpacity onPress={() => speakWord(verbDrill.word)} style={styles.wordTapArea}>
                          <Text style={styles.word}>{verbDrill.word}</Text>
                          <Text style={styles.ttsIcon}>🔊</Text>
                        </TouchableOpacity>
                        <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.levelBadgeText}>VERB</Text>
                        </View>
                      </View>
                      <Text style={styles.sub}>{verbDrill.definition}</Text>
                      {verbDrill.example ? <Text style={styles.sub}>Example: {verbDrill.example}</Text> : null}
                      <TextInput
                        style={[styles.input, styles.sentenceInput]}
                        placeholder={`Write one sentence using "${verbDrill.word}"...`}
                        value={verbSentence}
                        onChangeText={setVerbSentence}
                        multiline
                      />
                      <View style={styles.quizRow}>
                        <Button label="Check sentence" variant="secondary" onPress={checkVerbSentence} />
                        <Button label="Next verb" variant="secondary" onPress={() => { setVerbSeed((s) => s + 1); setVerbSentence(''); setVerbFeedback(null); }} />
                        <Button label="Add verb" onPress={() => addUserWord(verbDrill.word)} />
                      </View>
                      {verbFeedback ? (
                        <View style={[styles.sentenceFeedbackBox, verbFeedback.tone === 'good' ? styles.sentenceFeedbackGood : styles.sentenceFeedbackWarn]}>
                          <Text style={styles.sentenceFeedbackText}>{verbFeedback.text}</Text>
                          {verbFeedback.improved ? (
                            <TouchableOpacity style={styles.upgradeBox} onPress={() => setVerbSentence(verbFeedback.improved)}>
                              <Text style={styles.upgradeTitle}>Suggested Upgrade</Text>
                              <Text style={styles.upgradeText}>{verbFeedback.improved}</Text>
                              <Text style={styles.upgradeAction}>Tap to use this sentence</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ) : null}
                    </>
                  )}
                </Card>
              </View>
            </View>
          </>
        );
      case 'Listening Queue':
        return (
          <>
            <WorkspaceIntroCard
              title="Listening Vocabulary Queue"
              body="Words captured from Listening tasks are collected here so you can revise listening-specific vocabulary separately."
              metricValue={listeningUnknownWords.length}
              metricLabel="captured"
              actions={[
                { key: 'listening-open', label: 'Open listening', variant: 'secondary', icon: 'headset-outline', onPress: () => navigation.navigate('Listening') },
                { key: 'listening-my', label: 'Add top 20', variant: 'ghost', icon: 'bookmark-outline', onPress: addTopListeningWords, disabled: listeningUnknownWords.length === 0 },
                { key: 'listening-unknown', label: 'Unknown queue', variant: 'ghost', icon: 'alert-circle-outline', onPress: () => setActiveSection('Unknown') },
              ]}
            />
            <Card style={styles.card}>
              <Text style={styles.h3}>Listening Capture Feed</Text>
              <Text style={styles.sub}>
                Complete a listening quiz, and the system sends core keywords and missed-question vocabulary here.
              </Text>
              <View style={styles.quizRow}>
                <Button label="Go to Listening" variant="secondary" onPress={() => navigation.navigate('Listening')} />
                <Button label="Add Top 20 to My Words" variant="secondary" onPress={addTopListeningWords} disabled={listeningUnknownWords.length === 0} />
              </View>
            </Card>
          </>
        );
      case 'Subtle Hover':
        return (
          <>
            <WorkspaceIntroCard
              title="Subtle Hover Queue"
              body="This queue receives vocabulary captured by the Subtle Hover Chrome extension. Sync is now near real-time while the app is open."
              metricValue={subtleHoverWords.length}
              metricLabel="synced"
              actions={[
                { key: 'subtle-add', label: 'Add top 20', variant: 'secondary', icon: 'bookmark-outline', onPress: addTopSubtleHoverWords, disabled: subtleHoverWords.length === 0 },
                { key: 'subtle-unknown', label: 'Unknown queue', variant: 'ghost', icon: 'alert-circle-outline', onPress: () => setActiveSection('Unknown') },
                { key: 'subtle-dict', label: 'Dictionary', variant: 'ghost', icon: 'book-outline', onPress: () => setActiveSection('Dictionary') },
              ]}
            />
            <Card style={styles.card}>
              <Text style={styles.h3}>Subtle Hover Sync Feed</Text>
              <Text style={styles.sub}>
                If a word is saved from the extension, it appears here first, then you can move it to My Words.
              </Text>
              <View style={styles.quizRow}>
                <Button label="Add Top 20 To My Words" variant="secondary" onPress={addTopSubtleHoverWords} disabled={subtleHoverWords.length === 0} />
                <Button label="Open Unknown Queue" variant="secondary" onPress={() => setActiveSection('Unknown')} />
              </View>
            </Card>
          </>
        );
      case 'Unknown':
        return (
          <>
            <WorkspaceIntroCard
              title="Unknown Queue"
              body="These are the words you missed, flagged, or still fail to control. Clear this queue only after you have recycled the words in context."
              metricValue={unknownWords.length}
              metricLabel="queued"
              actions={[
                { key: 'unknown-dict', label: 'Dictionary Lab', variant: 'secondary', icon: 'book-outline', onPress: () => setActiveSection('Dictionary') },
                { key: 'unknown-my', label: 'My words', variant: 'ghost', icon: 'bookmark-outline', onPress: () => setActiveSection('My Words') },
                { key: 'unknown-listening', label: 'Listening queue', variant: 'ghost', icon: 'headset-outline', onPress: () => setActiveSection('Listening Queue') },
                { key: 'unknown-subtle', label: 'Subtle Hover', variant: 'ghost', icon: 'logo-chrome', onPress: () => setActiveSection('Subtle Hover') },
                { key: 'unknown-clear', label: 'Clear list', variant: 'ghost', icon: 'trash-outline', onPress: clearUnknownWords, disabled: unknownWords.length === 0 },
              ]}
            />
            {unknownWords.length > 0 && (
              <Button label="Clear Unknown List" variant="secondary" onPress={clearUnknownWords} />
            )}
          </>
        );
      case 'Bogazici Dept':
        return (
          <>
            <WorkspaceIntroCard
              title="Boğaziçi Department Packs"
              body="Department-specific vocabulary is for faculty reading, topic familiarity, and academic context building. Use this when you need field relevance, not generic breadth."
              metricValue={deptWords.length}
              metricLabel="terms"
              actions={[
                { key: 'dept-add', label: 'Add top 10', variant: 'secondary', icon: 'bookmark-outline', onPress: addTopDeptWords },
                { key: 'dept-my', label: 'My words', variant: 'ghost', icon: 'bookmark-outline', onPress: () => setActiveSection('My Words') },
                { key: 'dept-next', label: 'Next quiz', variant: 'ghost', icon: 'refresh-outline', onPress: nextDeptChallenge, disabled: !deptChallenge },
              ]}
            />
            <Card style={styles.card}>
              <Text style={styles.h3}>Bogazici Department Vocabulary</Text>
              <Text style={styles.sub}>Long-form vocabulary sets grouped by Bogazici departments only.</Text>
              <View style={styles.levelRow}>
                {deptList.map((d) => (
                  <Chip
                    key={d.id}
                    label={d.department.replace('Bogazici - ', '')}
                    active={dept === d.id}
                    onPress={() => {
                      setDept(d.id);
                      setDeptRenderLimit(60);
                    }}
                  />
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search in selected department..."
                value={deptQuery}
                onChangeText={(v) => {
                  setDeptQuery(v);
                  setDeptRenderLimit(60);
                }}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.dictMeta}>Showing {deptWords.length} words</Text>
              <View style={styles.quizRow}>
                <Button label="Add Top 10 To My Words" variant="secondary" onPress={addTopDeptWords} />
              </View>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.h3}>Department Challenge</Text>
              <Text style={styles.sub}>{selectedDeptLabel}</Text>
              {!deptChallenge ? (
                <Text style={styles.sub}>Not enough words for challenge in current filter.</Text>
              ) : (
                <>
                  <Text style={styles.challengePrompt}>Best definition for: <Text style={styles.challengeWord}>{deptChallenge.word}</Text></Text>
                  {deptChallenge.options.map((option, idx) => {
                    const selected = deptChallengeSelected === idx;
                    const isCorrect = deptChallengeChecked && idx === deptChallenge.correctIndex;
                    const isWrongSelected = deptChallengeChecked && selected && idx !== deptChallenge.correctIndex;
                    return (
                      <TouchableOpacity
                        key={`${deptChallenge.word}-dept-${idx}`}
                        style={[styles.challengeOption, selected && styles.challengeOptionSelected, isCorrect && styles.challengeOptionCorrect, isWrongSelected && styles.challengeOptionWrong]}
                        onPress={() => !deptChallengeChecked && setDeptChallengeSelected(idx)}
                      >
                        <Text style={styles.challengeOptionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={styles.quizRow}>
                    <Button label="Check" variant="secondary" onPress={checkDeptChallenge} />
                    <Button label="Next" variant="secondary" onPress={nextDeptChallenge} />
                    <Button label="Add Word" onPress={() => addUserWord(deptChallenge.word)} />
                  </View>
                </>
              )}
            </Card>
          </>
        );
    }
  };

  const renderListHeader = () => {
    if (!screenReady) {
      return (
        <View style={styles.headerContent}>
          <Text style={styles.h1}>Vocabulary</Text>
          <Text style={styles.headerSub}>Preparing the vocab workspace...</Text>
        </View>
      );
    }
    return (
      <View style={styles.headerContent}>
      <Text style={styles.h1}>Vocabulary</Text>
      <Text style={styles.headerSub}>Dictionary-first vocab workspace with a 24-week daily quiz system: days 1-5 word formation, days 6-7 collocation.</Text>

      <Card style={styles.heroCard} glow>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Dictionary + Study Workspace</Text>
            <Text style={styles.heroTitle}>Search, save, and recycle words in a cleaner exam-focused flow.</Text>
            <Text style={styles.heroBody}>
              The dictionary is the main entry point. The 24-week plan now runs as daily 20-question sets: five word formation days and two collocation days every week.
            </Text>
          </View>
          <View style={styles.heroCounter}>
            <Text style={styles.heroCounterValue}>{total}</Text>
            <Text style={styles.heroCounterLabel}>Entries</Text>
          </View>
        </View>
        <View style={styles.heroActionRow}>
          <Button label="Dictionary" icon="book-outline" onPress={() => setActiveSection('Dictionary')} />
          <Button label="24-week plan" icon="calendar-outline" variant="secondary" onPress={() => setActiveSection('24-Week Plan')} />
          <Button label="My words" icon="bookmark-outline" variant="ghost" onPress={() => setActiveSection('My Words')} />
        </View>
      </Card>

      {heavyReady ? (
        <>
          {renderFlashcardHub()}

          <View style={styles.metricRail}>
            <HubMetric value={total} label="Dictionary" />
            <HubMetric value={userWords.length} label="My words" accent="teal" />
            <HubMetric value={subtleHoverWords.length} label="Subtle Hover" accent="blue" />
            <HubMetric value={listeningUnknownWords.length} label="Listening queue" accent="blue" />
            <HubMetric value={unknownWords.length} label="Unknown queue" accent="amber" />
            <HubMetric value={`${progress.knownPct}%`} label="Known ratio" accent="purple" />
          </View>

          <Card style={styles.banner}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.bannerTitle}>Quick Start</Text>
                <Text style={styles.sectionSub}>Open the vocab workspace by task, not by tab hunting.</Text>
              </View>
            </View>
            <View style={styles.heroActionRow}>
              <Button label="Search Dictionary" icon="search-outline" onPress={() => setActiveSection('Dictionary')} />
              <Button label="Word Formation Quiz" icon="create-outline" variant="secondary" onPress={() => openPlannerDay(1)} />
              <Button label="Collocation Quiz" icon="link-outline" variant="secondary" onPress={() => openPlannerDay(6)} />
              <Button label="Listening Queue" icon="headset-outline" variant="secondary" onPress={() => setActiveSection('Listening Queue')} />
              <Button label="Subtle Hover" icon="logo-chrome" variant="secondary" onPress={() => setActiveSection('Subtle Hover')} />
              <Button label="Unknown Queue" icon="alert-circle-outline" variant="ghost" onPress={() => setActiveSection('Unknown')} />
            </View>
          </Card>

          <Card style={styles.banner}>
            <Text style={styles.bannerTitle}>Study Tip</Text>
            <Text style={styles.bannerBody}>
              Start with meaning, then word family, then collocations, then sentence use. Synonyms should come last, not first.
            </Text>
          </Card>

          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.h3}>Vocab Tools</Text>
                <Text style={styles.sectionSub}>Open a focused tool instead of scanning the full hub.</Text>
              </View>
            </View>
            <View style={[styles.toolShortcutGrid, isWide && styles.toolShortcutGridWide]}>
              {VOCAB_TOOLS.map((tool) => (
                <View key={tool.key} style={[styles.toolShortcutWrap, isWide && styles.toolShortcutWrapWide]}>
                  <ToolShortcutCard item={tool} onPress={() => navigation.navigate(tool.route)} />
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : (
        <Card style={styles.banner}>
          <Text style={styles.bannerTitle}>Indexing Dictionary...</Text>
          <Text style={styles.bannerBody}>We are warming up the dictionary in the background so you can start without delays.</Text>
        </Card>
      )}

      <Card style={styles.workspaceCard}>
        <View style={styles.workspaceHeader}>
          <View style={styles.workspaceCopy}>
            <Text style={styles.workspaceEyebrow}>Current Workspace</Text>
            <View style={styles.workspaceTitleRow}>
              <Ionicons name={activeSectionMeta.icon || 'ellipse'} size={16} color={colors.primaryDark} />
              <Text style={styles.workspaceTitle}>{activeSectionMeta.title || activeSection}</Text>
            </View>
            <Text style={styles.workspaceBody}>{activeSectionMeta.description || 'Choose a vocab workspace and continue from there.'}</Text>
          </View>
          <View style={styles.workspaceCountPill}>
            <Text style={styles.workspaceCountValue}>{activeWorkspaceCount}</Text>
            <Text style={styles.workspaceCountLabel}>items</Text>
          </View>
        </View>
        <View style={styles.heroActionRow}>
          {workspaceQuickActions.map((action) => (
            <Button
              key={action.key}
              label={action.label}
              variant={action.variant}
              icon={action.icon}
              onPress={action.onPress}
            />
          ))}
        </View>
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroller}
        contentContainerStyle={styles.tabRow}
      >
        {SECTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeSection === key && styles.tabActive]}
            onPress={() => setActiveSection(key)}
            activeOpacity={0.9}
          >
            <View style={[styles.tabIconWrap, activeSection === key && styles.tabIconWrapActive]}>
              <Ionicons
                name={SECTION_META[key]?.icon || 'ellipse'}
                size={13}
                color={activeSection === key ? '#fff' : colors.primaryDark}
              />
            </View>
            <View style={styles.tabCopy}>
              <Text style={[styles.tabText, activeSection === key && styles.tabTextActive]}>{label}</Text>
              <Text style={[styles.tabMeta, activeSection === key && styles.tabMetaActive]}>
                {sectionCounts[key] || 0} items
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {renderSectionHeader()}
    </View>
    );
  };

  const renderListFooter = useCallback(() => {
    if (activeSection === 'Dictionary' && dictionaryHasMore) {
      return (
        <View style={{ padding: 20 }}>
          <Button
            label={`Load More Entries (${Math.min(DICTIONARY_CARD_BATCH, dictionaryResults.length - dictionaryRenderLimit)} more)`}
            variant="secondary"
            onPress={() => setDictionaryRenderLimit((current) => current + DICTIONARY_CARD_BATCH)}
          />
        </View>
      );
    }
    if (activeSection === 'Bogazici Dept' && deptRenderLimit < deptWords.length) {
      return (
        <View style={{ padding: 20 }}>
          <Button label="Load More Department Words" variant="secondary" onPress={() => setDeptRenderLimit((n) => n + 60)} />
        </View>
      );
    }
    if (activeSection === 'Academic' && academicRenderLimit < academicData.length) {
      return (
        <View style={{ padding: 20 }}>
          <Button label="Load More Academic Words" variant="secondary" onPress={() => setAcademicRenderLimit((n) => n + 60)} />
        </View>
      );
    }
    if (activeSection === 'WASC Lists' && wascRenderLimit < wascWords.length) {
      return (
        <View style={{ padding: 20 }}>
          <Button label="Load More WASC Words" variant="secondary" onPress={() => setWascRenderLimit((n) => n + 80)} />
        </View>
      );
    }
    return <View style={{ height: 120 }} />;
  }, [activeSection, dictionaryHasMore, dictionaryResults.length, dictionaryRenderLimit, deptRenderLimit, deptWords.length, academicRenderLimit, academicData.length, wascRenderLimit, wascWords.length]);

  return (
    <Screen scroll={false}>
      <FlatList
        style={{ flex: 1 }}
        data={getSectionData()}
        renderItem={renderVocabItem}
        keyExtractor={(item, index) => `${activeSection}-${item.word || index}-${index}`}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        windowSize={7}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  heroCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#172554',
    borderColor: '#172554',
  },
  heroHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: typography.h2,
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  heroBody: {
    fontSize: typography.small,
    color: '#DBEAFE',
    lineHeight: 20,
  },
  heroCounter: {
    minWidth: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  heroCounterValue: {
    fontSize: 28,
    lineHeight: 32,
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
  },
  heroCounterLabel: {
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
  metricRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  hubMetricCard: {
    flexGrow: 1,
    flexBasis: 148,
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hubMetricAccent: {
    width: 34,
    height: 4,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  hubMetricAccentBlue: {
    backgroundColor: colors.primary,
  },
  hubMetricAccentTeal: {
    backgroundColor: colors.accent,
  },
  hubMetricAccentAmber: {
    backgroundColor: '#F59E0B',
  },
  hubMetricAccentPurple: {
    backgroundColor: '#8B5CF6',
  },
  hubMetricValue: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  hubMetricLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  banner: {
    marginBottom: spacing.md,
    backgroundColor: '#F7FAFF',
    borderColor: '#D8E4F8',
  },
  bannerTitle: {
    color: colors.primaryDark,
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
  },
  bannerBody: {
    color: colors.muted,
    marginTop: spacing.xs,
    fontSize: typography.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionSub: {
    fontSize: typography.small,
    color: colors.muted,
  },
  toolShortcutGrid: {
    gap: spacing.sm,
  },
  toolShortcutGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  toolShortcutWrap: {
    width: '100%',
  },
  toolShortcutWrapWide: {
    width: '50%',
    paddingHorizontal: 6,
  },
  toolShortcutCard: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#D8E4F8',
    borderRadius: radius.lg,
    backgroundColor: '#FBFDFF',
    padding: spacing.md,
  },
  toolShortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  toolShortcutIconBlue: {
    backgroundColor: '#E0ECFF',
  },
  toolShortcutIconTeal: {
    backgroundColor: '#DDF7F4',
  },
  toolShortcutIconAmber: {
    backgroundColor: '#FEF3C7',
  },
  toolShortcutIconPurple: {
    backgroundColor: '#EFE7FF',
  },
  toolShortcutTitle: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  toolShortcutBody: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  toolShortcutFooter: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toolShortcutFooterText: {
    color: colors.primary,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  workspaceCard: {
    marginBottom: spacing.md,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  workspaceCopy: {
    flex: 1,
  },
  workspaceEyebrow: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  workspaceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  workspaceTitle: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  workspaceBody: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 20,
  },
  workspaceCountPill: {
    minWidth: 78,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#D8E4F8',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  workspaceCountValue: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  workspaceCountLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  workspaceIntroCard: {
    marginBottom: spacing.md,
  },
  workspaceIntroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  workspaceIntroCopy: {
    flex: 1,
  },
  workspaceIntroTitle: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  workspaceIntroBody: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 20,
  },
  workspaceIntroMetric: {
    minWidth: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#D8E4F8',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  workspaceIntroMetricValue: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  workspaceIntroMetricLabel: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  workspaceIntroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  workspaceSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dictionaryStudioGrid: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dictionaryStudioGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dictionaryStudioColumn: {
    gap: spacing.md,
  },
  dictionaryStudioColumnWide: {
    width: '49%',
  },
  workspaceSummaryBox: {
    flex: 1,
    minWidth: 92,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: 14,
    backgroundColor: '#F8FBFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  workspaceSummaryValue: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  workspaceSummaryLabel: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  tabScroller: {
    marginBottom: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 6,
    gap: spacing.xs,
    alignItems: 'stretch',
  },
  tab: {
    minWidth: 138,
    minHeight: 58,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  tabActive: {
    backgroundColor: '#172554',
    borderColor: '#172554',
  },
  tabIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabCopy: {
    flex: 1,
  },
  tabText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabMeta: {
    marginTop: 1,
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  tabMetaActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  listGrid: {
    gap: spacing.xs,
  },
  listGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listItemWrap: {
    width: '100%',
  },
  listItemWrapWide: {
    width: '49%',
  },
  searchBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
  quizRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  importCsvBtn: {
    backgroundColor: '#059669',
  },
  card: { marginBottom: spacing.md },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  wordTapArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  word: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  ttsIcon: { fontSize: 16 },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  def: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stats: {
    fontSize: typography.small,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  expandedSection: { marginTop: spacing.sm },
  sectionTitle: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  familyRow: {
    marginTop: 6,
  },
  familyLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
  },
  liveAntTag: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  liveAntTagText: {
    color: '#BE123C',
  },
  exampleBox: {
    marginTop: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  exampleText: {
    fontSize: typography.small,
    color: colors.text,
  },
  miniChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  miniChipText: {
    fontSize: typography.small,
    color: colors.primary,
  },
  miniChipNegative: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  miniChipTextNegative: {
    color: '#B91C1C',
  },
  miniChipOpposite: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FBCFE8',
  },
  miniChipTextOpposite: {
    color: '#BE123C',
  },
  collocationTip: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 6,
  },
  sourceTag: {
    marginTop: spacing.sm,
    fontSize: typography.xsmall,
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  relatedCard: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  relatedWordWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  relatedWord: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  relatedTag: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EAF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  relatedType: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  relatedActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  relatedActionBtn: {
    borderWidth: 1,
    borderColor: '#D6E4FF',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedDef: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 19,
  },
  relatedSyn: {
    fontSize: typography.small,
    color: colors.primary,
  },
  relatedAnt: {
    fontSize: typography.small,
    color: '#BE123C',
  },
  relatedExampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  relatedExample: {
    flex: 1,
    fontSize: typography.small,
    color: colors.muted,
    fontStyle: 'italic',
  },
  relatedVerbForms: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#DDEAFE',
    borderRadius: 10,
    backgroundColor: '#F4F8FF',
    padding: spacing.xs,
  },
  relatedVerbFormsTitle: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  relatedVerbFormsLine: {
    fontSize: typography.xsmall,
    color: colors.text,
    lineHeight: 17,
  },
  example: {
    flex: 1,
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: 4,
  },
  exampleBullet: {
    width: 16,
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 1,
  },
  expandHint: {
    fontSize: 11,
    color: colors.muted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
    fontSize: typography.body,
    color: colors.text,
  },
  listInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  photoSourceBadge: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#CEDFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  photoSourceBadgeText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
  },
  photoPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  photoPresetChip: {
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  photoPresetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  photoPresetChipText: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  photoPresetChipTextActive: {
    color: colors.primaryDark,
  },
  photoInput: {
    minHeight: 132,
    textAlignVertical: 'top',
  },
  photoLoadingRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  photoLoadingText: {
    fontSize: typography.small,
    color: colors.muted,
  },
  photoMetaText: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.muted,
  },
  photoFeedbackText: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.primaryDark,
  },
  photoResultsWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  photoResultCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: '#fff',
  },
  photoResultCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F7FAFF',
  },
  photoResultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  photoSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  photoWordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  photoSpeakBtn: {
    borderWidth: 1,
    borderColor: '#D3E2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EEF4FF',
  },
  photoResultWord: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  photoResultBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  photoResultBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EAF2FF',
  },
  photoResultBadgeMuted: {
    backgroundColor: '#F3F4F6',
  },
  photoResultBadgeHigh: {
    backgroundColor: '#DCFCE7',
  },
  photoResultBadgeLow: {
    backgroundColor: '#FEF3C7',
  },
  photoResultBadgeText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  photoResultBadgeTextMuted: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  photoResultDef: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
  },
  photoResultHint: {
    marginTop: 4,
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 17,
  },
  photoResultActionRow: {
    marginTop: spacing.xs,
    alignItems: 'flex-start',
  },
  sentenceInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  starterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  starterChip: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#D5E2FF',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  starterText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontFamily: typography.fontBody,
  },
  modelBox: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#D5E2FF',
    backgroundColor: '#F5F9FF',
    borderRadius: 10,
    padding: spacing.sm,
    gap: 6,
  },
  modelTitle: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modelBullet: {
    fontSize: typography.small,
    color: colors.muted,
    width: 16,
    marginTop: 1,
  },
  modelText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
  },
  sentenceFeedbackBox: {
    marginTop: spacing.sm,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
  },
  sentenceFeedbackGood: {
    backgroundColor: '#ECFDF3',
    borderColor: '#7AD9A1',
  },
  sentenceFeedbackWarn: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  sentenceFeedbackText: {
    fontSize: typography.small,
    color: colors.text,
  },
  upgradeBox: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: spacing.sm,
  },
  upgradeTitle: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
  },
  upgradeAction: {
    marginTop: 6,
    fontSize: typography.xsmall,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  dictMeta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: colors.secondary,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressText: {
    marginTop: 6,
    fontSize: typography.xsmall,
    color: colors.muted,
    textAlign: 'right',
  },
  focusStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  focusStatBox: {
    flex: 1,
    minWidth: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  focusStatValue: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  focusStatLabel: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  focusModule: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#D5E2FF',
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    padding: spacing.sm,
  },
  focusModuleTitle: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  focusFamilyRow: {
    marginTop: spacing.xs,
  },
  focusFamilyLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  confusingWordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  confusingWordChip: {
    borderWidth: 1,
    borderColor: '#D6E4FF',
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  confusingWordText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  confusingVs: {
    fontSize: typography.small,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  confusingIpa: {
    fontSize: typography.small,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  confusingDef: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 19,
    marginBottom: 4,
  },
  confusingWordInline: {
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  challengePrompt: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  challengeWord: {
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  challengeOption: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: '#fff',
  },
  challengeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  challengeOptionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF3',
  },
  challengeOptionWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  challengeOptionText: {
    fontSize: typography.small,
    color: colors.text,
  },
  commonErrorText: {
    fontSize: typography.small,
    color: '#FF5722',
    marginTop: 2,
  },
  verbFormsStrip: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#D9E6FD',
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: spacing.sm,
    gap: 4,
  },
  verbFormsText: {
    fontSize: typography.small,
    color: colors.text,
  },
  focusVerbFormsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  focusVerbFormChip: {
    borderWidth: 1,
    borderColor: '#CFDFFF',
    backgroundColor: '#EFF5FF',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  cardActionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  flashcardHubCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#1E293B',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  flashcardHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  flashcardHubCopy: {
    flex: 1,
  },
  flashcardHubTitle: {
    fontSize: 18,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    fontWeight: '900',
    marginBottom: 4,
  },
  flashcardHubBody: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  flashcardHubActions: {
    flexDirection: 'row',
    gap: 10,
  },
});
