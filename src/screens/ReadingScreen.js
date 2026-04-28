import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Text, StyleSheet, View, TextInput, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useAppState } from '../context/AppState';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { buildReadingSnapshot } from '../utils/readingModel';
import { buildRecommendedTask } from '../utils/studyPlan';
import { openExternalResource } from '../utils/externalLinks';

import baseTasks from '../../data/reading_tasks.json';
import hardTasks from '../../data/reading_tasks_hard.json';
import clozeTasks from '../../data/reading_cloze.json';

const tasks = [...baseTasks, ...hardTasks, ...clozeTasks];
const LEVEL_OPTIONS = ['ALL', 'P1', 'P2', 'P3', 'P4'];
const FORMAT_OPTIONS = [
  { key: 'ALL', label: 'All formats' },
  { key: 'comprehension', label: 'Comprehension' },
  { key: 'cloze', label: 'Cloze' },
];
const NEWS_SOURCES = [
  {
    key: 'reuters',
    title: 'Reuters World',
    body: 'Fast, neutral reporting for scanning headlines and extracting core facts.',
    url: 'https://www.reuters.com/world/',
    focus: 'Headline scanning',
  },
  {
    key: 'bbc',
    title: 'BBC News World',
    body: 'Good for main idea, discourse flow, and paragraph-level comprehension.',
    url: 'https://www.bbc.com/news/world',
    focus: 'Main idea',
  },
  {
    key: 'ap',
    title: 'AP News World',
    body: 'Useful for short reports where detail tracking and evidence spotting matter.',
    url: 'https://apnews.com/world-news',
    focus: 'Detail tracking',
  },
  {
    key: 'conversation',
    title: 'The Conversation',
    body: 'Longer explainers with more academic tone and denser argument structure.',
    url: 'https://theconversation.com/global/topics/education-174',
    focus: 'Academic tone',
  },
];

function pickWeakReadingMode(history = []) {
  const stats = {
    cloze: { c: 0, t: 0 },
    comprehension: { c: 0, t: 0 },
  };
  history.forEach((item) => {
    const result = item?.result;
    const taskId = result?.taskId;
    const score = Number(result?.score || 0);
    const total = Number(result?.total || 0);
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task || !total) return;
    const key = isClozeTask(task) ? 'cloze' : 'comprehension';
    stats[key].c += score;
    stats[key].t += total;
  });
  const clozePct = stats.cloze.t ? Math.round((stats.cloze.c / stats.cloze.t) * 100) : null;
  const compPct = stats.comprehension.t ? Math.round((stats.comprehension.c / stats.comprehension.t) * 100) : null;
  if (clozePct == null && compPct == null) return { weak: 'comprehension', clozePct: null, compPct: null };
  if (clozePct == null) return { weak: 'cloze', clozePct, compPct };
  if (compPct == null) return { weak: 'comprehension', clozePct, compPct };
  return clozePct <= compPct
    ? { weak: 'cloze', clozePct, compPct }
    : { weak: 'comprehension', clozePct, compPct };
}

function isClozeTask(task) {
  return (task?.questions || []).some((question) => question.type === 'cloze');
}

function matchesFormat(task, formatFilter) {
  if (formatFilter === 'ALL') return true;
  if (formatFilter === 'cloze') return isClozeTask(task);
  return !isClozeTask(task);
}

function getFormatLabel(task) {
  return isClozeTask(task) ? 'Cloze' : 'Comprehension';
}

function formatWeakLabel(value) {
  return value === 'cloze' ? 'Cloze repair' : 'Evidence reading';
}

function formatSkillLabel(skill) {
  const raw = String(skill || '').replace(/_/g, ' ');
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFocusSkills(task) {
  const unique = [];
  (task?.questions || []).forEach((question) => {
    const formatted = formatSkillLabel(question?.skill);
    if (formatted && !unique.includes(formatted)) unique.push(formatted);
  });
  return unique.slice(0, 2);
}

function dedupeTasks(list) {
  const seen = new Set();
  return list.filter((task) => {
    if (!task?.id || seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });
}

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
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
      {helper ? <Text style={[styles.filterChipHelper, active && styles.filterChipHelperActive]}>{helper}</Text> : null}
    </TouchableOpacity>
  );
}

function TaskRow({ task, badges, onPress }) {
  const focus = getFocusSkills(task);
  return (
    <TouchableOpacity 
      accessibilityRole="button" 
      activeOpacity={0.9} 
      onPress={onPress} 
      style={styles.taskRow}
      hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
    >
      <View style={styles.taskRowBody}>
        <View style={styles.taskRowHeader}>
          <Text style={styles.taskRowTitle}>{task.title}</Text>
          <Text style={styles.taskRowOpen}>Open</Text>
        </View>
        <Text style={styles.taskRowMeta}>
          {task.level} · {task.time} · {(task.questions || []).length} questions · {getFormatLabel(task)}
        </Text>
        <View style={styles.taskBadgeRow}>
          {badges.map((badge) => (
            <View key={`${task.id}-${badge}`} style={[styles.badge, styles.badgeBlue]}>
              <Text style={[styles.badgeText, styles.badgeBlueText]}>{badge}</Text>
            </View>
          ))}
          {focus.map((skill) => (
            <View key={`${task.id}-${skill}`} style={[styles.badge, styles.badgeSoft]}>
              <Text style={styles.badgeText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}


export default function ReadingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const wideLayout = isLandscape || width >= 980;
  const { readingHistory, level } = useAppState();
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('READING_LEVEL_FILTER');
        if (saved) setLevelFilter(saved);
      } catch (error) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('READING_LEVEL_FILTER', levelFilter).catch(() => {});
  }, [levelFilter]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(queryInput), 200);
    return () => clearTimeout(t);
  }, [queryInput]);

  const latest = readingHistory[0]?.result;
  const lastTask = useMemo(() => {
    const id = readingHistory[0]?.result?.taskId;
    return tasks.find((task) => task.id === id) || null;
  }, [readingHistory]);

  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    readingHistory.forEach((entry) => {
      const score = Number(entry?.result?.score || 0);
      const count = Number(entry?.result?.total || 0);
      if (!count) return;
      correct += score;
      total += count;
    });
    return {
      correct,
      total,
      accuracy: total ? Math.round((correct / total) * 100) : null,
      attempts: readingHistory.length,
    };
  }, [readingHistory]);

  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const done = readingHistory.filter((item) => {
      const createdAt = new Date(item?.createdAt || 0);
      return Number.isFinite(createdAt.getTime()) && createdAt >= start;
    }).length;
    const target = 5;
    return { done, target, pct: Math.min(100, Math.round((done / target) * 100)) };
  }, [readingHistory]);

  const modeStats = useMemo(() => pickWeakReadingMode(readingHistory), [readingHistory]);

  const searchableTasks = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const levelOk = levelFilter === 'ALL' || task.level === levelFilter;
      const queryOk = !lowerQuery || `${task.title} ${task.level} ${getFormatLabel(task)}`.toLowerCase().includes(lowerQuery);
      return levelOk && queryOk;
    });
  }, [levelFilter, query]);

  const filtered = useMemo(
    () => searchableTasks.filter((task) => matchesFormat(task, formatFilter)),
    [searchableTasks, formatFilter]
  );

  const formatCounts = useMemo(() => ({
    all: searchableTasks.length,
    comprehension: searchableTasks.filter((task) => !isClozeTask(task)).length,
    cloze: searchableTasks.filter((task) => isClozeTask(task)).length,
  }), [searchableTasks]);

  const rec = useMemo(() => buildRecommendedTask(filtered, readingHistory, level), [filtered, readingHistory, level]);

  const weakModeTask = useMemo(() => {
    if (modeStats.weak === 'cloze') {
      return filtered.find((task) => isClozeTask(task)) || searchableTasks.find((task) => isClozeTask(task)) || tasks.find((task) => isClozeTask(task)) || null;
    }
    return filtered.find((task) => !isClozeTask(task)) || searchableTasks.find((task) => !isClozeTask(task)) || tasks.find((task) => !isClozeTask(task)) || null;
  }, [filtered, searchableTasks, modeStats.weak]);

  const quickModes = useMemo(() => ({
    cloze: filtered.find((task) => isClozeTask(task)) || searchableTasks.find((task) => isClozeTask(task)) || null,
    comprehension: filtered.find((task) => !isClozeTask(task)) || searchableTasks.find((task) => !isClozeTask(task)) || null,
  }), [filtered, searchableTasks]);

  const readingSnapshot = useMemo(
    () => buildReadingSnapshot({
      accuracy: stats.accuracy ?? 0,
      clozePct: modeStats.clozePct ?? stats.accuracy ?? 0,
      compPct: modeStats.compPct ?? stats.accuracy ?? 0,
      weeklyPct: weeklyProgress.pct,
    }),
    [stats.accuracy, modeStats.clozePct, modeStats.compPct, weeklyProgress.pct]
  );

  const startTask = rec?.task || weakModeTask || filtered[0] || searchableTasks[0] || tasks[0] || null;
  const suggestedTasks = useMemo(
    () => dedupeTasks([rec?.task, weakModeTask, quickModes.comprehension, quickModes.cloze].filter(Boolean)),
    [rec?.task, weakModeTask, quickModes.comprehension, quickModes.cloze]
  );

  const groupedTasks = useMemo(() => ({
    comprehension: filtered.filter((task) => !isClozeTask(task)),
    cloze: filtered.filter((task) => isClozeTask(task)),
  }), [filtered]);

  const activeFilters = query.trim() || levelFilter !== 'ALL' || formatFilter !== 'ALL';
  const filterSummary = `${filtered.length} of ${tasks.length} tasks visible`;

  const handleReset = () => {
    setQuery('');
    setLevelFilter('ALL');
    setFormatFilter('ALL');
  };

  const handleOpenNewsSource = useCallback((item) => {
    if (!item?.url) return;
    openExternalResource({
      url: item.url,
      title: item.title,
      navigation,
    });
  }, [navigation]);

  const renderBank = (bankKey, title, description) => {
    const list = groupedTasks[bankKey];
    if (!list.length) return null;
    return (
      <View key={bankKey} style={wideLayout ? styles.bankColumn : null}>
        <Card style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <View style={styles.bankHeaderCopy}>
              <Text style={styles.bankTitle}>{title}</Text>
              <Text style={styles.bankDescription}>{description}</Text>
            </View>
            <View style={styles.bankCountPill}>
              <Text style={styles.bankCountText}>{list.length}</Text>
            </View>
          </View>
          <View style={styles.bankList}>
            {list.map((task) => {
              const badges = [];
              if (rec?.task?.id === task.id) badges.push('Recommended');
              if (weakModeTask?.id === task.id) badges.push('Weak focus');
              if (lastTask?.id === task.id) badges.push('Recent');
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  badges={badges}
                  onPress={() => navigation.navigate('ReadingDetail', { taskId: task.id })}
                />
              );
            })}
          </View>
        </Card>
      </View>
    );
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Reading</Text>
      <Text style={styles.sub}>Academic text practice with clearer entry points, faster filtering, and better weak-skill targeting.</Text>

      <Card style={styles.heroCard} glow>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Reading Studio</Text>
            <Text style={styles.heroTitle}>Start the right passage in one tap.</Text>
            <Text style={styles.heroBody}>
              {wideLayout
                ? 'Wide layout is active. Practice banks stay easier to scan in side-by-side sections.'
                : 'Mobile layout is active. Rotate the device to split the banks and compare formats faster.'}
            </Text>
          </View>
          <View style={styles.heroCounter}>
            <Text style={styles.heroCounterValue}>{tasks.length}</Text>
            <Text style={styles.heroCounterLabel}>Passages</Text>
          </View>
        </View>
        <View style={styles.heroActionRow}>
          <Button
            label={startTask ? 'Start best next task' : 'Start practice'}
            icon="play"
            onPress={() => startTask && navigation.navigate('ReadingDetail', { taskId: startTask.id })}
            disabled={!startTask}
          />
          <Button label="History" icon="time-outline" variant="secondary" onPress={() => navigation.navigate('ReadingHistory')} />
        </View>
      </Card>

      <View style={styles.metricRail}>
        <MetricTile value={latest ? `${latest.score}/${latest.total}` : '--'} label="Latest score" />
        <MetricTile value={stats.accuracy != null ? `${stats.accuracy}%` : '--'} label="Accuracy" accent="teal" />
        <MetricTile value={`${weeklyProgress.done}/${weeklyProgress.target}`} label="7-day mission" accent="amber" />
        <MetricTile value={formatWeakLabel(modeStats.weak)} label="Weak zone" />
      </View>

      <Card style={styles.snapshotCard}>
        <View style={styles.snapshotHeader}>
          <View>
            <Text style={styles.h3}>Reading Snapshot</Text>
            <Text style={styles.snapshotSub}>Model score {readingSnapshot.overall}% · {readingSnapshot.band}</Text>
          </View>
          <Text style={styles.snapshotAttempts}>{stats.attempts} attempt{stats.attempts === 1 ? '' : 's'}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${weeklyProgress.pct}%` }]} />
        </View>
        <Text style={styles.subtleBody}>
          {modeStats.weak === 'cloze'
            ? 'Weakest area is cloze repair. Prioritize gap-fill passages until your fill accuracy catches up.'
            : 'Weakest area is evidence-based comprehension. Prioritize direct reading questions before adding more cloze work.'}
        </Text>
      </Card>

      <Card style={styles.quickStartCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.h3}>Quick Start</Text>
            <Text style={styles.subtleBody}>Use the shortest path to resume, follow the recommendation, or attack the weak area directly.</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          {lastTask ? (
            <Button label="Resume last" icon="refresh" onPress={() => navigation.navigate('ReadingDetail', { taskId: lastTask.id })} />
          ) : null}
          {rec?.task ? (
            <Button label="Recommended" variant="secondary" icon="sparkles-outline" onPress={() => navigation.navigate('ReadingDetail', { taskId: rec.task.id })} />
          ) : null}
          {weakModeTask ? (
            <Button
              label={`Practice ${modeStats.weak === 'cloze' ? 'cloze' : 'evidence'}`}
              variant="secondary"
              icon="flash-outline"
              onPress={() => navigation.navigate('ReadingDetail', { taskId: weakModeTask.id })}
            />
          ) : null}
          <Button
            label="Comprehension"
            variant="ghost"
            icon="document-text-outline"
            onPress={() => quickModes.comprehension && navigation.navigate('ReadingDetail', { taskId: quickModes.comprehension.id })}
            disabled={!quickModes.comprehension}
          />
          <Button
            label="Cloze"
            variant="ghost"
            icon="create-outline"
            onPress={() => quickModes.cloze && navigation.navigate('ReadingDetail', { taskId: quickModes.cloze.id })}
            disabled={!quickModes.cloze}
          />
        </View>
        {rec?.reason ? <Text style={styles.meta}>Recommendation logic: {rec.reason}</Text> : null}
      </Card>

      <View style={styles.newsSectionContainer}>
        <View style={styles.newsSectionHeader}>
          <Text style={styles.newsSectionTitle}>Live News Practice</Text>
          <Text style={styles.newsSectionSubtitle}>
            Read one live article daily. Mark unknown words, study the context, and summarize.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsScrollContent}>
          {NEWS_SOURCES.map((item) => (
            (() => {
              const isDarkCard = item.key === 'bbc' || item.key === 'conversation';
              return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.9}
              style={[styles.premiumNewsCard, item.key === 'bbc' && styles.premiumNewsCardBBC, item.key === 'conversation' && styles.premiumNewsCardConv]}
              onPress={() => handleOpenNewsSource(item)}
            >
              <View style={styles.premiumNewsTop}>
                <Ionicons 
                    name={item.key === 'bbc' ? "earth" : item.key === 'reuters' ? "newspaper" : "library"} 
                    size={22} 
                    color={isDarkCard ? "#FFFFFF" : colors.primaryDark} 
                />
                <Text style={[styles.premiumNewsName, isDarkCard && styles.premiumNewsNameLight]}>
                    {item.title}
                </Text>
              </View>
              
              <Text style={[styles.premiumNewsBody, isDarkCard && styles.premiumNewsBodyLight]} numberOfLines={3}>
                {item.body}
              </Text>

              <View style={styles.premiumNewsFooter}>
                  <View style={[styles.premiumNewsBadge, isDarkCard && styles.premiumNewsBadgeLight]}>
                      <Text style={[styles.premiumNewsBadgeText, isDarkCard && styles.premiumNewsBadgeTextLight]}>{item.focus}</Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color={isDarkCard ? "#FFFFFF" : colors.primary} />
              </View>
            </TouchableOpacity>
              );
            })()
          ))}
        </ScrollView>
      </View>

      <Card style={styles.controlsCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.h3}>Find the Right Passage</Text>
            <Text style={styles.subtleBody}>{filterSummary}</Text>
          </View>
          {activeFilters ? <Button label="Clear" variant="ghost" icon="close" onPress={handleReset} /> : null}
        </View>
        <TextInput
          style={styles.input}
          value={queryInput}
          onChangeText={setQueryInput}
          placeholder="Search by title, level, or format"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />
        <Text style={styles.filterLabel}>Level</Text>
        <View style={styles.filterRow}>
          {LEVEL_OPTIONS.map((option) => (
            <FilterChip key={option} label={option} active={levelFilter === option} onPress={() => setLevelFilter(option)} />
          ))}
        </View>
        <Text style={styles.filterLabel}>Format</Text>
        <View style={styles.filterRow}>
          {FORMAT_OPTIONS.map((option) => {
            const helper = option.key === 'ALL'
              ? `${formatCounts.all}`
              : option.key === 'cloze'
                ? `${formatCounts.cloze}`
                : `${formatCounts.comprehension}`;
            return (
              <FilterChip
                key={option.key}
                label={option.label}
                helper={helper}
                active={formatFilter === option.key}
                onPress={() => setFormatFilter(option.key)}
              />
            );
          })}
        </View>
      </Card>

      <Card style={styles.suggestedCard}>
        <Text style={styles.h3}>Suggested Paths</Text>
        <Text style={styles.subtleBody}>Three high-value starting points based on your history and the current filters.</Text>
        {suggestedTasks.length ? (
          <View style={styles.bankList}>
            {suggestedTasks.map((task) => {
              const badges = [];
              if (rec?.task?.id === task.id) badges.push('Recommended');
              if (weakModeTask?.id === task.id) badges.push('Weak focus');
              if (lastTask?.id === task.id) badges.push('Resume');
              return (
                <TaskRow
                  key={`suggested-${task.id}`}
                  task={task}
                  badges={badges}
                  onPress={() => navigation.navigate('ReadingDetail', { taskId: task.id })}
                />
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No suggestions match the current filter set.</Text>
        )}
      </Card>

      <Text style={styles.section}>Practice Library</Text>
      {filtered.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.h3}>No tasks found</Text>
          <Text style={styles.subtleBody}>Reset the level or format filter to bring the full reading bank back.</Text>
          <View style={styles.actionRow}>
            <Button label="Reset filters" icon="refresh" onPress={handleReset} />
          </View>
        </Card>
      ) : (
        <View style={wideLayout ? styles.bankGrid : null}>
          {renderBank('comprehension', 'Comprehension Bank', 'Direct evidence, inference, tone, and summary questions.')}
          {renderBank('cloze', 'Cloze Bank', 'Gap-fill passages for vocabulary precision and local coherence.')}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  section: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#172554',
    borderColor: '#172554',
  },
  heroHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  metricTile: {
    flexGrow: 1,
    flexBasis: 148,
    minHeight: 94,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  metricAccent: {
    width: 34,
    height: 4,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  metricAccentBlue: {
    backgroundColor: colors.primary,
  },
  metricAccentTeal: {
    backgroundColor: colors.accent,
  },
  metricAccentAmber: {
    backgroundColor: '#F59E0B',
  },
  metricValue: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  snapshotCard: {
    marginBottom: spacing.lg,
  },
  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  snapshotSub: {
    fontSize: typography.small,
    color: colors.muted,
  },
  snapshotAttempts: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  subtleBody: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 20,
  },
  quickStartCard: {
    marginBottom: spacing.lg,
  },
  newsHubCard: {
    marginBottom: spacing.lg,
  },
  controlsCard: {
    marginBottom: spacing.lg,
  },
  suggestedCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  newsSectionContainer: {
    marginBottom: spacing.lg,
  },
  newsSectionHeader: {
    marginBottom: spacing.md,
  },
  newsSectionTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  newsSectionSubtitle: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 20,
  },
  newsScrollContent: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  premiumNewsCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    minHeight: 180,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  premiumNewsCardBBC: {
    backgroundColor: '#B91C1C', // Dark BBC Red
    borderColor: '#991B1B',
  },
  premiumNewsCardConv: {
    backgroundColor: '#0F172A', // Slate 900
    borderColor: '#1E293B',
  },
  premiumNewsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  premiumNewsName: {
    fontSize: 16,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: '#0F172A',
  },
  premiumNewsNameLight: {
    color: '#FFFFFF',
  },
  premiumNewsBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  premiumNewsBodyLight: {
    color: 'rgba(255,255,255,0.85)',
  },
  premiumNewsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumNewsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumNewsBadgeLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  premiumNewsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumNewsBadgeTextLight: {
    color: '#FFFFFF',
  },
  newsRoutineText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  meta: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: '#D8E4F8',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterChipText: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipHelper: {
    marginTop: 1,
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  filterChipHelperActive: {
    color: '#DBEAFE',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  bankColumn: {
    width: '50%',
    paddingHorizontal: 6,
  },
  bankCard: {
    marginBottom: spacing.lg,
  },
  bankHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bankHeaderCopy: {
    flex: 1,
  },
  bankTitle: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  bankDescription: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 20,
  },
  bankCountPill: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  bankCountText: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  bankList: {
    gap: spacing.sm,
  },
  taskRow: {
    borderWidth: 1,
    borderColor: '#D8E4F8',
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#FBFDFF',
  },
  taskRowBody: {
    gap: spacing.xs,
  },
  taskRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  taskRowTitle: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  taskRowOpen: {
    fontSize: typography.small,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  taskRowMeta: {
    fontSize: typography.small,
    color: colors.muted,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeSoft: {
    backgroundColor: '#EEF4FF',
  },
  badgeBlue: {
    backgroundColor: '#E0ECFF',
  },
  badgeText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  badgeBlueText: {
    color: '#1D4ED8',
  },
  emptyCard: {
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.small,
    color: colors.muted,
  },
});
