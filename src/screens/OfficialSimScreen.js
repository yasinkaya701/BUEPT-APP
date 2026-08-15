/**
 * OfficialSimScreen.js — Real BUSEPT simulation mode.
 *
 * Reproduces the official YADYOK exam flow end-to-end:
 *   1. Selective Listening (played once)
 *   2. Careful Listening (played once)
 *   3. Reading I
 *   4. Reading II
 *   5. Writing Task 1 (timed draft)
 *   6. Writing Task 2 (timed draft)
 * with a single global countdown and a full results report at the end.
 */
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Text, StyleSheet, View, TextInput, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { generateAiMock, loadMockBank } from '../utils/aiMockGenerator';
import { saveMockHistory } from '../utils/appStorage';

const PASS_MARK = 60;
const SIM_TOTAL_SECONDS = 150 * 60; // official total window

function bandFor(score) {
  if (score >= 80) return 'Strong B2';
  if (score >= 70) return 'B2';
  if (score >= 60) return 'B1/B2 borderline';
  if (score >= 50) return 'B1';
  return 'Below B1';
}

const STAGE_META = {
  listening1: { label: 'Listening I — Selective', desc: 'Main ideas, signposts and lecture structure. The recording is played once only — focus on signpost phrases.', durationLabel: '≈ 15 min' },
  listening2: { label: 'Listening II — Careful', desc: 'Details, numbers, qualifiers and evidence. Played once only — take structured notes on specifics.', durationLabel: '≈ 15 min' },
  reading1: { label: 'Reading I', desc: 'First full text (~10 questions). Skim the paragraph topics first, then read questions.', durationLabel: '≈ 25 min' },
  reading2: { label: 'Reading II', desc: 'Second full text (~10 questions). Watch for paraphrase between text and options.', durationLabel: '≈ 25 min' },
  writing1: { label: 'Writing Task 1', desc: 'First essay (≈250 words). Plan 5 min, write 20 min. Clear thesis, one example, conclusion.', durationLabel: '25 min' },
  writing2: { label: 'Writing Task 2', desc: 'Second essay (≈250 words). Different angle — contrast, cause/effect or opinion.', durationLabel: '25 min' },
};

const STAGES = ['listening1', 'listening2', 'reading1', 'reading2', 'writing1', 'writing2'];

export default function OfficialSimScreen({ route, navigation }) {
  const { mockHistory, setMockHistory } = useAppState();
  const level = route?.params?.level || 'P3';
  const [status, setStatus] = useState('intro'); // intro | briefing | stage | report
  const [exam, setExam] = useState(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SIM_TOTAL_SECONDS);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [essays, setEssays] = useState({ writing1: '', writing2: '' });
  const [report, setReport] = useState(null);
  const [writingSeconds, setWritingSeconds] = useState(25 * 60);
  const timerRef = useRef(null);
  const writingTimerRef = useRef(null);
  const finishAllRef = useRef(finishAll);
  finishAllRef.current = finishAll;
  const gradeRef = useRef(grade);
  gradeRef.current = grade;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (writingTimerRef.current) clearInterval(writingTimerRef.current);
    };
  }, []);

  const startSim = useCallback(async () => {
    setStatus('briefing');
  }, []);

  const beginExam = useCallback(async () => {
    try {
      let bank = loadMockBank();
      let lvl = level;
      let found = null;
      if (bank && bank.length) {
        found = bank.find((m) => m.level === lvl && m.section === 'full');
      }
      if (!found) {
        const fresh = await generateAiMock({ section: 'full', level: lvl });
        if (fresh?.exam) {
          found = fresh.exam;
        }
      }
      if (!found) {
        Alert.alert('Could not load a full mock', 'Try the AI Mock Generator first to create a full BUSEPT mock, then return here.');
        setStatus('intro');
        return;
      }
      setExam(found);
      setStatus('stage');
      setStageIdx(0);
      setTimeLeft(SIM_TOTAL_SECONDS);
      setWritingSeconds(25 * 60);
      setAnswers({});
      setEssays({ writing1: '', writing2: '' });
      setChecked(false);
      setReport(null);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (e) {
      Alert.alert('Simulation error', 'Something went wrong while loading the mock. Please try again.');
      setStatus('intro');
    }
  }, [level]);

  useEffect(() => {
    if (timeLeft <= 0 && status === 'stage' && timerRef.current) {
      clearInterval(timerRef.current);
      finishAllRef.current();
    }
  }, [timeLeft, status]);

  // Writing-task countdown (per task 25 min within overall window)
  const isWriting = STAGES[stageIdx].startsWith('writing');
  useEffect(() => {
    if (!isWriting || status !== 'stage') return;
    if (writingTimerRef.current) clearInterval(writingTimerRef.current);
    writingTimerRef.current = setInterval(() => {
      setWritingSeconds((s) => (s <= 1 ? s : s - 1));
    }, 1000);
    return () => {
      if (writingTimerRef.current) clearInterval(writingTimerRef.current);
    };
  }, [isWriting, status]);

  const stageKey = STAGES[stageIdx];
  const stageMeta = STAGE_META[stageKey];

  const secQuestions = useMemo(() => {
    if (!exam) return [];
    if (stageKey === 'listening1' || stageKey === 'listening2') {
      const lst = exam.sections?.listening || exam.listening || {};
      const qs = lst.questions || [];
      if (stageKey === 'listening1') return qs.slice(0, Math.ceil(qs.length / 2));
      return qs.slice(Math.ceil(qs.length / 2));
    }
    if (stageKey === 'reading1' || stageKey === 'reading2') {
      const rdg = exam.sections?.reading || exam.reading || {};
      const qs = rdg.questions || [];
      if (stageKey === 'reading1') return qs.slice(0, Math.ceil(qs.length / 2));
      return qs.slice(Math.ceil(qs.length / 2));
    }
    return [];
  }, [exam, stageKey]);

  const select = (key, idx) => {
    if (checked) return;
    setAnswers((prev) => ({ ...prev, [key]: idx }));
  };

  const nextStage = useCallback(() => {
    if (stageIdx >= STAGES.length - 1) {
      finishAll();
      return;
    }
    setStageIdx((i) => i + 1);
    setWritingSeconds(25 * 60);
  }, [stageIdx, finishAll]);

  const grade = useCallback((qs, prefix) => { // eslint-disable-line no-unused-vars
    let correct = 0;
    const graded = qs.map((q, i) => {
      const key = `${prefix}${i}`;
      const picked = answers[key];
      const ans = Array.isArray(q.answer) ? q.answer[0] : q.answer; // kept for reporting in graded items
      let isCorrect = false;
      if (picked != null) {
        if (Array.isArray(q.answer)) {
          isCorrect = q.answer.some((a) => String(a).trim().toLowerCase() === String(answers[key] || '').trim().toLowerCase());
        } else {
          isCorrect = String(picked).trim().toLowerCase() === String(ans).trim().toLowerCase();
        }
      }
      if (isCorrect) correct += 1;
      return { key, question: q.q, picked, correct: ans, isCorrect };
    });
    return { graded, correct, total: qs.length ? Math.round((correct / qs.length) * 100) : 0 };
  }, [answers]);

  const essayWords = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;

  const finishAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (writingTimerRef.current) clearInterval(writingTimerRef.current);
    setChecked(true);
    const lst = exam.sections?.listening || exam.listening || {};
    const rdg = exam.sections?.reading || exam.reading || {};
    const lqs = lst.questions || [];
    const rqs = rdg.questions || [];
    const listening = gradeRef.current(lqs, 'lq');
    const reading = gradeRef.current(rqs, 'rq');
    const sectionResults = [
      { label: 'Listening I — Selective', correct: listening.graded.slice(0, Math.ceil(lqs.length / 2)).filter((g) => g.isCorrect).length, total: Math.ceil(lqs.length / 2) },
      { label: 'Listening II — Careful', correct: listening.graded.slice(Math.ceil(lqs.length / 2)).filter((g) => g.isCorrect).length, total: lqs.length - Math.ceil(lqs.length / 2) },
      { label: 'Reading I', correct: reading.graded.slice(0, Math.ceil(rqs.length / 2)).filter((g) => g.isCorrect).length, total: Math.ceil(rqs.length / 2) },
      { label: 'Reading II', correct: reading.graded.slice(Math.ceil(rqs.length / 2)).filter((g) => g.isCorrect).length, total: rqs.length - Math.ceil(rqs.length / 2) },
      { label: 'Writing Task 1', wordCount: essayWords(essays.writing1), target: 250 },
      { label: 'Writing Task 2', wordCount: essayWords(essays.writing2), target: 250 },
    ];
    const scored = [listening.total, reading.total];
    const overall = Math.round((scored.reduce((a, b) => a + b, 0) / scored.length));
    const result = {
      type: 'official_sim',
      examId: exam.id || 'official_sim',
      title: `BUSEPT Official Simulation (${level})`,
      date: new Date().toISOString(),
      score: overall,
      total: 100,
      listening,
      reading,
      sectionResults,
      band: bandFor(overall),
      passed: overall >= PASS_MARK,
    };
    setReport(result);
    setStatus('report');
    try {
      saveMockHistory([...(Array.isArray(mockHistory) ? mockHistory : []), result]);
      if (setMockHistory) setMockHistory([...(Array.isArray(mockHistory) ? mockHistory : []), result]);
    } catch (e) {
      // storage failure must not break the report
    }
  }, [exam, answers, essays, level, mockHistory, setMockHistory]);
  finishAllRef.current = finishAll;
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ---------- INTRO ----------
  if (status === 'intro') {
    return (
      <Screen scroll contentStyle={styles.container}>
        <Text style={styles.h1}>Official BUSEPT Simulation</Text>
        <Text style={styles.sub}>Full exam rehearsal following the real YADYOK order. Requires a full-level mock (generate one in AI Mock Generator if none exists).</Text>
        <Card style={styles.card}>
          <Text style={styles.h3}>What to expect</Text>
          {STAGES.map((s) => (
            <View key={s} style={styles.stagePreviewRow}>
              <Text style={styles.stagePreviewLabel}>{STAGE_META[s].label}</Text>
              <Text style={styles.stagePreviewDur}>{STAGE_META[s].durationLabel}</Text>
            </View>
          ))}
          <Text style={styles.policyLine}>Pass mark: 60. Listening recordings play once only, exactly like the real exam.</Text>
          <View style={styles.row}>
            <Button label="Start Simulation" icon="play-outline" onPress={startSim} />
          </View>
        </Card>
      </Screen>
    );
  }

  // ---------- BRIEFING ----------
  if (status === 'briefing') {
    return (
      <Screen scroll contentStyle={styles.container}>
        <Text style={styles.h1}>Exam Briefing</Text>
        <Card style={styles.card}>
          <Text style={styles.h3}>Real exam rules</Text>
          <Text style={styles.body}>• Total window: 150 minutes, single global timer.</Text>
          <Text style={styles.body}>• Listening plays once — no replay, no pause.</Text>
          <Text style={styles.body}>• Two essays of ~250 words each; 25 minutes per task.</Text>
          <Text style={styles.body}>• No back-tracking between sections during the timed flow.</Text>
          <Text style={styles.body}>• Sections: Selective Listening → Careful Listening → Reading I → Reading II → Writing I → Writing II.</Text>
          <View style={styles.row}>
            <Button label="Begin Exam" icon="play-outline" onPress={beginExam} />
            <Button label="Cancel" variant="secondary" onPress={() => setStatus('intro')} />
          </View>
        </Card>
      </Screen>
    );
  }

  // ---------- REPORT ----------
  if (status === 'report' && report) {
    const spent = SIM_TOTAL_SECONDS - timeLeft;
    return (
      <Screen scroll contentStyle={styles.container}>
        <Text style={styles.h1}>Simulation Report</Text>
        <Card style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{report.score}%</Text>
          <Text style={styles.bandText}>{report.band} · {report.passed ? 'PASS' : 'BELOW PASS MARK'}</Text>
          <Text style={styles.timeText}>Time used: {formatTime(spent)} of 150:00</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.h3}>Section breakdown</Text>
          {report.sectionResults.map((s, i) => (
            <View key={s.label} style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>{s.label}</Text>
              {s.wordCount != null ? (
                <Text style={[styles.sectionScore, s.wordCount >= s.target ? styles.pass : styles.fail]}>
                  {s.wordCount} words / ~{s.target}
                </Text>
              ) : (
                <Text style={[styles.sectionScore, s.total >= PASS_MARK ? styles.pass : styles.fail]}>
                  {s.correct}/{s.total} ({s.total}%)
                </Text>
              )}
            </View>
          ))}
        </Card>
        <Card style={styles.card}>
          <Text style={styles.h3}>Next steps</Text>
          <Text style={styles.body}>• Listening under 60%: drill signposts and qualifier words before retaking.</Text>
          <Text style={styles.body}>• Essays below ~200 words: practice 20-minute timed drafting daily.</Text>
          <Text style={styles.body}>• Save this result to Mock History and track progress there.</Text>
          <View style={styles.row}>
            <Button label="Back to Home" variant="secondary" onPress={() => navigation.goBack?.()} />
          </View>
        </Card>
      </Screen>
    );
  }

  // ---------- STAGE ----------
  if (!exam) return null;
  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.h1}>BUSEPT Simulation</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>
      <Card style={styles.stageCard}>
        <Text style={styles.stageLabel}>{stageIdx + 1} / {STAGES.length}</Text>
        <Text style={styles.h3}>{stageMeta.label}</Text>
        <Text style={styles.body}>{stageMeta.desc}</Text>
        {isWriting && <Text style={styles.writingTimer}>Task timer: {formatTime(writingSeconds)}</Text>}
      </Card>

      {isWriting ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Write your essay (~250 words)</Text>
          <TextInput
            style={styles.essayInput}
            value={essays[stageKey]}
            onChangeText={(t) => setEssays((p) => ({ ...p, [stageKey]: t }))}
            placeholder="Start writing here..."
            placeholderTextColor={colors.muted}
            multiline
            editable
          />
          <Text style={styles.wordCount}>{essayWords(essays[stageKey])} words</Text>
          <View style={styles.row}>
            <Button label="Finish Task" onPress={nextStage} />
          </View>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.h3}>{stageKey.includes('listening') ? 'Listening transcript (played once — study it, then answer)' : 'Reading passage'}</Text>
          <Text style={styles.body}>{(exam.sections?.[stageKey.includes('listening') ? 'listening' : 'reading']?.passage) || exam[stageKey.includes('listening') ? 'listening' : 'reading']?.passage || 'Passage not available in this mock.'}</Text>
        </Card>
      )}

      {!isWriting && secQuestions.map((q, i) => {
        const key = `${stageKey === 'listening1' ? 'lq' : stageKey === 'listening2' ? 'lq' : 'rq'}${i + (stageKey === 'listening2' || stageKey === 'reading2' ? Math.ceil((exam.sections?.[stageKey.includes('listening') ? 'listening' : 'reading']?.questions || exam[stageKey.includes('listening') ? 'listening' : 'reading']?.questions || []).length / 2) : 0)}`;
        const picked = answers[key];
        const ans = Array.isArray(q.answer) ? q.answer[0] : q.answer;
        const isCorrect = picked != null && (Array.isArray(q.answer) ? q.answer.some((a) => String(a).trim().toLowerCase() === String(picked).trim().toLowerCase()) : String(picked).trim().toLowerCase() === String(ans).trim().toLowerCase());
        return (
          <Card key={key} style={styles.card}>
            <Text style={styles.h3}>Q{i + 1}. {q.q}</Text>
            {(q.options || []).map((opt, oi) => (
              <Button
                key={oi}
                label={opt}
                variant={picked === oi ? 'primary' : 'secondary'}
                onPress={() => select(key, oi)}
              />
            ))}
            {q.type === 'short_answer' && (
              <TextInput
                style={styles.shortInput}
                value={String(answers[key] || '')}
                onChangeText={(t) => !checked && setAnswers((p) => ({ ...p, [key]: t }))}
                placeholder="Type your answer..."
                placeholderTextColor={colors.muted}
              />
            )}
            {checked && <Text style={isCorrect ? styles.correct : styles.incorrect}>{isCorrect ? 'Correct' : `Incorrect — correct: ${Array.isArray(q.answer) ? q.answer.join(' / ') : ans}`}</Text>}
          </Card>
        );
      })}

      <View style={styles.row}>
        <Button label={stageIdx >= STAGES.length - 1 ? 'Finish Simulation' : 'Next Section'} icon="arrow-forward-outline" onPress={nextStage} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  h3: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: typography.body, color: colors.muted, marginBottom: spacing.md, lineHeight: 20 },
  body: { fontSize: typography.body, fontFamily: typography.fontBody, color: colors.text, lineHeight: 22, marginTop: 6 },
  card: { marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  timerBadge: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  timerText: { color: '#FFFFFF', fontWeight: '700', fontSize: typography.body },
  stageCard: { ...shadow.md, backgroundColor: '#0A1628', borderColor: colors.primary, borderWidth: 1, borderRadius: 14, padding: spacing.md, marginBottom: spacing.md },
  stageLabel: { color: '#93C5FD', fontSize: typography.small, fontWeight: '700', marginBottom: 4 },
  writingTimer: { color: '#FBBF24', fontSize: typography.small, fontWeight: '700', marginTop: spacing.xs },
  stagePreviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  stagePreviewLabel: { fontSize: typography.small, color: colors.text, flex: 1 },
  stagePreviewDur: { fontSize: typography.small, color: colors.muted },
  policyLine: { fontSize: typography.small, color: colors.muted, marginTop: spacing.sm, lineHeight: 18 },
  scoreCard: { backgroundColor: '#0A1628', borderRadius: 14, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
  scoreValue: { fontSize: 44, fontWeight: '800', color: '#DDE8FF', fontFamily: typography.fontHeadline },
  bandText: { fontSize: typography.body, color: '#93C5FD', fontWeight: '700', marginTop: 4 },
  timeText: { fontSize: typography.small, color: colors.muted, marginTop: spacing.xs },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionLabel: { fontSize: typography.body, color: colors.text, flex: 1 },
  sectionScore: { fontSize: typography.body, fontWeight: '700' },
  pass: { color: '#15803D' },
  fail: { color: '#DC2626' },
  correct: { color: '#15803D', marginTop: spacing.xs, fontSize: typography.small, fontWeight: '700' },
  incorrect: { color: '#DC2626', marginTop: spacing.xs, fontSize: typography.small, fontWeight: '700' },
  essayInput: { borderWidth: 2, borderColor: colors.secondary, borderRadius: 12, padding: spacing.md, fontSize: typography.body, color: colors.text, backgroundColor: colors.surface, fontFamily: typography.fontBody, minHeight: 180, textAlignVertical: 'top' },
  wordCount: { fontSize: typography.small, color: colors.muted, marginTop: spacing.xs },
  shortInput: { borderWidth: 2, borderColor: colors.secondary, borderRadius: 10, padding: spacing.sm, fontSize: typography.body, color: colors.text, backgroundColor: colors.surface, marginTop: spacing.xs },
});
