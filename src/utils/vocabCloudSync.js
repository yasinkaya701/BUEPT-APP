import { resolveApiEndpoint } from './runtimeApi';

const REQUEST_TIMEOUT_MS = 6500;

// V2 safety gate:
// the legacy cloud sync protocol used one shared client namespace and one
// default token. Keep sync disabled until a real authenticated userId + revision
// contract exists on the backend. Local vocabulary/SRS storage remains active.
export function isVocabCloudSyncEnabled() {
  return false;
}

function disabledError() {
  const error = new Error('Vocabulary cloud sync is disabled until user-scoped authentication is available.');
  error.code = 'SYNC_DISABLED';
  return error;
}

async function fetchWithTimeout(endpoint, options = {}) {
  if (!endpoint) throw new Error('SYNC_ENDPOINT_MISSING');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      ...options,
      signal: ctrl.signal,
      headers: { ...(options.headers || {}) },
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || `SYNC_HTTP_${res.status}`);
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

export async function pullVocabCloudSync() {
  throw disabledError();
}

export async function pushVocabCloudSync() {
  throw disabledError();
}

export async function pingVocabCloudSync() {
  if (!isVocabCloudSyncEnabled()) throw disabledError();
  const endpoint = resolveApiEndpoint('BUEPT_SYNC_STATUS_URL', '/api/sync/status');
  return fetchWithTimeout(endpoint, { method: 'GET' });
}
