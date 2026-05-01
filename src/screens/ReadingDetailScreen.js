/**
 * ReadingDetailScreen.js
 * – Inline word tooltip: tıklanan kelime yanında açılır, kaydırma olmaz
 * – useTts ile kelime seslendirme
 */
import React, { useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  Text, StyleSheet, View, TouchableOpacity,
  ScrollView, Animated, TextInput, Platform, useWindowDimensions, Modal, Pressable, PanResponder
} from 'react-native';
import { WebView } from 'react-native-webview';

function normalizeDictationText(value = '') {
  return value
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import OpenEndedPracticeCard from '../components/OpenEndedPracticeCard';
import { colors, spacing, typography } from '../theme/tokens';
import { speakText } from '../hooks/useTts';
import baseTasks from '../../data/reading_tasks.json';
import hardTasks from '../../data/reading_tasks_hard.json';
import { useAppState } from '../context/AppState';
import { getWordEntry } from '../utils/dictionary';
import { getTurkishTranslation } from '../utils/trDictionary';
import { buildSimilarQuestion } from '../utils/similarQuestion';
import { buildReadingOpenEndedPrompts } from '../utils/openEndedPrompts';
import { evaluateReadingModel } from '../utils/readingModel';
import { subscribeSmokeActions } from '../dev/smokeBus';
import clozeTasks from '../../data/reading_cloze.json';

const tasks = [...baseTasks, ...hardTasks, ...clozeTasks];

function buildReadingFeedback(task, answers = {}) {
  const qs = task?.questions || [];
  if (!qs.length) return null;
  let correct = 0;
  const missed = [];
  let clozeTotal = 0;
  let clozeCorrect = 0;
  const bySkill = {};
  qs.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    if (ok) correct += 1;
    else missed.push({ index: i + 1, q: q.q, explain: q.explain });
    if (q.type === 'cloze') {
      clozeTotal += 1;
      if (ok) clozeCorrect += 1;
    }
    const skillKey = q.skill || (q.type === 'cloze' ? 'cloze' : 'comprehension');
    if (!bySkill[skillKey]) bySkill[skillKey] = { correct: 0, total: 0 };
    bySkill[skillKey].total += 1;
    if (ok) bySkill[skillKey].correct += 1;
  });
  const total = qs.length;
  const accuracy = Math.round((correct / total) * 100);
  const strengths = [];
  const fixes = [];
  if (accuracy >= 80) strengths.push('Strong evidence-based reading performance.');
  if (accuracy >= 60) strengths.push('Main ideas are mostly understood.');
  if (clozeTotal > 0 && clozeCorrect / Math.max(1, clozeTotal) >= 0.7) strengths.push('Good contextual vocabulary control.');
  if (accuracy < 60) fixes.push('Read each paragraph first, then answer without rushing.');
  if (clozeTotal > 0 && clozeCorrect / Math.max(1, clozeTotal) < 0.6) fixes.push('Use grammar around blanks (tense, article, collocation) to eliminate options.');
  if (missed.length >= 3) fixes.push('Underline evidence sentence before selecting an option.');
  const skillBreakdown = Object.entries(bySkill).map(([name, val]) => ({
    name,
    pct: Math.round((val.correct / Math.max(1, val.total)) * 100),
    correct: val.correct,
    total: val.total,
  }));
  return { total, correct, accuracy, strengths, fixes, missed, skillBreakdown };
}

function pickScanningTarget(paragraphs = [], seed = 0) {
  if (!paragraphs.length) return null;
  const idx = seed % paragraphs.length;
  const paragraph = paragraphs[idx] || '';
  const words = paragraph
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 6);
  const keyword = words[0] || 'evidence';
  return { paragraphIndex: idx, keyword };
}

/** Renders a fill-in-the-blank (cloze) question */
function ClozeQuestion({ q, qi, answers, checked, onSelect }) {
  // Split sentence on the blank placeholder
  const parts = (q.sentence || q.q).split('___');
  const selected = answers[qi];
  return (
    <View>
      {/* Sentence with blank slot */}
      <View style={styles.clozeSentenceRow}>
        <Text style={styles.clozeSentence}>
          {parts[0]}
          <Text style={styles.clozeBlank}>
            {selected != null && !checked ? ` ${q.options[selected]} ` : checked ? ` ${q.options[q.answer]} ` : '  ___  '}
          </Text>
          {parts[1] || ''}
        </Text>
      </View>
      {/* Options */}
      <Text style={styles.clozeHint}>Choose the best option to fill the blank:</Text>
      {q.options?.map((opt, oi) => (
        <TouchableOpacity
          key={oi}
          style={[
            styles.optionBtn,
            selected === oi && !checked && styles.optionSelected,
            checked && oi === q.answer && styles.optionCorrect,
            checked && selected === oi && oi !== q.answer && styles.optionWrong,
          ]}
          onPress={() => onSelect(qi, oi)}
          disabled={checked}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.optionText,
            checked && oi === q.answer && styles.optionTextCorrect,
            checked && selected === oi && oi !== q.answer && styles.optionTextWrong,
          ]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}


/** Kelime popup kartı — ekrana sabitlenmiş merkez kart (sağ kenar kesilmez) */
const WordTooltip = memo(function WordTooltip({ entry, onClose }) {
  const [trTranslation, setTrTranslation] = useState(null);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState('');

  useEffect(() => {
    if (!entry?.word) {
      setTrTranslation(null);
      setTrLoading(false);
      setTrError('');
      return;
    }

    const word = entry.word.trim();
    setTrTranslation(null);
    setTrError('');

    // 1. Önce offline sözlüğe bak — anında, internet gerektirmez
    const offlineResult = getTurkishTranslation(word);
    if (offlineResult) {
      setTrTranslation(offlineResult);
      setTrLoading(false);
      return;
    }

    // 2. Offline'da yoksa Google Translate gtx endpoint'ini dene
    setTrLoading(true);
    const url =
      'https://translate.googleapis.com/translate_a/single' +
      `?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(word)}`;

    let cancelled = false;
    fetch(url, { method: 'GET' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const t = data?.[0]?.[0]?.[0];
        if (t && t.trim().toLowerCase() !== word.toLowerCase()) {
          setTrTranslation(t.trim());
        } else {
          setTrError('—');
        }
      })
      .catch(() => {
        if (!cancelled) setTrError('—');
      })
      .finally(() => {
        if (!cancelled) setTrLoading(false);
      });

    return () => { cancelled = true; };
  }, [entry?.word]);

  if (!entry) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={!!entry}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/*
        Doğru React Native bottom-sheet pattern:
        Tek flex:1 root → içinde flex:1 Pressable arka plan + altta sabit sheet
      */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Arka plan — tıklayınca kapatır */}
        <Pressable
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          onPress={onClose}
        />

        {/* Alt sheet */}
        <View style={styles.tooltipSheet}>
          <View style={styles.tooltipSheetHandle} />

          {/* Başlık */}
          <View style={styles.tooltipHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tooltipWord} numberOfLines={1}>{entry.word}</Text>
              {entry.word_type ? (
                <Text style={styles.tooltipType}>{entry.word_type}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => speakText(entry.word)} style={styles.tooltipSpeakBtn} activeOpacity={0.7}>
              <Text style={styles.tooltipSpeakIcon}>🔊</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.tooltipClose} activeOpacity={0.7}>
              <Text style={styles.tooltipCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{ maxHeight: 320 }}>

            {/* İngilizce tanım */}
            {entry.simple_definition ? (
              <View style={styles.tooltipDefRow}>
                <Text style={styles.tooltipDefLabel}>EN</Text>
                <Text style={styles.tooltipDef}>{entry.simple_definition}</Text>
              </View>
            ) : null}

            {/* Türkçe çeviri — her zaman şeridi göster */}
            <View style={styles.tooltipTrRow}>
              <Text style={styles.tooltipTrFlag}>🇹🇷</Text>
              {trLoading ? (
                <Text style={styles.tooltipTrLoading}>çevriliyor…</Text>
              ) : trTranslation ? (
                <Text style={styles.tooltipTr}>{trTranslation}</Text>
              ) : (
                <Text style={styles.tooltipTrLoading}>{trError || '—'}</Text>
              )}
            </View>

            {/* Eş anlamlılar */}
            {entry.synonyms?.length > 0 ? (
              <View style={styles.tooltipSecRow}>
                <Text style={styles.tooltipSecLabel}>≈ EŞ ANLAMLI</Text>
                <Text style={styles.tooltipSyn}>{entry.synonyms.slice(0, 5).join(' · ')}</Text>
              </View>
            ) : null}

            {/* Örnek cümle */}
            {entry.examples?.length > 0 ? (
              <View style={styles.tooltipSecRow}>
                <Text style={styles.tooltipSecLabel}>ÖRNEK</Text>
                <Text style={styles.tooltipEx}>"{entry.examples[0]}"</Text>
              </View>
            ) : null}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

export default function ReadingDetailScreen({ route, navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const useSplitLayout = isLandscape;
  // We remove horizontal scroll minimums to let it split 50/50 perfectly
  const taskId = route?.params?.taskId;
  const task = useMemo(() => tasks.find(t => t.id === taskId) || tasks[0], [taskId]);
  const hasValidTask = Boolean(task && Array.isArray(task.questions));
  const openEndedPrompts = useMemo(() => buildReadingOpenEndedPrompts(task), [task]);

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [checked, setChecked] = useState(false);
  const [tooltip, setTooltip] = useState(null); // { entry, pageX, pageY }
  const [similarQuestions, setSimilarQuestions] = useState({});
  const [similarAnswers, setSimilarAnswers] = useState({});
  const [similarChecked, setSimilarChecked] = useState({});
  const [similarSeed, setSimilarSeed] = useState(1);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [skimSec, setSkimSec] = useState(120);
  const [skimRunning, setSkimRunning] = useState(false);
  const [paragraphStatus, setParagraphStatus] = useState({});
  const [scanSeed, setScanSeed] = useState(0);
  const [scanPick, setScanPick] = useState(null);
  const [scanChecked, setScanChecked] = useState(false);
  const [showOnlyMissed, setShowOnlyMissed] = useState(false);
  const [readingModel, setReadingModel] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5); // 0.2 to 0.8 range

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newRatio = gestureState.moveX / width;
        if (newRatio > 0.2 && newRatio < 0.8) {
          setSplitRatio(newRatio);
        }
      },
    })
  ).current;

  const { addReadingResult } = useAppState();
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const smokePendingRef = useRef(false);
  const smokeDoneRef = useRef(false);
  const readingFeedback = useMemo(() => (checked ? buildReadingFeedback(task, answers) : null), [checked, task, answers]);
  const visibleQuestionIndexes = useMemo(() => {
    const all = task.questions.map((_, idx) => idx);
    if (!checked || !showOnlyMissed || !readingFeedback) return all;
    const missedSet = new Set(readingFeedback.missed.map((m) => m.index - 1));
    return all.filter((i) => missedSet.has(i));
  }, [task.questions, checked, showOnlyMissed, readingFeedback]);
  const paragraphs = useMemo(
    () => String(task?.text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    [task?.text]
  );
  const scanTarget = useMemo(() => pickScanningTarget(paragraphs, scanSeed), [paragraphs, scanSeed]);

  const select = (qi, oi) => { if (!checked) setAnswers(p => ({ ...p, [qi]: oi })); };

  const getExplanation = useCallback((q, selected) => {
    if (q.explain) return q.explain;
    if (selected !== q.answer)
      return `Your choice is not supported by the passage. The correct answer "${q.options[q.answer]}" matches the stated information.`;
    return `Correct: "${q.options[q.answer]}". This is directly supported by the passage.`;
  }, []);

  const mistakeItems = useMemo(() => {
    if (!checked || !task?.questions?.length) return [];
    return task.questions.map((q, i) => {
      const selected = answers[i] || '';
      let isCorrect = false;
      if (q.type === 'short_answer') {
        const normSelected = normalizeDictationText(selected);
        if (Array.isArray(q.answer)) {
          isCorrect = q.answer.some(a => normalizeDictationText(a) === normSelected);
        } else {
          isCorrect = normalizeDictationText(q.answer) === normSelected;
        }
      } else {
        isCorrect = selected === q.answer;
      }

      if (isCorrect) return null;

      const questionText = q.type === 'cloze' ? (q.sentence || q.q || 'Fill in the blank') : (q.q || 'Question');
      return {
        id: `${task.id || 'reading'}-${i}`,
        module: 'reading',
        moduleLabel: 'Reading',
        taskTitle: task.title || 'Reading Practice',
        question: questionText,
        options: q.options || [],
        correctIndex: q.type === 'short_answer' ? null : q.answer,
        correctText: q.type === 'short_answer' ? (Array.isArray(q.answer) ? q.answer[0] : q.answer) : null,
        selectedIndex: q.type === 'short_answer' ? null : (Number.isFinite(selected) ? selected : null),
        selectedText: q.type === 'short_answer' ? selected : null,
        explanation: getExplanation(q, selected),
        context: task.text || '',
        skill: q.skill || q.type || 'comprehension',
      };
    }).filter(Boolean);
  }, [checked, task, answers, getExplanation]);

  const check = useCallback(() => {
    if (checked) return;
    let correct = 0;
    task.questions.forEach((q, i) => {
      const selected = answers[i] || '';
      if (q.type === 'short_answer') {
        const normSelected = normalizeDictationText(selected);
        if (Array.isArray(q.answer)) {
          if (q.answer.some(a => normalizeDictationText(a) === normSelected)) correct++;
        } else {
          if (normalizeDictationText(q.answer) === normSelected) correct++;
        }
      } else {
        if (selected === q.answer) correct++;
      }
    });
    setScore(`${correct} / ${task.questions.length}`);
    addReadingResult({ taskId: task.id, score: correct, total: task.questions.length });
    setReadingModel(evaluateReadingModel({
      task,
      answers,
      evidenceNote,
      paragraphStatus,
      scanChecked,
      scanPick,
      scanTarget,
    }));
    setChecked(true);
  }, [checked, task, answers, addReadingResult, evidenceNote, paragraphStatus, scanChecked, scanPick, scanTarget]);

  const createSimilar = (qi) => {
    const gen = buildSimilarQuestion(task.questions[qi], similarSeed + qi);
    setSimilarQuestions(p => ({ ...p, [qi]: gen }));
    setSimilarSeed(s => s + 1);
    setSimilarAnswers(p => ({ ...p, [qi]: null }));
    setSimilarChecked(p => ({ ...p, [qi]: false }));
  };

  // Handle word tap — show tooltip at tap position
  const handleWordPress = useCallback((entry, evt) => {
    const { pageX, pageY } = evt?.nativeEvent || {};
    setTooltip({ entry, pageX, pageY });
  }, []);

  useEffect(() => {
    if (!skimRunning) return undefined;
    if (skimSec <= 0) {
      setSkimRunning(false);
      return undefined;
    }
    const t = setInterval(() => {
      setSkimSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [skimRunning, skimSec]);

  useEffect(() => {
    if (!__DEV__) return undefined;
    const unsubscribe = subscribeSmokeActions((action) => {
      if (action?.target !== 'ReadingDetail') return;
      if (smokeDoneRef.current) return;
      if (action?.type !== 'answer_and_check') return;
      smokeDoneRef.current = true;
      const count = Math.min(2, task?.questions?.length || 0);
      if (!count) return;
      setAnswers((prev) => {
        const next = { ...prev };
        for (let i = 0; i < count; i += 1) {
          if (next[i] == null) next[i] = 0;
        }
        return next;
      });
      smokePendingRef.current = true;
    });
    return unsubscribe;
  }, [task?.questions?.length]);

  useEffect(() => {
    if (!__DEV__) return;
    if (!smokePendingRef.current) return;
    if (checked) return;
    smokePendingRef.current = false;
    setTimeout(() => check(), 200);
  }, [answers, checked, check]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressAndTimerCards = (
    <>
      <Card style={styles.card}>
        <Text style={styles.h3}>Progress</Text>
        <Text style={styles.body}>Answered: {answeredCount}/{task.questions.length}</Text>
        <View style={styles.row}>
          <Button label={checked ? '✓ Checked' : 'Check Answers'} onPress={check} disabled={checked || answeredCount === 0} />
          <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Skim Timer</Text>
        <Text style={styles.body}>Use 2-minute skim before detailed reading.</Text>
        <Text style={styles.skimTimerText}>{formatTime(skimSec)}</Text>
        <View style={styles.row}>
          <Button label={skimRunning ? 'Pause' : 'Start'} variant="secondary" onPress={() => setSkimRunning((v) => !v)} />
          <Button label="Reset 2:00" variant="secondary" onPress={() => { setSkimSec(120); setSkimRunning(false); }} />
        </View>
      </Card>
    </>
  );

  const analysisCards = (
    <>
      {readingFeedback && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Reading Feedback</Text>
          <Text style={styles.sub}>Accuracy: {readingFeedback.accuracy}% ({readingFeedback.correct}/{readingFeedback.total})</Text>
          {readingFeedback.strengths.length > 0 && (
            <>
              <Text style={styles.feedbackTitle}>Strong Areas</Text>
              {readingFeedback.strengths.map((s) => (
                <Text key={s} style={styles.correct}>• {s}</Text>
              ))}
            </>
          )}
          {readingFeedback.fixes.length > 0 && (
            <>
              <Text style={styles.feedbackTitle}>Top Fixes</Text>
              {readingFeedback.fixes.map((s) => (
                <Text key={s} style={styles.incorrect}>• {s}</Text>
              ))}
            </>
          )}
          {readingFeedback.missed.length > 0 && (
            <>
              <Text style={styles.feedbackTitle}>Missed Questions</Text>
              {readingFeedback.missed.slice(0, 3).map((m) => (
                <View key={`miss-${m.index}`} style={styles.missedRow}>
                  <Text style={styles.answer}>Q{m.index}: {m.q}</Text>
                  {m.explain ? <Text style={styles.explain}>{m.explain}</Text> : null}
                </View>
              ))}
            </>
          )}
          {readingFeedback.skillBreakdown.length > 0 && (
            <>
              <Text style={styles.feedbackTitle}>Skill Breakdown</Text>
              {readingFeedback.skillBreakdown.map((s) => (
                <Text key={s.name} style={styles.answer}>
                  {s.name}: {s.pct}% ({s.correct}/{s.total})
                </Text>
              ))}
            </>
          )}
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Button
              label={showOnlyMissed ? 'Show All Questions' : 'Show Only Missed'}
              variant="secondary"
              onPress={() => setShowOnlyMissed((v) => !v)}
            />
          </View>
        </Card>
      )}
      {readingFeedback && mistakeItems.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Mistake Coach</Text>
          <Text style={styles.sub}>Ask why your answer is wrong and get targeted fixes for this passage.</Text>
          <Button
            label={`Open Mistake Coach (${mistakeItems.length})`}
            onPress={() => navigation.navigate('MistakeCoach', {
              module: 'reading',
              moduleLabel: 'Reading',
              taskTitle: task.title || 'Reading Practice',
              mistakes: mistakeItems,
            })}
          />
        </Card>
      )}
      {readingModel && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Reading Model</Text>
          <Text style={styles.sub}>Overall: {readingModel.overall}% • {readingModel.band}</Text>
          <View style={styles.modelTrack}>
            <View style={[styles.modelFill, { width: `${readingModel.overall}%` }]} />
          </View>
          <Text style={styles.feedbackTitle}>Dimension Scores</Text>
          {Object.entries(readingModel.dimensions).map(([name, val]) => (
            <Text key={name} style={styles.answer}>• {name}: {val}%</Text>
          ))}
          {readingModel.weaknesses.length > 0 ? (
            <>
              <Text style={styles.feedbackTitle}>Weak Areas</Text>
              <Text style={styles.incorrect}>• {readingModel.weaknesses.join(' • ')}</Text>
            </>
          ) : null}
          <Text style={styles.feedbackTitle}>Next Actions</Text>
          {readingModel.actions.map((step) => (
            <Text key={step} style={styles.answer}>• {step}</Text>
          ))}
        </Card>
      )}
    </>
  );

  const passageCards = (
    <>
      {isFocusMode ? (
        <Text style={styles.focusBody}>
          {task.text.split(' ').map((w, i) => {
            const clean = w.replace(/[^A-Za-z'-]/g, '').toLowerCase();
            const entry = clean ? getWordEntry(clean) : null;
            const hard = entry?.level && ['B2', 'C1', 'C2'].includes(entry.level);
            return (
              <Text
                key={i}
                style={hard ? styles.underWord : null}
                onPress={hard ? (e) => handleWordPress(entry, e) : undefined}
              >
                {` ${w}`}
              </Text>
            );
          })}
        </Text>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.h3}>Reading Passage</Text>
          <Text style={styles.body}>
            {task.text.split(' ').map((w, i) => {
              const clean = w.replace(/[^A-Za-z'-]/g, '').toLowerCase();
              const entry = clean ? getWordEntry(clean) : null;
              const hard = entry?.level && ['B2', 'C1', 'C2'].includes(entry.level);
              return (
                <Text
                  key={i}
                  style={hard ? styles.underWord : null}
                  onPress={hard ? (e) => handleWordPress(entry, e) : undefined}
                >
                  {` ${w}`}
                </Text>
              );
            })}
          </Text>
          <Text style={styles.passageHint}>
            Underlined words are advanced - tap to see meaning
          </Text>
        </Card>
      )}

      {!isFocusMode && paragraphs.length > 1 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Paragraph Map</Text>
          <Text style={styles.sub}>Mark each paragraph after you identify its main idea.</Text>
          {paragraphs.map((p, i) => {
            const status = paragraphStatus[i] || 'unset';
            return (
              <View key={`pmap-${i}`} style={styles.pMapRow}>
                <View style={styles.pMapBody}>
                  <Text style={styles.pMapTitle}>Paragraph {i + 1}</Text>
                  <Text style={styles.pMapSnippet} numberOfLines={2}>{p}</Text>
                </View>
                <View style={styles.pMapActions}>
                  <TouchableOpacity
                    style={[styles.pMapBtn, status === 'clear' && styles.pMapBtnClear]}
                    onPress={() => setParagraphStatus((prev) => ({ ...prev, [i]: 'clear' }))}
                  >
                    <Text style={styles.pMapBtnText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pMapBtn, status === 'unclear' && styles.pMapBtnUnclear]}
                    onPress={() => setParagraphStatus((prev) => ({ ...prev, [i]: 'unclear' }))}
                  >
                    <Text style={styles.pMapBtnText}>Unclear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {!isFocusMode && scanTarget && paragraphs.length > 1 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>Scanning Drill</Text>
          <Text style={styles.sub}>Find the paragraph containing this keyword quickly.</Text>
          <Text style={styles.scanKeyword}>Keyword: {scanTarget.keyword}</Text>
          <View style={styles.pMapActions}>
            {paragraphs.map((_, i) => {
              const selected = scanPick === i;
              const correct = scanChecked && i === scanTarget.paragraphIndex;
              const wrong = scanChecked && selected && i !== scanTarget.paragraphIndex;
              return (
                <TouchableOpacity
                  key={`scan-${i}`}
                  style={[styles.scanBtn, selected && styles.scanBtnSelected, correct && styles.scanBtnCorrect, wrong && styles.scanBtnWrong]}
                  onPress={() => !scanChecked && setScanPick(i)}
                >
                  <Text style={styles.scanBtnText}>P{i + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.row}>
            <Button label="Check Scan" variant="secondary" onPress={() => setScanChecked(true)} disabled={scanPick == null || scanChecked} />
            <Button
              label="New Drill"
              variant="secondary"
              onPress={() => {
                setScanSeed((s) => s + 1);
                setScanPick(null);
                setScanChecked(false);
              }}
            />
          </View>
          {scanChecked ? (
            <Text style={scanPick === scanTarget.paragraphIndex ? styles.correct : styles.incorrect}>
              {scanPick === scanTarget.paragraphIndex ? 'Correct scanning' : `Correct paragraph: P${scanTarget.paragraphIndex + 1}`}
            </Text>
          ) : null}
        </Card>
      )}

      {!isFocusMode && (
        <Card style={styles.card}>
        <Text style={styles.h3}>Evidence Notes</Text>
        <TextInput
          style={styles.evidenceInput}
          multiline
          value={evidenceNote}
          onChangeText={setEvidenceNote}
          placeholder="Quote short evidence lines and why they support your answer..."
          textAlignVertical="top"
        />
      </Card>
    </>
  );

  const questionCards = (
    <>
      {!isFocusMode && (
        <OpenEndedPracticeCard
          title="Open-Ended Reading Questions"
          prompts={openEndedPrompts}
          idealClusters={task?.ideal_clusters || null}
          placeholder="Write your reading response..."
        />
      )}

      {visibleQuestionIndexes.length === 0 && checked ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>No missed questions left.</Text>
          <Text style={styles.sub}>Great work. You can switch back to all questions.</Text>
        </Card>
      ) : null}
      {visibleQuestionIndexes.map((qi) => {
        const q = task.questions[qi];
        return (
          <Card key={qi} style={styles.card}>
            <View style={styles.qTypeRow}>
              <Text style={styles.h3}>Q{qi + 1}.</Text>
              {q.type === 'cloze' && (
                <View style={styles.clozeTag}><Text style={styles.clozeTagText}>Fill-in-the-Blank</Text></View>
              )}
            </View>
            {q.type !== 'cloze' && <Text style={styles.h3}>{q.q}</Text>}
            {q.skill ? <Text style={styles.skill}>Skill: {q.skill.replace('_', ' ')}</Text> : null}

            {q.type === 'cloze' ? (
              <ClozeQuestion
                q={q} qi={qi}
                answers={answers}
                checked={checked}
                onSelect={select}
              />
            ) : q.type === 'short_answer' ? (
              <View>
                <TextInput
                  style={[
                    styles.notesInput,
                    { minHeight: 44, marginTop: spacing.sm },
                    checked && (
                      (Array.isArray(q.answer) 
                        ? q.answer.some(a => (answers[qi] || '').trim().toLowerCase() === a.trim().toLowerCase())
                        : (answers[qi] || '').trim().toLowerCase() === q.answer.trim().toLowerCase())
                      ? styles.inputCorrect : styles.inputIncorrect
                    )
                  ]}
                  value={answers[qi] || ''}
                  onChangeText={(text) => !checked && setAnswers(p => ({ ...p, [qi]: text }))}
                  placeholder="Type your short answer..."
                  placeholderTextColor={colors.muted}
                  editable={!checked}
                />
                {checked && (
                  <View style={{ marginTop: spacing.xs }}>
                    <Text style={
                      (Array.isArray(q.answer) 
                        ? q.answer.some(a => (answers[qi] || '').trim().toLowerCase() === a.trim().toLowerCase())
                        : (answers[qi] || '').trim().toLowerCase() === q.answer.trim().toLowerCase())
                      ? styles.correct : styles.incorrect
                    }>
                      {(Array.isArray(q.answer) 
                        ? q.answer.some(a => (answers[qi] || '').trim().toLowerCase() === a.trim().toLowerCase())
                        : (answers[qi] || '').trim().toLowerCase() === q.answer.trim().toLowerCase())
                        ? '✓ Correct' : `✗ Incorrect — Correct: ${Array.isArray(q.answer) ? q.answer[0] : q.answer}`}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              (q.options || []).map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[
                    styles.optionBtn,
                    answers[qi] === oi && !checked && styles.optionSelected,
                    checked && oi === q.answer && styles.optionCorrect,
                    checked && answers[qi] === oi && oi !== q.answer && styles.optionWrong,
                  ]}
                  onPress={() => select(qi, oi)}
                  disabled={checked}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.optionText,
                    checked && oi === q.answer && styles.optionTextCorrect,
                    checked && answers[qi] === oi && oi !== q.answer && styles.optionTextWrong,
                  ]}>{opt}</Text>
                </TouchableOpacity>
              ))
            )}
            {checked && q.type !== 'short_answer' && (
              <>
                <Text style={answers[qi] === q.answer ? styles.correct : styles.incorrect}>
                  {answers[qi] === q.answer ? 'Correct' : 'Incorrect'}
                </Text>
                <Text style={styles.answer}>Correct: {q.options ? q.options[q.answer] : q.answer}</Text>
                <Text style={styles.explain}>{getExplanation(q, answers[qi])}</Text>
                {answers[qi] !== q.answer && (
                  <>
                    <Button
                      label="Open Mistake Coach"
                      variant="secondary"
                      onPress={() => {
                        const item = mistakeItems.find((m) => m.id === `${task.id || 'reading'}-${qi}`);
                        if (item) {
                          navigation.navigate('MistakeCoach', {
                            module: 'reading',
                            moduleLabel: 'Reading',
                            taskTitle: task.title || 'Reading Practice',
                            mistakes: [item],
                          });
                        }
                      }}
                      style={styles.mistakeBtn}
                    />
                    <Button
                      label={similarQuestions[qi] ? 'New Similar Question' : 'Try Similar'}
                      variant="secondary"
                      onPress={() => createSimilar(qi)}
                    />
                  </>
                )}
              </>
            )}
            {similarQuestions[qi] && (
              <View style={styles.similarBox}>
                <Text style={styles.h3}>{similarQuestions[qi].q}</Text>
                {(similarQuestions[qi].options || []).map((opt, oi) => (
                  <TouchableOpacity
                    key={oi}
                    style={[
                      styles.optionBtn,
                      similarAnswers[qi] === oi && !similarChecked[qi] && styles.optionSelected,
                      similarChecked[qi] && oi === similarQuestions[qi].answer && styles.optionCorrect,
                      similarChecked[qi] && similarAnswers[qi] === oi && oi !== similarQuestions[qi].answer && styles.optionWrong,
                    ]}
                    onPress={() => !similarChecked[qi] && setSimilarAnswers(p => ({ ...p, [qi]: oi }))}
                    disabled={similarChecked[qi]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                {!similarChecked[qi] && (
                  <Button label="Check Similar" onPress={() => setSimilarChecked(p => ({ ...p, [qi]: true }))} disabled={similarAnswers[qi] == null} />
                )}
                {similarChecked[qi] && (
                  <>
                    <Text style={similarAnswers[qi] === similarQuestions[qi].answer ? styles.correct : styles.incorrect}>
                      {similarAnswers[qi] === similarQuestions[qi].answer ? 'Correct' : 'Incorrect'}
                    </Text>
                    <Text style={styles.answer}>Correct: {similarQuestions[qi].options[similarQuestions[qi].answer]}</Text>
                    <Text style={styles.explain}>{similarQuestions[qi].explain}</Text>
                    <Button label="New Similar" variant="secondary" onPress={() => createSimilar(qi)} />
                  </>
                )}
              </View>
            )}
          </Card>
        );
      })}

      <View style={styles.row}>
        <Button label={checked ? 'Checked' : 'Check Answers'} onPress={check} />
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
      {score && <Text style={styles.score}>Score: {score}</Text>}
    </>
  );

  return (
    <Screen>
      {!hasValidTask ? (
        <Card style={styles.card}>
          <Text style={styles.h3}>Reading task is unavailable.</Text>
          <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </Card>
      ) : (
        <>
          {!isFocusMode && (
            <View style={styles.header}>
              <View>
                <Text style={styles.h1}>{task.title || 'Reading'}</Text>
                <Text style={styles.headerSub}>{task.level} • {task.time}</Text>
              </View>
              <View style={styles.headerActionRow}>
                <TouchableOpacity 
                  style={[styles.focusToggle, isFocusMode && styles.focusToggleActive]} 
                  onPress={() => setIsFocusMode(!isFocusMode)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.focusToggleText, isFocusMode && styles.focusToggleTextActive]}>
                    {isFocusMode ? '✨ Focus: ON' : '✨ Focus Mode'}
                  </Text>
                </TouchableOpacity>
                <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
              </View>
            </View>
          )}

          {isFocusMode && (
            <TouchableOpacity 
              style={styles.focusExitBtn} 
              onPress={() => setIsFocusMode(false)}
            >
              <Text style={styles.focusExitText}>✕ Exit Focus Mode</Text>
            </TouchableOpacity>
          )}

          {isFocusMode ? (
            <View style={styles.focusContainer}>
              <View style={[styles.focusPane, { width: width * splitRatio }]}>
                <ScrollView 
                  style={styles.paneScroll} 
                  contentContainerStyle={styles.paneContent}
                  showsVerticalScrollIndicator={false}
                >
                  {passageCards}
                </ScrollView>
              </View>
              
              <View 
                {...panResponder.panHandlers} 
                style={styles.resizeHandle}
              >
                <View style={styles.resizeLine} />
              </View>

              <View style={[styles.focusPane, { flex: 1 }]}>
                <ScrollView 
                  style={styles.paneScroll} 
                  contentContainerStyle={styles.paneContent}
                  showsVerticalScrollIndicator={false}
                >
                  {analysisCards}
                  {questionCards}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              style={styles.mainScroll}
              contentContainerStyle={styles.mainContent}
              showsVerticalScrollIndicator={false}
            >
              {useSplitLayout ? (
                <View style={styles.splitRow}>
                  <View style={styles.leftCol}>
                    {progressAndTimerCards}
                    {analysisCards}
                    {passageCards}
                  </View>
                  <View style={styles.rightCol}>
                    {questionCards}
                  </View>
                </View>
              ) : (
                <View style={styles.stackCol}>
                  {progressAndTimerCards}
                  {analysisCards}
                  {passageCards}
                  {questionCards}
                </View>
              )}
            </ScrollView>
          )}

          <WordTooltip entry={tooltip?.entry} onClose={() => setTooltip(null)} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  headerSub: { fontSize: typography.small, color: colors.muted },
  mainScroll: { flex: 1 },
  mainContent: { padding: spacing.md, paddingBottom: 60 },
  splitRow: { flexDirection: 'row', gap: spacing.lg },
  leftCol: { flex: 1.2 },
  rightCol: { flex: 1 },
  stackCol: { gap: spacing.md },
  h1: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  h3: { fontSize: typography.h3, fontFamily: typography.fontHeadline, marginBottom: spacing.sm },
  sub: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.lg },
  body: { fontSize: typography.body, fontFamily: typography.fontBody },
  card: { marginBottom: spacing.lg },
  cardCompact: { marginBottom: spacing.md },
  subCompact: { fontSize: typography.small, color: colors.muted, marginBottom: 0 },
  readingDeskCard: {
    marginBottom: spacing.md,
    backgroundColor: '#102A56',
    borderColor: '#102A56',
  },
  readingDeskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  readingDeskTitle: {
    fontSize: typography.h3,
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
  },
  readingDeskMode: {
    fontSize: typography.xsmall,
    color: '#CFE2FF',
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
  },
  readingDeskSub: {
    fontSize: typography.small,
    color: '#DDE8FF',
    marginBottom: spacing.sm,
  },
  readingDeskMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  readingDeskMeta: {
    fontSize: typography.xsmall,
    color: '#BFDBFE',
    fontFamily: typography.fontHeadline,
  },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  modelTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  modelFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  landscapeSplit: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
    minHeight: 0,
  },
  landscapeOuter: {
    marginBottom: spacing.lg,
    flex: 1, // Let it expand fully
    minHeight: 0,
  },
  landscapeOuterContent: {
    flexGrow: 1,
  },
  landscapePaneLeft: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  landscapePaneRight: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  paneScrollWeb: Platform.OS === 'web' ? {
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  } : {},
  landscapePaneContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    minWidth: 0,
  },
  score: { marginTop: spacing.md, fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.primary },
  skimTimerText: {
    fontSize: 36,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },

  underWord: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.primary,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  passageHint: { fontSize: 11, color: colors.muted, marginTop: spacing.sm, fontStyle: 'italic' },

  skill: { fontSize: typography.small, color: colors.muted, marginBottom: spacing.xs },
  answer: { fontSize: typography.small, color: colors.muted },
  explain: { fontSize: typography.small, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.sm },
  correct: { fontSize: typography.small, color: '#1F8B4C', fontFamily: typography.fontHeadline, marginTop: spacing.xs },
  incorrect: { fontSize: typography.small, color: '#B42318', fontFamily: typography.fontHeadline, marginTop: spacing.xs },
  feedbackTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  missedRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  evidenceInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
  },
  pMapRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  pMapBody: {
    marginBottom: spacing.xs,
  },
  pMapTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  pMapSnippet: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 18,
  },
  pMapActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pMapBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  pMapBtnClear: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF3',
  },
  pMapBtnUnclear: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  pMapBtnText: {
    fontSize: typography.xsmall,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  scanKeyword: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  scanBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  scanBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  scanBtnCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF3',
  },
  scanBtnWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  scanBtnText: {
    fontSize: typography.xsmall,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },

  optionBtn: {
    padding: spacing.md, borderRadius: 10, marginBottom: spacing.xs,
    borderWidth: 1.5, borderColor: colors.secondary, backgroundColor: colors.surface,
  },
  optionSelected: { backgroundColor: colors.secondary, borderColor: colors.primary },
  optionCorrect: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  optionWrong: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  optionText: { fontSize: typography.body, color: colors.text },
  optionTextCorrect: { color: '#1B5E20', fontFamily: typography.fontHeadline },
  optionTextWrong: { color: '#B71C1C', fontFamily: typography.fontHeadline },
  mistakeBtn: { marginBottom: spacing.xs, alignSelf: 'flex-start' },

  qTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.xs },
  clozeTag: { backgroundColor: '#FFF3E0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  clozeTagText: { fontSize: 10, fontWeight: '800', color: '#E65100', textTransform: 'uppercase' },
  clozeSentenceRow: { backgroundColor: 'rgba(59,130,246,0.04)', borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  clozeSentence: { fontSize: typography.body, color: colors.text, lineHeight: 26 },
  clozeBlank: { fontWeight: '900', color: colors.primaryDark, textDecorationLine: 'underline', backgroundColor: colors.primarySoft },
  clozeHint: { fontSize: 11, color: colors.muted, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.sm, letterSpacing: 0.4 },

  similarBox: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.secondary },

  // ── Kelime Popup (Bottom Sheet) ──
  tooltipOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tooltipSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  tooltipSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    marginBottom: spacing.md,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tooltipWord: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  tooltipType: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tooltipSpeakBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipSpeakIcon: { fontSize: 17 },
  tooltipClose: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipCloseText: {
    fontSize: 15,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  tooltipDefRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.sm,
  },
  tooltipDefLabel: {
    fontSize: 10,
    fontFamily: typography.fontHeadline,
    color: '#fff',
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  tooltipDef: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  tooltipTrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.sm,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  tooltipTrFlag: { fontSize: 18, lineHeight: 22 },
  tooltipTr: {
    flex: 1,
    fontSize: typography.body,
    color: '#5D4037',
    fontFamily: typography.fontHeadline,
    lineHeight: 22,
  },
  tooltipTrLoading: {
    flex: 1,
    fontSize: typography.small,
    color: colors.muted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  tooltipSecRow: {
    marginBottom: spacing.sm,
  },
  tooltipSecLabel: {
    fontSize: 10,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  tooltipSyn: {
    fontSize: typography.body,
    color: '#1565C0',
    lineHeight: 20,
  },
  tooltipEx: {
    fontSize: typography.small,
    color: colors.muted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  focusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  focusToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  focusToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  focusToggleTextActive: {
    color: '#FFF',
  },
  focusContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
  },
  focusPane: {
    height: '100%',
  },
  paneScroll: {
    flex: 1,
  },
  paneContent: {
    padding: spacing.xs,
    paddingBottom: 40,
  },
  resizeHandle: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
    cursor: Platform.OS === 'web' ? 'col-resize' : 'default',
  },
  resizeLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  focusBody: {
    fontSize: 18,
    fontFamily: typography.fontBody,
    color: colors.text,
    lineHeight: 30,
    paddingHorizontal: spacing.sm,
  },
  focusExitBtn: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  focusExitText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
