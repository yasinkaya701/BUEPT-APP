import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, ScrollView, Modal, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography, shadow, radius } from '../theme/tokens';
import prompts from '../../data/writing_prompts.json';
import { useAppState } from '../context/AppState';
import { loadDraft } from '../utils/essayStorage';

const TYPES = ['opinion', 'definition', 'cause_effect', 'problem_solution', 'compare_contrast', 'argumentative', 'reaction'];
const TASKS = ['paragraph', 'essay'];

const START_PATHS = [
  { key: 'paragraph', title: 'Fast Paragraph', desc: 'Short opinion writing with a clean start.', params: { initialTask: 'paragraph', initialType: 'opinion' } },
  { key: 'essay', title: 'Timed Essay', desc: 'Longer exam-style writing with timing.', params: { initialTask: 'essay', initialType: 'argumentative' } },
];

function formatLabel(value = '') {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

// UI Modules matching ReadingScreen & GrammarScreen
function MetricTile({ value, label, accent = 'blue' }) {
    return (
      <View style={styles.metricTile}>
        <View style={[styles.metricAccent, accent === 'teal' ? styles.metricAccentTeal : accent === 'amber' ? styles.metricAccentAmber : styles.metricAccentBlue]} />
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    );
}

function FilterChip({ label, active, onPress, helper }) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.filterChip, active && styles.filterChipActive]}
      >
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
        {helper ? <Text style={[styles.filterChipHelper, active && styles.filterChipHelperActive]}>{helper}</Text> : null}
      </TouchableOpacity>
    );
}

// Mocking static data if the file isn't created yet
const FALLBACK_EXPRESSIONS = [
    { category: 'Stating Your Opinion', items: ['From my perspective,', 'I implicitly believe that', 'It is my firm conviction that'] },
    { category: 'Adding Information', items: ['Furthermore,', 'Moreover,', 'In addition to this,'] },
    { category: 'Showing Contrast', items: ['Nevertheless,', 'Conversely,', 'In stark contrast to'] },
    { category: 'Concluding', items: ['To summarize,', 'All things considered,', 'Taking everything into account,'] }
];

export default function WritingScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const { favoritePrompts, essayText } = useAppState();
  
  const [type, setType] = useState(null);
  const [task, setTask] = useState(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [savedDraft, setSavedDraft] = useState('');
  
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadDraft().then((draft) => { if (mounted) setSavedDraft(draft || ''); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQuery(queryInput), 200);
    return () => clearTimeout(t);
  }, [queryInput]);

  const filtered = useMemo(() => {
    return prompts.filter((item) => {
      // Intentionally ignoring Level here to show more prompts to users, they are usually universal
      if (type && item.type !== type) return false;
      if (task && item.task !== task) return false;
      if (query && !String(item.prompt || '').toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [type, task, query]);

  const promptLibrary = useMemo(() => filtered.slice(0, 15), [filtered]);
  const resumeDraft = (savedDraft || essayText || '').trim();

  const openPromptItem = useCallback((item) => {
    if (!item?.prompt) return;
    navigation.navigate('WritingEditor', { prompt: item.prompt, promptMeta: item });
  }, [navigation]);

  const startWithCustomPrompt = useCallback(() => {
    const next = customPrompt.trim();
    if (!next) return;
    navigation.navigate('WritingEditor', { prompt: next });
  }, [customPrompt, navigation]);

  const renderItem = ({ item }) => (
      <View style={styles.taskItemWrap}>
          <TouchableOpacity
              style={styles.promptCard}
              onPress={() => openPromptItem(item)}
              activeOpacity={0.9}
          >
              <View style={styles.promptBadges}>
                  <View style={styles.badgeSoft}><Text style={styles.badgeText}>{formatLabel(item.task)}</Text></View>
                  <View style={styles.badgeBlue}><Text style={[styles.badgeText, styles.badgeBlueText]}>{formatLabel(item.type)}</Text></View>
              </View>
              <Text style={styles.promptText}>{item.prompt}</Text>
          </TouchableOpacity>
      </View>
  );

  const renderEmpty = () => (
      <Card style={styles.card}>
          <Text style={styles.emptyText}>No prompts match your filters.</Text>
          <Button label="Clear Filters" variant="secondary" onPress={() => { setType(null); setTask(null); setQueryInput(''); setQuery(''); }} />
      </Card>
  );

  return (
    <>
    <Screen scroll contentStyle={styles.container}>
        <View style={styles.headerSpacer}>
            <Text style={styles.h1}>Writing</Text>
            <Text style={styles.sub}>Topic selection, quick templates, and a clean prompt library in one place.</Text>
            <Card style={styles.heroCard} glow>
                <View style={styles.heroTopRow}>
                    <View style={styles.heroIconWrap}>
                        <Ionicons name="document-text-outline" size={24} color="#BFDBFE" />
                    </View>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Writing Studio</Text>
                        <Text style={styles.heroTitle}>Draft, review, and perfect your essays.</Text>
                        <Text style={styles.heroBody}>Start with a template or jump to a filtered prompt set.</Text>
                    </View>
                    <View style={styles.heroCounter}>
                        <Text style={styles.heroCounterValue}>{prompts.length}</Text>
                        <Text style={styles.heroCounterLabel}>Topics</Text>
                    </View>
                </View>

                <View style={styles.heroActionRow}>
                    <Button
                        label="Start Writing"
                        icon="create-outline"
                        onPress={() => navigation.navigate('WritingEditor')}
                    />
                    <Button label="Academic Expressions" icon="library-outline" variant="secondary" onPress={() => setShowTemplates(true)} />
                </View>
            </Card>

        <View style={styles.metricGrid}>
            <MetricTile value={resumeDraft ? 'Ready' : 'None'} label="Saved Draft" accent="amber" />
            <MetricTile value={String(favoritePrompts.length)} label="Favorites" accent="teal" />
            <MetricTile value={promptLibrary.length} label="Visible" accent="blue" />
        </View>

        {resumeDraft ? (
            <Card style={styles.resumeCard}>
                <View style={styles.resumeHeader}>
                    <Ionicons name="time-outline" size={18} color="#D97706" />
                    <Text style={styles.resumeTitle}>Resume Previous Draft</Text>
                </View>
                <Text style={styles.resumePreview} numberOfLines={2}>{resumeDraft}</Text>
                <Button 
                    label="Continue Writing" 
                    variant="secondary" 
                    icon="arrow-forward-outline"
                    onPress={() => navigation.navigate('WritingEditor', { draftText: resumeDraft })}
                />
            </Card>
        ) : null}

        <View style={[styles.grid, isWide && styles.gridWide]}>
            <Card style={styles.card}>
                <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Custom Topic</Text>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your own essay topic..."
                    value={customPrompt}
                    onChangeText={setCustomPrompt}
                    placeholderTextColor={colors.muted}
                />
                <View style={styles.actionRow}>
                    <Button label="Start Custom" onPress={startWithCustomPrompt} disabled={!customPrompt.trim()} />
                    <Button label="Blank Page" variant="secondary" onPress={() => navigation.navigate('WritingEditor')} />
                </View>
            </Card>

            <Card style={styles.card}>
                <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Quick Starts</Text>
                </View>
                {START_PATHS.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.pathRow}
                        onPress={() => navigation.navigate('WritingEditor', item.params)}
                    >
                        <View style={styles.pathIconWrap}>
                            <Ionicons name="flash-outline" size={16} color={colors.primaryDark} />
                        </View>
                        <View style={styles.pathCopy}>
                            <Text style={styles.pathTitle}>{item.title}</Text>
                            <Text style={styles.pathDesc}>{item.desc}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </Card>
        </View>

        <Card style={styles.card}>
            <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Prompt Library</Text>
            </View>
            
            <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    value={queryInput}
                    onChangeText={setQueryInput}
                    placeholder="Search topics..."
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.chipScroll}>
                <FilterChip label="All Types" active={!type} onPress={() => setType(null)} />
                {TYPES.map(t => (
                    <FilterChip key={t} label={formatLabel(t)} active={type === t} onPress={() => setType(t)} />
                ))}
            </View>

            <View style={[styles.chipScroll, styles.chipScrollTop]}>
                <FilterChip label="All Tasks" active={!task} onPress={() => setTask(null)} />
                {TASKS.map(t => (
                    <FilterChip key={t} label={formatLabel(t)} active={task === t} onPress={() => setTask(t)} />
                ))}
            </View>
        </Card>
        
        <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>{promptLibrary.length} Prompts Visible</Text>
        </View>

        {promptLibrary.length === 0 ? renderEmpty() : (
            <View style={[styles.listContent, isWide && styles.listContentWide]}>
                <View style={isWide ? styles.columnWrapper : null}>
                    {promptLibrary.map((item, index) => (
                        <View key={`prompt-${index}`} style={[styles.promptItemWrap, isWide && styles.promptItemWrapWide]}>
                            {renderItem({ item })}
                        </View>
                    ))}
                </View>
            </View>
        )}
      </View>
    </Screen>

    {/* Academic Expressions Modal */}
    <Modal visible={showTemplates} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTemplates(false)}>
        <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Academic Expressions</Text>
                <TouchableOpacity onPress={() => setShowTemplates(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalIntro}>Use these sophisticated transition signals and expressions to structure your BUEPT essay effectively.</Text>
                
                {FALLBACK_EXPRESSIONS.map((section, idx) => (
                    <View key={idx} style={styles.templateSection}>
                        <Text style={styles.templateCategory}>{section.category}</Text>
                        {section.items.map((expr, eIdx) => (
                            <View key={eIdx} style={styles.exprRow}>
                                <Ionicons name="checkmark-circle" size={18} color="#10B981" style={styles.checkIcon} />
                                <Text style={styles.exprText}>{expr}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerSpacer: { paddingTop: spacing.md },
  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: typography.body, color: colors.muted, marginBottom: spacing.md, lineHeight: 20 },
  listContent: { paddingBottom: spacing.xxl + 84, paddingHorizontal: spacing.lg },
  listContentWide: { paddingHorizontal: spacing.xl },
  columnWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  promptItemWrap: { marginBottom: 12 },
  promptItemWrapWide: { width: '48%' },
  
  // Hero Widget
  heroCard: { 
    backgroundColor: '#172554', 
    borderColor: '#172554', 
    borderWidth: 1, 
    borderRadius: 16, 
    padding: spacing.xl, 
    marginBottom: spacing.md, 
    ...shadow.md 
  },
  heroTopRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: spacing.md, 
    marginBottom: spacing.md 
  },
  heroIconWrap: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  heroCopy: { flex: 1 },
  heroEyebrow: { 
    fontSize: typography.xsmall, 
    fontFamily: typography.fontHeadline, 
    color: '#BFDBFE', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: spacing.xs 
  },
  heroTitle: { 
    fontSize: typography.h2, 
    fontFamily: typography.fontHeadline, 
    color: '#FFFFFF', 
    marginBottom: spacing.xs 
  },
  heroBody: {
    fontSize: typography.small,
    color: '#DBEAFE',
    lineHeight: 20,
  },
  
  heroCounter: { 
    minWidth: 90, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.sm, 
    borderRadius: radius.lg, 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.16)', 
    alignItems: 'center' 
  },
  heroCounterValue: { 
    fontSize: 28, 
    lineHeight: 32, 
    color: '#FFFFFF', 
    fontFamily: typography.fontHeadline 
  },
  heroCounterLabel: { 
    marginTop: 2, 
    fontSize: typography.xsmall, 
    color: '#BFDBFE', 
    textTransform: 'uppercase' 
  },

  heroActionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionFlexBtn: { flex: 1 },
  
  // Metric Tiles
  metricGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  metricTile: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: '#D7E4FA', position: 'relative', overflow: 'hidden' },
  metricAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  metricAccentBlue: { backgroundColor: '#1D4ED8' },
  metricAccentTeal: { backgroundColor: '#14B8A6' },
  metricAccentAmber: { backgroundColor: '#F59E0B' },
  metricValue: { fontSize: 20, fontFamily: typography.fontHeadline, fontWeight: '800', color: colors.primaryDark, marginBottom: 2 },
  metricLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Cards & Layout
  grid: { gap: spacing.md },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  card: { flex: 1, marginBottom: spacing.md, backgroundColor: '#FFFFFF', borderRadius: 16, borderColor: '#E2E8F0', borderWidth: 1, padding: spacing.lg, ...shadow.sm },
  sectionHead: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: typography.fontHeadline, fontWeight: '800', color: '#0F172A' },
  
  // Resume Block
  resumeCard: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.md, ...shadow.sm },
  resumeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  resumeTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
  resumePreview: { fontSize: 14, color: '#B45309', fontStyle: 'italic', marginBottom: 12, lineHeight: 20 },

  // Inputs & Search
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 12, borderWidth: 1, borderColor: '#CBD5E1', fontSize: 15, color: '#0F172A', marginBottom: spacing.md },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: spacing.md },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#0F172A', padding: 0 },

  // Filter Chips
  chipScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipScrollTop: { marginTop: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: '#D8E4F8' },
  filterChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  
  // Path Rows (Quick Starts)
  pathRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  checkIcon: { marginTop: 2 },
  pathIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pathCopy: { flex: 1, justifyContent: 'center' },
  pathTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  pathDesc: { fontSize: 12, color: '#64748B' },

  listHeaderRow: { marginBottom: spacing.sm, paddingHorizontal: 4 },
  listHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Prompt Library list
  taskItemWrap: { flex: 1, marginBottom: spacing.md },
  promptCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, ...shadow.slight },
  promptBadges: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  badgeSoft: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeBlue: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeBlueText: { color: '#1D4ED8' },
  promptText: { fontSize: 15, color: '#1E293B', lineHeight: 22 },
  emptyText: { fontSize: 15, color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 20, fontFamily: typography.fontHeadline, fontWeight: '800', color: '#0F172A' },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: '#1D4ED8' },
  modalScroll: { flex: 1 },
  modalContent: { padding: spacing.lg, paddingBottom: 60 },
  modalIntro: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 24 },
  templateSection: { marginBottom: 24, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', ...shadow.slight },
  templateCategory: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  exprRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  exprText: { fontSize: 15, color: '#334155', flex: 1, lineHeight: 22, fontWeight: '500' }
});
