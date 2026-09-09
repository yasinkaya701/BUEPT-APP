import { resolveApiEndpoint, getAiHeaders, executeDirectAiChat, isHostedAiMode } from './runtimeApi';
import { buildAIMessages } from './aiMessages';

const MAX_CONTEXT_CHARS = 20000;
const MISTAKE_ENDPOINT = resolveApiEndpoint('BUEPT_MISTAKE_COACH_API_URL', '/api/mistake-coach');
const DEFAULT_TIMEOUT_MS = 16000;
const DEFAULT_RETRIES = 1;
const MODULE_FOCUS = {
  reading: 'Focus on evidence lines, paraphrase traps, and the exact sentence that proves the answer.',
  listening: 'Focus on transcript cues, contrast words, numbers, and speaker intent.',
  grammar: 'Focus on tense, clause structure, agreement, and preposition patterns.',
  vocab: 'Focus on meaning in context, word family, collocations, and register.',
  writing: 'Focus on BUEPT rubric: task response, coherence, lexical accuracy, and grammar. Provide one micro-fix example.',
  speaking: 'Focus on clarity, grammar accuracy, and idea support. Provide one micro-fix example.',
};

function normalizeText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function trimContext(value = '') {
  const text = normalizeText(value);
  if (!text) return '';
  if (text.length <= MAX_CONTEXT_CHARS) return text;
  return `${text.slice(0, MAX_CONTEXT_CHARS)}…`;
}

function optionLabel(opt, idx) {
  const letter = String.fromCharCode(65 + idx);
  return `${letter}. ${opt}`;
}

export function buildMistakeExplain(mistake) {
  if (!mistake) return '';
  if (mistake.explanation) return String(mistake.explanation).trim();

  const { module } = mistake;
  const options = Array.isArray(mistake.options) ? mistake.options : [];
  const correctIdx = Number.isFinite(mistake.correctIndex) ? mistake.correctIndex : null;
  const selectedIdx = Number.isFinite(mistake.selectedIndex) ? mistake.selectedIndex : null;
  const correctText = correctIdx != null ? options[correctIdx] : mistake.correctText;
  const selectedText = selectedIdx != null ? options[selectedIdx] : mistake.selectedText;

  let base = '';
  if (correctText && selectedText && correctText !== selectedText) {
    base = `The correct answer is "${correctText}". Your answer "${selectedText}" is not supported by the evidence.`;
  } else if (correctText) {
    base = `The correct answer is "${correctText}".`;
  } else {
    base = 'The correct answer is the option that best matches the core evidence.';
  }

  const moduleTip = {
    reading: 'Focus on the exact sentence that proves the option, not general topic clues.',
    listening: 'Listen for contrast words and numbers; they often flip the correct choice.',
    grammar: 'Check tense markers, prepositions, and clause structure before selecting.',
    vocab: 'Match the definition and example context, not just a similar-sounding word.'
  }[module] || 'Use key clue words to eliminate close distractors.';

  return `${base} ${moduleTip}`.trim();
}

export function buildMistakeContext(mistake = {}) {
  const lines = [];
  if (mistake.moduleLabel || mistake.module) lines.push(`Module: ${mistake.moduleLabel || mistake.module}`);
  if (mistake.taskTitle) lines.push(`Task: ${mistake.taskTitle}`);
  if (mistake.question) lines.push(`Question: ${mistake.question}`);
  if (Array.isArray(mistake.options) && mistake.options.length) {
    lines.push('Options:');
    mistake.options.forEach((opt, idx) => lines.push(`- ${optionLabel(opt, idx)}`));
  }
  if (Number.isFinite(mistake.selectedIndex)) {
    lines.push(`Student answer: ${optionLabel(mistake.options[mistake.selectedIndex], mistake.selectedIndex)}`);
  } else if (mistake.selectedText) {
    lines.push(`Student answer: ${mistake.selectedText}`);
  }
  if (Number.isFinite(mistake.correctIndex)) {
    lines.push(`Correct answer: ${optionLabel(mistake.options[mistake.correctIndex], mistake.correctIndex)}`);
  } else if (mistake.correctText) {
    lines.push(`Correct answer: ${mistake.correctText}`);
  }
  const explanation = buildMistakeExplain(mistake);
  if (explanation) lines.push(`Explanation: ${explanation}`);
  if (mistake.context) lines.push(`Context: ${trimContext(mistake.context)}`);
  return lines.join('\n');
}

export function buildCoachPrompt(mistake, userQuestion) {
  const context = buildMistakeContext(mistake);
  const prompt = normalizeText(userQuestion);
  const moduleKey = String(mistake?.module || '').toLowerCase();
  const focus = MODULE_FOCUS[moduleKey] || 'Focus on why the selected answer is wrong and how to fix it next time.';
  return `${context}\n\nModule focus: ${focus}\nUser question: ${prompt}\nPlease explain clearly in English with 4 bullet points, then give one study tip.`;
}


function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

// authHeaders is now handled by getAiHeaders from runtimeApi.js

function normalizeApiReply(payload = {}) {
  const text = payload.reply || payload.text || payload.message || payload.content || '';
  return {
    text: String(text || '').trim(),
    source: payload.source || 'online',
  };
}

export function buildLocalCoachReply(mistake, userQuestion) {
  const explain = buildMistakeExplain(mistake);
  const normalized = normalizeText(userQuestion).toLowerCase();
  const tips = {
    reading: 'Tip: underline the exact sentence that supports the correct option.',
    listening: 'Tip: note contrast words (however, although, instead) and numbers.',
    grammar: 'Tip: check tense markers and preposition pairs before selecting.',
    vocab: 'Tip: compare the example sentence to the definition, not just the word form.',
    writing: 'Tip: revise one sentence to fix cohesion or grammar, then re-check the rubric.',
    speaking: 'Tip: state one clear claim, then add one supporting detail before moving on.',
  };
  const baseTip = tips[mistake?.module] || 'Tip: eliminate options that clash with the main clue.';

  if (!normalized) {
    return `${explain}\n${baseTip}`.trim();
  }

  if (normalized.includes('why')) {
    return `${explain}\n${baseTip}`.trim();
  }
  if (normalized.includes('clue') || normalized.includes('evidence')) {
    return `Key clue: the correct option matches the specific evidence line, while the incorrect option adds unsupported detail. ${baseTip}`.trim();
  }
  if (normalized.includes('correct')) {
    return `The correct option is the one fully supported by the text/audio/lesson. ${explain}`.trim();
  }
  return `${explain}\n${baseTip}`.trim();
}

export async function requestMistakeCoachReply({ mistake, question, history = [] } = {}) {
  const prompt = buildCoachPrompt(mistake, question);
  const localReply = () => ({ text: buildLocalCoachReply(mistake, question), source: 'local' });

  if (!isHostedAiMode()) {
    const timeout = withTimeout();
    try {
      const formattedHistory = Array.isArray(history)
        ? history.slice(-8).map((item) => ({ role: item.role, content: item.text || item.content || '' }))
        : [];
      const finalMessages = buildAIMessages(formattedHistory, prompt);
      const directReply = await executeDirectAiChat({
        systemPrompt: `You are an academic English mistake coach.
Use only the learner context supplied in the conversation.
Explain why the selected answer is wrong, identify the evidence or language rule,
and give one short strategy the learner can reuse. Be concise, accurate, and supportive.
Do not invent official exam rules or reproduce external copyrighted exercises that were not supplied by the learner.`,
        messages: finalMessages,
        signal: timeout.signal,
        capability: 'mistake_coach',
      });

      if (directReply) {
        return { text: String(directReply).trim(), source: 'byok' };
      }
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('Selected mistake-coach provider failed:', error?.message || String(error));
      }
    } finally {
      timeout.clear();
    }
    return localReply();
  }

  if (!MISTAKE_ENDPOINT) return localReply();

  let lastErr = null;
  for (let attempt = 0; attempt <= DEFAULT_RETRIES; attempt += 1) {
    const timeout = withTimeout();
    try {
      const res = await fetch(MISTAKE_ENDPOINT, {
        method: 'POST',
        headers: getAiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          prompt,
          question: String(question || ''),
          mistake,
          history: Array.isArray(history) ? history.slice(-8) : [],
          app: 'buept-app',
        }),
        signal: timeout.signal,
      });
      if (!res.ok) {
        const error = new Error(`Hosted mistake coach failed (${res.status})`);
        error.status = res.status;
        throw error;
      }
      const json = await res.json().catch(() => ({}));
      const normalized = normalizeApiReply(json);
      if (normalized.text) return normalized;
      throw new Error('Hosted mistake coach returned an empty response.');
    } catch (error) {
      lastErr = error;
      if (attempt < DEFAULT_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      timeout.clear();
    }
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__ && lastErr) {
    console.warn('Hosted mistake coach failed:', lastErr?.message || String(lastErr));
  }
  return localReply();
}
