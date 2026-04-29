/**
 * BUEPT AI Grader (Binary Version)
 * Evaluates open-ended listening responses as Correct or Incorrect.
 */

export const gradeResponse = async (userResponse, idealAnswer, keywords = []) => {
  if (!userResponse || userResponse.length < 5) {
    return { isCorrect: false, feedback: "Response too short.", hits: [] };
  }

  const responseLower = userResponse.toLowerCase();
  const hits = keywords.filter(word => responseLower.includes(word.toLowerCase()));
  
  // Success condition: Must mention at least 60% of the key academic terms
  const isCorrect = (hits.length / keywords.length) >= 0.6;

  let feedback = isCorrect 
    ? "Correct. You've captured the essential academic points." 
    : "Incorrect. You missed some critical details. Try to mention: " + keywords.filter(k => !hits.includes(k)).slice(0, 2).join(', ');

  return {
    isCorrect,
    feedback,
    hits,
    missing: keywords.filter(k => !hits.includes(k))
  };
};
