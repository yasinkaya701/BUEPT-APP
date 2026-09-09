'use strict';

const { runHostedAi, configuredProvider } = require('./providerRouter');

const MAX_BODY_BYTES = 1024 * 1024;
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
  } catch (_) {
    const fenced = raw.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/i);
    if (!fenced?.[1]) return null;
    try {
      return JSON.parse(fenced[1]);
    } catch (_) {
      return null;
    }
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

    if (path.startsWith('/api/sync/')) {
      sendJson(res, 503, {
        error: 'SYNC_DISABLED',
        detail: 'Cloud vocabulary sync is disabled until user-scoped authentication is available.',
        requestId,
      });
      return;
    }

    if (req.method === 'POST' && path === '/api/ai/chat') {
      const body = await readJsonBody(req);
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) {
        sendJson(res, 400, { error: 'INVALID_AI_REQUEST', detail: 'messages must contain at least one item', requestId });
        return;
      }
      const result = await runHostedAi({
        capability: body.capability || 'general',
        systemPrompt: body.systemPrompt || '',
        messages,
        jsonFormat: Boolean(body.jsonFormat),
      });
      sendJson(res, 200, { ...result, requestId });
      return;
    }

    const legacy = req.method === 'POST' ? legacyAiInput(path, await readJsonBody(req)) : null;
    if (legacy) {
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
