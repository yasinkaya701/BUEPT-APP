import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { requestDemoModule } from '../utils/demoAi';
import { pickPhotoFromGallery, runPhotoOcr } from '../utils/photoOcr';
import { speakEnglish } from '../utils/ttsEnglish';
import { getAiSourceMeta } from '../utils/aiWorkspace';

const MIN_LEVELS = ['B1', 'B2', 'C1', 'C2'];
const LIMITS = [8, 12, 16, 24];
const OCR_SAMPLES = [
  {
    id: 'lecture',
    label: 'Lecture Slide',
    text: 'Academic resilience depends on sustained attention, deliberate practice, and reflective feedback cycles in higher education.',
  },
  {
    id: 'article',
    label: 'Article Snippet',
    text: 'Researchers argue that methodological clarity and empirical consistency are essential for credible academic argumentation.',
  },
  {
    id: 'notice',
    label: 'Campus Notice',
    text: 'Students should review the orientation schedule, assignment deadlines, and departmental communication guidelines before registration.',
  },
];

function normalizeWordTypeLabel(rawType = '') {
  const t = String(rawType || '').toLowerCase();
  if (!t) return 'noun';
  if (t.includes('noun')) return 'noun';
  if (t.includes('verb')) return 'verb';
  if (t.includes('adjective') || t.includes('adj')) return 'adjective';
  if (t.includes('adverb') || t.includes('adv')) return 'adverb';
  return t;
}

function normalizePhotoCandidates(list = []) {
  const source = Array.isArray(list) ? list : [];
  const seen = new Set();
  const out = [];

  source.forEach((item, index) => {
    const word = String(item?.word || '').toLowerCase().trim().replace(/[^a-z-]/g, '');
    if (!word || seen.has(word)) return;
    seen.add(word);
    const rawLevel = String(item?.level || '').toUpperCase().trim();
    const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(rawLevel) ? rawLevel : 'B2';
    const confidenceRaw = Number(item?.confidence);
    const confidence = Number.isFinite(confidenceRaw) ? Math.max(1, Math.min(99, Math.round(confidenceRaw))) : 55;

    out.push({
      id: `${word}-${index}`,
      word,
      level,
      pos: normalizeWordTypeLabel(item?.pos || item?.word_type || ''),
      confidence,
      definition: String(item?.definition || 'Definition pending'),
      synonyms: Array.isArray(item?.synonyms) ? item.synonyms.filter(Boolean).slice(0, 4) : [],
      reasons: Array.isArray(item?.reasons) ? item.reasons.filter(Boolean).slice(0, 3) : [],
      frequency: Number(item?.frequency || 1) || 1,
    });
  });

  return out.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (b.frequency !== a.frequency) return b.frequency - a.frequency;
    return a.word.localeCompare(b.word);
  });
}

export default function PhotoVocabCaptureScreen({ navigation }) {
  const { addUserWord } = useAppState();
  const [asset, setAsset] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrSource, setOcrSource] = useState('');
  const [photoMinLevel, setPhotoMinLevel] = useState('B1');
  const [photoLimit, setPhotoLimit] = useState(12);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scan, setScan] = useState({ words: [], meta: null, source: '' });
  const [selected, setSelected] = useState({});
  const [feedback, setFeedback] = useState('');
  const selectedCount = useMemo(() => scan.words.filter((item) => selected[item.word]).length, [scan.words, selected]);
  const engineMeta = useMemo(() => getAiSourceMeta(scan.source || (ocrSource ? 'local-photo-ocr' : 'offline')), [scan.source, ocrSource]);

  const pickImage = async () => {
    try {
      const picked = await pickPhotoFromGallery();
      if (!picked) return;
      setAsset(picked);
      setOcrText('');
      setScan({ words: [], meta: null, source: '' });
      setSelected({});
      setFeedback('Photo selected. Run OCR to extract text.');
    } catch (err) {
      setFeedback(err?.message || 'Could not open gallery.');
    }
  };

  const runOcr = async () => {
    if (!asset) {
      setFeedback('Select a photo first.');
      return;
    }
    setOcrLoading(true);
    try {
      const result = await runPhotoOcr(asset);
      setOcrText(result.text || '');
      setOcrSource(result.source || 'ocr');
      setFeedback(`OCR completed (${result.meta?.lineCount || 0} lines).`);
    } catch (err) {
      setFeedback(err?.message || 'OCR failed.');
    } finally {
      setOcrLoading(false);
    }
  };

  const runVocabExtract = async () => {
    const text = String(ocrText || '').trim();
    if (!text) {
      setFeedback('No OCR text available. Run OCR first.');
      return;
    }

    setScanLoading(true);
    try {
      const payload = await requestDemoModule('photo_vocab_extract', {
        ocrText: text,
        minLevel: photoMinLevel,
        limit: photoLimit,
      });
      const words = normalizePhotoCandidates(payload?.words);
      const auto = {};
      words.forEach((item, index) => {
        if (item.confidence >= 72 || index < 4) auto[item.word] = true;
      });
      setSelected(auto);
      setScan({
        words,
        source: String(payload?.source || 'local-ranker'),
        meta: payload?.meta || {
          tokenCount: text.split(/\s+/).filter(Boolean).length,
          uniqueCount: words.length,
          keptCount: words.length,
        },
      });
      setFeedback(words.length ? `Extracted ${words.length} words.` : 'No academic candidates found.');
    } catch (err) {
      setFeedback(err?.message || 'Extraction failed.');
      setScan({ words: [], meta: null, source: '' });
      setSelected({});
    } finally {
      setScanLoading(false);
    }
  };

  const toggleWord = (word) => {
    setSelected((prev) => ({ ...prev, [word]: !prev[word] }));
  };

  const addSelected = () => {
    const picks = scan.words.filter((item) => selected[item.word]);
    if (!picks.length) {
      setFeedback('Select at least one word.');
      return;
    }
    picks.forEach((item) => addUserWord(item.word));
    setFeedback(`${picks.length} words added to My Words.`);
  };

  const applySample = (sample) => {
    setAsset(null);
    setOcrText(sample.text);
    setOcrSource('sample-text');
    setScan({ words: [], meta: null, source: '' });
    setSelected({});
    setFeedback(`${sample.label} loaded. Extract words when ready.`);
  };

  const selectHighConfidence = () => {
    const next = {};
    scan.words.forEach((item) => {
      if (item.confidence >= 72) next[item.word] = true;
    });
    setSelected(next);
    setFeedback(`${Object.keys(next).length} high-confidence words selected.`);
  };

  const selectAll = () => {
    const next = {};
    scan.words.forEach((item) => {
      next[item.word] = true;
    });
    setSelected(next);
    setFeedback(`${scan.words.length} words selected.`);
  };

  const clearAll = () => {
    setAsset(null);
    setOcrText('');
    setScan({ words: [], meta: null, source: '' });
    setSelected({});
    setFeedback('Cleared.');
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Card style={styles.heroCard} glow>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>OCR Tool</Text>
            <Text style={styles.heroTitle}>Turn a real photo into a shortlist of useful academic words.</Text>
            <Text style={styles.heroBody}>
              The workflow is simple: pick a photo, run OCR, filter by CEFR level, then add only the words worth keeping.
            </Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{scan.words.length || 0}</Text>
            <Text style={styles.heroMetricLabel}>Candidates</Text>
          </View>
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepChip}>1 Pick</Text>
          <Text style={styles.stepChip}>2 OCR</Text>
          <Text style={styles.stepChip}>3 Rank</Text>
          <Text style={styles.stepChip}>4 Save</Text>
        </View>
      </Card>

      <Card style={styles.workspaceCard}>
        <View style={styles.workspaceHead}>
          <View style={styles.workspaceCopy}>
            <Text style={styles.workspaceTitle}>{engineMeta.label}</Text>
            <Text style={styles.workspaceBody}>{engineMeta.detail}</Text>
          </View>
          <View style={styles.workspaceMetric}>
            <Text style={styles.workspaceMetricValue}>{selectedCount}</Text>
            <Text style={styles.workspaceMetricLabel}>Selected</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Button label="Use Sample OCR" variant="secondary" icon="document-text-outline" onPress={() => applySample(OCR_SAMPLES[0])} />
          <Button label="Vocab Hub" variant="ghost" icon="grid-outline" onPress={() => navigation.navigate('Vocab', { initialSection: 'Dictionary' })} />
          <Button label="Demo Hub" variant="ghost" icon="sparkles-outline" onPress={() => navigation.navigate('DemoFeatures')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
          {OCR_SAMPLES.map((sample) => (
            <TouchableOpacity key={sample.id} onPress={() => applySample(sample)} style={styles.presetChip}>
              <Text style={styles.presetChipText}>{sample.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h1}>Photo Vocabulary OCR</Text>
        <Text style={styles.sub}>Real image selection + OCR + vocabulary extraction.</Text>
        <View style={styles.row}>
          <Button label="Pick Photo" onPress={pickImage} />
          <Button label={ocrLoading ? 'Running OCR...' : 'Run OCR'} variant="secondary" onPress={runOcr} disabled={!asset || ocrLoading} />
          <Button label={scanLoading ? 'Extracting...' : 'Extract Words'} variant="secondary" onPress={runVocabExtract} disabled={!ocrText.trim() || scanLoading} />
          <Button label="Add Selected" variant="secondary" onPress={addSelected} disabled={!scan.words.length} />
          <Button label="Clear" variant="ghost" onPress={clearAll} />
        </View>

        {asset?.uri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: asset.uri }} style={styles.image} resizeMode="cover" />
          </View>
        ) : null}

        <Text style={styles.sub}>Min CEFR level</Text>
        <View style={styles.row}>
          {MIN_LEVELS.map((lv) => (
            <Chip key={`lv-${lv}`} label={lv} active={photoMinLevel === lv} onPress={() => setPhotoMinLevel(lv)} />
          ))}
        </View>

        <Text style={styles.sub}>Max extracted words</Text>
        <View style={styles.row}>
          {LIMITS.map((n) => (
            <Chip key={`limit-${n}`} label={String(n)} active={photoLimit === n} onPress={() => setPhotoLimit(n)} />
          ))}
        </View>

        <TextInput
          style={styles.textArea}
          value={ocrText}
          onChangeText={setOcrText}
          placeholder="OCR text will appear here..."
          placeholderTextColor={colors.muted}
          multiline
          autoCapitalize="none"
        />

        {(ocrLoading || scanLoading) ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>{ocrLoading ? 'Running OCR...' : 'Ranking vocabulary...'}</Text>
          </View>
        ) : null}

        {scan.meta ? (
          <Text style={styles.metaText}>
            OCR: {ocrSource || '--'} | Ranker: {scan.source || '--'} | Tokens: {scan.meta.tokenCount || 0} | Kept: {scan.meta.keptCount || scan.words.length}
          </Text>
        ) : null}
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      </Card>

      {(asset?.uri || scan.meta || scan.words.length > 0) ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.h3}>Scan Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{asset?.uri ? 'Ready' : 'None'}</Text>
              <Text style={styles.summaryLabel}>Photo</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{scan.meta?.tokenCount || 0}</Text>
              <Text style={styles.summaryLabel}>Tokens</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{scan.words.length}</Text>
              <Text style={styles.summaryLabel}>Kept</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{Object.keys(selected).filter((key) => selected[key]).length}</Text>
              <Text style={styles.summaryLabel}>Selected</Text>
            </View>
          </View>
        </Card>
      ) : null}

      {scan.words.length > 0 ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Detected Words</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
            <Text style={styles.smallTag}>{scan.words.length} words</Text>
            <Text style={styles.smallTag}>Selected: {selectedCount}</Text>
            <Text style={styles.smallTag}>Engine: {engineMeta.label}</Text>
          </ScrollView>
          <View style={styles.row}>
            <Button label="Select High Confidence" variant="secondary" onPress={selectHighConfidence} />
            <Button label="Select All" variant="ghost" onPress={selectAll} />
            <Button label="Add Selected" variant="ghost" onPress={addSelected} disabled={!selectedCount} />
          </View>

          <View style={styles.resultsWrap}>
            {scan.words.map((item) => {
              const isSelected = !!selected[item.word];
              return (
                <View key={item.id} style={[styles.resultCard, isSelected && styles.resultCardSelected]}>
                  <View style={styles.resultTop}>
                    <TouchableOpacity style={styles.wordRow} onPress={() => toggleWord(item.word)}>
                      <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={18} color={isSelected ? colors.primary : colors.muted} />
                      <Text style={styles.word}>{item.word}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => speakEnglish(item.word)} style={styles.speakBtn}>
                      <Ionicons name="volume-high-outline" size={15} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>{item.level}</Text>
                    <Text style={styles.badgeMuted}>{item.pos}</Text>
                    <Text style={styles.badge}>{item.confidence}%</Text>
                  </View>
                  <Text style={styles.def}>{item.definition}</Text>
                  {item.synonyms.length ? <Text style={styles.hint}>Synonyms: {item.synonyms.join(', ')}</Text> : null}
                  {item.reasons.length ? <Text style={styles.hint}>Why selected: {item.reasons.join(' | ')}</Text> : null}
                  <View style={styles.row}>
                    <Button label="Add Word" variant="secondary" onPress={() => addUserWord(item.word)} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  heroCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#0F3F7F',
    borderColor: '#0F3F7F',
  },
  workspaceCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#F8FBFF',
    borderColor: '#D7E4FA',
  },
  workspaceHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  workspaceMetricValue: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  workspaceMetricLabel: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
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
    minWidth: 88,
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
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stepChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    color: '#DBEAFE',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  card: {
    marginBottom: spacing.lg,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  h1: {
    fontSize: typography.h2,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  h3: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryBox: {
    flex: 1,
    minWidth: 96,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: 14,
    backgroundColor: '#F8FBFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetRow: {
    gap: spacing.xs,
    paddingBottom: 2,
  },
  presetChip: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  presetChipText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  imageWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: 200,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: spacing.md,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  loadingText: {
    fontSize: typography.small,
    color: colors.muted,
  },
  metaText: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  feedback: {
    fontSize: typography.small,
    color: colors.primaryDark,
  },
  resultsWrap: {
    gap: spacing.sm,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: spacing.sm,
  },
  resultCardSelected: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  resultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  word: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  speakBtn: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#EAF2FF',
    color: colors.primaryDark,
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  badgeMuted: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    color: colors.muted,
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  def: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: 4,
  },
  tagRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  smallTag: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
