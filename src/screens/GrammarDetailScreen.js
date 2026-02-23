import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, spacing, typography } from '../theme/tokens';
import baseTasks from '../../data/grammar_tasks.json';
import hardTasks from '../../data/grammar_tasks_hard.json';
import { useAppState } from '../context/AppState';
import { buildSimilarQuestion } from '../utils/similarQuestion';
import { buildGrammarOpenEndedPrompts } from '../utils/openEndedPrompts';

const tasks = [...baseTasks, ...hardTasks];

function buildGrammarFeedback(task, answers = {}) {
  const qs = task?.questions || [];
  if (!qs.length) return null;
  let correct = 0;
  const missed = [];
  const bySkill = {};
  qs.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    if (ok) correct += 1;
    else missed.push({ index: i + 1, q: q.q, explain: q.explain });
    const key = q.skill || q.topic || 'general';
    if (!bySkill[key]) bySkill[key] = { c: 0, t: 0 };
    bySkill[key].t += 1;
    if (ok) bySkill[key].c += 1;
  });
  const accuracy = Math.round((correct / qs.length) * 100);
  const strengths = [];
  const fixes = [];
  if (accuracy >= 80) strengths.push('Strong grammar accuracy and option elimination.');
  if (accuracy >= 60) strengths.push('Core grammar patterns are mostly stable.');
  if (accuracy < 60) fixes.push('Re-read lesson notes before each question block.');
  if (missed.length >= 2) fixes.push('Mark grammar clue words (tense markers, articles, prepositions).');
  const skillBreakdown = Object.entries(bySkill).map(([name, val]) => ({
    name,
    pct: Math.round((val.c / Math.max(1, val.t)) * 100),
    correct: val.c,
    total: val.t,
  }));
  return { accuracy, correct, total: qs.length, strengths, fixes, missed, skillBreakdown };
}

export default function GrammarDetailScreen({ route, navigation }) {
  const taskId = route?.params?.taskId;
  const questionLimit = Number(route?.params?.questionLimit || 0);
  const shuffleSeed = Number(route?.params?.shuffleSeed || 0);
  const examMode = Boolean(route?.params?.examMode);
  const task = useMemo(() => tasks.find((t) => t.id === taskId) || tasks[0], [taskId]);
  const hasValidTask = Boolean(task && Array.isArray(task.questions) && task.questions.length > 0);
  const taskQuestions = useMemo(() => {
    const list = Array.isArray(task?.questions) ? [...task.questions] : [];
    if (!list.length) return [];
    if (shuffleSeed > 0) {
      let seed = shuffleSeed;
      for (let i = list.length - 1; i > 0; i -= 1) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        const tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
      }
    }
    if (questionLimit > 0) return list.slice(0, Math.min(questionLimit, list.length));
    return list;
  }, [task, questionLimit, shuffleSeed]);
  const activeTask = useMemo(() => ({ ...task, questions: taskQuestions }), [task, taskQuestions]);
  const openEndedPrompts = useMemo(() => buildGrammarOpenEndedPrompts(task), [task]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [checked, setChecked] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(true);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState({});
  const [similarAnswers, setSimilarAnswers] = useState({});
  const [similarChecked, setSimilarChecked] = useState({});
  const [similarSeed, setSimilarSeed] = useState(1);
  const [showOnlyMissed, setShowOnlyMissed] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [remainingSec, setRemainingSec] = useState(15 * 60);
  const [showHints, setShowHints] = useState(true);
  const [confidence, setConfidence] = useState({});
  const { addGrammarResult, recordGrammarError } = useAppState();
  const grammarFeedback = useMemo(() => (checked ? buildGrammarFeedback(activeTask, answers) : null), [checked, activeTask, answers]);
  const missedIndexes = useMemo(
    () => (grammarFeedback ? grammarFeedback.missed.map((m) => m.index - 1) : []),
    [grammarFeedback]
  );

  // Parse explain text into structured segments
  const lessonSegments = useMemo(() => {
    const raw = task.explain || '';
    return raw.split('\n').map(line => line.trim()).filter(Boolean);
  }, [task.explain]);
  const lessonFlashcards = useMemo(
    () => lessonSegments.filter((line) => line.length > 20).slice(0, 6),
    [lessonSegments]
  );

  const getQuestionExplain = useCallback((q) => {
    if (q.explain) return q.explain;
    const taskIntro = (task.explain || '').split('\n')[0] || '';
    return `Correct answer: "${q.options[q.answer]}". ${taskIntro}`;
  }, [task.explain]);

  const select = (qi, oi) => {
    if (checked) return;
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
  };

  const check = useCallback(() => {
    if (checked) return;
    let correct = 0;
    taskQuestions.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });
    const result = { taskId: task.id, score: correct, total: taskQuestions.length };
    setScore(`${correct} / ${taskQuestions.length}`);
    addGrammarResult(result);
    if (correct < taskQuestions.length) {
      recordGrammarError(task.id, task.title);
    }
    setChecked(true);
  }, [checked, task, taskQuestions, answers, addGrammarResult, recordGrammarError]);

  const createSimilarQuestion = (questionIndex) => {
    const base = taskQuestions[questionIndex];
    if (!base) return;
    const generated = buildSimilarQuestion(base, similarSeed + questionIndex);
    setSimilarQuestions((prev) => ({ ...prev, [questionIndex]: generated }));
    setSimilarSeed((s) => s + 1);
    setSimilarAnswers((prev) => ({ ...prev, [questionIndex]: null }));
    setSimilarChecked((prev) => ({ ...prev, [questionIndex]: false }));
  };

  const selectSimilar = (qi, oi) => {
    if (similarChecked[qi]) return;
    setSimilarAnswers((prev) => ({ ...prev, [qi]: oi }));
  };
  const visibleQuestionIndexes = useMemo(() => {
    const all = taskQuestions.map((_, idx) => idx);
    if (!checked || !showOnlyMissed || !grammarFeedback) return all;
    const missedSet = new Set(grammarFeedback.missed.map((m) => m.index - 1));
    return all.filter((i) => missedSet.has(i));
  }, [taskQuestions, checked, showOnlyMissed, grammarFeedback]);
  const unansweredCount = useMemo(
    () => taskQuestions.filter((_, idx) => answers[idx] == null).length,
    [taskQuestions, answers]
  );
  const firstUnanswered = useMemo(
    () => taskQuestions.findIndex((_, idx) => answers[idx] == null),
    [taskQuestions, answers]
  );

  useEffect(() => {
    if (!timedMode || checked) return undefined;
    if (remainingSec <= 0) return undefined;
    const t = setInterval(() => {
      setRemainingSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [timedMode, checked, remainingSec]);

  useEffect(() => {
    if (timedMode && remainingSec === 0 && !checked) {
      check();
    }
  }, [timedMode, remainingSec, checked, check]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };
  const confidenceStats = useMemo(() => {
    if (!checked) return null;
    let confTotal = 0;
    let confCorrect = 0;
    Object.keys(confidence).forEach((key) => {
      const idx = Number(key);
      if (confidence[key] !== 'confident') return;
      confTotal += 1;
      if (answers[idx] === taskQuestions[idx]?.answer) confCorrect += 1;
    });
    return { confTotal, confCorrect, pct: confTotal ? Math.round((confCorrect / confTotal) * 100) : null };
  }, [checked, confidence, answers, taskQuestions]);
  const confidenceCoach = useMemo(() => {
    if (!checked) return null;
    let overconfidentMistakes = 0;
    let underconfidentCorrect = 0;
    taskQuestions.forEach((q, idx) => {
      const tag = confidence[idx];
      const ok = answers[idx] === q.answer;
      if (tag === 'confident' && !ok) overconfidentMistakes += 1;
      if (tag === 'unsure' && ok) underconfidentCorrect += 1;
    });
    return { overconfidentMistakes, underconfidentCorrect };
  }, [checked, taskQuestions, confidence, answers]);

  const retryIncorrectNow = () => {
    if (!grammarFeedback) return;
    const nextAnswers = {};
    Object.keys(answers).forEach((key) => {
      const idx = Number(key);
      if (!missedIndexes.includes(idx)) {
        nextAnswers[idx] = answers[idx];
      }
    });
    setAnswers(nextAnswers);
    setChecked(false);
    setScore(null);
    setShowOnlyMissed(true);
    setTimedMode(false);
    setRemainingSec(10 * 60);
  };
  const checkWithGuard = useCallback(() => {
    if (checked) return;
    if (unansweredCount > 0) {
      Alert.alert(
        'Some questions are empty',
        `You left ${unansweredCount} question(s) unanswered. Check anyway?`,
        [
          { text: 'Continue Solving', style: 'cancel' },
          { text: 'Check Now', onPress: check },
        ]
      );
      return;
    }
    check();
  }, [checked, unansweredCount, check]);

  return (
    <Screen scroll contentStyle={styles.container}>
      {!hasValidTask ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Grammar task is unavailable.</Text>
          <Button label="Back" variant="secondary" onPress={() => navigation?.goBack()} />
        </Card>
      ) : null}
      {hasValidTask ? (
        <>
      <Text style={styles.h1}>{task.title}</Text>
      <Text style={styles.sub}>Level {task.level} {'\u2022'} {task.time}</Text>
      {examMode ? <Text style={styles.note}>Exam mode: randomized set ({taskQuestions.length} questions)</Text> : null}

      {/* Score card when checked */}
      {checked && (
        <Card style={[styles.scoreCard, score.startsWith(`${taskQuestions.length}`) ? styles.perfectScoreCard : null]}>
          {score.startsWith(`${taskQuestions.length}`) && (
            <Text style={styles.perfectText}>Perfect score. Strong control.</Text>
          )}
          <Text style={styles.scoreText}>Score: {score}</Text>
        </Card>
      )}

      {grammarFeedback && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Grammar Feedback</Text>
          <Text style={styles.body}>Accuracy: {grammarFeedback.accuracy}% ({grammarFeedback.correct}/{grammarFeedback.total})</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${grammarFeedback.accuracy}%` }]} />
          </View>
          {grammarFeedback.strengths.map((s) => (
            <Text key={s} style={styles.correct}>• {s}</Text>
          ))}
          {grammarFeedback.fixes.map((s) => (
            <Text key={s} style={styles.incorrect}>• {s}</Text>
          ))}
          {grammarFeedback.skillBreakdown.length > 0 && (
            <>
              <Text style={styles.answer}>Skill Breakdown</Text>
              {grammarFeedback.skillBreakdown.map((s) => (
                <Text key={s.name} style={styles.note}>{s.name}: {s.pct}% ({s.correct}/{s.total})</Text>
              ))}
            </>
          )}
          <View style={styles.row}>
            <Button
              label={showOnlyMissed ? 'Show All Questions' : 'Show Only Missed'}
              variant="secondary"
              onPress={() => setShowOnlyMissed((v) => !v)}
            />
            {grammarFeedback.missed.length > 0 ? (
              <Button
                label="Retry Incorrect Now"
                variant="secondary"
                onPress={retryIncorrectNow}
              />
            ) : null}
          </View>
          {confidenceStats?.pct != null ? (
            <Text style={styles.note}>Confidence calibration: {confidenceStats.pct}% ({confidenceStats.confCorrect}/{confidenceStats.confTotal})</Text>
          ) : null}
          {confidenceCoach ? (
            <>
              <Text style={styles.note}>Overconfident mistakes: {confidenceCoach.overconfidentMistakes}</Text>
              <Text style={styles.note}>Unsure but correct: {confidenceCoach.underconfidentCorrect}</Text>
            </>
          ) : null}
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.h3}>Exam Controls</Text>
        <Text style={styles.body}>Timer: {formatTime(remainingSec)}</Text>
        <View style={styles.row}>
          <Button
            label={timedMode ? 'Pause Timer' : 'Start 15m Timer'}
            variant="secondary"
            onPress={() => setTimedMode((v) => !v)}
            disabled={checked}
          />
          <Button
            label="Reset Timer"
            variant="secondary"
            onPress={() => {
              setTimedMode(false);
              setRemainingSec(15 * 60);
            }}
            disabled={checked}
          />
          <Button
            label={showHints ? 'Hints On' : 'Hints Off'}
            variant={showHints ? 'primary' : 'secondary'}
            onPress={() => setShowHints((v) => !v)}
          />
        </View>
      </Card>

      {/* Collapsible Lesson Notes */}
      <View style={styles.lessonCard}>
        <TouchableOpacity onPress={() => setLessonOpen(o => !o)} style={styles.lessonHeader}>
          <Text style={styles.lessonHeaderText}>Lesson Notes</Text>
          <Text style={styles.lessonToggle}>{lessonOpen ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
        {lessonOpen && (
          <View style={styles.lessonBody}>
            {lessonSegments.map((line, i) => {
              const isBullet = line.startsWith('-');
              const isKeyRule = line.startsWith('Key rule') || line.startsWith('Key edit') || line.startsWith('Advanced') || line.startsWith('Common') || line.startsWith('Key preposi');
              return (
                <Text
                  key={i}
                  style={
                    isBullet ? styles.lessonBullet
                      : isKeyRule ? styles.lessonSectionHead
                        : styles.lessonText
                  }
                >
                  {isBullet ? '\u2022 ' + line.slice(1).trim() : line}
                </Text>
              );
            })}
          </View>
        )}
      </View>

      {lessonFlashcards.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Rule Flashcards</Text>
          {lessonFlashcards.map((line, idx) => (
            <View key={`flash-${idx}`} style={styles.flashCard}>
              <Text style={styles.flashLabel}>Rule {idx + 1}</Text>
              <Text style={styles.note}>{line}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Examples Card: wrong -> correct */}
      {task.examples && task.examples.length > 0 && (
        <View style={styles.examplesCard}>
          <TouchableOpacity onPress={() => setExamplesOpen(o => !o)} style={styles.lessonHeader}>
            <Text style={styles.examplesTitle}>Common Errors and Corrections</Text>
            <Text style={styles.lessonToggle}>{examplesOpen ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
          {examplesOpen && task.examples.map((ex, i) => (
            <View key={i} style={styles.exampleItem}>
              <View style={styles.exWrongBox}>
                <Text style={styles.exLabel}>WRONG</Text>
                <Text style={styles.exWrongText}>{ex.wrong}</Text>
              </View>
              <Text style={styles.arrowText}>{'\u2193'} Correct form:</Text>
              <View style={styles.exCorrectBox}>
                <Text style={styles.exCorrectText}>{ex.correct}</Text>
              </View>
              <Text style={styles.exNote}>Rule: {ex.note}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Progress card */}
      <OpenEndedPracticeCard
        title="Open-Ended Grammar Questions"
        prompts={openEndedPrompts}
        placeholder="Write your grammar explanation..."
      />

      {/* Progress card */}
      <Card style={styles.card}>
        <Text style={styles.h3}>Your Progress</Text>
        <Text style={styles.body}>Answered: {Object.keys(answers).length}/{taskQuestions.length}</Text>
        <Text style={styles.note}>Unanswered: {unansweredCount}</Text>
        <View style={styles.row}>
          <Button label={checked ? 'Checked' : 'Check Answers'} onPress={checkWithGuard} disabled={checked || Object.keys(answers).length === 0} />
          <Button
            label="First Unanswered"
            variant="secondary"
            onPress={() => {
              if (firstUnanswered === -1) return;
              const q = taskQuestions[firstUnanswered];
              Alert.alert(`Q${firstUnanswered + 1}`, q.q);
            }}
            disabled={firstUnanswered === -1}
          />
          <Button label="Back" variant="secondary" onPress={() => navigation?.goBack()} />
        </View>
      </Card>

      {/* Questions */}
      {visibleQuestionIndexes.length === 0 && checked ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>No missed questions left.</Text>
        </Card>
      ) : null}
      {visibleQuestionIndexes.map((qi) => {
        const q = taskQuestions[qi];
        return (
        <Card key={qi} style={styles.card}>
          <Text style={styles.h3}>Q{qi + 1}. {q.q}</Text>
          {!checked && showHints && q.explain ? (
            <Text style={styles.hintText}>Hint: {String(q.explain).split('.')[0]}.</Text>
          ) : null}
          {!checked ? (
            <View style={styles.row}>
              <Button
                label="Confident"
                variant={confidence[qi] === 'confident' ? 'primary' : 'secondary'}
                onPress={() => setConfidence((prev) => ({ ...prev, [qi]: 'confident' }))}
              />
              <Button
                label="Unsure"
                variant={confidence[qi] === 'unsure' ? 'primary' : 'secondary'}
                onPress={() => setConfidence((prev) => ({ ...prev, [qi]: 'unsure' }))}
              />
            </View>
          ) : null}
          {q.options.map((opt, oi) => (
            <Button
              key={oi}
              label={opt}
              variant={
                checked
                  ? (oi === q.answer ? 'primary' : (answers[qi] === oi ? 'ghost' : 'secondary'))
                  : (answers[qi] === oi ? 'primary' : 'secondary')
              }
              onPress={() => select(qi, oi)}
              disabled={checked}
            />
          ))}
          {checked && (
            <>
              <Text style={answers[qi] === q.answer ? styles.correct : styles.incorrect}>
                {answers[qi] === q.answer ? 'Correct' : `Incorrect (Your answer: ${q.options[answers[qi]] || '—'})`}
              </Text>
              <Text style={styles.answer}>Correct: {q.options[q.answer]}</Text>
              <Text style={styles.explain}>{getQuestionExplain(q)}</Text>
              {answers[qi] !== q.answer && (
                <Button
                  label={similarQuestions[qi] ? 'New Similar Question' : 'Generate Similar Question'}
                  variant="secondary"
                  onPress={() => createSimilarQuestion(qi)}
                />
              )}
            </>
          )}

          {/* Similar question */}
          {similarQuestions[qi] && (
            <View style={styles.similarBlock}>
              <Text style={styles.h3}>Similar Question</Text>
              <Text style={styles.body}>{similarQuestions[qi].q}</Text>
              {similarQuestions[qi].options.map((opt, oi) => (
                <Button
                  key={oi}
                  label={opt}
                  variant={
                    similarChecked[qi]
                      ? (oi === similarQuestions[qi].answer ? 'primary' : (similarAnswers[qi] === oi ? 'ghost' : 'secondary'))
                      : (similarAnswers[qi] === oi ? 'primary' : 'secondary')
                  }
                  onPress={() => selectSimilar(qi, oi)}
                  disabled={!!similarChecked[qi]}
                />
              ))}
              {!similarChecked[qi] && similarAnswers[qi] !== null && (
                <Button
                  label="Check"
                  onPress={() => setSimilarChecked(prev => ({ ...prev, [qi]: true }))}
                />
              )}
              {similarChecked[qi] && (
                <Text style={similarAnswers[qi] === similarQuestions[qi].answer ? styles.correct : styles.incorrect}>
                  {similarAnswers[qi] === similarQuestions[qi].answer ? 'Correct!' : `Incorrect. Answer: ${similarQuestions[qi].options[similarQuestions[qi].answer]}`}
                </Text>
              )}
            </View>
          )}
        </Card>
      );
      })}
      </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  scoreCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  perfectScoreCard: {
    backgroundColor: '#1F8B4C',
    borderColor: '#1F8B4C',
    shadowColor: '#1F8B4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  perfectText: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  scoreText: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    textAlign: 'center',
  },
  // Lesson notes
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonHeaderText: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  lessonToggle: {
    fontSize: typography.small,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  lessonBody: {
    marginTop: spacing.md,
  },
  flashCard: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  flashLabel: {
    fontSize: typography.xsmall,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  lessonText: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  lessonBullet: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: 4,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  lessonSectionHead: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  // Examples
  examplesCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD54F',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  examplesTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: '#5D4037',
  },
  exampleItem: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FFD54F',
  },
  exWrongBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  exLabel: {
    fontSize: 10,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    marginBottom: 2,
  },
  exWrongText: {
    fontSize: typography.small,
    color: '#B71C1C',
    fontFamily: typography.fontBody,
  },
  arrowText: {
    fontSize: typography.small,
    color: colors.muted,
    marginLeft: spacing.sm,
    marginVertical: 2,
  },
  exCorrectBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  exCorrectText: {
    fontSize: typography.small,
    color: '#1B5E20',
    fontFamily: typography.fontBody,
  },
  exNote: {
    fontSize: 11,
    color: '#795548',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Answer feedback
  answer: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  explain: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  hintText: {
    fontSize: typography.small,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
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
  correct: {
    fontSize: typography.small,
    color: '#1F8B4C',
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  incorrect: {
    fontSize: typography.small,
    color: '#B42318',
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  similarBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
});
