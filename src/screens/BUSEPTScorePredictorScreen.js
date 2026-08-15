/**
 * BUSEPTScorePredictorScreen.js — Official-format BUSEPT score projection tool.
 *
 * Learners enter their estimated correct counts for Listening (Selective +
 * Careful, out of 25) and Reading (Reading I + II, out of 25), plus a
 * self-assessed Writing band (1-9, from past essay scores). The tool
 * computes the projected /100 total using the official section weights
 * (Listening 25, Reading 25, Writing 40) and reports the S/F verdict
 * against the 60-mark threshold, with per-section gaps and advice.
 *
 * Projection is an estimate only: real scaled scores depend on item
 * difficulty, so it is a study-planning aid, not an official result.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { projectBuseptScore, gradeLabelForScore, PASS_MARK, BUSEPT_WEIGHTS } from '../utils/buseptScorePredictor';

const isWeb = Platform.OS === 'web';

const BAND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function SliderRow({ label, value, min, max, onChange, meta }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}{meta ? ` ${meta}` : ''}</Text>
      </View>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.sliderStepper}>
        {[
          { icon: 'remove-outline', delta: -1 },
          { icon: 'add-outline', delta: 1 },
        ].map((step) => (
          <TouchableOpacity
            key={step.delta}
            style={[styles.stepBtn, step.delta < 0 && styles.stepBtnSub]}
            onPress={() => onChange(Math.max(min, Math.min(max, value + step.delta)))}
            activeOpacity={0.8}
            disabled={value <= min && step.delta < 0}
          >
            <Ionicons name={step.icon} size={16} color={colors.primaryDark} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function BUSEPTScorePredictorScreen({ navigation }) {
  const [listeningCorrect, setListeningCorrect] = useState(12);
  const [readingCorrect, setReadingCorrect] = useState(12);
  const [writingBand, setWritingBand] = useState(5);
  const LISTENING_TOTAL = 25;
  const READING_TOTAL = 25;

  const projection = useMemo(
    () => projectBuseptScore({ listeningCorrect, listeningTotal: LISTENING_TOTAL, readingCorrect, readingTotal: READING_TOTAL, writingBand }),
    [listeningCorrect, readingCorrect, writingBand]
  );

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>BUSEPT Score Predictor</Text>
          <Text style={styles.subTitle}>Official weights: Listening {BUSEPT_WEIGHTS.listening} • Reading {BUSEPT_WEIGHTS.reading} • Writing {BUSEPT_WEIGHTS.writing}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} glow>
          <Text style={styles.eyebrow}>Projection Tool</Text>
          <Text style={styles.heroTitle}>Estimate your exam-day total before the real test.</Text>
          <Text style={styles.heroBody}>
            Enter realistic counts from your mock practice. The tool applies the official section weights and the 60-mark pass threshold used by YADYOK.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Listening ({BUSEPT_WEIGHTS.listening} pts)</Text>
          <Text style={styles.sub}>Correct answers across Selective + Careful Listening, out of {LISTENING_TOTAL} items.</Text>
          <SliderRow label="Correct answers" value={listeningCorrect} min={0} max={LISTENING_TOTAL} onChange={setListeningCorrect} meta={`/ ${LISTENING_TOTAL}`} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Reading ({BUSEPT_WEIGHTS.reading} pts)</Text>
          <Text style={styles.sub}>Correct answers across Reading I + Reading II, out of {READING_TOTAL} items.</Text>
          <SliderRow label="Correct answers" value={readingCorrect} min={0} max={READING_TOTAL} onChange={setReadingCorrect} meta={`/ ${READING_TOTAL}`} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Writing ({BUSEPT_WEIGHTS.writing} pts)</Text>
          <Text style={styles.sub}>Self-assessed writing band from your last two timed essays.</Text>
          <View style={styles.bandRow}>
            {BAND_OPTIONS.map((band) => (
              <TouchableOpacity
                key={band}
                style={[styles.bandChip, writingBand === band && styles.bandChipActive]}
                onPress={() => setWritingBand(band)}
                activeOpacity={0.85}
              >
                <Text style={[styles.bandChipText, writingBand === band && styles.bandChipTextActive]}>{band}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.bandHint}>Band 5 is the average S-grade level; 7+ indicates strong essays.</Text>
        </Card>

        <Card style={[styles.resultCard, projection.pass ? styles.resultCardPass : styles.resultCardFail]}>
          <View style={styles.resultTopRow}>
            <View>
              <Text style={styles.resultLabel}>Projected Total</Text>
              <Text style={styles.resultScore}>{projection.total}<Text style={styles.resultMax}> /100</Text></Text>
            </View>
            <View style={[styles.verdictBadge, projection.pass ? styles.verdictBadgePass : styles.verdictBadgeFail]}>
              <Text style={styles.verdictText}>{gradeLabelForScore(projection.total)}</Text>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionValue}>{projection.listening}</Text>
              <Text style={styles.sectionLabel}>Listening</Text>
            </View>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionValue}>{projection.reading}</Text>
              <Text style={styles.sectionLabel}>Reading</Text>
            </View>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionValue}>{projection.writing}</Text>
              <Text style={styles.sectionLabel}>Writing</Text>
            </View>
          </View>

          {!projection.pass ? (
            <View style={styles.gapBox}>
              <Text style={styles.gapLabel}>Per-section gaps to pass (section target 50)</Text>
              <Text style={styles.gapText}>Listening gap: {projection.gaps.listening} • Reading gap: {projection.gaps.reading} • Writing gap: {projection.gaps.writing}</Text>
            </View>
          ) : null}

          <Text style={styles.adviceText}>{projection.advice}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>What This Estimate Is</Text>
          <Text style={styles.sub}>
            A study-planning aid built on the official YADYOK weights and pass policy (60/100, S/F, section tracking for partial passes). Real scaled scores also depend on item difficulty, so treat the projection as a target-setting tool, not an official result.
          </Text>
          <View style={styles.actionsRow}>
            <Button label="Official Simulation" icon="timer-outline" onPress={() => navigation.navigate('OfficialSim')} />
            <Button label="AI Mock Generator" variant="secondary" icon="sparkles-outline" onPress={() => navigation.navigate('AIMockGenerator')} />
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: '#D6E0F2',
  },
  headerCopy: { flex: 1 },
  title: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  subTitle: {
    marginTop: 2,
    fontSize: typography.small,
    color: colors.muted,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderColor: '#172554',
    marginTop: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.xsmall,
    color: '#93C5FD',
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  heroBody: {
    color: '#CBD5E1',
    fontSize: typography.small,
    lineHeight: 20,
  },
  card: {
    marginTop: spacing.sm,
  },
  h3: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  sliderBlock: { marginBottom: spacing.md },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sliderLabel: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  sliderValue: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  sliderTrack: {
    height: 10,
    borderRadius: radius.round,
    backgroundColor: '#D6E0F2',
    marginBottom: spacing.xs,
  },
  sliderFill: {
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },
  sliderStepper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: '#EEF2F8',
    borderWidth: 1,
    borderColor: '#D6E0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnSub: {
    opacity: 0.75,
  },
  bandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  bandChip: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#EEF2F8',
    borderWidth: 1,
    borderColor: '#D6E0F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  bandChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  bandChipText: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  bandChipTextActive: {
    color: '#FFFFFF',
  },
  bandHint: {
    fontSize: typography.xsmall,
    color: colors.muted,
    lineHeight: 16,
  },
  resultCard: {
    marginTop: spacing.md,
    borderWidth: 2,
  },
  resultCardPass: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  resultCardFail: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    fontSize: typography.small,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  resultScore: {
    fontSize: 40,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
    lineHeight: 48,
  },
  resultMax: {
    fontSize: typography.small,
    color: colors.muted,
    fontWeight: '700',
  },
  verdictBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  verdictBadgePass: { backgroundColor: '#16A34A' },
  verdictBadgeFail: { backgroundColor: '#DC2626' },
  verdictText: {
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    fontSize: typography.body,
  },
  sectionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  sectionBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  sectionValue: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
  },
  gapBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: spacing.sm,
  },
  gapLabel: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
    marginBottom: 4,
  },
  gapText: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 17,
  },
  adviceText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bottomSpacer: { height: 80 },
});
