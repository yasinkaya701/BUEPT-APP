const VIDEO_ENDPOINT =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_VIDEO_LESSON_API_URL
    ? process.env.BUEPT_VIDEO_LESSON_API_URL
    : '';

const API_KEY =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_API_KEY
    ? process.env.BUEPT_API_KEY
    : '';

function withTimeout(ms = 18000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

function authHeaders(extra = {}) {
  if (!API_KEY) return extra;
  return { ...extra, Authorization: `Bearer ${API_KEY}` };
}

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

const FALLBACK_VIDEOS = [
  {
    id: 'general_academic',
    title: 'Academic Skills Demo',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    provider: 'Google Sample Media',
  },
  {
    id: 'news_style',
    title: 'News-Style Listening Demo',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    provider: 'Google Sample Media',
  },
  {
    id: 'presentation_style',
    title: 'Presentation Demo',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    provider: 'Google Sample Media',
  },
];

function pickFallbackVideo(topic = '') {
  const lower = clean(topic, '').toLowerCase();
  if (lower.includes('news') || lower.includes('current') || lower.includes('policy')) return FALLBACK_VIDEOS[1];
  if (lower.includes('presentation') || lower.includes('talk') || lower.includes('speech')) return FALLBACK_VIDEOS[2];
  return FALLBACK_VIDEOS[0];
}

function normalizeVideo(payload = {}, topic = '') {
  const fallback = pickFallbackVideo(topic);
  const rawUrl = clean(payload.videoUrl || payload.video_url || payload.url, fallback.videoUrl);
  const isHttp = /^https?:\/\//i.test(rawUrl);
  return {
    title: clean(payload.videoTitle || payload.video_title, fallback.title),
    videoUrl: isHttp ? rawUrl : fallback.videoUrl,
    posterUrl: clean(payload.posterUrl || payload.poster_url, fallback.posterUrl),
    provider: clean(payload.provider, fallback.provider),
    generated: !!payload.videoUrl,
  };
}

function normalizeLesson(payload = {}, topic = 'Topic') {
  const scenes = Array.isArray(payload.scenes)
    ? payload.scenes.map((scene, index) => normalizeScene(scene, index)).slice(0, 8)
    : [];
  const video = normalizeVideo(payload, topic);

  return {
    title: clean(payload.title, `${topic}: AI Lesson Video`),
    summary: clean(payload.summary, 'AI-generated lesson flow with narration and guided checkpoints.'),
    scenes: scenes.length ? scenes : buildLocalLesson({ topic }),
    video,
    source: payload.source || (VIDEO_ENDPOINT ? 'online' : 'offline'),
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
    const video = pickFallbackVideo(normalizedTopic);
    return {
      title: `${normalizedTopic}: AI Lesson Video`,
      summary: 'Generated locally (offline mode). Set BUEPT_VIDEO_LESSON_API_URL for online generation.',
      scenes: buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration }),
      video: {
        title: video.title,
        videoUrl: video.videoUrl,
        posterUrl: video.posterUrl,
        provider: video.provider,
        generated: false,
      },
      source: 'offline',
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
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: timeout.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return normalizeLesson(json, normalizedTopic);
  } catch (_) {
    const video = pickFallbackVideo(normalizedTopic);
    return {
      title: `${normalizedTopic}: AI Lesson Video`,
      summary: 'Online video generation failed, fallback lesson created locally.',
      scenes: buildLocalLesson({ topic: normalizedTopic, level: normalizedLevel, durationMin: normalizedDuration }),
      video: {
        title: video.title,
        videoUrl: video.videoUrl,
        posterUrl: video.posterUrl,
        provider: video.provider,
        generated: false,
      },
      source: 'offline-fallback',
    };
  } finally {
    timeout.clear();
  }
}
