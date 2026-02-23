const DAY = 24 * 60 * 60 * 1000;

export function scheduleNextReview(stage = 0) {
  const intervals = [0, 1, 3, 7, 14, 30];
  const days = intervals[Math.min(stage, intervals.length - 1)];
  return Date.now() + days * DAY;
}

export function createReviewItem(word) {
  return {
    word,
    stage: 0,
    nextReviewAt: scheduleNextReview(0)
  };
}

export function advanceReview(item, correct = true) {
  const nextStage = correct ? item.stage + 1 : 0;
  return {
    ...item,
    stage: nextStage,
    nextReviewAt: scheduleNextReview(nextStage)
  };
}

export function dueNow(item) {
  return item.nextReviewAt <= Date.now();
}
