import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { getDictionarySample } from '../utils/dictionary';
import { useAppState } from '../context/AppState';
import { speakText } from '../hooks/useTts';


/** Fisher-Yates shuffle — inline fallback to guard against Metro resolution issues */
function shuffle(arr) {
  const result = Array.isArray(arr) ? [...arr] : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function VocabQuizScreen({ navigation, route }) {
  const size = route?.params?.size || 10;
  const seedItems = useMemo(
    () => shuffle(getDictionarySample(400)).filter((w) => w.simple_definition).slice(0, size),
    [size]
  );
  const [quizItems, setQuizItems] = useState(seedItems);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);
  const { addUnknownWord, recordKnown, recordUnknown, recordQuizError } = useAppState();
  const items = quizItems;
  const current = items[index];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffle(getDictionarySample(400).filter((w) => w.word !== current.word)).slice(0, 3);
    return shuffle([current, ...distractors]);
  }, [current]);

  const pick = (word) => {
    if (!current) return;
    if (revealed) return;
    setSelected(word);
  };

  const next = (knew) => {
    if (!current || (!selected && !revealed)) return;
    const correct = selected === current.word;
    if (!revealed) {
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const streakValue = s + 1;
          setBestStreak((b) => Math.max(b, streakValue));
          return streakValue;
        });
      } else {
        setStreak(0);
        recordQuizError(current.word);
        setWrongWords((prev) => {
          if (prev.some((w) => w.word === current.word)) return prev;
          return [...prev, current];
        });
      }
      setRevealed(true);
      return;
    }
    if (knew) recordKnown(current.word);
    else {
      addUnknownWord(current.word);
      recordUnknown(current.word);
    }
    if (knew) setKnownCount((c) => c + 1);
    else setUnknownCount((c) => c + 1);
    if (index < items.length - 1) {
      setSelected(null);
      setRevealed(false);
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const done = finished || (index === items.length - 1 && revealed);
  const selectionCorrect = selected === current?.word;
  const accuracy = items.length ? Math.round((score / items.length) * 100) : 0;

  const restartAll = () => {
    const freshItems = shuffle(getDictionarySample(400)).filter((w) => w.simple_definition).slice(0, size);
    setQuizItems(freshItems);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
    setFinished(false);
    setKnownCount(0);
    setUnknownCount(0);
    setStreak(0);
    setBestStreak(0);
    setWrongWords([]);
  };

  const retryWrong = () => {
    if (!wrongWords.length) return;
    setQuizItems(shuffle(wrongWords));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
    setFinished(false);
    setKnownCount(0);
    setUnknownCount(0);
    setStreak(0);
    setBestStreak(0);
    setWrongWords([]);
  };

  return (
    <Screen contentStyle={styles.container}>
      <Text style={styles.h1}>Vocab Quiz</Text>
      <Text style={styles.sub}>Pick the correct word for the definition</Text>
      <Text style={styles.progress}>{Math.min(index + 1, items.length)} / {items.length}</Text>
      <Text style={styles.sub}>Streak: {streak} • Best: {bestStreak} • Accuracy: {accuracy}%</Text>

      {current && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Definition</Text>
          <Text style={styles.body}>{current.simple_definition}</Text>
        </Card>
      )}

      {options.map((o) => (
        <View key={o.word} style={styles.optionRow}>
          <Button
            label={o.word}
            style={{ flex: 1 }}
            variant={
              revealed
                ? (o.word === current.word ? 'primary' : (selected === o.word ? 'ghost' : 'secondary'))
                : (selected === o.word ? 'primary' : 'secondary')
            }
            onPress={() => pick(o.word)}
            disabled={revealed || finished}
          />
          <TouchableOpacity onPress={() => speakText(o.word)} style={styles.audioBtn}>
            <Text style={{ fontSize: 24 }}>🔊</Text>
          </TouchableOpacity>
        </View>
      ))}

      {revealed && current && !finished && (
        <Card style={styles.card}>
          <Text style={selectionCorrect ? styles.correct : styles.incorrect}>
            {selectionCorrect ? 'Correct' : `Incorrect - correct answer: ${current.word}`}
          </Text>
          <Text style={styles.body}>Meaning: {current.simple_definition}</Text>
          {current.examples?.[0] ? <Text style={styles.answer}>Example: {current.examples[0]}</Text> : null}
        </Card>
      )}

      <View style={styles.row}>
        {!revealed && !finished ? (
          <Button label="Check Answer" onPress={() => next(true)} disabled={!selected} />
        ) : finished ? (
          <>
            <Button label="Back to Vocab" variant="secondary" onPress={() => navigation.goBack()} />
            <Button label="Restart" onPress={restartAll} />
          </>
        ) : (
          <>
            <Button label={done ? 'Finish' : 'Next (I knew it)'} onPress={() => next(true)} />
            <Button label={done ? 'Finish (Unknown)' : "Next (I didn't know)"} variant="secondary" onPress={() => next(false)} />
          </>
        )}
      </View>

      <Text style={styles.score}>Score: {score}/{items.length}</Text>
      <Text style={styles.sub}>Known: {knownCount} • Unknown: {unknownCount}</Text>
      {finished && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Quiz Summary</Text>
          <Text style={styles.body}>Final Accuracy: {accuracy}%</Text>
          <Text style={styles.body}>Best Streak: {bestStreak}</Text>
          {wrongWords.length > 0 ? (
            <>
              <Text style={styles.sub}>Missed words: {wrongWords.slice(0, 6).map((w) => w.word).join(', ')}</Text>
              <Button label={`Retry Missed (${wrongWords.length})`} onPress={retryWrong} />
            </>
          ) : (
            <Text style={styles.correct}>Perfect run. No missed words.</Text>
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.xs
  },
  progress: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg
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
  row: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  audioBtn: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary
  },
  score: {
    marginTop: spacing.md,
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primary
  },
  answer: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.muted
  },
  correct: {
    color: '#1F8B4C',
    marginBottom: spacing.xs
  },
  incorrect: {
    color: '#B42318',
    marginBottom: spacing.xs
  }
});
