import { readRuntimeEnv, resolveApiEndpoint } from './runtimeApi';

const CHAT_ENDPOINT = resolveApiEndpoint('BUEPT_CHAT_API_URL', '/api/chat');

const CHAT_API_KEY = readRuntimeEnv('BUEPT_API_KEY');

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;

function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

function authHeaders(extra = {}) {
  if (!CHAT_API_KEY) return extra;
  return { ...extra, Authorization: `Bearer ${CHAT_API_KEY}` };
}

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

export async function requestChatbotReply({ message, mode = 'coach', history = [] } = {}) {
  if (!CHAT_ENDPOINT || !message) return null;

  const payload = {
    message: String(message),
    mode,
    history: Array.isArray(history)
      ? history.slice(-10).map((m) => ({ role: m.role, text: m.text || m.content || '' }))
      : [],
    app: 'buept-mobile',
  };

  let lastErr = null;
  for (let attempt = 0; attempt <= DEFAULT_RETRIES; attempt += 1) {
    const timeout = withTimeout();
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
        signal: timeout.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      const normalized = normalizeReply(json);
      if (!normalized.text) return null;
      return normalized;
    } catch (e) {
      lastErr = e;
      if (attempt < DEFAULT_RETRIES) {
        await new Promise((r) => setTimeout(r, 450));
        continue;
      }
    } finally {
      timeout.clear();
    }
  }
  if (typeof __DEV__ !== 'undefined' && __DEV__ && lastErr) {
    console.warn('chatbot online fallback failed:', lastErr?.message || String(lastErr));
  }
  return null;
}
