function safeText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.trim() || fallback;
}

function firstSentence(text) {
  const clean = safeText(text, '');
  if (!clean) return '';
  const parts = clean.match(/[^.!?]+[.!?]?/g) || [];
  return safeText(parts[0], clean);
}

function safeOption(question) {
  if (!question || !Array.isArray(question.options)) return '';
  const idx = Number.isInteger(question.answer) ? question.answer : -1;
  return idx >= 0 && idx < question.options.length ? safeText(question.options[idx], '') : '';
}

export function buildReadingOpenEndedPrompts(task) {
  const title = safeText(task?.title, 'the passage');
  const text = safeText(task?.text, '');
  const q0 = task?.questions?.[0];
  const q1 = task?.questions?.[1];
  const q0Answer = safeOption(q0);
  const starter = firstSentence(text);

  return [
    `Summarize the main idea of "${title}" in 3-4 sentences.`,
    q0
      ? `Answer this in your own words: ${safeText(q0.q, 'What is the main point?')}`
      : 'Which part of the passage is most important, and why?',
    q1
      ? `Use one direct detail from the passage to support this claim: ${safeText(q1.q, 'the key idea')}.`
      : 'Give one detail from the passage and explain how it supports the main idea.',
    q0Answer
      ? `Why is "${q0Answer}" the best answer? Explain briefly with textual evidence.`
      : `What can we infer from this opening line: "${starter || 'the introduction'}"?`,
  ];
}

export function buildListeningOpenEndedPrompts(task) {
  const title = safeText(task?.title, 'the audio');
  const transcript = safeText(task?.transcript, '');
  const q0 = task?.questions?.[0];
  const q1 = task?.questions?.[1];
  const opening = firstSentence(transcript);

  return [
    `Summarize the speaker's main message in "${title}" using 3-4 sentences.`,
    q0
      ? `Respond in detail: ${safeText(q0.q, 'What does the speaker emphasize?')}`
      : 'What is the speaker trying to convince the listener of?',
    q1
      ? `Which clue in the transcript helps answer this question: ${safeText(q1.q, 'the second question')}?`
      : 'Which sentence in the transcript gives the strongest clue for understanding the topic?',
    `Rewrite this sentence in simpler English without changing meaning: "${opening || 'the opening sentence'}".`,
  ];
}

export function buildGrammarOpenEndedPrompts(task) {
  const title = safeText(task?.title, 'this grammar topic');
  const rule = firstSentence(task?.explain || '');
  const q0 = task?.questions?.[0];
  const answer = safeOption(q0);

  return [
    `Explain the core rule of "${title}" in your own words.`,
    `Write 2 original sentences that correctly use this grammar structure.`,
    answer
      ? `Why is "${answer}" correct in Question 1? Mention the rule explicitly.`
      : `Identify one common mistake in this topic and explain how to avoid it.`,
    rule
      ? `Turn this grammar note into a learner-friendly tip: "${rule}".`
      : 'Create a short checklist to avoid mistakes in this grammar topic.',
  ];
}

export function buildExamSectionOpenEndedPrompts(section, sectionKey) {
  const questions = section?.questions || [];
  const firstQ = questions[0];
  const secondQ = questions[1];
  const label = sectionKey === 'grammar' ? 'grammar section' : `${sectionKey} section`;

  return [
    `Write a short strategy (3 steps) for handling the ${label} effectively.`,
    firstQ
      ? `Explain how you would solve this question without options: ${safeText(firstQ.q, 'Question 1')}`
      : `What is your approach to answer the first question in the ${label}?`,
    secondQ
      ? `After checking your answer, what evidence would you cite for: ${safeText(secondQ.q, 'Question 2')}?`
      : `Describe how you verify your answers in the ${label}.`,
  ];
}

export function buildSpeakingOpenEndedPrompts(item) {
  const title = safeText(item?.title, 'the speaking topic');
  const prompt = safeText(item?.prompt, 'Share your opinion with reasons and examples.');
  const followUp = Array.isArray(item?.follow_up) ? item.follow_up.filter(Boolean) : [];
  const vocab = Array.isArray(item?.vocab) ? item.vocab.slice(0, 3) : [];

  return [
    `Give a 60-90 second response to "${title}" and include a clear position.`,
    `Main prompt: ${prompt}`,
    followUp[0]
      ? `Follow-up: ${safeText(followUp[0], 'What is one real-life example?')}`
      : 'Add one concrete real-life example to support your answer.',
    vocab.length
      ? `Use these words naturally in your answer: ${vocab.join(', ')}.`
      : 'Use at least two academic connectors (for example, however, therefore).',
  ];
}

export function buildWritingOpenEndedPrompts(promptItem, type = 'general', level = 'B1') {
  const prompt = safeText(promptItem?.prompt, 'Write an academic response.');
  const writingType = safeText(type, 'general');
  const taskType = safeText(promptItem?.task, 'essay');
  const estimated = safeText(String(promptItem?.estMin || ''), '30');

  return [
    `Write a ${taskType} in ${writingType} style for level ${level}.`,
    `Task prompt: ${prompt}`,
    'State your thesis clearly in the first part and support it with at least 2 reasons.',
    `Revise your draft after ${estimated} minutes: improve connectors, examples, and conclusion.`,
  ];
}
