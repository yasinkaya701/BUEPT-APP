/**
 * aiMockGenerator.js — AI Mock Generator for BUEPT
 *
 * Generates exam-faithful mock exams via the Gemini API.
 * Official BUSEPT format (YADYOK):
 *  - Listening: Selective (~10 Q, pre-read 3 min, while-listening) + Careful (note-taking, 15 min after)
 *  - Reading: Search (~10 Q, scanning, short answers) + Careful (~10 Q, detail/inference)
 *  - Writing: 2 essays, ~250 words each, 40 min each (80 min total)
 * Scoring: pass at 60/100, letter grade S (satisfactory) / F (fail).
 *
 * Generated exams are validated against a JSON schema before being returned,
 * so a bad model response never crashes downstream screens.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchDirectGeminiChat,
  getRuntimeApiKey,
  getRuntimeApiAccessConfig,
} from './runtimeApi';

const MOCK_KEY = 'ai_mock_bank_v1';

export const MOCK_LEVELS = [
  { key: 'P1', label: 'B1 (P1) — Elementary' },
  { key: 'P2', label: 'B1+ (P2) — Pre-Intermediate' },
  { key: 'P3', label: 'B2 (P3) — Intermediate' },
  { key: 'P4', label: 'C1 (P4) — Advanced' },
];

export const MOCK_SECTIONS = [
  { key: 'listening', label: 'Listening' },
  { key: 'reading', label: 'Reading' },
  { key: 'writing', label: 'Writing' },
  { key: 'full', label: 'Full BUSEPT (Listening + Reading + Writing)' },
];

function short(text, max = 400) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}...`;
}

/** Build a BUSEPT-faithful generation prompt and a JSON schema. */
function buildGenerationSpec({ section, level, essayTopics = null }) {
  const levelDesc = {
    P1: 'A2-B1 elementary. Simple sentences, common academic vocabulary, straightforward grammar.',
    P2: 'B1-B1+ pre-intermediate. Moderately complex sentences, common academic vocabulary.',
    P3: 'B2 intermediate. Complex sentences, academic register, abstract but familiar topics.',
    P4: 'C1 advanced. Sophisticated syntax, abstract academic discourse, dense vocabulary.',
  }[level] || level;

  const base = `You are an expert exam writer for the Boğaziçi University English Proficiency Test (BUEPT), administered by YADYOK. Model your items on the official YADYOK sample exam (e.g. the 2026 sample: 'Family Life' / 'Expression of Emotions' listening, 'Zheng He' Reading I, 'Cross-Cultural Adaptation' Reading II).
The official BUSEPT format is:
- LISTENING: two parts, texts read ONCE only. Selective Listening (~9-10 questions): students study questions for 3 min, answer WHILE listening (questions in the same order the information is delivered, mostly sentence-completion wh- short answers), then get 3 min to check. Careful Listening (~10 questions): students take notes while listening WITHOUT seeing questions, then answer from notes in 15 min; items are definitions, causes/factors, main ideas; an occasional multiple-choice case item (A-F) is acceptable.
- READING: two parts. Reading I Search (~11 questions, 45 min): a numbered-paragraph academic article; items are vocabulary-in-context MC, paragraph-purpose MC, short-answer sentence completions, main-idea MC, NOT-mentioned MC, inserted-sentence (place a sentence at position A/B/C/D), paragraph-relationship MC, cross-text comparison MC, and whole-text inference MC. Reading II Careful (~10 questions, 50 min): a second academic article with in-text citations; includes MC, short-answer questions tied to specific cited studies, and a PARAGRAPH-MATCHING task (match short supporting texts to paragraph numbers, with one extra unused paragraph number).
- WRITING: two different essay topics (e.g. 'discussing the negative effects of globalization'), each about 250 words, 40 minutes per essay (1h20 total); helper-idea guidelines are provided and may be used or replaced.
Scoring: pass 60/100, letter grade S/F. Students must give SHORT AND PRECISE answers; extra information is to their disadvantage.

Language level for this mock: ${levelDesc}

Generate the exam content requested. Use 'short_answer' for wh- questions and sentence completions, with a model answer array of 1-3 acceptable short-phrase variants (2-5 words each, lowercased). Use 'multiple_choice' with 4 options and a 0-based correct index. Use 'matching' for paragraph-matching or definition matching: left items plus an options array that includes one extra/unused option, and correct as the 0-based index of the right option.
Every generated item MUST be original content, coherent, academically appropriate, and answerable from the given text/transcript. Never copy real exam texts verbatim — generate fresh, similar-spirited academic content.`;

  const schema = {
    listening: {
      prompt: `${base}

Section requested: FULL LISTENING (Selective + Careful).
Return JSON:
{
  "selective": { "title": "...", "preReadSeconds": 180, "checkSeconds": 180, "transcript": "...", "questions": [ { "id": "s1", "type": "short_answer"|"multiple_choice"|"matching", "q": "...", "answer": ["..."], "options": ["..."] (only multiple_choice/matching), "correct": 0-3 (only multiple_choice/matching) } ] },
  "careful": { "title": "...", "transcript": "...", "answerSeconds": 900, "questions": [ same shape, ~10 ] }
}
Selective transcript ~180-240 words, ~10 questions. Careful transcript ~260-340 words, ~10 questions (note-taking style: answers found by listening for main ideas, contrasts, reasons, examples, definitions).`,
      validate: (j) => {
        const s = j?.selective;
        const c = j?.careful;
        return (
          !!s && !!c &&
          Array.isArray(s.questions) && s.questions.length >= 6 &&
          Array.isArray(c.questions) && c.questions.length >= 6 &&
          !!s.transcript && !!c.transcript
        );
      },
    },
    reading: {
      prompt: `${base}

Section requested: FULL READING (Search + Careful).
Return JSON:
{
  "search": { "title": "...", "article": "...", "timeMinutes": 32, "questions": [ { "id": "r1", "type": "short_answer"|"multiple_choice", "q": "...", "answer": ["..."], "options": ["..."] (only multiple_choice), "correct": 0-3 (only multiple_choice) } ] },
  "careful": { "title": "...", "article": "...", "timeMinutes": 45, "questions": [ same shape, ~10 ] }
}
Each article 400-550 words. Search questions must require scanning for specific information; Careful questions test main idea, detail, inference, and paragraph relationships. ~10 questions each.`,
      validate: (j) => {
        const s = j?.search;
        const c = j?.careful;
        return (
          !!s && !!c &&
          Array.isArray(s.questions) && s.questions.length >= 6 &&
          Array.isArray(c.questions) && c.questions.length >= 6 &&
          !!s.article && !!c.article
        );
      },
    },
    writing: {
      prompt: `${base}

Section requested: FULL WRITING (TWE).
Return JSON:
{
  "essays": [
    { "id": "w1", "topic": "...", "helperIdeas": ["...", "...", "..."], "timeMinutes": 40, "wordTarget": 250, "promptText": "Write an essay of about 250 words on the topic above. You may use the helper ideas or your own." },
    { "id": "w2", "topic": "...", "helperIdeas": ["...", "..."], "timeMinutes": 40, "wordTarget": 250, "promptText": "..." }
  ]
}
Topics should be argumentative or compare-contrast academic essay topics suitable for the level, with 2-3 helper ideas each. Return exactly 2 essays.`,
      validate: (j) => Array.isArray(j?.essays) && j.essays.length >= 2 && !!j.essays[0]?.topic && !!j.essays[1]?.topic,
    },
    full: {
      prompt: `${base}

Section requested: FULL BUSEPT MOCK EXAM (Listening + Reading + Writing).
Return JSON:
{
  "listening": { "selective": { "title": "...", "preReadSeconds": 180, "checkSeconds": 180, "transcript": "...", "questions": [ {...} ] }, "careful": { "title": "...", "transcript": "...", "answerSeconds": 900, "questions": [ {...} ] } },
  "reading": { "search": { "title": "...", "article": "...", "timeMinutes": 32, "questions": [ {...} ] }, "careful": { "title": "...", "article": "...", "timeMinutes": 45, "questions": [ {...} ] } },
  "writing": { "essays": [ { "id": "w1", "topic": "...", "helperIdeas": ["..."], "timeMinutes": 40, "wordTarget": 250, "promptText": "..." }, { "id": "w2", "topic": "...", "helperIdeas": ["..."], "timeMinutes": 40, "wordTarget": 250, "promptText": "..." } ] }
}
Question shapes are documented above per section. Listening ~8 questions per part, Reading ~8 questions per part, Writing exactly 2 essays.`,
      validate: (j) => {
        const lis = j?.listening;
        const rea = j?.reading;
        const wri = j?.writing;
        return (
          !!lis && !!rea && !!wri &&
          Array.isArray(lis.selective?.questions) && lis.selective.questions.length >= 4 &&
          Array.isArray(lis.careful?.questions) && lis.careful.questions.length >= 4 &&
          Array.isArray(rea.search?.questions) && rea.search.questions.length >= 4 &&
          Array.isArray(rea.careful?.questions) && rea.careful.questions.length >= 4 &&
          Array.isArray(wri.essays) && wri.essays.length >= 2 && !!wri.essays[0]?.topic && !!wri.essays[1]?.topic
        );
      },
    },
  };

  const spec = schema[section] || schema.full;
  return { ...spec, base };
}

function sanitize(raw) {
  if (!raw) return null;
  const text = String(raw).trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    // Try to recover by trimming markdown fences
    let t = text;
    t = t.replace(/```json\s*/i, '').replace(/```\s*$/i, '');
    const s2 = t.indexOf('{');
    const e2 = t.lastIndexOf('}');
    if (s2 !== -1 && e2 > s2) {
      try {
        return JSON.parse(t.slice(s2, e2 + 1));
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

function normalizeItem(item, idx) {
  if (!item || !item.q) return null;
  const type = String(item.type || 'short_answer');
  const options = Array.isArray(item.options) ? item.options.filter(Boolean).slice(0, 4) : [];
  const answer = Array.isArray(item.answer) ? item.answer.filter(Boolean).slice(0, 3) : [];
  const correct = Number(item.correct);
  const out = {
    id: item.id || `q_${idx + 1}`,
    type,
    q: short(item.q, 500),
  };
  if (type === 'multiple_choice' && options.length >= 2 && Number.isFinite(correct) && correct >= 0 && correct < options.length) {
    out.options = options;
    out.correct = correct;
  } else if (type === 'matching' && options.length >= 3 && Number.isFinite(correct)) {
    out.options = options;
    out.correct = Math.max(0, Math.min(options.length - 1, correct));
  } else {
    out.type = answer.length > 0 ? 'short_answer' : 'multiple_choice';
    out.answer = answer;
    if (type !== 'short_answer' && options.length >= 2 && Number.isFinite(correct)) {
      out.options = options;
      out.correct = correct;
    }
  }
  return out;
}

function normalizeExam(raw, section, level) {
  if (!raw) return null;
  const exam = {
    id: `aimock_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    level,
    section,
    meta: {
      source: 'ai-mock-generator',
      passScore: 60,
      officialFormat: true,
    },
  };
  if (section === 'listening' || section === 'full') {
    const s = raw.listening?.selective;
    const c = raw.listening?.careful;
    if (s) {
      exam.listening = {
        selective: {
          title: short(s.title || 'Selective Listening', 80),
          preReadSeconds: Number(s.preReadSeconds) || 180,
          checkSeconds: Number(s.checkSeconds) || 180,
          transcript: short(s.transcript, 2000),
          questions: (s.questions || []).map(normalizeItem).filter(Boolean),
        },
        careful: {
          title: short(c?.title || 'Careful Listening', 80),
          answerSeconds: Number(c?.answerSeconds) || 900,
          transcript: short(c?.transcript, 2000),
          questions: (c?.questions || []).map(normalizeItem).filter(Boolean),
        },
      };
    }
  }
  if (section === 'reading' || section === 'full') {
    const s = raw.reading?.search;
    const c = raw.reading?.careful;
    if (s) {
      exam.reading = {
        search: {
          title: short(s.title || 'Search Reading', 80),
          timeMinutes: Number(s.timeMinutes) || 32,
          article: short(s.article, 3500),
          questions: (s.questions || []).map(normalizeItem).filter(Boolean),
        },
        careful: {
          title: short(c?.title || 'Careful Reading', 80),
          timeMinutes: Number(c?.timeMinutes) || 45,
          article: short(c?.article, 3500),
          questions: (c?.questions || []).map(normalizeItem).filter(Boolean),
        },
      };
    }
  }
  if (section === 'writing' || section === 'full') {
    const essays = (raw.writing?.essays || []).slice(0, 2).map((e, i) => ({
      id: e.id || `w${i + 1}`,
      topic: short(e.topic, 300),
      helperIdeas: (Array.isArray(e.helperIdeas) ? e.helperIdeas : []).filter(Boolean).slice(0, 4),
      timeMinutes: Number(e.timeMinutes) || 40,
      wordTarget: Number(e.wordTarget) || 250,
      promptText: e.promptText || `Write an essay of about ${Number(e.wordTarget) || 250} words on this topic.`,
    }));
    if (essays.length >= 2) exam.writing = { essays };
  }
  return exam;
}

export async function generateAiMock({ section = 'full', level = 'P3', onPartial = null } = {}) {
  if (!['listening', 'reading', 'writing', 'full'].includes(section)) {
    throw new Error(`Unknown mock section: ${section}`);
  }
  if (!MOCK_LEVELS.some((l) => l.key === level)) {
    throw new Error(`Unknown level: ${level}`);
  }
  const apiKey = getRuntimeApiKey();
  if (!apiKey) throw new Error('Gemini API key is not configured. Add it in Settings → AI Access.');
  const spec = buildGenerationSpec({ section, level });

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = setTimeout(() => { try { controller?.abort(); } catch (_) {} }, 120000);

  try {
    const rawText = await fetchDirectGeminiChat({
      systemPrompt: spec.base,
      messages: [{ role: 'user', content: spec.prompt }],
      jsonFormat: true,
      signal: controller?.signal || null,
    });
    clearTimeout(timeout);
    const parsed = sanitize(rawText);
    if (parsed && spec.validate(parsed)) {
      const exam = normalizeExam(parsed, section, level);
      if (exam) return { exam, source: 'online' };
    }
    // Retry once with a clearer retry instruction
    const retryText = await fetchDirectGeminiChat({
      systemPrompt: spec.base,
      messages: [
        { role: 'user', content: spec.prompt },
        {
          role: 'assistant',
          content: rawText || 'I will provide the requested JSON.',
        },
        {
          role: 'user',
          content: 'The previous response could not be parsed as valid JSON. Return ONLY the requested JSON object with no prose, no markdown fences, and no trailing text.',
        },
      ],
      jsonFormat: true,
    });
    const retryParsed = sanitize(retryText);
    if (retryParsed && spec.validate(retryParsed)) {
      const exam = normalizeExam(retryParsed, section, level);
      if (exam) return { exam, source: 'online' };
    }
    throw new Error('The AI model did not return a valid exam. Please try again.');
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

/** Cached/generated mock bank (persists across sessions). */
export async function loadMockBank() {
  try {
    const raw = await AsyncStorage.getItem(MOCK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function saveMockBank(bank) {
  try {
    await AsyncStorage.setItem(MOCK_KEY, JSON.stringify(bank.slice(0, 50)));
  } catch (_) {}
}

export async function addMockToBank(exam) {
  if (!exam) return;
  const bank = await loadMockBank();
  const next = [exam, ...bank.filter((m) => m.id !== exam.id)].slice(0, 50);
  await saveMockBank(next);
  return next;
}

export function isAiAccessAvailable() {
  const cfg = getRuntimeApiAccessConfig();
  return Boolean(cfg?.apiKey || getRuntimeApiKey());
}
