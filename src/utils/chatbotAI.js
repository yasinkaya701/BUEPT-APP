import { resolveApiEndpoint, getAiHeaders, executeDirectAiChat, isHostedAiMode } from './runtimeApi';
import { buildAIMessages } from './aiMessages';

const CHAT_ENDPOINT = resolveApiEndpoint('BUEPT_CHAT_API_URL', '/api/chat');

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;

const LOCAL_ROUTE_MAP = [
  { match: ['reading', 'passage', 'skim', 'scan'], navigate: 'Reading', label: 'Reading' },
  { match: ['listening', 'podcast', 'audio', 'lecture'], navigate: 'Listening', label: 'Listening' },
  { match: ['grammar', 'tense', 'preposition', 'article'], navigate: 'Grammar', label: 'Grammar' },
  { match: ['writing', 'essay', 'paragraph', 'revision', 'rubric'], navigate: 'Writing', label: 'Writing' },
  { match: ['vocab', 'vocabulary', 'synonym', 'antonym', 'word family', 'collocation'], navigate: 'Vocab', label: 'Vocab' },
  { match: ['speaking', 'pronunciation', 'fluency', 'speech'], navigate: 'Speaking', label: 'Speaking' },
];

function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

// authHeaders is now handled by getAiHeaders from runtimeApi.js

function normalizeReply(payload = {}) {
  const text = payload.reply || payload.text || payload.message || payload.content || '';
  const chips = Array.isArray(payload.chips) ? payload.chips : [];
  const artifact = payload.artifact && payload.artifact.title && payload.artifact.content
    ? payload.artifact
    : null;
  const navigate = typeof payload.navigate === 'string' ? payload.navigate : null;
  return {
    text: String(text || '').trim(),
    chips,
    artifact,
    navigate,
    nextQuizState: undefined,
    source: 'online',
  };
}

export function isChatApiConfigured() {
  return !!CHAT_ENDPOINT;
}

function buildLocalReply({ message = '', mode = 'coach' } = {}) {
  const text = String(message || '').trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  const routeMatch = LOCAL_ROUTE_MAP.find((item) => item.match.some((token) => lower.includes(token)));
  const focus = routeMatch?.label || 'practice';
  const chips = routeMatch
    ? [`Open ${routeMatch.label}`, `${routeMatch.label} strategy`, 'Explain my mistake']
    : ['Build a study plan', 'Give me a quick task', 'Explain my mistake'];

  let reply = `Let's keep this practical. `;
  if (mode === 'writing') {
    reply += 'Write one clear claim, support it with one precise example, then revise repeated words before you submit.';
  } else if (mode === 'speaking') {
    reply += 'Aim for one main idea, one reason, and one example in each answer so your fluency stays controlled.';
  } else if (mode === 'coach') {
    reply += `I can guide you through ${focus.toLowerCase()} step by step even when the online model is offline.`;
  } else {
    reply += `We can still work locally on ${focus.toLowerCase()} with structured feedback and short next steps.`;
  }

  if (routeMatch) {
    reply += ` Open the ${routeMatch.label} workspace if you want the strongest task-specific tools.`;
  } else {
    reply += ' Tell me whether you want reading, listening, grammar, writing, vocab, or speaking help.';
  }

  return {
    text: reply,
    chips,
    artifact: routeMatch
      ? {
          title: `${routeMatch.label} action plan`,
          content: [
            `1. Open ${routeMatch.label}.`,
            '2. Complete one focused task.',
            '3. Ask the coach why each mistake happened.',
          ].join('\n'),
        }
      : null,
    navigate: routeMatch?.navigate || null,
    nextQuizState: undefined,
    source: 'local',
  };
}

export async function requestChatbotReply({ message, mode = 'coach', history = [] } = {}) {
  if (!message) return null;

  const localFallback = buildLocalReply({ message, mode });
  const payload = {
    message: String(message),
    mode,
    history: Array.isArray(history) ? history.slice(-15) : [],
    app: 'buept-app',
  };

  // BYOK/local mode is strict: call only the provider the learner selected.
  // A provider failure falls back to deterministic local coaching, never to
  // the hosted BUEPT backend or a different AI company.
  if (!isHostedAiMode()) {
    const timeout = withTimeout();
    try {
      const finalMessages = buildAIMessages(payload.history, payload.message);
      const directReply = await executeDirectAiChat({
        systemPrompt: `You are BUEPT AI, a professional academic English coach.
Keep the conversation focused on English proficiency preparation and respond in clear English.
Give specific, actionable explanations and short next steps. Do not invent official exam rules.`,
        messages: finalMessages,
        signal: timeout.signal,
        capability: 'chat',
      });

      if (directReply) {
        return { text: String(directReply).trim(), source: 'byok' };
      }
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('Selected AI provider failed:', error?.message || String(error));
      }
    } finally {
      timeout.clear();
    }
    return { ...localFallback, source: 'local' };
  }

  // Hosted mode uses exactly one backend contract. Do not first call
  // /api/ai/chat and then retry through /api/chat; that used to double spend.
  if (!CHAT_ENDPOINT) return localFallback;

  let lastErr = null;
  for (let attempt = 0; attempt <= DEFAULT_RETRIES; attempt += 1) {
    const timeout = withTimeout();
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: getAiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
        signal: timeout.signal,
      });
      if (!res.ok) {
        const error = new Error(`Hosted chat failed (${res.status})`);
        error.status = res.status;
        throw error;
      }
      const json = await res.json().catch(() => ({}));
      const normalized = normalizeReply(json);
      if (normalized.text) return normalized;
      throw new Error('Hosted chat returned an empty response.');
    } catch (error) {
      lastErr = error;
      if (attempt < DEFAULT_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
    } finally {
      timeout.clear();
    }
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__ && lastErr) {
    console.warn('Hosted chat failed:', lastErr?.message || String(lastErr));
  }
  return { ...localFallback, source: 'local' };
}
