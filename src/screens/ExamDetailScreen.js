import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Text, StyleSheet, View, Alert, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import exams from '../../data/buept_exams.json';
import { displayCorrectAnswer, gradeExam, gradeQuestion } from '../utils/answerGrading';
import { useAppState } from '../context/AppState';

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  h1: {
    flex: 1,
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  examShell: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
  },
  examTopBar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE7F5',
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  examEyebrow: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 5,
  },
  headerCopy: { flex: 1 },
  examMeta: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 999,
  },
  progressLabel: {
    width: 88,
    textAlign: 'right',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  timerBadge: {
    backgroundColor: '#08172A',
    borderColor: '#08172A',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 14,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  h2: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody
  },
  card: {
    marginBottom: spacing.lg
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  sectionBar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE7F5',
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  qWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  correct: {
    marginTop: spacing.sm,
    color: colors.success,
    fontFamily: typography.fontBody
  },
  incorrect: {
    marginTop: spacing.sm,
    color: colors.error,
    fontFamily: typography.fontBody
  },
  mistakeBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  scoreCard: {
    marginTop: spacing.lg,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    alignItems: 'center',
  },
  score: {
    fontSize: 30,
    fontWeight: '900',
    color: '#102A56',
    textAlign: 'center'
  },
  scoreSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md
  },
  inputContainer: {
    marginVertical: spacing.sm,
  },
  textInput: {
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: typography.fontBody,
  },
  inputCorrect: {
    borderColor: '#1F8B4C',
    backgroundColor: '#E8F5E9',
  },
  inputIncorrect: {
    borderColor: '#B42318',
    backgroundColor: '#FEF3F2',
  },
  formatHint: {
    marginTop: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    fontFamily: typography.fontBody,
  },
});

const EXAM_DURATION = 150 * 60; // 150 minutes

function keyIndex(items, key) {
  const idx = items.findIndex((a) => a.key === key);
  return idx >= 0 ? idx + 1 : '';
}

function buildExamMistakeItem({ examTitle, section, question, selectedIndex, context }) {
  const options = Array.isArray(question.options) ? question.options : [];
  const correctIdx = Number.isFinite(question.answer) ? question.answer : null;
  const selected = Number.isFinite(selectedIndex) ? selectedIndex : null;
  const module = section === 'listening' ? 'listening' : section === 'grammar' ? 'grammar' : 'reading';
  return {
    module,
    moduleLabel: `Exam • ${section}`,
    taskTitle: examTitle || 'BUEPT Exam',
    question: question.q || '',
    options,
    correctIndex: correctIdx,
    selectedIndex: selected,
    correctText: correctIdx != null ? options[correctIdx] : '',
    selectedText: selected != null ? options[selected] : 'Skipped',
    explanation: question.explain || '',
    context: context || '',
  };
}

export default function ExamDetailScreen({ route, navigation }) {
  const examId = route?.params?.examId;
  const exam = useMemo(() => exams.find((e) => e.id === examId) || exams[0], [examId]);
  const [activeSection, setActiveSection] = useState('reading'); // 'reading', 'listening', 'grammar'
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [similar, setSimilar] = useState({});
  const [checked, setChecked] = useState(false);
  const { setIsFocusMode } = useAppState();

  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const timerRef = useRef(null);

  useEffect(() => {
    setIsFocusMode(true);
    return () => setIsFocusMode(false);
  }, [setIsFocusMode]);

  const allQuestions = useMemo(() => {
    const sec = exam.sections;
    const all = [];
    const reading = sec.reading || {};
    if (Array.isArray(reading.passages)) {
      reading.passages.forEach((passage, pi) =>
        (passage.questions || []).forEach((q, qi) => {
          all.push({ key: `r${pi}_${qi}`, q, passage: passage.passage || '' });
        }),
      );
    } else if (Array.isArray(reading.questions)) {
      reading.questions.forEach((q, i) => {
        all.push({ key: `r${i}`, q, passage: reading.passage || '' });
      });
    }
    const listening = sec.listening || {};
    if (Array.isArray(listening.groups)) {
      listening.groups.forEach((group, gi) =>
        (group.questions || []).forEach((q, qi) => {
          all.push({ key: `l${gi}_${qi}`, q, passage: group.transcript || '' });
        }),
      );
    } else if (Array.isArray(listening.questions)) {
      listening.questions.forEach((q, i) => {
        all.push({ key: `l${i}`, q, passage: listening.passage || '' });
      });
    }
    const grammar = sec.grammar || {};
    (grammar.questions || []).forEach((q, i) => {
      all.push({ key: `g${i}`, q, passage: '' });
    });
    return all;
  }, [exam.sections]);

  const readingQuestions = useMemo(() => allQuestions.filter((a) => a.key.startsWith('r')),
    [allQuestions]);
  const listeningQuestions = useMemo(() => allQuestions.filter((a) => a.key.startsWith('l')),
    [allQuestions]);

  const check = useCallback(() => {
    const result = gradeExam(allQuestions, answers, similar);
    setScore(`${result.correct} / ${result.total}`);
    setChecked(true);
  }, [answers, allQuestions, similar]);

  useEffect(() => {
    if (checked) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          check(); // Auto submit
          Alert.alert('Time is up!', 'Your exam has been automatically submitted.');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [checked, check]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const select = (key, idx) => {
    if (checked) return;
    setAnswers((prev) => ({ ...prev, [key]: idx }));
  };

  const applySimilar = (key, q) => {
    setSimilar((prev) => ({ ...prev, [key]: q.similar || q }));
    setAnswers((prev) => ({ ...prev, [key]: undefined }));
    setChecked(false);
    setScore(null);
  };

  const sec = exam.sections;
  const sectionQuestions = activeSection === 'reading'
    ? readingQuestions
    : activeSection === 'listening'
      ? listeningQuestions
      : allQuestions.filter((item) => item.key.startsWith('g'));
  const answeredInSection = sectionQuestions.filter((item) => answers[item.key] !== undefined && answers[item.key] !== '').length;
  const sectionProgress = sectionQuestions.length
    ? Math.round((answeredInSection / sectionQuestions.length) * 100)
    : 0;

  const renderFeedback = (active, key) => {
    if (!checked) return null;
    const selected = answers[key];
    const result = gradeQuestion(active, selected);
    if (result.unanswered) {
      return <Text style={styles.incorrect}>No answer selected.</Text>;
    }

    return (
      <>
        <Text style={result.correct ? styles.correct : styles.incorrect}>
          {result.correct ? 'Correct' : `Incorrect (Your answer: ${String(selected)})`}
        </Text>
        <Text style={styles.meta}>Correct: {displayCorrectAnswer(active) || '—'}</Text>
        <Text style={styles.meta}>{active.explain || ''}</Text>
      </>
    );
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.examShell}>
        <View style={styles.examTopBar}>
          <Text style={styles.examEyebrow}>FOCUSED EXAM MODE</Text>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.h1}>{exam.title}</Text>
              <Text style={styles.examMeta}>Answer the active section, then move forward. Practice tools and global chat stay out of the exam surface.</Text>
            </View>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${sectionProgress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{answeredInSection}/{sectionQuestions.length} answered</Text>
          </View>
        </View>

        <View style={styles.sectionBar}>
          <View style={styles.tabRow}>
            <Button label="Reading" variant={activeSection === 'reading' ? 'primary' : 'secondary'} onPress={() => setActiveSection('reading')} />
            <Button label="Listening" variant={activeSection === 'listening' ? 'primary' : 'secondary'} onPress={() => setActiveSection('listening')} />
            <Button label="Grammar" variant={activeSection === 'grammar' ? 'primary' : 'secondary'} onPress={() => setActiveSection('grammar')} />
          </View>
          <Text style={styles.formatHint}>BUSEPT practice mode keeps the test surface focused. Listening and Reading use the exam-bank section structure; targeted grammar remains a supporting practice section when present in the selected mock.</Text>
        </View>

      {activeSection === 'reading' && (
        <>
          {sec.reading?.passages ? sec.reading.passages.map((passage, pi) => (
            <Card key={`passage_${pi}`} style={styles.card}>
              <Text style={styles.h3}>Passage {pi + 1}: {passage.title || ''}</Text>
              <Text style={styles.body}>{passage.passage}</Text>
              {passage.questions.map((q, qi) => {
                const key = `r${pi}_${qi}`;
                const active = similar[key] || q;
                const selected = answers[key];
                const isWrong = checked && !gradeQuestion(active, selected).correct;
                return (
                  <View key={key} style={styles.qWrap}>
                    <Text style={styles.h3}>Q{keyIndex(readingQuestions, key)}. {active.q}</Text>
                {active.type === 'short_answer' ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        checked && (
                          gradeQuestion(active, answers[key]).correct
                            ? styles.inputCorrect
                            : styles.inputIncorrect
                        )
                      ]}
                      value={answers[key] || ''}
                      onChangeText={(text) => !checked && setAnswers(p => ({ ...p, [key]: text }))}
                      placeholder="Type your short answer..."
                      placeholderTextColor={colors.muted}
                      editable={!checked}
                    />
                  </View>
                ) : (
                  (active.options || []).map((opt, oi) => (
                    <Button
                      key={oi}
                      label={opt}
                      variant={
                        checked
                          ? (gradeQuestion(active, oi).correct ? 'primary' : (answers[key] === oi ? 'errorGhost' : 'secondary'))
                          : (answers[key] === oi ? 'primary' : 'secondary')
                      }
                      onPress={() => select(key, oi)}
                      disabled={checked}
                    />
                  ))
                )}
                    {renderFeedback(active, key, 'passage')}
                    {isWrong && (
                      <Button
                        label="Open Mistake Coach"
                        variant="secondary"
                        onPress={() =>
                          navigation.navigate('MistakeCoach', {
                            mistakes: [
                              buildExamMistakeItem({
                                examTitle: exam.title,
                                section: 'reading',
                                question: active,
                                selectedIndex: selected,
                                context: passage.passage || '',
                              }),
                            ],
                          })
                        }
                        style={styles.mistakeBtn}
                      />
                    )}
                    {active.similar && (
                      <View style={styles.row}>
                        <Button label="Generate Similar" variant="secondary" onPress={() => applySimilar(key, active)} />
                        <Button label="I don't know" variant="secondary" onPress={() => applySimilar(key, active)} />
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          )) : sec.reading?.questions ? (
            <Card style={styles.card}>
              <Text style={styles.h3}>Reading Passage</Text>
              <Text style={styles.body}>{sec.reading.passage}</Text>
              {sec.reading.questions.map((q, i) => {
                const key = `r${i}`;
                const active = similar[key] || q;
                const selected = answers[key];
                const isWrong = checked && !gradeQuestion(active, selected).correct;
                return (
                  <View key={key} style={styles.qWrap}>
                    <Text style={styles.h3}>Q{i + 1}. {active.q}</Text>
                    {renderFeedback(active, key, 'passage')}
                    {isWrong && (
                      <Button
                        label="Open Mistake Coach"
                        variant="secondary"
                        onPress={() =>
                          navigation.navigate('MistakeCoach', {
                            mistakes: [
                              buildExamMistakeItem({
                                examTitle: exam.title,
                                section: 'reading',
                                question: active,
                                selectedIndex: selected,
                                context: sec.reading.passage || '',
                              }),
                            ],
                          })
                        }
                        style={styles.mistakeBtn}
                      />
                    )}
                    {active.similar && (
                      <View style={styles.row}>
                        <Button label="Generate Similar" variant="secondary" onPress={() => applySimilar(key, active)} />
                        <Button label="I don't know" variant="secondary" onPress={() => applySimilar(key, active)} />
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          ) : null}
        </>
      )}

      {activeSection === 'listening' && (
        <>
          {sec.listening?.groups ? sec.listening.groups.map((group, gi) => (
            <Card key={`group_${gi}`} style={styles.card}>
              <Text style={styles.h3}>Listening {gi + 1}: {group.title || ''}</Text>
              <Text style={styles.body}>{group.transcript || 'Listen to the audio track and answer the following questions.'}</Text>
              {group.questions.map((q, qi) => {
                const key = `l${gi}_${qi}`;
                const active = similar[key] || q;
                const selected = answers[key];
                const isWrong = checked && !gradeQuestion(active, selected).correct;
                return (
                  <View key={key} style={styles.qWrap}>
                    <Text style={styles.h3}>Q{keyIndex(listeningQuestions, key)}. {active.q}</Text>
                {active.type === 'short_answer' ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        checked && (
                          gradeQuestion(active, answers[key]).correct
                            ? styles.inputCorrect
                            : styles.inputIncorrect
                        )
                      ]}
                      value={answers[key] || ''}
                      onChangeText={(text) => !checked && setAnswers(p => ({ ...p, [key]: text }))}
                      placeholder="Type your short answer..."
                      placeholderTextColor={colors.muted}
                      editable={!checked}
                    />
                  </View>
                ) : (
                  (active.options || []).map((opt, oi) => (
                    <Button
                      key={oi}
                      label={opt}
                      variant={
                        checked
                          ? (gradeQuestion(active, oi).correct ? 'primary' : (answers[key] === oi ? 'errorGhost' : 'secondary'))
                          : (answers[key] === oi ? 'primary' : 'secondary')
                      }
                      onPress={() => select(key, oi)}
                      disabled={checked}
                    />
                  ))
                )}
                    {renderFeedback(active, key, 'transcript')}
                    {isWrong && (
                      <Button
                        label="Open Mistake Coach"
                        variant="secondary"
                        onPress={() =>
                          navigation.navigate('MistakeCoach', {
                            mistakes: [
                              buildExamMistakeItem({
                                examTitle: exam.title,
                                section: 'listening',
                                question: active,
                                selectedIndex: selected,
                                context: group.transcript || '',
                              }),
                            ],
                          })
                        }
                        style={styles.mistakeBtn}
                      />
                    )}
                    {active.similar && (
                      <View style={styles.row}>
                        <Button label="Generate Similar" variant="secondary" onPress={() => applySimilar(key, active)} />
                        <Button label="I don't know" variant="secondary" onPress={() => applySimilar(key, active)} />
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          )) : sec.listening?.questions ? (
            <Card style={styles.card}>
              <Text style={styles.h3}>Listening Context</Text>
              <Text style={styles.body}>{sec.listening.passage || "Listen to the audio track and answer the following questions."}</Text>
              {sec.listening.questions.map((q, i) => {
                const key = `l${i}`;
                const active = similar[key] || q;
                const selected = answers[key];
                const isWrong = checked && !gradeQuestion(active, selected).correct;
                return (
                  <View key={key} style={styles.qWrap}>
                    <Text style={styles.h3}>Q{i + 1}. {active.q}</Text>
                    {renderFeedback(active, key, 'transcript')}
                    {isWrong && (
                      <Button
                        label="Open Mistake Coach"
                        variant="secondary"
                        onPress={() =>
                          navigation.navigate('MistakeCoach', {
                            mistakes: [
                              buildExamMistakeItem({
                                examTitle: exam.title,
                                section: 'listening',
                                question: active,
                                selectedIndex: selected,
                                context: sec.listening.passage || '',
                              }),
                            ],
                          })
                        }
                        style={styles.mistakeBtn}
                      />
                    )}
                    {active.similar && (
                      <View style={styles.row}>
                        <Button label="Generate Similar" variant="secondary" onPress={() => applySimilar(key, active)} />
                        <Button label="I don't know" variant="secondary" onPress={() => applySimilar(key, active)} />
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          ) : null}
        </>
      )}

      {activeSection === 'grammar' && (
        <>
          <Text style={styles.h2}>Grammar Section</Text>
          {(sec.grammar?.questions || []).length === 0 && (
            <Card style={styles.card}>
              <Text style={styles.body}>This exam focuses on Reading and Listening practice. Use the Grammar Studio for targeted grammar drills.</Text>
            </Card>
          )}
          {(sec.grammar?.questions || []).map((q, i) => {
            const key = `g${i}`;
            const active = similar[key] || q;
            const selected = answers[key];
            const isWrong = checked && !gradeQuestion(active, selected).correct;
            return (
              <Card key={key} style={styles.card}>
                <Text style={styles.h3}>Q{i + 1}. {active.q}</Text>
                {active.type === 'short_answer' ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        checked && (
                          gradeQuestion(active, answers[key]).correct
                            ? styles.inputCorrect
                            : styles.inputIncorrect
                        )
                      ]}
                      value={answers[key] || ''}
                      onChangeText={(text) => !checked && setAnswers(p => ({ ...p, [key]: text }))}
                      placeholder="Type your short answer..."
                      placeholderTextColor={colors.muted}
                      editable={!checked}
                    />
                  </View>
                ) : (
                  (active.options || []).map((opt, oi) => (
                    <Button
                      key={oi}
                      label={opt}
                      variant={
                        checked
                          ? (gradeQuestion(active, oi).correct ? 'primary' : (answers[key] === oi ? 'errorGhost' : 'secondary'))
                          : (answers[key] === oi ? 'primary' : 'secondary')
                      }
                      onPress={() => select(key, oi)}
                      disabled={checked}
                    />
                  ))
                )}
                {renderFeedback(active, key, 'grammar')}
                {isWrong && (
                  <Button
                    label="Open Mistake Coach"
                    variant="secondary"
                    onPress={() =>
                      navigation.navigate('MistakeCoach', {
                        mistakes: [
                          buildExamMistakeItem({
                            examTitle: exam.title,
                            section: 'grammar',
                            question: active,
                            selectedIndex: selected,
                            context: '',
                          }),
                        ],
                      })
                    }
                    style={styles.mistakeBtn}
                  />
                )}
                {active.similar && (
                  <View style={styles.row}>
                    <Button label="Generate Similar" variant="secondary" onPress={() => applySimilar(key, active)} />
                    <Button label="I don't know" variant="secondary" onPress={() => applySimilar(key, active)} />
                  </View>
                )}
              </Card>
            );
          })}
        </>
      )}

      <View style={styles.actionRow}>
        {activeSection === 'reading' && <Button label="Next: Listening" onPress={() => setActiveSection('listening')} />}
        {activeSection === 'listening' && <Button label="Next: Grammar" onPress={() => setActiveSection('grammar')} />}
        {activeSection === 'grammar' && !checked && <Button label="Finish Exam & Check" onPress={check} />}
        {checked && <Button label="Close Exam" variant="secondary" onPress={() => navigation.goBack()} />}
      </View>
      {score ? (
        <View style={styles.scoreCard}>
          <Text style={styles.score}>Final Score: {score}</Text>
          <Text style={styles.scoreSub}>Review missed questions after leaving the focused exam surface.</Text>
        </View>
      ) : null}
      </View>
    </Screen>
  );
}

