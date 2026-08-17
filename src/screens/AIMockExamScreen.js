/**
 * AIMockExamScreen.js — AI-generated BUSEPT mock exam runner
 *
 * Runs an AI-generated mock following the official YADYOK exam order:
 * Selective Listening → Careful Listening → Reading I (Search) → Reading II
 * (Careful) → Writing. Short answers are graded with a case-insensitive
 * keyword/phrase match against the model-answer variants; multiple choice
 * and matching use the stored correct index. Section scores follow the
 * BUEPT pass mark of 60 with an S/F grade.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { assessSpokenResponse, speakingPtsFor } from '../utils/speakingExamAssessment';

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  backBtn: { marginRight: spacing.md },
  headerTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
    flex: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  timerText: { color: '#fff', fontSize: 13, fontWeight: '900', fontFamily: 'Courier' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl, gap: spacing.md },
  qCounter: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
  progBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3 },
  progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  contentCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md },
  contentLabel: { fontSize: 12, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', marginBottom: spacing.sm },
  contentText: { fontSize: 15, color: colors.text, lineHeight: 24 },
  qCard: { marginHorizontal: spacing.xl, padding: spacing.xl, marginBottom: spacing.xl, minHeight: 160, justifyContent: 'center' },
  qTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: spacing.md,
  },
  qText: { fontSize: 18, color: colors.text, lineHeight: 28, fontWeight: '600', marginBottom: spacing.md },
  optionsWrap: { gap: spacing.md, marginBottom: spacing.md },
  speakHint: {
    backgroundColor: colors.cardSoft || colors.soft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  speakHintText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  answerInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
    minHeight: 56,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  wordCount: { fontSize: 12, color: colors.muted, marginTop: spacing.xs, fontWeight: '700' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  navButton: { width: '48%' },
  heroCard: { marginHorizontal: spacing.xl, alignItems: 'center', padding: spacing.xxl, marginBottom: spacing.xl },
  heroLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  heroScore: { fontSize: 64, fontWeight: '900', lineHeight: 70 },
  heroPass: { color: colors.success },
  heroFail: { color: colors.error },
  heroGrade: { fontSize: 16, fontWeight: '900', color: colors.text, marginTop: spacing.xs },
  heroBand: { fontSize: 13, color: colors.muted, marginTop: spacing.xs },
  sectionCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1, marginRight: spacing.sm },
  sectionScore: { fontSize: 15, fontWeight: '900' },
  passText: { color: colors.success },
  failText: { color: colors.error },
  gapText: { fontSize: 12, color: colors.errorDark, marginBottom: spacing.sm, lineHeight: 17 },
  reviewCard: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  reviewCorrect: { borderColor: colors.success, borderWidth: 1 },
  reviewNeutral: { borderColor: colors.muted, borderWidth: 1, borderStyle: 'dashed', opacity: 0.75 },
  reviewIncorrect: { borderColor: colors.error, borderWidth: 1 },
  reviewQ: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.xs },
  reviewYours: { fontSize: 13, color: colors.error, fontWeight: '700', marginBottom: 2 },
  reviewModel: { fontSize: 13, color: colors.success, fontWeight: '800' },
  reviewMore: { fontSize: 12, color: colors.muted, marginTop: spacing.xs },
  doneBtn: { marginHorizontal: spacing.xl, marginTop: spacing.lg },
  emptyText: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: spacing.md },
  recCard: { marginTop: spacing.md, gap: spacing.md },
  recTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recFallback: { fontSize: 11, color: colors.muted, flex: 1, lineHeight: 15 },
  recError: { fontSize: 12, color: colors.error, flex: 1, lineHeight: 16 },
  recTranscript: { backgroundColor: '#fff', borderRadius: 10, padding: spacing.md },
  recTranscriptLabel: { fontSize: 11, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', marginBottom: 4 },
  recTranscriptText: { fontSize: 14, color: colors.text, lineHeight: 21 },
  recNote: { borderWidth: 1, borderColor: colors.border || colors.primarySoft, borderRadius: 8, padding: spacing.sm, fontSize: 13, color: colors.text, backgroundColor: colors.cardSoft || colors.soft, minHeight: 60, textAlignVertical: 'top', marginTop: spacing.sm },
  spReview: { marginTop: spacing.md },
  spReviewHead: { marginBottom: spacing.md },
  spReviewBand: { fontSize: 16, fontWeight: '900', color: colors.success },
  spReviewMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  spBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.sm },
  spBarLabel: { fontSize: 12, fontWeight: '800', color: colors.text, width: 130 },
  spBarTrack: { flex: 1, height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 },
  spBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  spBarValue: { fontSize: 12, fontWeight: '900', color: colors.primaryDark, width: 30, textAlign: 'right' },
  spSectionLabel: { fontSize: 12, fontWeight: '800', color: colors.text, marginTop: spacing.sm, textTransform: 'uppercase' },
  spSectionLabelGap: { marginTop: spacing.md },
  spListText: { fontSize: 13, color: colors.text, lineHeight: 19, marginTop: 2 },
  spTranscriptText: { fontSize: 13, color: colors.muted, lineHeight: 19, fontStyle: 'italic' },
});

const PASS_MARK = 60;
const CEFR_BANDS = [
  { min: 90, band: 'C1' },
  { min: 80, band: 'B2+' },
  { min: 68, band: 'B2' },
  { min: 58, band: 'B1+' },
  { min: 48, band: 'B1' },
  { min: 0, band: 'A2' },
];

// METÜ SFL band descriptors (Oct 2025 official scale) — see MockResultScreen METU_BANDS
const METU_BANDS = [
  { min: 90, label: 'A Band · Advanced' },
  { min: 80, label: 'B Band · Upper' },
  { min: 68, label: 'C Band · Proficient' },
  { min: 55, label: 'D Band · Approaching' },
  { min: 40, label: 'E Band · Developing' },
  { min: 0, label: 'F Band · Foundational' },
];

/** Official METU scoring keys map to the extracted section keys. */
const ODTU_KEY_MAP = {
  listening: ['listening-selective'],
  reading: ['reading-search'],
  noteTaking: ['note-taking'],
  writing: ['writing-0', 'writing-1'],
  speaking: ['speaking-practice'],
};

function bandFor(score, isOdtuExam) {
  if (isOdtuExam) {
    return (METU_BANDS.find((b) => score >= b.min) || METU_BANDS[METU_BANDS.length - 1]).label;
  }
  return (CEFR_BANDS.find((b) => score >= b.min) || CEFR_BANDS[CEFR_BANDS.length - 1]).band;
}

/** Normalize a string for comparison: lowercase, strip punctuation/whitespace. */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\u00e0-\u00ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Grade a short-answer response against model answer variants. */
function gradeShortAnswer(response, modelAnswers) {
  const answers = Array.isArray(modelAnswers) ? modelAnswers.filter(Boolean) : [];
  const resp = norm(response);
  if (!resp) return 0;
  for (const a of answers) {
    const cand = norm(a);
    if (!cand) continue;
    if (resp === cand || resp.includes(cand) || cand.includes(resp)) return 1;
    const rWords = resp.split(' ');
    const cWords = cand.split(' ');
    const common = rWords.filter((w) => cWords.includes(w)).length;
    if (common >= Math.ceil(Math.min(rWords.length, cWords.length) * 0.6) && common > 0) return 1;
  }
  return 0;
}

function extractSections(exam) {
  const out = [];
  if (exam.listening?.selective?.questions?.length) {
    out.push({
      key: 'listening-selective',
      kind: 'listening',
      title: exam.listening.selective.title || 'Selective Listening',
      sub: 'Questions are in the order of the lecture. Write only short answers.',
      content: exam.listening.selective.transcript || '',
      contentLabel: 'Lecture Transcript (plays/reads once in the real exam)',
      questions: exam.listening.selective.questions,
    });
  }
  if (exam.listening?.careful?.questions?.length) {
    out.push({
      key: 'listening-careful',
      kind: 'listening',
      title: exam.listening.careful.title || 'Careful Listening',
      sub: 'Take notes from the transcript, then answer from your notes.',
      content: exam.listening.careful.transcript || '',
      contentLabel: 'Lecture Transcript (note-taking)',
      questions: exam.listening.careful.questions,
    });
  }
  if (exam.reading?.search?.questions?.length) {
    out.push({
      key: 'reading-search',
      kind: 'reading',
      title: exam.reading.search.title || 'Reading I (Search)',
      sub: 'Scan the article and answer in the spaces provided. Give SHORT and PRECISE answers.',
      content: exam.reading.search.article || '',
      contentLabel: 'Article',
      questions: exam.reading.search.questions,
    });
  }
  if (exam.reading?.careful?.questions?.length) {
    out.push({
      key: 'reading-careful',
      kind: 'reading',
      title: exam.reading.careful.title || 'Reading II (Careful)',
      sub: 'Read carefully. For MC items, write the letter of the correct answer.',
      content: exam.reading.careful.article || '',
      contentLabel: 'Article',
      questions: exam.reading.careful.questions,
    });
  }
  // METU EPE/İYS has a separate Note-Taking block (lecture once → notes → answer).
  if (exam.noteTaking?.lecture?.questions?.length) {
    out.push({
      key: 'note-taking',
      kind: 'listening',
      title: exam.noteTaking.lecture.title || 'Note-Taking',
      sub: 'Listen/read the lecture ONCE and take notes, then answer from your notes.',
      content: exam.noteTaking.lecture.transcript || '',
      contentLabel: 'Lecture Transcript (listened once — note-taking section)',
      questions: exam.noteTaking.lecture.questions,
    });
  }
  // Bonus speaking practice: on BUSEPT it is interview prep (the real exam has
  // no speaking); on ODTÜ-EPE it mirrors the real 8-minute face-to-face block.
  if (exam.bonusPractice?.speaking?.questions?.length) {
    const isOdtuSpeak = exam?.meta?.university === 'odtu';
    out.push({
      key: 'speaking-practice',
      kind: 'speaking',
      title: isOdtuSpeak ? 'Speaking Practice (~8 min, real EPE block)' : 'Speaking Practice (bonus — interview prep)',
      sub: isOdtuSpeak
        ? 'Answer the prompts aloud; you will be scored on pronunciation, fluency and content.'
        : 'BUSEPT has no speaking section — these prompts are bonus interview practice. Speak freely, get instant feedback.',
      content: '',
      contentLabel: '',
      questions: exam.bonusPractice.speaking.questions,
    });
  }
  if (exam.writing?.essays?.length) {
    const isOdtu = exam?.meta?.university === 'odtu';
    exam.writing.essays.forEach((e, i) => {
      out.push({
        key: `writing-${i}`,
        kind: 'writing',
        title: `${isOdtu ? '' : `Task ${i + 1}: `}${e.topic || ''}`,
        sub: `About ${e.wordTarget || 250} words • ${(e.helperIdeas || []).join(' • ')}`,
        content: '',
        contentLabel: '',
        questions: [{ id: e.id || `w${i + 1}`, type: 'essay', q: e.topic, promptText: e.promptText }],
        essayMeta: e,
      });
    });
  }
  return out;
}

export default function AIMockExamScreen({ navigation, route }) {
  const exam = route?.params?.exam;
  const sections = useMemo(() => (exam ? extractSections(exam) : []), [exam]);

  const [phase, setPhase] = useState('section'); // section, results
  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // [sectionKey]: { [qIdx]: value }
  const [spoken, setSpoken] = useState({}); // [sectionKey]: { [qIdx]: { transcript, elapsedSec } }
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [recStartAt, setRecStartAt] = useState(0); // epoch ms when recording started
  const isSpeakingSection = section?.kind === 'speaking';

  // Live speech capture for the speaking section (web only; degrades on native).
  const recorder = useSpeechRecognition({
    onTranscript: (full) => {
      if (isSpeakingSection && question) {
        setSpoken((prev) => {
          const sec = { ...(prev[section.key] || {}) };
          sec[qIdx] = { ...(sec[qIdx] || {}), transcript: full, elapsedSec: recStartAt ? Math.round((Date.now() - recStartAt) / 1000) : 0 };
          return { ...prev, [section.key]: sec };
        });
      }
    },
  });

  const toggleRecording = useCallback(() => {
    if (!isSpeakingSection) return;
    if (recorder.isListening) {
      recorder.stop();
    } else {
      setRecStartAt(Date.now());
      recorder.start();
    }
  }, [recorder, isSpeakingSection]);

  useEffect(() => {
    if (!exam) navigation.goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  useEffect(() => {
    let timer;
    if (running && phase !== 'results') {
      timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [running, phase]);

  const section = sections[sectionIdx];
  const question = section?.questions?.[qIdx];
  const currentAnswer = answers[section?.key]?.[qIdx] ?? '';

  const setCurrentAnswer = useCallback(
    (val) =>
      setAnswers((prev) => {
        const sec = { ...(prev[section?.key] || {}) };
        sec[qIdx] = val;
        return { ...prev, [section.key]: sec };
      }),
    [section, qIdx],
  );

  const nextQuestion = () => {
    if (qIdx + 1 < section.questions.length) {
      setQIdx(qIdx + 1);
    } else if (sectionIdx + 1 < sections.length) {
      setSectionIdx(sectionIdx + 1);
      setQIdx(0);
    } else {
      setPhase('results');
      setRunning(false);
    }
  };

  const prevQuestion = () => {
    if (qIdx > 0) setQIdx(qIdx - 1);
    else if (sectionIdx > 0) {
      setSectionIdx(sectionIdx - 1);
      const prevSection = sections[sectionIdx - 1];
      setQIdx((prevSection?.questions?.length || 1) - 1);
    }
  };

  // ── Results computation ────────────────────────────────────────────────────
  // ODTÜ-EPE: weighted 100-point scale (L24/R32/NT9/W20/S15) with 60 pass / 85
  // exemption; BUSEPT: per-section 0–100 averages, 60 pass, S/F grade.
  const results = useMemo(() => {
    if (phase !== 'results') return null;
    const scoring = exam?.meta?.scoring || null;
    const isOdtuExam = exam?.meta?.university === 'odtu';
    const sectionResults = sections.map((secDef) => {
      const gradedAll = secDef.questions
        .map((q, i) => {
          const a = answers[secDef.key]?.[i];
          if (q.type === 'essay') {
            const words = String(a || '').trim().split(/\s+/).filter(Boolean).length;
            return {
              correct: words >= (secDef.essayMeta?.wordTarget || 250) * 0.8,
              score: words,
              max: secDef.essayMeta?.wordTarget || 250,
              isEssay: true,
              modelAnswer: null,
              yourAnswer: a,
            };
          }
          if (q.type === 'short_answer') {
            const score = gradeShortAnswer(a, q.answer || []);
            return { correct: score === 1, score: 100 * score, max: 100, modelAnswer: (q.answer || []).join(' / '), yourAnswer: a };
          }
          if (q.type === 'multiple_choice') {
            const picked = Number(a);
            const correct = Number.isFinite(picked) && picked === Number(q.correct);
            return {
              correct,
              score: correct ? 100 : 0,
              max: 100,
              modelAnswer: q.options?.[q.correct],
              yourAnswer: Number.isFinite(picked) ? q.options?.[picked] : 'Not answered',
            };
          }
          if (q.type === 'matching') {
            const picked = Number(a);
            const correct = Number.isFinite(picked) && picked === Number(q.correct);
            return {
              correct,
              score: correct ? 100 : 0,
              max: 100,
              modelAnswer: q.options?.[q.correct],
              yourAnswer: Number.isFinite(picked) ? q.options?.[picked] : 'Not answered',
            };
          }
          if (q.type === 'speaking') {
            const sp = spoken[secDef.key]?.[i] || {};
            const assessment = assessSpokenResponse({ promptText: q.q, transcript: sp.transcript, elapsedSec: sp.elapsedSec || 0 });
            return {
              correct: undefined,
              score: 0,
              max: 100,
              modelAnswer: null,
              yourAnswer: a,
              speakingRec: {
                transcript: sp.transcript || '',
                assessment,
                aiScore: assessment.overall,
                words: assessment.fluency.wordCount,
                wpm: assessment.fluency.wpm,
                fillers: assessment.fluency.fillerCount,
                accuracy: assessment.accuracy,
                band: assessment.band,
                strengths: assessment.strengths,
                improvements: assessment.improvements,
                dimensions: assessment.dimensions,
                notRecorded: assessment.notRecorded,
              },
            };
          }
          // Other types: no objective auto-grading — keep as practice input.
          return { correct: false, score: 0, max: 100, modelAnswer: null, yourAnswer: a };
        });
      // Separate the essay record: it cannot be objectively pass/failed against
      // other MC items, but its word-count ratio feeds the weighted essay pts.
      const essayRec = secDef.questions.some((q) => q.type === 'essay')
        ? gradedAll.find((r) => r && r.isEssay)
        : null;
      const graded = gradedAll.filter((r) => !r.isEssay);
      const total = graded.length ? Math.round(graded.reduce((acc, r) => acc + r.score, 0) / graded.length) : 0;
      // Essay weight: if the section is an essay and METU weights exist, score
      // the essay block out of its official pts by word-target ratio (like the
      // word-count check above) capped at the section's official share.
      const essayPts = secDef.kind === 'writing' && scoring ? scoring.writing : 0;
      const secScore = essayPts && essayRec
        ? Math.round((Math.min(1, (essayRec.score || 0) / (essayRec.max || 250))) * essayPts)
        : total;
      // Speaking: the AI composite (0–100) earns up to 85% of the official
      // Speaking pts; unanswered items keep the section practice-only.
      const speakingRec = secDef.kind === 'speaking' ? gradedAll.find((r) => r?.speakingRec) : null;
      const speakingPts = secDef.kind === 'speaking' && scoring ? speakingPtsFor(speakingRec?.speakingRec?.aiScore ?? 0, scoring) : 0;
      const secScoreFinal = secDef.kind === 'speaking' && speakingRec ? speakingPts : secScore;
      return { ...secDef, graded, essayRec, total, sectionScore: secScoreFinal, speakingRec: speakingRec?.speakingRec || null, passed: total >= PASS_MARK };
    });

    let overall = 0;
    if (isOdtuExam && scoring) {
      // Weighted METU 100-point scale: each official bucket is scored by its
      // (objective section count, averaged to 0–100) × official pts.
      const buckets = [
        { key: 'listening', secs: ODTU_KEY_MAP.listening, pts: scoring.listening },
        { key: 'reading', secs: ODTU_KEY_MAP.reading, pts: scoring.reading },
        { key: 'noteTaking', secs: ODTU_KEY_MAP.noteTaking, pts: scoring.noteTaking },
        { key: 'writing', secs: ODTU_KEY_MAP.writing, pts: scoring.writing },
        { key: 'speaking', secs: ODTU_KEY_MAP.speaking, pts: scoring.speaking },
      ];
      let earned = 0;
      let counted = 0;
      for (const b of buckets) {
        const matched = sectionResults.filter((s) => b.secs.includes(s.key));
        if (b.key === 'writing') {
          // Essay block: scored out of its official pts by word-target ratio
          // (objective auto-grading of essay content is not reliable enough to
          // pass/fail a student; the ratio still rewards a completed essay).
          const wr = matched.find((s) => s && s.essayRec);
          const essayRatio = wr ? Math.min(1, (wr.essayRec.score || 0) / (wr.essayRec.max || 250)) : 0;
          earned += essayRatio * b.pts;
          counted += b.pts;
          continue;
        }
        if (b.key === 'speaking') {
          // Speaking: AI composite earns up to 85% of the official pts; a
          // skipped speaking block keeps its pts out of the denominator.
          const sp = matched.find((s) => s && s.speakingRec);
          earned += sp ? sp.sectionScore : 0;
          counted += b.pts;
          continue;
        }
        const avg = matched.length
          ? matched.reduce((acc, s) => acc + s.total, 0) / matched.length
          : null;
        if (avg != null) {
          earned += (avg / 100) * b.pts;
          counted += b.pts;
        }
      }
      // Any bucket that stayed ungraded keeps its pts out of the denominator —
      // the 100-point total is rescaled over the graded buckets so that a
      // skipped section cannot silently drag the score down.
      overall = counted > 0 ? Math.round((earned / counted) * scoring.total) : 0;
    } else {
      const objective = sectionResults.filter((s) => s.graded.length > 0);
      overall = objective.length
        ? Math.round(objective.reduce((acc, r) => acc + r.total, 0) / objective.length)
        : 0;
    }
    return {
      sectionResults,
      overall,
      passed: overall >= PASS_MARK,
      exempt: isOdtuExam && overall >= (scoring?.exempt || 85),
      isOdtuExam,
      band: bandFor(overall, isOdtuExam),
    };
  }, [phase, answers, spoken, sections, exam]);

  if (!exam || sections.length === 0) {
    return (
      <Screen scroll contentStyle={styles.container}>
        <Card>
          <Text style={styles.emptyText}>This mock exam could not be loaded.</Text>
          <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </Card>
      </Screen>
    );
  }

  // ── Results view ───────────────────────────────────────────────────────────
  if (phase === 'results' && results) {
    return (
      <Screen scroll contentStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Exam Results</Text>
        </View>
        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>Overall Score</Text>
          <Text style={[styles.heroScore, results.passed ? styles.heroPass : styles.heroFail]}>{results.overall}</Text>
          {results.isOdtuExam ? (
            <>
              <Text style={styles.heroGrade}>
                {results.exempt ? '85+ — Muafiyet Bandında' : results.passed ? 'Geçme Bandında (60+)' : 'Geçme Bandının Altında'}
              </Text>
              <Text style={styles.heroBand}>METÜ SFL: {results.band} · Pass 60 · Exemption 85</Text>
            </>
          ) : (
            <>
              <Text style={styles.heroGrade}>{results.passed ? 'PASS — S (Satisfactory)' : 'FAIL — F'}</Text>
              <Text style={styles.heroBand}>Estimated CEFR band: {results.band}</Text>
            </>
          )}
        </Card>
        {results.sectionResults.map((sr) => (
          <Card key={sr.key} style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{sr.title}</Text>
              {results.isOdtuExam && sr.kind === 'speaking' ? (
                sr.speakingRec && !sr.speakingRec.notRecorded ? (
                  <Text style={[styles.sectionScore, { color: colors.success || '#16a34a' }]}>AI {sr.speakingRec.aiScore}/100 · {sr.sectionScore}/15 pts</Text>
                ) : (
                  <Text style={[styles.sectionScore, { color: colors.muted }]}>Practice — not auto-scored</Text>
                )
              ) : (
                <Text style={[styles.sectionScore, sr.passed ? styles.passText : styles.failText]}>
                  {results.isOdtuExam ? `${sr.sectionScore} pts` : `${sr.total}/100`}
                </Text>
              )}
            </View>
            {results.isOdtuExam && sr.kind === 'speaking' && sr.speakingRec && !sr.speakingRec.notRecorded ? (
              <SpeakingReview rec={sr.speakingRec} />
            ) : results.isOdtuExam && sr.kind === 'speaking' ? (
              <Text style={styles.gapText}>
                Speaking is a face-to-face interview in the real İYS — this is a rehearsal of the 4 unpredictable + 1 prepared questions. Use the microphone next time to receive an AI score.
              </Text>
            ) : !sr.passed ? (
              <Text style={styles.gapText}>
                {results.isOdtuExam
                  ? `Section average below 60 — needs work`
                  : `Gap to pass: ${PASS_MARK - sr.total} points (BUEPT pass mark is 60 per section)`}
              </Text>
            ) : null}
            {(sr.kind === 'writing' && sr.essayRec
              ? [{ q: `${sr.title} — word-count check (${sr.essayRec.score} / ${sr.essayRec.max} words)`, yourAnswer: sr.essayRec.yourAnswer == null || String(sr.essayRec.yourAnswer).trim() === '' ? '(not answered)' : String(sr.essayRec.yourAnswer), modelAnswer: null, correct: sr.essayRec.score >= (sr.essayRec.max || 250) * 0.8, isEssay: true }]
              : []
            ).concat(sr.graded || []).slice(0, 5).map((r, i) => (
              <View
                key={i}
                style={[
                  styles.reviewCard,
                  r.correct === undefined ? styles.reviewNeutral : r.correct ? styles.reviewCorrect : styles.reviewIncorrect,
                ]}
              >
                <Text style={styles.reviewQ}>{r.isEssay ? r.q.replace(/\s*—\s*word-count check.*$/, '') : (sr.questions && sr.questions[i])?.q || ''}</Text>
                <Text style={styles.reviewYours}>
                  {r.isEssay
                    ? `Submitted: ${r.yourAnswer == null || String(r.yourAnswer).trim() === '' ? '(not answered)' : `${String(r.yourAnswer).split(/\s+/).filter(Boolean).length} words`}`
                    : r.yourAnswer == null || String(r.yourAnswer).trim() === ''
                      ? r.correct === undefined
                        ? 'Practice item — answered during the interview'
                        : 'Your answer: —'
                      : `Your answer: ${r.yourAnswer}`}
                </Text>
                {r.isEssay
                  ? <Text style={styles.reviewModel}>Target: {sr.essayRec?.max || 250}+ words (≥80% earns the full writing share)</Text>
                  : !r.correct && r.modelAnswer != null && <Text style={styles.reviewModel}>Model answer: {r.modelAnswer}</Text>}
              </View>
            ))}
            {(sr.graded || []).length > 5 && <Text style={styles.reviewMore}>…and {(sr.graded || []).length - 5} more items</Text>}
          </Card>
        ))}
        <Button label="Done" onPress={() => navigation.goBack()} style={styles.doneBtn} />
      </Screen>
    );
  }

  // ── Section runner ─────────────────────────────────────────────────────────
  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <Button label="" variant="ghost" style={styles.backBtn} icon="close" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{section?.title}</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{fmtTime(elapsed)}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.qCounter}>
          Section {sectionIdx + 1}/{sections.length} • Q {qIdx + 1}/{section?.questions?.length || 0}
        </Text>
        <View style={styles.progBg}>
          <View style={[styles.progFill, { width: `${(((sectionIdx * 100) + (qIdx / Math.max(1, section.questions.length)) * 100) / sections.length)}%` }]} />
        </View>
      </View>

      {section.content ? (
        <Card style={styles.contentCard}>
          <Text style={styles.contentLabel}>{section.contentLabel}</Text>
          <Text style={styles.contentText}>{section.content}</Text>
        </Card>
      ) : null}

      {question && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={styles.qCard}>
            <Text style={styles.qTypeBadge}>{typeLabel(question.type)}</Text>
            <Text style={styles.qText}>{question.q}</Text>
            {question.type === 'multiple_choice' && Array.isArray(question.options) && (
              <View style={styles.optionsWrap}>
                {question.options.map((opt, i) => (
                  <Button
                    key={i}
                    label={`${String.fromCharCode(65 + i)}. ${opt}`}
                    variant={String(currentAnswer) === String(i) ? 'primary' : 'secondary'}
                    onPress={() => setCurrentAnswer(i)}
                  />
                ))}
              </View>
            )}
            {question.type === 'matching' && Array.isArray(question.options) && (
              <View style={styles.optionsWrap}>
                {question.options.map((opt, i) => (
                  <Button
                    key={i}
                    label={`${String.fromCharCode(65 + i)}. ${opt}`}
                    variant={String(currentAnswer) === String(i) ? 'primary' : 'secondary'}
                    onPress={() => setCurrentAnswer(i)}
                  />
                ))}
              </View>
            )}
            {question.type === 'speaking' && (
              <View style={styles.speakHint}>
                <Text style={styles.speakHintText}>
                  Answer aloud using the microphone. Your answer is transcribed and scored live (fluency, coherence, vocabulary). ODTÜ Speaking is worth 15 points on the official 100-point scale.
                </Text>
                <SpeakingRecorderCard
                  question={question}
                  rec={recorder}
                  onToggle={toggleRecording}
                  onChange={(t) => setSpoken((prev) => {
                    const sec = { ...(prev[section.key] || {}) };
                    sec[qIdx] = { ...(sec[qIdx] || {}), textAnswer: t };
                    return { ...prev, [section.key]: sec };
                  })}
                />
              </View>
            )}
            {(question.type === 'short_answer' || question.type === 'essay') && (
              <TextInput
                style={styles.answerInput}
                value={currentAnswer}
                onChangeText={setCurrentAnswer}
                placeholder={question.type === 'essay' ? 'Write your essay here…' : 'Write a short answer…'}
                placeholderTextColor={colors.muted}
                multiline={question.type === 'essay'}
                numberOfLines={question.type === 'essay' ? 8 : 1}
                textAlignVertical="top"
              />
            )}
            {question.type === 'essay' && (
              <Text style={styles.wordCount}>
                Words: {String(currentAnswer).trim().split(/\s+/).filter(Boolean).length}
              </Text>
            )}
          </Card>
        </KeyboardAvoidingView>
      )}

      <View style={styles.navRow}>
        <View style={styles.navButton}>
          <Button label="Back" variant="ghost" onPress={prevQuestion} disabled={sectionIdx === 0 && qIdx === 0} />
        </View>
        <View style={styles.navButton}>
          <Button
            label={sectionIdx === sections.length - 1 && qIdx === section.questions.length - 1 ? 'Submit Exam' : 'Next'}
            onPress={nextQuestion}
          />
        </View>
      </View>
    </Screen>
  );
}

function typeLabel(type) {
  if (type === 'essay') return 'Writing';
  if (type === 'speaking') return 'Speaking';
  if (type === 'short_answer') return 'Short Answer';
  if (type === 'multiple_choice') return 'Multiple Choice';
  if (type === 'matching') return 'Matching';
  return 'Question';
}

/** Live microphone panel for a speaking prompt inside the mock exam. */
function SpeakingRecorderCard({ question, rec, onToggle, onChange }) {
  const isListening = rec.isListening;
  const transcript = rec.transcript || '';
  return (
    <View style={styles.recCard}>
      <View style={styles.recTop}>
        <Button
          label={isListening ? '⏹ Stop Recording' : '🎤 Record Answer'}
          variant={isListening ? 'secondary' : 'primary'}
          onPress={onToggle}
          disabled={!rec.isAvailable}
        />
        {!rec.isAvailable && (
          <Text style={styles.recFallback}>Microphone not available — type your answer instead, or retry in a desktop browser.</Text>
        )}
        {rec.error ? <Text style={styles.recError}>{rec.error}</Text> : null}
      </View>
      {transcript ? (
        <View style={styles.recTranscript}>
          <Text style={styles.recTranscriptLabel}>AI transcript:</Text>
          <Text style={styles.recTranscriptText}>{transcript}</Text>
          {transcript.trim() && (
            <TextInput
              style={styles.recNote}
              value={rec.textAnswer || ''}
              onChangeText={onChange}
              placeholder="Edit or add to your answer (optional)…"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

/** Dimension score bar used by the speaking review in results. */
function SpeakingBar({ label, value }) {
  return (
    <View style={styles.spBarRow}>
      <Text style={styles.spBarLabel}>{label}</Text>
      <View style={styles.spBarTrack}>
        <View style={[styles.spBarFill, { width: `${Math.max(2, Math.min(100, value))}%` }]} />
      </View>
      <Text style={styles.spBarValue}>{value}</Text>
    </View>
  );
}

/** Speaking result card shown in the results view for the ODTÜ exam. */
function SpeakingReview({ rec }) {
  const d = rec.dimensions || {};
  return (
    <View style={styles.spReview}>
      <View style={styles.spReviewHead}>
        <View>
          <Text style={styles.spReviewBand}>AI Speaking Score: {rec.aiScore}/100</Text>
          <Text style={styles.spReviewMeta}>
            {rec.words} words · {rec.wpm} WPM · {rec.fillers} filler · {rec.accuracy}% accuracy
          </Text>
        </View>
      </View>
      <SpeakingBar label="Fluency" value={d.fluency || 0} />
      <SpeakingBar label="Coherence" value={d.coherence || 0} />
      <SpeakingBar label="Lexical Range" value={d.lexicalRange || 0} />
      <SpeakingBar label="Rubric Alignment" value={d.rubricAlignment || 0} />
      <SpeakingBar label="Stamina" value={d.speakingStamina || 0} />
      {Array.isArray(rec.strengths) && rec.strengths.length > 0 && (
        <>
          <Text style={styles.spSectionLabel}>Strengths</Text>
          {rec.strengths.map((s, i) => (
            <Text key={`st-${i}`} style={styles.spListText}>• {s}</Text>
          ))}
        </>
      )}
      {Array.isArray(rec.improvements) && rec.improvements.length > 0 && (
        <>
          <Text style={[styles.spSectionLabel, styles.spSectionLabelGap]}>Improvements</Text>
          {rec.improvements.map((s, i) => (
            <Text key={`im-${i}`} style={styles.spListText}>• {s}</Text>
          ))}
        </>
      )}
      {rec.transcript ? (
        <>
          <Text style={[styles.spSectionLabel, styles.spSectionLabelGap]}>Your transcript</Text>
          <Text style={styles.spTranscriptText}>{rec.transcript}</Text>
        </>
      ) : null}
    </View>
  );
}

function fmtTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

