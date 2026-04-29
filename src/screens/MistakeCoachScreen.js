import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import { buildMistakeExplain, requestMistakeCoachReply } from '../utils/mistakeCoach';

const DEFAULT_QUESTIONS = [
  'Why is my answer wrong?',
  'What clue proves the correct option?',
  'Explain the correct answer simply.',
  'Give me a tip to avoid this mistake.',
];

const MODULE_QUESTIONS = {
  reading: [
    'Which sentence proves the correct answer?',
    'What paraphrase trap did I fall for?',
    'Explain the correct answer briefly.',
    'Give me a reading tip for this question type.',
  ],
  listening: [
    'Which transcript line proves the correct answer?',
    'What keyword or number did I miss?',
    'Explain the correct answer briefly.',
    'Give me a listening tip for this question type.',
  ],
  grammar: [
    'Which grammar rule applies here?',
    'Why is my choice ungrammatical?',
    'Explain the correct form briefly.',
    'Give me a grammar tip to avoid this mistake.',
  ],
  vocab: [
    'Why doesn’t my synonym fit here?',
    'What is the best collocation/word family?',
    'Explain the correct choice briefly.',
    'Give me a vocab tip for this mistake.',
  ],
  writing: [
    'Which rubric criterion did I miss?',
    'Give one micro-fix sentence.',
    'Explain the key issue briefly.',
    'How should I revise this part?',
  ],
  speaking: [
    'Which sentence is unclear or inaccurate?',
    'Give one micro-fix sentence.',
    'Explain the key issue briefly.',
    'How can I improve clarity here?',
  ],
};

function optionLabel(opt, idx) {
  const letter = String.fromCharCode(65 + idx);
  return `${letter}. ${opt}`;
}

function resolveAnswerText(mistake, which) {
  const options = Array.isArray(mistake?.options) ? mistake.options : [];
  const idx = which === 'correct' ? mistake?.correctIndex : mistake?.selectedIndex;
  if (Number.isFinite(idx) && options[idx] != null) return optionLabel(options[idx], idx);
  if (which === 'correct') return mistake?.correctText || '';
  return mistake?.selectedText || '';
}

export default function MistakeCoachScreen({ route, navigation }) {
  const mistakes = useMemo(
    () => (Array.isArray(route?.params?.mistakes) ? route.params.mistakes : []),
    [route?.params?.mistakes]
  );
  const moduleLabel = route?.params?.moduleLabel || route?.params?.module || 'Practice';
  const taskTitle = route?.params?.taskTitle || '';

  const [activeIndex, setActiveIndex] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (!mistakes.length) return [];
    return [{
      id: `intro-${Date.now()}`,
      role: 'assistant',
      text: `I reviewed your ${moduleLabel} mistakes. Ask in English and focus only on why the answer is wrong.`,
      source: 'local',
    }];
  });

  const scrollRef = useRef(null);
  const messagesRef = useRef(messages);

  const activeMistake = useMemo(() => mistakes[activeIndex] || null, [mistakes, activeIndex]);
  const moduleKey = useMemo(() => String(activeMistake?.module || route?.params?.module || '').toLowerCase(), [activeMistake, route?.params?.module]);
  const quickQuestions = useMemo(() => MODULE_QUESTIONS[moduleKey] || DEFAULT_QUESTIONS, [moduleKey]);
  const activeExplain = useMemo(() => buildMistakeExplain(activeMistake), [activeMistake]);
  const activeCorrect = useMemo(() => resolveAnswerText(activeMistake, 'correct'), [activeMistake]);
  const activeSelected = useMemo(() => resolveAnswerText(activeMistake, 'selected'), [activeMistake]);

  useEffect(() => {
    messagesRef.current = messages;
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [messages]);

  useEffect(() => {
    if (activeIndex >= mistakes.length) setActiveIndex(0);
  }, [mistakes.length, activeIndex]);

  const pushMessage = (msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      messagesRef.current = next;
      return next;
    });
  };

  const handleSend = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || !activeMistake || loading) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setInput('');
    pushMessage(userMsg);
    setLoading(true);

    const history = messagesRef.current.slice(-8).map((m) => ({ role: m.role, text: m.text }));
    const reply = await requestMistakeCoachReply({
      mistake: { ...activeMistake, moduleLabel, taskTitle },
      question: trimmed,
      history,
    });
    pushMessage({
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: reply.text,
      source: reply.source || 'local',
    });
    setLoading(false);
  };

  if (!mistakes.length) {
    return (
      <Screen scroll contentStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Mistake Coach</Text>
          <Text style={styles.sub}>No incorrect answers were found for this session.</Text>
          <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Mistake Coach</Text>
      <Text style={styles.sub}>{moduleLabel}{taskTitle ? ` • ${taskTitle}` : ''}</Text>

      <Card style={styles.card}>
        <Text style={styles.h3}>Current Mistake</Text>
        <Text style={styles.questionText}>{activeMistake?.question || 'Question unavailable'}</Text>
        {activeSelected ? <Text style={styles.incorrect}>Your answer: {activeSelected}</Text> : null}
        {activeCorrect ? <Text style={styles.correct}>Correct answer: {activeCorrect}</Text> : null}
        {activeExplain ? <Text style={styles.explain}>{activeExplain}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Mistake List</Text>
        {mistakes.map((m, idx) => (
          <TouchableOpacity
            key={m.id || `${m.module || 'mistake'}-${idx}`}
            style={[styles.mistakeRow, idx === activeIndex && styles.mistakeRowActive]}
            onPress={() => setActiveIndex(idx)}
            activeOpacity={0.85}
          >
            <Text style={styles.mistakeIndex}>Q{idx + 1}</Text>
            <View style={styles.mistakeBody}>
              <Text style={styles.mistakeQuestion} numberOfLines={2}>{m.question}</Text>
              <Text style={styles.mistakeMeta} numberOfLines={1}>Correct: {resolveAnswerText(m, 'correct') || '—'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Ask the Coach</Text>
        <Text style={styles.sub}>Ask in English about why the answer is wrong or how to avoid it next time.</Text>
        <View style={styles.quickRow}>
          {quickQuestions.map((q) => (
            <TouchableOpacity key={q} style={styles.quickChip} onPress={() => handleSend(q)}>
              <Text style={styles.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView ref={scrollRef} style={styles.chatBox} contentContainerStyle={styles.chatContent}>
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={[styles.bubbleText, msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI]}>{msg.text}</Text>
              {msg.role === 'assistant' && msg.source ? (
                <Text style={styles.bubbleMeta}>Source: {msg.source}</Text>
              ) : null}
            </View>
          ))}
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Coach is thinking…</Text>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about the mistake (English only)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <Button label="Send" onPress={() => handleSend(input)} disabled={!input.trim() || loading} />
        </View>
      </Card>
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
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  correct: {
    color: colors.success,
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  incorrect: {
    color: colors.error,
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  explain: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  mistakeRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  mistakeIndex: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  mistakeBody: {
    flex: 1,
  },
  mistakeQuestion: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: 2,
  },
  mistakeMeta: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  quickChipText: {
    fontSize: typography.xsmall,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  chatBox: {
    maxHeight: 260,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  chatContent: {
    paddingBottom: spacing.sm,
  },
  bubble: {
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...shadow.slight,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleText: {
    fontSize: typography.small,
  },
  bubbleTextAI: {
    color: colors.text,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleMeta: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    color: colors.muted,
    fontSize: typography.xsmall,
  },
  inputRow: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    minHeight: 44,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: radius.md,
    fontSize: typography.small,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
