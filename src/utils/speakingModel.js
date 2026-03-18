function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function evaluateSpeakingModel({
  feedback = null,
  rubric = null,
  fluency = null,
  selfCheck = null,
  elapsedSec = 0,
} = {}) {
  const fluencyScore = clamp(
    Math.round(
      ((fluency?.wpm >= 90 && fluency?.wpm <= 145 ? 85 : 60) * 0.45) +
      (clamp(100 - ((fluency?.fillerCount || 0) * 12), 30, 100) * 0.35) +
      (clamp((fluency?.sentenceCount || 0) * 12, 25, 100) * 0.2)
    ),
    0,
    100
  );

  const coherenceScore = clamp(
    Math.round(
      (clamp((feedback?.connectorCount || 0) * 20, 20, 100) * 0.5) +
      (clamp((feedback?.vocabMatches || 0) * 25, 20, 100) * 0.25) +
      (clamp((selfCheck?.thesis ? 1 : 0) + (selfCheck?.example ? 1 : 0) + (selfCheck?.connector ? 1 : 0) + (selfCheck?.conclusion ? 1 : 0), 0, 4) * 25 * 0.25)
    ),
    0,
    100
  );

  const rubricScore = rubric ? Math.round((Number(rubric.total || 0) / Math.max(1, Number(rubric.max || 20))) * 100) : 55;
  const lexicalScore = clamp(
    Math.round(
      (clamp((feedback?.academicCount || 0) * 20, 20, 100) * 0.6) +
      (clamp((feedback?.vocabMatches || 0) * 20, 20, 100) * 0.4)
    ),
    0,
    100
  );
  const staminaScore = clamp(Math.round((Math.min(Number(elapsedSec || 0), 180) / 180) * 100), 20, 100);

  const dimensions = {
    fluency: fluencyScore,
    coherence: coherenceScore,
    lexicalRange: lexicalScore,
    rubricAlignment: rubricScore,
    speakingStamina: staminaScore,
  };

  const overall = clamp(Math.round(
    (dimensions.fluency * 0.25) +
    (dimensions.coherence * 0.25) +
    (dimensions.lexicalRange * 0.2) +
    (dimensions.rubricAlignment * 0.2) +
    (dimensions.speakingStamina * 0.1)
  ), 0, 100);

  const band = overall >= 85 ? 'Strong B2' : overall >= 70 ? 'Developing B2' : overall >= 55 ? 'Strong B1' : 'Developing B1';
  const weaknesses = [];
  if (dimensions.fluency < 65) weaknesses.push('Fluency pace and filler control');
  if (dimensions.coherence < 65) weaknesses.push('Coherence and structure');
  if (dimensions.lexicalRange < 65) weaknesses.push('Lexical range');
  if (dimensions.rubricAlignment < 65) weaknesses.push('Rubric alignment');
  if (dimensions.speakingStamina < 60) weaknesses.push('Speaking stamina');

  const actions = [];
  if (dimensions.fluency < 65) actions.push('Do 60-second shadowing with connector phrases before answering.');
  if (dimensions.coherence < 65) actions.push('Use 4-part structure: thesis, example, contrast, conclusion.');
  if (dimensions.lexicalRange < 65) actions.push('Replace 3 basic words with academic alternatives in each response.');
  if (dimensions.rubricAlignment < 65) actions.push('After response, check task coverage and add one missing idea.');
  if (dimensions.speakingStamina < 60) actions.push('Target at least 90 seconds per answer with stable pace.');
  if (!actions.length) actions.push('Move to harder prompts and maintain consistent structure.');

  return { overall, band, dimensions, weaknesses, actions };
}

export function buildSpeakingSnapshot({ accuracy = 0, weeklyPct = 0, attempts = 0 } = {}) {
  const safeAcc = clamp(Number(accuracy || 0), 0, 100);
  const safeWeekly = clamp(Number(weeklyPct || 0), 0, 100);
  const attemptScore = clamp(Number(attempts || 0) * 12, 0, 100);
  const overall = clamp(Math.round((safeAcc * 0.6) + (safeWeekly * 0.25) + (attemptScore * 0.15)), 0, 100);
  const band = overall >= 80 ? 'Strong B2' : overall >= 65 ? 'Developing B2' : overall >= 50 ? 'Strong B1' : 'Developing B1';
  return { overall, band };
}
