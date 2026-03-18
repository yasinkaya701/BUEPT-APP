import { NativeModules, Platform } from 'react-native';

const DEFAULT_API_PORT = 8088;

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
  // Use the Mac's IP address explicitly to allow the Android physical device
  // to reach the web-api-server backend on the same Wi-Fi network even in Release mode.
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return `http://10.5.200.116:${port}`;
  }
  return `http://${getDevHost()}:${port}`;
}

export function resolveApiEndpoint(envName, fallbackPath = '', { port = DEFAULT_API_PORT } = {}) {
  const explicit = readRuntimeEnv(envName);
  if (explicit) return explicit;

  const base = getDefaultApiBaseUrl(port);
  if (!base) return '';
  if (!fallbackPath) return base;
  return `${base}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
}
