import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, TextInput, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import ProgressBar from '../components/ProgressBar';
import Screen from '../components/Screen';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { countWords } from '../utils/ys9Mock';
import { buildWritingAiTips } from '../utils/writingAi';
import { suggestSynonyms } from '../utils/synonymSuggest';
import { detectBasicErrors } from '../utils/basicErrorDetect';
import { getPromptForLevel } from '../utils/prompts';
import { getTimerForLevel } from '../utils/timer';
import { loadDraft, saveDraft, saveDraftSnapshot } from '../utils/essayStorage';
import { getWordTarget } from '../utils/targets';
import { buildInlineMarkedText, parseMarkedText } from '../utils/highlightBasic';
import { getWordEntry } from '../utils/dictionary';
import { scoreWritingRubric } from '../utils/rubricScoring';
import { buildWritingOpenEndedPrompts } from '../utils/openEndedPrompts';
import rubric from '../../data/writing_rubric.json';
import templates from '../../data/writing_templates.json';
import transitions from '../../data/writing_transitions.json';
import lessons from '../../data/writing_lessons.json';
import connectors from '../../data/writing_connectors.json';

const TYPES = ['opinion', 'definition', 'cause_effect', 'problem_solution', 'compare_contrast', 'argumentative', 'reaction'];
const TASKS = ['paragraph', 'essay'];
const DIFFICULTY = ['easy', 'medium', 'hard'];
const TOPICS = ['education', 'technology', 'environment', 'society', 'economy', 'health', 'media', 'culture'];
const TYPE_GUIDE = {
  opinion: ['State your opinion in the first paragraph.', 'Give two reasons.', 'Add one example.'],
  argumentative: ['Clear thesis + counter‑argument.', 'Use evidence for each claim.', 'Refute the counter point.'],
  cause_effect: ['Separate causes from effects.', 'Use cause/effect connectors.', 'Give a concrete example.'],
  problem_solution: ['Define the problem precisely.', 'Give 2 solutions.', 'Evaluate which is best.'],
  compare_contrast: ['Use a clear comparison structure.', 'Balance both sides.', 'Use contrast connectors.'],
  definition: ['Provide a precise definition.', 'List key characteristics.', 'Give one example.'],
  reaction: ['Explain your reaction.', 'Support with evidence.', 'Use academic tone.']
};
const ENGINES = [
  { key: 'hybrid', label: 'Hybrid (Best)' },
  { key: 'online', label: 'Online (LanguageTool)' },
  { key: 'local', label: 'Local (Rule-based)' }
];

function analyzeDraft(text = '') {
  const normalized = String(text || '').trim();
  const paragraphs = normalized ? normalized.split(/\n\s*\n/).filter((p) => p.trim().length > 0) : [];
  const sentences = normalized ? normalized.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean) : [];
  const words = countWords(normalized);
  const avgSentence = sentences.length ? Math.round(words / sentences.length) : 0;
  const lower = normalized.toLowerCase();
  const hasThesis = /(i believe|in this essay|this essay argues|i argue that|the main point is)/.test(lower);
  const hasConclusion = /(in conclusion|to conclude|to sum up|overall|to summarize)/.test(lower);
  const connectorHits = (lower.match(/\bhowever|therefore|moreover|furthermore|in contrast|for example|as a result|on the other hand\b/g) || []);
  const connectorVariety = new Set(connectorHits).size;
  return {
    paragraphs: paragraphs.length,
    sentences: sentences.length,
    avgSentence,
    hasThesis,
    hasConclusion,
    connectorVariety,
  };
}

function buildWritingChecklist(text = '', targetWords = 120) {
  const value = String(text || '').trim();
  const lower = value.toLowerCase();
  const words = countWords(value);
  const thesis = /(in this essay|i argue that|i believe|the main point is|this essay argues)/.test(lower);
  const conclusion = /(in conclusion|to conclude|to sum up|overall|to summarize)/.test(lower);
  const example = /(for example|for instance|such as)/.test(lower);
  const connectorHits = (lower.match(/\bhowever|therefore|moreover|furthermore|in contrast|as a result\b/g) || []).length;
  return [
    { key: 'word_target', label: `Word target (${targetWords}+)`, ok: words >= targetWords },
    { key: 'thesis', label: 'Clear thesis/opening claim', ok: thesis },
    { key: 'example', label: 'At least one concrete example', ok: example },
    { key: 'connectors', label: 'Use 2+ academic connectors', ok: connectorHits >= 2 },
    { key: 'conclusion', label: 'Clear conclusion sentence', ok: conclusion },
  ];
}

export default function WritingEditorScreen({ navigation, route }) {
  const { essayText, setEssayText, generateReport, level, toggleFavoritePrompt, favoritePrompts, writingEngine, setWritingEngine } = useAppState();
  const [text, setText] = useState(essayText || '');
  const [type, setType] = useState(null);
  const [task, setTask] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [topic, setTopic] = useState(null);
  const [seed, setSeed] = useState(0);
  const [savedAt, setSavedAt] = useState(null);
  const [durationMin, setDurationMin] = useState(40);
  const [remainingSec, setRemainingSec] = useState(40 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showAutoGrammar, setShowAutoGrammar] = useState(true);
  const [synInput, setSynInput] = useState('');
  const [synResults, setSynResults] = useState([]);
  const forcedPrompt = route?.params?.prompt || null;
  const draftText = route?.params?.draftText || null;

  useEffect(() => {
    if (draftText) {
      setText(draftText);
      return;
    }
    loadDraft().then((d) => {
      if (d) setText(d);
    });
  }, [draftText]);

  useEffect(() => {
    let clearTimer;
    const t = setTimeout(() => {
      saveDraft(text);
      saveDraftSnapshot(text);
      setSavedAt(new Date());
      // Clear the "Saved" message after 3 seconds, but only if still mounted
      clearTimer = setTimeout(() => setSavedAt(null), 3000);
    }, 800);
    return () => {
      clearTimeout(t);
      clearTimeout(clearTimer);
    };
  }, [text]);

  const promptItem = useMemo(() => {
    if (forcedPrompt) {
      return { prompt: forcedPrompt, type: 'favorite', task: 'paragraph', estMin: getTimerForLevel(level), difficulty: 'medium' };
    }
    return getPromptForLevel(level, type, task, difficulty, topic, seed);
  }, [level, type, task, difficulty, topic, seed, forcedPrompt]);

  const wordCount = countWords(text);
  const isFav = favoritePrompts.includes(promptItem.prompt);
  const timerMin = promptItem.task === 'essay' ? 40 : getTimerForLevel(level);
  const targetWords = getWordTarget(promptItem.task, level);
  const progress = Math.min(1, wordCount / targetWords);
  const wordDelta = wordCount - targetWords;
  const wordStatus = wordDelta >= 0 ? `On target (+${wordDelta})` : `${Math.abs(wordDelta)} words left`;

  const suggestions = useMemo(() => suggestSynonyms(text), [text]);
  const aiTips = useMemo(() => buildWritingAiTips(text, type || "general", level), [text, type, level]);
  const issues = useMemo(() => detectBasicErrors(text), [text]);
  const inlineMarked = useMemo(() => buildInlineMarkedText(text), [text]);
  const inlineSegments = useMemo(() => parseMarkedText(inlineMarked), [inlineMarked]);
  const templateBlock = templates[type] || templates.general;
  const writingRubricAuto = useMemo(
    () => scoreWritingRubric({
      text,
      prompt: promptItem?.prompt || '',
      targetWords,
    }),
    [text, promptItem?.prompt, targetWords]
  );
  const writingOpenEndedPrompts = useMemo(
    () => buildWritingOpenEndedPrompts(promptItem, type || promptItem?.type || 'general', level),
    [promptItem, type, level]
  );
  const draftInsights = useMemo(() => analyzeDraft(text), [text]);
  const checklist = useMemo(() => buildWritingChecklist(text, targetWords), [text, targetWords]);
  const checklistScore = useMemo(() => checklist.filter((c) => c.ok).length, [checklist]);

  const addTemplate = (phrase) => {
    setText((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  const insertStarter = (starter) => {
    setText((prev) => {
      const trimmed = String(prev || '').trim();
      if (!trimmed) return starter;
      return `${trimmed}\n\n${starter}`;
    });
  };

  const lookupSynonyms = () => {
    const term = synInput.trim().toLowerCase();
    if (!term) {
      setSynResults([]);
      return;
    }
    const entry = getWordEntry(term);
    const fromEntry = entry?.synonyms || [];
    if (fromEntry.length) {
      setSynResults(fromEntry.slice(0, 8));
      return;
    }
    const fromText = suggestSynonyms(term);
    setSynResults((fromText || []).slice(0, 8));
  };

  useEffect(() => {
    // reset timer when task or level changes
    const base = timerMin;
    setDurationMin(base);
    setRemainingSec(base * 60);
    setIsRunning(false);
  }, [timerMin]);

  useEffect(() => {
    if (!isRunning) return;
    if (remainingSec <= 0) {
      setIsRunning(false);
      return;
    }
    const t = setInterval(() => {
      setRemainingSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, remainingSec]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const onSubmit = () => {
    setEssayText(text);
    if (writingEngine === 'online') {
      navigation.navigate('OnlineFeedback', { initialText: text });
      return;
    }
    generateReport({ text, type: type || 'general', level, keywords: promptItem?.keywords || [] });
    navigation.navigate('Feedback');
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.h1}>Write</Text>
        <Card style={styles.card}>
          <Text style={styles.h3}>Writing Model</Text>
          <Text style={styles.sub}>Choose how feedback is generated.</Text>
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
        </Card>

        <View style={styles.chips}>
          <Chip label="All" active={!type} onPress={() => setType(null)} />
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

        <View style={styles.chips}>
          <Chip label="All Levels" active={!difficulty} onPress={() => setDifficulty(null)} />
          {DIFFICULTY.map((d) => (
            <Chip key={d} label={d} active={difficulty === d} onPress={() => setDifficulty(d)} />
          ))}
        </View>

        <View style={styles.chips}>
          <Chip label="All Topics" active={!topic} onPress={() => setTopic(null)} />
          {TOPICS.map((t) => (
            <Chip key={t} label={t} active={topic === t} onPress={() => setTopic(t)} />
          ))}
        </View>

        <Text style={styles.meta}>Task: {promptItem.task} • Type: {promptItem.type} • Est: {promptItem.estMin} min • Difficulty: {promptItem.difficulty}</Text>
        <Text style={styles.prompt}>{promptItem.prompt}</Text>

        {TYPE_GUIDE[promptItem.type] && (
          <Card style={styles.card}>
            <Text style={styles.h3}>Writing Focus</Text>
            {TYPE_GUIDE[promptItem.type].map((s, i) => (
              <Text key={i} style={styles.body}>• {s}</Text>
            ))}
          </Card>
        )}

        <View style={styles.row}>
          <Button label="New Prompt" variant="secondary" onPress={() => setSeed((s) => s + 1)} />
          <Button label={isFav ? 'Unfavorite' : 'Favorite'} onPress={() => toggleFavoritePrompt(promptItem.prompt)} />
        </View>

        <Text style={styles.meta}>Timer: {formatTime(remainingSec)}</Text>

        {/* Live Word Counter with dynamic coloring */}
        <View style={styles.wordCountContainer}>
          <Text style={styles.meta}>Words: </Text>
          <Text style={[styles.wordCountNumber, wordDelta >= 0 ? styles.good : styles.warn]}>
            {wordCount}
          </Text>
          <Text style={styles.meta}> / {targetWords}</Text>
        </View>
        <Text style={[styles.meta, wordDelta >= 0 ? styles.good : styles.warn]}>{wordStatus}</Text>
        <View style={styles.chips}>
          {[15, 25, 40, 60].map((m) => (
            <Chip
              key={m}
              label={`${m} min`}
              active={durationMin === m}
              onPress={() => {
                setDurationMin(m);
                setRemainingSec(m * 60);
                setIsRunning(false);
              }}
            />
          ))}
        </View>
        <View style={styles.row}>
          <Button label={isRunning ? 'Pause' : 'Start'} variant="secondary" onPress={() => setIsRunning((v) => !v)} />
          <Button label="Reset" variant="secondary" onPress={() => { setRemainingSec(durationMin * 60); setIsRunning(false); }} />
        </View>
        <ProgressBar value={progress} />

        {/* Auto-save Indicator */}
        <View style={styles.autosaveContainer}>
          <Text style={[styles.saved, savedAt ? styles.savedVisible : styles.savedHidden]}>
            {savedAt ? `✓ Autosaved at ${savedAt.toLocaleTimeString()}` : ' '}
          </Text>
        </View>
        <View style={styles.row}>
          <Button label="Submit Now" onPress={onSubmit} />
          <Button
            label="Online Check"
            variant="secondary"
            onPress={() => navigation.navigate('OnlineFeedback', { initialText: text })}
          />
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Start writing here..."
          value={text}
          onChangeText={setText}
        />

        <Card style={styles.card}>
          <Text style={styles.h3}>Draft Quality Tracker</Text>
          <Text style={styles.body}>Paragraphs: {draftInsights.paragraphs} • Sentences: {draftInsights.sentences}</Text>
          <Text style={styles.body}>Avg sentence length: {draftInsights.avgSentence} words</Text>
          <Text style={styles.body}>Thesis signal: {draftInsights.hasThesis ? 'Yes' : 'No'}</Text>
          <Text style={styles.body}>Conclusion signal: {draftInsights.hasConclusion ? 'Yes' : 'No'}</Text>
          <Text style={styles.body}>Connector variety: {draftInsights.connectorVariety}</Text>
          <View style={styles.row}>
            {!draftInsights.hasThesis && (
              <Button
                label="Add Thesis Starter"
                variant="secondary"
                onPress={() => insertStarter('In this essay, I argue that')}
              />
            )}
            {!draftInsights.hasConclusion && (
              <Button
                label="Add Conclusion Starter"
                variant="secondary"
                onPress={() => insertStarter('In conclusion,')}
              />
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Submission Checklist</Text>
          <Text style={styles.sub}>Completion: {checklistScore}/{checklist.length}</Text>
          {checklist.map((item) => (
            <View key={item.key} style={styles.checkRow}>
              <Text style={[styles.checkIcon, item.ok ? styles.checkOk : styles.checkMissing]}>{item.ok ? '✓' : '•'}</Text>
              <Text style={[styles.checkText, item.ok ? styles.checkOkText : styles.checkMissingText]}>{item.label}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Auto Rubric (Writing)</Text>
          <Text style={styles.rubricTotal}>
            {writingRubricAuto.total}/{writingRubricAuto.max} • {writingRubricAuto.band}
          </Text>
          {writingRubricAuto.categories.map((c) => (
            <Text key={c.name} style={styles.body}>• {c.name}: {c.score}/{c.max}</Text>
          ))}
          <Text style={styles.sub}>
            Words: {writingRubricAuto.metrics.wordCount} • Connectors: {writingRubricAuto.metrics.connectors} • Errors: {writingRubricAuto.metrics.errors}
          </Text>
          {writingRubricAuto.improvements.length > 0 && (
            <>
              <Text style={[styles.h4, { marginTop: spacing.sm }]}>Next Fixes</Text>
              {writingRubricAuto.improvements.map((tip) => (
                <Text key={tip} style={styles.sub}>• {tip}</Text>
              ))}
            </>
          )}
        </Card>

        <OpenEndedPracticeCard
          title="Open-Ended Writing Tasks"
          prompts={writingOpenEndedPrompts}
          placeholder="Plan or draft your answer..."
        />

        <Card style={styles.card}>
          <Text style={styles.h3}>AI Coach (Offline)</Text>
          <Text style={styles.sub}>Rule-based tips tailored to your draft</Text>
          {aiTips.tips.map((t, i) => (
            <Text key={i} style={styles.body}>• {t}</Text>
          ))}
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.h3}>Auto Grammar Alerts</Text>
            <Button
              label={showAutoGrammar ? 'On' : 'Off'}
              variant={showAutoGrammar ? 'primary' : 'secondary'}
              onPress={() => setShowAutoGrammar((v) => !v)}
            />
          </View>
          {showAutoGrammar ? (
            <>
              {issues.length ? (
                issues.map((issue, i) => (
                  <Text key={i} style={styles.body}>• {issue}</Text>
                ))
              ) : (
                <Text style={styles.sub}>No basic issues detected yet.</Text>
              )}
              {inlineSegments.length ? (
                <Text style={styles.inlinePreview}>
                  {inlineSegments.map((seg, i) => {
                    if (seg.type === 'space') return <Text key={i} style={styles.inlineSpace}>{seg.text}</Text>;
                    if (seg.type === 'double_space') return <Text key={i} style={styles.inlineDouble}>{seg.text}</Text>;
                    if (seg.type === 'repeat') return <Text key={i} style={styles.inlineRepeat}>{seg.text}</Text>;
                    return <Text key={i} style={styles.inlineText}>{seg.text}</Text>;
                  })}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.sub}>Auto grammar hints are disabled.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Synonym Finder</Text>
          <Text style={styles.sub}>Type a word and get suggestions.</Text>
          <TextInput
            style={styles.inputSmall}
            placeholder="Enter a word"
            value={synInput}
            onChangeText={setSynInput}
            autoCapitalize="none"
          />
          <Button label="Find Synonyms" variant="secondary" onPress={lookupSynonyms} />
          {synResults.length > 0 ? (
            <Text style={styles.body}>Suggestions: {synResults.join(', ')}</Text>
          ) : (
            <Text style={styles.sub}>No synonyms yet.</Text>
          )}
        </Card>

        <Button label="Submit for BUEPT Feedback" onPress={onSubmit} />

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Essay Expression Bank</Text>
          <Text style={styles.sub}>Type: {type || 'general'}</Text>
          <Text style={styles.h4}>Introduction</Text>
          {templateBlock.intro.map((p, i) => (
            <View key={`intro-${i}`} style={styles.templateRow}>
              <Text style={styles.template}>{p}</Text>
              <Button label="Add" variant="secondary" onPress={() => addTemplate(p)} />
            </View>
          ))}
          <Text style={styles.h4}>Body</Text>
          {templateBlock.body.map((p, i) => (
            <View key={`body-${i}`} style={styles.templateRow}>
              <Text style={styles.template}>{p}</Text>
              <Button label="Add" variant="secondary" onPress={() => addTemplate(p)} />
            </View>
          ))}
          <Text style={styles.h4}>Conclusion</Text>
          {templateBlock.conclusion.map((p, i) => (
            <View key={`concl-${i}`} style={styles.templateRow}>
              <Text style={styles.template}>{p}</Text>
              <Button label="Add" variant="secondary" onPress={() => addTemplate(p)} />
            </View>
          ))}
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Transition Bank</Text>
          <Text style={styles.h4}>Addition</Text>
          <View style={styles.inlineRow}>
            {transitions.addition.map((t, i) => (
              <Button key={`add-${i}`} label={t} variant="secondary" onPress={() => addTemplate(t)} />
            ))}
          </View>
          <Text style={styles.h4}>Contrast</Text>
          <View style={styles.inlineRow}>
            {transitions.contrast.map((t, i) => (
              <Button key={`con-${i}`} label={t} variant="secondary" onPress={() => addTemplate(t)} />
            ))}
          </View>
          <Text style={styles.h4}>Cause/Effect</Text>
          <View style={styles.inlineRow}>
            {transitions.cause_effect.map((t, i) => (
              <Button key={`ce-${i}`} label={t} variant="secondary" onPress={() => addTemplate(t)} />
            ))}
          </View>
          <Text style={styles.h4}>Example</Text>
          <View style={styles.inlineRow}>
            {transitions.example.map((t, i) => (
              <Button key={`ex-${i}`} label={t} variant="secondary" onPress={() => addTemplate(t)} />
            ))}
          </View>
          <Text style={styles.h4}>Conclusion</Text>
          <View style={styles.inlineRow}>
            {transitions.conclusion.map((t, i) => (
              <Button key={`cl-${i}`} label={t} variant="secondary" onPress={() => addTemplate(t)} />
            ))}
          </View>
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Essay Lessons</Text>
          {Object.values(lessons).map((block, idx) => (
            <View key={idx} style={styles.lessonBlock}>
              <Text style={styles.h4}>{block.title}</Text>
              {block.points.map((p, i) => (
                <Text key={i} style={styles.sub}>• {p}</Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Important Connectors</Text>
          {Object.entries(connectors).map(([k, list]) => (
            <View key={k} style={styles.inlineRow}>
              {list.map((c, i) => (
                <Button key={`${k}-${i}`} label={c + ','} variant="secondary" onPress={() => addTemplate(c + ',')} />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Rubric Checklist</Text>
          {rubric.checklist.map((c, i) => (
            <Text key={i} style={styles.sub}>• {c}</Text>
          ))}
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Repeated Words & Synonyms</Text>
          {suggestions.length === 0 && <Text style={styles.sub}>No repeated words yet.</Text>}
          {suggestions.map((s) => (
            <Text key={s.word} style={styles.sub}>
              {s.word} ({s.count}) → {s.synonyms.length ? s.synonyms.join(', ') : 'synonyms pending'}
            </Text>
          ))}
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Possible Issues</Text>
          {issues.length === 0 && <Text style={styles.sub}>No basic issues detected.</Text>}
          {issues.map((i, idx) => (
            <Text key={idx} style={styles.sub}>• {i}</Text>
          ))}
        </View>

        <View style={styles.suggestions}>
          <Text style={styles.h3}>Inline Marked Preview</Text>
          {inlineSegments.length === 0 && <Text style={styles.sub}>No marked text yet.</Text>}
          <Text style={styles.inline}>
            {inlineSegments.map((seg, idx) => {
              if (seg.type === 'space') return <Text key={idx} style={styles.tagSpace}> {seg.text} </Text>;
              if (seg.type === 'double_space') return <Text key={idx} style={styles.tagDouble}> {seg.text} </Text>;
              if (seg.type === 'repeat') return <Text key={idx} style={styles.tagRepeat}> {seg.text} </Text>;
              return <Text key={idx}>{seg.text}</Text>;
            })}
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md
  },
  prompt: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md
  },
  good: {
    color: '#1F8B4C'
  },
  warn: {
    color: '#B42318'
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  wordCountNumber: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: 'bold',
  },
  autosaveContainer: {
    height: 24, // Fixed height to prevent layout jump
    justifyContent: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xs
  },
  saved: {
    fontSize: typography.small,
    color: colors.success,
    fontStyle: 'italic',
  },
  savedVisible: {
    opacity: 1,
  },
  savedHidden: {
    opacity: 0,
  },
  inlinePreview: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.text
  },
  inlineText: {
    color: colors.text
  },
  inlineSpace: {
    color: '#B42318',
    fontWeight: '700'
  },
  inlineDouble: {
    color: '#B42318',
    fontWeight: '700'
  },
  inlineRepeat: {
    color: '#9A6700',
    fontWeight: '700'
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    height: 240,
    textAlignVertical: 'top',
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.lg
  },
  inputSmall: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary
  },
  suggestions: {
    marginTop: spacing.lg
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  h4: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  rubricTotal: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted
  },
  templateRow: {
    marginBottom: spacing.sm
  },
  template: {
    fontSize: typography.body,
    marginBottom: spacing.xs
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  lessonBlock: {
    marginBottom: spacing.md
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkIcon: {
    width: 18,
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
  },
  checkText: {
    fontSize: typography.small,
  },
  checkOk: {
    color: '#1F8B4C',
  },
  checkMissing: {
    color: '#B42318',
  },
  checkOkText: {
    color: '#1F8B4C',
  },
  checkMissingText: {
    color: colors.text,
  },
  inline: {
    fontSize: typography.small,
    color: colors.text
  },
  tagSpace: {
    backgroundColor: '#FFF3C4',
    color: '#7A5C00'
  },
  tagDouble: {
    backgroundColor: '#FFE1E1',
    color: '#7A0000'
  },
  tagRepeat: {
    backgroundColor: '#DDEBFF',
    color: '#003B7A'
  }
});
