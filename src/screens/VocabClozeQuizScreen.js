import React, { useCallback, useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { getEntriesWithExamples, getDictionarySample } from '../utils/dictionary';
import { useAppState } from '../context/AppState';
import testEnglishVocabItems from '../../data/test_english_vocab_items.json';


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
  const mode = route?.params?.mode === 'test_english' ? 'test_english' : 'default';
  const topic = String(route?.params?.topic || 'all').toLowerCase();
  const level = String(route?.params?.level || 'all').toUpperCase();
  const isTestEnglish = mode === 'test_english';
  const resolveBase = useCallback(() => {
    if (isTestEnglish) {
      const list = Array.isArray(testEnglishVocabItems) ? testEnglishVocabItems : [];
      const filtered = list.filter(
        (item) =>
          Array.isArray(item.examples) &&
          item.examples.length > 0 &&
          (topic === 'all' || String(item.topic || '').toLowerCase() === topic) &&
          (level === 'ALL' || String(item.level || '').toUpperCase() === level)
      );
      if (filtered.length) return filtered;
      const levelOnly = list.filter(
        (item) =>
          Array.isArray(item.examples) &&
          item.examples.length > 0 &&
          (level === 'ALL' || String(item.level || '').toUpperCase() === level)
      );
      if (levelOnly.length) return levelOnly;
      return list.filter((item) => Array.isArray(item.examples) && item.examples.length > 0);
    }
    return getEntriesWithExamples(600);
  }, [isTestEnglish, topic, level]);

  const seedItems = useMemo(() => {
    const base = resolveBase();
    const built = [];
    for (const e of shuffle(base)) {
      const item = buildItem(e);
      if (item) built.push(item);
      if (built.length >= size) break;
    }
    return built;
  }, [resolveBase, size]);

  const [items, setItems] = useState(seedItems);

  // Bugfix: ensure quiz items populate if initial seed was delayed
  React.useEffect(() => {
    if (items.length === 0 && seedItems.length > 0) {
      setItems(seedItems);
    }
  }, [seedItems, items.length]);

  const current = items[index];

  const options = useMemo(() => {
    if (!current) return [];
    const distractorBase = resolveBase();
    const distractors = shuffle(
      (distractorBase.length ? distractorBase : getDictionarySample(400)).filter((w) => w.word !== current.word)
    ).slice(0, 3).map((w) => w.word);
    return shuffle([current.word, ...distractors]);
  }, [current, resolveBase]);

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
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>{isTestEnglish ? 'Test-English Cloze Quiz' : 'Fill in the Blank'}</Text>
      <Text style={styles.sub}>
        {isTestEnglish
          ? `Test-English ${level === 'ALL' ? 'all levels' : level} in context${topic !== 'all' ? `: ${topic}` : ''} - choose the best word`
          : 'Choose the word that fits the sentence'}
      </Text>
      
      {!finished && items.length === 0 ? (
        <View style={styles.emptyState}>
           <Text style={styles.sub}>Loading cloze data or no sentences found for this category...</Text>
           <Button label="Go Back" onPress={() => navigation.goBack()} style={styles.emptyBtn} />
        </View>
      ) : !finished && current ? (
        <>
          <Text style={styles.progress}>{Math.min(index + 1, items.length)} / {items.length}</Text>
          <Card style={styles.card}>
            <Text style={styles.h3}>Sentence</Text>
            <Text style={styles.body}>{current.sentence}</Text>
          </Card>
          
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
        </>
      ) : null}

      <View style={styles.row}>
        {!finished && items.length === 0 ? null : !revealed && !finished ? (
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
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyBtn: {
    marginTop: 20,
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
