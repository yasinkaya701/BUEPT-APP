'use strict';

const DEFAULT_TIMEOUT_MS = 22000;

function env(name, fallback = '') {
  const value = process.env?.[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

async function readError(res) {
  const text = await res.text().catch(() => '');
  return String(text || '').slice(0, 1200);
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
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY is not configured'), { code: 'AI_PROVIDER_NOT_CONFIGURED' });
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
  if (!res.ok) {
    const error = new Error(`Gemini upstream failed (${res.status}): ${await readError(res)}`);
    error.code = res.status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM_ERROR';
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  return {
    text: json?.candidates?.[0]?.content?.parts?.[0]?.text || '',
    provider: 'gemini',
    model,
  };
}

async function callOpenAI({ systemPrompt = '', messages = [], jsonFormat = false, signal }) {
  const apiKey = env('OPENAI_API_KEY');
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY is not configured'), { code: 'AI_PROVIDER_NOT_CONFIGURED' });
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
  if (!res.ok) {
    const error = new Error(`OpenAI upstream failed (${res.status}): ${await readError(res)}`);
    error.code = res.status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM_ERROR';
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  return {
    text: json?.choices?.[0]?.message?.content || '',
    provider: 'openai',
    model,
  };
}

async function callAnthropic({ systemPrompt = '', messages = [], signal }) {
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) throw Object.assign(new Error('ANTHROPIC_API_KEY is not configured'), { code: 'AI_PROVIDER_NOT_CONFIGURED' });
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
  if (!res.ok) {
    const error = new Error(`Anthropic upstream failed (${res.status}): ${await readError(res)}`);
    error.code = res.status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM_ERROR';
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  return {
    text: json?.content?.find?.((item) => item?.type === 'text')?.text || '',
    provider: 'anthropic',
    model,
  };
}

function configuredProvider() {
  const explicit = env('BUEPT_AI_PROVIDER').toLowerCase();
  if (explicit) return explicit;
  if (env('GEMINI_API_KEY')) return 'gemini';
  if (env('OPENAI_API_KEY')) return 'openai';
  if (env('ANTHROPIC_API_KEY')) return 'anthropic';
  return '';
}

async function runHostedAi(input = {}) {
  const provider = configuredProvider();
  if (!provider) {
    const error = new Error('Hosted AI is not configured on the server.');
    error.code = 'AI_PROVIDER_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }

  const timeout = withTimeout(Number(env('BUEPT_AI_TIMEOUT_MS', DEFAULT_TIMEOUT_MS)) || DEFAULT_TIMEOUT_MS);
  const request = {
    systemPrompt: String(input?.systemPrompt || ''),
    messages: normalizeMessages(input?.messages),
    jsonFormat: Boolean(input?.jsonFormat),
    signal: timeout.signal,
  };

  try {
    if (provider === 'gemini') return await callGemini(request);
    if (provider === 'openai') return await callOpenAI(request);
    if (provider === 'anthropic' || provider === 'claude') return await callAnthropic(request);
    const error = new Error(`Unsupported hosted AI provider: ${provider}`);
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
  configuredProvider,
  runHostedAi,
};
