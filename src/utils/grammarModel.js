function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function buildGrammarSnapshot({ accuracy = 0, clozePct = 0, mcqPct = 0, weeklyPct = 0, streak = 0 } = {}) {
  const safeAcc = clamp(Number(accuracy || 0), 0, 100);
  const safeCloze = clamp(Number(clozePct ?? safeAcc), 0, 100);
  const safeMcq = clamp(Number(mcqPct ?? safeAcc), 0, 100);
  const safeWeekly = clamp(Number(weeklyPct || 0), 0, 100);
  const streakScore = clamp(Number(streak || 0) * 12, 0, 100);
  const overall = clamp(Math.round(
    (safeAcc * 0.5) +
    (Math.min(safeCloze, safeMcq) * 0.2) +
    (safeWeekly * 0.2) +
    (streakScore * 0.1)
  ), 0, 100);
  const band = overall >= 82 ? 'Strong B2' : overall >= 68 ? 'Developing B2' : overall >= 52 ? 'Strong B1' : 'Developing B1';
  return { overall, band };
}

export function evaluateGrammarModel({
  task = null,
  answers = {},
  confidence = {},
  grammarFeedback = null,
} = {}) {
  const questions = Array.isArray(task?.questions) ? task.questions : [];
  if (!questions.length) {
    return {
      overall: 0,
      band: 'Developing B1',
      dimensions: {
        accuracy: 0,
        clozeControl: 0,
        mcqControl: 0,
        confidenceCalibration: 0,
      },
      weaknesses: ['Core accuracy'],
      actions: ['Solve one full grammar task and re-check errors.'],
    };
  }

  let totalCorrect = 0;
  let clozeCorrect = 0;
  let clozeTotal = 0;
  let mcqCorrect = 0;
  let mcqTotal = 0;
  let confidentTotal = 0;
  let confidentCorrect = 0;

  questions.forEach((q, idx) => {
    const isCorrect = answers[idx] === q.answer;
    if (isCorrect) totalCorrect += 1;
    const isCloze = q.type === 'cloze';
    if (isCloze) {
      clozeTotal += 1;
      if (isCorrect) clozeCorrect += 1;
    } else {
      mcqTotal += 1;
      if (isCorrect) mcqCorrect += 1;
    }
    if (confidence[idx] === 'confident') {
      confidentTotal += 1;
      if (isCorrect) confidentCorrect += 1;
    }
  });

  const accuracy = Math.round((totalCorrect / questions.length) * 100);
  const clozeControl = clozeTotal ? Math.round((clozeCorrect / clozeTotal) * 100) : accuracy;
  const mcqControl = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : accuracy;
  const confidenceCalibration = confidentTotal ? Math.round((confidentCorrect / confidentTotal) * 100) : 55;

  const dimensions = {
    accuracy,
    clozeControl,
    mcqControl,
    confidenceCalibration,
  };

  const overall = clamp(Math.round(
    (dimensions.accuracy * 0.55) +
    (Math.min(dimensions.clozeControl, dimensions.mcqControl) * 0.25) +
    (dimensions.confidenceCalibration * 0.2)
  ), 0, 100);

  const band = overall >= 85 ? 'Strong B2' : overall >= 70 ? 'Developing B2' : overall >= 55 ? 'Strong B1' : 'Developing B1';

  const weaknesses = [];
  if (dimensions.accuracy < 65) weaknesses.push('Core grammar accuracy');
  if (dimensions.clozeControl < 65) weaknesses.push('Cloze grammar control');
  if (dimensions.mcqControl < 65) weaknesses.push('MCQ elimination logic');
  if (dimensions.confidenceCalibration < 60) weaknesses.push('Confidence calibration');

  const actions = [];
  if (dimensions.accuracy < 65) actions.push('Review key rule notes for this topic, then redo missed questions only.');
  if (dimensions.clozeControl < 65) actions.push('In cloze questions, first decide part of speech and tense before choosing.');
  if (dimensions.mcqControl < 65) actions.push('Eliminate two options by grammar clue words before final selection.');
  if (dimensions.confidenceCalibration < 60) actions.push('Mark confidence honestly and analyze overconfident mistakes after checking.');
  if (grammarFeedback?.missed?.length > 0) actions.push('Generate similar questions for at least 2 missed items and solve immediately.');
  if (!actions.length) actions.push('Move to mixed exam mode and maintain current performance.');

  return { overall, band, dimensions, weaknesses, actions };
}
