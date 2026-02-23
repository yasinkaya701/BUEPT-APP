import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Chip from '../components/Chip';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import prompts from '../../data/writing_prompts.json';
import lessons from '../../data/writing_lessons.json';
import connectors from '../../data/writing_connectors.json';
import { useAppState } from '../context/AppState';

export default function WritingScreen({ navigation }) {
  const { level, writingEngine, setWritingEngine } = useAppState();
  const [type, setType] = useState(null);
  const [task, setTask] = useState(null);
  const [levelFilter, setLevelFilter] = useState(level || 'P2');
  const [query, setQuery] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const ENGINES = [
    { key: 'hybrid', label: 'Hybrid (Best)' },
    { key: 'online', label: 'Online (LanguageTool)' },
    { key: 'local', label: 'Local (Rule-based)' }
  ];
  const TYPES = ['opinion', 'definition', 'cause_effect', 'problem_solution', 'compare_contrast', 'argumentative', 'reaction'];
  const TASKS = ['paragraph', 'essay'];

  const list = useMemo(() => {
    return prompts.filter((p) => {
      if (levelFilter && levelFilter !== 'ALL' && p.level !== levelFilter) return false;
      if (type && p.type !== type) return false;
      if (task && p.task !== task) return false;
      if (query && !p.prompt.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }).slice(0, 40);
  }, [type, task, query, levelFilter]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Writing Studio</Text>
      <Text style={styles.sub}>Level: {level}</Text>

      <Card style={styles.card}>
        <Text style={styles.h3}>Quick Start</Text>
        <Text style={styles.body}>Pick a prompt below or open Writing Editor directly.</Text>
        <View style={styles.buttonRow}>
          <Button label="Open Editor" onPress={() => navigation.navigate('WritingEditor')} />
          <Button label="📝 Essay Guide" variant="secondary" onPress={() => navigation.navigate('Essay')} />
        </View>
      </Card>


      <Card style={styles.card}>
        <Text style={styles.h3}>Writing Model</Text>
        <Text style={styles.body}>Choose how feedback is generated.</Text>
        <View style={styles.chips}>
          {ENGINES.map((e) => (
            <Chip
              key={e.key}
              label={e.label}
              active={writingEngine === e.key}
              onPress={() => setWritingEngine(e.key)}
            />
          ))}
        </View>
        <Text style={styles.sub}>
          {writingEngine === 'hybrid' && 'Hybrid = Local rubric + Online checks'}
          {writingEngine === 'online' && 'Online = LanguageTool only'}
          {writingEngine === 'local' && 'Local = Offline rule-based only'}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Your Own Topic</Text>
        <Text style={styles.body}>Type your topic or question and start writing.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your own essay topic..."
          value={customPrompt}
          onChangeText={setCustomPrompt}
        />
        <Button
          label="Start with My Topic"
          onPress={() => navigation.navigate('WritingEditor', { prompt: customPrompt })}
          disabled={!customPrompt.trim()}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Online Feedback</Text>
        <Text style={styles.body}>Run a free online check on your writing (LanguageTool).</Text>
        <Button
          label={writingEngine === 'local' ? 'Online Disabled (Local Only)' : 'Open Online Feedback'}
          onPress={() => navigation.navigate('OnlineFeedback')}
          disabled={writingEngine === 'local'}
        />
      </Card>

      <Text style={styles.section}>Prompt Bank</Text>
      <View style={styles.chips}>
        <Chip label="All Levels" active={levelFilter === 'ALL'} onPress={() => setLevelFilter('ALL')} />
        {['P1', 'P2', 'P3', 'P4'].map((lv) => (
          <Chip key={lv} label={lv} active={levelFilter === lv} onPress={() => setLevelFilter(lv)} />
        ))}
      </View>
      <View style={styles.chips}>
        <Chip label="All Types" active={!type} onPress={() => setType(null)} />
        {TYPES.map((t) => (
          <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} />
        ))}
      </View>
      <View style={styles.chips}>
        <Chip label="All Tasks" active={!task} onPress={() => setTask(null)} />
        {TASKS.map((t) => (
          <Chip key={t} label={t} active={task === t} onPress={() => setTask(t)} />
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Search prompt..."
        value={query}
        onChangeText={setQuery}
      />
      {list.map((p, i) => (
        <Card key={i} style={styles.card}>
          <Text style={styles.h3}>{p.task} • {p.type}</Text>
          <Text style={styles.body}>{p.prompt}</Text>
          {p.keywords?.length ? (
            <Text style={styles.sub}>Keywords: {p.keywords.join(', ')}</Text>
          ) : null}
          <View style={styles.buttonRow}>
            <Button label="Start Writing" onPress={() => navigation.navigate('WritingEditor', { prompt: p.prompt })} />
          </View>
        </Card>
      ))}

      <Text style={styles.section}>Writing Lessons</Text>
      {Object.values(lessons).map((l) => (
        <Card key={l.title} style={styles.card}>
          <Text style={styles.h3}>{l.title}</Text>
          {l.points.map((p, i) => (
            <Text key={i} style={styles.body}>• {p}</Text>
          ))}
        </Card>
      ))}

      <Text style={styles.section}>Connector Bank</Text>
      {Object.entries(connectors).map(([k, items]) => (
        <Card key={k} style={styles.card}>
          <Text style={styles.h3}>{k.replace('_', ' ')}</Text>
          <Text style={styles.body}>{items.join(', ')}</Text>
        </Card>
      ))}
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
    marginBottom: spacing.md
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg
  },
  section: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  buttonRow: {
    marginTop: spacing.md
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary
  }
});
