'use strict';

const DEFAULT_TIMEOUT_MS = 22000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 120000;
const PROVIDER_ALIASES = new Map([
  ['gemini', 'gemini'],
  ['openai', 'openai'],
  ['anthropic', 'anthropic'],
  ['claude', 'anthropic'],
]);

function env(name, fallback = '') {
  const value = process.env?.[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function clampTimeout(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TIMEOUT_MS;
  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, Math.round(parsed)));
}

function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), clampTimeout(ms));
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

async function captureUpstreamDetail(res) {
  const text = await res.text().catch(() => '');
  return String(text || '').slice(0, 1200);
}

function upstreamError(provider, status, detail = '') {
  const code = status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM_ERROR';
  const error = new Error(
    status === 429
      ? `${provider} is temporarily rate-limited.`
      : `${provider} could not complete the request.`,
  );
  error.code = code;
  error.status = status === 429 ? 429 : 502;
  error.upstreamStatus = status;
  // Kept only for server-side diagnostics. server/app.js never serializes it.
  error.upstreamDetail = String(detail || '').slice(0, 1200);
  return error;
}

function normalizeMessages(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .map((item) => ({
      role: item?.role === 'assistant' ? 'assistant' : 'user',
      content: String(item?.content || item?.text || '').trim(),
    }))
    .filter((item) => item.content);
}

async function callGemini({ systemPrompt = '', messages = [], jsonFormat = false, signal }) {
  const apiKey = env('GEMINI_API_KEY');
  if (!apiKey) {
    throw Object.assign(new Error('Hosted Gemini is not configured.'), {
      code: 'AI_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }
  const model = env('BUEPT_GEMINI_MODEL', 'gemini-2.0-flash');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    contents: normalizeMessages(messages).map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    })),
  };
  if (systemPrompt) payload.systemInstruction = { parts: [{ text: String(systemPrompt) }] };
  if (jsonFormat) payload.generationConfig = { responseMimeType: 'application/json' };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw upstreamError('Gemini', res.status, await captureUpstreamDetail(res));

  const json = await res.json();
  return {
    text: json?.candidates?.[0]?.content?.parts?.[0]?.text || '',
    provider: 'gemini',
    model,
  };
}

async function callOpenAI({ systemPrompt = '', messages = [], jsonFormat = false, signal }) {
  const apiKey = env('OPENAI_API_KEY');
  if (!apiKey) {
    throw Object.assign(new Error('Hosted OpenAI is not configured.'), {
      code: 'AI_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }
  const model = env('BUEPT_OPENAI_MODEL', 'gpt-4o-mini');
  const upstreamMessages = [];
  if (systemPrompt) upstreamMessages.push({ role: 'system', content: String(systemPrompt) });
  upstreamMessages.push(...normalizeMessages(messages));
  const payload = { model, messages: upstreamMessages };
  if (jsonFormat) payload.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw upstreamError('OpenAI', res.status, await captureUpstreamDetail(res));

  const json = await res.json();
  return {
    text: json?.choices?.[0]?.message?.content || '',
    provider: 'openai',
    model,
  };
}

async function callAnthropic({ systemPrompt = '', messages = [], signal }) {
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw Object.assign(new Error('Hosted Anthropic is not configured.'), {
      code: 'AI_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }
  const model = env('BUEPT_ANTHROPIC_MODEL', 'claude-3-5-sonnet-latest');
  const payload = {
    model,
    max_tokens: 4096,
    messages: normalizeMessages(messages),
  };
  if (systemPrompt) payload.system = String(systemPrompt);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw upstreamError('Anthropic', res.status, await captureUpstreamDetail(res));

  const json = await res.json();
  return {
    text: json?.content?.find?.((item) => item?.type === 'text')?.text || '',
    provider: 'anthropic',
    model,
  };
}

function normalizeProvider(value = '') {
  return PROVIDER_ALIASES.get(String(value || '').trim().toLowerCase()) || '';
}

function configuredProvider() {
  const explicitRaw = env('BUEPT_AI_PROVIDER');
  if (explicitRaw) return normalizeProvider(explicitRaw);
  if (env('GEMINI_API_KEY')) return 'gemini';
  if (env('OPENAI_API_KEY')) return 'openai';
  if (env('ANTHROPIC_API_KEY')) return 'anthropic';
  return '';
}

async function runHostedAi(input = {}) {
  const provider = configuredProvider();
  if (!provider) {
    const explicit = env('BUEPT_AI_PROVIDER');
    const error = new Error(
      explicit
        ? 'Hosted AI provider configuration is unsupported or incomplete.'
        : 'Hosted AI is not configured on the server.',
    );
    error.code = explicit ? 'AI_PROVIDER_UNSUPPORTED' : 'AI_PROVIDER_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }

  const messages = normalizeMessages(input?.messages);
  if (!messages.length) {
    const error = new Error('Hosted AI requires at least one non-empty message.');
    error.code = 'INVALID_AI_REQUEST';
    error.status = 400;
    throw error;
  }

  const timeout = withTimeout(env('BUEPT_AI_TIMEOUT_MS', String(DEFAULT_TIMEOUT_MS)));
  const request = {
    systemPrompt: String(input?.systemPrompt || ''),
    messages,
    jsonFormat: Boolean(input?.jsonFormat),
    signal: timeout.signal,
  };

  try {
    if (provider === 'gemini') return await callGemini(request);
    if (provider === 'openai') return await callOpenAI(request);
    if (provider === 'anthropic') return await callAnthropic(request);

    const error = new Error('Hosted AI provider is unsupported.');
    error.code = 'AI_PROVIDER_UNSUPPORTED';
    error.status = 503;
    throw error;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Hosted AI request timed out.');
      timeoutError.code = 'AI_TIMEOUT';
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    timeout.clear();
  }
}

module.exports = {
  clampTimeout,
  configuredProvider,
  normalizeMessages,
  normalizeProvider,
  runHostedAi,
};
