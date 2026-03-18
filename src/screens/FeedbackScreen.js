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

const TABS = ['overview', 'rewrite', 'tools', 'deep review'];

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

export default function FeedbackScreen({ navigation }) {
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

  useEffect(() => {
    if (!report && essayText && !autoGenerated) {
      generateReport({ text: essayText, type: 'general', level });
      setAutoGenerated(true);
    }
  }, [report, essayText, autoGenerated, generateReport, level]);

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
  const sentenceUpgrades = report?.sentence_corrections?.slice(0, 4) || [];
  const paragraphFeedback = report?.paragraph_feedback?.slice(0, 4) || [];
  const criticalErrors = report?.critical_errors?.slice(0, 6) || [];
  const weakWords = report?.weak_words?.slice(0, 6) || [];
  const repetition = report?.repetition || [];
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

  const renderOverview = () => (
    <>
      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Top Strengths</Text>
          {strengths.length ? strengths.map((item) => <Text key={item} style={styles.body}>• {item}</Text>) : <Text style={styles.sub}>No clear strengths detected yet.</Text>}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Top Fixes</Text>
          {fixes.length ? fixes.map((item) => <Text key={item} style={styles.body}>• {item}</Text>) : <Text style={styles.sub}>No urgent fixes listed.</Text>}
        </Card>
      </View>

      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Rubric Breakdown</Text>
          {compactRubric.categories.map((item) => (
            <ScoreRow key={item.name} item={item} />
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Next Draft Plan</Text>
          {checklist.map((item) => <Text key={item} style={styles.body}>• {item}</Text>)}
          <View style={styles.sectionDivider} />
          <Text style={styles.body}>Target words: {levelWordTarget}</Text>
          <Text style={styles.body}>Current words: {liveWordCount}</Text>
          <Text style={styles.body}>Paragraphs: {liveParagraphCount}</Text>
          <Text style={styles.body}>Unique words: {liveUniqueWords}</Text>
        </Card>
      </View>

      <View style={[styles.panelGrid, isWide && styles.panelGridWide]}>
        <Card style={styles.card}>
          <Text style={styles.h3}>Task Coverage</Text>
          <Text style={styles.sub}>
            Coverage: {promptCoverage.covered.length}/{promptCoverage.signals.length || 0} · {promptCoverage.ratio}%
          </Text>
          {promptCoverage.covered.length ? (
            <View style={styles.signalRow}>
              {promptCoverage.covered.map((item) => (
                <View key={`coverage-good-${item}`} style={[styles.signalPill, styles.signalPillGood]}>
                  <Text style={[styles.signalPillText, styles.signalPillTextGood]}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {promptCoverage.missing.length ? (
            <>
              <Text style={styles.sectionLabel}>Missing</Text>
              <View style={styles.signalRow}>
                {promptCoverage.missing.map((item) => (
                  <View key={`coverage-missing-${item}`} style={[styles.signalPill, styles.signalPillWarn]}>
                    <Text style={[styles.signalPillText, styles.signalPillTextWarn]}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.body}>No obvious task-signal gap detected.</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.h3}>Submission Decision</Text>
          <Text style={styles.bodyStrong}>{submissionDecision.label}</Text>
          {submissionDecision.reasons.length ? submissionDecision.reasons.map((item) => (
            <Text key={item} style={styles.body}>• {item}</Text>
          )) : (
            <Text style={styles.body}>The draft is structurally stable enough to move into final polishing.</Text>
          )}
        </Card>
      </View>

      <Card style={styles.card}>
        <Text style={styles.h3}>Grammar Snapshot</Text>
        <Text style={styles.sub}>Basic plugin: {grammarPluginEnabled ? 'On' : 'Off'}</Text>
        {grammarPluginEnabled ? (
          grammarPluginIssues.length ? grammarPluginIssues.slice(0, 10).map((item) => <Text key={item} style={styles.body}>• {item}</Text>) : <Text style={styles.body}>No basic grammar issue detected.</Text>
        ) : (
          <Text style={styles.body}>Turn it on in Tools if you want quick grammar alerts.</Text>
        )}
      </Card>
    </>
  );

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
            disabled={revisionStatus === 'loading'}
            icon="sparkles-outline"
          />
        </View>
        <Text style={styles.sub}>This calls the backend writing revision endpoint and returns a stricter BUEPT-oriented rewrite.</Text>
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

  return (
    <Screen scroll contentStyle={styles.content}>
      <Card style={styles.heroCard} glow>
        <Text style={styles.h1}>Writing Scoreboard</Text>
        <Text style={styles.sub}>{compactRubric.feedbackSummary}</Text>

        <View style={styles.metricRow}>
          <MetricTile label="Score" value={`${compactRubric.total}/20`} tone="accent" />
          <MetricTile label="Band" value={compactRubric.band} />
          <MetricTile label="Readiness" value={`${compactRubric.readiness}%`} />
          <MetricTile label="Words" value={`${liveWordCount}`} />
        </View>

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
