export function buildMockAdvice(result) {
  if (!result) return [];
  const advice = [];
  if (result.writing < 60) advice.push('Focus on writing accuracy and organization (YS9 feedback).');
  if (result.reading < 60) advice.push('Practice inference and paragraph function questions.');
  if (result.listening < 60) advice.push('Train careful listening and note-taking.');
  if (!advice.length) advice.push('Maintain balance across all sections and do full mocks weekly.');
  return advice;
}
