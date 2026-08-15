/**
 * gamification.js — XP, levels, streaks, and badges for BUEPT-APP.
 *
 * XP is awarded for every practice action; levels gate progress titles.
 * Streaks track consecutive days with at least one completed activity
 * (stored externally in AppState; helpers here compute the date logic).
 * Badges are unlocked by score/threshold events and are checked lazily
 * so screens can call checkBadgeUnlocks(...) after saving a result.
 */

export function calculateXpForAction(actionType, scoreMultiplier = 1) {
  const baseXP = {
    MOCK_EXAM: 100,
    READING_PRACTICE: 20,
    LISTENING_PRACTICE: 20,
    GRAMMAR_QUIZ: 20,
    ESSAY_WRITTEN: 50,
    SPEAKING_PRACTICE: 40,
    VOCAB_REVIEW_SESSION: 10,
    DAILY_LOGIN: 5,
    WORD_LAB_CHECK: 8,
    PREDICTOR_USED: 3,
  };
  return Math.round((baseXP[actionType] || 10) * scoreMultiplier);
}

export function levelFromXP(xp) {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/** Level titles shown on the home dashboard. */
export function titleForLevel(level = 1) {
  const titles = [
    '',
    'Newcomer',
    'Regular',
    'Studious',
    'Practitioner',
    'Candidate',
    'Contender',
    'Scholar',
    'Runner',
    'Closer',
  ];
  return titles[Math.min(Math.max(1, Number(level || 1)), titles.length - 1)] || `Level ${level}`;
}

/** XP required for the NEXT level (linear curve after level 7). */
export function xpToNextLevel(xp = 0) {
  const level = levelFromXP(xp);
  if (level >= 8) return Math.round(100 * level);
  const thresholds = [100, 300, 600, 1000, 1500, 2100, 2800];
  return thresholds[level - 1] || 3600;
}

/** Share of the current level that has been completed (0-100). */
export function levelProgressPct(xp = 0) {
  const level = levelFromXP(xp);
  const prevThreshold = level === 1 ? 0 : (level >= 8 ? Math.round(100 * (level - 1)) : [0, 100, 300, 600, 1000, 1500, 2100, 2800][level - 1]);
  const next = xpToNextLevel(xp);
  return next > prevThreshold ? Math.round(((xp - prevThreshold) / (next - prevThreshold)) * 100) : 0;
}

/** BUSEPT-specific badge definitions. */
export const BADGE_DEFS = [
  {
    id: 'first_mock',
    title: 'First Attempt',
    description: 'Completed your first mock exam.',
    icon: 'flag-outline',
    check: (ctx = {}) => Boolean(ctx.mockCount >= 1),
  },
  {
    id: 'mock_sixty',
    title: 'Sixty Club',
    description: 'Scored 60+ on a mock exam — the official pass mark.',
    icon: 'checkmark-circle-outline',
    check: (ctx = {}) => Boolean(ctx.mockMaxScore >= 60),
  },
  {
    id: 'mock_ninety',
    title: 'High Achiever',
    description: 'Scored 90+ on a mock exam.',
    icon: 'trophy-outline',
    check: (ctx = {}) => Boolean(ctx.mockMaxScore >= 90),
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Finished a quiz with 100% accuracy.',
    icon: 'star-outline',
    check: (ctx = {}) => Boolean(ctx.perfectQuiz === true),
  },
  {
    id: 'streak_3',
    title: 'Getting Warm',
    description: 'Kept a 3-day study streak.',
    icon: 'flame-outline',
    check: (ctx = {}) => Boolean(ctx.streakDays >= 3),
  },
  {
    id: 'streak_7',
    title: 'One Week Fire',
    description: 'Kept a 7-day study streak.',
    icon: 'flame',
    check: (ctx = {}) => Boolean(ctx.streakDays >= 7),
  },
  {
    id: 'streak_14',
    title: 'Fortnight',
    description: 'Kept a 14-day study streak.',
    icon: 'flash-outline',
    check: (ctx = {}) => Boolean(ctx.streakDays >= 14),
  },
  {
    id: 'word_lab',
    title: 'Active User',
    description: 'Graduated 5 sentences in the Word Lab.',
    icon: 'flask-outline',
    check: (ctx = {}) => Boolean(ctx.wordLabSentences >= 5),
  },
  {
    id: 'vocab_50',
    title: 'Word Collector',
    description: 'Saved 50 words to My Words.',
    icon: 'bookmark-outline',
    check: (ctx = {}) => Boolean(ctx.savedWords >= 50),
  },
  {
    id: 'all_sections',
    title: 'Full Runner',
    description: 'Practised Reading, Listening, Grammar, and Writing.',
    icon: 'globe-outline',
    check: (ctx = {}) => Boolean(ctx.readingDone && ctx.listeningDone && ctx.grammarDone && ctx.writingDone),
  },
];

/**
 * Evaluate badges against an activity context. Returns newly unlocked
 * badge ids (previously held badges must be passed in via heldIds).
 */
export function checkBadgeUnlocks(ctx = {}, heldIds = []) {
  const held = new Set(heldIds || []);
  return BADGE_DEFS.filter((badge) => !held.has(badge.id) && badge.check(ctx)).map((badge) => badge.id);
}

/**
 * Streak date math. lastActiveDate is an ISO date string of the last day
 * with recorded activity. Returns the new streak length after an activity
 * on today's date (timezone-naive, matches the learner's device day).
 */
export function computeStreak(lastActiveDate = null, now = new Date()) {
  const today = toDayString(now);
  if (!lastActiveDate) return { streak: 1, wasBroken: false };
  const lastDay = toDayString(new Date(lastActiveDate));
  if (lastDay === today) return { streak: lastActiveDate ? null : 1, wasBroken: false };
  const lastTs = new Date(lastDay).getTime();
  const diffDays = Math.round((new Date(today).getTime() - lastTs) / 86400000);
  if (diffDays === 1) return { streak: (Number(lastActiveDate) || 1) + 1, wasBroken: false };
  return { streak: 1, wasBroken: true };
}

function toDayString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default {
  calculateXpForAction,
  levelFromXP,
  titleForLevel,
  xpToNextLevel,
  levelProgressPct,
  BADGE_DEFS,
  checkBadgeUnlocks,
  computeStreak,
};
