import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, useWindowDimensions, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow, radius } from '../theme/tokens';
import baseTasks from '../../data/grammar_tasks.json';
import hardTasks from '../../data/grammar_tasks_hard.json';
import testEnglishTasks from '../../data/test_english_grammar_tasks.json';
import { useAppState } from '../context/AppState';

const tasks = [...baseTasks, ...hardTasks, ...testEnglishTasks].map((item) => {
  const id = String(item?.id || '');
  const title = String(item?.title || '');
  const explain = String(item?.explain || '');
  const isTestEnglish = id.startsWith('g_te_');
  const isUoe = id.includes('_uoe_') || /use of english/i.test(title);
  return {
    ...item,
    _search: `${title} ${explain}`.toLowerCase(),
    _isTestEnglish: isTestEnglish,
    _isUoe: isUoe,
  };
});

// UI Modules matching ReadingScreen
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
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
        {helper ? <Text style={[styles.filterChipHelper, active && styles.filterChipHelperActive]}>{helper}</Text> : null}
      </TouchableOpacity>
    );
}

export default function GrammarScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const { grammarHistory, grammarErrors } = useAppState();
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const preset = String(route?.params?.preset || '').toLowerCase();
    if (preset === 'test_english') {
      setScopeFilter('TEST_ENGLISH');
      return;
    }
    if (preset === 'use_of_english') {
      setScopeFilter('UOE');
      return;
    }
    setScopeFilter('ALL');
  }, [route?.params?.preset]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(queryInput);
    }, 120);
    return () => clearTimeout(handle);
  }, [queryInput]);

  const scopeCounts = useMemo(() => {
    const testEnglish = tasks.filter((t) => t._isTestEnglish).length;
    const uoe = tasks.filter((t) => t._isUoe).length;
    return {
      all: tasks.length,
      standard: tasks.length - testEnglish,
      testEnglish,
      uoe,
    };
  }, []);

  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    grammarHistory.forEach((h) => {
      const s = Number(h?.result?.score || 0);
      const t = Number(h?.result?.total || 0);
      if (!t) return;
      correct += s;
      total += t;
    });
    const accuracy = total ? Math.round((correct / total) * 100) : null;
    return { correct, total, accuracy, attempts: grammarHistory.length };
  }, [grammarHistory]);

  const latestTask = useMemo(() => {
    const latestId = grammarHistory[0]?.result?.taskId;
    return tasks.find((item) => item.id === latestId) || null;
  }, [grammarHistory]);

  const weakTopics = useMemo(() => {
    return Object.entries(grammarErrors || {})
      .map(([id, item]) => ({
        id,
        title: String(item?.title || '').trim() || id,
        count: Number(item?.count || 0),
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
      .slice(0, 4);
  }, [grammarErrors]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const levelOk = levelFilter === 'ALL' || t.level === levelFilter;
      const q = query.trim().toLowerCase();
      const queryOk = !q || (t._search || '').includes(q);
      const isTestEnglish = t._isTestEnglish;
      const isUoe = t._isUoe;
      const scopeOk = scopeFilter === 'ALL'
        || (scopeFilter === 'STANDARD' && !isTestEnglish)
        || (scopeFilter === 'TEST_ENGLISH' && isTestEnglish)
        || (scopeFilter === 'UOE' && isUoe);
      return levelOk && queryOk && scopeOk;
    });
  }, [levelFilter, query, scopeFilter]);

  const resetFilters = useCallback(() => {
    setLevelFilter('ALL');
    setScopeFilter('ALL');
    setQueryInput('');
    setQuery('');
  }, []);

  const startTask = filtered[0] || tasks[0] || null;

  const renderItem = useCallback(({ item }) => {
    const questions = item.questions || [];
    const hasCloze = questions.some((q) => q.type === 'cloze');
    return (
      <View style={[styles.taskItemWrap, isWide && styles.taskItemWrapWide]}>
         <TouchableOpacity 
            accessibilityRole="button" 
            activeOpacity={0.9} 
            onPress={() => navigation.navigate('GrammarDetail', { taskId: item.id })} 
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={styles.taskRow}
        >
            <View style={styles.taskRowBody}>
                <View style={styles.taskRowHeader}>
                    <Text style={styles.taskRowTitle}>{item.title}</Text>
                    <Text style={styles.taskRowOpen}>Practice</Text>
                </View>
                <Text style={styles.taskRowMeta}>{item.level} · {item.time} · {questions.length} questions</Text>
                
                <View style={styles.taskBadgeRow}>
                    <View style={[styles.badge, styles.badgeBlue]}>
                        <Text style={[styles.badgeText, styles.badgeBlueText]}>{item.difficulty || 'core'}</Text>
                    </View>
                    <View style={[styles.badge, hasCloze ? styles.badgeGreen : styles.badgeSoft]}>
                        <Text style={[styles.badgeText, hasCloze ? styles.badgeGreenText : {}]}>{hasCloze ? 'Cloze' : 'MCQ'}</Text>
                    </View>
                    {item._isTestEnglish && (
                        <View style={[styles.badge, styles.badgeAmber]}>
                            <Text style={[styles.badgeText, styles.badgeAmberText]}>Test English</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.taskExplainLine} numberOfLines={1}>{item.explain}</Text>
            </View>
        </TouchableOpacity>
      </View>
    );
  }, [isWide, navigation]);

  const renderEmpty = useCallback(() => (
    <Card style={styles.card}>
      <Text style={styles.emptyTitle}>No tasks match current filters</Text>
      <Text style={styles.emptySub}>Try resetting level/scope filters or clear the search text.</Text>
      <Button label="Reset Filters" variant="secondary" onPress={resetFilters} />
    </Card>
  ), [resetFilters]);

  const renderListHeader = useCallback(() => (
    <View style={styles.headerSpacer}>
      <Text style={styles.h1}>Grammar</Text>
      <Text style={styles.sub}>Targeted grammar practice with filters and quick history access.</Text>
      <Card style={styles.heroCard} glow>
        <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
                <Ionicons name="create-outline" size={24} color="#BFDBFE" />
            </View>
            <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>Grammar Studio</Text>
                <Text style={styles.heroTitle}>Master Use of English and advanced rules.</Text>
                <Text style={styles.heroBody}>Use the filters to lock to a level or Use of English bank.</Text>
            </View>
            <View style={styles.heroCounter}>
                <Text style={styles.heroCounterValue}>{tasks.length}</Text>
                <Text style={styles.heroCounterLabel}>Modules</Text>
            </View>
        </View>
        <View style={styles.heroActionRow}>
          <Button
            label="Start Practice"
            icon="play"
            onPress={() => startTask && navigation.navigate('GrammarDetail', { taskId: startTask.id })}
            disabled={!startTask}
          />
          <Button
            label="Use of English"
            icon="book-outline"
            variant="secondary"
            onPress={() => setScopeFilter('UOE')}
          />
        </View>
      </Card>

      <View style={styles.metricGrid}>
          <MetricTile value={stats.accuracy != null ? `${stats.accuracy}%` : '--'} label="Accuracy" accent="blue" />
          <MetricTile value={String(stats.attempts)} label="Attempts" accent="teal" />
          <MetricTile value={String(stats.total)} label="Questions" accent="amber" />
      </View>

      <Card style={styles.card}>
        <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Library & Filters</Text>
        </View>
        
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            value={queryInput}
            onChangeText={setQueryInput}
            placeholder="Search tense, relative clauses..."
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
          />
          {queryInput.length > 0 ? (
            <TouchableOpacity onPress={() => setQueryInput('')}>
              <Ionicons name="close-circle" size={17} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.chipScroll}>
          {['ALL', 'P1', 'P2', 'P3', 'P4'].map((lv) => (
              <FilterChip 
                  key={lv} 
                  label={lv === 'ALL' ? 'All Levels' : lv} 
                  active={levelFilter === lv} 
                  onPress={() => setLevelFilter(lv)} 
              />
          ))}
        </View>

        <View style={[styles.chipScroll, styles.chipScrollTop]}>
          <FilterChip label="All Scope" helper={scopeCounts.all} active={scopeFilter === 'ALL'} onPress={() => setScopeFilter('ALL')} />
          <FilterChip label="Standard" helper={scopeCounts.standard} active={scopeFilter === 'STANDARD'} onPress={() => setScopeFilter('STANDARD')} />
          <FilterChip label="Use of English" helper={scopeCounts.uoe} active={scopeFilter === 'UOE'} onPress={() => setScopeFilter('UOE')} />
          <FilterChip label="Test-English" helper={scopeCounts.testEnglish} active={scopeFilter === 'TEST_ENGLISH'} onPress={() => setScopeFilter('TEST_ENGLISH')} />
        </View>

        <View style={styles.actionRow}>
            {latestTask ? (
                <Button label="Resume Last Test" icon="play-circle-outline" onPress={() => navigation.navigate('GrammarDetail', { taskId: latestTask.id })} style={styles.actionFlexBtn} />
            ) : null}
        </View>

        {weakTopics.length > 0 && (
            <View style={styles.weakTopicsBanner}>
                <Ionicons name="warning-outline" size={16} color="#B45309" />
                <Text style={styles.weakTopicsLabel}>Suggested reviews:</Text>
                <View style={styles.weakTopicChips}>
                    {weakTopics.map(item => (
                        <TouchableOpacity key={item.id} onPress={() => setQueryInput(item.title)} style={styles.weakNode}>
                            <Text style={styles.weakNodeText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        )}
      </Card>
      
      <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>{filtered.length} Grammar Modules Visible</Text>
      </View>
    </View>
  ), [navigation, startTask, stats, queryInput, levelFilter, scopeFilter, scopeCounts, weakTopics, filtered.length, latestTask]);

  return (
    <Screen scroll={false}>
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.container}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'grid' : 'list'}
        columnWrapperStyle={isWide ? styles.columnWrapper : null}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        windowSize={5}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  headerSpacer: {
    paddingTop: spacing.md,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: spacing.xxl + 84,
    paddingHorizontal: spacing.lg,
  },
  listContentWide: {
    paddingHorizontal: spacing.xl,
  },
  columnWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemWrap: {
    marginBottom: 12,
  },
  itemWrapWide: {
    width: '48%',
  },
  
  // Hero Widget Style
  heroCard: {
    backgroundColor: '#172554',
    borderColor: '#172554',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadow.premium,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    color: '#BFDBFE',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
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
    alignItems: 'center',
  },
  heroCounterValue: {
    fontSize: 30,
    lineHeight: 34,
    color: '#F59E0B',
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
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

  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    position: 'relative',
    overflow: 'hidden',
  },
  metricAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  metricAccentBlue: { backgroundColor: '#1D4ED8' },
  metricAccentTeal: { backgroundColor: '#0D9488' },
  metricAccentAmber: { backgroundColor: '#D97706' },
  metricValue: {
    fontSize: 20,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Library Card
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    ...shadow.sm,
  },
  sectionHead: {
      marginBottom: spacing.md,
  },
  sectionTitle: {
      fontSize: 18,
      fontFamily: typography.fontHeadline,
      fontWeight: '800',
      color: '#0F172A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  
  // Chips
  chipScroll: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
  },
  chipScrollTop: {
      marginTop: 8,
  },
  filterChip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#D8E4F8',
  },
  filterChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterChipHelper: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.muted,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  filterChipHelperActive: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: '#FFFFFF',
  },

  actionRow: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
  },
  actionFlexBtn: {
      flex: 1,
  },

  weakTopicsBanner: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: '#FFFBEB',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FEF3C7',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
  },
  weakTopicsLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#92400E',
      marginRight: 4,
  },
  weakTopicChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
  },
  weakNode: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#FDE68A',
  },
  weakNodeText: {
      fontSize: 12,
      color: '#B45309',
      fontWeight: '600',
  },

  listHeaderRow: {
      marginBottom: spacing.sm,
      paddingHorizontal: 4,
  },
  listHeaderTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#64748B',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },

  // Task Items
  taskItemWrap: {
      flex: 1,
      marginBottom: spacing.md,
  },
  taskRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadow.sm,
    overflow: 'hidden',
  },
  taskRowBody: {
    padding: spacing.lg,
  },
  taskRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskRowTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 12,
  },
  taskRowOpen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  taskRowMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSoft: { backgroundColor: '#F1F5F9' },
  badgeBlue: { backgroundColor: '#EFF6FF' },
  badgeBlueText: { color: '#1D4ED8' },
  badgeGreen: { backgroundColor: '#ECFDF5' },
  badgeGreenText: { color: '#047857' },
  badgeAmber: { backgroundColor: '#FFFBEB' },
  badgeAmberText: { color: '#B45309' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskExplainLine: {
      fontSize: 13,
      color: '#475569',
      fontStyle: 'italic',
  },

  emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#0F172A',
      marginBottom: 8,
  },
  emptySub: {
      fontSize: 14,
      color: '#64748B',
      marginBottom: 16,
  }
});
