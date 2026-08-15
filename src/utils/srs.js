/**
 * srs.js — Spaced Repetition (SM-2 inspired) for BUEPT vocabulary.
 *
 * Each word keeps a stage (repetition count), an ease factor, and a
 * next-review timestamp. Correct answers grow the interval multiplicatively
 * (stage+1) * ease; wrong answers reset to stage 0 with a shorter first
 * interval so the word reappears quickly.
 */
const DAY = 24 * 60 * 60 * 1000;

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const BASE_INTERVAL_DAYS = [0, 1, 3]; // stage 0, 1, 2 first appearances

export function scheduleNextReview(stage = 0, ease = DEFAULT_EASE) {
  const safeEase = Number.isFinite(ease) && ease >= MIN_EASE ? ease : DEFAULT_EASE;
  if (stage <= 2) {
    const days = BASE_INTERVAL_DAYS[Math.max(0, Math.min(stage, BASE_INTERVAL_DAYS.length - 1))];
    return Date.now() + days * DAY;
  }
  return Date.now() + Math.round(stage * safeEase) * DAY;
}

export function createReviewItem(word) {
  return {
    word,
    stage: 0,
    ease: DEFAULT_EASE,
    nextReviewAt: scheduleNextReview(0),
  };
}

/**
 * Advance a review item. Correct answers raise stage and ease; wrong
 * answers reset stage to 0 (re-learn) while preserving ease slightly.
 */
export function advanceReview(item, correct = true) {
  const ease = Number.isFinite(item.ease) ? item.ease : DEFAULT_EASE;
  if (correct) {
    const nextStage = item.stage + 1;
    const nextEase = Math.max(MIN_EASE, ease + 0.1);
    return {
      ...item,
      stage: nextStage,
      ease: nextEase,
      nextReviewAt: scheduleNextReview(nextStage, nextEase),
    };
  }
  const nextEase = Math.max(MIN_EASE, ease - 0.2);
  return {
    ...item,
    stage: 0,
    ease: nextEase,
    nextReviewAt: scheduleNextReview(0, nextEase),
  };
}

export function dueNow(item) {
  return item.nextReviewAt <= Date.now();
}

/** Words scheduled but still in the future, sorted by closest due date. */
export function upcomingReviews(items, limit = 5) {
  const now = Date.now();
  return items
    .filter((r) => r.nextReviewAt > now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
    .slice(0, limit);
}
