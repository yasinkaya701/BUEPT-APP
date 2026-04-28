import { getRuntimeApiKey, resolveApiEndpoint, getAiHeaders } from './runtimeApi';

const VIDEO_ENDPOINT = resolveApiEndpoint('BUEPT_VIDEO_LESSON_API_URL', '/api/video-lesson');

function withTimeout(ms = 18000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

// authHeaders is now handled by getAiHeaders from runtimeApi.js

function clean(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  return text || fallback;
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeScene(scene = {}, index = 0) {
  const durationSec = clampNumber(scene.durationSec, 20, 180, 45);
  const bullets = Array.isArray(scene.bullets)
    ? scene.bullets.filter(Boolean).slice(0, 4).map((b) => clean(String(b), ''))
    : [];

  return {
    id: clean(scene.id, `scene_${index + 1}`),
    heading: clean(scene.heading, `Scene ${index + 1}`),
    bullets: bullets.length ? bullets : ['Core idea', 'Key term', 'Example'],
    narration: clean(scene.narration, 'Let us focus on this concept and its practical use.'),
    durationSec,
    quiz: clean(scene.quiz, 'What is one key takeaway from this part?'),
  };
}

function deriveKeyTermsFromScenes(scenes = [], topic = '') {
  const pool = [];
  if (topic) pool.push(...String(topic).toLowerCase().split(/\s+/));
  scenes.forEach((scene) => {
    pool.push(...String(scene.heading || '').toLowerCase().split(/\s+/));
    (scene.bullets || []).forEach((item) => {
      pool.push(...String(item || '').toLowerCase().split(/\s+/));
    });
  });
  const seen = new Set();
  return pool
    .map((item) => item.replace(/[^a-z0-9-]/g, ''))
    .filter((item) => item && item.length >= 4)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    })
    .slice(0, 8);
}

function buildLearningGoals(topic = '', level = 'B1') {
  const safeTopic = clean(topic, 'this topic');
  return [
    `Explain ${safeTopic} in clear ${level}-level English.`,
    'Recognize the core rule or strategy without long hesitation.',
    'Transfer the explanation into one short exam-style response.',
  ];
}

function buildPracticeTasks(scenes = []) {
  return scenes.map((scene) => clean(scene.quiz, 'State one key takeaway from this scene.')).slice(0, 4);
}

function normalizeVideo(payload = {}, topic = '') {
  const rawUrl = clean(payload.videoUrl || payload.video_url || payload.url, '');
  const isHttp = /^https?:\/\//i.test(rawUrl);
  return {
    title: clean(payload.videoTitle || payload.video_title, `${topic}: Storyboard`),
    videoUrl: isHttp ? rawUrl : '',
    posterUrl: clean(payload.posterUrl || payload.poster_url, ''),
    provider: clean(payload.provider, isHttp ? 'AI video endpoint' : 'AI storyboard only'),
    generated: isHttp,
  };
}

function normalizeLesson(payload = {}, topic = 'Topic') {
  const scenes = Array.isArray(payload.scenes)
    ? payload.scenes.map((scene, index) => normalizeScene(scene, index)).slice(0, 8)
    : [];
  const video = normalizeVideo(payload, topic);
  const finalScenes = scenes.length ? scenes : buildLocalLesson({ topic });

  return {
    title: clean(payload.title, `${topic}: AI Lesson Video`),
    summary: clean(payload.summary, 'AI-generated lesson flow with narration and guided checkpoints.'),
    scenes: finalScenes,
    video,
    source: payload.source || (VIDEO_ENDPOINT ? 'online' : 'offline'),
    learningGoals: Array.isArray(payload.learningGoals)
      ? payload.learningGoals.filter(Boolean).slice(0, 4)
      : buildLearningGoals(topic, clean(payload.level, 'B1')),
    keyTerms: Array.isArray(payload.keyTerms)
      ? payload.keyTerms.filter(Boolean).slice(0, 8)
      : deriveKeyTermsFromScenes(finalScenes, topic),
    practiceTasks: Array.isArray(payload.practiceTasks)
      ? payload.practiceTasks.filter(Boolean).slice(0, 4)
      : buildPracticeTasks(finalScenes),
    diagnostic: clean(payload.diagnostic, ''),
  };
}

function buildLocalLesson({ topic = 'Academic Writing', level = 'B1', durationMin = 4 } = {}) {
  const t = clean(topic, 'Academic Writing');
  const d = clampNumber(durationMin, 2, 12, 4);
  const each = clampNumber((d * 60) / 4, 25, 110, 45);

  return [
    {
      id: 'scene_intro',
      heading: `${t}: Big Picture`,
      bullets: ['Definition and scope', 'Why it matters in exams', 'Common mistakes'],
      narration: `${t} is a core topic at ${level} level. In this lesson, we will focus on meaning, common errors, and how to apply it under exam time pressure.`,
      durationSec: each,
      quiz: `In one sentence, define ${t} using your own words.`,
    },
    {
      id: 'scene_core',
      heading: 'Core Rule Set',
      bullets: ['Rule 1 with quick trigger', 'Rule 2 with contrast', 'Rule 3 with exam clue'],
      narration: `The first checkpoint is to identify the rule trigger. Then compare options, and eliminate forms that break agreement, tense logic, or meaning consistency.`,
      durationSec: each,
      quiz: 'Which rule is easiest to apply first when options look similar?',
    },
    {
      id: 'scene_example',
      heading: 'Worked Example',
      bullets: ['Read stem fast', 'Mark clue words', 'Pick and justify answer'],
      narration: `Now take a sample item. We scan clue words, test each option quickly, and justify the final choice with one explicit rule. This avoids random guessing.`,
      durationSec: each,
      quiz: 'How would you justify your answer in a single rule-based sentence?',
    },
    {
      id: 'scene_transfer',
      heading: 'Transfer to Real Exam',
      bullets: ['30-second strategy', 'Error checklist', 'Mini practice loop'],
      narration: `For transfer, use a 30-second loop: detect clue, apply rule, verify meaning, and move on. Repeat this loop consistently across the section.`,
      durationSec: each,
      quiz: 'What is your personal 30-second solving routine?',
    },
  ];
}

export function isVideoLessonApiConfigured() {
  return !!VIDEO_ENDPOINT;
}

export async function generateVideoLesson({ topic, level = 'B1', durationMin = 4 } = {}) {
  const normalizedTopic = clean(topic, 'Academic Writing');
  const normalizedLevel = clean(level, 'B1');
  const normalizedDuration = clampNumber(durationMin, 2, 12, 4);

  if (!VIDEO_ENDPOINT) {
    return {
      title: `${normalizedTopic}: AI Lesson Storyboard`,
      summary: 'Generated locally from the built-in lesson engine.',
      scenes: buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration }),
      video: {
        title: `${normalizedTopic}: Storyboard`,
        videoUrl: '',
        posterUrl: '',
        provider: 'AI storyboard only',
        generated: false,
      },
      source: 'local-storyboard',
      learningGoals: buildLearningGoals(normalizedTopic, normalizedLevel),
      keyTerms: deriveKeyTermsFromScenes(buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration }), normalizedTopic),
      practiceTasks: buildPracticeTasks(buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration })),
      diagnostic: '',
    };
  }

  const payload = {
    topic: normalizedTopic,
    level: normalizedLevel,
    durationMin: normalizedDuration,
    format: 'lesson_video_storyboard',
    app: 'buept-mobile',
  };

  const timeout = withTimeout();
  try {
    const res = await fetch(VIDEO_ENDPOINT, {
      method: 'POST',
      headers: getAiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: timeout.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return normalizeLesson(json, normalizedTopic);
  } catch (_) {
    return {
      title: `${normalizedTopic}: AI Lesson Storyboard`,
      summary: 'Online generation failed, but a real local storyboard was created.',
      scenes: buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration }),
      video: {
        title: `${normalizedTopic}: Storyboard`,
        videoUrl: '',
        posterUrl: '',
        provider: 'AI storyboard only',
        generated: false,
      },
      source: 'local-storyboard',
      learningGoals: buildLearningGoals(normalizedTopic, normalizedLevel),
      keyTerms: deriveKeyTermsFromScenes(buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration }), normalizedTopic),
      practiceTasks: buildPracticeTasks(buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration })),
      diagnostic: 'Live lesson generation failed, so the local storyboard engine created the lesson.',
    };
  } finally {
    timeout.clear();
  }
}
