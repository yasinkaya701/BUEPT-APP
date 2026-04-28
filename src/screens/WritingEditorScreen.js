import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import ProgressBar from '../components/ProgressBar';
import Screen from '../components/Screen';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { countWords } from '../utils/ys9Mock';
import { buildWritingAiTips } from '../utils/writingAi';
import { suggestSynonyms, lookupSynonymsForWord } from '../utils/synonymSuggest';
import { detectBasicErrors } from '../utils/basicErrorDetect';
import { getPromptForLevel } from '../utils/prompts';
import { getTimerForLevel } from '../utils/timer';
import { loadDraft, saveDraft, saveDraftSnapshot } from '../utils/essayStorage';
import { getWordTarget } from '../utils/targets';
import { scoreWritingRubric } from '../utils/rubricScoring';
import { buildWritingOpenEndedPrompts } from '../utils/openEndedPrompts';
import templates from '../../data/writing_templates.json';
import transitions from '../../data/writing_transitions.json';
import lessons from '../../data/writing_lessons.json';
import connectors from '../../data/writing_connectors.json';
import { requestWritingAssistant } from '../utils/onlineFeedback';

const TYPES = ['opinion', 'definition', 'cause_effect', 'problem_solution', 'compare_contrast', 'argumentative', 'reaction'];
const TASKS = ['paragraph', 'essay'];
const DIFFICULTY = ['easy', 'medium', 'hard'];
const TOPICS = ['education', 'technology', 'environment', 'society', 'economy', 'health', 'media', 'culture'];
const VIEWS = ['draft', 'assistant', 'coach', 'resources', 'prompt'];

const TYPE_GUIDE = {
  opinion: ['State your position early.', 'Support it with two reasons.', 'Add one clear example.'],
  argumentative: ['Write a clear thesis.', 'Use evidence for each claim.', 'Address one counterpoint.'],
  cause_effect: ['Separate causes and effects.', 'Use clear causal connectors.', 'Link each cause to an impact.'],
  problem_solution: ['Define the problem precisely.', 'Offer two realistic solutions.', 'Explain which one is stronger.'],
  compare_contrast: ['Compare both sides fairly.', 'Use contrast signals.', 'End with a clear judgement.'],
  definition: ['Give a precise definition.', 'List key features.', 'Include one example.'],
  reaction: ['State your response clearly.', 'Support it with evidence.', 'Keep the tone academic.'],
};

function formatLabel(value = '') {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

const PROMPT_STOPWORDS = new Set([
  'about', 'after', 'also', 'because', 'could', 'essay', 'explain', 'should', 'their', 'there',
  'these', 'those', 'which', 'would', 'while', 'with', 'your', 'from', 'into', 'than', 'this',
  'that', 'have', 'what', 'when', 'where', 'why', 'does', 'make', 'many', 'much', 'some',
]);

function extractPromptSignals(promptItem = {}) {
  const explicit = Array.isArray(promptItem?.keywords) ? promptItem.keywords : [];
  if (explicit.length) {
    return Array.from(new Set(explicit.map((item) => String(item || '').trim()).filter(Boolean))).slice(0, 6);
  }
  return String(promptItem?.prompt || '')
    .toLowerCase()
    .match(/[a-z][a-z-]{3,}/g)
    ?.filter((word) => !PROMPT_STOPWORDS.has(word))
    .slice(0, 6) || [];
}

function buildPromptCoverage(text = '', promptItem = {}) {
  const keywords = extractPromptSignals(promptItem);
  if (!keywords.length) {
    return { keywords: [], covered: [], missing: [], ratio: 0 };
  }
  const lower = String(text || '').toLowerCase();
  const covered = keywords.filter((keyword) => lower.includes(String(keyword).toLowerCase()));
  const missing = keywords.filter((keyword) => !covered.includes(keyword));
  return {
    keywords,
    covered,
    missing,
    ratio: Math.round((covered.length / keywords.length) * 100),
  };
}

function buildStructureRoute(task = 'paragraph', resolvedType = 'general', templateBlock = {}, targetWords = 120) {
  const introStarter = templateBlock?.intro?.[0] || 'This topic matters because';
  const bodyStarter = templateBlock?.body?.[0] || 'One clear reason is that';
  const conclusionStarter = templateBlock?.conclusion?.[0] || 'In conclusion,';
  if (task === 'essay') {
    return [
      {
        key: 'intro',
        title: 'Introduction',
        target: `${Math.max(35, Math.round(targetWords * 0.18))}-${Math.max(55, Math.round(targetWords * 0.24))} words`,
        note: 'State the topic, narrow the focus, and end with a direct thesis.',
        starter: introStarter,
      },
      {
        key: 'body-1',
        title: 'Body Paragraph 1',
        target: `${Math.max(45, Math.round(targetWords * 0.24))}-${Math.max(70, Math.round(targetWords * 0.3))} words`,
        note: 'Develop your strongest point with one example or one piece of evidence.',
        starter: bodyStarter,
      },
      {
        key: 'body-2',
        title: 'Body Paragraph 2',
        target: `${Math.max(45, Math.round(targetWords * 0.24))}-${Math.max(70, Math.round(targetWords * 0.3))} words`,
        note: resolvedType === 'compare_contrast' ? 'Balance the second side and use contrast markers.' : 'Add a second developed point or a counterpoint with evaluation.',
        starter: bodyStarter,
      },
      {
        key: 'conclusion',
        title: 'Conclusion',
        target: `${Math.max(25, Math.round(targetWords * 0.12))}-${Math.max(40, Math.round(targetWords * 0.18))} words`,
        note: 'Restate the thesis in cleaner language and finish with a final judgement.',
        starter: conclusionStarter,
      },
    ];
  }
  return [
    {
      key: 'opening',
      title: 'Opening',
      target: `${Math.max(20, Math.round(targetWords * 0.22))}-${Math.max(35, Math.round(targetWords * 0.3))} words`,
      note: 'State your answer early and show the main direction of the paragraph.',
      starter: introStarter,
    },
    {
      key: 'support',
      title: 'Support + Example',
      target: `${Math.max(45, Math.round(targetWords * 0.4))}-${Math.max(70, Math.round(targetWords * 0.55))} words`,
      note: 'Develop one reason and one concrete example.',
      starter: bodyStarter,
    },
    {
      key: 'close',
      title: 'Closing Sentence',
      target: `${Math.max(15, Math.round(targetWords * 0.12))}-${Math.max(25, Math.round(targetWords * 0.2))} words`,
      note: 'Close the paragraph cleanly instead of ending with the example.',
      starter: conclusionStarter,
    },
  ];
}

function buildRevisionSprint({ wordCount = 0, targetWords = 120, draftInsights = {}, issues = [], promptCoverage = {}, rubric = {} }) {
  const sprint = [];
  if ((promptCoverage.missing || []).length) {
    sprint.push({
      key: 'coverage',
      title: 'Fix Task Coverage',
      body: `Bring in these missing prompt signals: ${(promptCoverage.missing || []).slice(0, 3).join(', ')}.`,
    });
  }
  if (wordCount < targetWords) {
    sprint.push({
      key: 'length',
      title: 'Finish Development',
      body: `You are ${targetWords - wordCount} words short. Add one developed example or one explained reason.`,
    });
  }
  if (!draftInsights.hasThesis || !draftInsights.hasConclusion) {
    sprint.push({
      key: 'structure',
      title: 'Tighten Structure',
      body: `Missing signal: ${!draftInsights.hasThesis ? 'thesis' : 'conclusion'}. Add it before polishing vocabulary.`,
    });
  }
  if (issues.length) {
    sprint.push({
      key: 'grammar',
      title: 'Clean Basic Errors',
      body: `Resolve the first ${Math.min(3, issues.length)} grammar issues before generating a final rewrite.`,
    });
  }
  if (Array.isArray(rubric.priorityPlan) && rubric.priorityPlan.length) {
    const top = rubric.priorityPlan[0];
    sprint.push({
      key: 'rubric',
      title: `Raise ${top.area}`,
      body: `${top.action} Then do this drill: ${top.drill}.`,
    });
  }
  return sprint.slice(0, 3);
}

function MetricTile({ label, value, tone = 'default' }) {
  return (
    <View style={[styles.metricTile, tone === 'accent' && styles.metricTileAccent]}>
      <Text style={[styles.metricValue, tone === 'accent' && styles.metricValueAccent]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ScoreRow({ item }) {
  const widthPct = `${Math.max(10, Math.round((item.score / item.max) * 100))}%`;
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHead}>
        <Text style={styles.bodyStrong}>{item.name}</Text>
        <Text style={styles.sub}>{item.score}/{item.max}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: widthPct }]} />
      </View>
    </View>
  );
}

export default function WritingEditorScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1040;
  const { essayText, setEssayText, generateReport, level, toggleFavoritePrompt, favoritePrompts } = useAppState();

  const [text, setText] = useState(essayText || '');
  const [type, setType] = useState(route?.params?.initialType || null);
  const [task, setTask] = useState(route?.params?.initialTask || null);
  const [difficulty, setDifficulty] = useState(route?.params?.initialDifficulty || null);
  const [topic, setTopic] = useState(route?.params?.initialTopic || null);
  const [seed, setSeed] = useState(0);
  const [savedAt, setSavedAt] = useState(null);
  const [durationMin, setDurationMin] = useState(40);
  const [remainingSec, setRemainingSec] = useState(40 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showAutoGrammar, setShowAutoGrammar] = useState(true);
  const [synInput, setSynInput] = useState('');
  const [synResults, setSynResults] = useState([]);
  const [activeView, setActiveView] = useState('draft');
  const [manualPrompt, setManualPrompt] = useState(route?.params?.prompt || null);
  const [manualPromptMeta, setManualPromptMeta] = useState(route?.params?.promptMeta || null);
  const draftText = route?.params?.draftText || null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantReply, setAssistantReply] = useState('');

  useEffect(() => {
    if (draftText) {
      setText(draftText);
      return;
    }
    let mounted = true;
    loadDraft().then((draft) => {
      if (mounted && draft) setText(draft);
    });
    return () => {
      mounted = false;
    };
  }, [draftText]);

  useEffect(() => {
    let clearTimer;
    const timeout = setTimeout(() => {
      saveDraft(text);
      saveDraftSnapshot(text);
      setSavedAt(new Date());
      clearTimer = setTimeout(() => setSavedAt(null), 3000);
    }, 800);
    return () => {
      clearTimeout(timeout);
      clearTimeout(clearTimer);
    };
  }, [text]);

  const promptItem = useMemo(() => {
    if (manualPrompt) {
      return {
        prompt: manualPrompt,
        type: manualPromptMeta?.type || type || 'general',
        task: manualPromptMeta?.task || task || 'paragraph',
        keywords: manualPromptMeta?.keywords || [],
        estMin: manualPromptMeta?.estMin || getTimerForLevel(level),
        difficulty: manualPromptMeta?.difficulty || difficulty || 'medium',
      };
    }
    return getPromptForLevel(level, type, task, difficulty, topic, seed);
  }, [manualPrompt, manualPromptMeta, level, type, task, difficulty, topic, seed]);

  const resolvedType = promptItem?.type || type || 'general';
  const wordCount = countWords(text);
  const isFav = !!promptItem?.prompt && favoritePrompts.includes(promptItem.prompt);
  const timerMin = promptItem.task === 'essay' ? 40 : getTimerForLevel(level);
  const targetWords = getWordTarget(promptItem.task, level);
  const progress = Math.min(1, wordCount / targetWords);
  const wordDelta = wordCount - targetWords;
  const wordStatus = wordDelta >= 0 ? `On target (+${wordDelta})` : `${Math.abs(wordDelta)} words left`;
  const suggestions = useMemo(() => suggestSynonyms(text), [text]);
  const aiTips = useMemo(() => buildWritingAiTips(text, resolvedType, level), [text, resolvedType, level]);
  const issues = useMemo(() => detectBasicErrors(text), [text]);
  const templateBlock = useMemo(
    () => templates[resolvedType] || templates.general || { intro: [], body: [], conclusion: [] },
    [resolvedType]
  );
  const writingRubricAuto = useMemo(
    () => scoreWritingRubric({
      text,
      prompt: promptItem?.prompt || '',
      targetWords,
    }),
    [text, promptItem?.prompt, targetWords]
  );
  const writingOpenEndedPrompts = useMemo(
    () => buildWritingOpenEndedPrompts(promptItem, resolvedType, level),
    [promptItem, resolvedType, level]
  );
  const draftInsights = useMemo(() => analyzeDraft(text), [text]);
  const checklist = useMemo(() => buildWritingChecklist(text, targetWords), [text, targetWords]);
  const checklistScore = checklist.filter((item) => item.ok).length;
  const promptCoverage = useMemo(() => buildPromptCoverage(text, promptItem), [text, promptItem]);
  const structureRoute = useMemo(
    () => buildStructureRoute(promptItem?.task, resolvedType, templateBlock, targetWords),
    [promptItem?.task, resolvedType, templateBlock, targetWords]
  );
  const revisionSprint = useMemo(
    () => buildRevisionSprint({
      wordCount,
      targetWords,
      draftInsights,
      issues,
      promptCoverage,
      rubric: writingRubricAuto,
    }),
    [wordCount, targetWords, draftInsights, issues, promptCoverage, writingRubricAuto]
  );

  useEffect(() => {
    setDurationMin(timerMin);
    setRemainingSec(timerMin * 60);
    setIsRunning(false);
  }, [timerMin]);

  useEffect(() => {
    if (!isRunning) return undefined;
    if (remainingSec <= 0) {
      setIsRunning(false);
      return undefined;
    }
    const interval = setInterval(() => {
      setRemainingSec((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remainingSec]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

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
    const fromWord = lookupSynonymsForWord(term, 8);
    if (fromWord.length) {
      setSynResults(fromWord);
      return;
    }
    const fromText = suggestSynonyms(term);
    setSynResults((fromText?.[0]?.synonyms || []).slice(0, 8));
  };

  const refreshPrompt = () => {
    setManualPrompt(null);
    setManualPromptMeta(null);
    setSeed((current) => current + 1);
  };

  const renderInner = () => (
    <>
      <Card style={styles.heroCard} glow>
        <Text style={styles.h1}>Writing Workspace</Text>
        <Text style={styles.sub}>One prompt, one draft, one clear feedback cycle.</Text>
        <Text style={styles.promptLabel}>Current Prompt</Text>
        <Text style={styles.promptText}>{promptItem.prompt}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Task: {formatLabel(promptItem.task)}</Text>
          <Text style={styles.meta}>Type: {formatLabel(promptItem.type)}</Text>
          <Text style={styles.meta}>Difficulty: {formatLabel(promptItem.difficulty)}</Text>
          <Text style={styles.meta}>Level: {String(level || 'P2').toUpperCase()}</Text>
        </View>
        <View style={styles.actionRow}>
          <Button label="New Prompt" variant="secondary" onPress={refreshPrompt} icon="shuffle-outline" />
          <Button label={isFav ? 'Unfavorite' : 'Favorite'} onPress={() => toggleFavoritePrompt(promptItem.prompt)} icon={isFav ? 'heart' : 'heart-outline'} />
          <Button label="Prompt Setup" variant="ghost" onPress={() => setActiveView('prompt')} icon="options-outline" />
        </View>
      </Card>
      <View style={styles.viewRow}>
        {VIEWS.map((item) => (
          <Chip key={item} label={formatLabel(item)} active={activeView === item} onPress={() => setActiveView(item)} />
        ))}
      </View>
      {activeView === 'draft' ? renderDraftView() : null}
      {activeView === 'assistant' ? renderAssistantView() : null}
      {activeView === 'coach' ? renderCoachView() : null}
      {activeView === 'resources' ? renderResourcesView() : null}
      {activeView === 'prompt' ? renderPromptView() : null}
    </>
  );

  const callAssistant = async (mode) => {
    setAssistantLoading(true);
    setAssistantReply('AI is thinking...');
    try {
      const res = await requestWritingAssistant({
        task: promptItem.task,
        prompt: promptItem.prompt,
        currentText: text,
        mode
      });
      setAssistantReply(res.text);
    } catch (e) {
      setAssistantReply(`Error: ${e.message}`);
    } finally {
      setAssistantLoading(false);
    }
  };

  const onSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const draftMeta = {
      type: resolvedType,
      level,
      keywords: promptItem?.keywords || [],
      prompt: promptItem?.prompt || '',
      task: promptItem?.task || task || 'paragraph',
    };
    setEssayText(text);
    navigation.navigate('Feedback', { draftMeta });
    setTimeout(() => {
      try {
        generateReport({
          text,
          ...draftMeta,
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 16);
  };

  const renderDraftView = () => (
    <View style={[styles.workspaceGrid, isWide && styles.workspaceGridWide]}>
      <Card style={[styles.card, styles.editorCard]}>
        <Text style={styles.h3}>Draft</Text>
        <Text style={styles.sub}>Write first. Fix later. Use the right-side cards for timing and structure.</Text>

        <View style={styles.timerRow}>
          <MetricTile label="Timer" value={formatTime(remainingSec)} tone="accent" />
          <MetricTile label="Words" value={`${wordCount}/${targetWords}`} />
          <MetricTile label="Task" value={formatLabel(promptItem.task)} />
        </View>

        <View style={styles.chipWrap}>
          {[15, 25, 40, 60].map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes} min`}
              active={durationMin === minutes}
              onPress={() => {
                setDurationMin(minutes);
                setRemainingSec(minutes * 60);
                setIsRunning(false);
              }}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          <Button label={isRunning ? 'Pause Timer' : 'Start Timer'} variant="secondary" onPress={() => setIsRunning((value) => !value)} icon={isRunning ? 'pause-outline' : 'play-outline'} />
          <Button label="Reset" variant="secondary" onPress={() => { setRemainingSec(durationMin * 60); setIsRunning(false); }} icon="refresh-outline" />
          <Button label="Online Check" variant="ghost" onPress={() => navigation.navigate('OnlineFeedback', { initialText: text })} icon="globe-outline" />
        </View>

        <Text style={[styles.statusText, wordDelta >= 0 ? styles.good : styles.warn]}>{wordStatus}</Text>
        <ProgressBar value={progress} />

        <TextInput
          style={styles.input}
          multiline
          placeholder="Start writing here..."
          value={text}
          onChangeText={setText}
          placeholderTextColor={colors.muted}
        />

        <View style={styles.bottomRow}>
          <Text style={[styles.saved, savedAt ? styles.savedVisible : styles.savedHidden]}>
            {savedAt ? `Autosaved at ${savedAt.toLocaleTimeString()}` : 'Autosave ready'}
          </Text>
          <Button
            label={isSubmitting ? 'Preparing Feedback...' : 'Submit for Feedback'}
            onPress={onSubmit}
            icon="checkmark-circle-outline"
            disabled={isSubmitting}
          />
        </View>
      </Card>

      <View style={styles.sideColumn}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Draft Snapshot</Text>
          <Text style={styles.body}>Paragraphs: {draftInsights.paragraphs} • Sentences: {draftInsights.sentences}</Text>
          <Text style={styles.body}>Average sentence: {draftInsights.avgSentence} words</Text>
          <Text style={styles.body}>Connector variety: {draftInsights.connectorVariety}</Text>
          <Text style={styles.body}>Thesis signal: {draftInsights.hasThesis ? 'Yes' : 'No'}</Text>
          <Text style={styles.body}>Conclusion signal: {draftInsights.hasConclusion ? 'Yes' : 'No'}</Text>
          <View style={styles.actionRow}>
            {!draftInsights.hasThesis ? (
              <Button label="Add Thesis Starter" variant="secondary" onPress={() => insertStarter('In this essay, I argue that')} />
            ) : null}
            {!draftInsights.hasConclusion ? (
              <Button label="Add Conclusion Starter" variant="secondary" onPress={() => insertStarter('In conclusion,')} />
            ) : null}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Prompt Coverage</Text>
          <Text style={styles.sub}>
            Coverage: {promptCoverage.covered.length}/{promptCoverage.keywords.length || 0} · {promptCoverage.ratio}%
          </Text>
          {promptCoverage.covered.length ? (
            <>
              <Text style={styles.sectionLabel}>Covered</Text>
              <View style={styles.chipWrap}>
                {promptCoverage.covered.map((item) => (
                  <View key={`covered-${item}`} style={[styles.coveragePill, styles.coveragePillGood]}>
                    <Text style={[styles.coveragePillText, styles.coveragePillTextGood]}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
          {promptCoverage.missing.length ? (
            <>
              <Text style={styles.sectionLabel}>Still Missing</Text>
              <View style={styles.chipWrap}>
                {promptCoverage.missing.map((item) => (
                  <View key={`missing-${item}`} style={[styles.coveragePill, styles.coveragePillWarn]}>
                    <Text style={[styles.coveragePillText, styles.coveragePillTextWarn]}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.body}>Prompt coverage looks stable.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Structure Route</Text>
          <Text style={styles.sub}>Use this as the drafting order. Do not jump to style upgrades before these blocks exist.</Text>
          {structureRoute.map((item) => (
            <View key={item.key} style={styles.routeBlock}>
              <View style={styles.routeHead}>
                <Text style={styles.bodyStrong}>{item.title}</Text>
                <Text style={styles.routeTarget}>{item.target}</Text>
              </View>
              <Text style={styles.body}>{item.note}</Text>
              <Button label="Insert Starter" variant="secondary" onPress={() => insertStarter(item.starter)} />
            </View>
          ))}
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
          <Text style={styles.h3}>Auto Rubric</Text>
          <Text style={styles.rubricTotal}>
            {writingRubricAuto.total}/{writingRubricAuto.max} • {writingRubricAuto.wascBand ? `${writingRubricAuto.wascBand.code} (${writingRubricAuto.wascBand.label})` : writingRubricAuto.band}
          </Text>
          <Text style={styles.sub}>Readiness: {writingRubricAuto.readiness}% • {writingRubricAuto.feedbackSummary}</Text>
          {writingRubricAuto.wascBand?.descriptor ? <Text style={styles.sub}>WASC criteria: {writingRubricAuto.wascBand.descriptor}</Text> : null}
          {writingRubricAuto.categories.map((item) => (
            <ScoreRow key={item.name} item={item} />
          ))}
        </Card>
        <Card style={styles.card}>
          <Text style={styles.h3}>AI Quick Help</Text>
          <Text style={styles.sub}>Need help getting started or moving forward?</Text>
          <View style={styles.actionRow}>
            <Button label="Thesis Helper" variant="secondary" onPress={() => { setActiveView('assistant'); callAssistant('thesis'); }} icon="bulb-outline" />
            <Button label="Outline Helper" variant="secondary" onPress={() => { setActiveView('assistant'); callAssistant('outline'); }} icon="list-outline" />
          </View>
        </Card>
      </View>
    </View>
  );

  const renderAssistantView = () => (
    <Card style={styles.card}>
      <Text style={styles.h3}>BUEPT AI Writing Assistant</Text>
      <Text style={styles.sub}>Ask the AI to help you with specific parts of your writing process.</Text>
      
      <View style={styles.actionRow}>
        <Button 
          label="Generate Thesis Options" 
          variant={assistantLoading ? 'ghost' : 'secondary'} 
          onPress={() => callAssistant('thesis')} 
          disabled={assistantLoading}
          icon="bulb-outline"
        />
        <Button 
          label="Create Outline" 
          variant={assistantLoading ? 'ghost' : 'secondary'} 
          onPress={() => callAssistant('outline')} 
          disabled={assistantLoading}
          icon="list-outline"
        />
        <Button 
          label="Transition Help" 
          variant={assistantLoading ? 'ghost' : 'secondary'} 
          onPress={() => callAssistant('transition')} 
          disabled={assistantLoading}
          icon="git-compare-outline"
        />
      </View>

      <View style={styles.assistantOutput}>
        {assistantReply ? (
          <View style={styles.replyBox}>
            <Text style={styles.body}>{assistantReply}</Text>
            <Button 
              label="Clear" 
              variant="ghost" 
              onPress={() => setAssistantReply('')} 
              style={{ alignSelf: 'flex-end', marginTop: spacing.sm }} 
            />
          </View>
        ) : (
          <Text style={styles.sub}>Choose an assistant mode above to get AI help.</Text>
        )}
      </View>
    </Card>
  );

  const renderCoachView = () => (
    <>
      <Card style={styles.card}>
        <Text style={styles.h3}>Revision Sprint</Text>
        <Text style={styles.sub}>Do these three things before you run a full feedback cycle.</Text>
        {revisionSprint.length ? revisionSprint.map((item, index) => (
          <View key={item.key} style={styles.sprintRow}>
            <Text style={styles.sprintIndex}>{index + 1}</Text>
            <View style={styles.sprintBody}>
              <Text style={styles.bodyStrong}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )) : <Text style={styles.body}>No urgent revision sprint items right now.</Text>}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Revision Priorities</Text>
        <Text style={styles.sub}>Fix these first before you worry about templates or advanced style.</Text>
        {writingRubricAuto.priorityPlan?.length ? writingRubricAuto.priorityPlan.map((item) => (
          <View key={item.area} style={styles.planRow}>
            <Text style={[styles.planBadge, item.priority === 'High' ? styles.planBadgeHigh : styles.planBadgeMed]}>{item.priority}</Text>
            <View style={styles.planBody}>
              <Text style={styles.bodyStrong}>{item.area} ({item.score}/{item.max})</Text>
              <Text style={styles.body}>Action: {item.action}</Text>
              <Text style={styles.sub}>Drill: {item.drill}</Text>
            </View>
          </View>
        )) : <Text style={styles.body}>No urgent gaps detected yet.</Text>}
      </Card>

      <View style={[styles.workspaceGrid, isWide && styles.workspaceGridWide]}>
        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.h3}>Auto Grammar Alerts</Text>
            <Button label={showAutoGrammar ? 'On' : 'Off'} variant={showAutoGrammar ? 'primary' : 'secondary'} onPress={() => setShowAutoGrammar((value) => !value)} />
          </View>
          {showAutoGrammar ? (
            issues.length ? issues.slice(0, 10).map((issue) => (
              <Text key={issue} style={styles.body}>• {issue}</Text>
            )) : <Text style={styles.sub}>No basic issues detected yet.</Text>
          ) : (
            <Text style={styles.sub}>Auto grammar hints are disabled.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>AI Coach</Text>
          {aiTips.tips.length ? aiTips.tips.map((tip) => (
            <Text key={tip} style={styles.body}>• {tip}</Text>
          )) : <Text style={styles.sub}>Write a little more to unlock coaching tips.</Text>}
        </Card>
      </View>

      <View style={[styles.workspaceGrid, isWide && styles.workspaceGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Repeated Words</Text>
          {suggestions.length ? suggestions.slice(0, 8).map((item) => (
            <Text key={item.word} style={styles.body}>• {item.word} ({item.count}) → {item.synonyms.length ? item.synonyms.join(', ') : 'replace with a more specific word'}</Text>
          )) : <Text style={styles.sub}>No strong repetition pattern yet.</Text>}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Synonym Finder</Text>
          <Text style={styles.sub}>Look up one word while revising.</Text>
          <TextInput
            style={styles.inputSmall}
            placeholder="Enter a word"
            value={synInput}
            onChangeText={setSynInput}
            autoCapitalize="none"
            placeholderTextColor={colors.muted}
          />
          <View style={styles.actionRow}>
            <Button label="Find Synonyms" variant="secondary" onPress={lookupSynonyms} icon="search-outline" />
          </View>
          {synResults.length ? <Text style={styles.body}>Suggestions: {synResults.join(', ')}</Text> : <Text style={styles.sub}>No lookup yet.</Text>}
        </Card>
      </View>
    </>
  );

  const renderResourcesView = () => (
    <>
      <Card style={styles.card}>
        <Text style={styles.h3}>Writing Focus</Text>
        {(TYPE_GUIDE[promptItem.type] || TYPE_GUIDE.opinion).map((item) => (
          <Text key={item} style={styles.body}>• {item}</Text>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Expression Bank</Text>
        <Text style={styles.sub}>Use these only when they fit your paragraph. Do not paste everything.</Text>

        <Text style={styles.sectionLabel}>Introduction</Text>
        {templateBlock.intro.map((phrase) => (
          <View key={`intro-${phrase}`} style={styles.templateRow}>
            <Text style={styles.templateText}>{phrase}</Text>
            <Button label="Add" variant="secondary" onPress={() => addTemplate(phrase)} />
          </View>
        ))}

        <Text style={styles.sectionLabel}>Body</Text>
        {templateBlock.body.map((phrase) => (
          <View key={`body-${phrase}`} style={styles.templateRow}>
            <Text style={styles.templateText}>{phrase}</Text>
            <Button label="Add" variant="secondary" onPress={() => addTemplate(phrase)} />
          </View>
        ))}

        <Text style={styles.sectionLabel}>Conclusion</Text>
        {templateBlock.conclusion.map((phrase) => (
          <View key={`conclusion-${phrase}`} style={styles.templateRow}>
            <Text style={styles.templateText}>{phrase}</Text>
            <Button label="Add" variant="secondary" onPress={() => addTemplate(phrase)} />
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Transition Bank</Text>
        {Object.entries(transitions).map(([group, list]) => (
          <View key={group} style={styles.resourceBlock}>
            <Text style={styles.sectionLabel}>{formatLabel(group)}</Text>
            <View style={styles.chipWrap}>
              {list.map((item) => (
                <Button key={`${group}-${item}`} label={item} variant="secondary" onPress={() => addTemplate(item)} />
              ))}
            </View>
          </View>
        ))}
      </Card>

      <OpenEndedPracticeCard
        title="Open-Ended Writing Tasks"
        prompts={writingOpenEndedPrompts}
        placeholder="Plan or draft your answer..."
      />

      <Card style={styles.card}>
        <Text style={styles.h3}>Lesson Notes</Text>
        {Object.values(lessons).map((block) => (
          <View key={block.title} style={styles.resourceBlock}>
            <Text style={styles.sectionLabel}>{block.title}</Text>
            {block.points.map((point) => (
              <Text key={`${block.title}-${point}`} style={styles.body}>• {point}</Text>
            ))}
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Connector Sets</Text>
        {Object.entries(connectors).map(([group, list]) => (
          <View key={group} style={styles.resourceBlock}>
            <Text style={styles.sectionLabel}>{formatLabel(group)}</Text>
            <View style={styles.chipWrap}>
              {list.map((item) => (
                <Button key={`${group}-${item}`} label={item} variant="secondary" onPress={() => addTemplate(item)} />
              ))}
            </View>
          </View>
        ))}
      </Card>
    </>
  );

  const renderPromptView = () => (
    <Card style={styles.card}>
      <Text style={styles.h3}>Prompt Setup</Text>
      <Text style={styles.sub}>Keep this separate from drafting. Choose the prompt here, then go back to Draft.</Text>
      {manualPrompt ? (
        <View style={styles.lockedPromptBox}>
          <Text style={styles.sectionLabel}>Current locked prompt</Text>
          <Text style={styles.body}>{manualPrompt}</Text>
          <View style={styles.actionRow}>
            <Button label="Switch to Filtered Prompt" variant="secondary" onPress={refreshPrompt} icon="swap-horizontal-outline" />
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>Type</Text>
      <View style={styles.chipWrap}>
        <Chip label="All" active={!type} onPress={() => setType(null)} />
        {TYPES.map((item) => (
          <Chip key={item} label={formatLabel(item)} active={type === item} onPress={() => setType(item)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Task</Text>
      <View style={styles.chipWrap}>
        <Chip label="All" active={!task} onPress={() => setTask(null)} />
        {TASKS.map((item) => (
          <Chip key={item} label={formatLabel(item)} active={task === item} onPress={() => setTask(item)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Difficulty</Text>
      <View style={styles.chipWrap}>
        <Chip label="All" active={!difficulty} onPress={() => setDifficulty(null)} />
        {DIFFICULTY.map((item) => (
          <Chip key={item} label={formatLabel(item)} active={difficulty === item} onPress={() => setDifficulty(item)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Topic</Text>
      <View style={styles.chipWrap}>
        <Chip label="All" active={!topic} onPress={() => setTopic(null)} />
        {TOPICS.map((item) => (
          <Chip key={item} label={formatLabel(item)} active={topic === item} onPress={() => setTopic(item)} />
        ))}
      </View>

      <View style={styles.actionRow}>
        <Button label="New Prompt" onPress={refreshPrompt} icon="shuffle-outline" />
        <Button label="Back to Draft" variant="secondary" onPress={() => setActiveView('draft')} icon="arrow-back-outline" />
      </View>
    </Card>
  );

  return (
    <Screen scroll contentStyle={styles.container}>
      {Platform.OS !== 'web' ? (
        <KeyboardAvoidingView enabled behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {renderInner()}
        </KeyboardAvoidingView>
      ) : renderInner()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  heroCard: {
    marginBottom: spacing.md,
    backgroundColor: '#F4F8FF',
    borderColor: '#C7DBFF',
    ...shadow.sm,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  promptLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  promptText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  meta: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E2FA',
  },
  viewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  workspaceGrid: {
    gap: spacing.md,
  },
  workspaceGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sideColumn: {
    flex: 0.95,
    gap: spacing.md,
  },
  editorCard: {
    flex: 1.15,
  },
  card: {
    marginBottom: spacing.md,
  },
  timerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricTile: {
    minWidth: 110,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: '#D8E3F6',
  },
  metricTileAccent: {
    backgroundColor: '#EAF1FF',
    borderColor: '#C5D8FF',
  },
  metricValue: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  metricValueAccent: {
    color: colors.primaryDark,
  },
  metricLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.small,
    marginBottom: spacing.sm,
  },
  good: {
    color: colors.success,
  },
  warn: {
    color: '#B42318',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    minHeight: 280,
    textAlignVertical: 'top',
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D8E3F6',
    color: colors.text,
    // Web: ensure cursor and pointer work properly
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', cursor: 'text' } : {}),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  saved: {
    fontSize: typography.small,
    color: colors.success,
  },
  savedVisible: {
    opacity: 1,
  },
  savedHidden: {
    opacity: 0.7,
  },
  body: {
    fontSize: typography.small,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  bodyStrong: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
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
    flex: 1,
  },
  checkOk: {
    color: colors.success,
  },
  checkMissing: {
    color: '#B42318',
  },
  checkOkText: {
    color: colors.success,
  },
  checkMissingText: {
    color: colors.text,
  },
  rubricTotal: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    marginBottom: spacing.sm,
  },
  scoreHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#DFE7F5',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: 999,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  planBadge: {
    minWidth: 54,
    textAlign: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    overflow: 'hidden',
  },
  planBadgeHigh: {
    backgroundColor: '#DC2626',
  },
  planBadgeMed: {
    backgroundColor: '#2563EB',
  },
  planBody: {
    flex: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputSmall: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#D7E2F4',
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  coveragePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
  coveragePillGood: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
  },
  coveragePillWarn: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  coveragePillText: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  coveragePillTextGood: {
    color: '#166534',
  },
  coveragePillTextWarn: {
    color: '#B45309',
  },
  routeBlock: {
    borderWidth: 1,
    borderColor: '#D7E2F4',
    backgroundColor: '#FBFDFF',
    borderRadius: 14,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  routeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  routeTarget: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
  },
  sprintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sprintIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    backgroundColor: '#EAF1FF',
    color: colors.primaryDark,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    paddingTop: 3,
  },
  sprintBody: {
    flex: 1,
  },
  resourceBlock: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  templateRow: {
    marginBottom: spacing.sm,
  },
  templateText: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lockedPromptBox: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: '#D7E2F4',
    marginBottom: spacing.md,
  },
  assistantOutput: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2EAF7',
    minHeight: 120,
    justifyContent: 'center',
  },
  replyBox: {
    gap: spacing.sm,
  },
});
