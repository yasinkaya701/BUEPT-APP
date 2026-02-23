import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Text, StyleSheet, View, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, spacing, typography } from '../theme/tokens';
import exams from '../../data/buept_exams.json';
import { buildExamSectionOpenEndedPrompts } from '../utils/openEndedPrompts';

const EXAM_DURATION = 150 * 60; // 150 minutes

export default function ExamDetailScreen({ route, navigation }) {
  const examId = route?.params?.examId;
  const exam = useMemo(() => exams.find((e) => e.id === examId) || exams[0], [examId]);
  const [activeSection, setActiveSection] = useState('reading'); // 'reading', 'listening', 'grammar'
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [similar, setSimilar] = useState({});
  const [checked, setChecked] = useState(false);

  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const timerRef = useRef(null);

  const check = useCallback(() => {
    let correct = 0;
    let total = 0;
    const sec = exam.sections;
    const all = [
      ...sec.reading.questions.map((q, i) => ({ key: `r${i}`, q })),
      ...sec.listening.questions.map((q, i) => ({ key: `l${i}`, q })),
      ...sec.grammar.questions.map((q, i) => ({ key: `g${i}`, q }))
    ];
    all.forEach(({ key, q }) => {
      const active = similar[key] || q;
      total += 1;
      if (answers[key] === active.answer) correct += 1;
    });
    setScore(`${correct} / ${total}`);
    setChecked(true);
  }, [answers, exam.sections, similar]);

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
  const openEndedPrompts = useMemo(() => {
    if (activeSection === 'reading') return buildExamSectionOpenEndedPrompts(sec.reading, 'reading');
    if (activeSection === 'listening') return buildExamSectionOpenEndedPrompts(sec.listening, 'listening');
    return buildExamSectionOpenEndedPrompts(sec.grammar, 'grammar');
  }, [activeSection, sec.grammar, sec.listening, sec.reading]);
  const renderFeedback = (active, key, contextLabel) => {
    if (!checked) return null;
    const selected = answers[key];
    if (selected === undefined) {
      return <Text style={styles.incorrect}>No answer selected.</Text>;
    }
    const isCorrect = selected === active.answer;
    const genericExplain = contextLabel === 'grammar'
      ? `The correct option fits the grammar rule in the sentence.`
      : `The correct option is directly supported by the ${contextLabel}.`;
    return (
      <>
        <Text style={isCorrect ? styles.correct : styles.incorrect}>
          {isCorrect ? 'Correct' : `Incorrect (Your answer: ${active.options[selected] || '—'})`}
        </Text>
        <Text style={styles.meta}>Correct: {active.options[active.answer]}</Text>
        <Text style={styles.meta}>{active.explain || genericExplain}</Text>
      </>
    );
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.h1}>{exam.title}</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Button label="Reading" variant={activeSection === 'reading' ? 'primary' : 'secondary'} onPress={() => setActiveSection('reading')} />
        <Button label="Listening" variant={activeSection === 'listening' ? 'primary' : 'secondary'} onPress={() => setActiveSection('listening')} />
        <Button label="Grammar" variant={activeSection === 'grammar' ? 'primary' : 'secondary'} onPress={() => setActiveSection('grammar')} />
      </View>

      {activeSection === 'reading' && (
        <>
          <Card style={styles.card}>
            <Text style={styles.h3}>Reading Passage</Text>
            <Text style={styles.body}>{sec.reading.passage}</Text>
          </Card>
          {sec.reading.questions.map((q, i) => {
            const key = `r${i}`;
            const active = similar[key] || q;
            return (
              <Card key={key} style={styles.card}>
                <Text style={styles.h3}>Q{i + 1}. {active.q}</Text>
                {active.options.map((opt, oi) => (
                  <Button
                    key={oi}
                    label={opt}
                    variant={
                      checked
                        ? (oi === active.answer ? 'primary' : (answers[key] === oi ? 'errorGhost' : 'secondary'))
                        : (answers[key] === oi ? 'primary' : 'secondary')
                    }
                    onPress={() => select(key, oi)}
                    disabled={checked}
                  />
                ))}
                {renderFeedback(active, key, 'passage')}
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

      {activeSection === 'listening' && (
        <>
          <Card style={styles.card}>
            <Text style={styles.h3}>Listening Context</Text>
            <Text style={styles.body}>{sec.listening.passage || "Listen to the audio track and answer the following questions."}</Text>
          </Card>
          {sec.listening.questions.map((q, i) => {
            const key = `l${i}`;
            const active = similar[key] || q;
            return (
              <Card key={key} style={styles.card}>
                <Text style={styles.h3}>Q{i + 1}. {active.q}</Text>
                {active.options.map((opt, oi) => (
                  <Button
                    key={oi}
                    label={opt}
                    variant={
                      checked
                        ? (oi === active.answer ? 'primary' : (answers[key] === oi ? 'errorGhost' : 'secondary'))
                        : (answers[key] === oi ? 'primary' : 'secondary')
                    }
                    onPress={() => select(key, oi)}
                    disabled={checked}
                  />
                ))}
                {renderFeedback(active, key, 'transcript')}
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

      {activeSection === 'grammar' && (
        <>
          <Text style={styles.h2}>Grammar Section</Text>
          {sec.grammar.questions.map((q, i) => {
            const key = `g${i}`;
            const active = similar[key] || q;
            return (
              <Card key={key} style={styles.card}>
                <Text style={styles.h3}>Q{i + 1}. {active.q}</Text>
                {active.options.map((opt, oi) => (
                  <Button
                    key={oi}
                    label={opt}
                    variant={
                      checked
                        ? (oi === active.answer ? 'primary' : (answers[key] === oi ? 'errorGhost' : 'secondary'))
                        : (answers[key] === oi ? 'primary' : 'secondary')
                    }
                    onPress={() => select(key, oi)}
                    disabled={checked}
                  />
                ))}
                {renderFeedback(active, key, 'grammar')}
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

      <OpenEndedPracticeCard
        title={`Open-Ended ${activeSection[0].toUpperCase()}${activeSection.slice(1)} Practice`}
        prompts={openEndedPrompts}
        placeholder="Write your section response..."
      />

      <View style={styles.actionRow}>
        {activeSection === 'reading' && <Button label="Next: Listening" onPress={() => setActiveSection('listening')} />}
        {activeSection === 'listening' && <Button label="Next: Grammar" onPress={() => setActiveSection('grammar')} />}
        {activeSection === 'grammar' && !checked && <Button label="Finish Exam & Check" onPress={check} />}
        {checked && <Button label="Close Exam" variant="secondary" onPress={() => navigation.goBack()} />}
      </View>
      {score && <Text style={styles.score}>Final Score: {score}</Text>}
    </Screen>
  );
}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  timerBadge: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    color: '#E65100',
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
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
    marginBottom: spacing.md
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
  score: {
    marginTop: spacing.md,
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primary,
    textAlign: 'center'
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md
  }
});
