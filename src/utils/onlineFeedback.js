import { resolveApiEndpoint } from './runtimeApi';

const LT_ENDPOINT = 'https://api.languagetool.org/v2/check';

const FEEDBACK_ENDPOINT =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_FEEDBACK_API_URL
    ? process.env.BUEPT_FEEDBACK_API_URL
    : '';

const PARAPHRASE_ENDPOINT =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_PARAPHRASE_API_URL
    ? process.env.BUEPT_PARAPHRASE_API_URL
    : FEEDBACK_ENDPOINT;

const WRITING_REVISION_ENDPOINT = resolveApiEndpoint('BUEPT_WRITING_REVISION_API_URL', '/api/writing-revision');

const API_KEY =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_API_KEY
    ? process.env.BUEPT_API_KEY
    : '';

const REQUEST_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MIN = 20;
const MAX_CHARS_PER_MIN = 75000;
const MAX_CHARS_PER_REQUEST = 20000;
const DEFAULT_TIMEOUT_MS = 14000;
const DEFAULT_RETRIES = 2;
const CACHE_TTL_MS = 3 * 60 * 1000;

const requestHistory = [];
const feedbackCache = new Map();
const paraphraseCache = new Map();
const revisionCache = new Map();

function envNumber(name, fallback) {
  const raw = typeof process !== 'undefined' && process.env ? process.env[name] : '';
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const REQUEST_TIMEOUT_MS = envNumber('BUEPT_API_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
const REQUEST_RETRIES = envNumber('BUEPT_API_RETRIES', DEFAULT_RETRIES);

function normalizeText(text) {
  if (!text) return '';
  return String(text).replace(/\r\n?/g, '\n').trim();
}

function nowMs() {
  return Date.now();
}

function simpleHash(input) {
  let h = 0;
  const str = String(input || '');
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) % 2147483647;
  }
  return `h${h.toString(16)}`;
}

function readCache(cache, key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= nowMs()) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function writeCache(cache, key, value) {
  cache.set(key, { value, expiresAt: nowMs() + CACHE_TTL_MS });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function isAbortError(err) {
  return !!err && (err.name === 'AbortError' || /aborted|abort/i.test(String(err.message || '')));
}

function withTimeout(ms = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

async function parseErrorMessage(res, fallback = 'Request failed') {
  try {
    const text = await res.text();
    return text || fallback;
  } catch (e) {
    return fallback;
  }
}

async function requestJson(url, { method = 'GET', headers = {}, body = undefined } = {}, policy = {}) {
  const retries = Number.isFinite(policy.retries) ? policy.retries : REQUEST_RETRIES;
  const timeoutMs = Number.isFinite(policy.timeoutMs) ? policy.timeoutMs : REQUEST_TIMEOUT_MS;
  const retryDelayMs = Number.isFinite(policy.retryDelayMs) ? policy.retryDelayMs : 500;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const timeout = withTimeout(timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: timeout.signal
      });

      if (!res.ok) {
        const msg = await parseErrorMessage(res, `HTTP ${res.status}`);
        if (attempt < retries && shouldRetryStatus(res.status)) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const json = await res.json();
      return json;
    } catch (err) {
      lastError = err;
      if (attempt >= retries) break;
      if (isAbortError(err) || /network|fetch|timeout|failed/i.test(String(err.message || ''))) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
      break;
    } finally {
      timeout.clear();
    }
  }

  throw lastError || new Error('Request failed');
}

function enforceRateLimit(chars) {
  const now = nowMs();
  for (let i = requestHistory.length - 1; i >= 0; i -= 1) {
    if (now - requestHistory[i].time > REQUEST_WINDOW_MS) requestHistory.splice(i, 1);
  }
  const recentCount = requestHistory.length;
  const recentChars = requestHistory.reduce((sum, r) => sum + r.chars, 0);
  if (recentCount >= MAX_REQUESTS_PER_MIN) {
    throw new Error('Rate limit reached. Try again in one minute.');
  }
  if (recentChars + chars > MAX_CHARS_PER_MIN) {
    throw new Error('Rate limit reached for text size. Try again in one minute.');
  }
  requestHistory.push({ time: now, chars });
}

function authHeaders(extra = {}) {
  if (!API_KEY) return extra;
  return { ...extra, Authorization: `Bearer ${API_KEY}` };
}

export function categorizeMatch(m) {
  const cat = (m?.rule?.category?.id || m?.rule?.category?.name || '').toLowerCase();
  if (cat.includes('grammar') || cat.includes('syntax')) return 'Grammar';
  if (cat.includes('style')) return 'Style';
  if (cat.includes('word') || cat.includes('vocab') || cat.includes('semantics')) return 'Vocabulary';
  return 'Mechanics';
}

export function summarizeMatches(matches = []) {
  const buckets = { Grammar: [], Vocabulary: [], Mechanics: [], Style: [] };
  const severity = { serious: 0, moderate: 0, minor: 0 };

  matches.forEach((m) => {
    const key = categorizeMatch(m);
    if (buckets[key]) buckets[key].push(m);
    const sev = (m.rule?.issueType || '').toLowerCase();
    if (sev.includes('misspelling') || sev.includes('typographical')) severity.minor += 1;
    else if (sev.includes('grammar') || sev.includes('style')) severity.moderate += 1;
    else severity.serious += 1;
  });

  return { buckets, severity, total: matches.length };
}

function normalizeParaphraseItems(items = [], originals = []) {
  return items
    .map((it, idx) => {
      if (typeof it === 'string') {
        return {
          original: originals[idx] || '',
          paraphrase: it
        };
      }
      return {
        original: it.original || it.source || it.input || originals[idx] || '',
        paraphrase: it.paraphrase || it.result || it.output || it.text || ''
      };
    })
    .filter((x) => String(x.paraphrase || '').trim());
}

function normalizeParaphraseResponse(payload = {}, originals = []) {
  if (Array.isArray(payload)) return normalizeParaphraseItems(payload, originals);
  if (Array.isArray(payload.paraphrases)) return normalizeParaphraseItems(payload.paraphrases, originals);
  if (Array.isArray(payload.sentences)) return normalizeParaphraseItems(payload.sentences, originals);
  if (Array.isArray(payload.items)) return normalizeParaphraseItems(payload.items, originals);
  if (typeof payload.text === 'string') {
    return [{ original: originals[0] || '', paraphrase: payload.text }];
  }
  return [];
}

const PARAPHRASE_SUBS = [
  ['in order to', 'to'],
  ['a lot of', 'many'],
  ['because of', 'due to'],
  ['in addition', 'moreover'],
  ['for example', 'for instance'],
  ['in conclusion', 'to conclude'],
  ['very important', 'crucial'],
  ['shows that', 'demonstrates that'],
  ['helps', 'assists'],
  ['get', 'obtain'],
  ['need to', 'are required to'],
  ['can not', 'cannot'],
  ['cannot', 'are unable to'],
  ['many', 'a large number of'],
  ['some', 'several'],
  ['big', 'substantial'],
  ['small', 'limited'],
  ['good', 'beneficial'],
  ['bad', 'harmful'],
];

function sentenceCase(text = '') {
  const trimmed = String(text || '').trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function lowerFirst(text = '') {
  const t = String(text || '').trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function splitSentencesLocal(text = '') {
  const safe = normalizeText(text);
  if (!safe) return [];
  const parts = safe.match(/[^.!?]+[.!?]*/g);
  return Array.isArray(parts)
    ? parts.map((item) => normalizeText(item)).filter(Boolean)
    : [safe];
}

function localParaphraseSentence(sentence = '') {
  let out = normalizeText(sentence);
  if (!out) return out;
  PARAPHRASE_SUBS.forEach(([from, to]) => {
    const rx = new RegExp(`\\b${from.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    out = out.replace(rx, to);
  });

  // Lightweight structural rewrites for clearer variation.
  out = out.replace(
    /\ba large number of ([a-z ]+?) are unable to\b/i,
    'many $1 cannot'
  );
  out = out.replace(
    /\bmany ([a-z ]+?) cannot\b/i,
    'a large number of $1 are unable to'
  );
  out = out.replace(
    /\bthere is\b/gi,
    'there exists'
  );
  out = out.replace(
    /\bthere are\b/gi,
    'there exist'
  );

  out = out.replace(/\s+/g, ' ').trim();

  // Avoid returning almost identical sentence.
  if (out.toLowerCase() === sentence.trim().toLowerCase()) {
    if (/^\w+\s+is\s+/i.test(out)) {
      out = out.replace(/^\w+\s+is\s+/i, (m) => m.replace(/\bis\b/i, 'can be'));
    } else {
      const templates = [
        `This means that ${lowerFirst(out)}`,
        `Put differently, ${lowerFirst(out)}`,
        `In simpler terms, ${lowerFirst(out)}`,
      ];
      out = templates[out.length % templates.length];
    }
  }
  return sentenceCase(out);
}

function fallbackParaphrases(list = []) {
  return list.map((s) => ({
    original: s,
    paraphrase: localParaphraseSentence(s)
  }));
}

function mergeParaphraseRows(online = [], originals = []) {
  const merged = [];
  for (let i = 0; i < originals.length; i += 1) {
    const original = originals[i];
    const row = online[i] || {};
    let paraphrase = String(row.paraphrase || '').trim();
    if (!paraphrase || paraphrase.toLowerCase() === original.toLowerCase()) {
      paraphrase = localParaphraseSentence(original);
    }
    merged.push({ original, paraphrase });
  }
  return merged;
}

function normalizeList(items = [], maxItems = 6) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    const value = normalizeText(typeof item === 'string' ? item : String(item || ''));
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= maxItems) break;
  }
  return out;
}

function buildLocalWritingRevision({ text = '', prompt = '', level = 'B2', task = 'essay' } = {}) {
  const source = normalizeText(text);
  if (!source) {
    return {
      revisedText: '',
      summary: 'No text available for revision.',
      strengths: [],
      fixes: [],
      rubricNotes: [],
      source: 'local-writing-revision',
      model: '',
      diagnostic: '',
    };
  }

  const sentences = splitSentencesLocal(source);
  const revisedSentences = sentences.map((sentence) => localParaphraseSentence(sentence));
  let revisedText = revisedSentences.join(' ');
  const lower = source.toLowerCase();
  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const hasThesis = /\b(i believe|in this essay|this essay argues|i argue that|the main point is)\b/i.test(lower);
  const hasConclusion = /\b(in conclusion|to conclude|to sum up|overall|to summarize)\b/i.test(lower);
  const hasExample = /\b(for example|for instance|such as)\b/i.test(lower);
  const connectorHits = (lower.match(/\bhowever|therefore|moreover|furthermore|in contrast|for example|as a result|on the other hand\b/g) || []).length;

  if (!hasThesis && revisedText) {
    revisedText = `In this essay, ${lowerFirst(revisedText)}`;
  }
  if (task === 'essay' && !hasConclusion && revisedText) {
    revisedText = `${revisedText} In conclusion, the argument becomes stronger when the main claim is supported with clearer evidence and tighter organization.`;
  }

  const strengths = [];
  if (wordCount >= 140) strengths.push('The draft is long enough to revise into a full academic response.');
  if (connectorHits >= 2) strengths.push('Some transition control is already present.');
  if (hasExample) strengths.push('The draft already includes an example signal.');
  if (!strengths.length) strengths.push('The draft has a usable core idea to build on.');

  const fixes = [];
  if (wordCount < 140) fixes.push('Develop the body with one more reason or example.');
  if (connectorHits < 3) fixes.push('Add clearer transitions across body ideas.');
  if (!hasExample) fixes.push('Add one concrete example to support the claim.');
  if (!hasConclusion && task === 'essay') fixes.push('Close with a final sentence that restates the argument.');
  if (!fixes.length) fixes.push('Focus next on precision, evidence, and sentence-level polish.');

  const rubricNotes = [
    'BUEPT scoring is stricter on paragraph control, idea development, and academic tone.',
    connectorHits < 3
      ? 'Current cohesion is not strong enough for a high Organization score.'
      : 'Connector use is helping the Organization score.',
    wordCount < 140
      ? 'Task development is limited because the response is still short.'
      : 'Length is enough for stronger task development if the evidence is specific.',
  ];

  return {
    revisedText: normalizeText(revisedText),
    summary: `Local revision completed for a ${String(level || 'B2').toUpperCase()} ${task} draft.`,
    strengths: normalizeList(strengths, 4),
    fixes: normalizeList(fixes, 4),
    rubricNotes: normalizeList(rubricNotes, 4),
    source: 'local-writing-revision',
    model: '',
    diagnostic: '',
    prompt: normalizeText(prompt),
  };
}

function normalizeWritingRevisionResponse(payload = {}, fallback = {}) {
  return {
    revisedText: normalizeText(payload.revisedText || payload.revised_text || payload.rewrite || fallback.revisedText || ''),
    summary: normalizeText(payload.summary || payload.coachSummary || payload.coach_summary || fallback.summary || ''),
    strengths: normalizeList(payload.strengths || fallback.strengths || [], 5),
    fixes: normalizeList(payload.fixes || payload.improvements || fallback.fixes || [], 5),
    rubricNotes: normalizeList(payload.rubricNotes || payload.rubric_notes || fallback.rubricNotes || [], 5),
    source: normalizeText(payload.source || fallback.source || 'local-writing-revision'),
    model: normalizeText(payload.model || fallback.model || ''),
    diagnostic: normalizeText(payload.diagnostic || payload.warning || fallback.diagnostic || ''),
    prompt: normalizeText(payload.prompt || fallback.prompt || ''),
  };
}

function normalizeCustomResponse(payload = {}) {
  if (Array.isArray(payload.matches)) {
    return {
      source: payload.source || 'custom',
      matches: payload.matches,
      summary: payload.summary || '',
      revisedText: payload.revisedText || '',
      warning: payload.warning || ''
    };
  }

  const raw = Array.isArray(payload.feedback)
    ? payload.feedback
    : (Array.isArray(payload.issues) ? payload.issues : []);

  const matches = raw.map((item) => {
    const replacements = Array.isArray(item.suggestions)
      ? item.suggestions
      : (Array.isArray(item.replacements) ? item.replacements : []);
    return {
      message: item.message || item.feedback || 'Issue detected',
      offset: Number(item.offset || 0),
      length: Number(item.length || 0),
      replacements: replacements.map((s) => ({
        value: typeof s === 'string' ? s : (s.value || s.text || '')
      })).filter((r) => r.value),
      rule: {
        category: { id: item.category || item.type || 'custom' },
        issueType: item.issueType || item.severity || 'custom'
      },
      context: item.context
        ? { text: String(item.context), offset: 0, length: String(item.context).length }
        : undefined
    };
  });

  return {
    source: payload.source || 'custom',
    matches,
    summary: payload.summary || '',
    revisedText: payload.revisedText || '',
    warning: payload.warning || ''
  };
}

async function callLanguageTool(text) {
  const body = new URLSearchParams();
  body.append('text', text);
  body.append('language', 'en-US');
  body.append('enabledOnly', 'false');
  body.append('level', 'picky');

  const json = await requestJson(
    LT_ENDPOINT,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    },
    { retries: REQUEST_RETRIES, timeoutMs: REQUEST_TIMEOUT_MS, retryDelayMs: 450 }
  );

  return {
    source: 'languagetool',
    matches: Array.isArray(json.matches) ? json.matches : [],
    summary: json.summary || '',
    revisedText: json.revisedText || '',
    warning: ''
  };
}

export async function requestParaphrase(sentences = []) {
  const list = Array.isArray(sentences)
    ? sentences.map((s) => normalizeText(s)).filter(Boolean).slice(0, 12)
    : [];
  if (!list.length) return [];

  const cacheKey = simpleHash(JSON.stringify(list));
  const cached = readCache(paraphraseCache, cacheKey);
  if (cached) return cached;

  const clipped = list.map((s) => (s.length > 500 ? `${s.slice(0, 497)}...` : s));
  const charCount = clipped.reduce((sum, s) => sum + s.length, 0);
  enforceRateLimit(charCount);

  if (!PARAPHRASE_ENDPOINT) {
    const fallback = fallbackParaphrases(clipped);
    writeCache(paraphraseCache, cacheKey, fallback);
    return fallback;
  }

  try {
    // Chunk requests to make the endpoint more reliable for long drafts.
    const chunkSize = 6;
    const chunks = [];
    for (let i = 0; i < clipped.length; i += chunkSize) {
      chunks.push(clipped.slice(i, i + chunkSize));
    }
    const out = [];
    for (const part of chunks) {
      const payload = {
        mode: 'paraphrase',
        language: 'en-US',
        examType: 'IELTS',
        sentences: part,
        requestMeta: {
          client: 'bueptapp',
          version: 3
        }
      };
      const json = await requestJson(
        PARAPHRASE_ENDPOINT,
        {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        },
        { retries: REQUEST_RETRIES, timeoutMs: REQUEST_TIMEOUT_MS, retryDelayMs: 500 }
      );
      const normalized = normalizeParaphraseResponse(json, part);
      const merged = mergeParaphraseRows(normalized, part);
      out.push(...merged);
    }
    writeCache(paraphraseCache, cacheKey, out);
    return out;
  } catch (e) {
    // Soft fallback to keep UX stable even if API fails.
    const fallback = fallbackParaphrases(clipped);
    writeCache(paraphraseCache, cacheKey, fallback);
    return fallback;
  }
}

export async function checkOnlineFeedback(text) {
  const payload = normalizeText(typeof text === 'string' ? text : '');
  if (!payload.trim()) throw new Error('Please paste your text.');
  if (payload.length > MAX_CHARS_PER_REQUEST) throw new Error('Text too long (max 20,000 chars).');

  const cacheKey = simpleHash(payload);
  const cached = readCache(feedbackCache, cacheKey);
  if (cached) return cached;

  enforceRateLimit(payload.length);

  if (FEEDBACK_ENDPOINT) {
    try {
      const json = await requestJson(
        FEEDBACK_ENDPOINT,
        {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            text: payload,
            language: 'en-US',
            examType: 'IELTS',
            mode: 'writing_feedback',
            requestMeta: {
              client: 'bueptapp',
              version: 2
            }
          })
        },
        { retries: REQUEST_RETRIES, timeoutMs: REQUEST_TIMEOUT_MS, retryDelayMs: 500 }
      );

      const normalized = normalizeCustomResponse(json);
      writeCache(feedbackCache, cacheKey, normalized);
      return normalized;
    } catch (customErr) {
      const fallback = await callLanguageTool(payload);
      fallback.warning = `Custom API fallback: ${customErr.message || 'unknown error'}`;
      if (!fallback.summary) fallback.summary = fallback.warning;
      writeCache(feedbackCache, cacheKey, fallback);
      return fallback;
    }
  }

  const lt = await callLanguageTool(payload);
  writeCache(feedbackCache, cacheKey, lt);
  return lt;
}

export async function requestWritingRevision({ text = '', prompt = '', level = 'B2', task = 'essay' } = {}) {
  const source = normalizeText(text);
  if (!source) throw new Error('Please paste your text.');
  if (source.length > MAX_CHARS_PER_REQUEST) throw new Error('Text too long (max 20,000 chars).');

  const cacheKey = simpleHash(JSON.stringify({ text: source, prompt: normalizeText(prompt), level, task }));
  const cached = readCache(revisionCache, cacheKey);
  if (cached) return cached;

  enforceRateLimit(source.length);
  const localFallback = buildLocalWritingRevision({ text: source, prompt, level, task });

  if (!WRITING_REVISION_ENDPOINT) {
    writeCache(revisionCache, cacheKey, localFallback);
    return localFallback;
  }

  try {
    const json = await requestJson(
      WRITING_REVISION_ENDPOINT,
      {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          text: source,
          prompt: normalizeText(prompt),
          level: normalizeText(level) || 'B2',
          task: normalizeText(task) || 'essay',
        }),
      },
      { retries: REQUEST_RETRIES, timeoutMs: REQUEST_TIMEOUT_MS, retryDelayMs: 500 }
    );

    const normalized = normalizeWritingRevisionResponse(json, localFallback);
    writeCache(revisionCache, cacheKey, normalized);
    return normalized;
  } catch (error) {
    const fallback = {
      ...localFallback,
      diagnostic: error?.message || 'Writing revision endpoint failed.',
      source: 'local-writing-revision-fallback',
    };
    writeCache(revisionCache, cacheKey, fallback);
    return fallback;
  }
}
