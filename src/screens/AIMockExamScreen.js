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

const PASS_MARK = 60;
const CEFR_BANDS = [
  { min: 90, band: 'C1' },
  { min: 80, band: 'B2+' },
  { min: 68, band: 'B2' },
  { min: 58, band: 'B1+' },
  { min: 48, band: 'B1' },
  { min: 0, band: 'A2' },
];

function bandFor(score) {
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
  if (exam.writing?.essays?.length) {
    exam.writing.essays.forEach((e, i) => {
      out.push({
        key: `writing-${i}`,
        kind: 'writing',
        title: `Writing Task ${i + 1}: ${e.topic || ''}`,
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
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

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
  const results = useMemo(() => {
    if (phase !== 'results') return null;
    const sectionResults = sections.map((secDef) => {
      const graded = secDef.questions
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
          return { correct: false, score: 0, max: 100, modelAnswer: null, yourAnswer: a };
        })
        .filter((r) => !r.isEssay);
      const total = graded.length ? Math.round(graded.reduce((acc, r) => acc + r.score, 0) / graded.length) : 0;
      return { ...secDef, graded, total, passed: total >= PASS_MARK };
    });
    const objective = sectionResults.filter((s) => s.graded.length > 0);
    const overall = objective.length
      ? Math.round(objective.reduce((acc, r) => acc + r.total, 0) / objective.length)
      : 0;
    return { sectionResults, overall, passed: overall >= PASS_MARK, band: bandFor(overall) };
  }, [phase, answers, sections]);

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
          <Text style={styles.heroGrade}>{results.passed ? 'PASS — S (Satisfactory)' : 'FAIL — F'}</Text>
          <Text style={styles.heroBand}>Estimated CEFR band: {results.band}</Text>
        </Card>
        {results.sectionResults.map((sr) => (
          <Card key={sr.key} style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{sr.title}</Text>
              <Text style={[styles.sectionScore, sr.passed ? styles.passText : styles.failText]}>{sr.total}/100</Text>
            </View>
            {!sr.passed && <Text style={styles.gapText}>Gap to pass: {PASS_MARK - sr.total} points (BUEPT pass mark is 60 per section)</Text>}
            {sr.graded.slice(0, 5).map((r, i) => (
              <View key={i} style={[styles.reviewCard, r.correct ? styles.reviewCorrect : styles.reviewIncorrect]}>
                <Text style={styles.reviewQ}>{sr.questions[i]?.q}</Text>
                <Text style={styles.reviewYours}>Your answer: {r.yourAnswer || '—'}</Text>
                {!r.correct && r.modelAnswer != null && (
                  <Text style={styles.reviewModel}>Model answer: {r.modelAnswer}</Text>
                )}
              </View>
            ))}
            {sr.graded.length > 5 && (
              <Text style={styles.reviewMore}>…and {sr.graded.length - 5} more items</Text>
            )}
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
  if (type === 'short_answer') return 'Short Answer';
  if (type === 'multiple_choice') return 'Multiple Choice';
  if (type === 'matching') return 'Matching';
  return 'Question';
}

function fmtTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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
  reviewIncorrect: { borderColor: colors.error, borderWidth: 1 },
  reviewQ: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.xs },
  reviewYours: { fontSize: 13, color: colors.error, fontWeight: '700', marginBottom: 2 },
  reviewModel: { fontSize: 13, color: colors.success, fontWeight: '800' },
  reviewMore: { fontSize: 12, color: colors.muted, marginTop: spacing.xs },
  doneBtn: { marginHorizontal: spacing.xl, marginTop: spacing.lg },
  emptyText: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: spacing.md },
});
