import { NativeModules, Platform } from 'react-native';

const DEFAULT_API_PORT = 8088;
// External API fallback used by GitHub Pages deployments that cannot host serverless routes.
const STATIC_PROD_API_BASE_URL = 'https://buept-api.vercel.app';
const runtimeAccessConfig = {
  mode: 'hosted',
  baseUrl: '',
  apiKey: '',
  provider: 'openai',     // 'openai' | 'gemini' | 'ollama'
  ollamaUrl: '',          // e.g. 'http://localhost:11434'
  ollamaModel: '',        // e.g. 'llama3.2:1b'
  label: 'Hosted BUEPT AI',
};

export function readRuntimeEnv(name, fallback = '') {
  const value = typeof process !== 'undefined' && process.env ? process.env[name] : '';
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function setRuntimeApiAccessConfig(next = {}) {
  runtimeAccessConfig.mode       = String(next?.mode     || 'hosted').trim() || 'hosted';
  runtimeAccessConfig.baseUrl    = String(next?.baseUrl  || '').trim();
  runtimeAccessConfig.apiKey     = String(next?.apiKey   || '').trim();
  runtimeAccessConfig.provider   = String(next?.provider || 'openai').trim() || 'openai';
  runtimeAccessConfig.ollamaUrl  = String(next?.ollamaUrl  || '').trim();
  runtimeAccessConfig.ollamaModel= String(next?.ollamaModel || '').trim();
  runtimeAccessConfig.label      = String(next?.label    || '').trim() || 'Hosted BUEPT AI';
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
  const prov = String(cfg?.provider || 'openai').trim();
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

export async function fetchDirectOllamaChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null }) {
  const cfg = getRuntimeApiAccessConfig();
  if (cfg.provider !== 'ollama') throw new Error('Ollama provider not active.');

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

export async function fetchDirectGeminiChat({ systemPrompt = '', messages = [], jsonFormat = false, signal = null }) {
  const cfg = getRuntimeApiAccessConfig();
  if (cfg.provider !== 'gemini') throw new Error('Gemini provider not active.');
  
  const apiKey = String(cfg.apiKey || '').trim();
  if (!apiKey) throw new Error('Gemini API key is missing.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }]
  }));

  const payload = {
    contents,
  };

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
    throw new Error(`Gemini direct fetch failed: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const replyText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return replyText;
}
