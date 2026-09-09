export function normalizeAnswer(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[.!?,;:]+$/g, '')
    .replace(/\s+/g, ' ');
}

export function acceptedAnswersForQuestion(question = {}) {
  if (Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length) {
    return question.acceptedAnswers;
  }
  if (Array.isArray(question.answer)) return question.answer;
  if (question.answer !== undefined && question.answer !== null) return [question.answer];
  return [];
}

export function gradeQuestion(question = {}, selected) {
  const accepted = acceptedAnswersForQuestion(question);
  const unanswered = selected === undefined || selected === null || normalizeAnswer(selected) === '';
  if (unanswered || accepted.length === 0) {
    return { correct: false, unanswered, acceptedAnswers: accepted };
  }

  const isIndexedMcq =
    Array.isArray(question.options) &&
    question.options.length > 0 &&
    accepted.every((answer) => Number.isFinite(answer));

  if (isIndexedMcq) {
    const selectedIndex = typeof selected === 'number' ? selected : Number(selected);
    return {
      correct: Number.isFinite(selectedIndex) && accepted.some((answer) => Number(answer) === selectedIndex),
      unanswered: false,
      acceptedAnswers: accepted,
    };
  }

  const normalizedSelected = normalizeAnswer(selected);
  return {
    correct: accepted.some((answer) => normalizeAnswer(answer) === normalizedSelected),
    unanswered: false,
    acceptedAnswers: accepted,
  };
}

export function gradeExam(questionEntries = [], answers = {}, replacements = {}) {
  let correct = 0;
  const results = {};

  (Array.isArray(questionEntries) ? questionEntries : []).forEach((entry) => {
    const key = entry?.key;
    if (!key) return;
    const question = replacements?.[key] || entry?.q || entry?.question || {};
    const result = gradeQuestion(question, answers?.[key]);
    results[key] = result;
    if (result.correct) correct += 1;
  });

  const total = Object.keys(results).length;
  return {
    correct,
    total,
    percent: total ? Math.round((correct / total) * 100) : 0,
    results,
  };
}

export function displayCorrectAnswer(question = {}) {
  const accepted = acceptedAnswersForQuestion(question);
  if (!accepted.length) return '';
  const first = accepted[0];
  if (Array.isArray(question.options) && Number.isFinite(first)) {
    return question.options[first] ?? String(first);
  }
  return String(first);
}
