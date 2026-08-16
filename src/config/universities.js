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
      // Official YADYÖK BUEPT has THREE scored parts: Listening (Selective +
      // Careful), Reading (Search + Careful) and Writing (2 essays, 40 min each).
      // There is NO Speaking section on the real exam (verified against the
      // official Test Content and Scoring page and the 2026 sample exam).
      // Speaking is offered only as bonus practice — it never appears in the
      // official exam order and is never scored toward the mock result.
      sections: ['listening-selective', 'listening-careful', 'reading-search', 'reading-careful', 'writing'],
      passRule:
        'Writing average must reach 56+ (letter grades E=100 … ABS=0). Listening + Reading together must reach 60/100 (S grade). Overall letter grades: A 85–100, B 70–84, C+ 65–69, C 60–64 — C (60) passes.',
      timing: {
        totalExam: '~3.5 hours (BUEPT 10:30–15:30)',
        'listening-selective': 'Lecture read ONCE. 3 min pre-study of questions → answer while listening → 3 min check.',
        'listening-careful': 'Take notes on blank paper while the lecture is read ONCE → questions given afterwards → 15 min to answer.',
        'reading-search': 'Short, precise answers; matching + MC letter answers also possible.',
        'reading-careful': '~50 min for the passage; short-answer + MC (write the letter) items.',
        writing: 'Two essays, ~1 A4 page each, 40 min per essay (1h20 total). Guideline ideas are given; both prompts provided up front.',
      },
      bonusPractice: {
        speaking: 'Speaking is NOT on the real BUEPT. The in-app mock interview is bonus practice only and is never scored in official simulations.',
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
    // METU EPE/İYS 2026 format (verified: epe.metu.edu.tr 8 Sep 2026
    // announcement "1. Oturum: Dinleme, Okuma, Not Alma, Yazma" + temaDil/
    // epeguide breakdowns: Reading 32 pts/60 min, Listening 9 pts/15 min,
    // Writing 20 pts/35 min, Speaking 15 pts/8 min on the face-to-face exam).
    // Key difference vs BUSEPT: METU READING dominates (~42% of points), has
    // a separate NOTE-TAKING block, shorter listening, ONE essay, and DOES
    // include a speaking block on the face-to-face exam.
    key: 'odtu',
    name: 'Middle East Technical University',
    shortName: 'ODTÜ-EPE',
    examName: 'ODTÜ İngilizce Yeterlik Sınavı (EPE / İYS)',
    adminName: 'Yabancı Diller Yüksekokulu (SFL)',
    accent: '#7c3aed',
    accentSoft: '#f5f3ff',
    format: {
      sections: ['listening', 'reading', 'note-taking', 'writing', 'speaking'],
      passRule:
        'Pass band is ~60/100 overall; scores 85+ exempt you from later English courses (IS100). Reading carries the largest share (~32 pts of 76).',
      timing: {
        totalExam: '~165 minutes (single session: Dinleme, Okuma, Not Alma, Yazma)',
        listening: '~15 min • 9 pts — short talks, dialogues and one lecture excerpt.',
        reading: '60 min • 32 pts — 4-5 dense academic texts + a graph-interpretation item; main idea, inference, purpose, vocab-in-context.',
        'note-taking': 'Lecture listened once → notes taken → questions answered afterwards.',
        writing: '~35 min • 20 pts — one essay (~180-250 words) with idea guidelines provided.',
        speaking: '~8 min • 15 pts — face-to-face speaking block (unlike BUSEPT, METU includes speaking).',
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
      'METU\'s exam is reading-dominated with a separate note-taking block and a real speaking section. Offline METU-style mocks and AI generation included.',
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
