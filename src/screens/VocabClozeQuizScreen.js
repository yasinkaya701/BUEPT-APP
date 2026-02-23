import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { getEntriesWithExamples, getDictionarySample } from '../utils/dictionary';
import { useAppState } from '../context/AppState';


/** Fisher-Yates shuffle — inline fallback to guard against Metro resolution issues */
function shuffle(arr) {
  const result = Array.isArray(arr) ? [...arr] : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildItem(entry) {
  const example = entry.examples[0];
  if (!example) return null;
  const regex = new RegExp(`\\b${entry.word}\\b`, 'i');
  if (!regex.test(example)) return null;
  return {
    word: entry.word,
    sentence: example.replace(regex, '_____')
  };
}

export default function VocabClozeQuizScreen({ navigation, route }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const { addUnknownWord, recordKnown, recordUnknown, recordQuizError } = useAppState();
  const size = route?.params?.size || 10;

  const items = useMemo(() => {
    const base = getEntriesWithExamples(600);
    const built = [];
    for (const e of shuffle(base)) {
      const item = buildItem(e);
      if (item) built.push(item);
      if (built.length >= size) break;
    }
    return built;
  }, [size]);

  const current = items[index];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffle(getDictionarySample(400).filter((w) => w.word !== current.word)).slice(0, 3).map((w) => w.word);
    return shuffle([current.word, ...distractors]);
  }, [current]);

  const pick = (opt) => {
    if (!current) return;
    if (revealed || finished) return;
    setSelected(opt);
  };

  const next = (knew) => {
    if (!current || !selected) return;
    if (!revealed) {
      if (selected === current.word) {
        setScore((s) => s + 1);
      } else {
        recordQuizError(current.word);
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

  return (
    <Screen contentStyle={styles.container}>
      <Text style={styles.h1}>Fill in the Blank</Text>
      <Text style={styles.sub}>Choose the word that fits the sentence</Text>
      <Text style={styles.progress}>{Math.min(index + 1, items.length)} / {items.length}</Text>

      {current && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Sentence</Text>
          <Text style={styles.body}>{current.sentence}</Text>
        </Card>
      )}

      {options.map((o) => (
        <Button
          key={o}
          label={o}
          variant={
            revealed
              ? (o === current?.word ? 'primary' : (selected === o ? 'ghost' : 'secondary'))
              : (selected === o ? 'primary' : 'secondary')
          }
          onPress={() => pick(o)}
          disabled={revealed || finished}
        />
      ))}

      {revealed && current && !finished && (
        <Card style={styles.card}>
          <Text style={selected === current.word ? styles.correct : styles.incorrect}>
            {selected === current.word ? 'Correct' : `Incorrect - correct answer: ${current.word}`}
          </Text>
          <Text style={styles.answer}>Sentence: {current.sentence.replace('_____', current.word)}</Text>
        </Card>
      )}

      <View style={styles.row}>
        {!revealed && !finished ? (
          <Button label="Check Answer" onPress={() => next(true)} disabled={!selected} />
        ) : finished ? (
          <Button label="Back to Vocab" variant="secondary" onPress={() => navigation.goBack()} />
        ) : (
          <>
            <Button label="Next (I knew it)" onPress={() => next(true)} />
            <Button label="Next (I didn't know)" variant="secondary" onPress={() => next(false)} />
          </>
        )}
      </View>

      <Text style={styles.score}>Score: {score}/{items.length}</Text>
      <Text style={styles.sub}>Known: {knownCount} • Unknown: {unknownCount}</Text>
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
    color: '#1F8B4C'
  },
  incorrect: {
    color: '#B42318'
  }
});
