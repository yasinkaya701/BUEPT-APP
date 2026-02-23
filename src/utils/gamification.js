export function calculateXpForAction(actionType, scoreMultiplier = 1) {
  const baseXP = {
    MOCK_EXAM: 100,
    READING_PRACTICE: 20,
    LISTENING_PRACTICE: 20,
    GRAMMAR_QUIZ: 20,
    ESSAY_WRITTEN: 50,
    SPEAKING_PRACTICE: 40,
    VOCAB_REVIEW_SESSION: 10,
    DAILY_LOGIN: 5
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
