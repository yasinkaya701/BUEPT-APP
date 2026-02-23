/**
 * Demo module catalog for Feature Hub.
 * Add new demos here; screen logic reads from this file.
 */

export const BADGE_CONFIG = {
  New: { bg: '#DCFCE7', text: '#166534' },
  AI: { bg: '#EDE9FE', text: '#5B21B6' },
  Popular: { bg: '#FEF3C7', text: '#92400E' },
};

const BASE_CATEGORIES = ['All', 'Favorites'];
const CATEGORY_ORDER = ['Assessment', 'Skills', 'AI Tools', 'Community', 'University'];

const RAW_MODULES = [
  {
    id: 'placement',
    icon: 'bar-chart',
    title: 'Placement & CEFR Testing',
    desc: 'Comprehensive A1-C1 placement exam measuring Grammar, Listening and Reading. Sets personal learning paths.',
    category: 'Assessment',
    route: 'PlacementTest',
    badge: 'Popular',
    color: '#4F46E5',
    tags: ['placement', 'cefr', 'assessment'],
  },
  {
    id: 'prof_mocks',
    icon: 'library',
    title: 'Hazirlik Atlama Mocks',
    desc: 'Mock exams mirroring the exact structure of BUEPT exemption tests with timed conditions.',
    category: 'Assessment',
    route: 'ProficiencyMock',
    color: '#4F46E5',
    tags: ['mock', 'proficiency', 'exam'],
  },
  {
    id: 'academic_writing',
    icon: 'document-text',
    title: 'Academic Writing Lab',
    desc: 'Essay structuring templates, transitional word libraries, and academic tone feedback.',
    category: 'Skills',
    route: 'AcademicWriting',
    color: '#059669',
    tags: ['writing', 'essay'],
  },
  {
    id: 'plagiarism_shield',
    icon: 'scan',
    title: 'Plagiarism Shield',
    desc: 'Deep scanning of essay drafts against academic journals and university repositories.',
    category: 'Assessment',
    route: 'PlagiarismChecker',
    color: '#4F46E5',
    tags: ['plagiarism', 'writing'],
  },
  {
    id: 'essay_grader',
    icon: 'checkmark-circle',
    title: 'Automated Essay Evaluation',
    desc: 'Instant grading for grammar, lexical resource, coherence, and academic tone.',
    category: 'Assessment',
    route: 'EssayEvaluation',
    badge: 'AI',
    color: '#4F46E5',
    tags: ['ai', 'essay', 'grading'],
  },
  {
    id: 'terminology',
    icon: 'book',
    title: 'Terminology Dictionary',
    desc: 'Department-specific vocabulary with audible pronunciations, word families, and bilingual examples.',
    category: 'Skills',
    route: 'TerminologyDictionary',
    color: '#059669',
    tags: ['dictionary', 'vocabulary'],
  },
  {
    id: 'ai_speaking',
    icon: 'mic',
    title: 'AI Speaking Partner',
    desc: 'Virtual conversation practice with pronunciation analysis and academic scenario roleplay.',
    category: 'AI Tools',
    route: 'AISpeakingPartner',
    badge: 'AI',
    color: '#7C3AED',
    tags: ['ai', 'speaking'],
  },
  {
    id: 'listening_lab',
    icon: 'headset',
    title: 'Lecture Listening Lab',
    desc: 'Simulated university lectures, podcast integrations, and guided note-taking sessions.',
    category: 'Skills',
    route: 'LectureListeningLab',
    color: '#059669',
    tags: ['listening', 'lecture'],
  },
  {
    id: 'micro_learning',
    icon: 'flash',
    title: 'Micro-Learning Vocab',
    desc: 'Fast-paced 2-minute spaced-repetition flashcard sessions for transit times.',
    category: 'Skills',
    route: 'MicroLearning',
    badge: 'Popular',
    color: '#059669',
    tags: ['vocab', 'flashcard'],
  },
  {
    id: 'adv_reading',
    icon: 'newspaper',
    title: 'Advanced Academic Reading',
    desc: 'Department-specific articles with fill-in-the-blank exercises, word tooltips, and inferred meaning tasks.',
    category: 'Skills',
    route: 'AdvancedReading',
    badge: 'New',
    color: '#059669',
    tags: ['reading', 'academic'],
  },
  {
    id: 'interactive_vocab',
    icon: 'options',
    title: 'Interactive Vocab Engine',
    desc: 'Word family trees, synonyms, antonyms, bilingual example sentences and TTS pronunciation.',
    category: 'Skills',
    route: 'InteractiveVocabulary',
    badge: 'New',
    color: '#059669',
    tags: ['vocab', 'synonym'],
  },
  {
    id: 'curriculum',
    icon: 'calendar',
    title: 'Curriculum Sync',
    desc: 'Consolidating weekly classroom grammar and vocab topics directly into the app.',
    category: 'University',
    route: 'CurriculumSync',
    color: '#B45309',
    tags: ['curriculum', 'university'],
  },
  {
    id: 'class_schedule_calendar',
    icon: 'calendar-clear',
    title: 'Class Schedule Calendar',
    desc: 'View uploaded class schedules on a monthly calendar with section filters and holiday markers.',
    category: 'University',
    route: 'ClassScheduleCalendar',
    badge: 'New',
    color: '#B45309',
    tags: ['schedule', 'calendar', 'holiday'],
  },
  {
    id: 'campus_social',
    icon: 'people',
    title: 'Campus Social Hub',
    desc: 'Department-specific leaderboards, language exchange matching, and faculty-wide mini games.',
    category: 'Community',
    route: 'CampusSocial',
    color: '#DB2777',
    tags: ['community', 'social'],
  },
  {
    id: 'lang_match',
    icon: 'swap-horizontal',
    title: 'Match & Speak Engine',
    desc: 'Tinder-style language exchange swiping to connect with international peers.',
    category: 'Community',
    route: 'LanguageExchangeMatching',
    color: '#DB2777',
    tags: ['match', 'speaking'],
  },
  {
    id: 'teacher_dash',
    icon: 'school',
    title: 'Teacher Integration',
    desc: 'Homework assignments, syllabus sync, and direct progress reporting to instructors.',
    category: 'University',
    route: 'Assignments',
    color: '#B45309',
    tags: ['teacher', 'assignment'],
  },
  {
    id: 'discussion',
    icon: 'chatbubbles',
    title: 'Discussion Forums',
    desc: 'English-only closed groups for specific academic topics and study groups.',
    category: 'Community',
    route: 'DiscussionForums',
    color: '#DB2777',
    tags: ['forum', 'discussion'],
  },
  {
    id: 'live_classes',
    icon: 'videocam',
    title: 'Live Classes & Breakouts',
    desc: 'Mini grammar streams, Q&A rooms, and peer-to-peer breakout practice sessions.',
    category: 'Community',
    route: 'LiveClasses',
    color: '#DB2777',
    tags: ['live', 'class'],
  },
  {
    id: 'weak_point',
    icon: 'analytics',
    title: 'Weak Point Analysis',
    desc: 'Smart diagnostics targeting your specific weak areas from recent exam results.',
    category: 'Assessment',
    route: 'WeakPointAnalysis',
    badge: 'AI',
    color: '#4F46E5',
    tags: ['analysis', 'weakness'],
  },
  {
    id: 'real_life',
    icon: 'briefcase',
    title: 'Real Life Modules',
    desc: 'Erasmus interview simulator, academic email templates, and conference Q&A practice.',
    category: 'Community',
    route: 'RealLifeModules',
    color: '#DB2777',
    tags: ['interview', 'email'],
  },
  {
    id: 'email_designer',
    icon: 'mail-unread',
    title: 'Academic Email Etiquette',
    desc: '1-click templates for extensions, recommendation letters, and grade dispute emails.',
    category: 'Community',
    route: 'EmailTemplateDesigner',
    color: '#DB2777',
    tags: ['email', 'template'],
  },
  {
    id: 'presentation_prep',
    icon: 'easel',
    title: 'AI Presentation Prep',
    desc: 'Generate slide outlines, presentation scripts, and body language cues for academic talks.',
    category: 'AI Tools',
    route: 'AIPresentationPrep',
    badge: 'AI',
    color: '#7C3AED',
    tags: ['presentation', 'ai'],
  },
  {
    id: 'ai_lesson_video',
    icon: 'videocam',
    title: 'AI Lesson Video Studio',
    desc: 'Generate experimental lesson videos with scene timeline, narration, and quick checkpoints.',
    category: 'AI Tools',
    route: 'AILessonVideoStudio',
    badge: 'AI',
    color: '#7C3AED',
    tags: ['video', 'lesson', 'ai'],
  },
];

function cleanText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function createDemoModule(module, index = 0) {
  const fallbackId = `module_${index + 1}`;
  const category = cleanText(module.category, 'Skills');
  return {
    id: cleanText(module.id, fallbackId),
    icon: cleanText(module.icon, 'apps'),
    title: cleanText(module.title, 'Untitled Module'),
    desc: cleanText(module.desc, 'No description yet.'),
    category,
    route: typeof module.route === 'string' && module.route.trim() ? module.route.trim() : null,
    badge: module.badge || null,
    color: cleanText(module.color, '#4F46E5'),
    tags: Array.isArray(module.tags) ? module.tags : [],
  };
}

export const DEMO_MODULES = RAW_MODULES.map(createDemoModule);

export const DEMO_CATEGORIES = [
  ...BASE_CATEGORIES,
  ...CATEGORY_ORDER.filter((cat) => DEMO_MODULES.some((m) => m.category === cat)),
];

export const DEMO_ANALYTICS = {
  total: DEMO_MODULES.length,
  live: DEMO_MODULES.filter((m) => !!m.route).length,
  byCategory: DEMO_CATEGORIES.filter((c) => c !== 'All' && c !== 'Favorites').reduce((acc, category) => {
    acc[category] = DEMO_MODULES.filter((m) => m.category === category).length;
    return acc;
  }, {}),
};

function collectModuleIssues(modules) {
  const idMap = new Map();
  const issues = [];
  modules.forEach((m) => {
    if (!idMap.has(m.id)) idMap.set(m.id, 0);
    idMap.set(m.id, idMap.get(m.id) + 1);
    if (!m.title || m.title === 'Untitled Module') issues.push(`missing title: ${m.id}`);
    if (!m.desc || m.desc === 'No description yet.') issues.push(`missing description: ${m.id}`);
    if (!m.route) issues.push(`no route (coming soon): ${m.id}`);
  });
  idMap.forEach((count, id) => {
    if (count > 1) issues.push(`duplicate id: ${id}`);
  });
  return issues;
}

export const DEMO_ISSUES = collectModuleIssues(DEMO_MODULES);
