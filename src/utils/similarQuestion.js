function rotateIndices(length, shift) {
  const out = [];
  for (let i = 0; i < length; i += 1) {
    out.push((i + shift) % length);
  }
  return out;
}

export function buildSimilarQuestion(question, seed = 1) {
  const options = Array.isArray(question?.options) ? question.options : [];
  const answer = Number.isInteger(question?.answer) ? question.answer : 0;
  if (!options.length) {
    return {
      q: `Similar practice: ${question?.q || 'Question'}`,
      options: [],
      answer: 0,
      explain: question?.explain || 'Review the key evidence and choose the best-supported option.'
    };
  }

  const shift = Math.abs(seed) % options.length;
  const map = rotateIndices(options.length, shift);
  const shuffledOptions = map.map((idx) => options[idx]);
  const newAnswer = map.findIndex((idx) => idx === answer);

  return {
    q: `Similar practice: ${question?.q || 'Question'}`,
    options: shuffledOptions,
    answer: newAnswer < 0 ? 0 : newAnswer,
    explain: question?.explain || 'Select the choice directly supported by the text/transcript.'
  };
}
