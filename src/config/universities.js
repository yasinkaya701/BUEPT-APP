/**
 * universities.js — multi-university versioning registry
 *
 * This is the foundation for per-university editions. Each entry describes a
 * university's English proficiency exam: its official format, pass rules,
 * branding accents and feature flags. The app resolves the active edition
 * from the URL query param `?uni=<key>` (web) or the persisted preference
 * (native), defaulting to BUSEPT.
 *
 * When adding a new university:
 *   1. Append an entry with a unique `key` (used in ?uni= URLs).
 *   2. Document its official section order, timing and pass rule in `format`.
 *   3. Add its accent colour and a short name for hub headers.
 *
 * UI surfaces (landing, hubs, mocks) consume `UNIVERSITIES` and should never
 * hard-code Boğaziçi-specific strings — use the active university object.
 */

export const UNIVERSITIES = [
  {
    key: 'buept',
    name: 'Boğaziçi University',
    shortName: 'BUSEPT',
    examName: 'BUSEPT — Boğaziçi University English Proficiency Test',
    adminName: 'YADYÖK (School of Foreign Languages)',
    accent: '#1e3a8a',
    accentSoft: '#eef2ff',
    format: {
      sections: ['listening-selective', 'listening-careful', 'reading-search', 'reading-careful', 'writing', 'speaking'],
      passRule: 'Each section must reach 60/100 (S grade). Overall pass requires no failing section.',
      timing: {
        'listening-selective': 'Played once; write short answers in order.',
        'listening-careful': 'Take notes from the lecture, then answer.',
        'reading-search': 'Scan the article; short, precise answers.',
        'reading-careful': 'Read carefully; MC letters and matching.',
        writing: 'Two essays, ~250 words each.',
        speaking: 'Mock interview, 4 questions, ~90 seconds each.',
      },
    },
    features: {
      offlineMocks: true,
      aiMocks: true,
      speakingRubric: true,
      srsWeakWords: true,
      officialSim: true,
    },
    blurb:
      'The official Boğaziçi proficiency exam, produced by YADYÖK. BUSEPT decides whether you start at the Preparatory Programme or go straight to your department.',
  },
  {
    key: 'ytu',
    name: 'Yıldız Technical University',
    shortName: 'YTÜ-EPE',
    examName: 'YTÜ English Proficiency Exam',
    adminName: 'School of Foreign Languages',
    accent: '#0f766e',
    accentSoft: '#f0fdfa',
    format: {
      sections: ['listening', 'reading', 'writing'],
      passRule: 'Section minimums apply; overall threshold set annually by the School of Foreign Languages.',
      timing: {},
    },
    features: {
      offlineMocks: false,
      aiMocks: true,
      speakingRubric: false,
      srsWeakWords: true,
      officialSim: false,
    },
    blurb:
      'YTÜ\'s proficiency exam for engineering and sciences students. Format details are released annually — AI mocks adapt to the current bulletin.',
  },
  {
    key: 'itu',
    name: 'Istanbul Technical University',
    shortName: 'İTÜ-EPE',
    examName: 'İTÜ English Proficiency Exam',
    adminName: 'School of Foreign Languages',
    accent: '#b45309',
    accentSoft: '#fffbeb',
    format: {
      sections: ['listening', 'reading', 'writing'],
      passRule: 'Overall and section thresholds announced each semester.',
      timing: {},
    },
    features: {
      offlineMocks: false,
      aiMocks: true,
      speakingRubric: false,
      srsWeakWords: true,
      officialSim: false,
    },
    blurb:
      'İTÜ\'s English proficiency exam determines prep-school placement. AI mocks can be tuned to the announced format each term.',
  },
  {
    key: 'odtu',
    name: 'Middle East Technical University',
    shortName: 'ODTÜ-EPE',
    examName: 'ODTÜ English Proficiency Exam',
    adminName: 'School of Foreign Languages',
    accent: '#7c3aed',
    accentSoft: '#f5f3ff',
    format: {
      sections: ['listening', 'reading', 'writing'],
      passRule: 'METU applies its own CEFR-based thresholds; 60+ is the common reference band.',
      timing: {},
    },
    features: {
      offlineMocks: false,
      aiMocks: true,
      speakingRubric: false,
      srsWeakWords: true,
      officialSim: false,
    },
    blurb:
      'METU\'s proficiency exam is known for academically dense reading passages. AI mocks can target the METU style specifically.',
  },
  {
    key: 'sabanci',
    name: 'Sabancı University',
    shortName: 'SU-EPE',
    examName: 'Sabancı University English Proficiency Exam',
    adminName: 'School of Languages',
    accent: '#be185d',
    accentSoft: '#fdf2f8',
    format: {
      sections: ['listening', 'reading', 'writing', 'speaking'],
      passRule: 'Sabancı includes a speaking component; thresholds follow its internal CEFR mapping.',
      timing: {},
    },
    features: {
      offlineMocks: false,
      aiMocks: true,
      speakingRubric: true,
      srsWeakWords: true,
      officialSim: false,
    },
    blurb:
      'Sabancı\'s exam includes a speaking module alongside listening, reading and writing. AI mocks support all four skills.',
  },
  {
    key: 'bilkent',
    name: 'Bilkent University',
    shortName: 'Bilkent-EPE',
    examName: 'Bilkent English Proficiency Exam',
    adminName: 'School of English Language',
    accent: '#15803d',
    accentSoft: '#f0fdf4',
    format: {
      sections: ['listening', 'reading', 'writing'],
      passRule: 'Bilkent uses its own band descriptors; overall pass with section minimums.',
      timing: {},
    },
    features: {
      offlineMocks: false,
      aiMocks: true,
      speakingRubric: false,
      srsWeakWords: true,
      officialSim: false,
    },
    blurb:
      'Bilkent\'s proficiency exam gates direct entry to faculties. AI mocks follow the announced format each academic year.',
  },
];

export function getUniversity(key) {
  return UNIVERSITIES.find((u) => u.key === key) || UNIVERSITIES[0];
}

/** Resolve the active university from a URL search string (?uni=...) on web. */
export function resolveUniversityFromQuery(search) {
  try {
    const params = new URLSearchParams(search || '');
    const key = params.get('uni');
    if (key) return getUniversity(key);
  } catch (_) {
    // malformed query — fall through to default
  }
  return getUniversity(null);
}

export const UNIVERSITY_KEYS = UNIVERSITIES.map((u) => u.key);
