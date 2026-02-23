import React, { useState, useEffect, useMemo } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

import baseTasks from '../../data/listening_tasks.json';
import hardTasks from '../../data/listening_tasks_hard.json';
import podcasts from '../../data/listening_podcasts.json';
import { useAppState } from '../context/AppState';
import { buildAdaptivePlan, buildRecommendedTask } from '../utils/studyPlan';

const tasks = [...baseTasks, ...hardTasks];

function pickWeakListeningType(listeningHistory = []) {
  const stats = { selective: { c: 0, t: 0 }, careful: { c: 0, t: 0 } };
  listeningHistory.forEach((item) => {
    const taskId = item?.result?.taskId;
    const task = tasks.find((t) => t.id === taskId);
    const type = task?.type;
    if (!type || !stats[type]) return;
    stats[type].c += Number(item?.result?.score || 0);
    stats[type].t += Number(item?.result?.total || 0);
  });
  const sel = stats.selective.t ? Math.round((stats.selective.c / stats.selective.t) * 100) : null;
  const car = stats.careful.t ? Math.round((stats.careful.c / stats.careful.t) * 100) : null;
  if (sel == null && car == null) return { weak: 'selective', selective: null, careful: null };
  if (sel == null) return { weak: 'selective', selective: sel, careful: car };
  if (car == null) return { weak: 'careful', selective: sel, careful: car };
  return sel <= car
    ? { weak: 'selective', selective: sel, careful: car }
    : { weak: 'careful', selective: sel, careful: car };
}

export default function ListeningScreen({ navigation }) {
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [podcastFilter, setPodcastFilter] = useState('all');
  const [podcastQuery, setPodcastQuery] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('LISTENING_LEVEL_FILTER');
        if (saved) setLevelFilter(saved);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('LISTENING_LEVEL_FILTER', levelFilter).catch(() => {});
  }, [levelFilter]);
  const { listeningHistory, readingHistory, grammarHistory, history, level } = useAppState();
  const latest = listeningHistory[0]?.result;
  const lastTask = useMemo(() => {
    const id = listeningHistory[0]?.result?.taskId;
    return tasks.find((t) => t.id === id) || null;
  }, [listeningHistory]);
  const stats = useMemo(() => {
    let correct = 0;
    let total = 0;
    listeningHistory.forEach((h) => {
      const s = Number(h?.result?.score || 0);
      const t = Number(h?.result?.total || 0);
      if (!t) return;
      correct += s;
      total += t;
    });
    const accuracy = total ? Math.round((correct / total) * 100) : null;
    return { correct, total, accuracy, attempts: listeningHistory.length };
  }, [listeningHistory]);
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const inWeek = listeningHistory.filter((item) => {
      const created = item?.createdAt;
      if (!created) return false;
      const d = new Date(created);
      return Number.isFinite(d.getTime()) && d >= start;
    });
    const target = 5;
    const done = inWeek.length;
    const pct = Math.min(100, Math.round((done / target) * 100));
    return { done, target, pct };
  }, [listeningHistory]);
  const adaptive = buildAdaptivePlan({
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    writingHistory: history
  });
  const rec = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = tasks.filter((t) => {
      const levelOk = levelFilter === 'ALL' || t.level === levelFilter;
      const queryOk = !q || `${t.title} ${t.level} ${t.type || ''}`.toLowerCase().includes(q);
      return levelOk && queryOk;
    });
    return buildRecommendedTask(pool, listeningHistory, level);
  }, [levelFilter, query, listeningHistory, level]);
  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const levelOk = levelFilter === 'ALL' || t.level === levelFilter;
      const queryOk = !q || `${t.title} ${t.level} ${t.type || ''}`.toLowerCase().includes(q);
      return levelOk && queryOk;
    });
  }, [levelFilter, query]);
  const typeStats = useMemo(() => pickWeakListeningType(listeningHistory), [listeningHistory]);
  const weakTypeTask = useMemo(
    () => filteredTasks.find((t) => t.type === typeStats.weak) || filteredTasks[0] || tasks[0],
    [filteredTasks, typeStats.weak]
  );
  const podcastCategories = useMemo(() => ['all', ...Array.from(new Set(podcasts.map((p) => p.category)))], []);
  const filteredPodcasts = useMemo(
    () => podcasts.filter((p) => {
      const catOk = podcastFilter === 'all' || p.category === podcastFilter;
      const q = podcastQuery.trim().toLowerCase();
      const queryOk = !q || `${p.title} ${p.source} ${p.category} ${p.focus}`.toLowerCase().includes(q);
      return catOk && queryOk;
    }),
    [podcastFilter, podcastQuery]
  );
  const featuredPodcasts = useMemo(() => {
    const picks = ['pod_news_up_first', 'pod_academic_ted_daily', 'pod_news_daily_nyt'];
    const list = picks.map((id) => podcasts.find((p) => p.id === id)).filter(Boolean);
    return list.length ? list : podcasts.slice(0, 3);
  }, []);
  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Listening</Text>
      <Text style={styles.sub}>Boğaziçi-style listening drills</Text>

      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>Tip</Text>
        <Text style={styles.bannerBody}>Focus on signpost phrases and key ideas, not every word.</Text>
      </Card>

      <Card style={styles.podcastHeroCard}>
        <Text style={styles.podcastHeroTitle}>Podcast Spotlight</Text>
        <Text style={styles.podcastHeroSub}>Gerçek podcastlerle günlük dinleme rutini başlat.</Text>
        <View style={styles.row}>
          <Button
            label="Open Featured Podcast"
            onPress={() => navigation.navigate('WebViewer', { title: featuredPodcasts[0]?.title || 'Podcast', url: featuredPodcasts[0]?.url })}
          />
          <Button
            label="Podcast Lab"
            variant="secondary"
            onPress={() => {
              setPodcastFilter('all');
              setPodcastQuery('');
            }}
          />
        </View>
        <View style={styles.featuredList}>
          {featuredPodcasts.map((p) => (
            <TouchableOpacity
              key={`featured-${p.id}`}
              style={styles.featuredItem}
              onPress={() => navigation.navigate('WebViewer', { title: p.title, url: p.url })}
            >
              <View style={styles.featuredLeft}>
                <Text style={styles.featuredTitle}>{p.title}</Text>
                <Text style={styles.featuredMeta}>{p.source} • {p.duration} • {p.level}</Text>
              </View>
              <Text style={styles.featuredOpen}>Open</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>


      <Card style={styles.card}>
        <Text style={styles.h3}>Filter by Level</Text>
        <View style={styles.filterRow}>
          {['ALL','P1','P2','P3','P4'].map((lv) => (
            <Text
              key={lv}
              onPress={() => setLevelFilter(lv)}
              style={[styles.filterChip, levelFilter === lv && styles.filterChipActive]}
            >
              {lv}
            </Text>
          ))}
        </View>
        <Text style={styles.sub}>Showing {filteredTasks.length} task(s)</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Find Task</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Latest Score</Text>
        <Text style={styles.body}>{latest ? `${latest.score}/${latest.total}` : 'No attempts yet'}</Text>
      </Card>
      {lastTask ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Continue Last Task</Text>
          <Text style={styles.body}>{lastTask.title}</Text>
          <Button label="Continue" onPress={() => navigation.navigate('ListeningDetail', { taskId: lastTask.id })} />
        </Card>
      ) : null}
      <Card style={styles.card}>
        <Text style={styles.h3}>Listening Accuracy</Text>
        <Text style={styles.body}>{stats.accuracy != null ? `${stats.accuracy}%` : 'No attempts yet'}</Text>
        <Text style={styles.sub}>Attempts: {stats.attempts} • Total Qs: {stats.total}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>7-Day Listening Mission</Text>
        <Text style={styles.body}>Completed: {weeklyProgress.done}/{weeklyProgress.target} sets</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${weeklyProgress.pct}%` }]} />
        </View>
        <Text style={styles.sub}>Target: keep at least 5 listening sets per week.</Text>
        <View style={styles.row}>
          <Button label="Lecture Lab" variant="secondary" onPress={() => navigation.navigate('LectureListeningLab')} />
          <Button label="Listening History" variant="secondary" onPress={() => navigation.navigate('ListeningHistory')} />
        </View>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Recommended For You</Text>
        <Text style={styles.body}>{adaptive.focusTitle}</Text>
        <Text style={styles.sub}>{adaptive.focusAction}</Text>
        {rec?.task ? (
          <>
            <Text style={styles.sub}>{rec.reason}</Text>
            <Button label={`Start: ${rec.task.title}`} onPress={() => navigation.navigate('ListeningDetail', { taskId: rec.task.id })} />
          </>
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Strategy Coach</Text>
        <Text style={styles.body}>
          Weak mode: {typeStats.weak}
          {typeStats.selective != null ? ` • Selective ${typeStats.selective}%` : ''}
          {typeStats.careful != null ? ` • Careful ${typeStats.careful}%` : ''}
        </Text>
        <Text style={styles.sub}>
          {typeStats.weak === 'careful'
            ? 'Train detail tracking: qualifiers, numbers, names, and evidence.'
            : 'Train gist tracking: main claim, speaker intention, and conclusion.'}
        </Text>
        <Button
          label={`Practice ${typeStats.weak}`}
          onPress={() => navigation.navigate('ListeningDetail', { taskId: weakTypeTask?.id })}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Quick Start</Text>
        <Text style={styles.body}>Start the first listening task immediately.</Text>
        <Button label="Start Listening" onPress={() => navigation.navigate('ListeningDetail', { taskId: filteredTasks[0]?.id || tasks[0]?.id })} />
      </Card>


      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Selective Listening</Text>
        <Text style={styles.infoBody}>Focus on main ideas, key claims, and signpost phrases. Skip minor details.</Text>
      </Card>

      <Text style={styles.section}>Selective Listening</Text>
      {filteredTasks.filter((t) => t.type === 'selective').map((t) => (
        <Card key={t.id} style={styles.card}>
          <Text style={styles.h3}>{t.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.body}>Level {t.level} • {t.time}</Text>
            <Text style={[styles.typeBadge, styles.typeSelective]}>Selective</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.tag}>10 Qs</Text>
            <Text style={styles.tag}>Transcript</Text>
          </View>
          <Button label="Start" onPress={() => navigation.navigate('ListeningDetail', { taskId: t.id })} />
        </Card>
      ))}


      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Careful Listening</Text>
        <Text style={styles.infoBody}>Track details, qualifiers, and evidence. Accuracy matters more than speed.</Text>
      </Card>

      <Text style={styles.section}>Careful Listening</Text>
      {filteredTasks.filter((t) => t.type === 'careful').map((t) => (
        <Card key={t.id} style={styles.card}>
          <Text style={styles.h3}>{t.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.body}>Level {t.level} • {t.time}</Text>
            <Text style={[styles.typeBadge, styles.typeCareful]}>Careful</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.tag}>10 Qs</Text>
            <Text style={styles.tag}>Transcript</Text>
          </View>
          <Button label="Start" onPress={() => navigation.navigate('ListeningDetail', { taskId: t.id })} />
        </Card>
      ))}

      <Card style={styles.podcastIntroCard}>
        <Text style={styles.podcastTitle}>Podcast Listening Lab</Text>
        <Text style={styles.podcastBody}>
          News + academic podcast kaynakları ile gerçek hayatta listening pratiği yap.
        </Text>
        <TextInput
          style={styles.input}
          value={podcastQuery}
          onChangeText={setPodcastQuery}
          placeholder="Search podcasts..."
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />
        <View style={styles.filterRow}>
          {podcastCategories.map((cat) => (
            <Text
              key={cat}
              onPress={() => setPodcastFilter(cat)}
              style={[styles.filterChip, podcastFilter === cat && styles.filterChipActive]}
            >
              {cat}
            </Text>
          ))}
        </View>
      </Card>

      <Text style={styles.section}>Podcasts</Text>
      {filteredPodcasts.length === 0 ? (
        <Card style={styles.card}>
          <Text style={styles.body}>No podcasts found for this filter.</Text>
        </Card>
      ) : null}
      {filteredPodcasts.map((p) => (
        <Card key={p.id} style={styles.card}>
          <Text style={styles.h3}>{p.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.body}>{p.source}</Text>
            <Text style={styles.typeBadge}>{p.category}</Text>
          </View>
          <Text style={styles.sub}>Level: {p.level} • {p.duration}</Text>
          <Text style={styles.podcastFocus}>Focus: {p.focus}</Text>
          <Button
            label="Open Podcast"
            onPress={() => navigation.navigate('WebViewer', { title: p.title, url: p.url })}
          />
        </Card>
      ))}

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  banner: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline
  },
  bannerBody: {
    color: '#DDE8FF',
    marginTop: spacing.xs,
    fontSize: typography.body
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  section: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  card: {
    marginBottom: spacing.lg
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  filterChip: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999
  },
  filterChipActive: {
    backgroundColor: colors.primaryDark,
    color: '#FFFFFF'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text
  },
  infoCard: {
    marginBottom: spacing.md,
    borderStyle: 'dashed'
  },
  podcastIntroCard: {
    marginBottom: spacing.md,
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  podcastHeroCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#0F172A',
    borderColor: '#1E3A8A',
  },
  podcastHeroTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: '#93C5FD',
    marginBottom: spacing.xs,
  },
  podcastHeroSub: {
    fontSize: typography.small,
    color: '#DBEAFE',
    marginBottom: spacing.sm,
  },
  featuredList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  featuredItem: {
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderRadius: 10,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  featuredLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  featuredTitle: {
    fontSize: typography.body,
    color: '#F8FAFC',
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  featuredMeta: {
    fontSize: typography.xsmall,
    color: '#94A3B8',
  },
  featuredOpen: {
    fontSize: typography.small,
    color: '#60A5FA',
    fontFamily: typography.fontHeadline,
  },
  podcastTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: '#312E81',
    marginBottom: spacing.xs,
  },
  podcastBody: {
    fontSize: typography.small,
    color: '#4338CA',
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
  podcastFocus: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs
  },
  infoBody: {
    fontSize: typography.small,
    color: colors.muted
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: typography.small
  },
  typeSelective: {
    backgroundColor: '#E0F2FE',
    color: '#075985'
  },
  typeCareful: {
    backgroundColor: '#DCFCE7',
    color: '#166534'
  },
  tag: {
    backgroundColor: colors.secondary,
    color: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999
  }
});
