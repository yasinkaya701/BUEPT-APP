/**
 * buseptScorePredictor.js — Official-format BUSEPT score projection.
 *
 * Based on the YADYOK official scoring structure (see docs/buept_research.md):
 * - Listening contributes 25% of the total (Selective + Careful)
 * - Reading contributes 25% of the total (Reading I + Reading II)
 * - Writing contributes 40% of the total (2 essays, each 20%)
 * - Pass mark: 60/100, letter grade S (satisfactory, 60-100) / F
 * - Partial pass (parçalı geçme): section scores are tracked separately,
 *   valid for one year so the student can retake only the failed sections.
 *
 * Inputs are estimated correct counts and self-assessed bands; outputs are
 * section scores, total projection, letter verdict, and per-section gaps
 * that guide what the learner should rehearse before exam day.
 */

export const BUSEPT_WEIGHTS = {
  listening: 25,
  reading: 25,
  writing: 40,
};

export const BUSEPT_SECTION_TOTALS = {
  listening: 25,
  reading: 25,
  writing: 40,
};

export const PASS_MARK = 60;
export const SECTION_PASS_MARK = 50;

/**
 * Listening: estimate correct answers out of 25 possible items.
 * Selective (~10) + Careful (~15) items are weighted evenly here for
 * projection simplicity; a 200-point scaled listening is collapsed to 25.
 */
export function projectListeningScore(correctCount = 0, totalItems = 25) {
  const ratio = Math.max(0, Math.min(1, Number(correctCount || 0) / Math.max(1, Number(totalItems || 25))));
  return Math.round(ratio * BUSEPT_SECTION_TOTALS.listening);
}

/** Reading: correct answers out of 25 possible items (Reading I ~13 + Reading II ~12). */
export function projectReadingScore(correctCount = 0, totalItems = 25) {
  const ratio = Math.max(0, Math.min(1, Number(correctCount || 0) / Math.max(1, Number(totalItems || 25))));
  return Math.round(ratio * BUSEPT_SECTION_TOTALS.reading);
}

/**
 * Writing: self-assessed band 1-9 mapped to the 40-point section score.
 * Band mapping mirrors the speakingModel/speakingCoach band logic used
 * elsewhere in the app (band 5 ≈ average S-grade writing).
 */
export function projectWritingScore(band = 5) {
  const clamped = Math.max(1, Math.min(9, Number(band || 5)));
  return Math.round((clamped / 9) * BUSEPT_SECTION_TOTALS.writing * 100) / 100;
}

/**
 * Combine the three section projections into a total /100 score.
 * Returns the rounded integer total with per-section detail.
 */
export function projectBuseptScore({ listeningCorrect = 0, listeningTotal = 25, readingCorrect = 0, readingTotal = 25, writingBand = 5 } = {}) {
  const listening = projectListeningScore(listeningCorrect, listeningTotal);
  const reading = projectReadingScore(readingCorrect, readingTotal);
  const writing = Math.round(projectWritingScore(writingBand));
  const total = listening + reading + writing;
  return {
    listening,
    reading,
    writing,
    total,
    letter: total >= PASS_MARK ? 'S' : 'F',
    pass: total >= PASS_MARK,
    gaps: {
      listening: Math.max(0, SECTION_PASS_MARK - listening),
      reading: Math.max(0, SECTION_PASS_MARK - reading),
      writing: Math.max(0, SECTION_PASS_MARK - writing),
    },
    advice: total < PASS_MARK
      ? buildAdvice({ listening, reading, writing })
      : 'You are on track for an S grade. Keep rehearsing the weakest section to protect your margin.',
  };
}

function buildAdvice({ listening, reading, writing }) {
  const sorted = [
    { key: 'listening', score: listening },
    { key: 'reading', score: reading },
    { key: 'writing', score: writing },
  ].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const labels = { listening: 'Listening', reading: 'Reading', writing: 'Writing' };
  const tips = {
    listening: 'Prioritize Selective Listening drills (question words first) and note-taking practice for Careful Listening.',
    reading: 'Work on skimming speed for Reading I and paragraph matching accuracy for Reading II.',
    writing: 'Write two timed 250-word essays per week and recycle academic connectors from your essay bank.',
  };
  return `Your projected total is below the 60 mark. ${labels[weakest.key]} is the weakest section (${weakest.score}/40 or /25). ${tips[weakest.key]}`;
}

/**
 * Grade label for a total score: A/B/C/D/F style bands used on official
 * result documents, where C (60-69) is the pass threshold.
 */
export function gradeLabelForScore(total = 0) {
  const t = Number(total || 0);
  if (t >= 90) return 'A';
  if (t >= 80) return 'B';
  if (t >= 70) return 'C+';
  if (t >= 60) return 'C (Pass)';
  return 'F (Fail)';
}

export default {
  BUSEPT_WEIGHTS,
  PASS_MARK,
  SECTION_PASS_MARK,
  projectListeningScore,
  projectReadingScore,
  projectWritingScore,
  projectBuseptScore,
  gradeLabelForScore,
};
