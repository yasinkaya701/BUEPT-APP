import React, { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, TextInput, View, Modal, Pressable, Linking } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { checkOnlineFeedback, summarizeMatches } from '../utils/onlineFeedback';
import { buildYS9Report, countWords } from '../utils/ys9Mock';
import { getWordEntry } from '../utils/dictionary';
import { useAppState } from '../context/AppState';

export default function OnlineFeedbackScreen({ route }) {
  const { userProfile } = useAppState();
  const studentName = userProfile?.name || '';
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [report, setReport] = useState(null);
  const [segments, setSegments] = useState([]);
  const [autoRevised, setAutoRevised] = useState('');
  const [activeMatch, setActiveMatch] = useState(null);
  const [onlineMatchStates, setOnlineMatchStates] = useState({});
  const [onlineSummary, setOnlineSummary] = useState(null);
  const liveWordCount = countWords(text || '');
  const initialText = route?.params?.initialText || '';
  const [autoRun, setAutoRun] = useState(false);

  useEffect(() => {
    if (initialText && !text) {
      setText(initialText);
    }
  }, [initialText, text]);
  const run = useCallback(async () => {
    try {
      setStatus('loading');
      setError('');
      if (!text.trim()) {
        setStatus('error');
        setError('Please paste your text.');
        return;
      }
      if (text.length > 20000) {
        setStatus('error');
        setError('Text too long (max 20,000 chars).');
        return;
      }
      const res = await checkOnlineFeedback(text);
      const ms = res.matches || [];
      setOnlineSummary(summarizeMatches(ms));
      setMatches(ms);
      setOnlineSummary(summarizeMatches(ms));
      setReport(buildYS9Report(text, 'general', 'P2', { studentName }));
      const sorted = ms
        .filter((m) => typeof m.offset === 'number' && typeof m.length === 'number')
        .sort((a, b) => a.offset - b.offset);
      let cursor = 0;
      const segs = [];
      sorted.forEach((m) => {
        const start = m.offset;
        const end = m.offset + m.length;
        const cat = (m.rule?.category?.id || m.rule?.category?.name || '').toLowerCase();
        const tag = cat.includes('grammar') || cat.includes('syntax')
          ? 'grammar'
          : (cat.includes('style') || cat.includes('word') || cat.includes('vocab') ? 'vocab' : 'mechanics');
        if (start > cursor) segs.push({ text: text.slice(cursor, start) });
        segs.push({ text: text.slice(start, end), tag, match: m });
        cursor = end;
      });
      if (cursor < text.length) segs.push({ text: text.slice(cursor) });
      setSegments(segs);
      const initialState = {};
      ms.forEach((m, idx) => {
        if (typeof m.offset === 'number' && typeof m.length === 'number') {
          initialState[`${m.offset}-${m.length}-${idx}`] = 'pending';
        }
      });
      setOnlineMatchStates(initialState);
      setAutoRevised(applyFixes(text, ms));
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setError(e.message || 'Online feedback failed.');
    }
  }, [text, studentName]);
  useEffect(() => {
    if (initialText && text && status === 'idle' && !autoRun) {
      setAutoRun(true);
      run();
    }
  }, [initialText, text, status, autoRun, run]);

  const format = (m) => {
    const ctx = m.context || {};
    const snippet = ctx.text || '';
    const bad = snippet && typeof ctx.offset === 'number' ? snippet.slice(ctx.offset, ctx.offset + ctx.length) : '';
    const entry = bad ? getWordEntry(bad.toLowerCase()) : null;
    const synonyms = entry?.synonyms?.slice(0, 4) || [];
    const replacements = (m.replacements || []).slice(0, 4).map((r) => r.value);
    return { bad, message: m.message, replacements, synonyms };
  };
  const applyFixes = (fullText, ms = []) => {
    if (!fullText) return '';
    const usable = ms
      .filter((m) => typeof m.offset === 'number' && typeof m.length === 'number' && m.replacements?.length)
      .sort((a, b) => b.offset - a.offset);
    let out = fullText;
    usable.forEach((m) => {
      const rep = m.replacements[0]?.value;
      if (!rep) return;
      out = out.slice(0, m.offset) + rep + out.slice(m.offset + m.length);
    });
    return out;
  };
  const applyFixesWithState = (fullText, ms = [], stateMap = {}) => {
    if (!fullText) return '';
    const usable = ms
      .filter((m, idx) => {
        if (!(typeof m.offset === 'number' && typeof m.length === 'number' && m.replacements?.length)) return false;
        const key = `${m.offset}-${m.length}-${idx}`;
        return stateMap[key] !== 'rejected';
      })
      .sort((a, b) => b.offset - a.offset);
    let out = fullText;
    usable.forEach((m) => {
      const rep = m.replacements[0]?.value;
      if (!rep) return;
      out = out.slice(0, m.offset) + rep + out.slice(m.offset + m.length);
    });
    return out;
  };

  useEffect(() => {
    if (!text || !segments.length) return;
    const ms = segments.filter((s) => s.match).map((s) => s.match);
    if (!ms.length) return;
    setAutoRevised(applyFixesWithState(text, ms, onlineMatchStates || {}));
  }, [onlineMatchStates, segments, text]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Online Feedback</Text>
      <Text style={styles.sub}>Free check using LanguageTool (public API)</Text>
      <Pressable onPress={() => Linking.openURL('https://languagetool.org')}>
        <Text style={styles.link}>Powered by LanguageTool</Text>
      </Pressable>

      <Card style={styles.card}>
        <Text style={styles.h3}>Paste Your Writing</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Paste your essay here..."
          value={text}
          onChangeText={setText}
        />
        <Text style={styles.sub}>Word count: {liveWordCount}</Text>
        <Button label={status === 'loading' ? 'Checking...' : 'Run Check'} onPress={run} disabled={status === 'loading'} />
        {error ? <Text style={styles.sub}>Error: {error}</Text> : null}
      </Card>

      {report && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Rubric Match (Local)</Text>
          <Text style={styles.body}>Grammar: {report.rubric.Grammar}/4</Text>
          <Text style={styles.body}>Vocabulary: {report.rubric.Vocabulary}/4</Text>
          <Text style={styles.body}>Organization: {report.rubric.Organization}/4</Text>
          <Text style={styles.body}>Content: {report.rubric.Content}/4</Text>
          <Text style={styles.body}>Mechanics: {report.rubric.Mechanics}/4</Text>
          <Text style={styles.body}>Total: {report.rubric.Total}/20</Text>
        </Card>
      )}

      {report && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Revised Version (Local)</Text>
          <Text style={styles.body}>{report.revised}</Text>
        </Card>
      )}

      {report?.full_report ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Full Writing Feedback Report</Text>
          <Text style={styles.body}>{report.full_report}</Text>
        </Card>
      ) : null}

      {status === 'done' && onlineSummary && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Online Summary</Text>
          <Text style={styles.body}>Total issues: {onlineSummary.total}</Text>
          <Text style={styles.sub}>
            Grammar: {onlineSummary.buckets.Grammar.length} •
            Vocabulary: {onlineSummary.buckets.Vocabulary.length} •
            Mechanics: {onlineSummary.buckets.Mechanics.length} •
            Style: {onlineSummary.buckets.Style.length}
          </Text>
        </Card>
      )}

      {status === 'done' && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Results</Text>
          <View style={styles.onlineActions}>
            <Button
              label="Apply All"
              onPress={() => {
                const next = {};
                Object.keys(onlineMatchStates || {}).forEach((k) => { next[k] = 'accepted'; });
                setOnlineMatchStates(next);
              }}
            />
            <Button
              label="Reject All"
              variant="secondary"
              onPress={() => {
                const next = {};
                Object.keys(onlineMatchStates || {}).forEach((k) => { next[k] = 'rejected'; });
                setOnlineMatchStates(next);
              }}
            />
          </View>
          {matches.slice(0, 30).map((m, i) => {
            const fm = format(m);
            return (
              <View key={i} style={styles.resultItem}>
                <Text style={styles.body}>• {fm.message}</Text>
                {fm.bad ? <Text style={styles.sub}>Issue: “{fm.bad}”</Text> : null}
                {fm.replacements.length > 0 && <Text style={styles.sub}>Suggestions: {fm.replacements.join(', ')}</Text>}
                {fm.synonyms.length > 0 && <Text style={styles.sub}>Synonyms: {fm.synonyms.join(', ')}</Text>}
              </View>
            );
          })}
          {matches.length > 30 && <Text style={styles.sub}>+ {matches.length - 30} more</Text>}
        </Card>
      )}
      {status === 'done' && segments.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Highlighted Issues</Text>
          <Text style={styles.body}>
            {segments.map((seg, i) => (
              seg.tag ? (
                <Text
                  key={`${i}-${seg.tag || 'plain'}`}
                  style={[styles.inlinePress, styles[`online_${seg.tag}`]]}
                  onPress={() => setActiveMatch({ ...seg.match, __idx: i })}
                >
                  {seg.text}
                </Text>
              ) : (
                <Text key={`${i}-${seg.tag || 'plain'}`}>{seg.text}</Text>
              )
            ))}
          </Text>
        </Card>
      )}
      {status === 'done' && autoRevised ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Auto Revised Version (Online)</Text>
          <Text style={styles.body}>{autoRevised}</Text>
        </Card>
      ) : null}

      <Modal visible={!!activeMatch} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setActiveMatch(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.h3}>Online Suggestion</Text>
            {activeMatch ? (
              <>
                <Text style={styles.body}>{activeMatch.message}</Text>
                {activeMatch.context ? (
                  <Text style={styles.sub}>
                    {activeMatch.context.text}
                  </Text>
                ) : null}
                {activeMatch.replacements?.length ? (
                  <Text style={styles.body}>
                    Suggestions: {activeMatch.replacements.slice(0, 6).map((r) => r.value).join(', ')}
                  </Text>
                ) : null}
                {(() => {
                  const ctx = activeMatch.context || {};
                  const bad = ctx.text && typeof ctx.offset === 'number'
                    ? ctx.text.slice(ctx.offset, ctx.offset + ctx.length)
                    : '';
                  const entry = bad ? getWordEntry(bad.toLowerCase()) : null;
                  const synonyms = entry?.synonyms?.slice(0, 6) || [];
                  return synonyms.length ? (
                    <Text style={styles.body}>Synonyms: {synonyms.join(', ')}</Text>
                  ) : null;
                })()}
              </>
            ) : null}
            <View style={styles.modalActions}>
              <Button
                label="Accept"
                onPress={() => {
                  const key = `${activeMatch.offset}-${activeMatch.length}-${activeMatch.__idx}`;
                  setOnlineMatchStates((prev) => ({ ...prev, [key]: 'accepted' }));
                  setActiveMatch(null);
                }}
              />
              <Button
                label="Reject"
                variant="secondary"
                onPress={() => {
                  const key = `${activeMatch.offset}-${activeMatch.length}-${activeMatch.__idx}`;
                  setOnlineMatchStates((prev) => ({ ...prev, [key]: 'rejected' }));
                  setActiveMatch(null);
                }}
              />
              <Button label="Close" variant="ghost" onPress={() => setActiveMatch(null)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  link: {
    fontSize: typography.small,
    color: colors.primary,
    marginBottom: spacing.lg,
    textDecorationLine: 'underline'
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
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: spacing.md
  },
  resultItem: {
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginTop: spacing.sm
  },
  inlinePress: {
    lineHeight: 22
  },
  online_grammar: {
    backgroundColor: '#FFE9D6'
  },
  online_vocab: {
    backgroundColor: '#E6F4FF'
  },
  online_mechanics: {
    backgroundColor: '#E9F7E3'
  },
  onlineActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: spacing.lg
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg
  },
  modalActions: {
    marginTop: spacing.md,
    gap: spacing.xs
  }
});
