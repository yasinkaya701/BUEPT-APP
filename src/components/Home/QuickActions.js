import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing, typography } from '../../theme/tokens';
import { useAppState } from '../../context/AppState';
import { buildAdaptivePlan } from '../../utils/studyPlan';

const WEAK_ACTION_MAP = {
  reading: { label: 'Train Reading', route: 'Reading', icon: 'book-outline', bg: '#EEF4FF', iconColor: '#1D4ED8' },
  listening: { label: 'Train Listening', route: 'Listening', icon: 'headset-outline', bg: '#ECFDF3', iconColor: '#166534' },
  grammar: { label: 'Train Grammar', route: 'Grammar', icon: 'flash-outline', bg: '#FEF3C7', iconColor: '#92400E' },
  writing: { label: 'Write Now', route: 'Writing', icon: 'create-outline', bg: '#FFF7ED', iconColor: '#9A3412' },
};

const FALLBACK_ACTION = {
  label: 'Resources',
  route: 'Resources',
  icon: 'library-outline',
  bg: '#F8FAFC',
  iconColor: '#334155',
  meta: 'Browse support',
};

function latestTimestamp(items = []) {
  const raw = items?.[0]?.createdAt;
  const parsed = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function QuickActions({ navigation }) {
  const {
    level,
    history,
    readingHistory,
    listeningHistory,
    grammarHistory,
    reviews,
  } = useAppState();

  const adaptive = useMemo(
    () => buildAdaptivePlan({
      level,
      readingHistory,
      listeningHistory,
      grammarHistory,
      writingHistory: history,
    }),
    [level, readingHistory, listeningHistory, grammarHistory, history]
  );

  const dueCount = useMemo(
    () => (reviews || []).filter((item) => Number(item?.nextReviewAt || 0) <= Date.now()).length,
    [reviews]
  );

  const latestPractice = useMemo(() => {
    const options = [
      { key: 'reading', route: 'Reading', title: 'Continue Reading', icon: 'book-outline', ts: latestTimestamp(readingHistory), bg: '#F8FAFC', iconColor: '#334155' },
      { key: 'listening', route: 'Listening', title: 'Continue Listening', icon: 'headset-outline', ts: latestTimestamp(listeningHistory), bg: '#EFF6FF', iconColor: '#1D4ED8' },
      { key: 'grammar', route: 'Grammar', title: 'Continue Grammar', icon: 'school-outline', ts: latestTimestamp(grammarHistory), bg: '#FEF3C7', iconColor: '#92400E' },
      { key: 'writing', route: 'Writing', title: 'Continue Writing', icon: 'document-text-outline', ts: latestTimestamp(history), bg: '#FFF7ED', iconColor: '#9A3412' },
    ];
    return options.sort((a, b) => b.ts - a.ts)[0];
  }, [readingHistory, listeningHistory, grammarHistory, history]);

  const actions = useMemo(() => {
    const weakAction = WEAK_ACTION_MAP[adaptive.weakest] || WEAK_ACTION_MAP.reading;
    const ordered = [
      { ...weakAction, meta: 'Priority today' },
      {
        label: dueCount > 0 ? `Review Queue (${dueCount})` : 'Review Queue',
        route: 'Review',
        icon: 'refresh-circle-outline',
        bg: '#ECFDF3',
        iconColor: '#166534',
        meta: dueCount > 0 ? 'Due now' : 'No backlog',
      },
      {
        label: latestPractice.title,
        route: latestPractice.route,
        icon: latestPractice.icon,
        bg: latestPractice.bg,
        iconColor: latestPractice.iconColor,
        meta: 'Recent work',
      },
      { label: 'Writing Feedback', route: 'WritingEditor', icon: 'create-outline', bg: '#FFF7ED', iconColor: '#9A3412', meta: 'Draft or revise' },
      { label: 'Calendar', route: 'ClassScheduleCalendar', icon: 'calendar-outline', bg: '#F5F3FF', iconColor: '#5B21B6', meta: 'Classes & deadlines' },
      { label: 'Mock Exam', route: 'Mock', icon: 'school-outline', bg: '#EEF4FF', iconColor: '#1D4ED8', meta: 'Timed practice' },
    ];
    const seenRoutes = new Set();
    const unique = ordered.filter((item) => {
      if (seenRoutes.has(item.route)) return false;
      seenRoutes.add(item.route);
      return true;
    });
    while (unique.length < 6 && !seenRoutes.has(FALLBACK_ACTION.route)) {
      unique.push(FALLBACK_ACTION);
      seenRoutes.add(FALLBACK_ACTION.route);
    }
    return unique;
  }, [adaptive.weakest, dueCount, latestPractice]);

  return (
    <View style={styles.scrollSection}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <Text style={styles.sectionMeta}>Most useful next steps first.</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        decelerationRate="fast"
      >
        {actions.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.actionCard, { backgroundColor: item.bg }]}
            onPress={() => navigation.navigate(item.route, item.params || undefined)}
            activeOpacity={0.85}
          >
            <View style={styles.actionHead}>
              <View style={styles.actionIconWrap}>
                <Ionicons name={item.icon} size={16} color={item.iconColor} />
              </View>
              <Ionicons name="arrow-forward" size={14} color={item.iconColor} />
            </View>
            <Text style={styles.actionLabel}>{item.label}</Text>
            <Text style={styles.actionMeta}>{item.meta}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollSection: {
    marginHorizontal: -spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHead: {
    marginLeft: spacing.md,
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 17,
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
    paddingBottom: 4,
  },
  actionCard: {
    width: 130,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 4,
  },
  actionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    color: '#111827',
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  actionMeta: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
});

