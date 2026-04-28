import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { useAppState } from '../context/AppState';
import { colors, radius, shadow, spacing, typography } from '../theme/tokens';
import { generateSpeakingCoachReply, isDemoAiConfigured } from '../utils/demoAi';
import { analyzeSpeakingResponse } from '../utils/speakingCoach';
import { evaluateSpeakingModel } from '../utils/speakingModel';
import { loadSpeakingPartnerSessions, saveSpeakingPartnerSessions } from '../utils/appStorage';
import { speakEnglish, stopEnglishTts } from '../utils/ttsEnglish';
import voiceEngine from '../utils/speechRecognition';

const isWeb = Platform.OS === 'web';

const MODE_META = [
  { key: 'opinion', label: 'Opinion', icon: 'chatbubble-ellipses-outline' },
  { key: 'comparison', label: 'Compare', icon: 'git-compare-outline' },
  { key: 'campus', label: 'Campus', icon: 'school-outline' },
  { key: 'academic', label: 'Academic', icon: 'library-outline' },
];

const PROMPT_LIBRARY = {
  opinion: [
    {
      id: 'opinion_1',
      title: 'Attendance Policy',
      prompt: 'Should university attendance be compulsory in all courses? Give your opinion and support it with one reason and one example.',
      time: '1',
      vocab: ['compulsory', 'participation', 'flexibility', 'engagement'],
      frame: 'State your opinion -> give one reason -> add one example -> close clearly.',
      followUp: 'Now answer again and add one counter-argument before your conclusion.',
    },
    {
      id: 'opinion_2',
      title: 'AI in Education',
      prompt: 'Do you think AI tools improve university learning, or do they make students too dependent? Defend one side.',
      time: '1',
      vocab: ['dependency', 'efficiency', 'critical thinking', 'guidance'],
      frame: 'Give your stance -> explain impact -> use one academic example -> conclude.',
      followUp: 'Add one sentence about a possible risk or limitation.',
    },
    {
      id: 'opinion_3',
      title: 'Part-Time Work',
      prompt: 'Should first-year university students work part-time while studying? Explain your view.',
      time: '1',
      vocab: ['balance', 'responsibility', 'financial pressure', 'performance'],
      frame: 'Opinion -> main reason -> real-life example -> recommendation.',
      followUp: 'Repeat the answer with a clearer recommendation at the end.',
    },
  ],
  comparison: [
    {
      id: 'comparison_1',
      title: 'Online vs On-Campus',
      prompt: 'Compare online classes with face-to-face classes. Which one is more effective for language learning?',
      time: '1',
      vocab: ['interaction', 'feedback', 'motivation', 'convenience'],
      frame: 'Mention both sides -> compare two points -> choose one -> justify briefly.',
      followUp: 'Answer again, but make the contrast between the two formats clearer.',
    },
    {
      id: 'comparison_2',
      title: 'City vs Campus Life',
      prompt: 'Compare living in a busy city with living on a quiet university campus for a prep student.',
      time: '1',
      vocab: ['distraction', 'community', 'accessibility', 'routine'],
      frame: 'Introduce both options -> compare environment and study routine -> finish with a choice.',
      followUp: 'Now add one sentence about cost or convenience.',
    },
    {
      id: 'comparison_3',
      title: 'Group Study vs Solo Study',
      prompt: 'Compare studying alone with studying in a group. Which works better before an English exam?',
      time: '1',
      vocab: ['accountability', 'focus', 'collaboration', 'revision'],
      frame: 'Compare two methods -> evaluate one benefit and one weakness -> conclude with preference.',
      followUp: 'Use at least one connector such as however, therefore, or for example.',
    },
  ],
  campus: [
    {
      id: 'campus_1',
      title: 'Dormitory Rules',
      prompt: 'What is one dormitory rule that should change for university students, and why?',
      time: '1',
      vocab: ['curfew', 'independence', 'fairness', 'well-being'],
      frame: 'Name the rule -> explain the problem -> give one realistic change -> conclude.',
      followUp: 'Repeat with one concrete example from student life.',
    },
    {
      id: 'campus_2',
      title: 'Club Participation',
      prompt: 'How can student clubs help prep students improve their English outside class?',
      time: '1',
      vocab: ['exposure', 'confidence', 'participation', 'networking'],
      frame: 'Main claim -> two benefits -> example -> closing takeaway.',
      followUp: 'Add one sentence about confidence or speaking fluency.',
    },
    {
      id: 'campus_3',
      title: 'Orientation Week',
      prompt: 'What should be included in a good orientation week for new prep students?',
      time: '1',
      vocab: ['transition', 'support', 'workload', 'adaptation'],
      frame: 'Introduce goal -> mention two essentials -> explain why they matter -> conclude.',
      followUp: 'Try again and make the structure more organized with signposts.',
    },
  ],
  academic: [
    {
      id: 'academic_1',
      title: 'Climate Policy',
      prompt: 'Why is individual action not enough to solve climate change? Give a short academic-style response.',
      time: '1',
      vocab: ['policy', 'collective action', 'implementation', 'evidence'],
      frame: 'Thesis -> one reason -> one example -> concise conclusion.',
      followUp: 'Answer again and use at least one academic connector.',
    },
    {
      id: 'academic_2',
      title: 'Research Skills',
      prompt: 'Why is evaluating sources important in academic research?',
      time: '1',
      vocab: ['credibility', 'bias', 'evidence', 'reliability'],
      frame: 'State the importance -> explain one risk -> give a research example -> conclude.',
      followUp: 'Add one sentence about misinformation or weak evidence.',
    },
    {
      id: 'academic_3',
      title: 'Technology and Attention',
      prompt: 'How does constant phone use affect students’ attention in class?',
      time: '1',
      vocab: ['attention span', 'retention', 'distraction', 'productivity'],
      frame: 'Introduce effect -> explain mechanism -> give one example -> final judgement.',
      followUp: 'Now answer again with a stronger concluding sentence.',
    },
  ],
};

const FILLER_WORDS = ['like', 'you know', 'basically', 'actually', 'i mean', 'kind of', 'sort of'];
const INTRO_MESSAGE = 'Choose a prompt, record one answer, then evaluate it. The coach now gives a rubric-based score, not just a generic reply.';
const PRONUNCIATION_PATTERNS = [
  {
    key: 'th',
    regex: /th/,
    label: '/th/',
    tip: "Tongue slightly forward between teeth: 'think', 'though', 'through'.",
  },
  {
    key: 'v_w',
    regex: /(v|w)/,
    label: '/v/ vs /w/',
    tip: "Keep /v/ (teeth+lip) separate from /w/ (rounded lips).",
  },
  {
    key: 'ed',
    regex: /ed$/,
    label: '-ed ending',
    tip: "Finish past forms clearly: 'worked', 'wanted', 'lived'.",
  },
  {
    key: 'tion',
    regex: /tion$/,
    label: '-tion ending',
    tip: "Stress the syllable before '-tion': eduCAtion, soluTION.",
  },
  {
    key: 'r_l',
    regex: /(r|l).*(r|l)/,
    label: '/r/ & /l/',
    tip: "Contrast tongue placement in minimal pairs: 'light/right', 'glass/grass'.",
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSpeechText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function tokenizeSpeechWords(text = '') {
  return normalizeSpeechText(text)
    .toLowerCase()
    .match(/[a-z']+/g) || [];
}

function collapseRepeatedChunks(words = []) {
  if (!Array.isArray(words) || !words.length) return [];
  let current = words.slice();
  for (let pass = 0; pass < 3; pass += 1) {
    const output = [];
    let index = 0;
    while (index < current.length) {
      let consumed = false;
      const maxChunk = Math.min(8, Math.floor((current.length - index) / 2));
      for (let size = maxChunk; size >= 2; size -= 1) {
        let same = true;
        for (let offset = 0; offset < size; offset += 1) {
          if (current[index + offset] !== current[index + size + offset]) {
            same = false;
            break;
          }
        }
        if (same) {
          output.push(...current.slice(index, index + size));
          index += size * 2;
          consumed = true;
          break;
        }
      }
      if (!consumed) {
        output.push(current[index]);
        index += 1;
      }
    }
    const deduped = output.filter((word, idx) => word && word !== output[idx - 1]);
    if (deduped.join(' ') === current.join(' ')) break;
    current = deduped;
  }
  return current;
}

function dedupeSpeechDraft(text = '') {
  const normalized = normalizeSpeechText(text);
  if (!normalized) return '';
  const words = normalized.split(/\s+/).filter(Boolean);
  const collapsed = collapseRepeatedChunks(words);
  return normalizeSpeechText(collapsed.join(' '));
}

function cleanList(list = []) {
  if (!Array.isArray(list)) return [];
  return Array.from(new Set(list.map((item) => normalizeSpeechText(item)).filter(Boolean)));
}

function pickBestSpeechResult(values = []) {
  const list = Array.isArray(values) ? values.map((item) => dedupeSpeechDraft(item)).filter(Boolean) : [];
  if (!list.length) return '';
  return list.sort((a, b) => tokenizeSpeechWords(b).length - tokenizeSpeechWords(a).length)[0];
}

function getWordCount(text = '') {
  return (String(text || '').trim().match(/\b[\w']+\b/g) || []).length;
}

function buildFluencyStats(text = '', elapsedSec = 0) {
  const words = getWordCount(text);
  const minutes = Math.max(1 / 60, Number(elapsedSec || 0) / 60);
  const wpm = Math.round(words / minutes);
  const lower = String(text || '').toLowerCase();
  const fillerCount = FILLER_WORDS.reduce((sum, filler) => {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return sum + ((lower.match(new RegExp(`\\b${escaped}\\b`, 'g')) || []).length);
  }, 0);
  const sentenceCount = String(text || '')
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
  return { words, wpm, fillerCount, sentenceCount };
}

function buildFluencyTimeline(text = '', elapsedSec = 0) {
  const tokens = tokenizeSpeechWords(text);
  if (!tokens.length) return [];
  const totalSec = Math.max(20, Number(elapsedSec || 0));
  const segmentCount = Math.max(2, Math.min(6, Math.ceil(totalSec / 15)));
  const chunkSize = Math.max(1, Math.ceil(tokens.length / segmentCount));
  const segmentSec = totalSec / segmentCount;
  const timeline = [];
  for (let index = 0; index < segmentCount; index += 1) {
    const startWord = index * chunkSize;
    if (startWord >= tokens.length) break;
    const segmentWords = tokens.slice(startWord, startWord + chunkSize);
    const wpm = Math.round(segmentWords.length / Math.max(1 / 60, segmentSec / 60));
    const fillerCount = FILLER_WORDS.reduce((sum, filler) => {
      const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return sum + ((segmentWords.join(' ').match(new RegExp(`\\b${escaped}\\b`, 'g')) || []).length);
    }, 0);
    timeline.push({
      id: `slot_${index}`,
      label: `${Math.round(index * segmentSec)}-${Math.round((index + 1) * segmentSec)}s`,
      words: segmentWords.length,
      wpm,
      fillerCount,
      quality: wpm >= 85 && wpm <= 155 && fillerCount <= 1 ? 'stable' : wpm < 85 ? 'slow' : 'fast',
    });
  }
  return timeline;
}

function buildPronunciationHotspots(text = '') {
  const words = Array.from(new Set(tokenizeSpeechWords(text))).filter((item) => item.length >= 4);
  if (!words.length) return [];
  const hotspots = [];
  words.forEach((word) => {
    PRONUNCIATION_PATTERNS.forEach((pattern) => {
      if (!pattern.regex.test(word)) return;
      hotspots.push({
        id: `${pattern.key}-${word}`,
        word,
        pattern: pattern.label,
        tip: pattern.tip,
        severity: word.length >= 10 ? 'high' : word.length >= 7 ? 'medium' : 'light',
      });
    });
  });
  const severityWeight = { high: 3, medium: 2, light: 1 };
  return hotspots
    .sort((a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0))
    .slice(0, 8);
}

function buildSelfCheck(text = '', feedback = null) {
  const lower = String(text || '').toLowerCase();
  return {
    thesis: /\b(i think|i believe|in my opinion|i would argue|i agree|i disagree)\b/.test(lower),
    example: /\b(for example|for instance|such as|example)\b/.test(lower),
    connector: Number(feedback?.connectorCount || 0) > 0,
    conclusion: /\b(in conclusion|overall|to sum up|therefore|as a result)\b/.test(lower),
  };
}

function buildPromptRubric(text = '', feedback = null, selfCheck = {}, fluency = {}, prompt = null) {
  const taskCoverage = clamp(
    (feedback?.lengthOk ? 2 : 1) +
      (selfCheck.thesis ? 1 : 0) +
      (selfCheck.example ? 1 : 0) +
      (selfCheck.conclusion ? 1 : 0),
    0,
    5
  );
  const organization = clamp(
    (feedback?.connectorCount >= 2 ? 2 : feedback?.connectorCount >= 1 ? 1 : 0) +
      (selfCheck.connector ? 1 : 0) +
      (fluency?.sentenceCount >= 3 ? 1 : 0) +
      ((feedback?.usedConnectors || []).length >= 2 ? 1 : 0),
    0,
    5
  );
  const lexicalControl = clamp(
    (feedback?.academicCount >= 2 ? 2 : feedback?.academicCount >= 1 ? 1 : 0) +
      (feedback?.vocabMatches >= 2 ? 2 : feedback?.vocabMatches >= 1 ? 1 : 0) +
      (feedback?.weakCount === 0 ? 1 : 0),
    0,
    5
  );
  const fluencyDelivery = clamp(
    ((fluency?.wpm >= 85 && fluency?.wpm <= 155) ? 2 : 1) +
      (fluency?.fillerCount <= 1 ? 2 : fluency?.fillerCount <= 3 ? 1 : 0) +
      (Number(prompt?.time || 1) <= 1 || Number(fluency?.words || 0) >= 35 ? 1 : 0),
    0,
    5
  );
  return {
    total: taskCoverage + organization + lexicalControl + fluencyDelivery,
    max: 20,
  };
}

function buildTurnAnalysis({ text = '', prompt = null, ai = null, elapsedSec = 0 }) {
  const feedback = analyzeSpeakingResponse(text, {
    time: String(prompt?.time || '1'),
    vocab: Array.isArray(prompt?.vocab) ? prompt.vocab : [],
  });
  const fluency = buildFluencyStats(text, elapsedSec);
  const timeline = buildFluencyTimeline(text, elapsedSec);
  const hotspots = buildPronunciationHotspots(text);
  const selfCheck = buildSelfCheck(text, feedback);
  const rubric = buildPromptRubric(text, feedback, selfCheck, fluency, prompt);
  const model = evaluateSpeakingModel({
    feedback,
    rubric,
    fluency,
    selfCheck,
    elapsedSec,
  });

  const strengths = cleanList([...(ai?.strengths || []), ...(feedback?.strengths || [])]).slice(0, 3);
  const improvements = cleanList([...(ai?.improvements || []), ...(feedback?.improvements || [])]).slice(0, 3);
  const drills = cleanList([
    ...(ai?.drills || []),
    ...(model?.actions || []),
    feedback?.missingConnectors?.[0]
      ? `Use ${feedback.missingConnectors[0]} in your next answer.`
      : '',
  ]).slice(0, 3);

  return {
    feedback,
    fluency,
    selfCheck,
    rubric,
    model,
    strengths: strengths.length ? strengths : ['The response covers the prompt and can now be sharpened.'],
    improvements: improvements.length ? improvements : ['Make the structure clearer with one reason, one example, and one conclusion.'],
    drills: drills.length ? drills : ['Repeat the same prompt in 45 seconds and keep the structure tighter.'],
    nextPrompt: normalizeSpeechText(ai?.nextPrompt || prompt?.followUp || ''),
    timeline,
    hotspots,
  };
}

function deriveWeakestDimension(dimensions = {}) {
  const entries = Object.entries(dimensions)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => a[1] - b[1]);
  if (!entries.length) return null;
  const [key, value] = entries[0];
  return {
    key,
    value,
    label:
      key === 'fluency'
        ? 'Fluency'
        : key === 'coherence'
          ? 'Coherence'
          : key === 'lexicalRange'
            ? 'Lexical Range'
            : key === 'rubricAlignment'
              ? 'Task Fit'
              : 'Stamina',
  };
}

function buildSessionRecord({ mode, prompt, transcript, analysis, source }) {
  const weakest = deriveWeakestDimension(analysis?.model?.dimensions || {});
  return {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    mode,
    promptId: prompt?.id,
    promptTitle: prompt?.title,
    transcript: String(transcript || '').slice(0, 240),
    overall: Number(analysis?.model?.overall || 0),
    band: analysis?.model?.band || '',
    source: source || 'offline',
    weakestDimension: weakest?.label || '',
  };
}

function MetricPill({ label, value, tone = 'neutral' }) {
  const toneStyle = tone === 'accent' ? styles.metricPillAccent : tone === 'warning' ? styles.metricPillWarning : styles.metricPillNeutral;
  return (
    <View style={[styles.metricPill, toneStyle]}>
      <Text style={styles.metricPillLabel}>{label}</Text>
      <Text style={styles.metricPillValue}>{value}</Text>
    </View>
  );
}

function ScoreBar({ label, value }) {
  return (
    <View style={styles.scoreBarBlock}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={styles.scoreBarValue}>{value}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${clamp(Number(value || 0), 0, 100)}%` }]} />
      </View>
    </View>
  );
}

function MessageBubble({ item }) {
  const isUser = item.role === 'user';
  const analysis = item.analysis;
  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAI]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        {!isUser ? <Ionicons name="sparkles" size={14} color={colors.primaryDark} style={styles.aiIcon} /> : null}
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
      </View>
      {analysis ? (
        <Card style={styles.analysisCard}>
          <View style={styles.analysisTopRow}>
            <View>
              <Text style={styles.analysisTitle}>Turn Evaluation</Text>
              <Text style={styles.analysisSubtitle}>{analysis.model.band}</Text>
            </View>
            <View style={styles.analysisScoreBadge}>
              <Text style={styles.analysisScoreValue}>{analysis.model.overall}</Text>
              <Text style={styles.analysisScoreLabel}>/100</Text>
            </View>
          </View>

          <View style={styles.metricPillRow}>
            <MetricPill label="Words" value={analysis.fluency.words} tone="neutral" />
            <MetricPill label="WPM" value={analysis.fluency.wpm} tone="accent" />
            <MetricPill label="Fillers" value={analysis.fluency.fillerCount} tone={analysis.fluency.fillerCount > 2 ? 'warning' : 'neutral'} />
            <MetricPill label="Connectors" value={analysis.feedback.connectorCount} tone="accent" />
          </View>

          <ScoreBar label="Fluency" value={analysis.model.dimensions.fluency} />
          <ScoreBar label="Coherence" value={analysis.model.dimensions.coherence} />
          <ScoreBar label="Lexical Range" value={analysis.model.dimensions.lexicalRange} />

          {analysis.timeline?.length ? (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>Fluency Timeline</Text>
              <View style={styles.timelineWrap}>
                {analysis.timeline.map((slot) => (
                  <View key={slot.id} style={styles.timelineRow}>
                    <View style={styles.timelineHead}>
                      <Text style={styles.timelineLabel}>{slot.label}</Text>
                      <Text style={styles.timelineMeta}>
                        {slot.wpm} WPM · {slot.fillerCount} filler
                      </Text>
                    </View>
                    <View style={styles.timelineTrack}>
                      <View
                        style={[
                          styles.timelineFill,
                          slot.quality === 'stable'
                            ? styles.timelineFillStable
                            : slot.quality === 'slow'
                              ? styles.timelineFillSlow
                              : styles.timelineFillFast,
                          { width: `${Math.max(12, Math.min(100, Math.round((slot.wpm / 170) * 100)))}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {analysis.hotspots?.length ? (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>Pronunciation Hotspots</Text>
              {analysis.hotspots.map((hotspot) => (
                <View key={hotspot.id} style={styles.hotspotRow}>
                  <View style={[styles.hotspotBadge, hotspot.severity === 'high' ? styles.hotspotBadgeHigh : hotspot.severity === 'medium' ? styles.hotspotBadgeMedium : styles.hotspotBadgeLight]}>
                    <Text style={styles.hotspotBadgeText}>{hotspot.pattern}</Text>
                  </View>
                  <View style={styles.hotspotBody}>
                    <Text style={styles.hotspotWord}>{hotspot.word}</Text>
                    <Text style={styles.hotspotTip}>{hotspot.tip}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}

          <Text style={styles.sectionLabel}>Strengths</Text>
          {analysis.strengths.map((itemText) => (
            <Text key={`strength-${item.id}-${itemText}`} style={styles.listText}>• {itemText}</Text>
          ))}

          <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>Fix Next</Text>
          {analysis.improvements.map((itemText) => (
            <Text key={`fix-${item.id}-${itemText}`} style={styles.listText}>• {itemText}</Text>
          ))}

          <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>Drill</Text>
          {analysis.drills.map((itemText) => (
            <Text key={`drill-${item.id}-${itemText}`} style={styles.listText}>• {itemText}</Text>
          ))}

          {analysis.nextPrompt ? (
            <View style={styles.followUpBox}>
              <Text style={styles.followUpLabel}>Follow-up</Text>
              <Text style={styles.followUpText}>{analysis.nextPrompt}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

export default function AISpeakingPartnerScreen({ navigation, route }) {
  const initialMode = MODE_META.some((item) => item.key === route?.params?.initialMode)
    ? route.params.initialMode
    : 'opinion';
  const [mode, setMode] = useState(initialMode);
  const [promptCursor, setPromptCursor] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([
    { id: 'intro', role: 'ai', text: INTRO_MESSAGE },
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const [micVol, setMicVol] = useState(0);
  const [replySource, setReplySource] = useState(isDemoAiConfigured('speaking') ? 'online-ready' : 'local');
  const [savedSessions, setSavedSessions] = useState([]);

  const { addXp } = useAppState();
  const waveAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  const transcriptRef = useRef('');
  const startAtRef = useRef(0);
  const lastSubmittedRef = useRef('');
  const conversationRef = useRef(conversation);
  const scrollRef = useRef(null);

  const promptPool = useMemo(() => PROMPT_LIBRARY[mode] || PROMPT_LIBRARY.opinion, [mode]);
  const activePrompt = promptPool[promptCursor % promptPool.length] || PROMPT_LIBRARY.opinion[0];

  const turnAnalyses = useMemo(
    () => conversation.filter((item) => item.role === 'ai' && item.analysis).map((item) => item.analysis),
    [conversation]
  );

  const sessionSummary = useMemo(() => {
    if (!turnAnalyses.length) {
      return {
        turns: 0,
        average: 0,
        weakest: null,
      };
    }
    const average = Math.round(
      turnAnalyses.reduce((sum, item) => sum + Number(item?.model?.overall || 0), 0) / turnAnalyses.length
    );
    const dimensionTotals = turnAnalyses.reduce(
      (acc, item) => {
        Object.entries(item?.model?.dimensions || {}).forEach(([key, value]) => {
          acc[key] = (acc[key] || 0) + Number(value || 0);
        });
        return acc;
      },
      {}
    );
    const averagedDimensions = Object.fromEntries(
      Object.entries(dimensionTotals).map(([key, value]) => [key, Math.round(value / turnAnalyses.length)])
    );
    return {
      turns: turnAnalyses.length,
      average,
      weakest: deriveWeakestDimension(averagedDimensions),
    };
  }, [turnAnalyses]);

  const lastSavedSession = savedSessions[0] || null;

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    conversationRef.current = conversation;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    });
  }, [conversation, aiTyping, transcript]);

  useEffect(() => {
    let mounted = true;
    loadSpeakingPartnerSessions().then((items) => {
      if (mounted) setSavedSessions(Array.isArray(items) ? items : []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isListening) {
      waveAnims.forEach((anim) => {
        Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: !isWeb }).start();
      });
      return undefined;
    }

    const interval = setInterval(() => {
      waveAnims.forEach((anim) => {
        const target = 1 + Math.random() * Math.max(0.4, micVol / 8);
        Animated.timing(anim, { toValue: target, duration: 110, useNativeDriver: !isWeb }).start();
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isListening, micVol, waveAnims]);

  useEffect(() => {
    voiceEngine.onSpeechStart = () => {
      setIsListening(true);
      startAtRef.current = Date.now();
    };
    voiceEngine.onSpeechEnd = () => {
      setIsListening(false);
    };
    voiceEngine.onSpeechError = (event) => {
      setIsListening(false);
      const code = String(event?.error?.code || '');
      if (code && code !== '7') {
        console.log('Voice Error:', event);
      }
    };
    voiceEngine.onSpeechPartialResults = (event) => {
      const recognized = pickBestSpeechResult(event?.value);
      const cleaned = dedupeSpeechDraft(recognized);
      if (cleaned) {
        setTranscript(cleaned);
        transcriptRef.current = cleaned;
      }
    };
    voiceEngine.onSpeechResults = (event) => {
      const recognized = pickBestSpeechResult(event?.value);
      const cleaned = dedupeSpeechDraft(recognized);
      if (cleaned) {
        setTranscript(cleaned);
        transcriptRef.current = cleaned;
      }
    };
    voiceEngine.onSpeechVolumeChanged = (event) => setMicVol(Number(event?.value || 0));

    return () => {
      try {
        voiceEngine.destroy();
        voiceEngine.removeAllListeners();
      } catch (_) {
        // noop
      }
      stopEnglishTts();
    };
  }, []);

  const speakPrompt = useCallback(async () => {
    await speakEnglish(activePrompt.prompt, { rate: 0.47 });
  }, [activePrompt]);

  const cyclePrompt = useCallback(() => {
    setTranscript('');
    transcriptRef.current = '';
    lastSubmittedRef.current = '';
    setPromptCursor((current) => current + 1);
  }, []);

  const startListening = useCallback(async () => {
    if (aiTyping) return;
    setTranscript('');
    transcriptRef.current = '';
    try {
      await stopEnglishTts();
      await voiceEngine.start('en-US');
    } catch (error) {
      console.log(error);
      Alert.alert('Microphone Error', 'Speech recognition could not start. Is your microphone enabled? Browsers like Safari/Firefox might have limited support.');
    }
  }, [aiTyping]);

  const stopListening = useCallback(async () => {
    try {
      await voiceEngine.stop();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const resetSession = useCallback(() => {
    setConversation([{ id: 'intro', role: 'ai', text: INTRO_MESSAGE }]);
    setTranscript('');
    transcriptRef.current = '';
    lastSubmittedRef.current = '';
    stopEnglishTts();
  }, []);

  const submitTurn = useCallback(async () => {
    const spokenText = dedupeSpeechDraft(transcriptRef.current);
    if (!spokenText) {
      Alert.alert('No answer yet', 'Record a response first, then evaluate the turn.');
      return;
    }
    if (spokenText === lastSubmittedRef.current) {
      setTranscript('');
      transcriptRef.current = '';
      return;
    }

    lastSubmittedRef.current = spokenText;
    setTranscript('');
    transcriptRef.current = '';

    const userMessage = {
      id: `${Date.now()}_user`,
      role: 'user',
      text: spokenText,
    };
    setConversation((prev) => [...prev, userMessage]);
    setAiTyping(true);

    const elapsedSec = Math.max(15, Math.round((Date.now() - (startAtRef.current || Date.now())) / 1000));

    try {
      const ai = await generateSpeakingCoachReply({
        text: `Prompt: ${activePrompt.prompt}\nAnswer: ${spokenText}`,
        history: [...conversationRef.current.slice(-6), userMessage],
      });
      const analysis = buildTurnAnalysis({
        text: spokenText,
        prompt: activePrompt,
        ai,
        elapsedSec,
      });
      const coachMessage = {
        id: `${Date.now()}_ai`,
        role: 'ai',
        text: ai?.text || 'Structured feedback is ready below.',
        analysis,
      };
      setReplySource(ai?.source || 'local-speaking-analysis');
      setConversation((prev) => [...prev, coachMessage]);
      const sessionRecord = buildSessionRecord({
        mode,
        prompt: activePrompt,
        transcript: spokenText,
        analysis,
        source: ai?.source || 'local-speaking-analysis',
      });
      const updatedSessions = [sessionRecord, ...savedSessions].slice(0, 36);
      setSavedSessions(updatedSessions);
      await saveSpeakingPartnerSessions(updatedSessions);
      addXp?.(Math.max(5, Math.round(analysis.model.overall / 15)));
      await speakEnglish(ai?.text || 'Feedback is ready.', { rate: 0.48 });
    } catch (_) {
      setReplySource('local-speaking-analysis');
      setConversation((prev) => [
        ...prev,
        {
          id: `${Date.now()}_fallback`,
          role: 'ai',
          text: 'The coach could not finish this turn. Record the answer again and evaluate once more.',
        },
      ]);
    } finally {
      setAiTyping(false);
      startAtRef.current = 0;
    }
  }, [activePrompt, addXp, mode, savedSessions]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>AI Speaking Partner</Text>
          <Text style={styles.subTitle}>Rubric-based turn feedback • source: {replySource}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} glow>
          <Text style={styles.eyebrow}>Live Coaching Lab</Text>
          <Text style={styles.heroTitle}>One prompt. One response. One score breakdown.</Text>
          <Text style={styles.heroBody}>
            The coach now evaluates fluency, coherence, lexical range, and task fit for every speaking turn.
          </Text>
          <View style={styles.modeWrap}>
            {MODE_META.map((item) => (
              <Chip
                key={item.key}
                label={item.label}
                active={mode === item.key}
                onPress={() => {
                  setMode(item.key);
                  setPromptCursor(0);
                  setTranscript('');
                  transcriptRef.current = '';
                }}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.promptCard}>
          <View style={styles.promptTopRow}>
            <View style={styles.promptHeaderCopy}>
              <Text style={styles.promptEyebrow}>Active prompt</Text>
              <Text style={styles.promptTitle}>{activePrompt.title}</Text>
            </View>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.timeBadgeText}>{activePrompt.time} min</Text>
            </View>
          </View>
          <Text style={styles.promptBody}>{activePrompt.prompt}</Text>
          <View style={styles.frameBox}>
            <Text style={styles.frameLabel}>Answer frame</Text>
            <Text style={styles.frameText}>{activePrompt.frame}</Text>
          </View>
          <View style={styles.promptActions}>
            <Button label="Hear Prompt" variant="secondary" icon="volume-high-outline" onPress={speakPrompt} />
            <Button label="Next Prompt" variant="ghost" icon="refresh-outline" onPress={cyclePrompt} />
          </View>
        </Card>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, styles.summaryCardPrimary]} compact>
            <Text style={[styles.summaryLabel, styles.summaryLabelOnDark]}>Turns</Text>
            <Text style={[styles.summaryValue, styles.summaryValueOnDark]}>{sessionSummary.turns}</Text>
          </Card>
          <Card style={styles.summaryCard} compact>
            <Text style={styles.summaryLabel}>Avg Score</Text>
            <Text style={styles.summaryValue}>{sessionSummary.average || '--'}</Text>
          </Card>
          <Card style={styles.summaryCard} compact>
            <Text style={styles.summaryLabel}>Weakest</Text>
            <Text style={styles.summaryValueSmall}>{sessionSummary.weakest?.label || '—'}</Text>
          </Card>
        </View>

        {lastSavedSession ? (
          <Card style={styles.savedCard}>
            <View style={styles.savedRow}>
              <View>
                <Text style={styles.savedTitle}>Last saved round</Text>
                <Text style={styles.savedSubtitle}>{lastSavedSession.promptTitle} • {lastSavedSession.mode}</Text>
              </View>
              <View style={styles.savedScoreBadge}>
                <Text style={styles.savedScoreValue}>{lastSavedSession.overall}</Text>
                <Text style={styles.savedScoreText}>score</Text>
              </View>
            </View>
            <Text style={styles.savedMeta}>Weak area: {lastSavedSession.weakestDimension || 'Not enough data yet'}</Text>
          </Card>
        ) : null}

        <View style={styles.chatArea}>
          {conversation.map((item) => (
            <MessageBubble key={item.id} item={item} />
          ))}
          {aiTyping ? (
            <View style={[styles.bubbleWrap, styles.bubbleWrapAI]}>
              <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                <Ionicons name="sparkles" size={14} color={colors.primaryDark} style={styles.aiIcon} />
                <Text style={styles.typingText}>Analyzing fluency, coherence, and task fit...</Text>
              </View>
            </View>
          ) : null}
        </View>

        {transcript ? (
          <Card style={styles.transcriptCard}>
            <View style={styles.transcriptTopRow}>
              <Text style={styles.transcriptTitle}>Current turn draft</Text>
              <Text style={styles.transcriptMeta}>{getWordCount(transcript)} words</Text>
            </View>
            <Text style={styles.transcriptText}>{transcript}</Text>
            <View style={styles.transcriptActions}>
              <Button
                label="Clear"
                variant="secondary"
                icon="close-outline"
                onPress={() => {
                  setTranscript('');
                  transcriptRef.current = '';
                }}
              />
              <Button label="Evaluate Turn" icon="analytics-outline" onPress={submitTurn} disabled={aiTyping || isListening} />
            </View>
          </Card>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.micStatusRow}>
          {isListening ? (
            <View style={styles.waveformContainer}>
              {waveAnims.map((anim, index) => (
                <Animated.View
                  key={`wave-${index}`}
                  style={[styles.waveBar, { transform: [{ scaleY: anim }] }]}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.idleText}>Record, stop, then evaluate the turn.</Text>
          )}
        </View>

        <View style={styles.footerActions}>
          <Button
            label="Reset"
            variant="ghost"
            icon="refresh-outline"
            onPress={resetSession}
            disabled={isListening || aiTyping}
          />
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnActive, aiTyping && styles.micBtnDisabled]}
            onPress={isListening ? stopListening : startListening}
            activeOpacity={0.85}
            disabled={aiTyping}
          >
            <Ionicons name={isListening ? 'stop' : 'mic'} size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Button
            label={transcript ? 'Evaluate' : 'Prompt'}
            variant="secondary"
            icon={transcript ? 'analytics-outline' : 'volume-high-outline'}
            onPress={transcript ? submitTurn : speakPrompt}
            disabled={aiTyping || isListening}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: '#D6E0F2',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  subTitle: {
    marginTop: 2,
    fontSize: typography.small,
    color: colors.muted,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 160,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderColor: '#172554',
    marginTop: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.xsmall,
    color: '#93C5FD',
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  heroBody: {
    color: '#CBD5E1',
    fontSize: typography.small,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  modeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  promptCard: {
    marginTop: spacing.sm,
  },
  promptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  promptHeaderCopy: {
    flex: 1,
  },
  promptEyebrow: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  promptTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C7D7F4',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  timeBadgeText: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  promptBody: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  frameBox: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: '#D8E2F3',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  frameLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  frameText: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 20,
  },
  promptActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    marginBottom: 0,
    minHeight: 100,
    justifyContent: 'center',
  },
  summaryCardPrimary: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  summaryLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  summaryLabelOnDark: {
    color: '#BFDBFE',
  },
  summaryValue: {
    fontSize: typography.h2,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  summaryValueOnDark: {
    color: '#FFFFFF',
  },
  summaryValueSmall: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  savedCard: {
    backgroundColor: '#FCFDFE',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  savedTitle: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  savedSubtitle: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 4,
  },
  savedScoreBadge: {
    minWidth: 74,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
  },
  savedScoreValue: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  savedScoreText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savedMeta: {
    fontSize: typography.small,
    color: colors.muted,
  },
  chatArea: {
    marginBottom: spacing.sm,
  },
  bubbleWrap: {
    width: '100%',
    marginBottom: spacing.md,
  },
  bubbleWrapAI: {
    alignItems: 'flex-start',
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '88%',
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadow.elev1,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  aiIcon: {
    marginBottom: spacing.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: typography.small,
    color: colors.muted,
    fontStyle: 'italic',
  },
  analysisCard: {
    width: '100%',
    marginTop: spacing.sm,
    marginBottom: 0,
    backgroundColor: '#FBFDFF',
  },
  analysisTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  analysisTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    fontWeight: '700',
  },
  analysisSubtitle: {
    marginTop: 2,
    fontSize: typography.small,
    color: colors.muted,
  },
  analysisScoreBadge: {
    minWidth: 78,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
  },
  analysisScoreValue: {
    fontSize: typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
  },
  analysisScoreLabel: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
  },
  metricPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
  },
  metricPillNeutral: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D6E0EC',
  },
  metricPillAccent: {
    backgroundColor: colors.primarySoft,
    borderColor: '#C5D6F6',
  },
  metricPillWarning: {
    backgroundColor: colors.warningLight,
    borderColor: '#F2D49F',
  },
  metricPillLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricPillValue: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreBarBlock: {
    marginBottom: spacing.sm,
  },
  scoreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreBarLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  scoreBarValue: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  scoreTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: '#E5EDF8',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
  },
  timelineWrap: {
    marginBottom: spacing.xs,
  },
  timelineRow: {
    marginBottom: spacing.xs,
  },
  timelineHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: typography.xsmall,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  timelineMeta: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  timelineTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: '#E6EEF8',
    overflow: 'hidden',
  },
  timelineFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  timelineFillStable: {
    backgroundColor: '#16A34A',
  },
  timelineFillSlow: {
    backgroundColor: '#2563EB',
  },
  timelineFillFast: {
    backgroundColor: '#D97706',
  },
  hotspotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E3EBFA',
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: '#F8FBFF',
  },
  hotspotBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: spacing.xs,
  },
  hotspotBadgeHigh: {
    backgroundColor: '#FEE2E2',
  },
  hotspotBadgeMedium: {
    backgroundColor: '#FFEDD5',
  },
  hotspotBadgeLight: {
    backgroundColor: '#DBEAFE',
  },
  hotspotBadgeText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  hotspotBody: {
    flex: 1,
  },
  hotspotWord: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  hotspotTip: {
    fontSize: typography.xsmall,
    color: colors.muted,
    lineHeight: 16,
  },
  sectionLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionLabelSpacing: {
    marginTop: spacing.md,
  },
  listText: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  followUpBox: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryUltraLight,
    borderWidth: 1,
    borderColor: '#D1DDF3',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  followUpLabel: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  followUpText: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 20,
  },
  transcriptCard: {
    borderColor: '#C7D6EE',
    backgroundColor: '#FFFFFF',
  },
  transcriptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transcriptTitle: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  transcriptMeta: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  transcriptText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  transcriptActions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D9E3F1',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  micStatusRow: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  idleText: {
    fontSize: typography.small,
    color: colors.muted,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 5,
  },
  waveBar: {
    width: 8,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  micBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    ...shadow.glow,
  },
  micBtnActive: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
  },
  micBtnDisabled: {
    opacity: 0.5,
  },
});
