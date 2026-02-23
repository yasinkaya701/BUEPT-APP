import React from 'react';
import { Text, StyleSheet, View, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';

export default function VocabPracticeScreen({ navigation }) {
  const [size, setSize] = React.useState(10);
  const [sizeInput, setSizeInput] = React.useState('10');

  const resolveSize = () => {
    const parsed = parseInt(sizeInput, 10);
    if (Number.isNaN(parsed)) return size;
    const clamped = Math.max(1, Math.min(200, parsed));
    setSize(clamped);
    setSizeInput(String(clamped));
    return clamped;
  };
  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Vocab Practice</Text>
      <Text style={styles.sub}>3 practice types</Text>

      <Card style={styles.card}>
        <Text style={styles.h3}>Quiz Size</Text>
        <View style={styles.row}>
          {[5, 10, 20, 30].map((n) => (
            <Button key={n} label={`${n}`} variant={size === n ? 'primary' : 'secondary'} onPress={() => setSize(n)} />
          ))}
        </View>
        <Text style={styles.hint}>Custom (1–200)</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={sizeInput}
          onChangeText={setSizeInput}
          onBlur={resolveSize}
          placeholder="Type any number"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Meaning Check</Text>
        <Text style={styles.body}>Pick the correct word for a definition</Text>
        <Button label="Start" onPress={() => navigation.navigate('VocabQuiz', { size: resolveSize() })} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Synonym Match</Text>
        <Text style={styles.body}>Choose the closest synonym</Text>
        <Button label="Start" onPress={() => navigation.navigate('VocabSynonymQuiz', { size: resolveSize() })} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Fill in the Blank</Text>
        <Text style={styles.body}>Complete the sentence with the right word</Text>
        <Button label="Start" onPress={() => navigation.navigate('VocabClozeQuiz', { size: resolveSize() })} />
      </Card>
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
    marginBottom: spacing.lg
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  hint: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: spacing.md,
    marginBottom: spacing.xs
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary
  },
  card: {
    marginBottom: spacing.lg
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm
  }
});
