import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Screen from '../components/Screen';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { checkOnlineFeedback, summarizeMatches, requestParaphrase, requestWritingRevision } from '../utils/onlineFeedback';
import { lookupSynonymsForWord, suggestSynonyms } from '../utils/synonymSuggest';
import { countWords } from '../utils/ys9Mock';
import { detectBasicErrors } from '../utils/basicErrorDetect';
import { scoreWritingRubric } from '../utils/rubricScoring';
import { getAiSourceMeta } from '../utils/aiWorkspace';

const TABS = ['overview', 'rewrite', 'tools', 'deep review', 'full report'];

function formatLabel(value = '') {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function uniqueStrings(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const value = String(item || '').trim();
    if (!value) return false;
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitSentences(text) {
  const safe = String(text || '').trim();
  if (!safe) return [];
  const parts = safe.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [safe];
  const seen = new Set();
  return parts
    .map((item) => item.trim())
    .filter((item) => item.length > 15)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const PROMPT_STOPWORDS = new Set([
  'about', 'after', 'also', 'because', 'could', 'essay', 'explain', 'should', 'their', 'there',
  'these', 'those', 'which', 'would', 'while', 'with', 'your', 'from', 'into', 'than', 'this',
  'that', 'have', 'what', 'when', 'where', 'why', 'does', 'make', 'many', 'much', 'some',
]);

function extractPromptSignals(promptText = '', keywords = []) {
  if (Array.isArray(keywords) && keywords.length) {
    return uniqueStrings(keywords).slice(0, 6);
  }
  return uniqueStrings(
    (String(promptText || '').toLowerCase().match(/[a-z][a-z-]{3,}/g) || [])
      .filter((word) => !PROMPT_STOPWORDS.has(word))
  ).slice(0, 6);
}

function buildPromptCoverage(text = '', promptText = '', keywords = []) {
  const signals = extractPromptSignals(promptText, keywords);
  if (!signals.length) return { signals: [], covered: [], missing: [], ratio: 0 };
  const lower = String(text || '').toLowerCase();
  const covered = signals.filter((item) => lower.includes(String(item).toLowerCase()));
  const missing = signals.filter((item) => !covered.includes(item));
  return {
    signals,
    covered,
    missing,
    ratio: Math.round((covered.length / signals.length) * 100),
  };
}

function buildSubmissionDecision({ rubric = {}, targetDelta = 0, grammarIssueCount = 0, coverage = {}, paragraphCount = 0 }) {
  const reasons = [];
  let label = 'Ready';
  if (targetDelta < 0) reasons.push(`Add ${Math.abs(targetDelta)} more words of development.`);
  if ((coverage.missing || []).length) reasons.push(`Cover missing task signals: ${(coverage.missing || []).slice(0, 3).join(', ')}.`);
  if (grammarIssueCount >= 4) reasons.push(`Resolve ${grammarIssueCount} grammar hotspots before final submission.`);
  if (paragraphCount <= 1) reasons.push('Break the response into clearer paragraph units.');
  if (Number(rubric.readiness || 0) < 70) label = 'Revise Now';
  else if (reasons.length) label = 'Almost Ready';
  return {
    label,
    reasons: reasons.slice(0, 4),
  };
}

function buildRewriteRoute({ coverage = {}, grammarIssueCount = 0, fixes = [], targetDelta = 0 }) {
  const route = [];
  route.push({
    key: 'coverage',
    title: 'Fix task response first',
    body: (coverage.missing || []).length
      ? `Bring in these missing prompt signals: ${(coverage.missing || []).slice(0, 3).join(', ')}.`
      : 'Task coverage looks stable. Keep the same focus while revising.',
  });
  route.push({
    key: 'control',
    title: 'Clean sentence control',
    body: grammarIssueCount
      ? `There are ${grammarIssueCount} grammar alerts. Clean those before style upgrades.`
      : 'Grammar control looks stable enough for revision.',
  });
  route.push({
    key: 'development',
    title: 'Tighten development',
    body: targetDelta < 0
      ? `You are ${Math.abs(targetDelta)} words below target. Add one explained reason or example.`
      : (fixes[0] || 'Use the rewrite to tighten organization and word choice.'),
  });
  return route;
}

function mapReasonToRubric(reason = '') {
  const lower = String(reason || '').toLowerCase();
  const tags = [];
  if (/(grammar|subject|verb|tense|article|agreement|pronoun|preposition)/.test(lower)) tags.push('Grammar');
  if (/(word|vocab|lexical|synonym|collocation|register)/.test(lower)) tags.push('Vocabulary');
  if (/(coherence|connector|transition|organization|flow|paragraph)/.test(lower)) tags.push('Organization');
  if (/(task|thesis|example|support|argument|content|coverage)/.test(lower)) tags.push('Content');
  if (/(mechanic|capital|punctuation|spelling)/.test(lower)) tags.push('Mechanics');
  return uniqueStrings(tags);
}

function buildSentenceRevisionPlan({
  sourceText = '',
  sentenceUpgrades = [],
  repetition = [],
  weakWords = [],
}) {
  const repeatMap = new Map((repetition || []).map((item) => [String(item?.word || '').toLowerCase(), Number(item?.count || 0)]));
  const weakMap = new Map((weakWords || []).map((item) => [String(item?.word || '').toLowerCase(), item?.synonyms || []]));

  if (Array.isArray(sentenceUpgrades) && sentenceUpgrades.length) {
    return sentenceUpgrades.slice(0, 8).map((item, index) => {
      const reasons = Array.isArray(item?.reasons) ? item.reasons : [];
      const focus = uniqueStrings(reasons.flatMap((reason) => mapReasonToRubric(reason)));
      const sentenceLower = String(item?.sentence || '').toLowerCase();
      const repeatedWord = Array.from(repeatMap.keys()).find((word) => sentenceLower.includes(word));
      const synonyms = repeatedWord
        ? uniqueStrings([
          ...(weakMap.get(repeatedWord) || []),
          ...lookupSynonymsForWord(repeatedWord, 6),
        ]).slice(0, 6)
        : [];
      return {
        id: `upgrade-${index}`,
        sentence: item?.sentence || '',
        revised: item?.revised || '',
        reasons,
        focus: focus.length ? focus : ['Content'],
        repeatedWord,
        synonyms,
      };
    });
  }

  return splitSentences(sourceText).slice(0, 6).map((sentence, index, list) => {
    const words = sentence.toLowerCase().match(/[a-z']+/g) || [];
    const repeatedWord = words.find((word) => repeatMap.has(word));
    const focus = [];
    if (words.length < 8) focus.push('Content');
    if (words.length > 32) focus.push('Organization');
    if (repeatedWord) focus.push('Vocabulary');
    if (!/[.!?]$/.test(sentence)) focus.push('Mechanics');
    if (index > 0 && !/\b(however|therefore|for example|in contrast|moreover|as a result)\b/i.test(sentence)) {
      focus.push('Organization');
    }
    const synonyms = repeatedWord
      ? uniqueStrings([
        ...(weakMap.get(repeatedWord) || []),
        ...lookupSynonymsForWord(repeatedWord, 6),
      ]).slice(0, 6)
      : [];
    const revised = repeatedWord && synonyms[0]
      ? sentence.replace(new RegExp(`\\b${repeatedWord}\\b`, 'i'), synonyms[0])
      : sentence;
    const reasons = [];
    if (repeatedWord) reasons.push(`Reduce repetition of "${repeatedWord}".`);
    if (words.length < 8) reasons.push('Develop the sentence with one reason or example.');
    if (index > 0 && !/\b(however|therefore|for example|in contrast|moreover|as a result)\b/i.test(sentence)) {
      reasons.push('Add a connector for smoother flow.');
    }
    if (!reasons.length && index === list.length - 1) reasons.push('End with a stronger academic closing phrase.');
    if (!reasons.length) reasons.push('Tighten wording and keep academic tone consistent.');
    return {
      id: `fallback-${index}`,
      sentence,
      revised,
      reasons,
      focus: uniqueStrings(focus).length ? uniqueStrings(focus) : ['Content'],
      repeatedWord,
      synonyms,
    };
  });
}

function buildRepeatedWordSynonymPanel({ repetition = [], weakWords = [] }) {
  const weakMap = new Map((weakWords || []).map((item) => [String(item?.word || '').toLowerCase(), item?.synonyms || []]));
  return (repetition || []).slice(0, 10).map((item) => {
    const word = String(item?.word || '').toLowerCase();
    const autoSynonyms = uniqueStrings([
      ...(Array.isArray(item?.synonyms) ? item.synonyms : []),
      ...(weakMap.get(word) || []),
      ...lookupSynonymsForWord(word, 8),
    ]).slice(0, 8);
    return {
      word,
      count: Number(item?.count || 0),
      synonyms: autoSynonyms,
    };
  }).filter((item) => item.word);
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

export default function FeedbackScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1040;
  const {
    report,
    addUserWord,
    essayText,
    generateReport,
    level,
    writingEngine,
    setWritingEngine,
    aiReady,
  } = useAppState();

  const [autoGenerated, setAutoGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [onlineStatus, setOnlineStatus] = useState('idle');
  const [onlineSummary, setOnlineSummary] = useState(null);
  const [onlineBuckets, setOnlineBuckets] = useState({ Grammar: [], Vocabulary: [], Mechanics: [], Style: [] });
  const [onlineError, setOnlineError] = useState('');
  const [paraphraseStatus, setParaphraseStatus] = useState('idle');
  const [paraphraseError, setParaphraseError] = useState('');
  const [paraphrases, setParaphrases] = useState([]);
  const [revisionStatus, setRevisionStatus] = useState('idle');
  const [revisionError, setRevisionError] = useState('');
  const [revisionResult, setRevisionResult] = useState(null);
  const [synonymInput, setSynonymInput] = useState('');
  const [synonymResults, setSynonymResults] = useState([]);
  const [grammarPluginEnabled, setGrammarPluginEnabled] = useState(true);

  const draftMeta = route?.params?.draftMeta || null;
  const reportText = String(report?.raw_text || report?.inline_feedback || '').trim();
  const essaySnapshot = String(essayText || '').trim();
  const shouldRegenerate = !report || (essaySnapshot && essaySnapshot !== reportText);

  useEffect(() => {
    if (shouldRegenerate && essaySnapshot && !autoGenerated) {
      generateReport({
        text: essaySnapshot,
        type: draftMeta?.type || 'general',
        level: draftMeta?.level || level,
        keywords: draftMeta?.keywords || [],
        prompt: draftMeta?.prompt || '',
        task: draftMeta?.task || 'paragraph',
      });
      setAutoGenerated(true);
    }
  }, [shouldRegenerate, essaySnapshot, autoGenerated, generateReport, draftMeta, level]);

  useEffect(() => {
    setAutoGenerated(false);
  }, [essaySnapshot]);

  const sourceText = essayText || report?.raw_text || report?.inline_feedback || '';
  const promptText = report?.prompt_text || '';
  const liveWordCount = countWords(sourceText);
  const liveParagraphCount = sourceText.trim()
    ? sourceText.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean).length
    : 0;
  const liveUniqueWords = sourceText.trim()
    ? new Set((sourceText.toLowerCase().match(/[a-z']+/g) || [])).size
    : 0;
  const estReadMinutes = liveWordCount > 0 ? Math.max(1, Math.round(liveWordCount / 180)) : 0;
  const levelWordTarget = { P1: 80, P2: 120, P3: 180, P4: 250 }[String(level || '').toUpperCase()] || 150;
  const targetDelta = liveWordCount - levelWordTarget;
  const targetState = targetDelta >= 0 ? 'On target' : `${Math.abs(targetDelta)} words below target`;
  const grammarPluginIssues = useMemo(() => detectBasicErrors(sourceText), [sourceText]);
  const compactRubric = useMemo(
    () => scoreWritingRubric({ text: sourceText, prompt: promptText, targetWords: levelWordTarget }),
    [sourceText, promptText, levelWordTarget]
  );
  const wascBand = compactRubric?.wascBand || null;
  const wascBandDisplay = wascBand ? `${wascBand.code} (${wascBand.label})` : compactRubric.band;
  const promptCoverage = useMemo(
    () => buildPromptCoverage(sourceText, promptText, report?.keywords || []),
    [sourceText, promptText, report?.keywords]
  );

  const strengths = uniqueStrings([...(compactRubric.strengths || []), ...(report?.strengths || [])]).slice(0, 5);
  const fixes = uniqueStrings([
    ...(report?.priority_fixes || []),
    ...(compactRubric.improvements || []),
    ...(report?.issues || []),
    ...(report?.diagnostics || []),
  ]).slice(0, 6);
  const checklist = uniqueStrings([...(compactRubric.nextStepChecklist || []), ...(report?.next_steps || [])]).slice(0, 5);
  const sentenceUpgrades = useMemo(
    () => report?.sentence_corrections?.slice(0, 4) || [],
    [report?.sentence_corrections]
  );
  const paragraphFeedback = report?.paragraph_feedback?.slice(0, 4) || [];
  const criticalErrors = report?.critical_errors?.slice(0, 6) || [];
  const weakWords = useMemo(
    () => report?.weak_words?.slice(0, 6) || [],
    [report?.weak_words]
  );
  const repetition = useMemo(
    () => report?.repetition || [],
    [report?.repetition]
  );
  const sentenceRevisionPlan = useMemo(
    () =>
      buildSentenceRevisionPlan({
        sourceText,
        sentenceUpgrades,
        repetition,
        weakWords,
      }),
    [sourceText, sentenceUpgrades, repetition, weakWords]
  );
  const repeatedWordSynonymPanel = useMemo(
    () => buildRepeatedWordSynonymPanel({ repetition, weakWords }),
    [repetition, weakWords]
  );
  const paraphraseBank = report?.paraphrase_bank || [];
  const advancedRewrite = report?.revised_advanced || '';
  const revisedVariants = report?.revised_variants || [];
  const inlineLegend = report?.inline_legend || {};
  const revisionSourceMeta = getAiSourceMeta(revisionResult?.source || 'local-writing-revision');
  const submissionDecision = useMemo(
    () => buildSubmissionDecision({
      rubric: compactRubric,
      targetDelta,
      grammarIssueCount: grammarPluginIssues.length,
      coverage: promptCoverage,
      paragraphCount: liveParagraphCount,
    }),
    [compactRubric, targetDelta, grammarPluginIssues.length, promptCoverage, liveParagraphCount]
  );
  const rewriteRoute = useMemo(
    () => buildRewriteRoute({
      coverage: promptCoverage,
      grammarIssueCount: grammarPluginIssues.length,
      fixes,
      targetDelta,
    }),
    [promptCoverage, grammarPluginIssues.length, fixes, targetDelta]
  );
  const ENGINES = [
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'online', label: 'Online' },
    { key: 'local', label: 'Local' },
  ];

  const runParaphrase = useCallback(async () => {
    try {
      setParaphraseStatus('loading');
      setParaphraseError('');
      if (!sourceText.trim()) {
        setParaphraseStatus('error');
        setParaphraseError('No text to paraphrase.');
        return;
      }
      const sentences = splitSentences(sourceText).slice(0, 12);
      const res = await requestParaphrase(sentences);
      setParaphrases(res || []);
      setParaphraseStatus('done');
    } catch (error) {
      setParaphraseStatus('error');
      setParaphraseError(error.message || 'Paraphrase failed.');
    }
  }, [sourceText]);

  const runOnlineFeedback = useCallback(async () => {
    try {
      setOnlineStatus('loading');
      setOnlineError('');
      if (!sourceText.trim()) {
        setOnlineStatus('error');
        setOnlineError('No text to send.');
        return;
      }
      if (sourceText.length > 20000) {
        setOnlineStatus('error');
        setOnlineError('Text too long for online feedback (20,000 chars max).');
        return;
      }
      const res = await checkOnlineFeedback(sourceText);
      const summary = summarizeMatches(res.matches || []);
      setOnlineSummary(summary);
      setOnlineBuckets(summary.buckets);
      setOnlineStatus('done');
    } catch (error) {
      setOnlineStatus('error');
      setOnlineError(error.message || 'Online feedback failed.');
    }
  }, [sourceText]);

  const runWritingRevision = useCallback(async () => {
    try {
      setRevisionStatus('loading');
      setRevisionError('');
      const res = await requestWritingRevision({
        text: sourceText,
        prompt: promptText,
        level: String(level || 'B2').toUpperCase(),
        task: report?.type === 'reaction' || report?.type === 'definition' ? 'paragraph' : 'essay',
      });
      setRevisionResult(res);
      setRevisionStatus('done');
    } catch (error) {
      setRevisionStatus('error');
      setRevisionError(error.message || 'AI revision failed.');
    }
  }, [sourceText, promptText, level, report?.type]);

  const runSynonymLookup = () => {
    const term = synonymInput.trim().toLowerCase();
    if (!term) {
      setSynonymResults([]);
      return;
    }
    const direct = lookupSynonymsForWord(term, 10);
    if (direct.length) {
      setSynonymResults(direct);
      return;
    }
    const fallback = suggestSynonyms(term) || [];
    setSynonymResults((fallback?.[0]?.synonyms || []).slice(0, 10));
  };

  const saveWeakWords = () => {
    weakWords.forEach((item) => addUserWord(item.word));
    repetition.forEach((item) => addUserWord(item.word));
  };

  const saveParaphraseWords = () => {
    paraphraseBank.forEach((item) => addUserWord(item.word));
  };

  if (!sourceText.trim()) {
    return (
      <Screen scroll contentStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.h1}>Writing Scoreboard</Text>
          <Text style={styles.sub}>No draft found yet. Write something first, then come back for feedback.</Text>
          <Button label="Open Writing Workspace" onPress={() => navigation.navigate('WritingEditor')} />
        </Card>
      </Screen>
    );
  }

  const renderOverview = () => {
    const isPass = wascBand?.pass === true;
    const bandColor = isPass ? '#16a34a' : '#dc2626';
    const bandBg = isPass ? '#f0fdf4' : '#fef2f2';
    const bandBorder = isPass ? '#86efac' : '#fca5a5';

    const CATEGORY_COLORS = {
      Grammar: { bar: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
      Vocabulary: { bar: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
      Organization: { bar: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
      Content: { bar: '#10b981', bg: '#f0fdf4', border: '#a7f3d0' },
      Mechanics: { bar: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    };

    const CATEGORY_LABELS = {
      Grammar: 'Grammar & Mechanics',
      Vocabulary: 'Vocabulary Range',
      Organization: 'Organization & Cohesion',
      Content: 'Task Fulfillment',
      Mechanics: 'Punctuation & Spelling',
    };

    return (
      <>
        {/* ── PASS / FAIL BANNER ────────────────────── */}
        <View style={[styles.bandBanner, { backgroundColor: bandBg, borderColor: bandBorder }]}>
          <View style={[styles.bandBadge, { backgroundColor: bandColor }]}>
            <Text style={styles.bandBadgeText}>{wascBand?.code || '—'}</Text>
          </View>
          <View style={styles.bandMeta}>
            <Text style={[styles.bandLabel, { color: bandColor }]}>
              {isPass ? '✓ Pass' : '✗ Needs Work'} · {wascBand?.label || wascBandDisplay}
            </Text>
            <Text style={styles.bandDescriptor} numberOfLines={3}>
              {wascBand?.descriptor || compactRubric.feedbackSummary}
            </Text>
          </View>
          <View style={[styles.bandScorePill, { backgroundColor: bandColor }]}>
            <Text style={styles.bandScorePillText}>{compactRubric.total}/20</Text>
          </View>
        </View>

        {/* ── QUICK STATS ROW ───────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Words', value: String(liveWordCount) },
            { label: 'Paragraphs', value: String(liveParagraphCount) },
            { label: 'Unique Words', value: String(liveUniqueWords) },
            { label: 'Readiness', value: `${compactRubric.readiness}%` },
          ].map((s) => (
            <View key={s.label} style={styles.statChip}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── PER-CATEGORY SCORED CARDS ─────────────── */}
        <Text style={styles.sectionHeading}>WASC Rubric Breakdown</Text>
        {compactRubric.categories.map((cat) => {
          const pct = Math.round((cat.score / cat.max) * 100);
          const theme = CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.Grammar;
          const catLabel = CATEGORY_LABELS[cat.name] || cat.name;
          const catFix = fixes.find((f) => {
            const lower = f.toLowerCase();
            if (cat.name === 'Grammar') return /(grammar|tense|agreement|article|sentence)/.test(lower);
            if (cat.name === 'Vocabulary') return /(vocab|word|synonym|repetition|lexical)/.test(lower);
            if (cat.name === 'Organization') return /(paragraph|flow|transition|coherence|structure)/.test(lower);
            if (cat.name === 'Content') return /(task|example|argument|coverage|prompt)/.test(lower);
            if (cat.name === 'Mechanics') return /(punctuation|spelling|capital|mechanic)/.test(lower);
            return false;
          });
          return (
            <View key={cat.name} style={[styles.rubricCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <View style={styles.rubricCardHead}>
                <Text style={[styles.rubricCardName, { color: theme.bar }]}>{catLabel}</Text>
                <Text style={[styles.rubricCardScore, { color: theme.bar }]}>{cat.score}/{cat.max}</Text>
              </View>
              <View style={styles.rubricBarTrack}>
                <View style={[styles.rubricBarFill, { width: `${pct}%`, backgroundColor: theme.bar }]} />
              </View>
              <Text style={styles.rubricBarPct}>{pct}%</Text>
              {catFix ? (
                <View style={styles.rubricHint}>
                  <Text style={styles.rubricHintText}>→ {catFix}</Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {/* ── STRENGTHS & FIXES ─────────────────────── */}
        <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
          <Card style={styles.card}>
            <Text style={styles.h3}>✓ Strengths</Text>
            {strengths.length
              ? strengths.map((item) => <Text key={item} style={[styles.body, styles.strengthText]}>• {item}</Text>)
              : <Text style={styles.sub}>Write more to identify strengths.</Text>}
          </Card>
          <Card style={styles.card}>
            <Text style={styles.h3}>⚑ Priority Fixes</Text>
            {fixes.length
              ? fixes.slice(0, 4).map((item) => <Text key={item} style={[styles.body, styles.fixText]}>• {item}</Text>)
              : <Text style={styles.sub}>No critical issues detected.</Text>}
          </Card>
        </View>

        {/* ── TASK COVERAGE ─────────────────────────── */}
        {promptCoverage.signals.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.h3}>Task Coverage · {promptCoverage.ratio}%</Text>
            <View style={styles.rubricBarTrack}>
              <View style={[styles.rubricBarFill, {
                width: `${promptCoverage.ratio}%`,
                backgroundColor: promptCoverage.ratio >= 50 ? '#16a34a' : '#f59e0b',
              }]} />
            </View>
            <View style={styles.signalRow}>
              {promptCoverage.covered.map((item) => (
                <View key={item} style={[styles.signalPill, styles.signalPillGood]}>
                  <Text style={[styles.signalPillText, styles.signalPillTextGood]}>✓ {item}</Text>
                </View>
              ))}
              {promptCoverage.missing.map((item) => (
                <View key={item} style={[styles.signalPill, styles.signalPillWarn]}>
                  <Text style={[styles.signalPillText, styles.signalPillTextWarn]}>✗ {item}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* ── NEXT DRAFT CHECKLIST ──────────────────── */}
        {checklist.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.h3}>Next Draft Checklist</Text>
            {checklist.map((item, i) => (
              <View key={item} style={styles.checkItem}>
                <View style={styles.checkNum}><Text style={styles.checkNumText}>{i + 1}</Text></View>
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* ── SUBMISSION DECISION ───────────────────── */}
        <View style={[styles.submissionBanner, submissionDecision.label === 'Ready' && styles.submissionBannerReady]}>
          <Text style={styles.submissionLabel}>{submissionDecision.label}</Text>
          {submissionDecision.reasons.map((item) => (
            <Text key={item} style={styles.submissionReason}>• {item}</Text>
          ))}
        </View>
      </>
    );
  };


  const renderRewrite = () => (
    <>
      <Card style={styles.card}>
        <Text style={styles.h3}>Revision Route</Text>
        <Text style={styles.sub}>Use this order before you trust any rewrite output.</Text>
        {rewriteRoute.map((item, index) => (
          <View key={item.key} style={styles.routeRow}>
            <Text style={styles.routeIndex}>{index + 1}</Text>
            <View style={styles.routeBody}>
              <Text style={styles.bodyStrong}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionRow}>
          <Text style={styles.h3}>AI Revision Endpoint</Text>
          <Button
            label={revisionStatus === 'loading' ? 'Revising...' : 'Run AI Revision'}
            onPress={runWritingRevision}
            disabled={revisionStatus === 'loading' || !aiReady}
            icon="sparkles-outline"
          />
        </View>
        <Text style={styles.sub}>
          {aiReady
            ? 'This calls the backend writing revision endpoint and returns a stricter BUEPT-oriented rewrite.'
            : 'AI revision is not available on this device. LanguageTool + local feedback remain active.'}
        </Text>
        {revisionError ? <Text style={styles.body}>Error: {revisionError}</Text> : null}
        {revisionResult ? (
          <>
            <View style={styles.sourceRow}>
              <View style={styles.sourcePill}>
                <Text style={styles.sourcePillText}>{revisionSourceMeta.label}</Text>
              </View>
              {revisionResult.model ? <Text style={styles.sourceModel}>{revisionResult.model}</Text> : null}
            </View>
            <Text style={styles.bodyBlock}>{revisionResult.revisedText}</Text>
            {revisionResult.summary ? <Text style={styles.sub}>{revisionResult.summary}</Text> : null}
            {revisionResult.strengths?.length ? (
              <View style={styles.block}>
                <Text style={styles.bodyStrong}>What is already working</Text>
                {revisionResult.strengths.map((item) => <Text key={`rev-strength-${item}`} style={styles.body}>• {item}</Text>)}
              </View>
            ) : null}
            {revisionResult.fixes?.length ? (
              <View style={styles.block}>
                <Text style={styles.bodyStrong}>What still needs work</Text>
                {revisionResult.fixes.map((item) => <Text key={`rev-fix-${item}`} style={styles.body}>• {item}</Text>)}
              </View>
            ) : null}
            {revisionResult.rubricNotes?.length ? (
              <View style={styles.block}>
                <Text style={styles.bodyStrong}>Rubric notes</Text>
                {revisionResult.rubricNotes.map((item) => <Text key={`rev-note-${item}`} style={styles.body}>• {item}</Text>)}
              </View>
            ) : null}
            {revisionResult.diagnostic ? <Text style={styles.diagnosticText}>Diagnostic: {revisionResult.diagnostic}</Text> : null}
            <View style={styles.actionRow}>
              <Button
                label="Edit AI Revision"
                variant="secondary"
                onPress={() => navigation.navigate('WritingEditor', { draftText: revisionResult.revisedText, prompt: promptText || undefined, promptMeta: { type: report?.type } })}
                icon="create-outline"
              />
            </View>
          </>
        ) : (
          <Text style={styles.sub}>No AI revision generated yet.</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Local Improved Version</Text>
        <Text style={styles.bodyBlock}>{report?.revised || 'No rewrite generated yet.'}</Text>
        <View style={styles.actionRow}>
          <Button
            label="Edit This Version"
            onPress={() => navigation.navigate('WritingEditor', { draftText: report?.revised || sourceText, prompt: promptText || undefined, promptMeta: { type: report?.type } })}
            icon="create-outline"
          />
        </View>
      </Card>

      {advancedRewrite ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Advanced Rewrite</Text>
          <Text style={styles.bodyBlock}>{advancedRewrite}</Text>
        </Card>
      ) : null}

      {revisedVariants.length ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Alternative Versions</Text>
          {revisedVariants.map((item, index) => (
            <View key={`variant-${index}`} style={styles.block}>
              <Text style={styles.sectionLabel}>Variant {index + 1}</Text>
              <Text style={styles.bodyBlock}>{item}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      {sentenceUpgrades.length ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Sentence Upgrades</Text>
          {sentenceUpgrades.map((item, index) => (
            <View key={`sentence-${index}`} style={styles.block}>
              <Text style={styles.bodyStrong}>Original</Text>
              <Text style={styles.bodyBlock}>{item.sentence}</Text>
              <Text style={styles.bodyStrong}>Revised</Text>
              <Text style={styles.bodyBlock}>{item.revised}</Text>
              {item.reasons?.length ? <Text style={styles.sub}>Why: {item.reasons.join(' | ')}</Text> : null}
            </View>
          ))}
        </Card>
      ) : null}

      {sentenceRevisionPlan.length ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Rubric-Linked Sentence Revision</Text>
          <Text style={styles.sub}>Each sentence is mapped to rubric targets so you know exactly what to fix.</Text>
          {sentenceRevisionPlan.map((item, index) => (
            <View key={item.id} style={styles.revisionItem}>
              <Text style={styles.sectionLabel}>Sentence {index + 1}</Text>
              <Text style={styles.bodyBlock}>{item.sentence}</Text>
              <View style={styles.signalRow}>
                {item.focus.map((focus) => (
                  <View key={`${item.id}-${focus}`} style={[styles.signalPill, styles.signalPillGood]}>
                    <Text style={[styles.signalPillText, styles.signalPillTextGood]}>{focus}</Text>
                  </View>
                ))}
              </View>
              {item.reasons?.length ? item.reasons.map((reason) => (
                <Text key={`${item.id}-${reason}`} style={styles.body}>• {reason}</Text>
              )) : null}
              <Text style={styles.bodyStrong}>Revision suggestion</Text>
              <Text style={styles.bodyBlock}>{item.revised}</Text>
              {item.repeatedWord && item.synonyms?.length ? (
                <>
                  <Text style={styles.bodyStrong}>Synonym options for "{item.repeatedWord}"</Text>
                  <Text style={styles.body}>{item.synonyms.join(', ')}</Text>
                </>
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}
    </>
  );

  const renderTools = () => (
    <>
      <Card style={styles.card}>
        <Text style={styles.h3}>Writing Engine</Text>
        <View style={styles.chipRow}>
          {ENGINES.map((item) => (
            <Chip key={item.key} label={item.label} active={writingEngine === item.key} onPress={() => setWritingEngine(item.key)} />
          ))}
        </View>
        <Text style={styles.sub}>
          {writingEngine === 'hybrid' && 'Hybrid combines local rubric scoring with optional online checks.'}
          {writingEngine === 'online' && 'Online uses external grammar checking when available.'}
          {writingEngine === 'local' && 'Local keeps the flow offline and stable.'}
        </Text>
      </Card>

      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.h3}>Online Check</Text>
            <Button
              label={onlineStatus === 'loading' ? 'Checking...' : 'Run'}
              variant="secondary"
              onPress={runOnlineFeedback}
              disabled={onlineStatus === 'loading' || writingEngine === 'local'}
            />
          </View>
          {writingEngine === 'local' ? <Text style={styles.sub}>Online check is disabled in Local mode.</Text> : null}
          {onlineError ? <Text style={styles.body}>Error: {onlineError}</Text> : null}
          {onlineSummary ? (
            <>
              <Text style={styles.body}>Total issues: {onlineSummary.total}</Text>
              <Text style={styles.body}>Grammar: {onlineBuckets.Grammar.length}</Text>
              <Text style={styles.body}>Vocabulary: {onlineBuckets.Vocabulary.length}</Text>
              <Text style={styles.body}>Mechanics: {onlineBuckets.Mechanics.length}</Text>
              <Text style={styles.body}>Style: {onlineBuckets.Style.length}</Text>
            </>
          ) : (
            <Text style={styles.sub}>Run this only after the local draft review looks stable.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.h3}>Paraphrase</Text>
            <Button label={paraphraseStatus === 'loading' ? 'Running...' : 'Generate'} variant="secondary" onPress={runParaphrase} disabled={paraphraseStatus === 'loading'} />
          </View>
          {paraphraseError ? <Text style={styles.body}>Error: {paraphraseError}</Text> : null}
          {paraphrases.length ? paraphrases.slice(0, 6).map((item, index) => (
            <View key={`paraphrase-${index}`} style={styles.block}>
              <Text style={styles.sectionLabel}>Sentence {index + 1}</Text>
              {item.original ? <Text style={styles.sub}>Original: {item.original}</Text> : null}
              <Text style={styles.body}>{item.paraphrase}</Text>
            </View>
          )) : <Text style={styles.sub}>Generate sentence-level paraphrases for revision ideas.</Text>}
        </Card>
      </View>

      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Synonym Finder</Text>
          <TextInput
            style={styles.input}
            value={synonymInput}
            onChangeText={setSynonymInput}
            placeholder="Enter one word"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
          />
          <View style={styles.actionRow}>
            <Button label="Find Synonyms" variant="secondary" onPress={runSynonymLookup} icon="search-outline" />
          </View>
          {synonymResults.length ? <Text style={styles.body}>Suggestions: {synonymResults.join(', ')}</Text> : <Text style={styles.sub}>No lookup yet.</Text>}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Vocab Capture</Text>
          <Text style={styles.body}>Repeated words: {repetition.length}</Text>
          <Text style={styles.body}>Weak replacements: {weakWords.length}</Text>
          <Text style={styles.body}>Paraphrase bank: {paraphraseBank.length}</Text>
          {repeatedWordSynonymPanel.length ? (
            <View style={styles.block}>
              <Text style={styles.bodyStrong}>Auto Synonym Panel (Repeated Words)</Text>
              {repeatedWordSynonymPanel.map((item) => (
                <View key={`rep-${item.word}`} style={styles.repeatedRow}>
                  <Text style={styles.bodyStrong}>{item.word} ×{item.count}</Text>
                  <Text style={styles.body}>
                    {item.synonyms.length ? item.synonyms.join(', ') : 'No stable synonym found yet'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sub}>No heavy repetition detected, so auto synonym panel is empty.</Text>
          )}
          <View style={styles.actionRow}>
            <Button label="Save Weak Words" variant="secondary" onPress={saveWeakWords} icon="bookmark-outline" />
            <Button label="Save Paraphrase Bank" variant="secondary" onPress={saveParaphraseWords} icon="copy-outline" />
          </View>
        </Card>
      </View>

      <Card style={styles.card}>
        <View style={styles.sectionRow}>
          <Text style={styles.h3}>Basic Grammar Plugin</Text>
          <Button label={grammarPluginEnabled ? 'On' : 'Off'} variant={grammarPluginEnabled ? 'primary' : 'secondary'} onPress={() => setGrammarPluginEnabled((value) => !value)} />
        </View>
        {grammarPluginEnabled ? (
          grammarPluginIssues.length ? grammarPluginIssues.slice(0, 12).map((item) => <Text key={item} style={styles.body}>• {item}</Text>) : <Text style={styles.body}>No basic grammar issue detected.</Text>
        ) : (
          <Text style={styles.sub}>Plugin is disabled.</Text>
        )}
      </Card>
    </>
  );

  const renderDeepReview = () => (
    <>
      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Paragraph Diagnostics</Text>
          {paragraphFeedback.length ? paragraphFeedback.map((item) => (
            <View key={`paragraph-${item.index}`} style={styles.block}>
              <Text style={styles.bodyStrong}>Paragraph {item.index}</Text>
              <Text style={styles.body}>Sentences: {item.length}</Text>
              <Text style={styles.body}>Topic sentence: {item.hasTopic ? 'Yes' : 'No'}</Text>
              <Text style={styles.body}>Example present: {item.hasExample ? 'Yes' : 'No'}</Text>
              <Text style={styles.body}>Concluding sentence: {item.hasConcluding ? 'Yes' : 'No'}</Text>
            </View>
          )) : <Text style={styles.sub}>No paragraph diagnostics yet.</Text>}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Critical Errors</Text>
          {criticalErrors.length ? criticalErrors.map((item) => (
            <View key={`${item.text}-${item.tag}`} style={styles.block}>
              <Text style={styles.bodyStrong}>{item.text} ({item.tag})</Text>
              <Text style={styles.sub}>{item.why}</Text>
              <Text style={styles.body}>Fix: {item.suggestion}</Text>
            </View>
          )) : <Text style={styles.sub}>No critical errors listed.</Text>}
        </Card>
      </View>

      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Weak Word Replacements</Text>
          {weakWords.length ? weakWords.map((item) => (
            <Text key={item.word} style={styles.body}>• {item.word} ({item.count}) → {item.synonyms.length ? item.synonyms.join(', ') : 'upgrade wording'}</Text>
          )) : <Text style={styles.sub}>No weak word list generated.</Text>}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Inline Review Legend</Text>
          {Object.entries(inlineLegend).length ? Object.entries(inlineLegend).map(([key, label]) => (
            <Text key={key} style={styles.body}>• {formatLabel(key)}: {label}</Text>
          )) : <Text style={styles.sub}>No inline legend available.</Text>}
          {report?.cefr ? <Text style={[styles.sub, { marginTop: spacing.sm }]}>Estimated CEFR: {report.cefr}</Text> : null}
          {report?.writing9_style?.band ? <Text style={styles.sub}>Band estimate: {report.writing9_style.band}</Text> : null}
        </Card>
      </View>
    </>
  );

  const renderFullReport = () => (
    <Card style={styles.card}>
      <Text style={styles.h3}>Full Writing Feedback Report</Text>
      <Text style={styles.bodyBlock}>{report?.full_report || 'Report will appear once you generate feedback.'}</Text>
    </Card>
  );

  return (
    <Screen scroll contentStyle={styles.content}>
      <Card style={styles.heroCard} glow>
        <Text style={styles.h1}>Writing Scoreboard</Text>
        <Text style={styles.sub}>{compactRubric.feedbackSummary}</Text>

        <View style={styles.metricRow}>
          <MetricTile label="Score" value={`${compactRubric.total}/20`} tone="accent" />
          <MetricTile label="WASC Band" value={wascBandDisplay} />
          <MetricTile label="Readiness" value={`${compactRubric.readiness}%`} />
          <MetricTile label="Words" value={`${liveWordCount}`} />
        </View>
        {wascBand?.descriptor ? <Text style={styles.wascBandNote}>WASC criteria: {wascBand.descriptor}</Text> : null}

        <View style={styles.metricRow}>
          <MetricTile label="Paragraphs" value={`${liveParagraphCount}`} />
          <MetricTile label="Unique Words" value={`${liveUniqueWords}`} />
          <MetricTile label="Read Time" value={estReadMinutes ? `${estReadMinutes} min` : '0 min'} />
          <MetricTile label="Target" value={targetState} />
        </View>

        <View style={styles.actionRow}>
          <Button label="Back to Editor" variant="secondary" onPress={() => navigation.navigate('WritingEditor', { draftText: sourceText, prompt: promptText || undefined, promptMeta: { type: report?.type } })} icon="create-outline" />
          <Button label="Run Online Check" variant="ghost" onPress={runOnlineFeedback} disabled={writingEngine === 'local' || onlineStatus === 'loading'} icon="globe-outline" />
          <Button label="Paraphrase" onPress={runParaphrase} disabled={paraphraseStatus === 'loading'} icon="sparkles-outline" />
        </View>
      </Card>

      <View style={styles.tabRow}>
        {TABS.map((item) => (
          <Chip key={item} label={formatLabel(item)} active={activeTab === item} onPress={() => setActiveTab(item)} />
        ))}
      </View>

      {activeTab === 'overview' ? renderOverview() : null}
      {activeTab === 'rewrite' ? renderRewrite() : null}
      {activeTab === 'tools' ? renderTools() : null}
      {activeTab === 'deep review' ? renderDeepReview() : null}
      {activeTab === 'full report' ? renderFullReport() : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  heroCard: {
    marginBottom: spacing.md,
    backgroundColor: '#F4F8FF',
    borderColor: '#C7DBFF',
    ...shadow.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  // ── Lexibot-style scoring UI ────────────────────────────
  bandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bandBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandBadgeText: {
    fontSize: 20,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    fontWeight: '900',
  },
  bandMeta: {
    flex: 1,
    minWidth: 0,
  },
  bandLabel: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    marginBottom: 4,
  },
  bandDescriptor: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  bandScorePill: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bandScorePillText: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statChip: {
    flex: 1,
    minWidth: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2EAF7',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  rubricCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rubricCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rubricCardName: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    flex: 1,
  },
  rubricCardScore: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  rubricBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  rubricBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  rubricBarPct: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  rubricHint: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  rubricHintText: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 19,
  },
  strengthText: {
    color: '#166534',
  },
  fixText: {
    color: '#9a3412',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checkNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkNumText: {
    fontSize: 11,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  submissionBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  submissionBannerReady: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  submissionLabel: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  submissionReason: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 2,
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
    lineHeight: 20,
  },
  wascBandNote: {
    fontSize: typography.small,
    color: colors.primaryDark,
    marginBottom: spacing.md,
    lineHeight: 20,
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
    marginBottom: 4,
  },
  bodyBlock: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricTile: {
    minWidth: 120,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
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
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  panelGrid: {
    gap: spacing.md,
  },
  panelGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  sectionDivider: {
    height: 1,
    backgroundColor: '#E4ECF9',
    marginVertical: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
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
  block: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  signalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
  signalPillGood: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
  },
  signalPillWarn: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  signalPillText: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
  },
  signalPillTextGood: {
    color: '#166534',
  },
  signalPillTextWarn: {
    color: '#B45309',
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  routeIndex: {
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
  routeBody: {
    flex: 1,
  },
  revisionItem: {
    borderWidth: 1,
    borderColor: '#E2EAF7',
    backgroundColor: '#FAFCFF',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  repeatedRow: {
    borderWidth: 1,
    borderColor: '#DFE8F7',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sourcePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C8D8F8',
  },
  sourcePillText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sourceModel: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  diagnosticText: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
});
