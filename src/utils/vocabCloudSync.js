import { readRuntimeEnv, resolveApiEndpoint } from './runtimeApi';

const DEFAULT_SYNC_TOKEN = 'buept-sync-local';
const REQUEST_TIMEOUT_MS = 6500;

function getSyncToken() {
  return readRuntimeEnv('BUEPT_SYNC_TOKEN', DEFAULT_SYNC_TOKEN) || DEFAULT_SYNC_TOKEN;
}

function buildHeaders() {
  const token = getSyncToken();
  return {
    'Content-Type': 'application/json',
    'X-Sync-Token': token,
    Authorization: `Bearer ${token}`,
  };
}

async function fetchWithTimeout(endpoint, options = {}) {
  if (!endpoint) throw new Error('SYNC_ENDPOINT_MISSING');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      ...options,
      signal: ctrl.signal,
      headers: {
        ...(options.headers || {}),
      },
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || `SYNC_HTTP_${res.status}`);
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

export async function pullVocabCloudSync({ client = 'app' } = {}) {
  const endpoint = resolveApiEndpoint('BUEPT_SYNC_PULL_URL', `/api/sync/pull?client=${encodeURIComponent(client)}`);
  return fetchWithTimeout(endpoint, {
    method: 'GET',
    headers: buildHeaders(),
  });
}

export async function pushVocabCloudSync({ client = 'app', state = {}, updatedAt = new Date().toISOString() } = {}) {
  const endpoint = resolveApiEndpoint('BUEPT_SYNC_PUSH_URL', '/api/sync/push');
  return fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      client,
      updatedAt,
      state,
    }),
  });
}

export async function pingVocabCloudSync() {
  const endpoint = resolveApiEndpoint('BUEPT_SYNC_STATUS_URL', '/api/sync/status');
  return fetchWithTimeout(endpoint, {
    method: 'GET',
    headers: buildHeaders(),
  });
}
