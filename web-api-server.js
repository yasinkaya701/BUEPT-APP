const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const HOST = process.env.HOST || process.env.BUEPT_HOST || '0.0.0.0';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8088;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.BUEPT_OPENAI_API_KEY || '';
const OPENAI_BASE_URL = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const OPENAI_PRESENTATION_MODEL = process.env.OPENAI_PRESENTATION_MODEL || 'gpt-5-mini';
const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || process.env.BUEPT_OPENAI_MODEL || 'gpt-5-mini';
const OPENAI_SPEAKING_MODEL = process.env.OPENAI_SPEAKING_MODEL || OPENAI_TEXT_MODEL;
const OPENAI_VIDEO_MODEL = process.env.OPENAI_VIDEO_MODEL || OPENAI_TEXT_MODEL;
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_TOKEN || '';
const HF_CHAT_ENDPOINT = process.env.HF_CHAT_ENDPOINT || 'https://router.huggingface.co/v1/chat/completions';
const HF_CHAT_MODEL = process.env.HF_CHAT_MODEL || 'openai/gpt-oss-120b:cheapest';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';
const OLLAMA_ENABLED = String(process.env.OLLAMA_ENABLED || '').toLowerCase() === '1';
const SYNC_API_TOKEN = process.env.BUEPT_SYNC_TOKEN || process.env.SYNC_API_TOKEN || 'buept-sync-local';
const SYNC_FIELDS = ['myWords', 'unknownWords', 'vocabStats', 'customDecks', 'weeklyProgress'];

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch (_) {
    return false;
  }
}

function detectRoots(baseDir) {
  const candidates = [
    baseDir,
    path.resolve(baseDir, '..'),
    path.resolve(baseDir, '../..')
  ];

  for (const candidate of candidates) {
    const nestedApp = path.join(candidate, 'BUEPTApp');
    const nestedData = path.join(nestedApp, 'data');
    if (exists(nestedData)) {
      return {
        projectRoot: candidate,
        appRoot: nestedApp,
        dataRoot: nestedData
      };
    }

    const directData = path.join(candidate, 'data');
    if (exists(directData)) {
      return {
        projectRoot: path.resolve(candidate, '..'),
        appRoot: candidate,
        dataRoot: directData
      };
    }
  }

  return {
    projectRoot: baseDir,
    appRoot: path.join(baseDir, 'BUEPTApp'),
    dataRoot: path.join(baseDir, 'BUEPTApp', 'data')
  };
}

const roots = detectRoots(__dirname);
const PROJECT_ROOT = roots.projectRoot;
const APP_ROOT = roots.appRoot;
const DATA_ROOT = roots.dataRoot;
const SYNC_STORE_FILE = path.join(DATA_ROOT, 'sync_bridge_store.json');
const STATIC_ROOT_CANDIDATES = [
  path.join(APP_ROOT, 'web-rnw', 'dist'),
  path.join(PROJECT_ROOT, 'BUEPTApp', 'web-rnw', 'dist'),
  path.join(APP_ROOT, 'web'),
  path.join(PROJECT_ROOT, 'web'),
];
const STATIC_ROOT = STATIC_ROOT_CANDIDATES.find((candidate) => exists(candidate)) || STATIC_ROOT_CANDIDATES[0];

const APK_FILE_CANDIDATES = {
  debug: [
    path.join(PROJECT_ROOT, 'BUEPT-App-for-Julide-Ozturk-debug.apk'),
    path.join(APP_ROOT, 'BUEPT-App-for-Julide-Ozturk-debug.apk'),
    path.join(APP_ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
  ],
  release: [
    path.join(PROJECT_ROOT, 'BUEPT-App-for-Julide-Ozturk-release.apk'),
    path.join(APP_ROOT, 'BUEPT-App-for-Julide-Ozturk-release.apk'),
    path.join(APP_ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
  ]
};

const dataCache = new Map();

function loadJsonCached(fileName, fallbackValue) {
  if (dataCache.has(fileName)) return dataCache.get(fileName);
  const fullPath = path.join(DATA_ROOT, fileName);
  try {
    const text = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(text);
    dataCache.set(fileName, parsed);
    return parsed;
  } catch (_) {
    dataCache.set(fileName, fallbackValue);
    return fallbackValue;
  }
}

function asList(value) {
  if (Array.isArray(value)) return value.map((x) => String(x || '').trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/g)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (!value) return [];
  return [String(value).trim()].filter(Boolean);
}

function uniq(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = String(item || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function cleanTextValue(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  return text || fallback;
}

function clampNumberValue(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function cleanStringList(value, minItems = 0, maxItems = 6) {
  const list = Array.isArray(value) ? value : [];
  const cleaned = list
    .map((item) => cleanTextValue(String(item || '')))
    .filter(Boolean);
  const sliced = uniq(cleaned).slice(0, maxItems);
  if (sliced.length >= minItems) return sliced;
  return sliced;
}

function extractResponseOutputText(payload = {}) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  const parts = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      if (block?.type === 'output_text' || block?.type === 'text') {
        const text = cleanTextValue(block.text || block.value || '');
        if (text) parts.push(text);
      }
    }
  }
  return parts.join('\n').trim();
}

function normalizePresentationDeck(raw = {}, meta = {}) {
  const slides = Array.isArray(raw.slides)
    ? raw.slides
        .map((slide, index) => ({
          title: cleanTextValue(slide?.title, `Slide ${index + 1}`),
          points: cleanStringList(slide?.points, 0, 5).length
            ? cleanStringList(slide?.points, 0, 5)
            : ['Key idea', 'Evidence', 'Takeaway'],
          script: cleanTextValue(slide?.script, 'Explain the main point with one clear example.'),
          cues: cleanTextValue(slide?.cues, 'Keep eye contact and pause at transitions.'),
        }))
        .slice(0, 8)
    : [];

  if (!slides.length) {
    throw new Error('No slides were returned by the model.');
  }

  return {
    title: cleanTextValue(raw.title, `${meta.topic || 'Academic Topic'}: Presentation Deck`),
    summary: cleanTextValue(raw.summary, 'AI-generated academic presentation structure.'),
    audience: cleanTextValue(raw.audience, 'BUEPT / university audience'),
    opener: cleanTextValue(raw.opener),
    closer: cleanTextValue(raw.closer),
    transitions: cleanStringList(raw.transitions, 0, 6),
    qa_tips: cleanStringList(raw.qa_tips || raw.qaTips, 0, 6),
    delivery_notes: cleanStringList(raw.delivery_notes || raw.deliveryNotes, 0, 6),
    slides,
    source: 'openai',
    model: meta.model || OPENAI_PRESENTATION_MODEL,
    topic: cleanTextValue(meta.topic, ''),
  };
}

function buildPresentationFallback({ topic = 'Academic Topic', durationMin = 10, tone = 'Academic', level = 'B2', diagnostic = '' } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Topic');
  const safeDuration = clampNumberValue(durationMin, 5, 20, 10);
  const safeTone = cleanTextValue(tone, 'Academic');
  const safeLevel = cleanTextValue(level, 'B2');
  const opener = `Today I will discuss ${safeTopic} from a ${safeTone.toLowerCase()} ${safeLevel}-level perspective.`;
  const closer = `To conclude, ${safeTopic} should be explained through clear evidence, structured analysis, and precise language.`;

  return {
    title: `${safeTopic}: Presentation Deck`,
    summary: `${safeTopic} is organized into an academic talk with introduction, core ideas, evidence, and conclusion.`,
    audience: `${safeLevel} academic learners`,
    opener,
    closer,
    transitions: [
      'Let us move from the definition to the main mechanism.',
      'Now that the concept is clear, consider one concrete example.',
      'With that evidence in mind, we can conclude confidently.',
    ],
    qa_tips: [
      'Repeat the question briefly before answering.',
      'Answer directly first, then support it with one example.',
      'If needed, narrow the claim instead of overgeneralizing.',
    ],
    delivery_notes: [
      'Keep one major idea per slide.',
      'Signal transitions explicitly.',
      'End each section with a takeaway sentence.',
    ],
    slides: [
      {
        title: 'Introduction',
        points: [`Define ${safeTopic}`, 'Explain why it matters', `Roadmap for ${safeDuration} minutes`],
        script: opener,
        cues: 'Open calmly and set expectations clearly.',
      },
      {
        title: 'Core Ideas',
        points: ['Key concept', 'Important mechanism', 'Most common misunderstanding'],
        script: `First, define the core ideas behind ${safeTopic}. Then clarify the main misunderstanding students often have.`,
        cues: 'Use one gesture per major point.',
      },
      {
        title: 'Evidence and Example',
        points: ['Concrete example', 'Observation or data', 'Interpretation'],
        script: `Now I will connect ${safeTopic} to one concrete example and explain why the evidence matters.`,
        cues: 'Pause after the example before interpreting it.',
      },
      {
        title: 'Conclusion',
        points: ['Synthesize key points', 'State a recommendation', 'Invite questions'],
        script: closer,
        cues: 'Slow down and end with confidence.',
      },
    ],
    source: diagnostic ? 'offline-fallback' : 'offline',
    model: '',
    topic: safeTopic,
    diagnostic,
  };
}

async function generatePresentationWithOpenAI({ topic = '', durationMin = 10, tone = 'Academic', level = 'B2' } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Topic');
  const safeDuration = clampNumberValue(durationMin, 5, 20, 10);
  const safeTone = cleanTextValue(tone, 'Academic');
  const safeLevel = cleanTextValue(level, 'B2');

  if (!OPENAI_API_KEY) {
    return {
      ok: false,
      status: 503,
      error: 'OPENAI_API_KEY_MISSING',
      detail: 'Set OPENAI_API_KEY before using /api/presentation.',
      fallback: buildPresentationFallback({
        topic: safeTopic,
        durationMin: safeDuration,
        tone: safeTone,
        level: safeLevel,
        diagnostic: 'OpenAI key missing on the server. Start the API with OPENAI_API_KEY set for live generation.',
      }),
    };
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      audience: { type: 'string' },
      opener: { type: 'string' },
      closer: { type: 'string' },
      transitions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
      qa_tips: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
      delivery_notes: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
      slides: {
        type: 'array',
        minItems: 4,
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            points: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
            script: { type: 'string' },
            cues: { type: 'string' },
          },
          required: ['title', 'points', 'script', 'cues'],
        },
      },
    },
    required: ['title', 'summary', 'audience', 'opener', 'closer', 'transitions', 'qa_tips', 'delivery_notes', 'slides'],
  };

  const instructions = [
    'You build strong academic presentation decks for BUEPT and university students.',
    'Generate a concise but genuinely usable presentation deck from scratch.',
    'Every slide must include: a strong title, 3 to 5 bullet points, a speaker script, and delivery/body-language cues.',
    'Make the language clear, academically toned, and presentation-ready.',
    'The deck should fit the requested duration and level.',
    'Return only valid JSON that matches the required schema.',
  ].join(' ');

  const input = [
    `Topic: ${safeTopic}`,
    `Duration: ${safeDuration} minutes`,
    `Tone: ${safeTone}`,
    `Target level: ${safeLevel}`,
    'Goal: produce a strong spoken presentation plan, not a generic essay outline.',
  ].join('\n');

  let res;
  let json = {};
  try {
    res = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_PRESENTATION_MODEL,
        store: false,
        instructions,
        input,
        text: {
          format: {
            type: 'json_schema',
            name: 'presentation_deck',
            strict: true,
            schema,
          },
        },
      }),
    });
    json = await res.json().catch(() => ({}));
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_NETWORK_ERROR',
      detail: err?.message || 'OpenAI request failed.',
      fallback: buildPresentationFallback({
        topic: safeTopic,
        durationMin: safeDuration,
        tone: safeTone,
        level: safeLevel,
        diagnostic: err?.message || 'OpenAI request failed.',
      }),
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: 'OPENAI_REQUEST_FAILED',
      detail: cleanTextValue(json?.error?.message, `OpenAI HTTP ${res.status}`),
      fallback: buildPresentationFallback({
        topic: safeTopic,
        durationMin: safeDuration,
        tone: safeTone,
        level: safeLevel,
        diagnostic: cleanTextValue(json?.error?.message, `OpenAI HTTP ${res.status}`),
      }),
    };
  }

  const outputText = extractResponseOutputText(json);
  if (!outputText) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_EMPTY_OUTPUT',
      detail: 'OpenAI returned no structured presentation data.',
      fallback: buildPresentationFallback({
        topic: safeTopic,
        durationMin: safeDuration,
        tone: safeTone,
        level: safeLevel,
        diagnostic: 'OpenAI returned no structured presentation data.',
      }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch (_) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_INVALID_JSON',
      detail: 'OpenAI returned invalid JSON for the presentation deck.',
      fallback: buildPresentationFallback({
        topic: safeTopic,
        durationMin: safeDuration,
        tone: safeTone,
        level: safeLevel,
        diagnostic: 'OpenAI returned invalid JSON for the presentation deck.',
      }),
    };
  }

  try {
    return {
      ok: true,
      status: 200,
      data: normalizePresentationDeck(parsed, {
        topic: safeTopic,
        model: cleanTextValue(json?.model, OPENAI_PRESENTATION_MODEL),
      }),
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_BAD_SCHEMA',
      detail: err?.message || 'OpenAI presentation schema validation failed.',
      fallback: buildPresentationFallback({
        topic: safeTopic,
        durationMin: safeDuration,
        tone: safeTone,
        level: safeLevel,
        diagnostic: err?.message || 'OpenAI presentation schema validation failed.',
      }),
    };
  }
}

async function callOpenAiStructured({ model = OPENAI_TEXT_MODEL, instructions = '', input = '', schema, name = 'structured_payload' } = {}) {
  if (!OPENAI_API_KEY) {
    return {
      ok: false,
      status: 503,
      error: 'OPENAI_API_KEY_MISSING',
      detail: 'Set OPENAI_API_KEY on the server for live AI generation.',
    };
  }

  let res;
  let json = {};
  try {
    res = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions,
        input,
        text: {
          format: {
            type: 'json_schema',
            name,
            strict: true,
            schema,
          },
        },
      }),
    });
    json = await res.json().catch(() => ({}));
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_NETWORK_ERROR',
      detail: err?.message || 'OpenAI request failed.',
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: 'OPENAI_REQUEST_FAILED',
      detail: cleanTextValue(json?.error?.message, `OpenAI HTTP ${res.status}`),
    };
  }

  const outputText = extractResponseOutputText(json);
  if (!outputText) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_EMPTY_OUTPUT',
      detail: 'OpenAI returned no structured output.',
    };
  }

  try {
    return {
      ok: true,
      status: 200,
      data: JSON.parse(outputText),
      model: cleanTextValue(json?.model, model),
    };
  } catch (_) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_INVALID_JSON',
      detail: 'OpenAI returned invalid JSON.',
    };
  }
}

async function callOpenAiText({ model = OPENAI_TEXT_MODEL, instructions = '', input = '', maxOutputTokens = 380, temperature = 0.2 } = {}) {
  if (!OPENAI_API_KEY) {
    return {
      ok: false,
      status: 503,
      error: 'OPENAI_API_KEY_MISSING',
      detail: 'Set OPENAI_API_KEY on the server for live AI generation.',
    };
  }

  let res;
  let json = {};
  try {
    res = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions,
        input,
        temperature,
        max_output_tokens: maxOutputTokens,
      }),
    });
    json = await res.json().catch(() => ({}));
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_NETWORK_ERROR',
      detail: err?.message || 'OpenAI request failed.',
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: 'OPENAI_REQUEST_FAILED',
      detail: cleanTextValue(json?.error?.message, `OpenAI HTTP ${res.status}`),
    };
  }

  const outputText = extractResponseOutputText(json);
  if (!outputText) {
    return {
      ok: false,
      status: 502,
      error: 'OPENAI_EMPTY_OUTPUT',
      detail: 'OpenAI returned no output.',
    };
  }

  return {
    ok: true,
    status: 200,
    text: outputText,
    model: cleanTextValue(json?.model, model),
  };
}

async function callHfChatCompletion({ model = HF_CHAT_MODEL, messages = [], temperature = 0.2, maxTokens = 320 } = {}) {
  if (!HF_TOKEN) {
    return {
      ok: false,
      status: 503,
      error: 'HF_TOKEN_MISSING',
      detail: 'Set HF_TOKEN or HUGGINGFACE_API_TOKEN on the server for HF inference.',
    };
  }

  let res;
  let json = {};
  try {
    res = await fetch(HF_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    json = await res.json().catch(() => ({}));
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'HF_NETWORK_ERROR',
      detail: err?.message || 'Hugging Face request failed.',
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: 'HF_REQUEST_FAILED',
      detail: cleanTextValue(json?.error?.message || json?.error, `HF HTTP ${res.status}`),
    };
  }

  const text = cleanTextValue(json?.choices?.[0]?.message?.content, '');
  if (!text) {
    return {
      ok: false,
      status: 502,
      error: 'HF_EMPTY_OUTPUT',
      detail: 'HF returned no text.',
    };
  }

  return {
    ok: true,
    status: 200,
    text,
    model,
  };
}

async function callOllamaChatCompletion({ model = OLLAMA_MODEL, messages = [], temperature = 0.2, maxTokens = 320 } = {}) {
  if (!OLLAMA_BASE_URL) {
    return {
      ok: false,
      status: 503,
      error: 'OLLAMA_BASE_URL_MISSING',
      detail: 'Set OLLAMA_BASE_URL to reach a local Ollama server.',
    };
  }

  let res;
  let json = {};
  try {
    res = await fetch(`${OLLAMA_BASE_URL.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });
    json = await res.json().catch(() => ({}));
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'OLLAMA_NETWORK_ERROR',
      detail: err?.message || 'Ollama request failed.',
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: 'OLLAMA_REQUEST_FAILED',
      detail: cleanTextValue(json?.error, `Ollama HTTP ${res.status}`),
    };
  }

  const text = cleanTextValue(json?.message?.content, '');
  if (!text) {
    return {
      ok: false,
      status: 502,
      error: 'OLLAMA_EMPTY_OUTPUT',
      detail: 'Ollama returned no text.',
    };
  }

  return {
    ok: true,
    status: 200,
    text,
    model,
  };
}

function parseJsonLoose(text = '') {
  const raw = cleanTextValue(text, '');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    // continue
  }

  const firstObj = raw.indexOf('{');
  const lastObj = raw.lastIndexOf('}');
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    const candidate = raw.slice(firstObj, lastObj + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // continue
    }
  }

  const firstArr = raw.indexOf('[');
  const lastArr = raw.lastIndexOf(']');
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    const candidate = raw.slice(firstArr, lastArr + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // continue
    }
  }

  return null;
}

async function callAnyModelText({
  system = '',
  user = '',
  maxTokens = 360,
  temperature = 0.2,
  preferLocal = false,
  openaiModel = OPENAI_TEXT_MODEL,
} = {}) {
  const order = [];
  if (preferLocal) {
    if (OLLAMA_ENABLED) order.push('ollama');
    if (HF_TOKEN) order.push('hf');
    if (OPENAI_API_KEY) order.push('openai');
  } else {
    if (OPENAI_API_KEY) order.push('openai');
    if (HF_TOKEN) order.push('hf');
    if (OLLAMA_ENABLED) order.push('ollama');
  }
  if (!order.length) {
    return {
      ok: false,
      status: 503,
      error: 'NO_MODEL_PROVIDER_AVAILABLE',
      detail: 'No OpenAI/HF/Ollama provider is available.',
    };
  }

  let lastErr = null;
  for (const provider of order) {
    if (provider === 'ollama') {
      const out = await callOllamaChatCompletion({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        maxTokens,
      });
      if (out.ok) return { ...out, source: 'ollama' };
      lastErr = out;
      continue;
    }
    if (provider === 'hf') {
      const out = await callHfChatCompletion({
        model: HF_CHAT_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        maxTokens,
      });
      if (out.ok) return { ...out, source: 'huggingface' };
      lastErr = out;
      continue;
    }
    if (provider === 'openai') {
      const out = await callOpenAiText({
        model: openaiModel,
        instructions: system,
        input: user,
        temperature,
        maxOutputTokens: maxTokens,
      });
      if (out.ok) return { ...out, source: 'openai' };
      lastErr = out;
    }
  }

  return lastErr || {
    ok: false,
    status: 502,
    error: 'MODEL_CHAIN_FAILED',
    detail: 'All model providers failed.',
  };
}

function levelRank(level = '') {
  const key = String(level || '').toUpperCase();
  return { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }[key] || 0;
}

function inferWordTypeLabel(raw = '') {
  const t = String(raw || '').toLowerCase();
  if (t.includes('verb')) return 'verb';
  if (t.includes('adjective') || t.includes('adj')) return 'adjective';
  if (t.includes('adverb') || t.includes('adv')) return 'adverb';
  if (t.includes('noun')) return 'noun';
  return 'noun';
}

function familyRootServer(word = '') {
  const w = normToken(word).replace(/[^a-z]/g, '');
  if (!w) return '';
  if (w.length > 6 && w.endsWith('ysis')) return `${w.slice(0, -4)}y`;
  if (w.length > 5 && (w.endsWith('yze') || w.endsWith('yse'))) return `${w.slice(0, -3)}y`;
  const suffixes = [
    'ization', 'isation', 'ational', 'iveness', 'fulness', 'ousness',
    'ability', 'ibility', 'ically', 'ation', 'ition', 'ically', 'ment',
    'ness', 'ship', 'less', 'able', 'ible', 'ance', 'ence', 'ally', 'ical',
    'tion', 'sion', 'ity', 'ism', 'ist', 'ous', 'ive', 'ily', 'ily', 'ary',
    'ing', 'ed', 'ly', 'al', 'ic', 'er', 'or',
  ];
  for (const suffix of suffixes) {
    if (w.length - suffix.length >= 3 && w.endsWith(suffix)) {
      return w.slice(0, -suffix.length);
    }
  }
  return w;
}

function buildFamilyFormsFromDictionary(word = '', wordType = '') {
  const root = familyRootServer(word);
  const currentPos = inferWordTypeLabel(wordType);
  const baseWord = normToken(word);
  const empty = [];
  if (!root || !baseWord) return [{ pos: currentPos, word: baseWord }].filter((item) => item.word);

  const cacheKey = `family_forms_${baseWord}`;
  if (dataCache.has(cacheKey)) return dataCache.get(cacheKey);

  const { list } = getDictionaryIndex();
  const formsByPos = new Map();
  for (const entry of list) {
    const candidate = normToken(entry.word);
    if (!candidate || candidate.length < 3) continue;
    const candidateRoot = familyRootServer(candidate);
    if (!candidateRoot) continue;
    if (candidate !== baseWord && candidateRoot !== root) continue;
    const pos = inferWordTypeLabel(entry.wordType);
    if (!formsByPos.has(pos)) {
      formsByPos.set(pos, candidate);
    }
    if (formsByPos.size >= 4) break;
  }

  if (!formsByPos.has(currentPos)) formsByPos.set(currentPos, baseWord);
  const forms = Array.from(formsByPos.entries()).map(([pos, term]) => ({ pos, word: term }));
  dataCache.set(cacheKey, forms.length ? forms : empty);
  return forms.length ? forms : empty;
}

function buildInteractiveDictionaryLocal(term = '') {
  const query = normToken(term);
  if (!query) return null;
  const { byWord, list } = getDictionaryIndex();
  const exact = byWord.get(query);
  const entry = exact || list.find((item) => item.word.startsWith(query)) || list.find((item) => item.word.includes(query));
  if (!entry) return null;

  return {
    source: 'local-dictionary',
    entry: {
      word: entry.word,
      phonetic: '',
      partOfSpeech: inferWordTypeLabel(entry.wordType),
      definition: entry.definition,
      translation: '',
      synonyms: entry.synonyms.slice(0, 6),
      antonyms: entry.antonyms.slice(0, 6),
      forms: buildFamilyFormsFromDictionary(entry.word, entry.wordType),
      examples: entry.examples.slice(0, 4).map((en) => ({ en, tr: '' })),
      collocations: entry.collocations.slice(0, 6),
      level: entry.level,
      source: entry.source,
    },
  };
}

function buildAcademicWritingTemplateLocal({ topic = '', stance = '', level = 'B2' } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Topic');
  const safeStance = cleanTextValue(stance, 'this position is beneficial');
  const safeLevel = cleanTextValue(level, 'B2');
  return {
    source: 'local-template-engine',
    template: [
      `Title: ${safeTopic}`,
      '',
      'Introduction:',
      `${safeTopic} remains a contested issue in contemporary academic discussion. This essay argues that ${safeStance} because it improves outcomes, addresses practical needs, and remains defensible under critical evaluation.`,
      '',
      'Body Paragraph 1:',
      `Define the central concept behind ${safeTopic.toLowerCase()} and show why it matters in the current educational or social context.`,
      '',
      'Body Paragraph 2:',
      `Develop the strongest reason supporting the claim that ${safeStance}. Use one specific example, then explain its implications.`,
      '',
      'Body Paragraph 3:',
      'Address a reasonable counter-argument, evaluate its limits, and return to the stronger overall position.',
      '',
      'Conclusion:',
      `Reaffirm that ${safeStance}, summarize the most convincing evidence, and finish with one practical recommendation suitable for a ${safeLevel} academic essay.`,
    ].join('\n'),
  };
}

function tokenizeText(text = '') {
  return String(text || '')
    .toLowerCase()
    .match(/[a-z][a-z-]{2,}/g) || [];
}

function buildPhotoVocabExtractLocal({ ocrText = '', minLevel = 'B1', limit = 12 } = {}) {
  const tokens = tokenizeText(ocrText);
  const tokenCount = tokens.length;
  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });

  const { byWord } = getDictionaryIndex();
  const floor = levelRank(minLevel);
  const candidates = Array.from(counts.entries())
    .map(([word, frequency]) => {
      const entry = byWord.get(word);
      if (!entry) return null;
      const levelValue = levelRank(entry.level);
      if (levelValue < floor) return null;
      const confidence = Math.max(40, Math.min(97, Math.round(45 + levelValue * 7 + frequency * 10 + (entry.rank || 0) / 6)));
      const reasons = [];
      if (frequency > 1) reasons.push(`seen ${frequency} times`);
      reasons.push(`${entry.level} level`);
      reasons.push(`${entry.source} source`);
      return {
        word: entry.word,
        level: entry.level,
        pos: inferWordTypeLabel(entry.wordType),
        confidence,
        definition: entry.definition,
        synonyms: entry.synonyms.slice(0, 4),
        reasons,
        frequency,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      return a.word.localeCompare(b.word);
    })
    .slice(0, Math.max(5, Math.min(40, Number(limit) || 12)));

  return {
    source: 'local-ocr-ranker',
    words: candidates,
    meta: {
      tokenCount,
      uniqueCount: counts.size,
      keptCount: candidates.length,
      minLevel: String(minLevel || 'B1').toUpperCase(),
    },
  };
}

function shuffle(list = []) {
  return [...list].sort(() => Math.random() - 0.5);
}

function buildVocabularyMockQuestions(level = 'B2', count = 2) {
  const { list } = getDictionaryIndex();
  const filtered = list.filter((item) => !level || String(item.level || '').toUpperCase() === String(level).toUpperCase());
  const pool = filtered.length ? filtered : list;
  const chosen = shuffle(pool.filter((item) => item.definition && item.word.length >= 4)).slice(0, count);
  return chosen.map((item, index) => {
    const distractors = shuffle(pool.filter((candidate) => candidate.word !== item.word)).slice(0, 3).map((candidate) => candidate.word);
    const options = shuffle([item.word, ...distractors]);
    return {
      id: `vocab_${index + 1}_${item.word}`,
      type: 'vocab',
      text: `Which word best matches this definition?\n${item.definition}`,
      options,
      correct: options.findIndex((option) => option === item.word),
    };
  });
}

function buildProficiencyMockLocal({ count = 8, level = 'B2' } = {}) {
  const safeCount = Math.max(4, Math.min(20, Number(count) || 8));
  const safeLevel = cleanTextValue(level, 'B2').toUpperCase();
  const readingTasks = loadJsonCached('reading_tasks.json', []);
  const grammarTasks = [
    ...loadJsonCached('grammar_tasks.json', []),
    ...loadJsonCached('grammar_tasks_hard.json', []),
    ...loadJsonCached('test_english_grammar_tasks.json', []),
  ];

  const buildReadingPool = (strictLevel) => {
    const out = [];
    (Array.isArray(readingTasks) ? readingTasks : []).forEach((task) => {
      const levelOk = !strictLevel || String(task.level || '').toUpperCase() === safeLevel;
      if (!levelOk) return;
      (Array.isArray(task.questions) ? task.questions : []).forEach((q, index) => {
        const normalized = normalizeReadingQuestion(q);
        if (!normalized || normalized.options.length < 2 || normalized.answer == null) return;
        out.push({
          id: `reading_${task.id}_${index + 1}`,
          type: 'reading',
          text: normalized.q,
          options: normalized.options.slice(0, 4),
          correct: Math.max(0, Math.min(normalized.options.length - 1, normalized.answer)),
        });
      });
    });
    return out;
  };

  const buildGrammarPool = (strictLevel) => {
    const out = [];
    (Array.isArray(grammarTasks) ? grammarTasks : []).forEach((task) => {
      const levelOk = !strictLevel || String(task.level || '').toUpperCase() === safeLevel;
      if (!levelOk) return;
      (Array.isArray(task.questions) ? task.questions : []).forEach((q, index) => {
        const normalized = normalizeReadingQuestion(q);
        if (!normalized || normalized.options.length < 2 || normalized.answer == null) return;
        out.push({
          id: `grammar_${task.id}_${index + 1}`,
          type: 'grammar',
          text: normalized.q,
          options: normalized.options.slice(0, 4),
          correct: Math.max(0, Math.min(normalized.options.length - 1, normalized.answer)),
        });
      });
    });
    return out;
  };

  const readingQuestionsStrict = buildReadingPool(true);
  const readingQuestions = readingQuestionsStrict.length >= 2 ? readingQuestionsStrict : buildReadingPool(false);
  const grammarQuestionsStrict = buildGrammarPool(true);
  const grammarQuestions = grammarQuestionsStrict.length >= 2 ? grammarQuestionsStrict : buildGrammarPool(false);
  const vocabQuestions = buildVocabularyMockQuestions(safeLevel, Math.max(2, Math.round(safeCount / 4)));
  const vocabFallback = vocabQuestions.length >= 2 ? vocabQuestions : buildVocabularyMockQuestions('', Math.max(2, Math.round(safeCount / 4)));

  const mix = [
    ...shuffle(grammarQuestions).slice(0, Math.max(2, Math.round(safeCount * 0.4))),
    ...shuffle(readingQuestions).slice(0, Math.max(2, Math.round(safeCount * 0.35))),
    ...vocabFallback,
  ];
  const questions = shuffle(mix).slice(0, safeCount);
  return {
    source: 'local-exam-bank',
    level: safeLevel,
    questions,
  };
}

function average(values = []) {
  const list = values.filter((value) => Number.isFinite(value));
  if (!list.length) return null;
  return Math.round(list.reduce((sum, value) => sum + value, 0) / list.length);
}

function buildWeakPointAnalysisLocal(payload = {}) {
  const readingHistory = Array.isArray(payload.readingHistory) ? payload.readingHistory : [];
  const listeningHistory = Array.isArray(payload.listeningHistory) ? payload.listeningHistory : [];
  const grammarHistory = Array.isArray(payload.grammarHistory) ? payload.grammarHistory : [];
  const mockHistory = Array.isArray(payload.mockHistory) ? payload.mockHistory : [];
  const essayHistory = Array.isArray(payload.history) ? payload.history : [];
  const vocabStats = payload.vocabStats && typeof payload.vocabStats === 'object' ? payload.vocabStats : {};
  const errorWords = payload.errorWords && typeof payload.errorWords === 'object' ? payload.errorWords : {};

  const grammarScore = average([
    ...grammarHistory.map((item) => Math.round(((item?.result?.score || 0) / Math.max(1, item?.result?.total || 1)) * 100)),
    ...mockHistory.map((item) => Number(item?.result?.grammar)),
  ]);
  const readingScore = average([
    ...readingHistory.map((item) => Math.round(((item?.result?.score || 0) / Math.max(1, item?.result?.total || 1)) * 100)),
    ...mockHistory.map((item) => Number(item?.result?.reading)),
  ]);
  const listeningScore = average([
    ...listeningHistory.map((item) => Math.round(((item?.result?.score || 0) / Math.max(1, item?.result?.total || 1)) * 100)),
    ...mockHistory.map((item) => Number(item?.result?.listening)),
  ]);
  const writingScore = average([
    ...essayHistory.map((item) => Math.round(((item?.report?.rubric?.Total || 0) / 20) * 100)),
    ...mockHistory.map((item) => Number(item?.result?.writing)),
  ]);

  let known = 0;
  let unknown = 0;
  Object.values(vocabStats).forEach((stat) => {
    known += Number(stat?.known || 0);
    unknown += Number(stat?.unknown || 0);
  });
  const vocabBase = known + unknown > 0 ? Math.round((known / Math.max(1, known + unknown)) * 100) : 65;
  const errorPenalty = Math.min(25, Object.keys(errorWords).length * 2);
  const vocabScore = Math.max(35, vocabBase - errorPenalty);

  const skills = {
    grammar: { label: 'Grammar Accuracy', score: grammarScore ?? 58 },
    vocab: { label: 'Lexical Resource', score: vocabScore },
    reading: { label: 'Reading Comprehension', score: readingScore ?? 64 },
    listening: { label: 'Listening Retention', score: listeningScore ?? 61 },
    writing: { label: 'Academic Writing', score: writingScore ?? 67 },
  };

  const weakest = Object.entries(skills).sort((a, b) => a[1].score - b[1].score);
  const insights = {
    grammar: {
      summary: grammarHistory.length
        ? `Based on ${grammarHistory.length} grammar attempts, tense control and sentence structure still cost points.`
        : 'Grammar score is estimated from available performance data.',
    },
    vocab: {
      summary: Object.keys(errorWords).length
        ? `${Object.keys(errorWords).length} error-tracked words are lowering vocabulary stability.`
        : 'Vocabulary score is based on known/unknown review history.',
    },
    reading: {
      summary: readingHistory.length
        ? `Reading score reflects ${readingHistory.length} recorded practice results and recent mock performance.`
        : 'Reading score is estimated from available mock data.',
    },
    listening: {
      summary: listeningHistory.length
        ? `Listening score reflects ${listeningHistory.length} recorded listening tasks.`
        : 'Listening score is estimated from available practice data.',
    },
    writing: {
      summary: essayHistory.length
        ? `Writing score reflects ${essayHistory.length} evaluated writing submissions.`
        : 'Writing score is estimated from mock and rubric history.',
    },
  };

  return {
    source: 'local-performance-analysis',
    skills,
    insights,
    recommendations: weakest.slice(0, 3).map(([key, data]) => `${data.label}: prioritize this area next.`),
  };
}

function countSyllableWords(text = '') {
  return String(text || '').split(/[.!?]+/).map((line) => line.trim()).filter(Boolean).length;
}

function buildSpeakingFeedbackLocal({ text = '' } = {}) {
  const safeText = cleanTextValue(text, '');
  const words = safeText ? safeText.split(/\s+/).filter(Boolean).length : 0;
  const sentences = countSyllableWords(safeText);
  const lower = safeText.toLowerCase();
  const connectorHits = (lower.match(/\b(first|however|therefore|for example|in conclusion|moreover)\b/g) || []).length;
  const fillerHits = (lower.match(/\b(like|you know|basically|actually|i mean|kind of|sort of)\b/g) || []).length;
  const notes = [];

  if (words < 35) notes.push('Length is still short. Add one developed example before finishing.');
  else notes.push('Response length is workable for a short speaking turn.');

  if (connectorHits < 2) notes.push('Use clearer connectors such as "however", "for example", and "therefore".');
  else notes.push('Connector use helps coherence.');

  if (fillerHits > 2) notes.push('Reduce filler words and leave short pauses instead.');
  else notes.push('Filler-word control is acceptable.');

  if (!/\b(example|for instance|for example)\b/i.test(safeText)) {
    notes.push('Add one concrete example to sound more academic.');
  }

  return {
    source: 'local-speaking-analysis',
    reply: `Speaking feedback:\n• ${notes.slice(0, 4).join('\n• ')}`,
    metrics: {
      words,
      sentences,
      connectorHits,
      fillerHits,
    },
  };
}

function buildVideoLessonLocal({ topic = '', level = 'B1', durationMin = 4 } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Writing');
  const safeLevel = cleanTextValue(level, 'B1');
  const safeDuration = clampNumberValue(durationMin, 2, 12, 4);
  const each = clampNumberValue((safeDuration * 60) / 4, 25, 110, 45);
  return {
    title: `${safeTopic}: AI Lesson Storyboard`,
    summary: 'Real storyboard generation for lesson structure, narration, and checkpoints.',
    scenes: [
      {
        id: 'scene_intro',
        heading: `${safeTopic}: Core Idea`,
        bullets: ['Definition', 'Why it matters in BUEPT', 'Typical confusion point'],
        narration: `${safeTopic} is an important ${safeLevel}-level area. In this lesson, we define it clearly and connect it to BUEPT-style tasks.`,
        durationSec: each,
        quiz: `In one sentence, define ${safeTopic}.`,
      },
      {
        id: 'scene_rule',
        heading: 'Rule or Strategy',
        bullets: ['Main rule', 'Quick recognition cue', 'Common trap'],
        narration: `The most efficient strategy is to identify the rule trigger first, then test it against meaning and context.`,
        durationSec: each,
        quiz: 'What is the fastest cue you would check first?',
      },
      {
        id: 'scene_example',
        heading: 'Worked Example',
        bullets: ['Read', 'Apply', 'Justify'],
        narration: `Now we apply the rule to a short example and justify the best answer using explicit evidence.`,
        durationSec: each,
        quiz: 'How would you justify the correct answer in one phrase?',
      },
      {
        id: 'scene_transfer',
        heading: 'Exam Transfer',
        bullets: ['Timed use', 'Checklist', 'Self-correction'],
        narration: `To transfer this into the real exam, use a repeatable loop: notice the clue, choose the rule, verify the meaning, and move on.`,
        durationSec: each,
        quiz: 'What is your personal 30-second solving routine?',
      },
    ],
    video: {
      title: `${safeTopic}: Storyboard`,
      videoUrl: '',
      posterUrl: '',
      provider: 'AI storyboard only',
      generated: false,
    },
    source: 'local-storyboard',
  };
}

function normalizeVideoLessonPayload(payload = {}, topic = '') {
  const scenes = Array.isArray(payload.scenes)
    ? payload.scenes
        .map((scene, index) => ({
          id: cleanTextValue(scene?.id, `scene_${index + 1}`),
          heading: cleanTextValue(scene?.heading, `Scene ${index + 1}`),
          bullets: cleanStringList(scene?.bullets, 1, 4),
          narration: cleanTextValue(scene?.narration, 'Explain the main idea clearly.'),
          durationSec: clampNumberValue(scene?.durationSec, 20, 180, 45),
          quiz: cleanTextValue(scene?.quiz, 'What is one key takeaway from this section?'),
        }))
        .slice(0, 8)
    : [];

  return {
    title: cleanTextValue(payload.title, `${topic}: AI Lesson Storyboard`),
    summary: cleanTextValue(payload.summary, 'AI-generated lesson storyboard.'),
    scenes: scenes.length ? scenes : buildVideoLessonLocal({ topic }).scenes,
    video: {
      title: cleanTextValue(payload?.video?.title || payload.videoTitle, `${topic}: Storyboard`),
      videoUrl: cleanTextValue(payload?.video?.videoUrl || payload.videoUrl, ''),
      posterUrl: cleanTextValue(payload?.video?.posterUrl || payload.posterUrl, ''),
      provider: cleanTextValue(payload?.video?.provider || payload.provider, 'AI storyboard only'),
      generated: !!cleanTextValue(payload?.video?.videoUrl || payload.videoUrl, ''),
    },
    source: cleanTextValue(payload.source, 'openai'),
  };
}

async function generateAcademicWritingWithOpenAI({ topic = '', stance = '', level = 'B2' } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Topic');
  const safeStance = cleanTextValue(stance, 'this position is beneficial');
  const safeLevel = cleanTextValue(level, 'B2');
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      template: { type: 'string' },
    },
    required: ['template'],
  };
  const instructions = 'You generate high-quality BUEPT academic essay templates. Produce a usable essay skeleton with clear Introduction, Body Paragraphs, and Conclusion. Return only valid JSON.';
  const input = `Topic: ${safeTopic}\nStance: ${safeStance}\nLevel: ${safeLevel}\nGoal: build a practical academic essay template, not a finished essay.`;
  return callOpenAiStructured({
    model: OPENAI_TEXT_MODEL,
    instructions,
    input,
    schema,
    name: 'academic_writing_template',
  });
}

const WRITING_REVISION_REPLACEMENTS = [
  ['a lot of', 'many'],
  ['very important', 'significant'],
  ['good', 'beneficial'],
  ['bad', 'harmful'],
  ['big', 'substantial'],
  ['show', 'demonstrate'],
  ['shows', 'demonstrates'],
  ['say', 'argue'],
  ['says', 'argues'],
  ['help', 'facilitate'],
  ['helps', 'facilitates'],
  ['problem', 'challenge'],
  ['change', 'transform'],
];

function splitSentencesServer(text = '') {
  const safe = cleanTextValue(text, '');
  const matches = safe.match(/[^.!?]+[.!?]*/g);
  return Array.isArray(matches) ? matches.map((item) => cleanTextValue(item, '')).filter(Boolean) : [];
}

function sentenceCaseServer(text = '') {
  const safe = cleanTextValue(text, '');
  if (!safe) return safe;
  return safe.charAt(0).toUpperCase() + safe.slice(1);
}

function lowerFirstServer(text = '') {
  const safe = cleanTextValue(text, '');
  if (!safe) return safe;
  return safe.charAt(0).toLowerCase() + safe.slice(1);
}

function localReviseSentenceServer(sentence = '') {
  let out = cleanTextValue(sentence, '');
  WRITING_REVISION_REPLACEMENTS.forEach(([from, to]) => {
    const rx = new RegExp(`\\b${from.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    out = out.replace(rx, to);
  });
  out = out.replace(/\s+([,.!?;:])/g, '$1');
  out = out.replace(/([,.!?;:])([A-Za-z])/g, '$1 $2');
  out = out.replace(/\s{2,}/g, ' ').trim();
  return sentenceCaseServer(out);
}

function buildWritingRevisionLocal({ text = '', prompt = '', level = 'B2', task = 'essay' } = {}) {
  const safeText = cleanTextValue(text, '');
  if (!safeText) {
    return {
      revisedText: '',
      summary: 'No text was provided for revision.',
      strengths: [],
      fixes: [],
      rubricNotes: [],
      source: 'local-writing-revision',
      model: '',
      prompt: cleanTextValue(prompt, ''),
    };
  }

  const safeTask = cleanTextValue(task, 'essay');
  const safeLevel = cleanTextValue(level, 'B2');
  const sentences = splitSentencesServer(safeText);
  const lower = safeText.toLowerCase();
  const wordCount = (safeText.match(/\b[a-z']+\b/gi) || []).length;
  const paragraphCount = safeText.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean).length || 1;
  const connectorHits = (lower.match(/\bhowever|therefore|moreover|furthermore|in contrast|for example|as a result|on the other hand\b/g) || []).length;
  const hasThesis = /\b(i believe|in this essay|this essay argues|i argue that|the main point is)\b/i.test(lower);
  const hasConclusion = /\b(in conclusion|to conclude|to sum up|overall|to summarize)\b/i.test(lower);
  const hasExample = /\b(for example|for instance|such as)\b/i.test(lower);

  const revisedSentences = sentences.length ? sentences.map((item) => localReviseSentenceServer(item)) : [localReviseSentenceServer(safeText)];
  let revisedText = revisedSentences.join(' ');
  if (!hasThesis && revisedText) {
    revisedText = `In this essay, ${lowerFirstServer(revisedText)}`;
  }
  if (safeTask === 'essay' && !hasConclusion && revisedText) {
    revisedText = `${revisedText} In conclusion, the argument becomes stronger when the main claim is supported with clearer evidence and tighter organization.`;
  }

  const strengths = [];
  if (wordCount >= 140) strengths.push('The draft is long enough to revise into a full academic response.');
  if (connectorHits >= 2) strengths.push('Some transition control is already present.');
  if (hasExample) strengths.push('The response already shows some supporting evidence.');
  if (paragraphCount >= 3) strengths.push('Paragraph structure is visible.');
  if (!strengths.length) strengths.push('The draft has a usable core idea to develop.');

  const fixes = [];
  if (wordCount < 140) fixes.push('Develop the main argument with one more reason or concrete example.');
  if (paragraphCount < 3 && safeTask === 'essay') fixes.push('Split the response into clearer introduction, body, and conclusion paragraphs.');
  if (connectorHits < 3) fixes.push('Add clearer transitions between body ideas.');
  if (!hasExample) fixes.push('Add a concrete example to strengthen task development.');
  if (!hasConclusion && safeTask === 'essay') fixes.push('End with a sentence that restates the main claim.');
  if (!fixes.length) fixes.push('Focus next on precision, evidence, and final grammar polish.');

  const rubricNotes = [
    'BUEPT scoring is strict on paragraph control, development, and academic tone.',
    connectorHits < 3
      ? 'The current draft still needs stronger cohesion for a high Organization score.'
      : 'Connector use is helping the Organization score.',
    wordCount < 140
      ? 'Task development is limited because the response is still short.'
      : 'Length is now sufficient if the supporting evidence is clear.',
  ];

  return {
    revisedText: cleanTextValue(revisedText, safeText),
    summary: `Local revision completed for a ${safeLevel.toUpperCase()} ${safeTask} draft.`,
    strengths: cleanStringList(strengths, 1, 5),
    fixes: cleanStringList(fixes, 1, 5),
    rubricNotes: cleanStringList(rubricNotes, 1, 5),
    source: 'local-writing-revision',
    model: '',
    prompt: cleanTextValue(prompt, ''),
  };
}

function buildMistakeCoachFallback({ prompt = '', question = '' } = {}) {
  const q = cleanTextValue(question, '');
  const base = cleanTextValue(prompt, '');
  const contextHint = q || base ? 'Use the evidence or rule stated in the question context.' : 'Use the evidence or rule stated in the task.';
  return [
    '• Focus on the exact evidence line or rule that proves the correct option.',
    '• Eliminate choices that add extra information not stated in the passage/audio/lesson.',
    '• Re-check scope words (only, mainly, most, because) before you decide.',
    `• ${contextHint}`,
    '• If two options look similar, pick the one that is fully supported without inference.',
    'Tip: After each question, explain the correct answer in one sentence to lock in the logic.',
  ].join('\n');
}

function normalizeCoachReplyText(text = '') {
  const raw = cleanTextValue(text, '');
  if (!raw) return raw;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return raw;
  const tips = [];
  const rest = [];
  lines.forEach((line) => {
    if (/^tip:/i.test(line)) tips.push(line);
    else rest.push(line);
  });
  const ordered = rest.concat(tips);
  return ordered.join('\n');
}

async function generateMistakeCoachWithOpenAI({ prompt = '', question = '' } = {}) {
  const safePrompt = cleanTextValue(prompt, '');
  const safeQuestion = cleanTextValue(question, '');
  const instructions = [
    'You are the BUEPT Mistake Coach.',
    'Explain why the selected answer is wrong and why the correct option is right.',
    'Respond only in English.',
    'Only discuss the provided mistake. If the user asks something else, politely redirect them to the mistake.',
    'Follow any module focus instructions included in the user prompt.',
    'Use exactly 4 bullet points with the bullet symbol "•".',
    'Finish with one final line starting with "Tip:"',
    'Keep it short, academic, and supportive.',
    'Do not mention being an AI or model.',
  ].join(' ');
  const input = safePrompt || `User question: ${safeQuestion}`;
  return callOpenAiText({
    model: OPENAI_TEXT_MODEL,
    instructions,
    input,
    maxOutputTokens: 320,
    temperature: 0.2,
  });
}

async function generateMistakeCoachWithHF({ prompt = '', question = '' } = {}) {
  const safePrompt = cleanTextValue(prompt, '');
  const safeQuestion = cleanTextValue(question, '');
  const system = [
    'You are the BUEPT Mistake Coach.',
    'Explain why the selected answer is wrong and why the correct option is right.',
    'Respond only in English.',
    'Only discuss the provided mistake. If the user asks something else, politely redirect them to the mistake.',
    'Follow any module focus instructions included in the user prompt.',
    'Use exactly 4 bullet points with the bullet symbol "•".',
    'Finish with one final line starting with "Tip:"',
    'Keep it short, academic, and supportive.',
    'Do not mention being an AI or model.',
  ].join(' ');
  const user = safePrompt || `User question: ${safeQuestion}`;
  return callHfChatCompletion({
    model: HF_CHAT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
    maxTokens: 320,
  });
}

async function generateMistakeCoachWithOllama({ prompt = '', question = '' } = {}) {
  const safePrompt = cleanTextValue(prompt, '');
  const safeQuestion = cleanTextValue(question, '');
  const system = [
    'You are the BUEPT Mistake Coach.',
    'Explain why the selected answer is wrong and why the correct option is right.',
    'Respond only in English.',
    'Only discuss the provided mistake. If the user asks something else, politely redirect them to the mistake.',
    'Follow any module focus instructions included in the user prompt.',
    'Use exactly 4 bullet points with the bullet symbol "•".',
    'Finish with one final line starting with "Tip:"',
    'Keep it short, academic, and supportive.',
    'Do not mention being an AI or model.',
  ].join(' ');
  const user = safePrompt || `User question: ${safeQuestion}`;
  return callOllamaChatCompletion({
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
    maxTokens: 140,
  });
}

function normalizeWritingRevisionPayload(payload = {}, fallback = {}) {
  return {
    revisedText: cleanTextValue(payload.revisedText || payload.revised_text, fallback.revisedText || ''),
    summary: cleanTextValue(payload.summary || payload.coachSummary || payload.coach_summary, fallback.summary || ''),
    strengths: cleanStringList(payload.strengths || fallback.strengths || [], 1, 5),
    fixes: cleanStringList(payload.fixes || payload.improvements || fallback.fixes || [], 1, 5),
    rubricNotes: cleanStringList(payload.rubricNotes || payload.rubric_notes || fallback.rubricNotes || [], 1, 5),
    source: cleanTextValue(payload.source, fallback.source || 'local-writing-revision'),
    model: cleanTextValue(payload.model, fallback.model || ''),
    prompt: cleanTextValue(payload.prompt, fallback.prompt || ''),
  };
}

async function generateWritingRevisionWithOpenAI({ text = '', prompt = '', level = 'B2', task = 'essay' } = {}) {
  const safeText = cleanTextValue(text, '');
  if (!safeText) {
    return {
      ok: false,
      status: 400,
      error: 'TEXT_REQUIRED',
      detail: 'Provide text before calling /api/writing-revision.',
    };
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      revisedText: { type: 'string' },
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
      fixes: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
      rubricNotes: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
    },
    required: ['revisedText', 'summary', 'strengths', 'fixes', 'rubricNotes'],
  };

  const instructions = [
    'You are a BUEPT writing revision engine.',
    'Revise the student draft into a cleaner academic version while preserving the original meaning.',
    'Do not invent new factual claims or examples that are not implied by the source.',
    'Make the language more coherent, more grammatical, and more academic.',
    'The feedback must reflect a strict BUEPT-style rubric focused on content development, organization, vocabulary, grammar, and mechanics.',
    'Return only valid JSON.',
  ].join(' ');

  const input = [
    `Level: ${cleanTextValue(level, 'B2')}`,
    `Task: ${cleanTextValue(task, 'essay')}`,
    `Prompt: ${cleanTextValue(prompt, 'No prompt provided')}`,
    'Student draft:',
    safeText,
  ].join('\n');

  return callOpenAiStructured({
    model: OPENAI_TEXT_MODEL,
    instructions,
    input,
    schema,
    name: 'writing_revision',
  });
}

async function generateSpeakingWithOpenAI({ text = '', history = [] } = {}) {
  const safeText = cleanTextValue(text, '');
  const turns = Array.isArray(history)
    ? history.slice(-6).map((item) => `${item.role || 'user'}: ${cleanTextValue(item.text, '')}`).join('\n')
    : '';
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      reply: { type: 'string' },
    },
    required: ['reply'],
  };
  const instructions = 'You are an English speaking coach for BUEPT learners. Give concise, practical feedback on fluency, coherence, and pronunciation strategy. Return only valid JSON.';
  const input = `Latest response:\n${safeText}\n\nRecent context:\n${turns || 'No prior turns.'}`;
  return callOpenAiStructured({
    model: OPENAI_SPEAKING_MODEL,
    instructions,
    input,
    schema,
    name: 'speaking_feedback',
  });
}

async function generateVideoLessonWithOpenAI({ topic = '', level = 'B1', durationMin = 4 } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Writing');
  const safeLevel = cleanTextValue(level, 'B1');
  const safeDuration = clampNumberValue(durationMin, 2, 12, 4);
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      scenes: {
        type: 'array',
        minItems: 4,
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            heading: { type: 'string' },
            bullets: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 4 },
            narration: { type: 'string' },
            durationSec: { type: 'number' },
            quiz: { type: 'string' },
          },
          required: ['id', 'heading', 'bullets', 'narration', 'durationSec', 'quiz'],
        },
      },
    },
    required: ['title', 'summary', 'scenes'],
  };
  const instructions = 'You build practical English lesson storyboards for BUEPT learners. Generate scenes with narration, bullets, and quick checks. Return only valid JSON.';
  const input = `Topic: ${safeTopic}\nLevel: ${safeLevel}\nDuration: ${safeDuration} minutes\nGoal: a real lesson storyboard, not filler text.`;
  return callOpenAiStructured({
    model: OPENAI_VIDEO_MODEL,
    instructions,
    input,
    schema,
    name: 'video_lesson_storyboard',
  });
}

async function generateSpeakingWithAnyAI({ text = '', history = [], preferLocal = false } = {}) {
  const safeText = cleanTextValue(text, '');
  const turns = Array.isArray(history)
    ? history.slice(-6).map((item) => `${item.role || 'user'}: ${cleanTextValue(item.text, '')}`).join('\n')
    : '';

  const system = [
    'You are an English speaking coach for BUEPT learners.',
    'Respond in English only.',
    'Give concise practical feedback on fluency, coherence, and pronunciation.',
    'Return JSON only in this schema:',
    '{"reply":"string"}',
  ].join(' ');
  const user = `Latest response:\n${safeText}\n\nRecent context:\n${turns || 'No prior turns.'}`;
  const ai = await callAnyModelText({
    system,
    user,
    maxTokens: 280,
    temperature: 0.2,
    preferLocal,
    openaiModel: OPENAI_SPEAKING_MODEL,
  });
  if (!ai.ok) return ai;

  const parsed = parseJsonLoose(ai.text);
  if (!parsed || !cleanTextValue(parsed.reply, '')) {
    return {
      ok: false,
      status: 502,
      error: 'AI_INVALID_JSON',
      detail: 'Speaking model returned invalid JSON.',
    };
  }
  return {
    ok: true,
    status: 200,
    data: { reply: cleanTextValue(parsed.reply, '') },
    source: ai.source,
    model: ai.model || (ai.source === 'ollama' ? OLLAMA_MODEL : ai.source === 'huggingface' ? HF_CHAT_MODEL : OPENAI_SPEAKING_MODEL),
  };
}

async function generateVideoLessonWithAnyAI({ topic = '', level = 'B1', durationMin = 4, preferLocal = false } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Writing');
  const safeLevel = cleanTextValue(level, 'B1');
  const safeDuration = clampNumberValue(durationMin, 2, 12, 4);

  const system = [
    'You build practical English lesson storyboards for BUEPT learners.',
    'Return JSON only with this schema:',
    '{"title":"string","summary":"string","scenes":[{"id":"string","heading":"string","bullets":["string","string","string"],"narration":"string","durationSec":number,"quiz":"string"}]}',
    'Use 4 to 8 scenes. Keep bullets concise.',
  ].join(' ');

  const user = `Topic: ${safeTopic}\nLevel: ${safeLevel}\nDuration: ${safeDuration} minutes\nGoal: a real lesson storyboard, not filler text.`;
  const ai = await callAnyModelText({
    system,
    user,
    maxTokens: 900,
    temperature: 0.25,
    preferLocal,
    openaiModel: OPENAI_VIDEO_MODEL,
  });
  if (!ai.ok) return ai;

  const parsed = parseJsonLoose(ai.text);
  if (!parsed) {
    return {
      ok: false,
      status: 502,
      error: 'AI_INVALID_JSON',
      detail: 'Video model returned invalid JSON.',
    };
  }
  return {
    ok: true,
    status: 200,
    data: normalizeVideoLessonPayload({
      ...parsed,
      source: ai.source || 'ai',
    }, safeTopic),
    source: ai.source,
    model: ai.model || (ai.source === 'ollama' ? OLLAMA_MODEL : ai.source === 'huggingface' ? HF_CHAT_MODEL : OPENAI_VIDEO_MODEL),
  };
}

async function generateWritingRevisionWithAnyAI({ text = '', prompt = '', level = 'B2', task = 'essay', preferLocal = false } = {}) {
  const safeText = cleanTextValue(text, '');
  if (!safeText) {
    return {
      ok: false,
      status: 400,
      error: 'TEXT_REQUIRED',
      detail: 'Provide text before calling writing revision.',
    };
  }

  const system = [
    'You are a BUEPT writing revision engine.',
    'Revise the student draft while preserving meaning.',
    'Return JSON only with this schema:',
    '{"revisedText":"string","summary":"string","strengths":["string"],"fixes":["string"],"rubricNotes":["string"]}',
    'Give strict rubric-aware feedback for prep-level academic writing.',
  ].join(' ');
  const user = [
    `Level: ${cleanTextValue(level, 'B2')}`,
    `Task: ${cleanTextValue(task, 'essay')}`,
    `Prompt: ${cleanTextValue(prompt, 'No prompt provided')}`,
    'Student draft:',
    safeText,
  ].join('\n');

  const ai = await callAnyModelText({
    system,
    user,
    maxTokens: 1100,
    temperature: 0.2,
    preferLocal,
    openaiModel: OPENAI_TEXT_MODEL,
  });
  if (!ai.ok) return ai;

  const parsed = parseJsonLoose(ai.text);
  if (!parsed) {
    return {
      ok: false,
      status: 502,
      error: 'AI_INVALID_JSON',
      detail: 'Writing revision model returned invalid JSON.',
    };
  }

  return {
    ok: true,
    status: 200,
    data: parsed,
    source: ai.source,
    model: ai.model || (ai.source === 'ollama' ? OLLAMA_MODEL : ai.source === 'huggingface' ? HF_CHAT_MODEL : OPENAI_TEXT_MODEL),
  };
}

async function generatePresentationWithAnyAI({ topic = '', durationMin = 10, tone = 'Academic', level = 'B2', preferLocal = false } = {}) {
  const safeTopic = cleanTextValue(topic, 'Academic Topic');
  const safeDuration = clampNumberValue(durationMin, 5, 20, 10);
  const safeTone = cleanTextValue(tone, 'Academic');
  const safeLevel = cleanTextValue(level, 'B2');

  const system = [
    'You generate high-quality presentation decks for BUEPT learners.',
    'Return JSON only using this schema:',
    '{"title":"string","summary":"string","audience":"string","opener":"string","closer":"string","transitions":["string"],"qa_tips":["string"],"delivery_notes":["string"],"slides":[{"title":"string","points":["string","string","string"],"script":"string","cues":"string"}]}',
    'Use 4-8 slides with practical academic structure.',
  ].join(' ');
  const user = `Topic: ${safeTopic}\nDuration: ${safeDuration}\nTone: ${safeTone}\nLevel: ${safeLevel}`;

  const ai = await callAnyModelText({
    system,
    user,
    maxTokens: 1200,
    temperature: 0.2,
    preferLocal,
    openaiModel: OPENAI_PRESENTATION_MODEL,
  });
  if (!ai.ok) return ai;

  const parsed = parseJsonLoose(ai.text);
  if (!parsed) {
    return {
      ok: false,
      status: 502,
      error: 'AI_INVALID_JSON',
      detail: 'Presentation model returned invalid JSON.',
    };
  }

  try {
    return {
      ok: true,
      status: 200,
      data: normalizePresentationDeck(parsed, { topic: safeTopic, model: ai.model }),
      source: ai.source,
      model: ai.model || (ai.source === 'ollama' ? OLLAMA_MODEL : ai.source === 'huggingface' ? HF_CHAT_MODEL : OPENAI_PRESENTATION_MODEL),
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'AI_BAD_SCHEMA',
      detail: cleanTextValue(err?.message, 'Presentation schema validation failed.'),
    };
  }
}

async function generateModuleResponse(kind = '', payload = {}) {
  const normalizedKind = cleanTextValue(kind, '');

  if (normalizedKind === 'interactive_dictionary') {
    const local = buildInteractiveDictionaryLocal(payload.term);
    if (!local) {
      return { ok: false, status: 404, error: 'TERM_NOT_FOUND', detail: 'No dictionary entry found.' };
    }
    return { ok: true, status: 200, data: local };
  }

  if (normalizedKind === 'photo_vocab_extract') {
    return {
      ok: true,
      status: 200,
      data: buildPhotoVocabExtractLocal({
        ocrText: payload.ocrText || payload.text || payload.ocr,
        minLevel: payload.minLevel,
        limit: payload.limit,
      }),
    };
  }

  if (normalizedKind === 'proficiency_mock') {
    return {
      ok: true,
      status: 200,
      data: buildProficiencyMockLocal({
        count: payload.count,
        level: payload.level,
      }),
    };
  }

  if (normalizedKind === 'weak_point_analysis') {
    return {
      ok: true,
      status: 200,
      data: buildWeakPointAnalysisLocal(payload),
    };
  }

  if (normalizedKind === 'academic_writing_template') {
    const ai = await generateAcademicWritingWithOpenAI(payload);
    if (ai.ok) {
      return {
        ok: true,
        status: 200,
        data: {
          source: 'openai',
          template: cleanTextValue(ai.data?.template, buildAcademicWritingTemplateLocal(payload).template),
          model: ai.model || OPENAI_TEXT_MODEL,
        },
      };
    }
    return {
      ok: true,
      status: 200,
      data: {
        ...buildAcademicWritingTemplateLocal(payload),
        diagnostic: ai.detail || ai.error,
      },
    };
  }

  return {
    ok: false,
    status: 400,
    error: 'UNSUPPORTED_MODULE_KIND',
    detail: `Unsupported module kind: ${normalizedKind}`,
  };
}

function sendJson(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendFile(res, filePath, contentType) {
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => sendJson(res, 500, { ok: false, error: 'FILE_READ_ERROR' }));
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  stream.pipe(res);
}

function contentTypeByPath(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

function safeStaticPath(requestPath) {
  const clean = requestPath === '/' ? '/index.html' : requestPath;
  const normalized = path.normalize(clean).replace(/^\.\.[/\\]/, '');
  return path.join(STATIC_ROOT, normalized);
}

function getApkPath(kind) {
  const candidates = APK_FILE_CANDIDATES[kind] || [];
  for (const p of candidates) {
    if (exists(p)) return p;
  }
  return null;
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function getApkMeta(kind) {
  const filePath = getApkPath(kind);
  if (!filePath) return null;
  const stat = fs.statSync(filePath);
  const checksum = await sha256(filePath);
  return {
    kind,
    fileName: path.basename(filePath),
    bytes: stat.size,
    sha256: checksum,
    downloadUrl: `/download/${kind}`
  };
}

const DICT_BLOCKED_HEADWORDS = new Set([
  'can', 'could', 'may', 'might', 'will', 'would', 'shall', 'should', 'must',
  'not', 'who', 'whom', 'which', 'what', 'when', 'where', 'why', 'how',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'here', 'there', 'then', 'than', 'also', 'just', 'only', 'very', 'even', 'more', 'most',
  'get', 'got', 'make', 'made', 'take', 'took', 'give', 'gave', 'have', 'has', 'had', 'know', 'see',
  'like', 'look', 'work', 'time', 'day', 'year', 'way', 'good', 'bad', 'new', 'old', 'right', 'left',
  'out', 'over', 'under', 'into', 'onto', 'about', 'after', 'before', 'during', 'through',
  'all', 'any', 'some', 'many', 'few', 'much', 'other',
]);

const DICT_BANNED = new Set([
  'arse', 'ass', 'bum', 'buns', 'butt', 'buttocks', 'fanny', 'fuck', 'sex', 'intercourse', 'bonk', 'hump', 'laid', 'crap'
]);

function normToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeTerm(value, maxWords = 4) {
  if (!value || !/^[a-z][a-z -]*[a-z]$/.test(value)) return false;
  const tokens = value.split(' ').filter(Boolean);
  if (!tokens.length || tokens.length > maxWords) return false;
  return !tokens.some((t) => t.length < 2);
}

function cleanTermList(values, { headword = '', maxWords = 4, requireHeadword = false } = {}) {
  const hw = normToken(headword);
  const out = [];
  const seen = new Set();
  for (const raw of asList(values)) {
    const normalized = normToken(raw);
    if (!looksLikeTerm(normalized, maxWords)) continue;
    if (DICT_BANNED.has(normalized)) continue;
    if (normalized === hw) continue;
    if (requireHeadword && hw && !new RegExp(`\\b${hw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function cleanExamples(values) {
  const out = [];
  const seen = new Set();
  for (const raw of asList(values)) {
    const line = String(raw || '').trim().replace(/\s+/g, ' ');
    const key = normToken(line);
    if (!line || line.length < 16 || line.length > 220) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line.endsWith('.') || line.endsWith('!') || line.endsWith('?') ? line : `${line}.`);
  }
  return out.slice(0, 5);
}

function buildCollocations(word) {
  const w = normToken(word);
  return cleanTermList([
    `${w} analysis`,
    `${w} in context`,
    `${w} in writing`,
    `use ${w} correctly`,
    `apply ${w} in a sentence`,
  ], { headword: w, maxWords: 4, requireHeadword: true }).slice(0, 8);
}

function normalizeDictionaryEntry(raw, overridesMap, rank = 60, source = 'subset') {
  const word = normToken(raw.word);
  if (!word || word.length < 3) return null;
  if (!/^[a-z][a-z-]*$/.test(word)) return null;
  if (DICT_BLOCKED_HEADWORDS.has(word)) return null;

  const baseDef = String(raw.simple_definition || raw.definition || '').trim().replace(/\s+/g, ' ');
  if (!baseDef || baseDef.length < 10 || baseDef.length > 220) return null;

  const examples = cleanExamples(raw.examples);
  const overrideSynonyms = asList(overridesMap[word.toLowerCase()]);
  const synonyms = cleanTermList([...asList(raw.synonyms), ...overrideSynonyms], { headword: word, maxWords: 4 }).slice(0, 12);
  const antonyms = cleanTermList(raw.antonyms, { headword: word, maxWords: 3 }).slice(0, 8);
  const collocations = cleanTermList(raw.collocations, { headword: word, maxWords: 4, requireHeadword: true }).slice(0, 10);

  return {
    word,
    level: String(raw.level || 'B2').toUpperCase(),
    wordType: String(raw.word_type || '').trim(),
    definition: baseDef.endsWith('.') ? baseDef : `${baseDef}.`,
    synonyms,
    antonyms,
    collocations: collocations.length ? collocations : buildCollocations(word),
    examples,
    rank,
    source,
  };
}

function getDictionaryIndex() {
  const cacheKey = '__dictionary_index__';
  if (dataCache.has(cacheKey)) return dataCache.get(cacheKey);

  const dict = loadJsonCached('dictionary_subset.json', []);
  const academic = loadJsonCached('academic_wordlist.json', []);
  const academicVerbs = loadJsonCached('academic_verbs.json', []);
  const testEnglishVocab = loadJsonCached('test_english_vocab_items.json', []);
  const departments = loadJsonCached('bogazici_department_vocab.json', []);
  const overrides = loadJsonCached('synonym_overrides.json', {});

  const cleaned = [];
  if (Array.isArray(departments)) {
    for (const dept of departments) {
      const words = Array.isArray(dept?.words) ? dept.words : [];
      for (const item of words) {
        const normalized = normalizeDictionaryEntry({
          word: item?.word,
          simple_definition: item?.definition,
          examples: item?.example ? [item.example] : [],
          word_type: 'noun',
          level: 'B2',
        }, overrides, 100, 'department');
        if (normalized) cleaned.push(normalized);
      }
    }
  }

  if (Array.isArray(academicVerbs)) {
    for (const item of academicVerbs) {
      const normalized = normalizeDictionaryEntry({
        word: item?.word,
        simple_definition: item?.definition,
        examples: item?.example ? [item.example] : [],
        word_type: 'verb',
        level: 'B2',
      }, overrides, 95, 'academic-verb');
      if (normalized) cleaned.push(normalized);
    }
  }

  if (Array.isArray(academic)) {
    for (const item of academic) {
      const normalized = normalizeDictionaryEntry({
        word: item?.word,
        simple_definition: item?.definition,
        level: item?.level || 'B2',
      }, overrides, 90, 'academic');
      if (normalized) cleaned.push(normalized);
    }
  }

  if (Array.isArray(testEnglishVocab)) {
    for (const item of testEnglishVocab) {
      const normalized = normalizeDictionaryEntry({
        word: item?.word,
        simple_definition: item?.simple_definition || item?.definition,
        examples: item?.examples || [],
        word_type: item?.word_type || '',
        level: item?.level || 'B1',
        synonyms: item?.synonyms || [],
        antonyms: item?.antonyms || [],
        collocations: item?.collocations || [],
      }, overrides, 93, 'test-english');
      if (normalized) cleaned.push(normalized);
    }
  }

  if (Array.isArray(dict)) {
    for (const item of dict) {
      const normalized = normalizeDictionaryEntry(item, overrides, 60, 'subset');
      if (normalized) cleaned.push(normalized);
    }
  }

  const byWord = new Map();
  for (const entry of cleaned) {
    const key = entry.word.toLowerCase();
    const prev = byWord.get(key);
    if (!prev) {
      byWord.set(key, entry);
      continue;
    }
    const merged = {
      ...prev,
      definition: prev.rank >= entry.rank ? prev.definition : entry.definition,
      level: prev.rank >= entry.rank ? prev.level : entry.level,
      wordType: prev.wordType || entry.wordType,
      synonyms: uniq([...prev.synonyms, ...entry.synonyms]).slice(0, 12),
      antonyms: uniq([...prev.antonyms, ...entry.antonyms]).slice(0, 8),
      collocations: uniq([...prev.collocations, ...entry.collocations]).slice(0, 10),
      examples: uniq([...prev.examples, ...entry.examples]).slice(0, 5),
      rank: Math.max(prev.rank, entry.rank),
      source: prev.rank >= entry.rank ? prev.source : entry.source,
    };
    byWord.set(key, merged);
  }

  const list = Array.from(byWord.values()).sort((a, b) => {
    const rankDiff = Number(b.rank || 0) - Number(a.rank || 0);
    if (rankDiff !== 0) return rankDiff;
    return String(a.word).localeCompare(String(b.word));
  });

  const value = { list, byWord };
  dataCache.set(cacheKey, value);
  return value;
}

function buildVocabularyResponse(query) {
  const q = String(query || '').trim().toLowerCase();
  const { byWord, list } = getDictionaryIndex();
  if (!q) return { hits: [], total: 0 };

  const exact = byWord.get(q);
  const starts = [];
  const contains = [];

  for (const entry of list) {
    const w = entry.word.toLowerCase();
    if (w === q) continue;
    if (w.startsWith(q)) starts.push(entry);
    else if (w.includes(q)) contains.push(entry);
    if (starts.length >= 20 && contains.length >= 20) break;
  }

  const hits = exact ? [exact, ...starts, ...contains] : [...starts, ...contains];
  return {
    hits: hits.slice(0, 25),
    total: hits.length
  };
}

function getDepartmentVocabulary() {
  return loadJsonCached('bogazici_department_vocab.json', []);
}

function normalizeReadingQuestion(q) {
  if (!q) return null;
  return {
    q: String(q.q || q.question || '').trim(),
    options: Array.isArray(q.options) ? q.options.map((x) => String(x)) : [],
    answer: Number.isInteger(q.answer) ? q.answer : null,
    explain: String(q.explain || '').trim(),
    skill: String(q.skill || '').trim()
  };
}

function getRandomReading(level) {
  const tasks = loadJsonCached('reading_tasks.json', []);
  const list = Array.isArray(tasks) ? tasks : [];
  const filtered = level ? list.filter((t) => String(t.level || '').toUpperCase() === level.toUpperCase()) : list;
  const task = pickRandom(filtered.length ? filtered : list);
  if (!task) return null;
  const question = normalizeReadingQuestion(pickRandom(task.questions || []));
  return {
    id: task.id,
    level: task.level,
    title: task.title,
    time: task.time,
    text: task.text,
    question
  };
}

function getRandomGrammar(level) {
  const core = loadJsonCached('grammar_tasks.json', []);
  const hard = loadJsonCached('grammar_tasks_hard.json', []);
  const testEnglish = loadJsonCached('test_english_grammar_tasks.json', []);
  const list = [
    ...(Array.isArray(core) ? core : []),
    ...(Array.isArray(hard) ? hard : []),
    ...(Array.isArray(testEnglish) ? testEnglish : []),
  ];
  const filtered = level ? list.filter((t) => String(t.level || '').toUpperCase() === level.toUpperCase()) : list;
  const task = pickRandom(filtered.length ? filtered : list);
  if (!task) return null;
  const question = normalizeReadingQuestion(pickRandom(task.questions || []));
  return {
    id: task.id,
    level: task.level,
    title: task.title,
    time: task.time,
    explain: task.explain,
    question
  };
}

function getRandomWriting(level) {
  const prompts = loadJsonCached('writing_prompts.json', []);
  const list = Array.isArray(prompts) ? prompts : [];
  const filtered = level ? list.filter((p) => String(p.level || '').toUpperCase() === level.toUpperCase()) : list;
  const item = pickRandom(filtered.length ? filtered : list);
  return item || null;
}

function getListeningPodcasts() {
  const podcasts = loadJsonCached('listening_podcasts.json', []);
  if (!Array.isArray(podcasts)) return [];
  return podcasts.map((p) => ({
    id: p.id,
    title: p.title,
    source: p.source,
    category: p.category,
    level: p.level,
    duration: p.duration,
    focus: p.focus,
    url: p.url
  }));
}

function getCalendarSummary() {
  const schedule = loadJsonCached('university_schedule_2025_fall.json', {});
  const holidays = Array.isArray(schedule.holidays) ? schedule.holidays : [];
  const academicEvents = Array.isArray(schedule.academicEvents) ? schedule.academicEvents : [];
  const programs = Array.isArray(schedule.programs) ? schedule.programs : [];

  return {
    meta: schedule.meta || {},
    holidays: holidays.slice(0, 30),
    academicEvents: academicEvents.slice(0, 30),
    programs: programs.slice(0, 8).map((p) => ({
      program: p.program,
      title: p.title,
      sectionCount: Array.isArray(p.sections) ? p.sections.length : 0,
      sampleSections: Array.isArray(p.sections)
        ? p.sections.slice(0, 3).map((s) => ({
            section: s.section,
            room: s.room,
            instructors: s.instructors,
            slots: Array.isArray(s.slots) ? s.slots.slice(0, 4) : []
          }))
        : []
    }))
  };
}

function buildChatReply(message) {
  const msg = String(message || '').trim();
  const lower = msg.toLowerCase();
  const dictionary = getDictionaryIndex();

  const tips = {
    reading: [
      'Skim once for structure, then scan for evidence sentences before choosing an option.',
      'For each question, underline the exact phrase in the text that supports your answer.',
      'If two options are close, eliminate the one that overstates certainty.'
    ],
    grammar: [
      'Check subject-verb agreement first, then tense consistency, then article usage.',
      'When stuck, test each option inside the full sentence and listen for meaning drift.',
      'For BUEPT style items, one word often breaks both grammar and logic.'
    ],
    writing: [
      'Use a 4-part paragraph: topic sentence, reason, example, concluding link.',
      'Aim for one clear claim per paragraph and connect ideas with precise transitions.',
      'After drafting, run a 3-pass edit: clarity, grammar, then vocabulary upgrade.'
    ],
    listening: [
      'Preview the question focus first (cause, result, opinion, comparison).',
      'Take short keyword notes, not full sentences; prioritize signal words.',
      'If you miss a detail, keep tracking the speaker’s stance and overall direction.'
    ],
    vocab: [
      'Learn collocations with the word, not isolated synonyms.',
      'Write two personal example sentences per word for long-term retention.',
      'Group words by department and recycle them in speaking + writing tasks.'
    ]
  };

  if (!msg) {
    return {
      reply: 'Ask me about reading, grammar, writing, listening, or vocabulary. I can also define a word.',
      suggestions: ['Give me a reading strategy', 'Explain article usage', 'Define resilience']
    };
  }

  const maybeWord = lower.match(/\bdefine\s+([a-z][a-z-]{2,})\b|\bmeaning of\s+([a-z][a-z-]{2,})\b/i);
  const extracted = maybeWord ? (maybeWord[1] || maybeWord[2] || '').toLowerCase() : '';
  if (extracted && dictionary.byWord.has(extracted)) {
    const entry = dictionary.byWord.get(extracted);
    const syn = entry.synonyms.slice(0, 5).join(', ') || 'No synonym available';
    const example = entry.examples[0] || `Use "${entry.word}" in an academic sentence.`;
    return {
      reply: `${entry.word}: ${entry.definition}\nSynonyms: ${syn}\nExample: ${example}`,
      suggestions: ['Give another example sentence', `Show words like ${entry.word}`, 'Quiz me on vocabulary']
    };
  }

  let area = null;
  if (lower.includes('reading') || lower.includes('passage')) area = 'reading';
  if (lower.includes('grammar') || lower.includes('tense') || lower.includes('article')) area = 'grammar';
  if (lower.includes('writing') || lower.includes('essay') || lower.includes('paragraph')) area = 'writing';
  if (lower.includes('listening') || lower.includes('podcast')) area = 'listening';
  if (lower.includes('vocab') || lower.includes('word') || lower.includes('synonym')) area = 'vocab';

  if (area) {
    const pool = tips[area];
    const first = pickRandom(pool) || 'Focus on clear, evidence-based answers.';
    const second = pickRandom(pool.filter((x) => x !== first)) || pool[0];
    return {
      reply: `${area.toUpperCase()} focus:\n1) ${first}\n2) ${second}`,
      suggestions: ['Give me a practice task', 'Create a 1-week plan', 'Evaluate my answer']
    };
  }

  return {
    reply: 'I can help directly with BUEPT practice. Ask for a random reading/grammar question, a writing prompt, or a vocabulary definition.',
    suggestions: ['Random reading question', 'Random grammar question', 'Random writing prompt']
  };
}

function getSummary() {
  const reading = loadJsonCached('reading_tasks.json', []);
  const grammar = loadJsonCached('grammar_tasks.json', []);
  const grammarHard = loadJsonCached('grammar_tasks_hard.json', []);
  const grammarTestEnglish = loadJsonCached('test_english_grammar_tasks.json', []);
  const writing = loadJsonCached('writing_prompts.json', []);
  const listening = loadJsonCached('listening_podcasts.json', []);
  const dict = getDictionaryIndex();
  const departments = getDepartmentVocabulary();

  return {
    readingCount: Array.isArray(reading) ? reading.length : 0,
    grammarCount:
      (Array.isArray(grammar) ? grammar.length : 0) +
      (Array.isArray(grammarHard) ? grammarHard.length : 0) +
      (Array.isArray(grammarTestEnglish) ? grammarTestEnglish.length : 0),
    writingCount: Array.isArray(writing) ? writing.length : 0,
    listeningCount: Array.isArray(listening) ? listening.length : 0,
    dictionaryCount: dict.list.length,
    departmentCount: Array.isArray(departments) ? departments.length : 0
  };
}

function createEmptySyncStore() {
  const now = new Date().toISOString();
  return {
    version: 1,
    updatedAt: now,
    clients: {},
    state: {
      myWords: { updatedAt: '', value: [] },
      unknownWords: { updatedAt: '', value: [] },
      vocabStats: { updatedAt: '', value: {} },
      customDecks: { updatedAt: '', value: [] },
      weeklyProgress: { updatedAt: '', value: {} },
    },
  };
}

function normalizeWordKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z'-]/g, '');
}

function parseTimestamp(value) {
  const t = Date.parse(String(value || ''));
  return Number.isFinite(t) ? t : 0;
}

function readSyncStore() {
  const empty = createEmptySyncStore();
  try {
    if (!fs.existsSync(SYNC_STORE_FILE)) return empty;
    const text = fs.readFileSync(SYNC_STORE_FILE, 'utf8');
    const parsed = JSON.parse(text);
    const out = {
      ...empty,
      ...(parsed || {}),
      clients: (parsed && typeof parsed.clients === 'object' && parsed.clients) || {},
      state: {
        ...empty.state,
        ...((parsed && typeof parsed.state === 'object' && parsed.state) || {}),
      },
    };
    SYNC_FIELDS.forEach((field) => {
      const node = out.state[field];
      if (!node || typeof node !== 'object' || !('value' in node)) {
        out.state[field] = empty.state[field];
      }
    });
    return out;
  } catch (_) {
    return empty;
  }
}

function writeSyncStore(store) {
  try {
    fs.writeFileSync(SYNC_STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (_) {
    // ignore write failures in local mode
  }
}

function readSyncToken(req) {
  const fromHeader = String(req.headers['x-sync-token'] || '').trim();
  if (fromHeader) return fromHeader;
  const auth = String(req.headers.authorization || '').trim();
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? String(match[1] || '').trim() : '';
}

function ensureSyncAuthorized(req, res) {
  if (!SYNC_API_TOKEN) return true;
  const token = readSyncToken(req);
  if (token === SYNC_API_TOKEN) return true;
  sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED_SYNC' });
  return false;
}

function sanitizeWordEntries(items, { source = 'app' } = {}) {
  if (!Array.isArray(items)) return [];
  const { byWord } = getDictionaryIndex();
  const merged = new Map();
  items.forEach((entry) => {
    const rawWord = entry?.word || entry?.sourceText || entry?.text || '';
    const word = normalizeWordKey(rawWord);
    if (!word) return;
    const dict = byWord.get(word);
    const updatedAt = cleanTextValue(entry?.updatedAt || entry?.savedAt || entry?.createdAt || '') || new Date().toISOString();
    const normalized = {
      word,
      word_type: cleanTextValue(entry?.word_type || entry?.wordType || entry?.partOfSpeech || dict?.wordType || ''),
      simple_definition: cleanTextValue(entry?.simple_definition || entry?.definition || entry?.translatedText || dict?.definition || ''),
      synonyms: uniq([...asList(entry?.synonyms), ...(dict?.synonyms || [])]).slice(0, 10),
      antonyms: uniq([...asList(entry?.antonyms), ...(dict?.antonyms || [])]).slice(0, 8),
      examples: uniq([...asList(entry?.examples || entry?.example), ...(dict?.examples || [])]).slice(0, 3),
      level: cleanTextValue(entry?.level || dict?.level || ''),
      source: cleanTextValue(entry?.source || source || 'app'),
      updatedAt,
    };
    const existing = merged.get(word);
    if (!existing || parseTimestamp(normalized.updatedAt) >= parseTimestamp(existing.updatedAt)) {
      merged.set(word, normalized);
    }
  });
  return Array.from(merged.values()).slice(0, 5000);
}

function sanitizeVocabStats(value) {
  const out = {};
  if (!value || typeof value !== 'object') return out;
  Object.entries(value).forEach(([rawWord, rawStat]) => {
    const word = normalizeWordKey(rawWord);
    if (!word) return;
    const known = Math.max(0, Math.min(9999, Number(rawStat?.known || 0)));
    const unknown = Math.max(0, Math.min(9999, Number(rawStat?.unknown || 0)));
    if (!known && !unknown) return;
    out[word] = { known, unknown };
  });
  return out;
}

function sanitizeCustomDecks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((deck) => {
      const title = cleanTextValue(deck?.title || deck?.name || '');
      if (!title) return null;
      const words = sanitizeWordEntries(deck?.words || [], { source: 'app' }).slice(0, 400);
      return {
        id: cleanTextValue(deck?.id || crypto.randomUUID()),
        title,
        words,
        updatedAt: cleanTextValue(deck?.updatedAt || deck?.createdAt || '') || new Date().toISOString(),
      };
    })
    .filter(Boolean)
    .slice(0, 200);
}

function sanitizeWeeklyProgress(value) {
  if (!value || typeof value !== 'object') return {};
  const selectedWeek = Number(value.selectedWeek || 1);
  return {
    version: Number(value.version || 1),
    selectedWeek: Number.isFinite(selectedWeek) ? Math.max(1, Math.min(24, Math.round(selectedWeek))) : 1,
    weekStats: value.weekStats && typeof value.weekStats === 'object' ? value.weekStats : {},
    mistakes: value.mistakes && typeof value.mistakes === 'object' ? value.mistakes : {},
  };
}

function sanitizeSyncField(field, value, { clientId = 'app' } = {}) {
  if (field === 'myWords') return sanitizeWordEntries(value, { source: clientId || 'app' });
  if (field === 'unknownWords') return sanitizeWordEntries(value, { source: clientId || 'extension' });
  if (field === 'vocabStats') return sanitizeVocabStats(value);
  if (field === 'customDecks') return sanitizeCustomDecks(value);
  if (field === 'weeklyProgress') return sanitizeWeeklyProgress(value);
  return value;
}

function normalizeIncomingSyncFields(body = {}, clientId = 'app') {
  const source = body?.state && typeof body.state === 'object' ? body.state : body;
  const defaultUpdatedAt = cleanTextValue(body?.updatedAt || '') || new Date().toISOString();
  const incoming = {};
  SYNC_FIELDS.forEach((field) => {
    if (!(field in source)) return;
    const rawField = source[field];
    let value = rawField;
    let updatedAt = defaultUpdatedAt;
    if (rawField && typeof rawField === 'object' && Object.prototype.hasOwnProperty.call(rawField, 'value')) {
      value = rawField.value;
      updatedAt = cleanTextValue(rawField.updatedAt || '') || defaultUpdatedAt;
    }
    incoming[field] = {
      updatedAt,
      value: sanitizeSyncField(field, value, { clientId }),
    };
  });
  return incoming;
}

function mergeSyncState(store, incomingFields = {}) {
  const next = {
    ...store,
    state: { ...store.state },
  };
  SYNC_FIELDS.forEach((field) => {
    if (!incomingFields[field]) return;
    const incoming = incomingFields[field];
    const existing = next.state[field] || { updatedAt: '', value: null };
    if (parseTimestamp(incoming.updatedAt) >= parseTimestamp(existing.updatedAt)) {
      next.state[field] = {
        updatedAt: incoming.updatedAt,
        value: incoming.value,
      };
    }
  });
  next.updatedAt = new Date().toISOString();
  return next;
}

function buildSyncSnapshot(store) {
  const snapshot = {};
  SYNC_FIELDS.forEach((field) => {
    const node = store?.state?.[field] || { updatedAt: '', value: null };
    snapshot[field] = {
      updatedAt: cleanTextValue(node.updatedAt || ''),
      value: node.value,
    };
  });
  return snapshot;
}

function buildMiniQuizFromSyncState(store, limit = 5) {
  const wordsFromUnknown = (store?.state?.unknownWords?.value || []).map((item) => normalizeWordKey(item?.word));
  const wordsFromKnown = (store?.state?.myWords?.value || []).map((item) => normalizeWordKey(item?.word));
  const vocabStats = store?.state?.vocabStats?.value || {};
  const { list, byWord } = getDictionaryIndex();
  const mergedWords = uniq([...wordsFromUnknown, ...wordsFromKnown]).filter(Boolean);
  if (!mergedWords.length) return [];

  const ranked = mergedWords
    .map((word) => {
      const stat = vocabStats[word] || {};
      const unknown = Number(stat.unknown || 0);
      const known = Number(stat.known || 0);
      return {
        word,
        priority: (unknown * 3) - known + (wordsFromUnknown.includes(word) ? 2 : 0),
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 40);

  const quiz = [];
  for (const item of ranked) {
    if (quiz.length >= limit) break;
    const entry = byWord.get(item.word);
    const correct = cleanTextValue(entry?.definition || '');
    if (!correct) continue;
    const distractors = [];
    while (distractors.length < 3) {
      const candidate = pickRandom(list);
      const def = cleanTextValue(candidate?.definition || '');
      if (!def || def === correct || distractors.includes(def)) continue;
      distractors.push(def);
      if (distractors.length >= 3) break;
    }
    if (!distractors.length) continue;
    const options = uniq([correct, ...distractors]).slice(0, 4);
    const shuffled = options.sort(() => Math.random() - 0.5);
    quiz.push({
      id: `quiz_${item.word}`,
      word: item.word,
      question: `Choose the closest meaning of "${item.word}".`,
      options: shuffled,
      answerIndex: Math.max(0, shuffled.indexOf(correct)),
    });
  }
  return quiz;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function requestHandler(req, res) {
  try {
    const parsed = url.parse(req.url || '', true);
    const pathname = parsed.pathname || '/';

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sync-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      });
      res.end();
      return;
    }

    if (pathname === '/api/status' || pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'buept-web-app-server',
        now: new Date().toISOString(),
        roots: {
          projectRoot: PROJECT_ROOT,
          appRoot: APP_ROOT,
          dataRoot: DATA_ROOT
        }
      });
      return;
    }

    if (pathname === '/api/summary') {
      sendJson(res, 200, { ok: true, summary: getSummary() });
      return;
    }

    if (pathname === '/api/apks') {
      const [release, debug] = await Promise.all([getApkMeta('release'), getApkMeta('debug')]);
      sendJson(res, 200, {
        ok: true,
        apks: [release, debug].filter(Boolean)
      });
      return;
    }

    if (pathname === '/download/release' || pathname === '/download/debug') {
      const kind = pathname.endsWith('release') ? 'release' : 'debug';
      const filePath = getApkPath(kind);
      if (!filePath) {
        sendJson(res, 404, { ok: false, error: 'APK_NOT_FOUND', kind });
        return;
      }
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      sendFile(res, filePath, 'application/vnd.android.package-archive');
      return;
    }

    if (pathname === '/api/vocab/random') {
      const { list } = getDictionaryIndex();
      const item = pickRandom(list);
      sendJson(res, 200, { ok: true, item });
      return;
    }

    if (pathname === '/api/vocab/search') {
      const q = String(parsed.query.q || '').trim();
      const out = buildVocabularyResponse(q);
      sendJson(res, 200, { ok: true, query: q, ...out });
      return;
    }

    if (pathname === '/api/vocab/departments') {
      const rows = getDepartmentVocabulary();
      const departments = Array.isArray(rows)
        ? rows.map((r) => ({
            id: r.id,
            department: r.department,
            wordCount: Array.isArray(r.words) ? r.words.length : 0
          }))
        : [];
      sendJson(res, 200, { ok: true, departments });
      return;
    }

    if (pathname === '/api/vocab/department') {
      const dep = String(parsed.query.department || parsed.query.id || '').trim().toLowerCase();
      const limit = Math.max(1, Math.min(200, Number(parsed.query.limit || 40)));
      const rows = getDepartmentVocabulary();
      const match = Array.isArray(rows)
        ? rows.find((r) => String(r.department || '').toLowerCase() === dep || String(r.id || '').toLowerCase() === dep)
        : null;
      if (!match) {
        sendJson(res, 404, { ok: false, error: 'DEPARTMENT_NOT_FOUND' });
        return;
      }
      const words = Array.isArray(match.words) ? match.words.slice(0, limit) : [];
      sendJson(res, 200, {
        ok: true,
        department: match.department,
        id: match.id,
        words
      });
      return;
    }

    if (pathname === '/api/reading/random') {
      const level = String(parsed.query.level || '').trim() || null;
      const task = getRandomReading(level);
      if (!task) {
        sendJson(res, 404, { ok: false, error: 'NO_READING_TASK' });
        return;
      }
      sendJson(res, 200, { ok: true, task });
      return;
    }

    if (pathname === '/api/grammar/random') {
      const level = String(parsed.query.level || '').trim() || null;
      const task = getRandomGrammar(level);
      if (!task) {
        sendJson(res, 404, { ok: false, error: 'NO_GRAMMAR_TASK' });
        return;
      }
      sendJson(res, 200, { ok: true, task });
      return;
    }

    if (pathname === '/api/writing/random') {
      const level = String(parsed.query.level || '').trim() || null;
      const prompt = getRandomWriting(level);
      if (!prompt) {
        sendJson(res, 404, { ok: false, error: 'NO_WRITING_PROMPT' });
        return;
      }
      sendJson(res, 200, { ok: true, prompt });
      return;
    }

    if (pathname === '/api/listening/podcasts') {
      sendJson(res, 200, { ok: true, podcasts: getListeningPodcasts() });
      return;
    }

    if (pathname === '/api/calendar') {
      sendJson(res, 200, { ok: true, calendar: getCalendarSummary() });
      return;
    }

    if (pathname === '/api/sync/status') {
      if (!ensureSyncAuthorized(req, res)) return;
      const store = readSyncStore();
      sendJson(res, 200, {
        ok: true,
        updatedAt: store.updatedAt,
        fields: Object.fromEntries(
          SYNC_FIELDS.map((field) => [
            field,
            {
              updatedAt: cleanTextValue(store?.state?.[field]?.updatedAt || ''),
              size: Array.isArray(store?.state?.[field]?.value)
                ? store.state[field].value.length
                : (store?.state?.[field]?.value && typeof store.state[field].value === 'object')
                  ? Object.keys(store.state[field].value).length
                  : 0,
            },
          ])
        ),
      });
      return;
    }

    if (pathname === '/api/sync/pull' && req.method === 'GET') {
      if (!ensureSyncAuthorized(req, res)) return;
      const clientId = cleanTextValue(parsed.query.client || parsed.query.clientId || 'app') || 'app';
      const store = readSyncStore();
      const miniQuiz = buildMiniQuizFromSyncState(store, 5);
      sendJson(res, 200, {
        ok: true,
        updatedAt: store.updatedAt,
        state: buildSyncSnapshot(store),
        miniQuiz,
        clientId,
      });
      return;
    }

    if (pathname === '/api/sync/push' && req.method === 'POST') {
      if (!ensureSyncAuthorized(req, res)) return;
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }
      const clientId = cleanTextValue(body.client || body.clientId || 'app') || 'app';
      const incoming = normalizeIncomingSyncFields(body, clientId);
      const before = readSyncStore();
      let merged = mergeSyncState(before, incoming);
      merged.clients = {
        ...(merged.clients || {}),
        [clientId]: {
          updatedAt: new Date().toISOString(),
          fields: Object.keys(incoming),
        },
      };
      writeSyncStore(merged);
      const miniQuiz = buildMiniQuizFromSyncState(merged, 5);
      sendJson(res, 200, {
        ok: true,
        updatedAt: merged.updatedAt,
        state: buildSyncSnapshot(merged),
        miniQuiz,
      });
      return;
    }

    if (pathname === '/api/module' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }
      const kind = body.kind || body.key || body.module || '';
      const generated = await generateModuleResponse(kind, body);
      if (!generated.ok) {
        sendJson(res, generated.status || 400, {
          ok: false,
          error: generated.error,
          detail: generated.detail || '',
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        ...generated.data,
      });
      return;
    }

    if (pathname === '/api/speaking' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }

      const preferLocal = OLLAMA_ENABLED;
      let ai = null;
      if (preferLocal) {
        ai = await generateSpeakingWithAnyAI({
          text: body.text || body.message,
          history: body.history,
          preferLocal: true,
        });
      }
      if (!ai || !ai.ok) {
        ai = await generateSpeakingWithOpenAI({
          text: body.text || body.message,
          history: body.history,
        });
      }
      if (!ai || !ai.ok) {
        ai = await generateSpeakingWithAnyAI({
          text: body.text || body.message,
          history: body.history,
          preferLocal: false,
        });
      }
      if (ai.ok) {
        sendJson(res, 200, {
          ok: true,
          source: ai.source || 'openai',
          model: ai.model || OPENAI_SPEAKING_MODEL,
          reply: cleanTextValue(ai.data?.reply, buildSpeakingFeedbackLocal(body).reply),
          text: cleanTextValue(ai.data?.reply, buildSpeakingFeedbackLocal(body).reply),
        });
        return;
      }

      const fallback = buildSpeakingFeedbackLocal(body);
      sendJson(res, 200, {
        ok: true,
        ...fallback,
        diagnostic: ai.detail || ai.error || '',
        text: fallback.reply,
      });
      return;
    }

    if (pathname === '/api/video-lesson' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }

      const preferLocal = OLLAMA_ENABLED;
      let ai = null;
      if (preferLocal) {
        ai = await generateVideoLessonWithAnyAI({
          topic: body.topic,
          level: body.level,
          durationMin: body.durationMin,
          preferLocal: true,
        });
      }
      if (!ai || !ai.ok) {
        ai = await generateVideoLessonWithOpenAI({
          topic: body.topic,
          level: body.level,
          durationMin: body.durationMin,
        });
      }
      if (!ai || !ai.ok) {
        ai = await generateVideoLessonWithAnyAI({
          topic: body.topic,
          level: body.level,
          durationMin: body.durationMin,
          preferLocal: false,
        });
      }
      if (ai.ok) {
        sendJson(res, 200, {
          ok: true,
          ...normalizeVideoLessonPayload({
            ...ai.data,
            source: ai.source || ai.data?.source || 'openai',
          }, cleanTextValue(body.topic, 'Academic Writing')),
          model: ai.model || OPENAI_VIDEO_MODEL,
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        ...buildVideoLessonLocal({
          topic: body.topic,
          level: body.level,
          durationMin: body.durationMin,
        }),
        source: 'local-storyboard',
        diagnostic: ai.detail || ai.error || '',
      });
      return;
    }

    if (pathname === '/api/writing-revision' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }

      const fallback = buildWritingRevisionLocal({
        text: body.text,
        prompt: body.prompt,
        level: body.level,
        task: body.task,
      });

      const preferLocal = OLLAMA_ENABLED;
      let ai = null;
      if (preferLocal) {
        ai = await generateWritingRevisionWithAnyAI({
          text: body.text,
          prompt: body.prompt,
          level: body.level,
          task: body.task,
          preferLocal: true,
        });
      }
      if (!ai || !ai.ok) {
        ai = await generateWritingRevisionWithOpenAI({
          text: body.text,
          prompt: body.prompt,
          level: body.level,
          task: body.task,
        });
      }
      if (!ai || !ai.ok) {
        ai = await generateWritingRevisionWithAnyAI({
          text: body.text,
          prompt: body.prompt,
          level: body.level,
          task: body.task,
          preferLocal: false,
        });
      }

      if (ai.ok) {
        sendJson(res, 200, {
          ok: true,
          ...normalizeWritingRevisionPayload({
            ...ai.data,
            source: ai.source || 'openai',
            model: ai.model || OPENAI_TEXT_MODEL,
            prompt: cleanTextValue(body.prompt, ''),
          }, fallback),
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        ...fallback,
        source: 'local-writing-revision-fallback',
        diagnostic: ai.detail || ai.error || '',
      });
      return;
    }

    if (pathname === '/api/presentation' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }

      const preferLocal = OLLAMA_ENABLED;
      let generated = null;
      if (preferLocal) {
        generated = await generatePresentationWithAnyAI({
          topic: body.topic,
          durationMin: body.durationMin,
          tone: body.tone,
          level: body.level,
          preferLocal: true,
        });
      }
      if (!generated || !generated.ok) {
        generated = await generatePresentationWithOpenAI({
          topic: body.topic,
          durationMin: body.durationMin,
          tone: body.tone,
          level: body.level,
        });
      }
      if (!generated || !generated.ok) {
        generated = await generatePresentationWithAnyAI({
          topic: body.topic,
          durationMin: body.durationMin,
          tone: body.tone,
          level: body.level,
          preferLocal: false,
        });
      }

      if (!generated.ok) {
        const fallback = buildPresentationFallback({
          topic: body.topic,
          durationMin: body.durationMin,
          tone: body.tone,
          level: body.level,
          diagnostic: generated.detail || generated.error || '',
        });
        sendJson(res, 200, {
          ok: true,
          ...fallback,
          source: 'local-presentation-fallback',
          diagnostic: generated.detail || generated.error || '',
        });
        return;
      }

      sendJson(res, 200, { ok: true, ...generated.data });
      return;
    }

    if (pathname === '/api/mistake-coach' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }

      const prompt = cleanTextValue(body.prompt || body.message || '');
      const question = cleanTextValue(body.question || '');
      if (!prompt && !question) {
        sendJson(res, 400, { ok: false, error: 'PROMPT_REQUIRED' });
        return;
      }

      let ai = null;
      let aiSource = '';
      const preferLocal = OLLAMA_ENABLED || (!HF_TOKEN && !OPENAI_API_KEY);
      if (preferLocal) {
        ai = await generateMistakeCoachWithOllama({ prompt, question });
        if (ai?.ok) aiSource = 'ollama';
      }
      if ((!ai || !ai.ok) && HF_TOKEN) {
        ai = await generateMistakeCoachWithHF({ prompt, question });
        if (ai?.ok) aiSource = 'huggingface';
      }
      if (!ai || !ai.ok) {
        ai = await generateMistakeCoachWithOpenAI({ prompt, question });
        if (ai?.ok) aiSource = 'openai';
      }
      if (!ai || !ai.ok) {
        const fallback = buildMistakeCoachFallback({ prompt, question });
        sendJson(res, 200, {
          ok: true,
          reply: fallback,
          source: 'local-mistake-coach',
          diagnostic: (ai && (ai.detail || ai.error)) || '',
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        reply: normalizeCoachReplyText(ai.text),
        source: aiSource || 'openai',
        model: ai.model || (aiSource === 'huggingface' ? HF_CHAT_MODEL : aiSource === 'ollama' ? OLLAMA_MODEL : OPENAI_TEXT_MODEL),
      });
      return;
    }

    if (pathname === '/api/chat' && req.method === 'POST') {
      let body = {};
      try {
        body = await parseJsonBody(req);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: e.message || 'INVALID_BODY' });
        return;
      }
      const message = String(body.message || '');
      const preferLocal = OLLAMA_ENABLED;
      let ai = null;
      if (message.trim()) {
        ai = await callAnyModelText({
          system: [
            'You are BUEPT AI Coach.',
            'Reply in English only.',
            'Keep the answer concise, practical, and focused on BUEPT prep (reading, listening, grammar, writing, vocab, speaking).',
            'Provide 2 short actionable suggestions at the end in one line starting with "Suggestions:".',
          ].join(' '),
          user: message,
          maxTokens: 260,
          temperature: 0.25,
          preferLocal,
          openaiModel: OPENAI_TEXT_MODEL,
        });
      }

      if (ai && ai.ok) {
        const text = cleanTextValue(ai.text, '');
        const lines = text.split('\n').map((x) => x.trim()).filter(Boolean);
        const suggestionLine = lines.find((line) => /^suggestions:/i.test(line)) || '';
        const suggestions = suggestionLine
          ? suggestionLine.replace(/^suggestions:\s*/i, '').split(/[|,;]/).map((x) => x.trim()).filter(Boolean).slice(0, 3)
          : [];
        const reply = lines.filter((line) => !/^suggestions:/i.test(line)).join('\n') || text;
        sendJson(res, 200, {
          ok: true,
          reply,
          suggestions: suggestions.length ? suggestions : ['Practice one grammar set', 'Review 10 vocabulary items'],
          source: ai.source || 'ai',
          model: ai.model || '',
        });
        return;
      }

      const out = buildChatReply(message);
      sendJson(res, 200, {
        ok: true,
        reply: out.reply,
        suggestions: out.suggestions || [],
        source: 'local-rule'
      });
      return;
    }

    // Static web app
    const staticPath = safeStaticPath(pathname);
    if (exists(staticPath) && fs.statSync(staticPath).isFile()) {
      sendFile(res, staticPath, contentTypeByPath(staticPath));
      return;
    }

    // fallback to SPA
    const fallback = path.join(STATIC_ROOT, 'index.html');
    if (exists(fallback)) {
      sendFile(res, fallback, 'text/html; charset=utf-8');
      return;
    }

    sendJson(res, 404, { ok: false, error: 'NOT_FOUND' });
  } catch (err) {
    sendJson(res, 500, { ok: false, error: 'SERVER_ERROR', detail: String(err.message || err) });
  }
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`BUEPT web app server running at http://${HOST}:${PORT}`);
    console.log(`projectRoot=${PROJECT_ROOT}`);
    console.log(`appRoot=${APP_ROOT}`);
    console.log(`dataRoot=${DATA_ROOT}`);
    console.log(`staticRoot=${STATIC_ROOT}`);
  });
}

module.exports = {
  requestHandler,
  createServer,
};
