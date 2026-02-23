/**
 * ExamsScreen.js — Enhanced timed mock exam selector with score history
 */
import React, { useState, useRef } from 'react';
import {
  Text, StyleSheet, View, TouchableOpacity, ScrollView, Animated
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import buept from '../../data/buept_exams.json';
import { useAppState } from '../context/AppState';

const EXAM_MODES = [
  { key: 'timed', label: '⏱ Timed Mode', desc: 'Real exam conditions. Timer runs.' },
  { key: 'practice', label: '📖 Practice Mode', desc: 'No timer. Review at your own pace.' },
];

const DIFFICULTY_COLOR = {
  Easy: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
  Medium: { bg: '#FFF3E0', text: '#BF360C', border: '#FFCC80' },
  Hard: { bg: '#FFEBEE', text: '#B71C1C', border: '#EF9A9A' },
};

export default function ExamsScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState('timed');
  const [selectedExam, setSelectedExam] = useState(null);
  const { mockResults = [] } = useAppState() || {};
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const bestScore = (examId) => {
    const results = mockResults.filter(r => r.examId === examId);
    if (!results.length) return null;
    return Math.max(...results.map(r => Math.round((r.score / r.total) * 100)));
  };

  const selectExam = (exam) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  const start = (exam) => {
    navigation.navigate('ExamDetail', {
      examId: exam.id,
      timed: selectedMode === 'timed',
    });
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>📋 BUEPT Exams</Text>
      <Text style={styles.sub}>Practice with official-style exam papers</Text>

      {/* Score summary */}
      {mockResults.length > 0 && (
        <Card style={[styles.statsCard, shadow.elev1]}>
          <Text style={styles.statsTitle}>Your History</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{mockResults.length}</Text>
              <Text style={styles.statLabel}>Attempts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {Math.round(mockResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / mockResults.length)}%
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {Math.max(...mockResults.map(r => Math.round((r.score / r.total) * 100)))}%
              </Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Exam mode selector */}
      <Text style={styles.sectionLabel}>Exam Mode</Text>
      <View style={styles.modeRow}>
        {EXAM_MODES.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, selectedMode === m.key && styles.modeBtnActive]}
            onPress={() => setSelectedMode(m.key)}
            activeOpacity={0.85}
          >
            <Text style={[styles.modeBtnLabel, selectedMode === m.key && styles.modeBtnLabelActive]}>
              {m.label}
            </Text>
            <Text style={[styles.modeBtnDesc, selectedMode === m.key && styles.modeBtnDescActive]}>
              {m.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats bar */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 BUEPT Exam Structure</Text>
        {[
          ['Reading', '30 min', '~15 questions', '📖'],
          ['Listening', '25 min', '~10 questions', '🎧'],
          ['Grammar/Vocab', '20 min', '~20 questions', '📝'],
          ['Writing', '60 min', '2 tasks', '✍️'],
        ].map(([skill, time, qs, icon]) => (
          <View key={skill} style={styles.structRow}>
            <Text style={styles.structIcon}>{icon}</Text>
            <Text style={styles.structSkill}>{skill}</Text>
            <Text style={styles.structTime}>{time}</Text>
            <Text style={styles.structQs}>{qs}</Text>
          </View>
        ))}
      </Card>

      {/* Exam cards */}
      <Text style={styles.sectionLabel}>Available Exams</Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        {buept.map((exam) => {
          const best = bestScore(exam.id);
          const diff = exam.difficulty || 'Medium';
          const dc = DIFFICULTY_COLOR[diff] || DIFFICULTY_COLOR.Medium;
          const isSelected = selectedExam === exam.id;

          return (
            <TouchableOpacity key={exam.id} onPress={() => selectExam(exam)} activeOpacity={0.9}>
              <Card style={[styles.examCard, isSelected && styles.examCardSelected, shadow.elev1]}>
                {/* Header */}
                <View style={styles.examHeader}>
                  <View style={styles.examTitleRow}>
                    <Text style={styles.examTitle}>{exam.title}</Text>
                    <View style={[styles.diffBadge, { backgroundColor: dc.bg, borderColor: dc.border }]}>
                      <Text style={[styles.diffText, { color: dc.text }]}>{diff}</Text>
                    </View>
                  </View>
                  {best !== null && (
                    <View style={[styles.bestBadge, best >= 70 ? styles.bestGood : styles.bestFair]}>
                      <Text style={styles.bestText}>Best: {best}%</Text>
                    </View>
                  )}
                </View>

                {/* Tag row */}
                <View style={styles.tagRow}>
                  {['Full Exam', 'Timed', `${exam.questions?.length || '?'} Questions`].map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Description / expanded */}
                {exam.description && (
                  <Text style={styles.examDesc}>{exam.description}</Text>
                )}

                {isSelected && (
                  <View style={styles.startRow}>
                    <Button
                      label={selectedMode === 'timed' ? '⏱ Start Timed Exam' : '📖 Start Practice'}
                      onPress={() => start(exam)}
                    />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* External resources */}
      <Card style={[styles.card, styles.resourceCard]}>
        <Text style={styles.sectionLabel}>Official Resources</Text>
        <TouchableOpacity
          style={styles.resourceRow}
          onPress={() => navigation.navigate('WebViewer', { url: 'https://buept.bogazici.edu.tr', title: 'BUEPT Official' })}
        >
          <Text style={styles.resourceText}>🌐 buept.bogazici.edu.tr</Text>
          <Text style={styles.resourceArrow}>›</Text>
        </TouchableOpacity>
        <Text style={styles.resourceHint}>Past papers and announcements</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },

  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.lg },

  statsCard: { marginBottom: spacing.lg, backgroundColor: colors.primaryDark, borderColor: colors.primary },
  statsTitle: { fontSize: typography.small, color: '#A8C0FF', fontFamily: typography.fontHeadline, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: '#fff' },
  statLabel: { fontSize: typography.small, color: '#A8C0FF' },
  statDivider: { width: 1, height: 36, backgroundColor: '#4A6A9A' },

  sectionLabel: { fontSize: typography.small, color: colors.muted, fontFamily: typography.fontHeadline, marginBottom: spacing.sm },

  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  modeBtn: {
    flex: 1, padding: spacing.md, borderRadius: 14, borderWidth: 1.5,
    borderColor: colors.secondary, backgroundColor: colors.surface,
  },
  modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeBtnLabel: { fontSize: typography.small, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: 2 },
  modeBtnLabelActive: { color: '#fff' },
  modeBtnDesc: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  modeBtnDescActive: { color: '#DDE8FF' },

  tipsCard: { marginBottom: spacing.lg, backgroundColor: colors.surfaceAlt },
  tipsTitle: { fontSize: typography.body, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  structRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.secondary, alignItems: 'center' },
  structIcon: { fontSize: 16, width: 24 },
  structSkill: { flex: 1, fontSize: typography.small, color: colors.text, fontFamily: typography.fontHeadline },
  structTime: { fontSize: typography.small, color: colors.primary, width: 60 },
  structQs: { fontSize: typography.small, color: colors.muted, width: 90, textAlign: 'right' },

  examCard: { marginBottom: spacing.md },
  examCardSelected: { borderColor: colors.primary, borderWidth: 2 },

  examHeader: { marginBottom: spacing.sm },
  examTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  examTitle: { flex: 1, fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text },
  diffBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  diffText: { fontSize: 11, fontFamily: typography.fontHeadline },

  bestBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999, marginTop: 4 },
  bestGood: { backgroundColor: '#E8F5E9' },
  bestFair: { backgroundColor: '#FFF3E0' },
  bestText: { fontSize: 11, fontFamily: typography.fontHeadline, color: colors.text },

  tagRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm, flexWrap: 'wrap' },
  tag: { backgroundColor: colors.secondary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999 },
  tagText: { fontSize: 11, color: colors.primaryDark, fontFamily: typography.fontHeadline },

  examDesc: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.sm, lineHeight: 18 },
  startRow: { marginTop: spacing.sm },

  card: { marginBottom: spacing.md },
  resourceCard: { backgroundColor: colors.surfaceAlt },
  resourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  resourceText: { flex: 1, fontSize: typography.body, color: colors.primary, fontFamily: typography.fontHeadline },
  resourceArrow: { fontSize: 20, color: colors.muted },
  resourceHint: { fontSize: typography.small, color: colors.muted },
});
