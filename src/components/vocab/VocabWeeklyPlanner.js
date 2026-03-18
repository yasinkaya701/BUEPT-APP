import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../Button';
import Card from '../Card';
import Chip from '../Chip';
import { colors, spacing, typography } from '../../theme/tokens';
import { useAppState } from '../../context/AppState';
import {
  loadWeeklyVocabProgress,
  saveWeeklyVocabProgress,
} from '../../utils/appStorage';
import { speakEnglish } from '../../utils/ttsEnglish';
import {
  buildErrorNotebook,
  buildTopMistakenCollocations,
  getDailyQuiz,
  getRecommendedWeek,
  getVocabCurriculum,
  getWeekMastery,
} from '../../utils/vocabCurriculum';

const LEVEL_FILTERS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];

function countByType(results = []) {
  return results.reduce((acc, item) => {
    const key = item.type;
    const current = acc[key] || { total: 0, correct: 0 };
    acc[key] = {
      total: current.total + 1,
      correct: current.correct + (item.correct ? 1 : 0),
    };
    return acc;
  }, {});
}

async function speakWord(word) {
  try {
    await speakEnglish(String(word || ''), { rate: 0.48 });
  } catch (_) {}
}

function normalizeAnswer(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[.,!?;:()[\]"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAnswerCorrect(question = {}, response = '') {
  const normalizedResponse = normalizeAnswer(response);
  if (!normalizedResponse) return false;
  const accepted = Array.isArray(question?.acceptedAnswers) && question.acceptedAnswers.length
    ? question.acceptedAnswers
    : [question?.answer];
  return accepted.some((item) => normalizeAnswer(item) === normalizedResponse);
}

function createEmptyPlannerProgress(selectedWeek = 1) {
  return {
    version: 1,
    selectedWeek,
    selectedDay: 1,
    weekStats: {},
    mistakes: {
      collocations: {},
    },
  };
}

function formatSavedDate(value) {
  if (!value) return 'Not saved yet';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not saved yet';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getAverageAccuracy(weekStats = {}) {
  const rows = Object.values(weekStats || {}).filter((item) => Number(item?.completedRuns || 0) > 0);
  if (!rows.length) return 0;
  const total = rows.reduce((sum, item) => sum + Number(item?.averageAccuracy || item?.accuracy || 0), 0);
  return Math.round(total / rows.length);
}

function updateMistakeBucket(bucket = {}, key = '', payload = {}) {
  const label = String(key || '').trim();
  if (!label) return bucket;
  const current = bucket[label] || {};
  return {
    ...bucket,
    [label]: {
      label,
      word: payload.word || current.word || '',
      definition: payload.definition || current.definition || '',
      level: payload.level || current.level || '',
      count: Number(current.count || 0) + 1,
      weeks: Array.from(new Set([...(current.weeks || []), ...(payload.weeks || [])])).sort((a, b) => a - b),
    },
  };
}

function buildStageGroups(curriculum = []) {
  const groups = new Map();
  curriculum.forEach((week) => {
    const level = String(week?.level || '').trim();
    if (!level) return;
    const current = groups.get(level) || {
      level,
      from: week.week,
      to: week.week,
      weeks: [],
    };
    current.from = Math.min(current.from, week.week);
    current.to = Math.max(current.to, week.week);
    current.weeks.push(week.week);
    groups.set(level, current);
  });
  return Array.from(groups.values())
    .sort((a, b) => a.from - b.from)
    .map((item) => ({
      ...item,
      label: `Weeks ${item.from}-${item.to}`,
      weekCount: item.weeks.length,
    }));
}

function uniqueWords(list = []) {
  const seen = new Set();
  return list.filter((word) => {
    const key = String(word || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDayMode(dayNumber = 1) {
  return Number(dayNumber) >= 1 && Number(dayNumber) <= 5 ? 'formation' : 'collocation';
}

function getDayModeLabel(dayNumber = 1) {
  return getDayMode(dayNumber) === 'formation' ? 'WF' : 'COLL';
}

function getDayModeTitle(dayNumber = 1) {
  return getDayMode(dayNumber) === 'formation' ? 'Word Formation Quiz' : 'Collocation Quiz';
}

function renderPromptFrame(current, revealed) {
  const before = String(current?.promptFrame?.before || '').trim();
  const after = String(current?.promptFrame?.after || '').trim();
  if (!before && !after) {
    return <Text style={styles.quizPrompt}>{current?.prompt}</Text>;
  }
  return (
    <View style={styles.promptFrameBox}>
      <Text style={styles.promptFrameText}>{before}</Text>
      <View style={styles.promptBlank}>
        <Text style={styles.promptBlankText}>{revealed ? current.answer : '______'}</Text>
      </View>
      {after ? <Text style={styles.promptFrameText}>{after}</Text> : null}
    </View>
  );
}

export default function VocabWeeklyPlanner({ initialDay = null }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const {
    addUnknownWord,
    addUserWord,
    errorWords,
    recordKnown,
    recordQuizError,
    recordUnknown,
    vocabStats,
  } = useAppState();

  const curriculum = useMemo(() => getVocabCurriculum(), []);
  const stageGroups = useMemo(() => buildStageGroups(curriculum), [curriculum]);
  const recommendedWeek = useMemo(() => getRecommendedWeek(vocabStats), [vocabStats]);
  const [initialRecommendedWeek] = useState(recommendedWeek || 1);
  const notebook = useMemo(
    () => buildErrorNotebook({ errorWords, vocabStats, limit: 10 }),
    [errorWords, vocabStats]
  );

  const [levelFilter, setLevelFilter] = useState('All');
  const [selectedWeek, setSelectedWeek] = useState(initialRecommendedWeek);
  const [selectedDay, setSelectedDay] = useState(1);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const [missedWords, setMissedWords] = useState([]);
  const [seed, setSeed] = useState(0);
  const [plannerProgress, setPlannerProgress] = useState(() =>
    createEmptyPlannerProgress(initialRecommendedWeek)
  );
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await loadWeeklyVocabProgress();
      if (!active) return;
      const hasTrackedProgress =
        Object.keys(stored?.weekStats || {}).length > 0 ||
        Object.keys(stored?.mistakes?.collocations || {}).length > 0;
      const restoredWeek = hasTrackedProgress
        ? Number(stored?.selectedWeek) || initialRecommendedWeek || 1
        : initialRecommendedWeek || Number(stored?.selectedWeek) || 1;
      const restoredDay = Number(stored?.selectedDay) || 1;
      setPlannerProgress({
        ...createEmptyPlannerProgress(restoredWeek),
        ...(stored || {}),
        selectedWeek: restoredWeek,
        selectedDay: restoredDay,
      });
      setSelectedWeek(restoredWeek);
      setSelectedDay(restoredDay);
      setProgressLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [initialRecommendedWeek]);

  useEffect(() => {
    if (!progressLoaded) return;
    saveWeeklyVocabProgress(plannerProgress);
  }, [plannerProgress, progressLoaded]);

  useEffect(() => {
    if (!progressLoaded || plannerProgress.selectedWeek === selectedWeek) return;
    setPlannerProgress((prev) => ({
      ...prev,
      selectedWeek,
    }));
  }, [selectedWeek, plannerProgress.selectedWeek, progressLoaded]);

  useEffect(() => {
    if (!progressLoaded || plannerProgress.selectedDay === selectedDay) return;
    setPlannerProgress((prev) => ({
      ...prev,
      selectedDay,
    }));
  }, [selectedDay, plannerProgress.selectedDay, progressLoaded]);

  useEffect(() => {
    if (initialDay == null) return;
    const nextDay = Number(initialDay) || 1;
    if (nextDay < 1 || nextDay > 7) return;
    setSelectedDay(nextDay);
    setSeed((prev) => prev + 1);
    setStarted(false);
    setIndex(0);
    setResponseText('');
    setRevealed(false);
    setResults([]);
    setMissedWords([]);
  }, [initialDay]);

  const visibleWeeks = useMemo(
    () => curriculum.filter((week) => levelFilter === 'All' || week.level === levelFilter),
    [curriculum, levelFilter]
  );

  const selectedPlan = useMemo(
    () => curriculum.find((week) => week.week === selectedWeek) || curriculum[0],
    [curriculum, selectedWeek]
  );
  const selectedDayMode = useMemo(() => getDayMode(selectedDay), [selectedDay]);
  const selectedDayModeTitle = selectedDayMode === 'formation' ? 'Word Formation' : 'Collocation Completion';
  const selectedWeekCollocations = useMemo(
    () => (selectedPlan?.focusWords || []).map((item) => item.collocationPhrase).filter(Boolean).slice(0, 6),
    [selectedPlan]
  );
  const selectedFormationTargets = useMemo(
    () => (selectedPlan?.focusWords || []).map((item) => item.word).filter(Boolean).slice(0, 8),
    [selectedPlan]
  );
  const selectedWeekBlocks = useMemo(() => {
    if (!selectedPlan?.questionMix) return [];
    return [
      {
        key: 'formation-days',
        title: 'Formation Days',
        value: selectedPlan.questionMix.formationDays,
        body: 'Days 1-5 run 20-question word formation sets built around academic base words.',
      },
      {
        key: 'collocation-days',
        title: 'Collocation Days',
        value: selectedPlan.questionMix.collocationDays,
        body: 'Days 6-7 run 20-question collocation completion sets with exact phrase control.',
      },
      {
        key: 'questions-per-day',
        title: 'Questions Per Day',
        value: selectedPlan.questionMix.total,
        body: 'Every day is a full 20-question typed set. The format changes by day, not within the day.',
      },
    ];
  }, [selectedPlan]);

  const daySeed = useMemo(
    () => (Number(selectedWeek) * 1000 + Number(selectedDay) * 37),
    [selectedWeek, selectedDay]
  );
  const quiz = useMemo(
    () => getDailyQuiz(selectedWeek, selectedDay, daySeed),
    [selectedWeek, selectedDay, daySeed]
  );
  const hasQuiz = Boolean(quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0);

  const current = quiz?.questions?.[index] || null;
  const trimmedResponse = normalizeAnswer(responseText);
  const finished = started && !!quiz && index >= quiz.questions.length;
  const score = results.filter((item) => item.correct).length;
  const typeSummary = useMemo(() => countByType(results), [results]);
  const weekStats = useMemo(() => plannerProgress.weekStats || {}, [plannerProgress.weekStats]);
  const completedWeekCount = useMemo(
    () => Object.values(weekStats).filter((item) => Number(item?.completedRuns || 0) > 0).length,
    [weekStats]
  );
  const averageAccuracy = useMemo(() => getAverageAccuracy(weekStats), [weekStats]);
  const selectedWeekProgress = weekStats[String(selectedWeek)] || null;
  const selectedDayProgress = selectedWeekProgress?.dayStats?.[String(selectedDay)] || null;
  const selectedStage = useMemo(
    () => stageGroups.find((stage) => selectedWeek >= stage.from && selectedWeek <= stage.to) || null,
    [selectedWeek, stageGroups]
  );
  const recommendedStage = useMemo(
    () => stageGroups.find((stage) => recommendedWeek >= stage.from && recommendedWeek <= stage.to) || null,
    [recommendedWeek, stageGroups]
  );
  const mistakenCollocations = useMemo(
    () => buildTopMistakenCollocations(plannerProgress, 8),
    [plannerProgress]
  );

  const resetRun = () => {
    setStarted(false);
    setIndex(0);
    setResponseText('');
    setRevealed(false);
    setResults([]);
    setMissedWords([]);
  };

  const selectWeek = (weekNumber) => {
    setSelectedWeek(weekNumber);
    setSelectedDay(1);
    resetRun();
  };

  const selectDay = (dayNumber) => {
    setSelectedDay(dayNumber);
    resetRun();
  };

  const startQuiz = () => {
    if (!hasQuiz) {
      setStarted(false);
      return;
    }
    setPlannerProgress((prev) => {
      const key = String(selectedWeek);
      const currentWeek = prev.weekStats?.[key] || {};
      return {
        ...prev,
        weekStats: {
          ...prev.weekStats,
          [key]: {
            ...currentWeek,
            week: selectedWeek,
            level: selectedPlan?.level || currentWeek.level || '',
            title: selectedPlan?.title || currentWeek.title || '',
            attempts: Number(currentWeek.attempts || 0) + 1,
            totalQuestions: quiz?.questions?.length || currentWeek.totalQuestions || 20,
            questionBankSize: selectedPlan?.questionBankSize || currentWeek.questionBankSize || 0,
            lastStartedAt: new Date().toISOString(),
            lastStartedDay: selectedDay,
            dayStats: {
              ...(currentWeek.dayStats || {}),
              [String(selectedDay)]: {
                ...(currentWeek.dayStats?.[String(selectedDay)] || {}),
                day: selectedDay,
                attempts: Number(currentWeek.dayStats?.[String(selectedDay)]?.attempts || 0) + 1,
                totalQuestions: quiz?.questions?.length || currentWeek.totalQuestions || 20,
                lastStartedAt: new Date().toISOString(),
              },
            },
          },
        },
      };
    });
    setStarted(true);
    setIndex(0);
    setResponseText('');
    setRevealed(false);
    setResults([]);
    setMissedWords([]);
  };

  const checkAnswer = () => {
    if (!current || !trimmedResponse || revealed) return;
    const correct = isAnswerCorrect(current, responseText);
    setRevealed(true);
    setResults((prev) => [
      ...prev,
      {
        type: current.type,
        correct,
        target: current.target,
        response: responseText.trim(),
        answer: current.answer,
      },
    ]);
    if (correct) {
      recordKnown(current.target);
    } else {
      recordUnknown(current.target);
      recordQuizError(current.target);
      addUnknownWord(current.target);
      setMissedWords((prev) => (prev.includes(current.target) ? prev : [...prev, current.target]));
      if (current.type === 'Collocation Completion') {
        const key = current.notebook?.collocation || current.answer;
        setPlannerProgress((prev) => ({
          ...prev,
          mistakes: {
            ...prev.mistakes,
            collocations: updateMistakeBucket(prev.mistakes?.collocations, key, {
              word: current.target,
              definition: current.notebook?.definition || current.explanation,
              level: current.level || current.notebook?.level || '',
              weeks: [selectedWeek],
            }),
          },
        }));
      }
    }
  };

  const persistWeekCompletion = (finalResults = []) => {
    const totalQuestions = quiz?.questions?.length || finalResults.length || 20;
    const finalScore = finalResults.filter((item) => item.correct).length;
    const accuracy = Math.round((finalScore / Math.max(1, totalQuestions)) * 100);
    const summary = countByType(finalResults);
    const savedAt = new Date().toISOString();
    setPlannerProgress((prev) => {
      const key = String(selectedWeek);
      const currentWeek = prev.weekStats?.[key] || {};
      const currentDay = currentWeek.dayStats?.[String(selectedDay)] || {};
      const completedRuns = Number(currentWeek.completedRuns || 0);
      const nextCompletedRuns = completedRuns + 1;
      const averageAccuracyValue = Math.round(
        ((Number(currentWeek.averageAccuracy || 0) * completedRuns) + accuracy) /
          Math.max(1, nextCompletedRuns)
      );
      const dayCompletedRuns = Number(currentDay.completedRuns || 0);
      const nextDayCompletedRuns = dayCompletedRuns + 1;
      const dayAverageAccuracyValue = Math.round(
        ((Number(currentDay.averageAccuracy || 0) * dayCompletedRuns) + accuracy) /
          Math.max(1, nextDayCompletedRuns)
      );
      return {
        ...prev,
        weekStats: {
          ...prev.weekStats,
          [key]: {
            ...currentWeek,
            week: selectedWeek,
            title: selectedPlan?.title || currentWeek.title || '',
            level: selectedPlan?.level || currentWeek.level || '',
            questionBankSize: selectedPlan?.questionBankSize || currentWeek.questionBankSize || 0,
            totalQuestions,
            completedRuns: nextCompletedRuns,
            bestScore: Math.max(Number(currentWeek.bestScore || 0), finalScore),
            lastScore: finalScore,
            accuracy,
            averageAccuracy: averageAccuracyValue,
            lastCompletedAt: savedAt,
            lastMissedWords: missedWords,
            typeSummary: summary,
            dayStats: {
              ...(currentWeek.dayStats || {}),
              [String(selectedDay)]: {
                ...currentDay,
                day: selectedDay,
                totalQuestions,
                completedRuns: nextDayCompletedRuns,
                bestScore: Math.max(Number(currentDay.bestScore || 0), finalScore),
                lastScore: finalScore,
                accuracy,
                averageAccuracy: dayAverageAccuracyValue,
                lastCompletedAt: savedAt,
                lastMissedWords: missedWords,
                typeSummary: summary,
              },
            },
          },
        },
      };
    });
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (index === quiz.questions.length - 1) {
      persistWeekCompletion(results);
    }
    setResponseText('');
    setRevealed(false);
    setIndex((prev) => prev + 1);
  };

  const addSelectedWeekWords = () => {
    (selectedPlan?.focusWords || []).forEach((item) => addUserWord(item.word));
  };

  const addMissedWords = () => {
    missedWords.forEach((word) => addUserWord(word));
  };

  const selectedWeekMastery = getWeekMastery(selectedPlan, vocabStats);
  const selectedWeekReviewWords = useMemo(() => {
    const fromNotebook = notebook
      .filter((item) => Array.isArray(item.weeks) && item.weeks.includes(selectedWeek))
      .map((item) => item.word);
    const fromProgress = Array.isArray(selectedDayProgress?.lastMissedWords)
      ? selectedDayProgress.lastMissedWords
      : [];
    return uniqueWords([...fromProgress, ...fromNotebook]).slice(0, 6);
  }, [notebook, selectedDayProgress, selectedWeek]);
  const weeklyWorkflow = useMemo(() => {
    if (!selectedPlan) return [];
    return [
      {
        key: 'focus',
        title: 'Focus Words',
        body: `Preview ${selectedPlan.focusWords.length} anchor words before you start Day ${selectedDay}.`,
      },
      {
        key: 'mode',
        title: `Day ${selectedDay} Mode`,
        body:
          selectedDayMode === 'formation'
            ? 'This day is a pure word formation set: 20 fill-in questions that require the correct noun, verb, adjective, or adverb form.'
            : 'This day is a pure collocation set: 20 fill-in questions that require the exact missing word in an academic phrase.',
      },
      {
        key: 'target',
        title: 'Daily Target',
        body: `Finish one 20-question set on Day ${selectedDay} and aim above ${Math.max(70, selectedWeekMastery)}%.`,
      },
      {
        key: 'review',
        title: 'Review Queue',
        body: selectedWeekReviewWords.length
          ? `Revisit ${selectedWeekReviewWords.length} weak words before the next run.`
          : 'If you miss words, add them and review them before moving on.',
      },
    ];
  }, [selectedDay, selectedDayMode, selectedPlan, selectedWeekMastery, selectedWeekReviewWords.length]);

  return (
    <View>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.flexOne}>
            <Text style={styles.heroTitle}>24-Week Vocab Workshop</Text>
            <Text style={styles.heroSub}>
              Each week has 7 daily sets. Days 1-5 are 20-question word formation sets.
              Days 6-7 are 20-question collocation completion sets.
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeValue}>24</Text>
            <Text style={styles.heroBadgeLabel}>weeks</Text>
          </View>
        </View>
        <View style={styles.heroMetrics}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>Week {recommendedWeek}</Text>
            <Text style={styles.metricLabel}>Recommended</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{selectedWeekMastery}%</Text>
            <Text style={styles.metricLabel}>Week Mastery</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{completedWeekCount}</Text>
            <Text style={styles.metricLabel}>Weeks Completed</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{averageAccuracy}%</Text>
            <Text style={styles.metricLabel}>Avg Accuracy</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Level Filter</Text>
        <View style={styles.chipRow}>
          {LEVEL_FILTERS.map((level) => (
            <Chip
              key={level}
              label={level}
              active={levelFilter === level}
              onPress={() => setLevelFilter(level)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Roadmap by Stage</Text>
        <Text style={styles.sectionSub}>
          The 24 weeks are grouped into CEFR stages so you can see where you are, what is next, and how far the current band runs.
        </Text>
        <View style={[styles.stageGrid, isWide && styles.stageGridWide]}>
          {stageGroups.map((stage) => {
            const active = selectedStage?.level === stage.level;
            const recommended = recommendedStage?.level === stage.level;
            return (
              <View
                key={`stage-${stage.level}`}
                style={[
                  styles.stageCard,
                  active && styles.stageCardActive,
                  recommended && styles.stageCardRecommended,
                  isWide && styles.stageCardWide,
                ]}
              >
                <View style={styles.stageHeader}>
                  <Text style={[styles.stageLevel, active && styles.stageLevelActive]}>{stage.level}</Text>
                  {recommended ? (
                    <View style={styles.recommendedPill}>
                      <Text style={styles.recommendedPillText}>Next band</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.stageRange, active && styles.stageRangeActive]}>{stage.label}</Text>
                <Text style={[styles.stageMeta, active && styles.stageMetaActive]}>{stage.weekCount} week block</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Weekly Plan</Text>
        <Text style={styles.sectionSub}>
          Start from the recommended week or jump to any band. Then choose a day:
          Days 1-5 are word formation, Days 6-7 are collocation completion.
        </Text>
        <View style={[styles.weekGrid, isWide && styles.weekGridWide]}>
          {visibleWeeks.map((week) => {
            const mastery = getWeekMastery(week, vocabStats);
            const active = week.week === selectedWeek;
            const storedWeek = weekStats[String(week.week)] || {};
            const completedDays = Object.values(storedWeek.dayStats || {}).filter(
              (item) => Number(item?.completedRuns || 0) > 0
            ).length;
            return (
              <TouchableOpacity
                key={`week-${week.week}`}
                style={[styles.weekCard, active && styles.weekCardActive, isWide && styles.weekCardWide]}
                onPress={() => selectWeek(week.week)}
              >
                <View style={styles.weekHeader}>
                  <Text style={[styles.weekEyebrow, active && styles.weekEyebrowActive]}>
                    Week {week.week} - {week.level}
                  </Text>
                  {week.week === recommendedWeek ? (
                    <View style={styles.recommendedPill}>
                      <Text style={styles.recommendedPillText}>Next</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.weekTitle, active && styles.weekTitleActive]}>{week.title}</Text>
                <Text style={[styles.weekGoal, active && styles.weekGoalActive]}>{week.goal}</Text>
                <Text style={[styles.weekMastery, active && styles.weekMasteryActive]}>
                  Mastery: {mastery}%
                </Text>
                <Text style={[styles.weekProgressLine, active && styles.weekProgressLineActive]}>
                  Days done: {completedDays}/7  |  Best day: {Number(storedWeek.bestScore || 0)}/
                  {Number(storedWeek.totalQuestions || week.questionMix.total)}
                </Text>
                <Text style={[styles.weekProgressLine, active && styles.weekProgressLineActive]}>
                  Bank size: {week.questionBankSize} items
                </Text>
                <View style={styles.focusWrap}>
                  {week.focusWords.slice(0, 4).map((item) => (
                    <View key={`${week.week}-${item.word}`} style={[styles.focusPill, active && styles.focusPillActive]}>
                      <Text style={[styles.focusPillText, active && styles.focusPillTextActive]}>{item.word}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {selectedPlan ? (
        <Card glow>
          <View style={styles.planHeader}>
            <View style={styles.flexOne}>
              <Text style={styles.sectionTitle}>
                Week {selectedPlan.week} - {selectedPlan.title}
              </Text>
              <Text style={styles.sectionSub}>{selectedPlan.goal}</Text>
            </View>
            <View style={styles.masteryBadge}>
              <Text style={styles.masteryBadgeValue}>{selectedWeekMastery}%</Text>
              <Text style={styles.masteryBadgeLabel}>mastery</Text>
            </View>
          </View>

          <View style={styles.progressStrip}>
            <View style={styles.progressStripItem}>
              <Text style={styles.progressStripValue}>{selectedPlan.questionBankSize}</Text>
              <Text style={styles.progressStripLabel}>bank items</Text>
            </View>
            <View style={styles.progressStripItem}>
              <Text style={styles.progressStripValue}>{Number(selectedWeekProgress?.completedRuns || 0)}</Text>
              <Text style={styles.progressStripLabel}>completed runs</Text>
            </View>
            <View style={styles.progressStripItem}>
              <Text style={styles.progressStripValue}>
                {Number(selectedDayProgress?.bestScore || 0)}/
                {Number(selectedDayProgress?.totalQuestions || quiz?.questions?.length || selectedPlan.questionMix.total)}
              </Text>
              <Text style={styles.progressStripLabel}>day best score</Text>
            </View>
            <View style={styles.progressStripItem}>
              <Text style={styles.progressStripValue}>
                {formatSavedDate(selectedDayProgress?.lastCompletedAt)}
              </Text>
              <Text style={styles.progressStripLabel}>day last saved</Text>
            </View>
          </View>

          <Text style={styles.miniHeading}>Daily Sets</Text>
          <View style={[styles.dayGrid, isWide && styles.dayGridWide]}>
            {Array.from({ length: selectedPlan.questionMix.daysPerWeek || 7 }, (_, idx) => idx + 1).map((day) => {
              const active = day === selectedDay;
              const dayProgress = selectedWeekProgress?.dayStats?.[String(day)] || {};
              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[styles.dayCard, active && styles.dayCardActive, isWide && styles.dayCardWide]}
                  onPress={() => selectDay(day)}
                >
                  <View style={styles.dayCardHeader}>
                    <Text style={[styles.dayPillText, active && styles.dayPillTextActive]}>Day {day}</Text>
                    <View style={[styles.dayModeBadge, active && styles.dayModeBadgeActive]}>
                      <Text style={[styles.dayModeBadgeText, active && styles.dayModeBadgeTextActive]}>
                        {getDayModeLabel(day)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.dayCardTitle, active && styles.dayCardTitleActive]}>
                    {getDayModeTitle(day)}
                  </Text>
                  <Text style={[styles.dayCardBody, active && styles.dayCardBodyActive]}>
                    {getDayMode(day) === 'formation'
                      ? '20 typed fill-in questions using the correct noun, verb, adjective, or adverb form.'
                      : '20 typed fill-in questions using the exact missing academic collocation.'}
                  </Text>
                  <Text style={[styles.dayPillMeta, active && styles.dayPillMetaActive]}>
                    Best: {Number(dayProgress.bestScore || 0)}/
                    {Number(dayProgress.totalQuestions || selectedPlan.questionMix.total)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.miniHeading}>Week Set Format</Text>
          <View style={styles.mixRow}>
            {selectedWeekBlocks.map((block) => (
              <View key={block.key} style={styles.mixBox}>
                <Text style={styles.mixValue}>{block.value}</Text>
                <Text style={styles.mixLabel}>{block.title}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.workflowGrid, isWide && styles.workflowGridWide]}>
            {selectedWeekBlocks.map((block) => (
              <View key={`block-${block.key}`} style={[styles.workflowCard, isWide && styles.workflowCardWide]}>
                <Text style={styles.workflowTitle}>{block.title}</Text>
                <Text style={styles.workflowBody}>{block.body}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.miniHeading}>Focus Words</Text>
          <View style={styles.focusWordRow}>
            {selectedPlan.focusWords.map((item) => (
              <TouchableOpacity
                key={`focus-${item.word}`}
                style={styles.wordChip}
                onPress={() => speakWord(item.word)}
              >
                <Text style={styles.wordChipText}>{item.word}</Text>
                <Ionicons name="volume-high-outline" size={14} color={colors.primaryDark} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.miniHeading}>
            {selectedDayMode === 'formation' ? 'Formation Targets' : 'Collocation Targets'}
          </Text>
          {selectedDayMode === 'formation' ? (
            <View style={styles.focusWordRow}>
              {selectedFormationTargets.map((word) => (
                <TouchableOpacity
                  key={`formation-target-${word}`}
                  style={styles.wordChip}
                  onPress={() => speakWord(word)}
                >
                  <Text style={styles.wordChipText}>{word}</Text>
                  <Ionicons name="volume-high-outline" size={14} color={colors.primaryDark} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.prepList}>
              {selectedWeekCollocations.map((item) => (
                <View key={item} style={styles.prepItem}>
                  <Text style={styles.prepPhrase}>{item}</Text>
                  <Text style={styles.prepNote}>This day uses fixed academic phrases in exact collocation completion.</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.miniHeading}>Day {selectedDay} Flow</Text>
          <View style={[styles.workflowGrid, isWide && styles.workflowGridWide]}>
            {weeklyWorkflow.map((item) => (
              <View key={item.key} style={[styles.workflowCard, isWide && styles.workflowCardWide]}>
                <Text style={styles.workflowTitle}>{item.title}</Text>
                <Text style={styles.workflowBody}>{item.body}</Text>
              </View>
            ))}
          </View>

          {selectedWeekReviewWords.length > 0 ? (
            <>
              <Text style={styles.miniHeading}>Selected Week Review Queue</Text>
              <View style={styles.focusWordRow}>
                {selectedWeekReviewWords.map((word) => (
                  <TouchableOpacity
                    key={`selected-review-${word}`}
                    style={styles.wordChip}
                    onPress={() => speakWord(word)}
                  >
                    <Text style={styles.wordChipText}>{word}</Text>
                    <Ionicons name="volume-high-outline" size={14} color={colors.primaryDark} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.actionRow}>
            <Button
              label={started ? `Restart Day ${selectedDay}` : `Start Day ${selectedDay}`}
              onPress={started ? () => resetRun() : startQuiz}
              disabled={!hasQuiz}
            />
            <Button label="Add Focus Words" variant="secondary" onPress={addSelectedWeekWords} />
            <Button label="Add Review Queue" variant="ghost" onPress={() => selectedWeekReviewWords.forEach((word) => addUserWord(word))} disabled={!selectedWeekReviewWords.length} />
          </View>
        </Card>
      ) : null}

      {!hasQuiz ? (
        <Card>
          <Text style={styles.sectionTitle}>Daily quiz not ready</Text>
          <Text style={styles.sectionSub}>
            This day has no generated questions yet. Switch to another day, or come back after the next data refresh.
          </Text>
        </Card>
      ) : null}

      {started && quiz && !finished && current ? (
        <Card style={styles.quizCard}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizProgress}>
              Day {selectedDay} · Question {index + 1} / {quiz.questions.length}
            </Text>
            <View style={styles.quizTypeBadge}>
              <Text style={styles.quizTypeText}>{selectedDayModeTitle}</Text>
            </View>
          </View>
          <Text style={styles.quizInstruction}>{current.instruction}</Text>
          <View style={styles.quizCueRow}>
            {current.cueLabel && current.cueValue ? (
              <View style={styles.quizCuePill}>
                <Text style={styles.quizCueLabel}>{current.cueLabel}</Text>
                <Text style={styles.quizCueValue}>{current.cueValue}</Text>
              </View>
            ) : null}
            {current.secondaryCueLabel && current.secondaryCueValue ? (
              <View style={styles.quizCuePill}>
                <Text style={styles.quizCueLabel}>{current.secondaryCueLabel}</Text>
                <Text style={styles.quizCueValue}>{current.secondaryCueValue}</Text>
              </View>
            ) : null}
            {current.answerForm ? (
              <View style={styles.quizCuePill}>
                <Text style={styles.quizCueLabel}>Target form</Text>
                <Text style={styles.quizCueValue}>{current.answerForm}</Text>
              </View>
            ) : null}
          </View>
          {renderPromptFrame(current, revealed)}
          <View style={styles.answerPanel}>
            <Text style={styles.answerLabel}>Your answer</Text>
            {current.helper ? (
              <View style={styles.answerHelperPill}>
                <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
                <Text style={styles.answerHelperText}>{current.helper}</Text>
              </View>
            ) : null}
            <TextInput
              style={[
                styles.answerInput,
                revealed && isAnswerCorrect(current, responseText) && styles.answerInputCorrect,
                revealed && !isAnswerCorrect(current, responseText) && styles.answerInputWrong,
              ]}
              placeholder={current.placeholder || 'Type your answer'}
              placeholderTextColor={colors.muted}
              value={responseText}
              onChangeText={setResponseText}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!revealed}
            />
            <Text style={styles.answerMeta}>
              {current.type === 'Word Formation'
                ? 'Change the base word into the correct form.'
                : 'Type the missing collocation exactly.'}
            </Text>
          </View>

          {revealed ? (
            <View style={styles.feedbackBox}>
              <Text style={isAnswerCorrect(current, responseText) ? styles.feedbackGood : styles.feedbackBad}>
                {isAnswerCorrect(current, responseText) ? 'Correct' : `Correct answer: ${current.answer}`}
              </Text>
              <Text style={styles.feedbackText}>Your answer: {responseText.trim() || '—'}</Text>
              <Text style={styles.feedbackText}>{current.explanation}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            {!revealed ? (
              <Button label="Check Answer" onPress={checkAnswer} disabled={!trimmedResponse} />
            ) : (
              <Button label={index === quiz.questions.length - 1 ? 'Finish Week' : 'Next Question'} onPress={nextQuestion} />
            )}
          </View>
        </Card>
      ) : null}

      {finished ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Week {selectedWeek} · Day {selectedDay} Summary</Text>
          <Text style={styles.summaryScore}>
            Score: {score}/{results.length}
          </Text>
          <Text style={styles.summaryMeta}>
            Saved progress: {Number(selectedDayProgress?.completedRuns || 0)} completed run(s), best score{' '}
            {Number(selectedDayProgress?.bestScore || 0)}/
            {Number(selectedDayProgress?.totalQuestions || results.length || 20)}.
          </Text>
          <View style={styles.summaryGrid}>
            {Object.entries(typeSummary).map(([type, info]) => (
              <View key={type} style={styles.summaryBox}>
                <Text style={styles.summaryBoxValue}>
                  {info.correct}/{info.total}
                </Text>
                <Text style={styles.summaryBoxLabel}>{type}</Text>
              </View>
            ))}
          </View>
          {missedWords.length > 0 ? (
            <>
              <Text style={styles.miniHeading}>Missed Words</Text>
              <View style={styles.focusWordRow}>
                {missedWords.map((word) => (
                  <TouchableOpacity
                    key={`missed-${word}`}
                    style={styles.wordChip}
                    onPress={() => speakWord(word)}
                  >
                    <Text style={styles.wordChipText}>{word}</Text>
                    <Ionicons name="volume-high-outline" size={14} color={colors.primaryDark} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
          <View style={styles.actionRow}>
            <Button label="Run Again" onPress={() => resetRun(seed + 1)} />
            <Button label="Add Missed Words" variant="secondary" onPress={addMissedWords} disabled={!missedWords.length} />
          </View>
        </Card>
      ) : null}

      <Card>
        <View style={styles.notebookHeader}>
          <View style={styles.flexOne}>
            <Text style={styles.sectionTitle}>Error Notebook</Text>
            <Text style={styles.sectionSub}>
              Wrong answers automatically feed this list. Use it as your personal weak-word revision pack.
            </Text>
          </View>
          <Button label="Add Top Weak Words" variant="secondary" onPress={() => notebook.forEach((item) => addUserWord(item.word))} />
        </View>

        {notebook.length === 0 ? (
          <Text style={styles.sectionSub}>
            No weak words yet. Start a week set and wrong answers will appear here.
          </Text>
        ) : (
          <View style={[styles.notebookGrid, isWide && styles.notebookGridWide]}>
            {notebook.map((item) => (
              <View key={`notebook-${item.word}`} style={[styles.notebookItemWrap, isWide && styles.notebookItemWrapWide]}>
                <Card compact style={styles.notebookCard}>
                  <View style={styles.notebookWordRow}>
                    <TouchableOpacity style={styles.wordChip} onPress={() => speakWord(item.word)}>
                      <Text style={styles.wordChipText}>{item.word}</Text>
                      <Ionicons name="volume-high-outline" size={14} color={colors.primaryDark} />
                    </TouchableOpacity>
                    {item.level ? (
                      <View style={styles.levelPill}>
                        <Text style={styles.levelPillText}>{item.level}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.notebookDefinition}>{item.definition}</Text>
                  <Text style={styles.notebookStats}>
                    Errors: {item.errors}  |  Known: {item.known}  |  Unknown: {item.unknown}
                  </Text>
                  {item.collocation ? (
                    <Text style={styles.notebookMeta}>Collocation: {item.collocation}</Text>
                  ) : null}
                  {item.preposition ? (
                    <Text style={styles.notebookMeta}>Preposition: {item.preposition}</Text>
                  ) : null}
                  {item.family?.length ? (
                    <Text style={styles.notebookMeta}>Family: {item.family.join(', ')}</Text>
                  ) : null}
                  {item.weeks?.length ? (
                    <Text style={styles.notebookMeta}>Weeks: {item.weeks.join(', ')}</Text>
                  ) : null}
                  <View style={styles.actionRow}>
                    <Button label="Add to My Words" variant="secondary" onPress={() => addUserWord(item.word)} />
                  </View>
                </Card>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.comboNotebookGrid, isWide && styles.comboNotebookGridWide]}>
          <View style={[styles.comboNotebookPanel, isWide && styles.comboNotebookPanelWide]}>
            <Text style={styles.miniHeading}>Top Mistaken Collocations</Text>
            <Text style={styles.sectionSub}>
              These collocations are causing the most errors across your weekly sets.
            </Text>
            {mistakenCollocations.length === 0 ? (
              <Text style={styles.sectionSub}>No collocation mistakes saved yet.</Text>
            ) : (
              mistakenCollocations.map((item) => (
                <View key={`collocation-${item.key}`} style={styles.comboNotebookItem}>
                  <TouchableOpacity style={styles.wordChip} onPress={() => speakWord(item.label)}>
                    <Text style={styles.wordChipText}>{item.label}</Text>
                    <Ionicons name="volume-high-outline" size={14} color={colors.primaryDark} />
                  </TouchableOpacity>
                  <Text style={styles.notebookDefinition}>{item.definition}</Text>
                  <Text style={styles.notebookStats}>Mistakes: {item.count}</Text>
                  <Text style={styles.notebookMeta}>
                    Core word: {item.word} {item.level ? `| ${item.level}` : ''}
                  </Text>
                  {item.weeks?.length ? (
                    <Text style={styles.notebookMeta}>Weeks: {item.weeks.join(', ')}</Text>
                  ) : null}
                  <View style={styles.actionRow}>
                    <Button label="Add Word" variant="secondary" onPress={() => addUserWord(item.word)} />
                  </View>
                </View>
              ))
            )}
          </View>

        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#0F3A8C',
    borderColor: '#0F3A8C',
  },
  heroHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  flexOne: {
    flex: 1,
  },
  heroTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  heroSub: {
    color: '#D9E7FF',
    fontSize: typography.small,
    lineHeight: 20,
  },
  heroBadge: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: typography.fontHeadline,
  },
  heroBadgeLabel: {
    color: '#D9E7FF',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  metricBox: {
    flex: 1,
    minWidth: 120,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: typography.fontHeadline,
  },
  metricLabel: {
    color: '#D9E7FF',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSub: {
    color: colors.muted,
    fontSize: typography.small,
    marginBottom: spacing.sm,
    lineHeight: 19,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stageGrid: {
    gap: spacing.sm,
  },
  stageGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stageCard: {
    borderWidth: 1,
    borderColor: '#D7E2F4',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: spacing.md,
  },
  stageCardWide: {
    width: '19%',
    minWidth: 120,
  },
  stageCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF4FF',
  },
  stageCardRecommended: {
    borderColor: '#93C5FD',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stageLevel: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  stageLevelActive: {
    color: colors.primary,
  },
  stageRange: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  stageRangeActive: {
    color: colors.primaryDark,
  },
  stageMeta: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  stageMetaActive: {
    color: '#355273',
  },
  weekGrid: {
    gap: spacing.sm,
  },
  weekGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weekCard: {
    borderWidth: 1,
    borderColor: '#D7E2F4',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: spacing.md,
  },
  weekCardWide: {
    width: '49%',
  },
  weekCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF4FF',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weekEyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  weekEyebrowActive: {
    color: colors.primary,
  },
  weekTitle: {
    fontSize: 18,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  weekTitleActive: {
    color: colors.primaryDark,
  },
  weekGoal: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
  },
  weekGoalActive: {
    color: '#355273',
  },
  weekMastery: {
    marginTop: spacing.sm,
    color: colors.primaryDark,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  weekMasteryActive: {
    color: colors.primary,
  },
  weekProgressLine: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  weekProgressLineActive: {
    color: '#355273',
  },
  recommendedPill: {
    backgroundColor: '#E8F1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recommendedPillText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontFamily: typography.fontHeadline,
  },
  focusWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  focusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E6FA',
  },
  focusPillActive: {
    backgroundColor: '#DCE8FF',
    borderColor: '#B6CCF8',
  },
  focusPillText: {
    color: '#355273',
    fontSize: 12,
  },
  focusPillTextActive: {
    color: colors.primaryDark,
  },
  planHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  masteryBadge: {
    minWidth: 78,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
  },
  masteryBadgeValue: {
    color: colors.primaryDark,
    fontSize: 22,
    fontFamily: typography.fontHeadline,
  },
  masteryBadgeLabel: {
    color: colors.muted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  progressStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressStripItem: {
    flex: 1,
    minWidth: 116,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E2F4',
  },
  progressStripValue: {
    fontSize: 16,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  progressStripLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  mixRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  mixBox: {
    flex: 1,
    minWidth: 132,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mixValue: {
    fontSize: 20,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  mixLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },
  miniHeading: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  focusWordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dayGrid: {
    gap: spacing.sm,
  },
  dayGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCard: {
    borderWidth: 1,
    borderColor: '#D7E2F4',
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#F8FBFF',
  },
  dayCardWide: {
    width: '49%',
  },
  dayCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#EDF3FF',
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  dayPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    backgroundColor: '#F4F7FC',
    borderWidth: 1,
    borderColor: '#D7E2F4',
    minWidth: 92,
  },
  dayPillActive: {
    backgroundColor: '#EDF3FF',
    borderColor: '#A9C3F5',
  },
  dayPillText: {
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontSize: typography.small,
  },
  dayPillTextActive: {
    color: colors.primary,
  },
  dayModeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E2F4',
  },
  dayModeBadgeActive: {
    backgroundColor: '#DCE8FF',
    borderColor: '#B6CCF8',
  },
  dayModeBadgeText: {
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontSize: 11,
  },
  dayModeBadgeTextActive: {
    color: colors.primary,
  },
  dayCardTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
  },
  dayCardTitleActive: {
    color: colors.primaryDark,
  },
  dayCardBody: {
    marginTop: 4,
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19,
  },
  dayCardBodyActive: {
    color: '#355273',
  },
  dayPillMeta: {
    marginTop: 2,
    color: colors.muted,
    fontSize: typography.xsmall,
  },
  dayPillMetaActive: {
    color: colors.primaryDark,
  },
  wordChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: '#EDF3FF',
    borderWidth: 1,
    borderColor: '#C9DAF9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  wordChipText: {
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  prepList: {
    gap: spacing.xs,
  },
  prepItem: {
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prepPhrase: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  prepNote: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  workflowGrid: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  workflowGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  workflowCard: {
    borderWidth: 1,
    borderColor: '#D7E2F4',
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: '#FBFDFF',
  },
  workflowCardWide: {
    width: '49%',
  },
  workflowTitle: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  workflowBody: {
    fontSize: typography.small,
    color: colors.muted,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  quizCard: {
    backgroundColor: '#FBFDFF',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quizProgress: {
    color: colors.muted,
    fontSize: typography.small,
  },
  quizTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#EDF3FF',
  },
  quizTypeText: {
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontSize: 11,
  },
  quizPrompt: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  quizInstruction: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  quizCueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  quizCuePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#D4E1F5',
  },
  quizCueLabel: {
    color: colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  quizCueValue: {
    marginTop: 2,
    color: colors.primaryDark,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  promptFrameBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E1F5',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  promptFrameText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  promptBlank: {
    minWidth: 112,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: '#EDF3FF',
    borderWidth: 1,
    borderColor: '#BFD2F4',
    alignItems: 'center',
  },
  promptBlankText: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  answerPanel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E1F5',
    gap: spacing.xs,
  },
  answerLabel: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  answerHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF4FF',
    alignSelf: 'flex-start',
  },
  answerHelperText: {
    color: colors.primaryDark,
    fontSize: typography.small,
  },
  answerInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#C9DAF9',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FBFDFF',
    color: colors.text,
    fontSize: typography.body,
  },
  answerInputCorrect: {
    borderColor: '#1F8B4C',
    backgroundColor: '#E8F8EE',
  },
  answerInputWrong: {
    borderColor: '#C13F3F',
    backgroundColor: '#FFF0F0',
  },
  answerMeta: {
    color: colors.muted,
    fontSize: typography.xsmall,
    lineHeight: 17,
  },
  optionList: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#D4E1F5',
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#94B4F5',
    backgroundColor: '#EEF4FF',
  },
  optionCorrect: {
    borderColor: '#1F8B4C',
    backgroundColor: '#E8F8EE',
  },
  optionWrong: {
    borderColor: '#C13F3F',
    backgroundColor: '#FFF0F0',
  },
  optionText: {
    fontSize: typography.body,
    color: colors.text,
  },
  feedbackBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackGood: {
    color: '#1F8B4C',
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  feedbackBad: {
    color: '#B42318',
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  feedbackText: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19,
  },
  summaryCard: {
    backgroundColor: '#F9FBFF',
  },
  summaryScore: {
    fontSize: typography.h2,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  summaryMeta: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  summaryBox: {
    flex: 1,
    minWidth: 120,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E1F5',
  },
  summaryBoxValue: {
    fontSize: 18,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  summaryBoxLabel: {
    color: colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  notebookHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  notebookGrid: {
    gap: spacing.xs,
  },
  notebookGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  notebookItemWrap: {
    width: '100%',
  },
  notebookItemWrapWide: {
    width: '49%',
  },
  notebookCard: {
    marginBottom: 0,
  },
  comboNotebookGrid: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  comboNotebookGridWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  comboNotebookPanel: {
    borderWidth: 1,
    borderColor: '#D7E2F4',
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: '#F9FBFF',
  },
  comboNotebookPanelWide: {
    width: '49%',
  },
  comboNotebookItem: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E6EDF8',
  },
  notebookWordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notebookDefinition: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 19,
  },
  notebookStats: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: 12,
    fontFamily: typography.fontHeadline,
  },
  notebookMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  levelPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#0F3A8C',
  },
  levelPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: typography.fontHeadline,
  },
});
