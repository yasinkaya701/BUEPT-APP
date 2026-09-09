'use strict';

const { Buffer } = require('buffer');
const { runHostedAi, configuredProvider } = require('./providerRouter');

const MAX_BODY_BYTES = 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AI_RATE_LIMIT_PER_MINUTE = Math.max(1, Number(process.env.BUEPT_AI_RATE_LIMIT_PER_MINUTE || 20));
const SEARCH_RATE_LIMIT_PER_MINUTE = Math.max(1, Number(process.env.BUEPT_SEARCH_RATE_LIMIT_PER_MINUTE || 30));
const MAX_AI_MESSAGES = 24;
const MAX_AI_SYSTEM_CHARS = 8000;
const MAX_AI_TOTAL_MESSAGE_CHARS = 32000;
const rateBuckets = new Map();
const DEFAULT_ALLOWED_ORIGINS = [
  'https://yasinkaya701.github.io',
  'http://localhost:8090',
  'http://127.0.0.1:8090',
  'http://localhost:8088',
  'http://127.0.0.1:8088',
];

function env(name, fallback = '') {
  const value = process.env?.[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function allowedOrigins() {
  const configured = env('BUEPT_ALLOWED_ORIGINS');
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured.split(',').map((item) => item.trim()).filter(Boolean);
}

function setCors(req, res) {
  const origin = String(req.headers?.origin || '');
  const allowed = allowedOrigins();
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Provider, X-Request-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendJson(res, status, payload) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function clientAddress(req) {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown');
}

function takeRateLimit(req, bucketName, limit) {
  const now = Date.now();
  const key = `${bucketName}:${clientAddress(req)}`;
  let bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;

  // Opportunistic cleanup keeps long-lived local/server processes bounded.
  if (rateBuckets.size > 5000) {
    for (const [entryKey, entry] of rateBuckets) {
      if (entry.resetAt <= now) rateBuckets.delete(entryKey);
    }
  }

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

function enforceRateLimit(req, res, requestId, bucketName, limit) {
  const result = takeRateLimit(req, bucketName, limit);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  if (result.allowed) return true;
  res.setHeader('Retry-After', String(result.retryAfterSec));
  sendJson(res, 429, {
    error: 'RATE_LIMITED',
    detail: 'Too many requests. Try again shortly.',
    requestId,
  });
  return false;
}

function validateAiBody(body = {}) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return { ok: false, error: 'INVALID_AI_REQUEST', detail: 'messages must contain at least one item' };
  }
  if (messages.length > MAX_AI_MESSAGES) {
    return { ok: false, error: 'AI_REQUEST_TOO_LARGE', detail: `messages may contain at most ${MAX_AI_MESSAGES} items` };
  }
  const systemPrompt = String(body.systemPrompt || '');
  if (systemPrompt.length > MAX_AI_SYSTEM_CHARS) {
    return { ok: false, error: 'AI_REQUEST_TOO_LARGE', detail: 'systemPrompt is too large' };
  }
  const totalChars = messages.reduce(
    (sum, item) => sum + String(item?.content || item?.text || '').length,
    0,
  );
  if (totalChars > MAX_AI_TOTAL_MESSAGE_CHARS) {
    return { ok: false, error: 'AI_REQUEST_TOO_LARGE', detail: 'message content is too large' };
  }
  return { ok: true, messages };
}

function safeRequestId(req) {
  const supplied = String(req.headers?.['x-request-id'] || '').trim();
  if (supplied && supplied.length <= 96) return supplied;
  return `buept-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large.');
      error.status = 413;
      error.code = 'REQUEST_TOO_LARGE';
      throw error;
    }
    chunks.push(buffer);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (_) {
    const error = new Error('Malformed JSON body.');
    error.status = 400;
    error.code = 'INVALID_JSON';
    throw error;
  }
}

function normalizePath(req) {
  try {
    return new URL(req.url || '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/';
  } catch (_) {
    return '/';
  }
}

function legacyAiInput(path, body = {}) {
  if (path === '/api/chat') {
    return {
      capability: 'chat',
      systemPrompt: body.systemPrompt || body.system || 'You are a concise BUEPT study coach.',
      messages: body.messages || [{ role: 'user', content: body.message || body.text || '' }],
      jsonFormat: Boolean(body.jsonFormat),
    };
  }

  if (path === '/api/mistake-coach') {
    return {
      capability: 'mistake_coach',
      systemPrompt: 'You are a strict but supportive BUEPT mistake coach. Return concise actionable feedback.',
      messages: [{ role: 'user', content: JSON.stringify(body) }],
      jsonFormat: true,
    };
  }

  if (path === '/api/writing-revision') {
    return {
      capability: 'writing_revision',
      systemPrompt: 'Revise the BUEPT writing draft while preserving the learner voice. Return JSON with revisedText, summary, strengths, fixes, and rubricNotes.',
      messages: [{ role: 'user', content: JSON.stringify(body) }],
      jsonFormat: true,
    };
  }

  if (path === '/api/video-lesson') {
    return {
      capability: 'video_lesson',
      systemPrompt: 'Create a concise academic lesson storyboard. Return JSON.',
      messages: [{ role: 'user', content: JSON.stringify(body) }],
      jsonFormat: true,
    };
  }

  if (path === '/api/speaking' || path === '/api/presentation' || path === '/api/module') {
    return {
      capability: String(body.kind || path.slice('/api/'.length) || 'module'),
      systemPrompt: 'You are a Boğaziçi-focused BUEPT learning assistant. Return JSON that matches the requested task.',
      messages: [{ role: 'user', content: JSON.stringify(body) }],
      jsonFormat: true,
    };
  }

  return null;
}

function parseJsonText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (parseError) {
    const fence = String.fromCharCode(96).repeat(3);
    if (!raw.startsWith(fence)) return null;
    const firstNewline = raw.indexOf('\n');
    const lastFence = raw.lastIndexOf(fence);
    if (firstNewline < 0 || lastFence <= firstNewline) return null;
    const candidate = raw.slice(firstNewline + 1, lastFence).trim();
    try {
      return JSON.parse(candidate);
    } catch (fencedParseError) {
      return null;
    }
  }
}

async function runWebSearch(query) {
  const q = String(query || '').trim().slice(0, 300);
  if (!q) return { context: '' };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const upstream = await fetch(endpoint, {
      method: 'GET',
      headers: { 'User-Agent': 'BUEPT-APP/2.0 educational-search' },
      signal: ctrl.signal,
    });
    if (!upstream.ok) {
      const error = new Error(`Search upstream failed (${upstream.status})`);
      error.code = 'SEARCH_UPSTREAM_ERROR';
      error.status = 502;
      throw error;
    }
    const data = await upstream.json();
    const lines = [];
    if (data?.AbstractText) lines.push(`Abstract: ${String(data.AbstractText).slice(0, 2400)}`);
    if (data?.Answer) lines.push(`Answer: ${String(data.Answer).slice(0, 800)}`);
    const related = Array.isArray(data?.RelatedTopics) ? data.RelatedTopics : [];
    related.slice(0, 5).forEach((topic) => {
      if (topic?.Text) lines.push(`- ${String(topic.Text).slice(0, 700)}`);
    });
    return { context: lines.join('\n').slice(0, 6000) };
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Search request timed out.');
      timeoutError.code = 'SEARCH_TIMEOUT';
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function requestHandler(req, res) {
  const requestId = safeRequestId(req);
  res.setHeader('X-Request-Id', requestId);
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const path = normalizePath(req);

  try {
    if (req.method === 'GET' && (path === '/api/health' || path === '/health')) {
      sendJson(res, 200, {
        status: 'ok',
        service: 'buept-api',
        aiConfigured: Boolean(configuredProvider()),
        aiProvider: configuredProvider() || null,
        syncEnabled: false,
        requestId,
      });
      return;
    }

    if (req.method === 'GET' && path === '/api/version') {
      sendJson(res, 200, {
        service: 'buept-api',
        version: env('VERCEL_GIT_COMMIT_SHA', env('COMMIT_REF', 'development')).slice(0, 12),
        requestId,
      });
      return;
    }

    if (req.method === 'GET' && path === '/api/search') {
      if (!enforceRateLimit(req, res, requestId, 'search', SEARCH_RATE_LIMIT_PER_MINUTE)) return;
      const url = new URL(req.url || '/', 'http://localhost');
      const query = String(url.searchParams.get('q') || '').trim();
      if (!query) {
        sendJson(res, 400, { error: 'INVALID_SEARCH_QUERY', detail: 'q is required', requestId });
        return;
      }
      const result = await runWebSearch(query);
      sendJson(res, 200, { ...result, requestId });
      return;
    }

    if (path.startsWith('/api/sync/')) {
      sendJson(res, 503, {
        error: 'SYNC_DISABLED',
        detail: 'Cloud vocabulary sync is disabled until user-scoped authentication is available.',
        requestId,
      });
      return;
    }

    if (req.method === 'POST' && path === '/api/ai/chat') {
      if (!enforceRateLimit(req, res, requestId, 'ai', AI_RATE_LIMIT_PER_MINUTE)) return;
      const body = await readJsonBody(req);
      const validation = validateAiBody(body);
      if (!validation.ok) {
        sendJson(res, 400, { error: validation.error, detail: validation.detail, requestId });
        return;
      }
      const result = await runHostedAi({
        capability: String(body.capability || 'general').slice(0, 80),
        systemPrompt: String(body.systemPrompt || ''),
        messages: validation.messages,
        jsonFormat: Boolean(body.jsonFormat),
      });
      sendJson(res, 200, { ...result, requestId });
      return;
    }

    const legacy = req.method === 'POST' ? legacyAiInput(path, await readJsonBody(req)) : null;
    if (legacy) {
      if (!enforceRateLimit(req, res, requestId, 'ai', AI_RATE_LIMIT_PER_MINUTE)) return;
      const legacyValidation = validateAiBody(legacy);
      if (!legacyValidation.ok) {
        sendJson(res, 400, { error: legacyValidation.error, detail: legacyValidation.detail, requestId });
        return;
      }
      legacy.messages = legacyValidation.messages;
      const result = await runHostedAi(legacy);
      const parsed = legacy.jsonFormat ? parseJsonText(result.text) : null;
      if (parsed && typeof parsed === 'object') {
        sendJson(res, 200, { ...parsed, source: parsed.source || 'hosted-ai', model: result.model, requestId });
      } else {
        sendJson(res, 200, { text: result.text, reply: result.text, source: 'hosted-ai', model: result.model, requestId });
      }
      return;
    }

    sendJson(res, 404, { error: 'NOT_FOUND', requestId });
  } catch (error) {
    const status = Number(error?.status) || (error?.code === 'AI_PROVIDER_NOT_CONFIGURED' ? 503 : 500);
    const publicCode = error?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
    const publicDetail = status >= 500 && publicCode === 'INTERNAL_ERROR'
      ? 'The service could not complete the request.'
      : String(error?.message || 'Request failed').slice(0, 600);
    sendJson(res, status, { error: publicCode, detail: publicDetail, requestId });
  }
}

module.exports = {
  requestHandler,
};
