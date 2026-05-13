import { NativeModules, Platform } from 'react-native';

const DEFAULT_API_PORT = 8088;
// External API fallback used by GitHub Pages deployments that cannot host serverless routes.
const STATIC_PROD_API_BASE_URL = 'https://buept-api.vercel.app';
const runtimeAccessConfig = {
  mode: 'hosted',
  baseUrl: '',
  apiKey: 'AIzaSyAaAbaervIT28OsrSf2rPmUzpyzOiPhjiA', // Provided by user (Gemini)
  claudeKey: '',          // Anthropic Key
  provider: 'gemini',     // Default to gemini
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:1b',
  label: 'BUEPT AI Platform',
};

export function readRuntimeEnv(name, fallback = '') {
  const value = typeof process !== 'undefined' && process.env ? process.env[name] : '';
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function setRuntimeApiAccessConfig(next = {}) {
  runtimeAccessConfig.mode       = String(next?.mode     || 'hosted').trim() || 'hosted';
  runtimeAccessConfig.baseUrl    = String(next?.baseUrl  || '').trim();
  runtimeAccessConfig.apiKey     = String(next?.apiKey   || '').trim();
  runtimeAccessConfig.claudeKey   = String(next?.claudeKey || '').trim();
  runtimeAccessConfig.provider   = String(next?.provider || 'gemini').trim() || 'gemini';
  runtimeAccessConfig.ollamaUrl  = String(next?.ollamaUrl  || 'http://localhost:11434').trim();
  runtimeAccessConfig.ollamaModel= String(next?.ollamaModel || 'llama3.2:1b').trim();
  runtimeAccessConfig.label      = String(next?.label    || '').trim() || 'BUEPT AI Platform';
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
  if (explicitBase) return explicitBase;

  if (Platform.OS === 'web') {
    try {
      const origin = typeof window !== 'undefined' ? String(window.location?.origin || '').trim() : '';
      const host = typeof window !== 'undefined' ? String(window.location?.hostname || '').trim().toLowerCase() : '';
      const webPort = typeof window !== 'undefined' ? String(window.location?.port || '').trim() : '';
      const isLocalHost = host === 'localhost' || host === '127.0.0.1';
      const isGithubPagesHost = host.endsWith('github.io');

      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        return origin || '';
      }

      if (isLocalHost && webPort === String(port)) {
        return origin || '';
      }

      if (isLocalHost) {
        return origin || '';
      }

      // GitHub Pages can only host the frontend, so keep using the dedicated API host there.
      if (isGithubPagesHost) {
        return readRuntimeEnv('BUEPT_API_BASE_URL', STATIC_PROD_API_BASE_URL).trim() || '';
      }

      // Full-stack web deploys (Vercel/Netlify/local server) should use same-origin /api routes.
      if (origin) {
        return origin;
      }
    } catch (_) {
      return readRuntimeEnv('BUEPT_API_BASE_URL', STATIC_PROD_API_BASE_URL).trim() || '';
    }

    return readRuntimeEnv('BUEPT_API_BASE_URL', STATIC_PROD_API_BASE_URL).trim() || '';
  }

  // In production, only use an explicit API base (public backend).
  // This keeps the app keyless/offline by default on all phones.
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    const prodBase = readRuntimeEnv('BUEPT_API_BASE_URL', STATIC_PROD_API_BASE_URL).trim();
    return prodBase || '';
  }
  return `http://${getDevHost()}:${port}`;
}

export function resolveApiEndpoint(envName, fallbackPath = '', { port = DEFAULT_API_PORT } = {}) {
  const explicit = readRuntimeEnv(envName);
  if (explicit) return explicit;

  const baseOverride = String(runtimeAccessConfig.baseUrl || '').trim() || readRuntimeEnv('BUEPT_API_BASE_URL');
  const base = baseOverride || getDefaultApiBaseUrl(port);
  if (!base) return '';
  if (!fallbackPath) return base;
  return `${base}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
}

export function getAiHeaders(extra = {}) {
  const cfg = getRuntimeApiAccessConfig();
  const byok = String(cfg?.apiKey || '').trim();
  const prov = String(cfg?.provider || 'gemini').trim();
  const runtimeKey = runtimeAccessConfig.apiKey || readRuntimeEnv('BUEPT_API_KEY', '').trim();
  
  const headers = { ...extra, 'X-Client-Provider': prov };
  if (runtimeKey) {
    headers.Authorization = `Bearer ${runtimeKey}`;
  }
  if (byok) headers['X-Client-Api-Key'] = byok;
  if (prov === 'ollama') {
    const url = String(cfg?.ollamaUrl || 'http://localhost:11434').trim();
    const model = String(cfg?.ollamaModel || 'llama3.2:1b').trim();
    headers['X-Client-Ollama-Url'] = url;
    headers['X-Client-Ollama-Model'] = model;
  }
  return headers;
}

export async function fetchDirectOllamaChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null, configOverride = null }) {
  const cfg = configOverride || getRuntimeApiAccessConfig();
  const ollamaUrl = (cfg.ollamaUrl || 'http://localhost:11434').trim().replace(/\/+$/, '');
  const model = (cfg.ollamaModel || 'llama3.2:1b').trim();
  const endpoint = `${ollamaUrl}/api/chat`;

  const ollamaMessages = [];
  if (systemPrompt) ollamaMessages.push({ role: 'system', content: systemPrompt });
  messages.forEach(m => ollamaMessages.push({ role: m.role || 'user', content: m.content || m.text || '' }));

  const payload = {
    model,
    messages: ollamaMessages,
    stream: false,
  };
  
  if (jsonFormat) {
    payload.format = 'json';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Ollama direct fetch failed: ${res.status} ${errText}`);
  }

  const json = await res.json();
  return json?.message?.content || '';
}

export async function fetchDirectGeminiChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null, apiKeyOverride = null }) {
  const cfg = getRuntimeApiAccessConfig();
  const apiKey = String(apiKeyOverride || cfg.apiKey || '').trim();
  if (!apiKey) throw new Error('Gemini API key is missing.');

  // Intra-provider model fallback: 3.1 Pro -> 3.1 Flash -> 3 Pro -> 3 Flash -> 1.5 Pro -> 1.5 Flash
  const models = [
    'gemini-3.1-pro', 
    'gemini-2.0-pro-exp',
    'gemini-2.0-flash-thinking-exp',
    'gemini-1.5-pro', 
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-3.1-flash', 
    'gemini-3.1-flash-lite',
    'gemini-3-pro', 
    'gemini-3-flash',
    'gemini-1.5-flash'
  ];
  let lastErr = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }]
      }));

      const payload = { contents };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      if (jsonFormat) {
        payload.generationConfig = {
          responseMimeType: 'application/json'
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Gemini (${model}) failed: ${res.status} ${errText}`);
      }

      const json = await res.json();
      return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      lastErr = e;
    }
  }
  
  throw lastErr || new Error('Gemini models failed.');
}

export async function fetchDirectOpenAIChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null, apiKeyOverride = null }) {
  const cfg = getRuntimeApiAccessConfig();
  const apiKey = String(apiKeyOverride || cfg.apiKey || '').trim();
  if (!apiKey) throw new Error('OpenAI API key is missing.');

  const endpoint = 'https://api.openai.com/v1/chat/completions';
  
  // Intra-provider model fallback: 4o -> 4o-mini -> 3.5
  const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
  let lastErr = null;

  for (const model of models) {
    try {
      const oaiMessages = [];
      if (systemPrompt) oaiMessages.push({ role: 'system', content: systemPrompt });
      messages.forEach(m => oaiMessages.push({ role: m.role || 'user', content: m.content || m.text || '' }));

      const payload = {
        model,
        messages: oaiMessages,
      };

      if (jsonFormat) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`OpenAI (${model}) failed: ${res.status} ${errText}`);
      }

      const json = await res.json();
      return json?.choices?.[0]?.message?.content || '';
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('OpenAI models failed.');
}

export async function fetchDirectClaudeChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null, apiKeyOverride = null }) {
  const cfg = getRuntimeApiAccessConfig();
  const apiKey = String(apiKeyOverride || cfg.claudeKey || '').trim();
  if (!apiKey) throw new Error('Claude API key is missing.');

  const endpoint = 'https://api.anthropic.com/v1/messages';
  
  // Intra-provider model fallback: 3.5 Sonnet -> 3 Opus
  const models = ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229'];
  let lastErr = null;

  for (const model of models) {
    try {
      const anthropicMessages = messages.map(m => ({
        role: m.role || 'user',
        content: m.content || m.text || ''
      }));

      const payload = {
        model,
        max_tokens: 4096,
        messages: anthropicMessages,
      };

      if (systemPrompt) {
        payload.system = systemPrompt;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Claude (${model}) failed: ${res.status} ${errText}`);
      }

      const json = await res.json();
      return json?.content?.[0]?.text || '';
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('Claude models failed.');
}

export async function executeDirectAiChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null }) {
  const cfg = getRuntimeApiAccessConfig();
  const mainProvider = cfg.provider || 'gemini';
  
  // Define fallback order: Primary -> Others
  const providers = ['gemini', 'claude', 'openai', 'ollama'];
  const ordered = [mainProvider, ...providers.filter(p => p !== mainProvider)];

  let lastError = null;

  for (const prov of ordered) {
    try {
      if (prov === 'gemini') {
        const key = prov === cfg.provider ? cfg.apiKey : 'AIzaSyAaAbaervIT28OsrSf2rPmUzpyzOiPhjiA';
        if (!key) continue;
        return await fetchDirectGeminiChat({ systemPrompt, messages, jsonFormat, signal, apiKeyOverride: key });
      }
      if (prov === 'claude') {
        if (!cfg.claudeKey) continue;
        return await fetchDirectClaudeChat({ systemPrompt, messages, jsonFormat, signal });
      }
      if (prov === 'openai') {
        if (!cfg.apiKey || cfg.provider !== 'openai') continue;
        return await fetchDirectOpenAIChat({ systemPrompt, messages, jsonFormat, signal });
      }
      if (prov === 'ollama') {
        return await fetchDirectOllamaChat({ systemPrompt, messages, jsonFormat, signal });
      }
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError) throw lastError;
  return null;
}
