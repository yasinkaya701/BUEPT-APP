/* global globalThis */
import { NativeModules, Platform } from 'react-native';

const DEFAULT_API_PORT = 8088;
const STATIC_PROD_API_BASE_URL = 'https://buept-api.vercel.app';

const runtimeAccessConfig = {
  mode: 'hosted',
  baseUrl: '',
  apiKey: '',
  claudeKey: '',
  provider: 'hosted',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:1b',
  openaiModel: 'gpt-4o-mini',
  geminiModel: 'gemini-2.0-flash',
  claudeModel: 'claude-3-5-sonnet-latest',
  label: 'Hosted BUEPT AI',
};

function readInjectedRuntimeConfig() {
  try {
    const cfg = typeof globalThis !== 'undefined' ? globalThis.__BUEPT_RUNTIME_CONFIG__ : null;
    return cfg && typeof cfg === 'object' ? cfg : {};
  } catch (_) {
    return {};
  }
}

export function readRuntimeEnv(name, fallback = '') {
  const injected = readInjectedRuntimeConfig();
  const injectedValue = injected?.[name];
  if (typeof injectedValue === 'string' && injectedValue.trim()) return injectedValue.trim();
  if (typeof injectedValue === 'boolean') return injectedValue ? 'true' : 'false';

  const value = typeof process !== 'undefined' && process.env ? process.env[name] : '';
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function setRuntimeApiAccessConfig(next = {}) {
  const requestedMode = String(next?.mode || 'hosted').trim().toLowerCase();
  runtimeAccessConfig.mode = requestedMode === 'custom' || requestedMode === 'byok' ? requestedMode : 'hosted';
  runtimeAccessConfig.baseUrl = String(next?.baseUrl || '').trim().replace(/\/+$/, '');
  runtimeAccessConfig.apiKey = String(next?.apiKey || '').trim();
  runtimeAccessConfig.claudeKey = String(next?.claudeKey || '').trim();
  runtimeAccessConfig.provider = String(next?.provider || (runtimeAccessConfig.mode === 'hosted' ? 'hosted' : 'gemini')).trim().toLowerCase();
  runtimeAccessConfig.ollamaUrl = String(next?.ollamaUrl || 'http://localhost:11434').trim();
  runtimeAccessConfig.ollamaModel = String(next?.ollamaModel || 'llama3.2:1b').trim();
  runtimeAccessConfig.openaiModel = String(next?.openaiModel || 'gpt-4o-mini').trim();
  runtimeAccessConfig.geminiModel = String(next?.geminiModel || 'gemini-2.0-flash').trim();
  runtimeAccessConfig.claudeModel = String(next?.claudeModel || 'claude-3-5-sonnet-latest').trim();
  runtimeAccessConfig.label = String(next?.label || '').trim() || (runtimeAccessConfig.mode === 'hosted' ? 'Hosted BUEPT AI' : 'Custom AI');
}

export function getRuntimeApiAccessConfig() {
  return { ...runtimeAccessConfig };
}

export function getRuntimeApiKey() {
  return runtimeAccessConfig.apiKey || readRuntimeEnv('BUEPT_API_KEY', '').trim();
}

function getScriptUrl() {
  try {
    const sourceCode = NativeModules?.SourceCode;
    if (typeof sourceCode?.getConstants === 'function') {
      const constants = sourceCode.getConstants();
      if (constants?.scriptURL) return String(constants.scriptURL);
    }
    if (sourceCode?.scriptURL) return String(sourceCode.scriptURL);
  } catch (_) {
    return '';
  }
  return '';
}

function getDevHost() {
  const scriptUrl = getScriptUrl();
  const match = scriptUrl.match(/^https?:\/\/([^/:]+)(?::\d+)?\//i);
  if (match?.[1]) {
    if (match[1] === 'localhost' && Platform.OS === 'android') return '10.0.2.2';
    return match[1];
  }
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
}

export function getDefaultApiBaseUrl(port = DEFAULT_API_PORT) {
  const runtimeBase = String(runtimeAccessConfig.baseUrl || '').trim();
  if (runtimeBase) return runtimeBase;

  const explicitBase = readRuntimeEnv('BUEPT_API_BASE_URL', '').trim();
  if (explicitBase) return explicitBase.replace(/\/+$/, '');

  if (Platform.OS === 'web') {
    try {
      const origin = typeof window !== 'undefined' ? String(window.location?.origin || '').trim() : '';
      const host = typeof window !== 'undefined' ? String(window.location?.hostname || '').trim().toLowerCase() : '';
      const isGithubPagesHost = host.endsWith('github.io');

      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        return origin || '';
      }
      if (isGithubPagesHost) return STATIC_PROD_API_BASE_URL;
      if (origin) return origin;
    } catch (_) {
      return STATIC_PROD_API_BASE_URL;
    }
    return STATIC_PROD_API_BASE_URL;
  }

  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return STATIC_PROD_API_BASE_URL;
  }
  return `http://${getDevHost()}:${port}`;
}

export function resolveApiEndpoint(envName, fallbackPath = '', { port = DEFAULT_API_PORT } = {}) {
  const explicit = readRuntimeEnv(envName);
  if (explicit) return explicit;

  const baseOverride = String(runtimeAccessConfig.baseUrl || '').trim() || readRuntimeEnv('BUEPT_API_BASE_URL');
  const base = (baseOverride || getDefaultApiBaseUrl(port)).replace(/\/+$/, '');
  if (!base) return '';
  if (!fallbackPath) return base;
  return `${base}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
}

export function getAiHeaders(extra = {}) {
  const cfg = getRuntimeApiAccessConfig();
  const provider = String(cfg?.provider || 'hosted').trim().toLowerCase();
  const headers = { ...extra, 'X-Client-Provider': provider };

  if (provider === 'ollama') {
    headers['X-Client-Ollama-Url'] = String(cfg?.ollamaUrl || 'http://localhost:11434').trim();
    headers['X-Client-Ollama-Model'] = String(cfg?.ollamaModel || 'llama3.2:1b').trim();
  }

  // Never forward a browser/mobile BYOK secret to the hosted BUEPT API.
  // Direct provider helpers below send credentials only to the selected provider.
  return headers;
}

async function readErrorBody(res) {
  const text = await res.text().catch(() => '');
  return String(text || '').slice(0, 800);
}

export async function requestHostedAiChat({
  systemPrompt = '',
  messages = [],
  jsonFormat = false,
  signal = null,
  capability = 'general',
}) {
  const endpoint = resolveApiEndpoint('BUEPT_AI_API_URL', '/api/ai/chat');
  if (!endpoint) throw new Error('Hosted BUEPT AI is not configured.');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Provider': 'hosted' },
    body: JSON.stringify({ capability, systemPrompt, messages, jsonFormat }),
    signal,
  });

  if (!res.ok) {
    const detail = await readErrorBody(res);
    const error = new Error(`Hosted BUEPT AI failed (${res.status})${detail ? `: ${detail}` : ''}`);
    error.status = res.status;
    throw error;
  }

  const payload = await res.json().catch(() => ({}));
  return payload?.text ?? payload?.content ?? payload?.message ?? '';
}

export async function fetchDirectOllamaChat({
  systemPrompt = '',
  messages = [],
  jsonFormat = false,
  signal = null,
  configOverride = null,
}) {
  const cfg = configOverride || getRuntimeApiAccessConfig();
  const ollamaUrl = String(cfg.ollamaUrl || 'http://localhost:11434').trim().replace(/\/+$/, '');
  const model = String(cfg.ollamaModel || 'llama3.2:1b').trim();
  const endpoint = `${ollamaUrl}/api/chat`;

  const ollamaMessages = [];
  if (systemPrompt) ollamaMessages.push({ role: 'system', content: systemPrompt });
  messages.forEach((m) => ollamaMessages.push({ role: m.role || 'user', content: m.content || m.text || '' }));

  const payload = { model, messages: ollamaMessages, stream: false };
  if (jsonFormat) payload.format = 'json';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed (${res.status}): ${await readErrorBody(res)}`);
  }

  const json = await res.json();
  return json?.message?.content || '';
}

export async function fetchDirectGeminiChat({
  systemPrompt = '',
  messages = [],
  jsonFormat = false,
  signal = null,
  apiKeyOverride = null,
  modelOverride = null,
}) {
  const cfg = getRuntimeApiAccessConfig();
  const apiKey = String(apiKeyOverride || cfg.apiKey || '').trim();
  if (!apiKey) throw new Error('Gemini API key is missing.');

  const model = String(modelOverride || cfg.geminiModel || 'gemini-2.0-flash').trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }],
  }));
  const payload = { contents };

  if (systemPrompt) payload.systemInstruction = { parts: [{ text: systemPrompt }] };
  if (jsonFormat) payload.generationConfig = { responseMimeType: 'application/json' };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Gemini request failed (${res.status}): ${await readErrorBody(res)}`);
  }

  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function fetchDirectOpenAIChat({
  systemPrompt = '',
  messages = [],
  jsonFormat = false,
  signal = null,
  apiKeyOverride = null,
  modelOverride = null,
}) {
  const cfg = getRuntimeApiAccessConfig();
  const apiKey = String(apiKeyOverride || cfg.apiKey || '').trim();
  if (!apiKey) throw new Error('OpenAI API key is missing.');

  const model = String(modelOverride || cfg.openaiModel || 'gpt-4o-mini').trim();
  const oaiMessages = [];
  if (systemPrompt) oaiMessages.push({ role: 'system', content: systemPrompt });
  messages.forEach((m) => oaiMessages.push({ role: m.role || 'user', content: m.content || m.text || '' }));

  const payload = { model, messages: oaiMessages };
  if (jsonFormat) payload.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed (${res.status}): ${await readErrorBody(res)}`);
  }

  const json = await res.json();
  return json?.choices?.[0]?.message?.content || '';
}

export async function fetchDirectClaudeChat({
  systemPrompt = '',
  messages = [],
  jsonFormat = false,
  signal = null,
  apiKeyOverride = null,
  modelOverride = null,
}) {
  const cfg = getRuntimeApiAccessConfig();
  const apiKey = String(apiKeyOverride || cfg.claudeKey || '').trim();
  if (!apiKey) throw new Error('Claude API key is missing.');

  const model = String(modelOverride || cfg.claudeModel || 'claude-3-5-sonnet-latest').trim();
  const anthropicMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content || m.text || '',
  }));

  const payload = { model, max_tokens: 4096, messages: anthropicMessages };
  if (systemPrompt) payload.system = systemPrompt;

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
    throw new Error(`Claude request failed (${res.status}): ${await readErrorBody(res)}`);
  }

  const json = await res.json();
  const text = json?.content?.find?.((item) => item?.type === 'text')?.text;
  if (jsonFormat && typeof text !== 'string') return '';
  return text || '';
}

export async function executeDirectAiChat({
  systemPrompt = '',
  messages = [],
  jsonFormat = false,
  signal = null,
  capability = 'general',
}) {
  const cfg = getRuntimeApiAccessConfig();
  const mode = String(cfg.mode || 'hosted').trim().toLowerCase();
  const provider = String(cfg.provider || 'hosted').trim().toLowerCase();

  if (mode === 'hosted' || provider === 'hosted') {
    return requestHostedAiChat({ systemPrompt, messages, jsonFormat, signal, capability });
  }

  // Privacy rule: use only the provider the user explicitly selected.
  // Never silently fail over to another company/provider.
  if (provider === 'gemini') {
    return fetchDirectGeminiChat({ systemPrompt, messages, jsonFormat, signal });
  }
  if (provider === 'openai') {
    return fetchDirectOpenAIChat({ systemPrompt, messages, jsonFormat, signal });
  }
  if (provider === 'claude' || provider === 'anthropic') {
    return fetchDirectClaudeChat({ systemPrompt, messages, jsonFormat, signal });
  }
  if (provider === 'ollama') {
    return fetchDirectOllamaChat({ systemPrompt, messages, jsonFormat, signal });
  }

  throw new Error(`Unsupported AI provider: ${provider || 'unknown'}`);
}
