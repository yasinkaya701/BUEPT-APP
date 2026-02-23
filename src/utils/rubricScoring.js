import { detectBasicErrors } from './basicErrorDetect';

const CONNECTORS = [
  'however', 'therefore', 'moreover', 'furthermore', 'for example',
  'for instance', 'in addition', 'on the other hand', 'in conclusion', 'as a result',
  'although', 'while', 'whereas', 'consequently', 'overall',
];

const ACADEMIC_WORDS = [
  'significant', 'analysis', 'evaluate', 'evidence', 'perspective', 'coherent',
  'argument', 'approach', 'implication', 'context', 'framework', 'critical',
  'demonstrate', 'indicate', 'therefore', 'consequently', 'notion', 'relevant',
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function countWords(text) {
  const words = (text || '').toLowerCase().match(/\b[a-z']+\b/g) || [];
  return words.length;
}

function splitSentences(text) {
  return (text || '').split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
}

function uniqueWordRatio(text) {
  const words = (text || '').toLowerCase().match(/\b[a-z']+\b/g) || [];
  if (!words.length) return 0;
  const set = new Set(words);
  return set.size / words.length;
}

function connectorCount(text) {
  const lower = (text || '').toLowerCase();
  return CONNECTORS.reduce((sum, token) => (lower.includes(token) ? sum + 1 : sum), 0);
}

function academicCount(text) {
  const lower = (text || '').toLowerCase();
  return ACADEMIC_WORDS.reduce((sum, token) => (lower.includes(token) ? sum + 1 : sum), 0);
}

function promptCoverage(text, prompt = '') {
  const source = (prompt || '').toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const keywords = Array.from(new Set(source)).slice(0, 8);
  if (!keywords.length) return { ratio: 0, matches: 0, total: 0 };
  const lower = (text || '').toLowerCase();
  const matches = keywords.filter((k) => lower.includes(k)).length;
  return { ratio: matches / keywords.length, matches, total: keywords.length };
}

function bandFrom20(total) {
  if (total >= 17) return 'C1';
  if (total >= 14) return 'B2+';
  if (total >= 11) return 'B2';
  if (total >= 8) return 'B1+';
  return 'B1-';
}

export function scoreWritingRubric({ text = '', prompt = '', targetWords = 180 } = {}) {
  const wc = countWords(text);
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;
  const avgSentence = sentenceCount ? wc / sentenceCount : 0;
  const errors = detectBasicErrors(text).length;
  const connectors = connectorCount(text);
  const academics = academicCount(text);
  const ttr = uniqueWordRatio(text);
  const coverage = promptCoverage(text, prompt);
  const paragraphs = (text || '').split(/\n+/).map((p) => p.trim()).filter(Boolean).length;

  const grammar = clamp(4 - Math.floor(errors / 2), 1, 4);
  const vocabulary = clamp(
    (ttr >= 0.56 ? 2 : ttr >= 0.46 ? 1 : 0) + (academics >= 3 ? 2 : academics >= 1 ? 1 : 0),
    1,
    4
  );
  const organization = clamp(
    (connectors >= 4 ? 2 : connectors >= 2 ? 1 : 0) + (paragraphs >= 3 ? 2 : paragraphs >= 2 ? 1 : 0),
    1,
    4
  );
  const content = clamp(
    (wc >= targetWords ? 2 : wc >= targetWords * 0.75 ? 1 : 0) +
    (coverage.ratio >= 0.5 ? 2 : coverage.ratio >= 0.25 ? 1 : 0),
    1,
    4
  );
  const mechanics = clamp(
    ((text || '').includes(',') ? 1 : 0) +
    ((text || '').includes('.') ? 1 : 0) +
    (avgSentence >= 10 ? 1 : 0) +
    (errors === 0 ? 1 : 0),
    1,
    4
  );

  const total = grammar + vocabulary + organization + content + mechanics;

  const strengths = [];
  if (wc >= targetWords) strengths.push('Word target reached');
  if (connectors >= 3) strengths.push('Good use of linking language');
  if (ttr >= 0.5) strengths.push('Healthy vocabulary variety');
  if (coverage.ratio >= 0.4) strengths.push('Good task focus and prompt relevance');

  const improvements = [];
  if (wc < targetWords) improvements.push(`Increase length toward ${targetWords} words`);
  if (connectors < 2) improvements.push('Add clearer transitions between ideas');
  if (paragraphs < 2) improvements.push('Split into clear paragraph structure');
  if (errors > 2) improvements.push('Reduce grammar/mechanics errors before submission');
  if (coverage.ratio < 0.25) improvements.push('Address prompt keywords more directly');

  return {
    total,
    max: 20,
    band: bandFrom20(total),
    metrics: { wordCount: wc, sentenceCount, connectors, academics, ttr, errors },
    categories: [
      { name: 'Grammar', score: grammar, max: 4 },
      { name: 'Vocabulary', score: vocabulary, max: 4 },
      { name: 'Organization', score: organization, max: 4 },
      { name: 'Content', score: content, max: 4 },
      { name: 'Mechanics', score: mechanics, max: 4 },
    ],
    strengths,
    improvements,
  };
}

export function scoreSpeakingRubric({ text = '', prompt = '', targetWords = 110 } = {}) {
  const wc = countWords(text);
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;
  const avgSentence = sentenceCount ? wc / sentenceCount : 0;
  const connectors = connectorCount(text);
  const academics = academicCount(text);
  const ttr = uniqueWordRatio(text);
  const errors = detectBasicErrors(text).length;
  const coverage = promptCoverage(text, prompt);

  const fluency = clamp((wc >= targetWords ? 2 : wc >= targetWords * 0.7 ? 1 : 0) + (avgSentence >= 8 ? 2 : 1), 1, 4);
  const coherence = clamp((connectors >= 3 ? 2 : connectors >= 1 ? 1 : 0) + (sentenceCount >= 4 ? 2 : sentenceCount >= 2 ? 1 : 0), 1, 4);
  const lexical = clamp((academics >= 2 ? 2 : academics >= 1 ? 1 : 0) + (ttr >= 0.5 ? 2 : ttr >= 0.42 ? 1 : 0), 1, 4);
  const grammar = clamp(4 - Math.floor(errors / 2), 1, 4);
  const taskResponse = clamp((coverage.ratio >= 0.45 ? 2 : coverage.ratio >= 0.2 ? 1 : 0) + (wc >= targetWords * 0.85 ? 2 : 1), 1, 4);

  const total = fluency + coherence + lexical + grammar + taskResponse;

  const strengths = [];
  if (wc >= targetWords) strengths.push('Response length is exam-safe');
  if (connectors >= 2) strengths.push('Speech has clear linking language');
  if (academics >= 1) strengths.push('Uses academic vocabulary');

  const improvements = [];
  if (wc < targetWords) improvements.push(`Extend response to around ${targetWords}+ words`);
  if (connectors < 2) improvements.push('Use more discourse markers (however, therefore, for example)');
  if (errors > 2) improvements.push('Simplify sentence forms to reduce grammar mistakes');
  if (coverage.ratio < 0.25) improvements.push('Answer the prompt more directly with evidence/examples');

  return {
    total,
    max: 20,
    band: bandFrom20(total),
    metrics: { wordCount: wc, sentenceCount, connectors, academics, ttr, errors },
    categories: [
      { name: 'Fluency', score: fluency, max: 4 },
      { name: 'Coherence', score: coherence, max: 4 },
      { name: 'Lexical Resource', score: lexical, max: 4 },
      { name: 'Grammar', score: grammar, max: 4 },
      { name: 'Task Response', score: taskResponse, max: 4 },
    ],
    strengths,
    improvements,
  };
}
