/**
 * MockResultScreen.js
 * Variant-aware mock exam result with visual score display,
 * CEFR mapping, section breakdowns, target score gap analysis,
 * and AI-driven personalized advice.
 *
 * - Boğaziçi (BUSEPT): CEFR band descriptors
 * - ODTÜ (İYS/EPE): METÜ SFL band descriptors (A–F), 85+ exemption band,
 *   official weight display (Listening 20 + Reading 32 + Note-taking 12 + Writing 20 + Speaking 16 = 100)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { buildMockAdvice } from '../utils/mockAdvice';
// __APP_VARIANT__ is a build-time constant injected by webpack DefinePlugin (no module needed)
const isOdtu = __APP_VARIANT__ === 'odtu';

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  header: { alignItems: 'center', paddingVertical: spacing.md },
  title: { fontSize: typography.h2 || 22, fontFamily: typography.fontHeadline, color: colors.text, fontWeight: '800' },
  subtitle: { fontSize: typography.small || 12, color: colors.muted, marginTop: 4 },
  heroCard: { marginBottom: spacing.md, padding: spacing.lg },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  circleWrap: { alignItems: 'center', position: 'relative' },
  circleRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center',
  },
  circleInner: { alignItems: 'center' },
  circleScore: { fontSize: 28, fontWeight: '900', fontFamily: typography.fontHeadline },
  circleMax: { fontSize: 11, color: colors.muted },
  circlePct: { fontSize: 10, fontWeight: '700' },
  circleArc: { height: 3, borderRadius: 2, marginTop: 8, alignSelf: 'flex-start' },
  heroRight: { flex: 1, gap: 6 },
  cefrTag: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill || 12, borderWidth: 1, marginBottom: 4,
  },
  cefrTagText: { fontSize: 12, fontWeight: '800' },
  heroLabel: { fontSize: typography.small || 12, color: colors.muted },
  heroCefr: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '600' },
  heroStatus: { fontSize: 13, fontWeight: '700' },
  heroGap: { fontSize: 11, color: colors.muted, fontStyle: 'italic' },
  cefrStrip: { flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap' },
  cefrBubble: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill || 12, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cefrBubbleText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  card: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.h3 || 16, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: 4 },
  sectionSub: { fontSize: 11, color: colors.muted, marginBottom: spacing.md },
  sectionBar: { marginBottom: spacing.md },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  sectionIcon: { fontSize: 16 },
  sectionName: { flex: 1, fontSize: typography.body || 14, color: colors.text, fontFamily: typography.fontHeadline },
  sectionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill || 8 },
  sectionBadgeText: { fontSize: 10, fontWeight: '700' },
  sectionScore: { fontSize: typography.h3 || 16, fontWeight: '800', width: 40, textAlign: 'right' },
  sectionTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'visible', position: 'relative' },
  sectionFill: { height: '100%', borderRadius: 4 },
  sectionThreshold: { position: 'absolute', top: -4, bottom: -4, width: 2, backgroundColor: 'rgba(255,255,255,0.25)', zIndex: 1 },
  sectionTrackLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, position: 'relative' },
  sectionTrackLabel: { fontSize: 9, color: colors.muted },
  insightRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  insightCard: { flex: 1, alignItems: 'center', borderLeftWidth: 3, padding: spacing.md, marginBottom: 0 },
  insightIcon: { fontSize: 20 },
  insightLabel: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', marginTop: 4 },
  insightValue: { fontSize: typography.h3 || 16, fontWeight: '800', marginTop: 2 },
  insightScore: { fontSize: 11, color: colors.muted },
  adviceRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
  adviceNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary + '20', textAlign: 'center', lineHeight: 22,
    fontSize: 11, color: colors.primary, fontWeight: '800',
  },
  adviceText: { flex: 1, fontSize: typography.body || 14, color: colors.text, lineHeight: 20 },
  shortcutRow: { flexDirection: 'row', gap: spacing.sm },
  shortcutBtn: {
    flex: 1, alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg || 12, borderWidth: 1,
  },
  shortcutIcon: { fontSize: 20, marginBottom: 4 },
  shortcutText: { fontSize: 11, fontWeight: '700' },
  shortcutScore: { fontSize: 10, color: colors.muted, marginTop: 2 },
  historyBtn: {
    alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg || 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: spacing.sm,
  },
  historyBtnText: { fontSize: 13, color: colors.primary, fontWeight: '700' },
});

// ── CEFR helpers ─────────────────────────────────────────────────────────────
const CEFR_LEVELS = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
const CEFR_COLORS = { A2: '#EF4444', B1: '#F59E0B', 'B1+': '#F59E0B', B2: '#3B82F6', 'B2+': '#6366F1', C1: '#10B981' };

function cefrColor(cefr) {
  return CEFR_COLORS[cefr] || '#6B7280';
}

// ── METÜ SFL band descriptors (approximate 0–100 scale) ──────────────────────
// METÜ publishes internal A–F style proficiency bands; 60/100 is the pass line,
// 85+ places the student in the exemption (muafiyet) band per SFL practice.
const METU_BANDS = [
  { min: 90, label: 'A Band · Advanced', short: 'A', cefr: 'C1' },
  { min: 80, label: 'B Band · Upper', short: 'B', cefr: 'B2+' },
  { min: 68, label: 'C Band · Proficient', short: 'C', cefr: 'B2' },
  { min: 55, label: 'D Band · Approaching', short: 'D', cefr: 'B1+' },
  { min: 40, label: 'E Band · Developing', short: 'E', cefr: 'B1' },
  { min: 0, label: 'F Band · Foundational', short: 'F', cefr: 'A2' },
];

function getBand(score) {
  if (isOdtu) {
    return METU_BANDS.find(b => score >= b.min) || METU_BANDS[METU_BANDS.length - 1];
  }
  if (score >= 90) return { label: 'C1', short: 'C1', cefr: 'C1' };
  if (score >= 80) return { label: 'B2+', short: 'B2+', cefr: 'B2+' };
  if (score >= 68) return { label: 'B2', short: 'B2', cefr: 'B2' };
  if (score >= 58) return { label: 'B1+', short: 'B1+', cefr: 'B1+' };
  if (score >= 48) return { label: 'B1', short: 'B1', cefr: 'B1' };
  return { label: 'A2', short: 'A2', cefr: 'A2' };
}

// ── Radial Score Circle ───────────────────────────────────────────────────────
function ScoreCircle({ score, maxScore = 100, color }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <View style={styles.circleWrap}>
      <View style={[styles.circleRing, { borderColor: color + '30' }]}>
        <View style={[styles.circleInner]}>
          <Text style={[styles.circleScore, { color }]}>{score}</Text>
          <Text style={styles.circleMax}>/{maxScore}</Text>
          <Text style={[styles.circlePct, { color: color + 'aa' }]}>{pct}%</Text>
        </View>
      </View>
      {/* Color arc indicator */}
      <View style={[styles.circleArc, { backgroundColor: color, width: `${pct}%` }]} />
    </View>
  );
}

// ── Section Score Bar ─────────────────────────────────────────────────────────
const PASSING_THRESHOLD = 60; // Official passing band

function SectionBar({ name, score, icon, color, navigation }) {
  const pct = Math.min(100, Math.round(score));
  const passed = pct >= PASSING_THRESHOLD;
  const gap = Math.max(0, PASSING_THRESHOLD - pct);
  return (
    <View style={styles.sectionBar}>
      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionName}>{name}</Text>
        <View style={[styles.sectionBadge, { backgroundColor: passed ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={[styles.sectionBadgeText, { color: passed ? '#065F46' : '#991B1B' }]}>
            {passed ? '✓ Passed' : `${gap} pts short`}
          </Text>
        </View>
        <Text style={[styles.sectionScore, { color }]}>{score}</Text>
      </View>
      <View style={styles.sectionTrack}>
        {/* Threshold line */}
        <View style={[styles.sectionThreshold, { left: `${PASSING_THRESHOLD}%` }]} />
        <View style={[styles.sectionFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.sectionTrackLabels}>
        <Text style={styles.sectionTrackLabel}>0</Text>
        <Text style={[styles.sectionTrackLabel, { position: 'absolute', left: `${PASSING_THRESHOLD}%` }]}>60</Text>
        <Text style={styles.sectionTrackLabel}>100</Text>
      </View>
    </View>
  );
}

// ── CEFR Progression Strip ────────────────────────────────────────────────────
function CefrStrip({ current }) {
  return (
    <View style={styles.cefrStrip}>
      {CEFR_LEVELS.map((level) => {
        const isActive = level === current;
        const c = cefrColor(level);
        return (
          <View key={level} style={[styles.cefrBubble, isActive && { backgroundColor: c }]}>
            <Text style={[styles.cefrBubbleText, isActive && { color: '#fff', fontWeight: '800' }]}>{level}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MockResultScreen({ route, navigation }) {
  const { addMockResult, markActivityToday } = useAppState();
  const [earnedBadges, setEarnedBadges] = useState([]);
  const passed = route?.params?.result;

  const result = useMemo(() => (
    passed || {
      listening: 62,
      reading: 58,
      writing: 55,
      overall: 58,
      cefr: 'B1+',
    }
  ), [passed]);

  useEffect(() => {
    if (!passed) addMockResult(result);
    markActivityToday().then((res) => {
      if (Array.isArray(res?.newBadgeIds) && res.newBadgeIds.length) {
        setEarnedBadges(res.newBadgeIds);
      }
    });
  }, [passed, addMockResult, result, markActivityToday]);

  const advice = buildMockAdvice(result);
  const bandInfo = getBand(result.overall);
  const cefr = result.cefr || bandInfo.cefr;
  const overallColor = cefrColor(cefr);
  const exempt = isOdtu && result.overall >= 85;

  const sections = [
    ...(isOdtu
      ? [
          { name: 'Not Alma', score: result.noteTaking ?? 0, icon: '✍️', color: '#F59E0B', nav: 'History' },
          { name: 'Konuşma', score: result.speaking ?? 0, icon: '🎤', color: '#10B981', nav: 'MockHistory' },
        ]
      : []),
    { name: 'Listening', score: result.listening, icon: '🎧', color: '#8B5CF6', nav: 'ListeningHistory' },
    { name: 'Reading', score: result.reading, icon: '📖', color: '#3B82F6', nav: 'ReadingHistory' },
    { name: 'Writing', score: result.writing, icon: '📝', color: '#EF4444', nav: 'History' },
  ];

  const weakest = [...sections].sort((a, b) => a.score - b.score)[0];
  const strongest = [...sections].sort((a, b) => b.score - a.score)[0];
  const allPassed = sections.every(s => s.score >= PASSING_THRESHOLD);
  const targetScore = isOdtu ? (result.overall >= 85 ? 85 : 60) : 68; // B2 / exemption threshold
  const toTarget = Math.max(0, targetScore - result.overall);

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mock Exam Result</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      </View>

      {/* Overall Score Circle */}
      <Card style={styles.heroCard}>
        <View style={styles.heroContent}>
          <ScoreCircle score={result.overall} maxScore={100} color={overallColor} />
          <View style={styles.heroRight}>
            <View style={[styles.cefrTag, { backgroundColor: overallColor + '20', borderColor: overallColor + '40' }]}>
              <Text style={[styles.cefrTagText, { color: overallColor }]}>{isOdtu ? bandInfo.label : `CEFR ${cefr}`}</Text>
            </View>
            {isOdtu && (
              <Text style={styles.heroCefr}>
                CEFR ≈ {cefr} · {exempt ? '85+ — Muafiyet bandı' : '60 — Geçme bandı'}
              </Text>
            )}
            <Text style={styles.heroLabel}>{isOdtu ? 'Toplam Puan' : 'Overall Score'}</Text>
            <Text style={[styles.heroStatus, { color: exempt ? '#10B981' : allPassed ? '#10B981' : '#EF4444' }]}>
              {isOdtu
                ? (exempt
                    ? '✓ Muafiyet bandında (85+)'
                    : result.overall >= 60
                      ? '✓ Geçme bandında (60+)'
                      : '✗ Geçme bandının altında')
                : (allPassed ? '✓ All sections passed' : '✗ Some sections need work')}
            </Text>
            {toTarget > 0 && (
              <Text style={styles.heroGap}>
                +{toTarget} pts {isOdtu ? (exempt ? 'to 85' : 'to 60') : 'to reach B2'}
              </Text>
            )}
          </View>
        </View>
        <CefrStrip current={cefr} />
      </Card>

      {/* Section Breakdown */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{isOdtu ? '📊 Bölüm Bazında Dağılım' : '📊 Section Breakdown'}</Text>
        <Text style={styles.sectionSub}>
          {isOdtu
            ? 'Resmi İYS skalası: Dinleme 20 + Okuma 32 + Not alma 12 + Yazma 20 + Konuşma 16 = 100'
            : 'Pass threshold: 60/100 per section'}
        </Text>
        {sections.map((s) => (
          <SectionBar key={s.name} {...s} navigation={navigation} />
        ))}
      </Card>

      {/* Quick Insights */}
      <View style={styles.insightRow}>
        <Card style={[styles.insightCard, { borderLeftColor: strongest.color }]}>
          <Text style={styles.insightIcon}>⭐</Text>
          <Text style={styles.insightLabel}>{isOdtu ? 'En Güçlü' : 'Strongest'}</Text>
          <Text style={[styles.insightValue, { color: strongest.color }]}>{strongest.name}</Text>
          <Text style={styles.insightScore}>{strongest.score}/100</Text>
        </Card>
        <Card style={[styles.insightCard, { borderLeftColor: weakest.color }]}>
          <Text style={styles.insightIcon}>📌</Text>
          <Text style={styles.insightLabel}>{isOdtu ? 'Odaklan' : 'Focus On'}</Text>
          <Text style={[styles.insightValue, { color: weakest.color }]}>{weakest.name}</Text>
          <Text style={styles.insightScore}>{weakest.score}/100</Text>
        </Card>
      </View>

      {/* Personalized Advice */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{isOdtu ? '🎯 Kişisel Aksiyon Planı' : '🎯 Personalized Action Plan'}</Text>
        <Text style={styles.sectionSub}>{isOdtu ? 'Performans profiline göre öneriler' : 'Based on your performance profile'}</Text>
        {advice.map((a, i) => (
          <View key={i} style={styles.adviceRow}>
            <Text style={styles.adviceNum}>{i + 1}</Text>
            <Text style={styles.adviceText}>{a}</Text>
          </View>
        ))}
      </Card>

      {/* Practice Shortcuts */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{isOdtu ? '🚀 Zayıf Alanları Çalış' : '🚀 Practice Weak Areas'}</Text>
        <View style={styles.shortcutRow}>
          {sections.filter(s => s.score < PASSING_THRESHOLD).concat(sections.filter(s => s.score >= PASSING_THRESHOLD)).slice(0, 3).map(s => (
            <TouchableOpacity
              key={s.name}
              style={[styles.shortcutBtn, { borderColor: s.color + '40', backgroundColor: s.color + '12' }]}
              onPress={() => navigation.navigate(s.nav)}
              activeOpacity={0.8}
            >
              <Text style={styles.shortcutIcon}>{s.icon}</Text>
              <Text style={[styles.shortcutText, { color: s.color }]}>{s.name}</Text>
              <Text style={styles.shortcutScore}>{s.score}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* History Link */}
      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('MockHistory')}
        activeOpacity={0.8}
      >
        <Text style={styles.historyBtnText}>{isOdtu ? 'Tüm Mock Geçmişini Gör →' : 'View All Mock History →'}</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

