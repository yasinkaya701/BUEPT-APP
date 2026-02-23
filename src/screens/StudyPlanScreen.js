import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { buildAdaptivePlan } from '../utils/studyPlan';

const STORAGE_CUSTOM_PLAN = '@buept_custom_daily_plan_v1';
const DEFAULT_CUSTOM_PLAN = {
  essays: 1,
  appMinutes: 60,
  grammarMinutes: 30,
  readingSets: 1,
  listeningSets: 1,
  vocabMinutes: 20,
  weeklyEssays: 3,
  weeklyAppMinutes: 420,
  weeklyGrammarMinutes: 180,
  weeklyReadingSets: 5,
  weeklyListeningSets: 5,
  weeklyVocabMinutes: 140,
};

function toPositiveInt(value, fallback, min = 0, max = 600) {
  const n = Number(String(value || '').trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export default function StudyPlanScreen({ navigation }) {
  const { level, history, readingHistory, listeningHistory, grammarHistory, screenTime } = useAppState();
  const planData = buildAdaptivePlan({
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    writingHistory: history
  });
  const [customEnabled, setCustomEnabled] = useState(false);
  const [savedPlan, setSavedPlan] = useState(DEFAULT_CUSTOM_PLAN);
  const [form, setForm] = useState({
    essays: String(DEFAULT_CUSTOM_PLAN.essays),
    appMinutes: String(DEFAULT_CUSTOM_PLAN.appMinutes),
    grammarMinutes: String(DEFAULT_CUSTOM_PLAN.grammarMinutes),
    readingSets: String(DEFAULT_CUSTOM_PLAN.readingSets),
    listeningSets: String(DEFAULT_CUSTOM_PLAN.listeningSets),
    vocabMinutes: String(DEFAULT_CUSTOM_PLAN.vocabMinutes),
    weeklyEssays: String(DEFAULT_CUSTOM_PLAN.weeklyEssays),
    weeklyAppMinutes: String(DEFAULT_CUSTOM_PLAN.weeklyAppMinutes),
    weeklyGrammarMinutes: String(DEFAULT_CUSTOM_PLAN.weeklyGrammarMinutes),
    weeklyReadingSets: String(DEFAULT_CUSTOM_PLAN.weeklyReadingSets),
    weeklyListeningSets: String(DEFAULT_CUSTOM_PLAN.weeklyListeningSets),
    weeklyVocabMinutes: String(DEFAULT_CUSTOM_PLAN.weeklyVocabMinutes),
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_CUSTOM_PLAN);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        const normalized = {
          essays: toPositiveInt(parsed.essays, DEFAULT_CUSTOM_PLAN.essays, 0, 10),
          appMinutes: toPositiveInt(parsed.appMinutes, DEFAULT_CUSTOM_PLAN.appMinutes, 0, 600),
          grammarMinutes: toPositiveInt(parsed.grammarMinutes, DEFAULT_CUSTOM_PLAN.grammarMinutes, 0, 300),
          readingSets: toPositiveInt(parsed.readingSets, DEFAULT_CUSTOM_PLAN.readingSets, 0, 10),
          listeningSets: toPositiveInt(parsed.listeningSets, DEFAULT_CUSTOM_PLAN.listeningSets, 0, 10),
          vocabMinutes: toPositiveInt(parsed.vocabMinutes, DEFAULT_CUSTOM_PLAN.vocabMinutes, 0, 300),
          weeklyEssays: toPositiveInt(parsed.weeklyEssays, DEFAULT_CUSTOM_PLAN.weeklyEssays, 0, 30),
          weeklyAppMinutes: toPositiveInt(parsed.weeklyAppMinutes, DEFAULT_CUSTOM_PLAN.weeklyAppMinutes, 0, 5000),
          weeklyGrammarMinutes: toPositiveInt(parsed.weeklyGrammarMinutes, DEFAULT_CUSTOM_PLAN.weeklyGrammarMinutes, 0, 3000),
          weeklyReadingSets: toPositiveInt(parsed.weeklyReadingSets, DEFAULT_CUSTOM_PLAN.weeklyReadingSets, 0, 50),
          weeklyListeningSets: toPositiveInt(parsed.weeklyListeningSets, DEFAULT_CUSTOM_PLAN.weeklyListeningSets, 0, 50),
          weeklyVocabMinutes: toPositiveInt(parsed.weeklyVocabMinutes, DEFAULT_CUSTOM_PLAN.weeklyVocabMinutes, 0, 3000),
        };
        setSavedPlan(normalized);
        setForm({
          essays: String(normalized.essays),
          appMinutes: String(normalized.appMinutes),
          grammarMinutes: String(normalized.grammarMinutes),
          readingSets: String(normalized.readingSets),
          listeningSets: String(normalized.listeningSets),
          vocabMinutes: String(normalized.vocabMinutes),
          weeklyEssays: String(normalized.weeklyEssays),
          weeklyAppMinutes: String(normalized.weeklyAppMinutes),
          weeklyGrammarMinutes: String(normalized.weeklyGrammarMinutes),
          weeklyReadingSets: String(normalized.weeklyReadingSets),
          weeklyListeningSets: String(normalized.weeklyListeningSets),
          weeklyVocabMinutes: String(normalized.weeklyVocabMinutes),
        });
        setCustomEnabled(true);
      } catch (_) { }
    })();
  }, []);

  const todaysMinutes = Math.round((screenTime?.seconds || 0) / 60);
  const plan = planData.daily;
  const formatAcc = (v) => (typeof v === 'number' ? `${v}%` : '-');
  const appTimeProgress = useMemo(() => {
    if (!savedPlan.appMinutes) return '0%';
    const pct = Math.min(100, Math.round((todaysMinutes / savedPlan.appMinutes) * 100));
    return `${pct}%`;
  }, [todaysMinutes, savedPlan.appMinutes]);
  const weeklyGoals = useMemo(() => {
    if (customEnabled) {
      return [
        `Complete ${savedPlan.weeklyReadingSets} reading sets`,
        `Complete ${savedPlan.weeklyListeningSets} listening sets`,
        `Submit ${savedPlan.weeklyEssays} writing tasks`,
        `Study grammar for ${savedPlan.weeklyGrammarMinutes} min`,
        `Study vocabulary for ${savedPlan.weeklyVocabMinutes} min`,
        `Use app for ${savedPlan.weeklyAppMinutes} min`
      ];
    }
    return [
      'Complete 3 reading sets',
      'Complete 3 listening sets',
      'Submit 2 writing tasks',
      'Finish 5 grammar drills',
      'Review vocabulary every day'
    ];
  }, [customEnabled, savedPlan]);

  const onSaveCustomPlan = async () => {
    const next = {
      essays: toPositiveInt(form.essays, savedPlan.essays, 0, 10),
      appMinutes: toPositiveInt(form.appMinutes, savedPlan.appMinutes, 0, 600),
      grammarMinutes: toPositiveInt(form.grammarMinutes, savedPlan.grammarMinutes, 0, 300),
      readingSets: toPositiveInt(form.readingSets, savedPlan.readingSets, 0, 10),
      listeningSets: toPositiveInt(form.listeningSets, savedPlan.listeningSets, 0, 10),
      vocabMinutes: toPositiveInt(form.vocabMinutes, savedPlan.vocabMinutes, 0, 300),
      weeklyEssays: toPositiveInt(form.weeklyEssays, savedPlan.weeklyEssays, 0, 30),
      weeklyAppMinutes: toPositiveInt(form.weeklyAppMinutes, savedPlan.weeklyAppMinutes, 0, 5000),
      weeklyGrammarMinutes: toPositiveInt(form.weeklyGrammarMinutes, savedPlan.weeklyGrammarMinutes, 0, 3000),
      weeklyReadingSets: toPositiveInt(form.weeklyReadingSets, savedPlan.weeklyReadingSets, 0, 50),
      weeklyListeningSets: toPositiveInt(form.weeklyListeningSets, savedPlan.weeklyListeningSets, 0, 50),
      weeklyVocabMinutes: toPositiveInt(form.weeklyVocabMinutes, savedPlan.weeklyVocabMinutes, 0, 3000),
    };
    setSavedPlan(next);
    setForm({
      essays: String(next.essays),
      appMinutes: String(next.appMinutes),
      grammarMinutes: String(next.grammarMinutes),
      readingSets: String(next.readingSets),
      listeningSets: String(next.listeningSets),
      vocabMinutes: String(next.vocabMinutes),
      weeklyEssays: String(next.weeklyEssays),
      weeklyAppMinutes: String(next.weeklyAppMinutes),
      weeklyGrammarMinutes: String(next.weeklyGrammarMinutes),
      weeklyReadingSets: String(next.weeklyReadingSets),
      weeklyListeningSets: String(next.weeklyListeningSets),
      weeklyVocabMinutes: String(next.weeklyVocabMinutes),
    });
    setCustomEnabled(true);
    try { await AsyncStorage.setItem(STORAGE_CUSTOM_PLAN, JSON.stringify(next)); } catch (_) { }
  };

  const onResetCustomPlan = async () => {
    setSavedPlan(DEFAULT_CUSTOM_PLAN);
    setForm({
      essays: String(DEFAULT_CUSTOM_PLAN.essays),
      appMinutes: String(DEFAULT_CUSTOM_PLAN.appMinutes),
      grammarMinutes: String(DEFAULT_CUSTOM_PLAN.grammarMinutes),
      readingSets: String(DEFAULT_CUSTOM_PLAN.readingSets),
      listeningSets: String(DEFAULT_CUSTOM_PLAN.listeningSets),
      vocabMinutes: String(DEFAULT_CUSTOM_PLAN.vocabMinutes),
      weeklyEssays: String(DEFAULT_CUSTOM_PLAN.weeklyEssays),
      weeklyAppMinutes: String(DEFAULT_CUSTOM_PLAN.weeklyAppMinutes),
      weeklyGrammarMinutes: String(DEFAULT_CUSTOM_PLAN.weeklyGrammarMinutes),
      weeklyReadingSets: String(DEFAULT_CUSTOM_PLAN.weeklyReadingSets),
      weeklyListeningSets: String(DEFAULT_CUSTOM_PLAN.weeklyListeningSets),
      weeklyVocabMinutes: String(DEFAULT_CUSTOM_PLAN.weeklyVocabMinutes),
    });
    setCustomEnabled(false);
    try { await AsyncStorage.removeItem(STORAGE_CUSTOM_PLAN); } catch (_) { }
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Study Plan</Text>
      <Text style={styles.sub}>{
        level === 'P1' ? 'P1 (A1)' :
          level === 'P2' ? 'P2 (A2)' :
            level === 'P3' ? 'P3 (B1)' :
              level === 'P4' ? 'P4 (B2)' : level
      }</Text>

      <Card style={styles.card}>
        <Text style={styles.h3}>Plan Mode</Text>
        <View style={styles.row}>
          <Button label={customEnabled ? 'Custom Active' : 'Use Adaptive'} variant={customEnabled ? 'primary' : 'secondary'} onPress={() => setCustomEnabled((v) => !v)} />
          <Button label="Reset Custom" variant="ghost" onPress={onResetCustomPlan} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Your Daily Targets</Text>
        <Text style={styles.sub}>Set your own goals (essay, app time, grammar, reading, listening, vocab).</Text>
        <View style={styles.formRow}>
          <Text style={styles.label}>Essays</Text>
          <TextInput style={styles.input} value={form.essays} onChangeText={(v) => setForm((p) => ({ ...p, essays: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>count/day</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>App Time</Text>
          <TextInput style={styles.input} value={form.appMinutes} onChangeText={(v) => setForm((p) => ({ ...p, appMinutes: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>min/day</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Grammar</Text>
          <TextInput style={styles.input} value={form.grammarMinutes} onChangeText={(v) => setForm((p) => ({ ...p, grammarMinutes: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>min/day</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Reading Sets</Text>
          <TextInput style={styles.input} value={form.readingSets} onChangeText={(v) => setForm((p) => ({ ...p, readingSets: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>set/day</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Listening Sets</Text>
          <TextInput style={styles.input} value={form.listeningSets} onChangeText={(v) => setForm((p) => ({ ...p, listeningSets: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>set/day</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Vocab</Text>
          <TextInput style={styles.input} value={form.vocabMinutes} onChangeText={(v) => setForm((p) => ({ ...p, vocabMinutes: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>min/day</Text>
        </View>
        <Button label="Save My Plan" onPress={onSaveCustomPlan} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Your Weekly Targets</Text>
        <Text style={styles.sub}>Weekly goals are now editable too.</Text>
        <View style={styles.formRow}>
          <Text style={styles.label}>Essays</Text>
          <TextInput style={styles.input} value={form.weeklyEssays} onChangeText={(v) => setForm((p) => ({ ...p, weeklyEssays: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>count/week</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>App Time</Text>
          <TextInput style={styles.input} value={form.weeklyAppMinutes} onChangeText={(v) => setForm((p) => ({ ...p, weeklyAppMinutes: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>min/week</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Grammar</Text>
          <TextInput style={styles.input} value={form.weeklyGrammarMinutes} onChangeText={(v) => setForm((p) => ({ ...p, weeklyGrammarMinutes: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>min/week</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Reading Sets</Text>
          <TextInput style={styles.input} value={form.weeklyReadingSets} onChangeText={(v) => setForm((p) => ({ ...p, weeklyReadingSets: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>set/week</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Listening Sets</Text>
          <TextInput style={styles.input} value={form.weeklyListeningSets} onChangeText={(v) => setForm((p) => ({ ...p, weeklyListeningSets: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>set/week</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Vocab</Text>
          <TextInput style={styles.input} value={form.weeklyVocabMinutes} onChangeText={(v) => setForm((p) => ({ ...p, weeklyVocabMinutes: v }))} keyboardType="number-pad" />
          <Text style={styles.label}>min/week</Text>
        </View>
        <Button label="Save Weekly Goals" onPress={onSaveCustomPlan} />
      </Card>

      {customEnabled && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Active Custom Plan</Text>
          <Text style={styles.body}>Essays: {savedPlan.essays} / day</Text>
          <Text style={styles.body}>App time: {savedPlan.appMinutes} min / day</Text>
          <Text style={styles.body}>Grammar: {savedPlan.grammarMinutes} min / day</Text>
          <Text style={styles.body}>Reading: {savedPlan.readingSets} set / day</Text>
          <Text style={styles.body}>Listening: {savedPlan.listeningSets} set / day</Text>
          <Text style={styles.body}>Vocab: {savedPlan.vocabMinutes} min / day</Text>
          <Text style={styles.body}>Weekly essays: {savedPlan.weeklyEssays}</Text>
          <Text style={styles.body}>Weekly app time: {savedPlan.weeklyAppMinutes} min</Text>
          <Text style={styles.body}>Weekly grammar: {savedPlan.weeklyGrammarMinutes} min</Text>
          <Text style={styles.body}>Weekly reading: {savedPlan.weeklyReadingSets} set</Text>
          <Text style={styles.body}>Weekly listening: {savedPlan.weeklyListeningSets} set</Text>
          <Text style={styles.body}>Weekly vocab: {savedPlan.weeklyVocabMinutes} min</Text>
          <Text style={styles.sub}>Today app time: {todaysMinutes} min ({appTimeProgress})</Text>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.h3}>Adaptive Daily Plan</Text>
        <Text style={styles.body}>Listening: {plan.listening}</Text>
        <Text style={styles.body}>Reading: {plan.reading}</Text>
        <Text style={styles.body}>Grammar: {plan.grammar}</Text>
        <Text style={styles.body}>Writing: {plan.writing}</Text>
        <Text style={styles.body}>Vocab: {plan.vocab}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Priority Focus</Text>
        <Text style={styles.body}>1. {plan.priority1}</Text>
        <Text style={styles.body}>2. {plan.priority2}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Current Accuracy</Text>
        <Text style={styles.body}>Reading: {formatAcc(planData.stats.reading.accuracy)}</Text>
        <Text style={styles.body}>Listening: {formatAcc(planData.stats.listening.accuracy)}</Text>
        <Text style={styles.body}>Grammar: {formatAcc(planData.stats.grammar.accuracy)}</Text>
        <Text style={styles.body}>Writing: {formatAcc(planData.stats.writing.accuracy)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Start Today</Text>
        <View style={styles.row}>
          <Button label="Reading" variant="secondary" onPress={() => navigation.navigate('Reading')} />
          <Button label="Listening" variant="secondary" onPress={() => navigation.navigate('Listening')} />
          <Button label="Grammar" variant="secondary" onPress={() => navigation.navigate('Grammar')} />
          <Button label="Writing" onPress={() => navigation.navigate('WritingEditor')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Weekly Goals</Text>
        {weeklyGoals.map((g) => (
          <Text key={g} style={styles.body}>• {g}</Text>
        ))}
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
    fontFamily: typography.fontBody
  },
  card: {
    marginBottom: spacing.lg
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm
  },
  label: {
    width: 94,
    fontSize: typography.small,
    color: colors.text
  },
  input: {
    width: 72,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: '#fff'
  }
});
