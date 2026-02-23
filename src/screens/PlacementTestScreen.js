import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';

const TEST_LENGTH = 10;
const BAND_ORDER = ['P1', 'P2', 'P3', 'P4'];

const CEFR_BY_BAND = {
  P1: 'A1',
  P2: 'A2',
  P3: 'B1',
  P4: 'B2',
};

const PLACEMENT_QUESTIONS = [
  {
    id: 'q1',
    skill: 'Grammar',
    band: 'P1',
    weight: 1,
    text: 'My brother ______ to campus by bus every day.',
    options: ['go', 'goes', 'going', 'is go'],
    correct: 1,
  },
  {
    id: 'q2',
    skill: 'Reading',
    band: 'P1',
    weight: 1,
    text: 'Choose the best sentence for formal writing.',
    options: [
      'I wanna discuss this topic.',
      'I would like to discuss this topic.',
      'I discussing this topic now.',
      'Me discuss this topic.',
    ],
    correct: 1,
  },
  {
    id: 'q3',
    skill: 'Grammar',
    band: 'P2',
    weight: 1,
    text: 'By the time we arrived, the lecture ______.',
    options: ['starts', 'had started', 'was start', 'has starting'],
    correct: 1,
  },
  {
    id: 'q4',
    skill: 'Vocabulary',
    band: 'P2',
    weight: 1,
    text: 'The opposite of "increase" is ______.',
    options: ['expand', 'rise', 'decline', 'improve'],
    correct: 2,
  },
  {
    id: 'q5',
    skill: 'Reading',
    band: 'P2',
    weight: 1,
    text: 'Which sentence is logically connected in an academic context?',
    options: [
      'The weather was cold. Therefore, I studied economics.',
      'The weather was cold. Therefore, we wore jackets.',
      'The weather was cold. Therefore, books are useful.',
      'The weather was cold. Therefore, my exam is next week.',
    ],
    correct: 1,
  },
  {
    id: 'q6',
    skill: 'Grammar',
    band: 'P3',
    weight: 2,
    text: 'If universities ______ more funding, they could expand scholarship programs.',
    options: ['receive', 'received', 'had received', 'have receive'],
    correct: 1,
  },
  {
    id: 'q7',
    skill: 'Vocabulary',
    band: 'P3',
    weight: 2,
    text: '"Mitigate" is closest in meaning to ______.',
    options: ['worsen', 'ignore', 'reduce', 'predict'],
    correct: 2,
  },
  {
    id: 'q8',
    skill: 'Reading',
    band: 'P3',
    weight: 2,
    text: 'Boğaziçi prep seminar note: "Attendance correlates with grades, but causation is uncertain." Best interpretation?',
    options: [
      'Attendance directly causes high grades in every case.',
      'There is a relationship, but other factors may affect outcomes.',
      'Attendance and grades are unrelated.',
      'The statement proves a universal rule.',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    skill: 'Grammar',
    band: 'P4',
    weight: 3,
    text: 'Hardly ______ the proposal when the committee requested revisions.',
    options: ['we submitted', 'had we submitted', 'we had submit', 'did we submitting'],
    correct: 1,
  },
  {
    id: 'q10',
    skill: 'Vocabulary',
    band: 'P4',
    weight: 3,
    text: 'Choose the best academic paraphrase: "The results were very good."',
    options: [
      'The results were nice.',
      'The findings were exceptionally robust.',
      'The results were cool.',
      'The outcomes were so-so.',
    ],
    correct: 1,
  },
  {
    id: 'q11',
    skill: 'Reading',
    band: 'P4',
    weight: 3,
    text: 'Which claim is most defensible in a Boğaziçi academic essay?',
    options: [
      'This policy always works for all students.',
      'This policy appears effective in the sampled departments, though replication is needed.',
      'This policy is obviously perfect.',
      'This policy cannot fail under any condition.',
    ],
    correct: 1,
  },
  {
    id: 'q12',
    skill: 'Grammar',
    band: 'P4',
    weight: 3,
    text: 'No sooner ______ the experiment than the sensor failed.',
    options: ['did we begin', 'we began', 'had we begun', 'we had begin'],
    correct: 2,
  },
];

function getBandFromAccuracy(accuracy) {
  if (accuracy < 40) return 'P1';
  if (accuracy < 60) return 'P2';
  if (accuracy < 80) return 'P3';
  return 'P4';
}

function moveBand(currentBand, delta) {
  const idx = BAND_ORDER.indexOf(currentBand);
  const next = Math.max(0, Math.min(BAND_ORDER.length - 1, idx + delta));
  return BAND_ORDER[next];
}

function pickAdaptiveQuestion({ askedQuestions, targetBand, step }) {
  const askedIds = new Set(askedQuestions.map((q) => q.id));
  const left = PLACEMENT_QUESTIONS.filter((q) => !askedIds.has(q.id));
  if (!left.length) return null;

  const preferredSkill = ['Grammar', 'Reading', 'Vocabulary'][step % 3];
  const direct = left.find((q) => q.band === targetBand && q.skill === preferredSkill);
  if (direct) return direct;

  const sameBand = left.find((q) => q.band === targetBand);
  if (sameBand) return sameBand;

  const bandIdx = BAND_ORDER.indexOf(targetBand);
  for (let jump = 1; jump < BAND_ORDER.length; jump += 1) {
    const up = BAND_ORDER[bandIdx + jump];
    const down = BAND_ORDER[bandIdx - jump];
    const near = left.find((q) => q.band === up || q.band === down);
    if (near) return near;
  }

  return left[0];
}

function buildResult(askedQuestions, answers) {
  const totalWeight = askedQuestions.reduce((sum, q) => sum + q.weight, 0);
  let earnedWeight = 0;
  const skillMap = {};

  askedQuestions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correct;
    if (!skillMap[q.skill]) skillMap[q.skill] = { correctWeight: 0, totalWeight: 0 };
    skillMap[q.skill].totalWeight += q.weight;
    if (isCorrect) {
      earnedWeight += q.weight;
      skillMap[q.skill].correctWeight += q.weight;
    }
  });

  const accuracy = Math.round((earnedWeight / Math.max(1, totalWeight)) * 100);
  const band = getBandFromAccuracy(accuracy);
  const cefr = CEFR_BY_BAND[band];
  const weakestSkill = Object.entries(skillMap)
    .map(([skill, val]) => ({
      skill,
      pct: Math.round((val.correctWeight / Math.max(1, val.totalWeight)) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)[0];

  return {
    band,
    cefr,
    accuracy,
    scoreText: `${earnedWeight}/${totalWeight}`,
    skillMap,
    weakestSkill,
  };
}

function skillPct(skillMap, skillName) {
  const data = skillMap[skillName];
  if (!data) return 0;
  return Math.round((data.correctWeight / Math.max(1, data.totalWeight)) * 100);
}

export default function PlacementTestScreen({ navigation }) {
  const { setLevel } = useAppState();
  const [askedQuestions, setAskedQuestions] = useState([PLACEMENT_QUESTIONS.find((q) => q.band === 'P2') || PLACEMENT_QUESTIONS[0]]);
  const [targetBand, setTargetBand] = useState('P2');
  const [answers, setAnswers] = useState({});
  const [isDone, setIsDone] = useState(false);

  const qIndex = askedQuestions.length - 1;
  const currentQ = askedQuestions[qIndex];
  const progressPct = Math.round((askedQuestions.length / TEST_LENGTH) * 100);
  const result = useMemo(() => buildResult(askedQuestions, answers), [askedQuestions, answers]);

  const handleAnswer = (selectedIdx) => {
    const nextAnswers = { ...answers, [currentQ.id]: selectedIdx };
    setAnswers(nextAnswers);
    const isCorrect = selectedIdx === currentQ.correct;
    const nextBand = moveBand(targetBand, isCorrect ? 1 : -1);
    setTargetBand(nextBand);

    if (askedQuestions.length >= TEST_LENGTH) {
      setIsDone(true);
      return;
    }

    const nextQuestion = pickAdaptiveQuestion({
      askedQuestions,
      targetBand: nextBand,
      step: askedQuestions.length,
    });
    if (!nextQuestion) {
      setIsDone(true);
      return;
    }
    setAskedQuestions((prev) => [...prev, nextQuestion]);
  };

  const handleFinish = () => {
    setLevel(result.band);
    navigation.goBack();
  };

  const reset = () => {
    setAskedQuestions([PLACEMENT_QUESTIONS.find((q) => q.band === 'P2') || PLACEMENT_QUESTIONS[0]]);
    setTargetBand('P2');
    setAnswers({});
    setIsDone(false);
  };

  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Placement Test</Text>
          <Text style={styles.pageSub}>Boğaziçi prep-focused adaptive assessment</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isDone ? (
          <Card style={styles.resultCard} glow>
            <Ionicons name="ribbon" size={56} color="#f1c40f" />
            <Text style={styles.resultTitle}>Assessment Completed</Text>
            <Text style={styles.resultDesc}>Estimated level and skill breakdown</Text>

            <View style={styles.bandHero}>
              <Text style={styles.bandText}>{result.band}</Text>
              <Text style={styles.cefrText}>{result.cefr}</Text>
            </View>

            <Text style={styles.scoreText}>Weighted Score: {result.scoreText} ({result.accuracy}%)</Text>
            <Text style={styles.hintText}>Weakest skill: {result.weakestSkill?.skill || 'N/A'}</Text>

            <View style={styles.breakdownBox}>
              {['Grammar', 'Reading', 'Vocabulary'].map((skill) => {
                const pct = skillPct(result.skillMap, skill);
                return (
                  <View key={skill} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{skill}</Text>
                    <View style={styles.skillTrack}>
                      <View style={[styles.skillFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.skillPct}>{pct}%</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.bounext}>
              <Text style={styles.bounextTitle}>Boğaziçi Next Steps</Text>
              <Text style={styles.bounextText}>1. Class schedule + academic calendar ile haftanı planla.</Text>
              <Text style={styles.bounextText}>2. Weakest skill için 7 günlük sprint başlat.</Text>
              <Text style={styles.bounextText}>3. 1 hafta sonra placement retake yap.</Text>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={reset}>
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
                <Text style={styles.primaryBtnText}>Save Level</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ClassScheduleCalendar')}>
                <Text style={styles.secondaryBtnText}>Open Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('StudyPlan')}>
                <Text style={styles.secondaryBtnText}>Open Study Plan</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <View>
            <View style={styles.progressRow}>
              <Text style={styles.progText}>Question {askedQuestions.length} / {TEST_LENGTH}</Text>
              <View style={styles.progBg}>
                <View style={[styles.progFill, { width: `${progressPct}%` }]} />
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.skillBadge}>
                <Text style={styles.badgeText}>{currentQ.skill}</Text>
              </View>
              <View style={styles.bandBadge}>
                <Text style={styles.badgeText}>{currentQ.band}</Text>
              </View>
            </View>

            <Card style={styles.qCard}>
              <Text style={styles.qText}>{currentQ.text}</Text>
            </Card>

            <View style={styles.optWrap}>
              {currentQ.options.map((opt, idx) => (
                <TouchableOpacity key={idx} style={styles.optBtn} onPress={() => handleAnswer(idx)}>
                  <View style={styles.optRadio} />
                  <Text style={styles.optText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
  backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
  pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
  pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },

  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  progText: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
  progBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999 },
  progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },

  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  skillBadge: { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  bandBadge: { backgroundColor: '#e8f8f5', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  badgeText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },

  qCard: { padding: spacing.xxl, borderRadius: radius.xl, backgroundColor: '#fff', marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  qText: { fontSize: 20, fontWeight: '600', color: colors.text, lineHeight: 30, textAlign: 'center' },

  optWrap: { gap: spacing.md },
  optBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.lg, ...shadow.slight },
  optRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.muted, marginRight: spacing.md },
  optText: { fontSize: 16, color: colors.text, fontWeight: '600', flexShrink: 1 },

  resultCard: { padding: spacing.xxl, alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl },
  resultTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginTop: spacing.md, marginBottom: 8 },
  resultDesc: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md },
  bandHero: { backgroundColor: colors.primarySoft, width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  bandText: { fontSize: 42, fontWeight: '900', color: colors.primaryDark, fontFamily: typography.fontHeadline, lineHeight: 42 },
  cefrText: { marginTop: 4, fontSize: 18, fontWeight: '800', color: colors.primary },
  scoreText: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  hintText: { fontSize: 13, color: colors.muted, marginBottom: spacing.md },

  breakdownBox: { width: '100%', marginBottom: spacing.lg },
  skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  skillLabel: { width: 92, fontSize: 13, color: colors.text, fontWeight: '700' },
  skillTrack: { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 999, overflow: 'hidden' },
  skillFill: { height: '100%', backgroundColor: colors.primary },
  skillPct: { width: 44, textAlign: 'right', fontSize: 12, fontWeight: '700', color: colors.muted },

  resultActions: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: colors.secondary, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '800', color: colors.text },
  primaryBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  bounext: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bounextTitle: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bounextText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 3,
  },
});
