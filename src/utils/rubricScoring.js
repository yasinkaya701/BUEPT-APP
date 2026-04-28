import { detectBasicErrors } from './basicErrorDetect';
import bueptMarkingScheme from '../../data/buept_writing_marking_scheme.json';

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

const WRITING_AREA_ACTIONS = {
  Grammar: {
    action: 'Fix basic grammar errors first (subject-verb agreement, articles, tense consistency).',
    drill: 'Rewrite your first body paragraph and remove at least 3 detected errors.',
  },
  Vocabulary: {
    action: 'Replace repeated/basic words with more precise academic alternatives.',
    drill: 'Upgrade at least 5 repeated words using synonym suggestions before final submission.',
  },
  Organization: {
    action: 'Improve paragraph flow with clear topic sentences and linking transitions.',
    drill: 'Add one connector at the start of each body paragraph.',
  },
  Content: {
    action: 'Develop ideas with clearer examples and direct prompt coverage.',
    drill: 'Add one concrete example that directly answers the prompt.',
  },
  Mechanics: {
    action: 'Polish punctuation and sentence boundaries for cleaner readability.',
    drill: 'Run a final punctuation pass sentence by sentence.',
  },
};

const SPEAKING_AREA_ACTIONS = {
  Fluency: {
    action: 'Extend your answer with complete thought units instead of short fragments.',
    drill: 'Record one 45-second response without long pauses.',
  },
  Coherence: {
    action: 'Use a visible structure: opinion -> reason -> example -> conclusion.',
    drill: 'Use at least 3 connectors: however, for example, therefore.',
  },
  'Lexical Resource': {
    action: 'Increase lexical range with topic-specific academic vocabulary.',
    drill: 'Replace 3 generic words with academic alternatives.',
  },
  Grammar: {
    action: 'Use safer sentence patterns when accuracy drops.',
    drill: 'Transform 3 short sentences into one correct complex sentence.',
  },
  'Task Response': {
    action: 'Address the exact prompt directly and support it with evidence.',
    drill: 'State your main claim in the first sentence and add one concrete example.',
  },
};

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

function repetitionPressure(text) {
  const words = (text || '').toLowerCase().match(/\b[a-z']+\b/g) || [];
  const counts = {};
  words.forEach((word) => {
    if (word.length < 4) return;
    counts[word] = (counts[word] || 0) + 1;
  });
  return Object.values(counts).filter((count) => count >= 3).length;
}

function repeatedSentenceStemCount(sentences = []) {
  const counts = {};
  sentences.forEach((sentence) => {
    const words = String(sentence || '').toLowerCase().match(/\b[a-z']+\b/g) || [];
    const stem = words.slice(0, 3).join(' ');
    if (stem.split(' ').length < 2) return;
    counts[stem] = (counts[stem] || 0) + 1;
  });
  return Object.values(counts).filter((count) => count >= 2).length;
}

function specificSupportCount(text = '') {
  const source = String(text || '');
  let count = 0;
  count += (source.match(/\bfor example\b|\bfor instance\b|\bsuch as\b/gi) || []).length;
  count += (source.match(/\b\d{2,4}\b/g) || []).length;
  count += (source.match(/\baccording to\b|\bresearch\b|\bstudy\b|\bdata\b|\bevidence\b/gi) || []).length;
  count += (source.match(/\bchina\b|\bturkey\b|\beurope\b|\buniversity\b|\bstudents\b/gi) || []).length;
  return count;
}

function mechanicsIssueCount(text = '') {
  const source = String(text || '');
  let count = 0;
  count += (source.match(/\s+[,.!?;:]/g) || []).length;
  count += (source.match(/[,.!?;:](?=[A-Za-z])/g) || []).length;
  count += (source.match(/\n{3,}/g) || []).length;
  return count;
}

function hasThesisSignal(text = '') {
  return /\b(i believe|in this essay|this essay argues|i argue that|the main point is)\b/i.test(text);
}

function hasConclusionSignal(text = '') {
  return /\b(in conclusion|to conclude|to sum up|overall|to summarize)\b/i.test(text);
}

function hasExampleSignal(text = '') {
  return /\b(for example|for instance|such as)\b/i.test(text);
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
  if (total >= 18) return 'C1';
  if (total >= 15) return 'B2+';
  if (total >= 12) return 'B2';
  if (total >= 9) return 'B1';
  return 'A2-B1';
}

function getSchemeBand(code = '') {
  const safeCode = String(code || '').toUpperCase();
  const bands = Array.isArray(bueptMarkingScheme?.bands) ? bueptMarkingScheme.bands : [];
  return bands.find((item) => String(item?.code || '').toUpperCase() === safeCode) || null;
}

function resolveWascWritingBand({ total = 0, wordCount = 0, text = '' } = {}) {
  const wc = Number(wordCount || 0);
  const cleanText = String(text || '').trim();
  if (!cleanText) {
    const wn = getSchemeBand('WN');
    return {
      code: 'WN',
      label: wn?.label || 'Wrote Nothing',
      pass: wn?.pass ?? false,
      descriptor: wn?.descriptor || 'No meaningful written response.',
      source: bueptMarkingScheme?.source_name || 'WASC',
    };
  }
  if (wc < 25) {
    const ins = getSchemeBand('INS');
    return {
      code: 'INS',
      label: ins?.label || 'Insufficient',
      pass: ins?.pass ?? false,
      descriptor: ins?.descriptor || 'Text is too short to evaluate reliably.',
      source: bueptMarkingScheme?.source_name || 'WASC',
    };
  }
  const numeric = Number(total || 0);
  let code = 'FBA';
  if (numeric >= 19) code = 'E';
  else if (numeric >= 17) code = 'VG';
  else if (numeric >= 15) code = 'MA';
  else if (numeric >= 13) code = 'A';
  else if (numeric >= 11) code = 'D';
  else if (numeric >= 8) code = 'NA';
  const band = getSchemeBand(code);
  return {
    code,
    label: band?.label || code,
    pass: band?.pass ?? false,
    descriptor: band?.descriptor || '',
    source: bueptMarkingScheme?.source_name || 'WASC',
  };
}

function buildPriorityPlan(categories = [], actionMap = {}) {
  return categories
    .map((category) => {
      const max = Number(category.max || 0);
      const score = Number(category.score || 0);
      const gap = Math.max(0, max - score);
      const area = String(category.name || '');
      const actionMeta = actionMap[area] || {};
      return {
        area,
        score,
        max,
        gap,
        priority: gap >= 2 ? 'High' : gap === 1 ? 'Medium' : 'Low',
        action: actionMeta.action || 'Improve this area with one targeted revision pass.',
        drill: actionMeta.drill || 'Practice one focused mini-drill before retrying.',
      };
    })
    .filter((item) => item.gap > 0)
    .sort((a, b) => {
      if (b.gap !== a.gap) return b.gap - a.gap;
      return a.area.localeCompare(b.area);
    })
    .slice(0, 3);
}

function buildWritingChecklist(metrics = {}, targetWords = 180, coverage = { ratio: 0 }) {
  const items = [];
  if ((metrics.wordCount || 0) < targetWords) items.push(`Reach at least ${targetWords} words with one extra supporting example.`);
  if ((metrics.connectors || 0) < 3) items.push('Add at least 3 transition signals to improve coherence.');
  if ((metrics.errors || 0) > 2) items.push('Run a grammar cleanup pass and fix at least 3 errors.');
  if ((coverage.ratio || 0) < 0.35) items.push('Repeat prompt keywords and answer them more directly.');
  if ((metrics.ttr || 0) < 0.45) items.push('Reduce repetition by replacing overused words with academic synonyms.');
  if ((metrics.repeatedStems || 0) > 0) items.push('Change repeated sentence openings so the draft sounds less memorized.');
  return items.slice(0, 4);
}

function buildSpeakingChecklist(metrics = {}, targetWords = 110, coverage = { ratio: 0 }) {
  const items = [];
  if ((metrics.wordCount || 0) < targetWords) items.push(`Extend response toward ${targetWords}+ words using one additional example.`);
  if ((metrics.connectors || 0) < 2) items.push('Use at least 2 discourse markers (however, for example, therefore).');
  if ((metrics.errors || 0) > 2) items.push('Slow down and use simpler correct sentence forms.');
  if ((coverage.ratio || 0) < 0.3) items.push('Answer the prompt directly in your first sentence.');
  if ((metrics.academics || 0) < 2) items.push('Include 2 topic-relevant academic words in your next response.');
  return items.slice(0, 4);
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
  const repetition = repetitionPressure(text);
  const mechanicsIssues = mechanicsIssueCount(text);
  const coverage = promptCoverage(text, prompt);
  const paragraphs = (text || '').split(/\n+/).map((p) => p.trim()).filter(Boolean).length;
  const thesis = hasThesisSignal(text);
  const conclusion = hasConclusionSignal(text);
  const example = hasExampleSignal(text);
  const repeatedStems = repeatedSentenceStemCount(sentences);
  const supportHits = specificSupportCount(text);
  const rotePatternRisk = repeatedStems >= 2 && supportHits === 0 && connectors <= 2;
  const weakTaskCoverage = coverage.total > 0 && coverage.ratio < 0.25;

  let grammar = 1;
  if (errors <= 1 && sentenceCount >= 5 && avgSentence >= 10 && avgSentence <= 24) grammar = 4;
  else if (errors <= 3 && sentenceCount >= 4 && avgSentence >= 9 && avgSentence <= 27) grammar = 3;
  else if (errors <= 6 && sentenceCount >= 3 && avgSentence <= 30) grammar = 2;

  let vocabulary = 1;
  if (ttr >= 0.54 && academics >= 4 && repetition <= 1) vocabulary = 4;
  else if (ttr >= 0.46 && academics >= 2 && repetition <= 2) vocabulary = 3;
  else if (ttr >= 0.38 && academics >= 1) vocabulary = 2;
  if (repetition >= 3) vocabulary = Math.max(1, vocabulary - 1);

  let organization = 1;
  if (paragraphs >= 3 && thesis && conclusion && connectors >= 4 && repeatedStems === 0) organization = 4;
  else if (paragraphs >= 3 && connectors >= 2 && (thesis || conclusion)) organization = 3;
  else if (paragraphs >= 2 && sentenceCount >= 4) organization = 2;

  let content = 1;
  const coverageReady = coverage.total > 0;
  if (wc >= targetWords && (example || supportHits >= 2) && (!coverageReady || coverage.ratio >= 0.45) && paragraphs >= 3) content = 4;
  else if (wc >= Math.max(110, Math.round(targetWords * 0.85)) && (!coverageReady || coverage.ratio >= 0.3) && (example || supportHits >= 1)) content = 3;
  else if (wc >= Math.max(80, Math.round(targetWords * 0.65)) && (!coverageReady || coverage.ratio >= 0.15)) content = 2;

  let mechanics = 1;
  if (mechanicsIssues === 0 && errors <= 1 && sentenceCount >= 5) mechanics = 4;
  else if (mechanicsIssues <= 1 && errors <= 3) mechanics = 3;
  else if (mechanicsIssues <= 3) mechanics = 2;

  if (weakTaskCoverage) content = Math.min(content, 2);
  if (rotePatternRisk) {
    content = Math.min(content, 2);
    organization = Math.min(organization, 2);
    vocabulary = Math.min(vocabulary, 2);
  }

  const total = grammar + vocabulary + organization + content + mechanics;
  const readiness = Math.round((total / 20) * 100);
  const wascBand = resolveWascWritingBand({ total, wordCount: wc, text });
  const categories = [
    { name: 'Grammar', score: grammar, max: 4 },
    { name: 'Vocabulary', score: vocabulary, max: 4 },
    { name: 'Organization', score: organization, max: 4 },
    { name: 'Content', score: content, max: 4 },
    { name: 'Mechanics', score: mechanics, max: 4 },
  ];

  const strengths = [];
  if (wc >= targetWords) strengths.push('Word target reached');
  if (connectors >= 3 && paragraphs >= 3) strengths.push('Coherence is supported by paragraphing and linking.');
  if (ttr >= 0.5 && academics >= 3) strengths.push('Vocabulary range is moving toward academic use.');
  if ((!coverageReady && example) || coverage.ratio >= 0.35) strengths.push('The response stays on task and supports ideas.');
  if (supportHits >= 2) strengths.push('Specific support and exemplification strengthen task development.');
  if (wascBand.code === 'MA' || wascBand.code === 'VG' || wascBand.code === 'E') {
    strengths.push('The draft is approaching the official WASC expectation for developed support and logical flow.');
  }

  const improvements = [];
  if (wc < targetWords) improvements.push(`Increase length toward ${targetWords} words`);
  if (connectors < 3 || paragraphs < 3) improvements.push('Strengthen paragraph flow with clearer topic sentences and transitions');
  if (errors > 3) improvements.push('Reduce grammar errors before submitting the final version');
  if (mechanicsIssues > 1) improvements.push('Clean punctuation and spacing to avoid mechanics penalties');
  if (coverageReady && coverage.ratio < 0.25) improvements.push('Address prompt keywords more directly');
  if (!example) improvements.push('Add at least one concrete example to develop the argument');
  if (repetition >= 3 || repeatedStems >= 1) improvements.push('Vary repeated sentence patterns and overused vocabulary.');
  if (rotePatternRisk) improvements.push('Avoid memorized openings or empty general statements; build genuine argumentation instead.');

  const priorityPlan = buildPriorityPlan(categories, WRITING_AREA_ACTIONS);
  const nextStepChecklist = buildWritingChecklist(
    { wordCount: wc, connectors, errors, ttr, repeatedStems },
    targetWords,
    coverage
  );
  const feedbackSummary = `${wascBand.code} (${wascBand.label}) · ${readiness}% readiness. ${wascBand.descriptor || (readiness >= 80 ? 'Strong draft. Keep examples specific and polish sentence control.' : readiness >= 60 ? 'Developing draft. Improve task coverage, support, and accuracy for a higher band.' : 'Early draft. Build clearer task response, fuller support, and safer grammar first.')} The official WASC focus stays on addressing the whole task, supporting ideas with clear examples, and avoiding repeated sentence patterns.`;

  return {
    total,
    max: 20,
    readiness,
    band: bandFrom20(total),
    wascBand,
    metrics: { wordCount: wc, sentenceCount, connectors, academics, ttr, errors, repetition, mechanicsIssues, repeatedStems, supportHits },
    categories,
    strengths,
    improvements,
    priorityPlan,
    nextStepChecklist,
    feedbackSummary,
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
  const readiness = Math.round((total / 20) * 100);
  const categories = [
    { name: 'Fluency', score: fluency, max: 4 },
    { name: 'Coherence', score: coherence, max: 4 },
    { name: 'Lexical Resource', score: lexical, max: 4 },
    { name: 'Grammar', score: grammar, max: 4 },
    { name: 'Task Response', score: taskResponse, max: 4 },
  ];

  const strengths = [];
  if (wc >= targetWords) strengths.push('Response length is exam-safe');
  if (connectors >= 2) strengths.push('Speech has clear linking language');
  if (academics >= 1) strengths.push('Uses academic vocabulary');

  const improvements = [];
  if (wc < targetWords) improvements.push(`Extend response to around ${targetWords}+ words`);
  if (connectors < 2) improvements.push('Use more discourse markers (however, therefore, for example)');
  if (errors > 2) improvements.push('Simplify sentence forms to reduce grammar mistakes');
  if (coverage.ratio < 0.25) improvements.push('Answer the prompt more directly with evidence/examples');

  const priorityPlan = buildPriorityPlan(categories, SPEAKING_AREA_ACTIONS);
  const nextStepChecklist = buildSpeakingChecklist(
    { wordCount: wc, connectors, errors, academics },
    targetWords,
    coverage
  );
  const feedbackSummary = readiness >= 75
    ? 'Exam-safe speaking response with minor refinement needed.'
    : readiness >= 55
      ? 'Usable response. Improve coherence and task focus to raise the band.'
      : 'Foundational response. Prioritize structure and clarity first.';

  return {
    total,
    max: 20,
    readiness,
    band: bandFrom20(total),
    metrics: { wordCount: wc, sentenceCount, connectors, academics, ttr, errors },
    categories,
    strengths,
    improvements,
    priorityPlan,
    nextStepChecklist,
    feedbackSummary,
  };
}
