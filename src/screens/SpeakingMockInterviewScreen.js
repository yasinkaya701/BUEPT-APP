import React, { useMemo, useState, useEffect } from 'react';
import { Text, StyleSheet, View, TextInput } from 'react-native';
import Voice from '@react-native-voice/voice';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import prompts from '../../data/speaking_prompts.json';
import { useAppState } from '../context/AppState';
import { scoreSpeakingRubric } from '../utils/rubricScoring';

function normalizeSpeechText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function pickBestSpeechResult(values = []) {
  const list = Array.isArray(values) ? values.map(normalizeSpeechText).filter(Boolean) : [];
  if (!list.length) return '';
  return list.sort((a, b) => b.length - a.length)[0];
}

function mergeSpeechText(prevText = '', nextText = '') {
  const prev = normalizeSpeechText(prevText);
  const next = normalizeSpeechText(nextText);
  if (!next) return prev;
  if (!prev) return next;

  const prevLower = prev.toLowerCase();
  const nextLower = next.toLowerCase();

  if (prevLower === nextLower) return prev;
  if (prevLower.includes(nextLower)) return prev;
  if (nextLower.includes(prevLower)) return next;
  return `${prev} ${next}`;
}

function pickInterviewQuestions(level = 'P2') {
  const pool = prompts.filter((p) => p.level === level);
  const src = pool.length >= 4 ? pool : prompts;
  const used = new Set();
  const out = [];
  for (let i = 0; i < src.length && out.length < 4; i += 1) {
    const item = src[(i * 7 + 3) % src.length];
    const key = `${item.title}-${item.prompt}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push(item);
  }
  return out;
}

function buildFollowUp(promptItem, answerText = '') {
  const base = String(answerText || '').trim();
  if (!base) return 'Can you state your main argument in one clear sentence?';
  const lower = base.toLowerCase();
  if (!/\bfor example|for instance|such as\b/.test(lower)) {
    return 'Can you give one specific example to support your answer?';
  }
  if (!/\bhowever|on the other hand|although|while\b/.test(lower)) {
    return 'What is a possible counter-argument to your view?';
  }
  if (!/\bin conclusion|overall|to sum up\b/.test(lower)) {
    return 'Please conclude your answer in one strong sentence.';
  }
  return `How would you adapt this argument to a ${promptItem?.category || 'different'} context?`;
}

export default function SpeakingMockInterviewScreen({ navigation }) {
  const { level } = useAppState();
  const questions = useMemo(() => pickInterviewQuestions(level), [level]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [timePerQuestionSec, setTimePerQuestionSec] = useState(90);
  const [timeRunning, setTimeRunning] = useState(false);
  const [timeUpMap, setTimeUpMap] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState({});

  const current = questions[index];
  const currentAnswer = answers[index] || '';
  const currentFollowUp = useMemo(() => buildFollowUp(current, currentAnswer), [current, currentAnswer]);
  const currentFollowUpAnswer = followUpAnswers[index] || '';
  const isTimeUp = !!timeUpMap[index];

  useEffect(() => {
    if (!timeRunning || done || isTimeUp) return undefined;
    if (timePerQuestionSec <= 0) {
      setTimeUpMap((prev) => ({ ...prev, [index]: true }));
      setTimeRunning(false);
      return undefined;
    }
    const t = setInterval(() => {
      setTimePerQuestionSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [timeRunning, timePerQuestionSec, done, index, isTimeUp]);

  useEffect(() => {
    setTimePerQuestionSec(90);
    setTimeRunning(false);
  }, [index]);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechError = () => setIsRecording(false);
    Voice.onSpeechResults = (e) => {
      const text = pickBestSpeechResult(e?.value);
      if (!text) return;
      setAnswers((prev) => {
        const existing = String(prev[index] || '');
        return { ...prev, [index]: mergeSpeechText(existing, text) };
      });
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [index]);

  const goNext = () => {
    if (index >= questions.length - 1) {
      setDone(true);
      return;
    }
    setIndex((v) => v + 1);
  };

  const result = useMemo(() => {
    if (!done) return null;
      const rows = questions.map((q, i) => {
      const text = `${answers[i] || ''} ${followUpAnswers[i] || ''}`.trim();
      const rubric = scoreSpeakingRubric({
        text,
        prompt: q?.prompt || q?.title || q?.topic || 'Untitled Prompt',
        targetWords: 90,
      });
      return { q, rubric };
    });
    const total = rows.reduce((sum, r) => sum + r.rubric.total, 0);
    const max = rows.reduce((sum, r) => sum + r.rubric.max, 0);
    const pct = max ? Math.round((total / max) * 100) : 0;
    const band = pct >= 85 ? 'Strong' : pct >= 70 ? 'Good' : pct >= 55 ? 'Developing' : 'Needs Work';
    return { rows, total, max, pct, band };
  }, [done, questions, answers, followUpAnswers]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const toggleRecording = async () => {
    if (isTimeUp || done) return;
    if (isRecording) {
      try { await Voice.stop(); } catch (_) { }
      return;
    }
    try {
      await Voice.start('en-US');
    } catch (_) { }
  };

  const quickHint = useMemo(() => {
    const wc = String(currentAnswer).trim().split(/\s+/).filter(Boolean).length;
    if (wc === 0) return 'Start with a direct thesis sentence.';
    if (wc < 40) return 'Expand with one concrete example.';
    if (wc < 80) return 'Add a contrast or cause-effect connector.';
    return 'Good length. Keep structure clear and finish with a conclusion line.';
  }, [currentAnswer]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Mock Interview</Text>
      <Text style={styles.sub}>4 speaking questions • level {level}</Text>

      {!done ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Question {index + 1}/{questions.length}</Text>
          <Text style={styles.timerText}>Time: {formatTime(timePerQuestionSec)} {isTimeUp ? '• Time up' : ''}</Text>
          <View style={styles.row}>
            <Button
              label={timeRunning ? 'Pause Timer' : 'Start 90s'}
              variant="secondary"
              onPress={() => setTimeRunning((v) => !v)}
              disabled={isTimeUp}
            />
            <Button
              label="Reset Time"
              variant="secondary"
              onPress={() => {
                setTimePerQuestionSec(90);
                setTimeRunning(false);
                setTimeUpMap((prev) => ({ ...prev, [index]: false }));
              }}
            />
          </View>
          <Text style={styles.prompt}>{current?.prompt || current?.title || current?.topic || 'Prompt unavailable'}</Text>
          <Text style={styles.quickHint}>Coach: {quickHint}</Text>
          <View style={styles.row}>
            <Button
              label={isRecording ? 'Stop Mic' : 'Use Mic (EN)'}
              variant={isRecording ? 'primary' : 'secondary'}
              onPress={toggleRecording}
              disabled={isTimeUp}
            />
          </View>
          <TextInput
            style={styles.input}
            multiline
            value={currentAnswer}
            onChangeText={(v) => setAnswers((prev) => ({ ...prev, [index]: v }))}
            placeholder="Type your answer draft here..."
            textAlignVertical="top"
            editable={!isTimeUp}
          />
          <Text style={styles.followUpTitle}>Follow-up</Text>
          <Text style={styles.followUpQuestion}>{currentFollowUp}</Text>
          <TextInput
            style={styles.followUpInput}
            multiline
            value={currentFollowUpAnswer}
            onChangeText={(v) => setFollowUpAnswers((prev) => ({ ...prev, [index]: v }))}
            placeholder="Add your follow-up response..."
            textAlignVertical="top"
            editable={!isTimeUp}
          />
          <View style={styles.row}>
            <Button label="Back" variant="secondary" onPress={() => (index > 0 ? setIndex((v) => v - 1) : navigation.goBack())} />
            <Button label={index >= questions.length - 1 ? 'Finish Interview' : 'Next Question'} onPress={goNext} />
          </View>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.h3}>Interview Result</Text>
          <Text style={styles.result}>{result?.total}/{result?.max} • {result?.pct}% • {result?.band}</Text>
          {result?.rows.map((row, i) => (
            <View key={`row-${i}`} style={styles.resultRow}>
              <Text style={styles.rowTitle}>Q{i + 1}: {row.q?.title || row.q?.topic || row.q?.category || 'Task'}</Text>
              <Text style={styles.rowMeta}>{row.rubric.total}/{row.rubric.max} • {row.rubric.band}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Button
              label="Retry Interview"
              variant="secondary"
              onPress={() => {
                setDone(false);
                setIndex(0);
                setAnswers({});
                setFollowUpAnswers({});
                setTimePerQuestionSec(90);
                setTimeRunning(false);
                setTimeUpMap({});
              }}
            />
            <Button label="Back to Speaking" onPress={() => navigation.goBack()} />
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  card: { marginBottom: spacing.md },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  prompt: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  timerText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  quickHint: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  input: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  followUpTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  followUpQuestion: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  followUpInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  result: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  resultRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  rowTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  rowMeta: {
    fontSize: typography.small,
    color: colors.muted,
  },
});
