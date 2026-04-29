import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useAppState } from '../context/AppState';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { buildRecommendedTask } from '../utils/studyPlan';
import { openExternalResource } from '../utils/externalLinks';

import baseTasks from '../../data/listening_tasks.json';
import hardTasks from '../../data/listening_tasks_hard.json';
import cslTasks from '../../data/careful_selective_tasks.json';
import podcasts from '../../data/listening_podcasts.json';

const tasks = [...baseTasks, ...hardTasks, ...cslTasks];
const LEVEL_OPTIONS = ['ALL', 'P1', 'P2', 'P3', 'P4'];
const TYPE_OPTIONS = [
  { key: 'ALL', label: 'All types' },
  { key: 'selective', label: 'Selective' },
  { key: 'careful', label: 'Careful' },
];

function pickWeakListeningType(listeningHistory = []) {
  const stats = { selective: { c: 0, t: 0 }, careful: { c: 0, t: 0 } };
  listeningHistory.forEach((item) => {
    const taskId = item?.result?.taskId;
    const task = tasks.find((entry) => entry.id === taskId);
    const type = task?.type;
    if (!type || !stats[type]) return;
    stats[type].c += Number(item?.result?.score || 0);
    stats[type].t += Number(item?.result?.total || 0);
  });
  const selective = stats.selective.t ? Math.round((stats.selective.c / stats.selective.t) * 100) : null;
  const careful = stats.careful.t ? Math.round((stats.careful.c / stats.careful.t) * 100) : null;
  if (selective == null && careful == null) return { weak: 'selective', selective: null, careful: null };
  if (selective == null) return { weak: 'selective', selective, careful };
  if (careful == null) return { weak: 'careful', selective, careful };
  return selective <= careful
    ? { weak: 'selective', selective, careful }
    : { weak: 'careful', selective, careful };
}

function clampWeekly(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
}

function matchesListeningType(task, typeFilter) {
  return typeFilter === 'ALL' || task?.type === typeFilter;
}

function formatListeningSkill(skill) {
  const raw = String(skill || '').replace(/_/g, ' ');
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getListeningFocus(task) {
  const unique = [];
  (task?.questions || []).forEach((question) => {
    const formatted = formatListeningSkill(question?.skill);
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

function FilterChip({ label, helper, active, onPress }) {
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

function CompactPracticeRow({ task, badges, onPress }) {
  const focus = getListeningFocus(task);
  return (
    <TouchableOpacity 
      accessibilityRole="button" 
      activeOpacity={0.9} 
      onPress={onPress} 
      style={styles.libraryRow}
      hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
    >
      <View style={styles.libraryRowBody}>
        <View style={styles.libraryHeaderRow}>
          <Text style={styles.libraryTitle}>{task.title}</Text>
          <Text style={styles.libraryOpen}>Open</Text>
        </View>
        <Text style={styles.libraryMeta}>{task.level} · {task.time} · {(task.questions || []).length} questions</Text>
        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <View key={`${task.id}-${badge}`} style={[styles.badge, styles.badgeBlue]}>
              <Text style={[styles.badgeText, styles.badgeBlueText]}>{badge}</Text>
            </View>
          ))}
          {focus.map((item) => (
            <View key={`${task.id}-${item}`} style={[styles.badge, styles.badgeSoft]}>
              <Text style={styles.badgeText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PodcastRow({ podcast, onPress }) {
  return (
    <TouchableOpacity 
      accessibilityRole="button" 
      activeOpacity={0.9} 
      onPress={onPress} 
      style={styles.libraryRow}
      hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
    >
      <View style={styles.libraryRowBody}>
        <View style={styles.libraryHeaderRow}>
          <Text style={styles.libraryTitle}>{podcast.title}</Text>
          <Text style={styles.libraryOpen}>Open</Text>
        </View>
        <Text style={styles.libraryMeta}>{podcast.source} · {podcast.duration} · {podcast.level}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeBlue]}>
            <Text style={[styles.badgeText, styles.badgeBlueText]}>{podcast.category}</Text>
          </View>
          <View style={[styles.badge, styles.badgeSoft]}>
            <Text style={styles.badgeText}>{podcast.focus}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ListeningScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const wideLayout = width >= 980 || width > height;

  const [levelFilter, setLevelFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [podcastFilter, setPodcastFilter] = useState('all');
  const [podcastQuery, setPodcastQuery] = useState('');
  const [mode, setMode] = useState('practice');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('LISTENING_LEVEL_FILTER');
        if (saved) setLevelFilter(saved);
      } catch (error) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('LISTENING_LEVEL_FILTER', levelFilter).catch(() => {});
  }, [levelFilter]);

  const { listeningHistory, level } = useAppState();
  const latest = listeningHistory[0]?.result;

  const lastTask = useMemo(() => {
    const id = listeningHistory[0]?.result?.taskId;
    return tasks.find((task) => task.id === id) || null;
  }, [listeningHistory]);

  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    listeningHistory.forEach((entry) => {
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
      attempts: listeningHistory.length,
    };
  }, [listeningHistory]);

  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const done = listeningHistory.filter((item) => {
      const created = new Date(item?.createdAt || 0);
      return Number.isFinite(created.getTime()) && created >= start;
    }).length;
    const target = 5;
    return { done, target, pct: Math.min(100, Math.round((done / target) * 100)) };
  }, [listeningHistory]);

  const typeStats = useMemo(() => pickWeakListeningType(listeningHistory), [listeningHistory]);

  const searchableTasks = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    const list = tasks.filter((task) => {
      const levelOk = levelFilter === 'ALL' || task.level === levelFilter;
      const queryOk = !lowerQuery || `${task.title} ${task.level} ${task.type}`.toLowerCase().includes(lowerQuery);
      return levelOk && queryOk;
    });
    return dedupeTasks(list);
  }, [levelFilter, query]);

  const filteredTasks = useMemo(
    () => searchableTasks.filter((task) => matchesListeningType(task, typeFilter)),
    [searchableTasks, typeFilter]
  );

  const rec = useMemo(() => buildRecommendedTask(filteredTasks, listeningHistory, level), [filteredTasks, listeningHistory, level]);

  const weakTypeTask = useMemo(
    () => filteredTasks.find((task) => task.type === typeStats.weak) || searchableTasks.find((task) => task.type === typeStats.weak) || tasks.find((task) => task.type === typeStats.weak) || null,
    [filteredTasks, searchableTasks, typeStats.weak]
  );

  const typeCounts = useMemo(() => ({
    all: searchableTasks.length,
    selective: searchableTasks.filter((task) => task.type === 'selective').length,
    careful: searchableTasks.filter((task) => task.type === 'careful').length,
  }), [searchableTasks]);

  const smartQueue = useMemo(() => {
    const weakFirst = filteredTasks.filter((task) => task.type === typeStats.weak);
    const fallback = filteredTasks.length ? filteredTasks : tasks;
    return [...weakFirst, ...fallback.filter((task) => !weakFirst.includes(task))].slice(0, 3);
  }, [filteredTasks, typeStats.weak]);

  const suggestedTasks = useMemo(
    () => dedupeTasks([rec?.task, weakTypeTask, lastTask, ...smartQueue].filter(Boolean)).slice(0, 4),
    [rec?.task, weakTypeTask, lastTask, smartQueue]
  );

  const groupedTasks = useMemo(() => ({
    selective: filteredTasks.filter((task) => task.type === 'selective'),
    careful: filteredTasks.filter((task) => task.type === 'careful'),
  }), [filteredTasks]);

  const podcastCategories = useMemo(
    () => ['all', ...Array.from(new Set(podcasts.map((podcast) => podcast.category)))],
    []
  );

  const filteredPodcasts = useMemo(
    () => podcasts.filter((podcast) => {
      const categoryOk = podcastFilter === 'all' || podcast.category === podcastFilter;
      const lowerQuery = podcastQuery.trim().toLowerCase();
      const queryOk = !lowerQuery || `${podcast.title} ${podcast.source} ${podcast.category} ${podcast.focus}`.toLowerCase().includes(lowerQuery);
      return categoryOk && queryOk;
    }),
    [podcastFilter, podcastQuery]
  );

  const featuredPodcasts = useMemo(() => {
    const picks = ['pod_news_up_first', 'pod_academic_ted_daily', 'pod_news_daily_nyt'];
    const list = picks.map((id) => podcasts.find((podcast) => podcast.id === id)).filter(Boolean);
    return list.length ? list : podcasts.slice(0, 3);
  }, []);

  const featuredPodcast = featuredPodcasts[0] || filteredPodcasts[0] || podcasts[0] || null;

  const listeningModel = useMemo(() => {
    const accuracy = stats.accuracy ?? 0;
    const selective = typeStats.selective ?? accuracy;
    const careful = typeStats.careful ?? accuracy;
    const consistency = clampWeekly(weeklyProgress.pct);
    const overall = Math.round((accuracy * 0.55) + (Math.min(selective, careful) * 0.25) + (consistency * 0.2));
    const band = overall >= 80 ? 'Strong B2' : overall >= 65 ? 'Developing B2' : overall >= 50 ? 'Strong B1' : 'Developing B1';
    return { overall, band };
  }, [stats.accuracy, typeStats.selective, typeStats.careful, weeklyProgress.pct]);
  const modelFocus = useMemo(() => {
    if ((stats.accuracy ?? 0) < 55) {
      return {
        title: 'Stabilize comprehension first',
        body: 'Ignore speed for a week. Use transcript-supported replay and write one main-idea sentence before answering.',
      };
    }
    if (typeStats.weak === 'selective') {
      return {
        title: 'Selective listening is the bottleneck',
        body: 'Practice lecture structure, paragraph purpose, and signposts before focusing on micro-detail.',
      };
    }
    if ((weeklyProgress.pct || 0) < 60) {
      return {
        title: 'Consistency is limiting the model',
        body: 'The score is not only accuracy. Hitting 5 listening sessions in 7 days will raise stability faster than one long session.',
      };
    }
    return {
      title: 'Move to harder evidence tracking',
      body: 'Main comprehension is usable. Push careful listening with qualifiers, cause-effect, and inference-heavy items.',
    };
  }, [stats.accuracy, typeStats.weak, weeklyProgress.pct]);

  const startTask = rec?.task || weakTypeTask || filteredTasks[0] || searchableTasks[0] || tasks[0] || null;
  const practiceFiltersActive = query.trim() || levelFilter !== 'ALL' || typeFilter !== 'ALL';
  const podcastFiltersActive = podcastQuery.trim() || podcastFilter !== 'all';

  const resetPracticeFilters = () => {
    setQuery('');
    setLevelFilter('ALL');
    setTypeFilter('ALL');
  };

  const resetPodcastFilters = () => {
    setPodcastQuery('');
    setPodcastFilter('all');
  };

  const handleOpenPodcast = useCallback((podcast) => {
    if (!podcast?.url) return;
    openExternalResource({
      url: podcast.url,
      title: podcast.title,
      navigation,
    });
  }, [navigation]);

  const renderPracticeBank = (bankKey, title, description) => {
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
              if (weakTypeTask?.id === task.id) badges.push('Weak focus');
              if (lastTask?.id === task.id) badges.push('Recent');
              return (
                <CompactPracticeRow
                  key={task.id}
                  task={task}
                  badges={badges}
                  onPress={() => navigation.navigate('ListeningDetail', { taskId: task.id })}
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
      <Text style={styles.h1}>Listening</Text>
      <Text style={styles.sub}>Lecture-style practice and real podcast input, organized to reduce scanning and shorten the path to action.</Text>

      <Card style={mode === 'practice' ? styles.heroCard : styles.heroCardDark} glow>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>{mode === 'practice' ? 'Listening Studio' : 'Podcast Lab'}</Text>
            <Text style={styles.heroTitle}>
              {mode === 'practice' ? 'Open the right task without hunting through the full bank.' : 'Use real podcasts for daily listening volume.'}
            </Text>
            <Text style={styles.heroBody}>
              {mode === 'practice'
                ? 'Recommended tasks, weak-skill targeting, and a compact library are all on one screen.'
                : 'Featured picks, category filters, and one-tap open actions make the podcast library practical.'}
            </Text>
          </View>
          <View style={styles.heroCounter}>
            <Text style={styles.heroCounterValue}>{mode === 'practice' ? tasks.length : podcasts.length}</Text>
            <Text style={styles.heroCounterLabel}>{mode === 'practice' ? 'Tasks' : 'Podcasts'}</Text>
          </View>
        </View>
        <View style={styles.modeRow}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setMode('practice')} style={[styles.modeChip, mode === 'practice' && styles.modeChipActive]}>
            <Text style={[styles.modeChipText, mode === 'practice' && styles.modeChipTextActive]}>Practice</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setMode('podcast')} style={[styles.modeChip, mode === 'podcast' && styles.modeChipActive]}>
            <Text style={[styles.modeChipText, mode === 'podcast' && styles.modeChipTextActive]}>Podcast lab</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroActionRow}>
          {mode === 'practice' ? (
            <>
              <Button
                label={startTask ? 'Start best next task' : 'Start practice'}
                icon="play"
                onPress={() => startTask && navigation.navigate('ListeningDetail', { taskId: startTask.id })}
                disabled={!startTask}
              />
              <Button label="Lecture lab" icon="mic-outline" variant="secondary" onPress={() => navigation.navigate('LectureListeningLab')} />
            </>
          ) : (
            <>
              <Button
                label={featuredPodcast ? 'Open featured podcast' : 'Open podcast'}
                icon="radio-outline"
                onPress={() => featuredPodcast && handleOpenPodcast(featuredPodcast)}
                disabled={!featuredPodcast}
              />
              <Button label="Back to practice" icon="headset-outline" variant="secondary" onPress={() => setMode('practice')} />
            </>
          )}
        </View>
      </Card>

      <View style={styles.metricRail}>
        <MetricTile value={latest ? `${latest.score}/${latest.total}` : '--'} label="Latest score" />
        <MetricTile value={stats.accuracy != null ? `${stats.accuracy}%` : '--'} label="Accuracy" accent="teal" />
        <MetricTile value={`${weeklyProgress.done}/${weeklyProgress.target}`} label="7-day mission" accent="amber" />
        <MetricTile value={typeStats.weak === 'selective' ? 'Selective' : 'Careful'} label="Weak zone" />
      </View>

      {mode === 'practice' ? (
        <>
          <Card style={styles.snapshotCard}>
            <View style={styles.snapshotHeader}>
              <View>
                <Text style={styles.h3}>Listening Snapshot</Text>
                <Text style={styles.snapshotSub}>Model score {listeningModel.overall}% · {listeningModel.band}</Text>
              </View>
              <Text style={styles.snapshotAttempts}>{stats.attempts} attempt{stats.attempts === 1 ? '' : 's'}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${weeklyProgress.pct}%` }]} />
            </View>
            <Text style={styles.subtleBody}>
              {typeStats.weak === 'selective'
                ? 'Selective listening is lagging. Focus on main ideas, signposts, and structure before drilling details.'
                : 'Careful listening is lagging. Focus on qualifiers, numbers, and evidence-heavy items until accuracy stabilizes.'}
            </Text>
            <View style={styles.modelFocusBox}>
              <Text style={styles.modelFocusTitle}>{modelFocus.title}</Text>
              <Text style={styles.modelFocusBody}>{modelFocus.body}</Text>
            </View>
          </Card>

          <Card style={styles.quickStartCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.h3}>Quick Start</Text>
                <Text style={styles.subtleBody}>Resume, follow the recommendation, or jump straight to the weak listening type.</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              {lastTask ? (
                <Button label="Resume last" icon="refresh" onPress={() => navigation.navigate('ListeningDetail', { taskId: lastTask.id })} />
              ) : null}
              {rec?.task ? (
                <Button label="Recommended" icon="sparkles-outline" variant="secondary" onPress={() => navigation.navigate('ListeningDetail', { taskId: rec.task.id })} />
              ) : null}
              {weakTypeTask ? (
                <Button
                  label={`Practice ${typeStats.weak}`}
                  icon="flash-outline"
                  variant="secondary"
                  onPress={() => navigation.navigate('ListeningDetail', { taskId: weakTypeTask.id })}
                />
              ) : null}
              <Button label="History" icon="time-outline" variant="ghost" onPress={() => navigation.navigate('ListeningHistory')} />
            </View>
            {rec?.reason ? <Text style={styles.meta}>Recommendation logic: {rec.reason}</Text> : null}
          </Card>

          <Card style={styles.controlsCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.h3}>Find the Right Listening Task</Text>
                <Text style={styles.subtleBody}>{filteredTasks.length} of {tasks.length} tasks visible</Text>
              </View>
              {practiceFiltersActive ? <Button label="Clear" variant="ghost" icon="close" onPress={resetPracticeFilters} /> : null}
            </View>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by title, level, or type"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
            />
            <Text style={styles.filterLabel}>Level</Text>
            <View style={styles.filterRow}>
              {LEVEL_OPTIONS.map((option) => (
                <FilterChip key={option} label={option} active={levelFilter === option} onPress={() => setLevelFilter(option)} />
              ))}
            </View>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.filterRow}>
              {TYPE_OPTIONS.map((option) => {
                const helper = option.key === 'ALL'
                  ? `${typeCounts.all}`
                  : option.key === 'selective'
                    ? `${typeCounts.selective}`
                    : `${typeCounts.careful}`;
                return (
                  <FilterChip
                    key={option.key}
                    label={option.label}
                    helper={helper}
                    active={typeFilter === option.key}
                    onPress={() => setTypeFilter(option.key)}
                  />
                );
              })}
            </View>
          </Card>

          <Card style={styles.suggestedCard}>
            <Text style={styles.h3}>Suggested Queue</Text>
            <Text style={styles.subtleBody}>High-value tasks ordered to cover the weak area first and keep the rest balanced.</Text>
            {suggestedTasks.length ? (
              <View style={styles.bankList}>
                {suggestedTasks.map((task) => {
                  const badges = [];
                  if (rec?.task?.id === task.id) badges.push('Recommended');
                  if (weakTypeTask?.id === task.id) badges.push('Weak focus');
                  if (lastTask?.id === task.id) badges.push('Resume');
                  if (!badges.length && task.type === typeStats.weak) badges.push('Queue');
                  return (
                    <CompactPracticeRow
                      key={`queue-${task.id}`}
                      task={task}
                      badges={badges}
                      onPress={() => navigation.navigate('ListeningDetail', { taskId: task.id })}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>No tasks match the current practice filter.</Text>
            )}
          </Card>

          <Text style={styles.section}>Practice Library</Text>
          {filteredTasks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.h3}>No listening tasks found</Text>
              <Text style={styles.subtleBody}>Reset the level or type filter to restore the full practice bank.</Text>
              <View style={styles.actionRow}>
                <Button label="Reset filters" icon="refresh" onPress={resetPracticeFilters} />
              </View>
            </Card>
          ) : (
            <View style={wideLayout ? styles.bankGrid : null}>
              {renderPracticeBank('selective', 'Selective Track', 'Focus on main ideas, lecture structure, and signposts.')}
              {renderPracticeBank('careful', 'Careful Track', 'Focus on evidence, qualifiers, numbers, and precise detail.')}
            </View>
          )}
        </>
      ) : (
        <>
          <Card style={styles.podcastFeaturedCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.h3}>Featured Podcast Picks</Text>
                <Text style={styles.subtleBody}>Start with short, reliable sources before moving into longer academic audio.</Text>
              </View>
            </View>
            <View style={styles.bankList}>
              {featuredPodcasts.map((podcast) => (
                <PodcastRow
                  key={`featured-${podcast.id}`}
                  podcast={podcast}
                  onPress={() => handleOpenPodcast(podcast)}
                />
              ))}
            </View>
          </Card>

          <Card style={styles.controlsCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.h3}>Filter Podcast Library</Text>
                <Text style={styles.subtleBody}>{filteredPodcasts.length} of {podcasts.length} podcasts visible</Text>
              </View>
              {podcastFiltersActive ? <Button label="Clear" variant="ghost" icon="close" onPress={resetPodcastFilters} /> : null}
            </View>
            <TextInput
              style={styles.input}
              value={podcastQuery}
              onChangeText={setPodcastQuery}
              placeholder="Search by title, source, or focus"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
            />
            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.filterRow}>
              {podcastCategories.map((category) => (
                <FilterChip
                  key={category}
                  label={category === 'all' ? 'All' : category}
                  active={podcastFilter === category}
                  onPress={() => setPodcastFilter(category)}
                />
              ))}
            </View>
          </Card>

          <Text style={styles.section}>Podcast Library</Text>
          {filteredPodcasts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.h3}>No podcasts found</Text>
              <Text style={styles.subtleBody}>Try a broader category or clear the current search term.</Text>
              <View style={styles.actionRow}>
                <Button label="Reset podcast filters" icon="refresh" onPress={resetPodcastFilters} />
              </View>
            </Card>
          ) : (
            <Card style={styles.bankCard}>
              <View style={styles.bankList}>
                {filteredPodcasts.map((podcast) => (
                  <PodcastRow
                    key={podcast.id}
                    podcast={podcast}
                    onPress={() => handleOpenPodcast(podcast)}
                  />
                ))}
              </View>
            </Card>
          )}
        </>
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
    color: colors.textOnDark,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: typography.small,
    color: colors.textOnDarkMuted,
    marginBottom: spacing.lg,
  },
  section: {
    fontSize: typography.small,
    color: colors.textOnDarkMuted,
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
    backgroundColor: '#0F4C81',
    borderColor: '#0F4C81',
  },
  heroCardDark: {
    marginBottom: spacing.lg,
    backgroundColor: '#0F172A',
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
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modeChipActive: {
    borderColor: '#BFDBFE',
    backgroundColor: 'rgba(191,219,254,0.18)',
  },
  modeChipText: {
    color: '#DBEAFE',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  modeChipTextActive: {
    color: '#FFFFFF',
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
  modelFocusBox: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: radius.md,
    backgroundColor: '#F8FBFF',
    padding: spacing.md,
  },
  modelFocusTitle: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  modelFocusBody: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 20,
  },
  quickStartCard: {
    marginBottom: spacing.lg,
  },
  controlsCard: {
    marginBottom: spacing.lg,
  },
  suggestedCard: {
    marginBottom: spacing.lg,
  },
  podcastFeaturedCard: {
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
  libraryRow: {
    borderWidth: 1,
    borderColor: '#D8E4F8',
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#FBFDFF',
  },
  libraryRowBody: {
    gap: spacing.xs,
  },
  libraryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  libraryTitle: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  libraryMeta: {
    fontSize: typography.small,
    color: colors.muted,
  },
  libraryOpen: {
    fontSize: typography.small,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  badgeRow: {
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
