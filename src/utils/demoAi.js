import { readRuntimeEnv, resolveApiEndpoint } from './runtimeApi';

const DEMO_API_URL = resolveApiEndpoint('BUEPT_DEMO_AI_API_URL', '/api/module');

const SPEAKING_API_URL = resolveApiEndpoint('BUEPT_SPEAKING_API_URL', '/api/speaking') || DEMO_API_URL;

const PRESENTATION_API_URL =
  resolveApiEndpoint('BUEPT_PRESENTATION_API_URL', '/api/presentation') || DEMO_API_URL;

const API_KEY = readRuntimeEnv('BUEPT_API_KEY');

const LAST_PICK = {};

function pickNonRepeating(list = [], key = 'default') {
  if (!Array.isArray(list) || list.length === 0) return '';
  if (list.length === 1) return list[0];
  const prev = LAST_PICK[key];
  let index = Math.floor(Math.random() * list.length);
  if (index === prev) {
    index = (index + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
  }
  LAST_PICK[key] = index;
  return list[index];
}

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  return text || fallback;
}

function cleanList(list, fallback = []) {
  if (!Array.isArray(list)) return fallback;
  const cleaned = list.map((item) => cleanText(String(item || ''))).filter(Boolean);
  return cleaned.length ? cleaned : fallback;
}

function cleanNumber(value, ...fallbacks) {
  const num = Number(value);
  if (Number.isFinite(num)) return num;
  for (const item of fallbacks) {
    const fallbackNum = Number(item);
    if (Number.isFinite(fallbackNum)) return fallbackNum;
  }
  return 0;
}

function withTimeout(ms = 14000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

function authHeaders(extra = {}) {
  if (!API_KEY) return extra;
  return { ...extra, Authorization: `Bearer ${API_KEY}` };
}

function getEndpoint(kind) {
  if (kind === 'speaking') return SPEAKING_API_URL;
  if (kind === 'presentation') return PRESENTATION_API_URL;
  return DEMO_API_URL;
}

async function readErrorText(res) {
  try {
    const text = await res.text();
    return text || `HTTP ${res.status}`;
  } catch (_) {
    return `HTTP ${res.status}`;
  }
}

async function callDemoApi(kind, payload) {
  const endpoint = getEndpoint(kind);
  if (!endpoint) return null;

  const timeout = withTimeout();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ kind, app: 'buept-mobile', ...payload }),
      signal: timeout.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  } finally {
    timeout.clear();
  }
}

async function callJsonEndpointDetailed(endpoint, payload) {
  if (!endpoint) return { ok: false, error: 'ENDPOINT_MISSING' };

  const timeout = withTimeout(22000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: timeout.signal,
    });

    if (!res.ok) {
      const rawText = await readErrorText(res);
      try {
        const parsed = JSON.parse(rawText);
        return {
          ok: false,
          status: res.status,
          error: parsed?.error || `HTTP ${res.status}`,
          detail: parsed?.detail || '',
          fallback: parsed?.fallback || null,
        };
      } catch (_) {
        return {
          ok: false,
          status: res.status,
          error: rawText,
        };
      }
    }

    return {
      ok: true,
      status: res.status,
      data: await res.json(),
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || 'Network request failed',
    };
  } finally {
    timeout.clear();
  }
}

function randInt(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function buildLocalModulePayload(kind, payload = {}) {
  if (kind === 'proficiency_mock') {
    const bank = [
      { type: 'grammar', text: 'If the lecture had started earlier, we ____ enough time for discussion.', options: ['will have', 'would have had', 'had had', 'have had'], correct: 1 },
      { type: 'reading', text: 'The passage implies that sustainable transport policy is most effective when it is ____.', options: ['voluntary only', 'financially neutral', 'integrated across sectors', 'centrally standardized'], correct: 2 },
      { type: 'vocab', text: 'The professor asked students to ____ the claim with peer-reviewed evidence.', options: ['mitigate', 'substantiate', 'disrupt', 'obscure'], correct: 1 },
      { type: 'grammar', text: 'Rarely ____ such a clear methodological comparison in undergraduate essays.', options: ['we see', 'do we see', 'we have seen', 'have we seen'], correct: 1 },
      { type: 'reading', text: 'According to the argument, digital distraction primarily affects ____.', options: ['working memory', 'vocabulary size', 'accent accuracy', 'visual acuity'], correct: 0 },
      { type: 'vocab', text: 'A robust conclusion should avoid ____ statements and include measurable implications.', options: ['nuanced', 'tentative', 'sweeping', 'coherent'], correct: 2 },
    ];
    const count = Math.max(4, Math.min(12, Number(payload.count || 8)));
    const selected = [...bank].sort(() => Math.random() - 0.5).slice(0, count).map((q, i) => ({ id: `local_q_${i + 1}`, ...q }));
    return { source: 'local-exam-bank', questions: selected };
  }

  if (kind === 'weak_point_analysis') {
    const base = {
      grammar: { label: 'Grammar Accuracy', score: randInt(45, 70) },
      vocab: { label: 'Lexical Resource', score: randInt(55, 85) },
      reading: { label: 'Reading Comprehension', score: randInt(50, 80) },
      listening: { label: 'Listening Retention', score: randInt(45, 75) },
      writing: { label: 'Academic Writing', score: randInt(55, 90) },
    };
    return { source: 'local-performance-analysis', skills: base };
  }

  if (kind === 'interactive_dictionary') {
    const term = cleanText(payload.term, 'analysis').toLowerCase();
    return {
      source: 'local-dictionary',
      entry: {
        word: term,
        phonetic: '/demo/',
        partOfSpeech: 'noun',
        definition: `${term} is presented as an academic concept in a local demo dictionary response.`,
        translation: 'Demo translation',
        synonyms: ['concept', 'notion', 'construct', 'framework'],
        antonyms: ['confusion'],
        forms: [
          { pos: 'noun', word: term },
          { pos: 'adj', word: `${term}al` },
          { pos: 'adv', word: `${term}ally` },
        ],
        examples: [
          { en: `The article uses ${term} to structure the main argument.`, tr: `${term} ana argümanı yapılandırmak için kullanılır.` },
          { en: `In BUEPT tasks, ${term} often appears in academic passages.`, tr: `${term} akademik metinlerde sık görünür.` },
        ],
      },
    };
  }

  if (kind === 'academic_writing_template') {
    const topic = cleanText(payload.topic, 'Academic Topic');
    const stance = cleanText(payload.stance, 'this perspective is beneficial');
    return {
      source: 'local-template-engine',
      template: `Title: ${topic}\n\nIntroduction:\n${topic} is widely debated in academic contexts. This essay argues that ${stance}.\n\nBody 1:\nDefine the key concept and explain why it matters.\n\nBody 2:\nProvide one concrete example and evaluate implications.\n\nConclusion:\nReinforce that ${stance}, and suggest one practical recommendation.`,
    };
  }

  if (kind === 'presentation') {
    const topic = cleanText(payload.topic, 'Academic Topic');
    return {
      source: 'local-presentation-engine',
      slides: [
        { title: 'Introduction', points: [`Define ${topic}`, 'Context', 'Roadmap'], script: `Today we focus on ${topic} and its academic relevance.`, cues: 'Open posture, clear pacing.' },
        { title: 'Core Ideas', points: ['Concept 1', 'Concept 2', 'Common error'], script: `${topic} can be explained through two core ideas and one contrastive example.`, cues: 'Emphasize key terms.' },
        { title: 'Conclusion', points: ['Summary', 'Recommendation', 'Q&A'], script: `To conclude, ${topic} is best approached through evidence-based reasoning.`, cues: 'Pause before final line.' },
      ],
    };
  }

  if (kind === 'speaking') {
    return {
      source: 'local-speaking-analysis',
      text: pickNonRepeating([
        'Good response. Improve fluency with shorter clauses and clear connectors.',
        'Solid attempt. Add one concrete example to strengthen coherence.',
        'Nice structure. Reduce filler words and end with a concise conclusion.',
      ], 'local_speaking'),
    };
  }

  return null;
}

export async function requestDemoModule(kind, payload = {}) {
  const data = await callDemoApi(kind, payload);
  if (data) return data;
  return buildLocalModulePayload(kind, payload);
}

const SPEAKING_FEEDBACK_INTROS = [
  'Good attempt. Here is targeted feedback:',
  'Strong effort. Let us refine it with these points:',
  'You are on track. Improve with the suggestions below:',
];

const TH_SOUND_TIP = "Practice /th/ in 'think', 'though', and 'through' with tongue between teeth.";
const V_W_SOUND_TIP = "Keep /v/ and /w/ separate: 'very' (teeth + lip), 'well' (rounded lips).";
const FLUENCY_TIP = 'Use short linking phrases like "first", "however", and "therefore" to sound smoother.';

function scoreToBand(score = 0) {
  if (score >= 85) return 'Strong B2';
  if (score >= 70) return 'Developing B2';
  if (score >= 55) return 'Strong B1';
  return 'Developing B1';
}

function buildSpeakingFallbackPayload(text = '') {
  const lower = String(text || '').toLowerCase();
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  const connectors = (lower.match(/\b(first|however|therefore|for example|in conclusion|moreover)\b/g) || []).length;
  const fillerCount = (lower.match(/\b(like|you know|basically|actually|i mean|kind of|sort of)\b/g) || []).length;
  const tips = [FLUENCY_TIP];
  if (/\bthink|thought|through|three|thesis\b/.test(lower)) tips.push(TH_SOUND_TIP);
  if (/\bvery|well|west|voice\b/.test(lower)) tips.push(V_W_SOUND_TIP);
  if (words < 10) {
    tips.push('Add one example sentence so your answer sounds more complete.');
  }
  const intro = pickNonRepeating(SPEAKING_FEEDBACK_INTROS, 'speaking_intro');
  const improvements = [];
  if (words < 20) improvements.push('Extend the answer to at least 20 words so the idea develops properly.');
  if (connectors < 2) improvements.push('Add one connector and one example to improve coherence.');
  if (fillerCount > 1) improvements.push('Reduce filler words and replace them with a short pause.');
  if (!improvements.length) improvements.push('Keep the structure but push for a clearer concluding sentence.');

  const strengths = [];
  if (words >= 20) strengths.push('The answer length is workable for a short exam turn.');
  if (connectors >= 2) strengths.push('You used connectors that make the response easier to follow.');
  if (fillerCount <= 1) strengths.push('Filler-word control is reasonably stable.');
  if (!strengths.length) strengths.push('You produced a usable first response that can be improved quickly.');

  const drills = cleanList(tips, []).slice(0, 3);
  const score = Math.max(42, Math.min(86, 52 + (words >= 20 ? 10 : 0) + (connectors * 6) - (fillerCount * 5)));
  return {
    text: `${intro}\n• ${tips.slice(0, 3).join('\n• ')}`,
    strengths,
    improvements: improvements.slice(0, 3),
    drills,
    nextPrompt: words < 20
      ? 'Answer again, but include one reason and one concrete example.'
      : 'Answer the same question again with a clearer conclusion.',
    metrics: {
      words,
      sentences: String(text || '').split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length,
      connectorHits: connectors,
      fillerHits: fillerCount,
    },
    scores: {
      overall: score,
      fluency: Math.max(45, Math.min(90, 60 + (words >= 20 ? 10 : 0) - (fillerCount * 6))),
      coherence: Math.max(40, Math.min(92, 48 + (connectors * 12))),
      lexicalRange: Math.max(45, Math.min(88, 52 + Math.min(words, 40) / 2)),
    },
    band: scoreToBand(score),
    source: 'local-speaking-analysis',
  };
}

function normalizeSpeakingPayload(payload = {}, fallbackText = '') {
  const fallback = buildSpeakingFallbackPayload(fallbackText);
  const text = cleanText(
    payload.reply || payload.feedback || payload.text || payload.message,
    fallback.text
  );
  return {
    text,
    source: payload.source || 'online',
    model: cleanText(payload.model),
    diagnostic: cleanText(payload.diagnostic),
    band: cleanText(payload.band, fallback.band),
    metrics: {
      words: cleanNumber(payload.metrics?.words, fallback.metrics.words),
      sentences: cleanNumber(payload.metrics?.sentences, fallback.metrics.sentences),
      connectorHits: cleanNumber(payload.metrics?.connectorHits, payload.metrics?.connectors, fallback.metrics.connectorHits),
      fillerHits: cleanNumber(payload.metrics?.fillerHits, payload.metrics?.fillers, fallback.metrics.fillerHits),
    },
    scores: {
      overall: cleanNumber(payload.scores?.overall, fallback.scores.overall),
      fluency: cleanNumber(payload.scores?.fluency, fallback.scores.fluency),
      coherence: cleanNumber(payload.scores?.coherence, fallback.scores.coherence),
      lexicalRange: cleanNumber(payload.scores?.lexicalRange, fallback.scores.lexicalRange),
    },
    strengths: cleanList(payload.strengths, fallback.strengths).slice(0, 4),
    improvements: cleanList(payload.improvements, fallback.improvements).slice(0, 4),
    drills: cleanList(payload.drills || payload.tips, fallback.drills).slice(0, 4),
    nextPrompt: cleanText(payload.nextPrompt || payload.followUp || payload.nextQuestion, fallback.nextPrompt),
  };
}

export function isDemoAiConfigured(kind = 'generic') {
  return !!getEndpoint(kind);
}

export async function generateSpeakingCoachReply({ text = '', history = [] } = {}) {
  const raw = await callDemoApi('speaking', {
    text: cleanText(text),
    history: Array.isArray(history)
      ? history.slice(-8).map((m) => ({ role: m.role, text: m.text || '' }))
      : [],
  });
  if (raw) return normalizeSpeakingPayload(raw, text);
  return normalizeSpeakingPayload(buildSpeakingFallbackPayload(text), text);
}

function normalizeSlide(item = {}, index = 0) {
  return {
    title: cleanText(item.title, `Slide ${index + 1}`),
    points: cleanList(item.points, ['Key idea', 'Evidence', 'Takeaway']).slice(0, 5),
    script: cleanText(item.script, 'Explain the key idea with one concise example.'),
    cues: cleanText(item.cues, 'Keep eye contact and pause at transitions.'),
  };
}

function normalizePresentationPayload(payload = {}, topic = '') {
  const rawSlides = Array.isArray(payload.slides)
    ? payload.slides
    : (Array.isArray(payload.outline) ? payload.outline : []);
  const slides = rawSlides.map((s, i) => normalizeSlide(s, i)).slice(0, 8);
  if (!slides.length) return null;
  return {
    title: cleanText(payload.title, topic),
    summary: cleanText(payload.summary, `A presentation outline for ${topic}.`),
    slides,
    source: payload.source || 'online',
    model: cleanText(payload.model),
    audience: cleanText(payload.audience, 'BUEPT / university audience'),
    opener: cleanText(payload.opener),
    closer: cleanText(payload.closer),
    deliveryNotes: cleanList(payload.deliveryNotes || payload.delivery_notes, []).slice(0, 6),
    transitions: cleanList(payload.transitions, []).slice(0, 6),
    qaTips: cleanList(payload.qaTips || payload.qa_tips, []).slice(0, 6),
    diagnostic: cleanText(payload.diagnostic),
    topic: cleanText(payload.topic, topic),
  };
}

function buildFallbackDeck(topic, durationMin, tone, level, diagnostic = '') {
  const base = cleanText(topic, 'Academic Topic');
  const durationTag = `${durationMin} minutes`;
  const openings = [
    `Today I will discuss ${base} from a practical ${tone.toLowerCase()} perspective.`,
    `This talk explores ${base} with a ${level}-level academic lens.`,
    `In this session, we break down ${base} with clear, exam-ready framing.`,
  ];
  const closeLines = [
    `To conclude, ${base} requires critical thinking and clear evidence.`,
    `In conclusion, the main value of ${base} is how it improves decision quality.`,
    `To wrap up, ${base} is best understood through examples and structured analysis.`,
  ];
  const opener = pickNonRepeating(openings, 'presentation_opening');
  const closer = pickNonRepeating(closeLines, 'presentation_closing');

  return {
    title: `${base}: Academic Presentation`,
    summary: `${base} is organized into a focused academic presentation with concept framing, evidence, and conclusion planning.`,
    slides: [
      {
        title: 'Introduction',
        points: [`Define ${base}`, 'Context and relevance', `Presentation roadmap (${durationTag})`],
        script: opener,
        cues: 'Start calm, smile, and announce clear objectives.',
      },
      {
        title: 'Core Concepts',
        points: ['Essential terminology', 'How the concept works', 'Most common misconception'],
        script: `First, define the core terms of ${base}. Then contrast correct usage with one common misconception.`,
        cues: 'Use one hand gesture per key concept.',
      },
      {
        title: 'Evidence & Example',
        points: ['Concrete case example', 'Data or observation', 'Interpretation'],
        script: `Now I will present one concrete example that demonstrates how ${base} appears in real academic settings.`,
        cues: 'Pause after evidence, then explain why it matters.',
      },
      {
        title: 'Conclusion',
        points: ['Summarize key points', 'Practical recommendation', 'Q&A transition'],
        script: closer,
        cues: 'Slow down, keep tone confident, invite questions.',
      },
    ],
    source: diagnostic ? 'local-presentation-fallback' : 'local-presentation-engine',
    model: '',
    audience: `${level} academic learners`,
    opener,
    closer,
    deliveryNotes: [
      'Lead with a one-sentence thesis before examples.',
      'Keep each slide to one main idea.',
      'Use transitions to signal movement between sections.',
    ],
    transitions: [
      'Let us move from the definition to the main mechanism.',
      'Now that the concept is clear, consider one concrete example.',
      'With that evidence in mind, we can conclude confidently.',
    ],
    qaTips: [
      'Repeat the question briefly before answering.',
      'Answer directly first, then add one supporting example.',
      'If unsure, narrow the claim instead of overcommitting.',
    ],
    diagnostic,
    topic: base,
  };
}

async function callPresentationApi({ topic, durationMin, tone, level }) {
  const endpoint = getEndpoint('presentation');
  if (!endpoint) {
    return { ok: false, reason: 'ENDPOINT_MISSING', detail: 'No presentation API endpoint configured.' };
  }

  return callJsonEndpointDetailed(endpoint, {
    app: 'buept-mobile',
    kind: 'presentation',
    format: 'presentation_deck_v1',
    topic,
    durationMin,
    tone,
    level,
  });
}

export async function generatePresentationDeck({
  topic = '',
  durationMin = 10,
  tone = 'Academic',
  level = 'B2',
} = {}) {
  const cleanTopic = cleanText(topic, 'Academic Topic');
  const safeDuration = Number.isFinite(durationMin) ? durationMin : 10;
  const safeTone = cleanText(tone, 'Academic');
  const safeLevel = cleanText(level, 'B2');
  const response = await callPresentationApi({
    topic: cleanTopic,
    durationMin: safeDuration,
    tone: safeTone,
    level: safeLevel,
  });

  const normalized = response?.ok ? normalizePresentationPayload(response.data, cleanTopic) : null;
  if (normalized) return normalized;

  if (response?.fallback) {
    const normalizedFallback = normalizePresentationPayload(response.fallback, cleanTopic);
    if (normalizedFallback) {
      return {
        ...normalizedFallback,
        diagnostic: cleanText(
          response.detail || normalizedFallback.diagnostic,
          'Live AI generation was unavailable, so a fallback deck was generated.'
        ),
      };
    }
  }

  const detail = cleanText(
    response?.detail || response?.error || '',
    PRESENTATION_API_URL
      ? 'Live AI generation was unavailable, so a local fallback deck was generated.'
      : 'No live AI endpoint was available, so a local fallback deck was generated.'
  );
  return buildFallbackDeck(cleanTopic, safeDuration, safeTone, safeLevel, detail);
}
