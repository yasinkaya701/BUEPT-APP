import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';

const TEST_LENGTH = 12;
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
    explain: 'Present simple third-person singular requires -s: he/she/it goes.',
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
    explain: '"I would like to" is the formal, grammatical option.',
  },
  {
    id: 'q3',
    skill: 'Grammar',
    band: 'P2',
    weight: 1,
    text: 'By the time we arrived, the lecture ______.',
    options: ['starts', 'had started', 'was start', 'has starting'],
    correct: 1,
    explain: 'Past perfect is used for an action completed before another past action.',
  },
  {
    id: 'q4',
    skill: 'Vocabulary',
    band: 'P2',
    weight: 1,
    text: 'The opposite of "increase" is ______.',
    options: ['expand', 'rise', 'decline', 'improve'],
    correct: 2,
    explain: '"Decline" means decrease, the opposite of increase.',
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
    explain: 'Only option 2 has a direct cause-effect relationship.',
  },
  {
    id: 'q6',
    skill: 'Grammar',
    band: 'P3',
    weight: 2,
    text: 'If universities ______ more funding, they could expand scholarship programs.',
    options: ['receive', 'received', 'had received', 'have receive'],
    correct: 1,
    explain: 'Second conditional uses past simple in the if-clause: If ... received, ... could.',
  },
  {
    id: 'q7',
    skill: 'Vocabulary',
    band: 'P3',
    weight: 2,
    text: '"Mitigate" is closest in meaning to ______.',
    options: ['worsen', 'ignore', 'reduce', 'predict'],
    correct: 2,
    explain: '"Mitigate" means reduce or lessen.',
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
    explain: 'Correlation suggests a relationship, but does not prove causation.',
  },
  {
    id: 'q9',
    skill: 'Grammar',
    band: 'P4',
    weight: 3,
    text: 'Hardly ______ the proposal when the committee requested revisions.',
    options: ['we submitted', 'had we submitted', 'we had submit', 'did we submitting'],
    correct: 1,
    explain: 'Inversion after negative adverb: hardly had we submitted...',
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
    explain: 'Academic style prefers precise formal language like "exceptionally robust."',
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
    explain: 'Academic claims should be cautious and evidence-based.',
  },
  {
    id: 'q12',
    skill: 'Grammar',
    band: 'P4',
    weight: 3,
    text: 'No sooner ______ the experiment than the sensor failed.',
    options: ['did we begin', 'we began', 'had we begun', 'we had begin'],
    correct: 2,
    explain: 'Inversion with "No sooner" takes past perfect: had we begun.',
  },
  {
    id: 'q13',
    skill: 'Vocabulary',
    band: 'P1',
    weight: 1,
    text: 'Choose the best synonym for "simple".',
    options: ['complex', 'easy', 'formal', 'difficult'],
    correct: 1,
    explain: '"Easy" is the closest in meaning to simple.',
  },
  {
    id: 'q14',
    skill: 'Grammar',
    band: 'P1',
    weight: 1,
    text: 'There ______ many students in the library now.',
    options: ['is', 'are', 'be', 'was'],
    correct: 1,
    explain: 'Plural subject takes "are".',
  },
  {
    id: 'q15',
    skill: 'Reading',
    band: 'P1',
    weight: 1,
    text: 'Which sentence is the most neutral and formal?',
    options: [
      'The lecture was kinda boring.',
      'The lecture was extremely boring.',
      'The lecture was uninteresting.',
      'The lecture sucked.',
    ],
    correct: 2,
    explain: '"Uninteresting" is formal and neutral.',
  },
  {
    id: 'q16',
    skill: 'Grammar',
    band: 'P2',
    weight: 1,
    text: 'Neither the students nor the teacher ______ late.',
    options: ['were', 'was', 'are', 'be'],
    correct: 1,
    explain: 'With "neither/nor", the verb agrees with the closest subject (teacher).',
  },
  {
    id: 'q17',
    skill: 'Vocabulary',
    band: 'P2',
    weight: 1,
    text: 'The opposite of "increase" is ______.',
    options: ['enhance', 'expand', 'reduce', 'boost'],
    correct: 2,
    explain: '"Reduce" is the opposite of increase.',
  },
  {
    id: 'q18',
    skill: 'Reading',
    band: 'P2',
    weight: 1,
    text: 'Which option best fits academic tone?',
    options: [
      'Kids should study a lot.',
      'Students should engage in consistent study.',
      'Students gotta study more.',
      'Studying is whatever.',
    ],
    correct: 1,
    explain: 'Academic tone prefers formal phrasing.',
  },
  {
    id: 'q19',
    skill: 'Grammar',
    band: 'P3',
    weight: 2,
    text: 'Had the data ______ earlier, the decision would have changed.',
    options: ['arrive', 'arrived', 'arriving', 'to arrive'],
    correct: 1,
    explain: 'Past perfect inversion uses past participle: had arrived.',
  },
  {
    id: 'q20',
    skill: 'Vocabulary',
    band: 'P3',
    weight: 2,
    text: '"Ambiguous" most closely means ______.',
    options: ['clear', 'uncertain', 'popular', 'recent'],
    correct: 1,
    explain: 'Ambiguous means unclear or uncertain.',
  },
  {
    id: 'q21',
    skill: 'Reading',
    band: 'P3',
    weight: 2,
    text: 'Best interpretation of: "The findings are preliminary."',
    options: [
      'The findings are final and proven.',
      'The findings are early and may change.',
      'The findings are false.',
      'The findings are irrelevant.',
    ],
    correct: 1,
    explain: 'Preliminary means early, subject to change.',
  },
  {
    id: 'q22',
    skill: 'Grammar',
    band: 'P4',
    weight: 3,
    text: 'Only after the review ______ the committee approve the proposal.',
    options: ['did', 'did it', 'did the committee', 'has the committee'],
    correct: 2,
    explain: 'Inversion after "Only after": did the committee approve...',
  },
  {
    id: 'q23',
    skill: 'Vocabulary',
    band: 'P4',
    weight: 3,
    text: 'Choose the best academic word: "The results were very clear."',
    options: ['The results were super clear.', 'The results were transparent.', 'The results were ok.', 'The results were kinda clear.'],
    correct: 1,
    explain: '"Transparent" is the most formal academic choice.',
  },
  {
    id: 'q24',
    skill: 'Reading',
    band: 'P4',
    weight: 3,
    text: 'Which statement is most cautious and academic?',
    options: [
      'This proves the policy always works.',
      'This suggests the policy may be effective under specific conditions.',
      'This policy is perfect.',
      'This policy can never fail.',
    ],
    correct: 1,
    explain: 'Academic style favors cautious claims.',
  },
  {
    id: 'q25',
    skill: 'Grammar',
    band: 'P1',
    weight: 1,
    text: 'There ______ a new policy announced yesterday.',
    options: ['is', 'was', 'are', 'be'],
    correct: 1,
    explain: 'Past singular subject takes "was".',
  },
  {
    id: 'q26',
    skill: 'Vocabulary',
    band: 'P1',
    weight: 1,
    text: 'Choose the best meaning of "important".',
    options: ['trivial', 'significant', 'tiny', 'optional'],
    correct: 1,
    explain: '"Significant" is closest in meaning to important.',
  },
  {
    id: 'q27',
    skill: 'Reading',
    band: 'P1',
    weight: 1,
    text: 'Which sentence is most formal?',
    options: [
      'I can’t go cause I’m sick.',
      'I cannot attend because I am ill.',
      'I’m sick so I can’t go.',
      'I can’t go, I’m ill lol.',
    ],
    correct: 1,
    explain: 'Formal writing avoids contractions and informal language.',
  },
  {
    id: 'q28',
    skill: 'Grammar',
    band: 'P1',
    weight: 1,
    text: 'She ______ English every day.',
    options: ['study', 'studies', 'studying', 'studied'],
    correct: 1,
    explain: 'Third-person singular takes -s: she studies.',
  },
  {
    id: 'q29',
    skill: 'Grammar',
    band: 'P2',
    weight: 1,
    text: 'If I ______ more time, I would read more articles.',
    options: ['have', 'had', 'will have', 'has'],
    correct: 1,
    explain: 'Second conditional uses past simple in the if-clause.',
  },
  {
    id: 'q30',
    skill: 'Vocabulary',
    band: 'P2',
    weight: 1,
    text: '"Benefit" is closest in meaning to ______.',
    options: ['advantage', 'problem', 'mistake', 'delay'],
    correct: 0,
    explain: 'Benefit means advantage.',
  },
  {
    id: 'q31',
    skill: 'Reading',
    band: 'P2',
    weight: 1,
    text: 'Which option shows cause–effect?',
    options: [
      'It rained. Therefore, the match was canceled.',
      'It rained. The policy changed.',
      'It rained. Books are useful.',
      'It rained. Exams are difficult.',
    ],
    correct: 0,
    explain: 'Only option 1 is a direct cause–effect relationship.',
  },
  {
    id: 'q32',
    skill: 'Grammar',
    band: 'P2',
    weight: 1,
    text: 'The report ______ by the committee yesterday.',
    options: ['approve', 'was approved', 'approved', 'approving'],
    correct: 1,
    explain: 'Passive voice: was approved.',
  },
  {
    id: 'q33',
    skill: 'Grammar',
    band: 'P3',
    weight: 2,
    text: 'The findings ______ that attendance affects performance.',
    options: ['suggest', 'suggests', 'suggested', 'suggesting'],
    correct: 0,
    explain: 'Plural subject "findings" takes base verb "suggest".',
  },
  {
    id: 'q34',
    skill: 'Vocabulary',
    band: 'P3',
    weight: 2,
    text: '"Allocate" most closely means ______.',
    options: ['distribute', 'avoid', 'refuse', 'predict'],
    correct: 0,
    explain: 'Allocate means distribute or assign resources.',
  },
  {
    id: 'q35',
    skill: 'Reading',
    band: 'P3',
    weight: 2,
    text: 'Best paraphrase of "The sample was limited."',
    options: [
      'The sample was large.',
      'The sample size was small.',
      'The sample was perfect.',
      'The sample was irrelevant.',
    ],
    correct: 1,
    explain: 'Limited sample implies small size.',
  },
  {
    id: 'q36',
    skill: 'Grammar',
    band: 'P3',
    weight: 2,
    text: 'Not only ______ the deadline, but the report was incomplete.',
    options: ['we missed', 'did we miss', 'we miss', 'we missing'],
    correct: 1,
    explain: 'Inversion after "Not only": did we miss.',
  },
  {
    id: 'q37',
    skill: 'Grammar',
    band: 'P4',
    weight: 3,
    text: 'Little ______ the students realize the impact of citation errors.',
    options: ['did', 'do', 'had', 'were'],
    correct: 0,
    explain: 'Inversion after "Little": did the students realize.',
  },
  {
    id: 'q38',
    skill: 'Vocabulary',
    band: 'P4',
    weight: 3,
    text: '"Robust" most closely means ______.',
    options: ['fragile', 'strong', 'temporary', 'unclear'],
    correct: 1,
    explain: 'Robust means strong or reliable.',
  },
  {
    id: 'q39',
    skill: 'Reading',
    band: 'P4',
    weight: 3,
    text: 'Which claim is best supported in academic writing?',
    options: [
      'This method always works.',
      'This method appears effective for the sampled group.',
      'This method is obviously perfect.',
      'This method can never fail.',
    ],
    correct: 1,
    explain: 'Academic claims are cautious and evidence-based.',
  },
  {
    id: 'q40',
    skill: 'Vocabulary',
    band: 'P4',
    weight: 3,
    text: 'Choose the best academic word: "The results were very clear."',
    options: ['The results were crystal clear.', 'The results were transparent.', 'The results were nice.', 'The results were cool.'],
    correct: 1,
    explain: '"Transparent" fits academic tone best.',
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

  const missed = askedQuestions
    .filter((q) => answers[q.id] !== q.correct)
    .map((q) => ({
      id: q.id,
      text: q.text,
      correct: q.options[q.correct],
      correctIndex: q.correct,
      selectedIndex: Number.isFinite(answers[q.id]) ? answers[q.id] : null,
      options: q.options,
      explain: q.explain || '',
      skill: q.skill,
      band: q.band,
    }));

  return {
    band,
    cefr,
    accuracy,
    scoreText: `${earnedWeight}/${totalWeight}`,
    skillMap,
    weakestSkill,
    missed,
  };
}

function buildPlacementMistakeItem(item = {}) {
  const skill = String(item.skill || '').toLowerCase();
  const module = skill.includes('grammar') ? 'grammar' : skill.includes('reading') ? 'reading' : 'vocab';
  const selectedIdx = Number.isFinite(item.selectedIndex) ? item.selectedIndex : null;
  const correctIdx = Number.isFinite(item.correctIndex) ? item.correctIndex : null;
  const options = Array.isArray(item.options) ? item.options : [];
  return {
    module,
    moduleLabel: `Placement • ${item.skill || 'Vocabulary'}`,
    taskTitle: `Placement ${item.band || ''}`.trim(),
    question: item.text || '',
    options,
    correctIndex: correctIdx,
    selectedIndex: selectedIdx,
    correctText: item.correct || (correctIdx != null ? options[correctIdx] : ''),
    selectedText: selectedIdx != null ? options[selectedIdx] : 'Skipped',
    explanation: item.explain || '',
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
    <Screen scroll contentStyle={styles.container}>
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
            {result.missed?.length ? (
              <View style={styles.reviewBox}>
                <Text style={styles.reviewTitle}>Review Missed Items</Text>
                {result.missed.map((m) => (
                  <View key={m.id} style={styles.reviewRow}>
                    <Text style={styles.reviewQ}>{m.text}</Text>
                    <Text style={styles.reviewA}>Correct: {m.correct}</Text>
                    {m.explain ? <Text style={styles.reviewExplain}>{m.explain}</Text> : null}
                    <Button
                      label="Open Mistake Coach"
                      variant="secondary"
                      onPress={() => navigation.navigate('MistakeCoach', { mistakes: [buildPlacementMistakeItem(m)] })}
                      style={styles.reviewCoachBtn}
                    />
                  </View>
                ))}
              </View>
            ) : null}

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
  reviewBox: {
    width: '100%',
    backgroundColor: '#FDF4FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewTitle: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  reviewRow: {
    marginBottom: spacing.sm,
  },
  reviewQ: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  reviewA: {
    fontSize: 12,
    color: colors.primaryDark,
  },
  reviewExplain: {
    fontSize: 12,
    color: colors.muted,
  },
  reviewCoachBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
