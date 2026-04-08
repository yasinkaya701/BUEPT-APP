import { NativeModules, Platform } from 'react-native';

const DEFAULT_API_PORT = 8088;
// External API fallback used by GitHub Pages deployments that cannot host serverless routes.
const STATIC_PROD_API_BASE_URL = 'https://buept-api.vercel.app';

export function readRuntimeEnv(name, fallback = '') {
  const value = typeof process !== 'undefined' && process.env ? process.env[name] : '';
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
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

  const baseOverride = readRuntimeEnv('BUEPT_API_BASE_URL');
  const base = baseOverride || getDefaultApiBaseUrl(port);
  if (!base) return '';
  if (!fallbackPath) return base;
  return `${base}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
}
