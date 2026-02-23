import repetitionRules from '../../data/repetition_rules.json';
import academicList from '../../data/academic_wordlist.json';
import { getWordEntry } from './dictionary';

function wordCount(text) {
  if (!text) return 0;
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function detectRepetition(text) {
  const stop = new Set(repetitionRules.stopwords || []);
  const tokens = (text.toLowerCase().match(/[A-Za-z][A-Za-z'-]*/g) || []).filter(t => !stop.has(t));
  const counts = {};
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
  const repeated = Object.entries(counts)
    .filter(([, c]) => c >= (repetitionRules.min_count || 3))
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => {
      const entry = getWordEntry(word);
      return { word, synonyms: entry?.synonyms?.slice(0, 4) || [] };
    });
  return repeated;
}

const TYPE_FEEDBACK = {
  argumentative: {
    bravo: 'Clear attempt to argue a position with reasons.',
    next: ['State a clear thesis in the introduction.', 'Use counter‑argument + refutation.', 'Support claims with evidence.']
  },
  cause_effect: {
    bravo: 'Good effort to link causes and effects logically.',
    next: ['Use explicit cause/effect connectors.', 'Separate causes from effects.', 'Give a concrete example.']
  },
  problem_solution: {
    bravo: 'You identify a problem and suggest solutions.',
    next: ['Define the problem precisely.', 'Explain feasibility of solutions.', 'Evaluate the best option.']
  },
  compare_contrast: {
    bravo: 'You compare two ideas and note differences.',
    next: ['Use clear comparison structure.', 'Balance both sides equally.', 'Use contrast connectors.']
  },
  opinion: {
    bravo: 'You express a clear opinion with reasons.',
    next: ['State opinion early.', 'Use two strong reasons.', 'Add one example.']
  },
  definition: {
    bravo: 'You attempt to define the concept clearly.',
    next: ['Provide a precise definition.', 'Add key characteristics.', 'Use one example.']
  },
  reaction: {
    bravo: 'You show a response and evaluation.',
    next: ['Explain why you react this way.', 'Add evidence.', 'Use academic tone.']
  },
  general: {
    bravo: 'Clear structure and relevant points.',
    next: ['Improve organization.', 'Use academic vocabulary.', 'Add specific examples.']
  }
};

const LEVEL_PROFILE = {
  P1: { cefr: 'A2', rubric: { Grammar: 2, Vocabulary: 2, Organization: 2, Content: 2, Mechanics: 2 } },
  P2: { cefr: 'B1', rubric: { Grammar: 2, Vocabulary: 2, Organization: 3, Content: 3, Mechanics: 2 } },
  P3: { cefr: 'B1+', rubric: { Grammar: 3, Vocabulary: 3, Organization: 3, Content: 3, Mechanics: 3 } },
  P4: { cefr: 'B2', rubric: { Grammar: 3, Vocabulary: 3, Organization: 4, Content: 4, Mechanics: 3 } }
};

const ERROR_TAGS = {
  ww: 'Wrong Word Choice',
  sv: 'Subject–Verb',
  cap: 'Capitalization',
  wo: 'Word Order',
  art: 'Article/Structure',
  punc: 'Punctuation/Spacing',
  tense: 'Tense/Form',
  prep: 'Preposition',
  pron: 'Pronoun Reference',
  rep: 'Repetition'
};

const RULES = [
  { tag: 'cap', pattern: /\b(china|turkey|english|boğaziçi|itu|odtü)\b/gi, why: 'Proper nouns should be capitalized.' },
  { tag: 'cap', pattern: /\bi\b/g, why: 'Pronoun “I” must be capitalized.' },
  { tag: 'art', pattern: /\bgovernment means who\b/gi, why: 'Use a noun phrase after “means”.' },
  { tag: 'art', pattern: /\ba university\b/gi, why: 'Use “a” before consonant sounds, “an” before vowel sounds.' },
  { tag: 'ww', pattern: /\bdo because\b/gi, why: 'This verb is vague; use “do this because”.' },
  { tag: 'wo', pattern: /\buse for prevent\b/gi, why: 'Use “to prevent”.' },
  { tag: 'ww', pattern: /\bpeople goodness\b/gi, why: 'Unnatural phrase; use “the good of the people”.' },
  { tag: 'ww', pattern: /\bcitizens'? favors\b/gi, why: 'Wrong word choice; use “well-being”.' },
  { tag: 'sv', pattern: /\b(government|governments|people|children|countries)\s+(cause|know|look|restrict|limit)\b/gi, why: 'Check subject–verb agreement.' },
  { tag: 'tense', pattern: /\bdid(n't)?\s+(went|saw|took|made|wrote|bought)\b/gi, why: 'Use base verb after did/didn’t.' },
  { tag: 'tense', pattern: /\bhas\s+went\b/gi, why: 'Use “has gone”.' },
  { tag: 'prep', pattern: /\bdiscuss about\b/gi, why: 'Use “discuss (something)” without “about”.' },
  { tag: 'prep', pattern: /\bdepend of\b/gi, why: 'Use “depend on”.' },
  { tag: 'prep', pattern: /\binterested on\b/gi, why: 'Use “interested in”.' },
  { tag: 'prep', pattern: /\blisten (music|songs)\b/gi, why: 'Use “listen to …”.' },
  { tag: 'prep', pattern: /\bdifferent than\b/gi, why: 'Use “different from”.' },
  { tag: 'pron', pattern: /\b(he|she|it|this|that)\s+are\b/gi, why: 'Singular pronouns take singular verbs.' },
  { tag: 'rep', pattern: /\b([A-Za-z]+)\s+\1\b/gi, why: 'Avoid immediate repetition.' },
  { tag: 'punc', pattern: /\s+[,.!?;:]/g, why: 'Avoid a space before punctuation.' },
  { tag: 'punc', pattern: /[,.!?;:](?=[A-Za-z])/g, why: 'Add a space after punctuation.' }
];

const SUGGESTIONS = {
  cap: (txt) => `Capitalize: ${txt[0].toUpperCase()}${txt.slice(1)}`,
  art: () => 'Use: “A government is a system that …”',
  ww: (txt) => `Replace “${txt}” with a more academic alternative.`,
  wo: () => 'Use “to prevent”.',
  sv: () => 'Adjust verb form for subject–verb agreement.',
  punc: () => 'Fix spacing around punctuation.',
  tense: () => 'Check tense or verb form (base form after did).',
  prep: () => 'Use the correct preposition.',
  pron: () => 'Use a singular verb with singular pronouns.',
  rep: () => 'Remove repeated word.'
};

function collectMatches(text) {
  const matches = [];
  for (const rule of RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m;
    while ((m = regex.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, tag: rule.tag, text: m[0] });
      if (regex.lastIndex === m.index) regex.lastIndex++;
    }
  }
  return matches.sort((a, b) => a.start - b.start || a.end - b.end);
}

function buildInlineSegments(text) {
  if (!text) return [];
  const matches = collectMatches(text);
  const segments = [];
  let pos = 0;
  for (const m of matches) {
    if (m.start < pos) continue;
    if (m.start > pos) segments.push({ text: text.slice(pos, m.start), tag: null });
    segments.push({ text: text.slice(m.start, m.end), tag: m.tag });
    pos = m.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), tag: null });
  return segments;
}

function splitSentenceSpans(text = '') {
  const spans = [];
  const re = /[^.!?]+[.!?]*/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const start = m.index;
    const end = m.index + raw.length;
    const trimmed = raw.trim();
    if (trimmed) spans.push({ start, end, text: trimmed });
    if (re.lastIndex === m.index) re.lastIndex++;
  }
  return spans;
}

function buildSentenceCorrections(text = '') {
  if (!text) return [];
  const spans = splitSentenceSpans(text);
  const matches = collectMatches(text);
  const revisedText = autoRevise(text || '');
  const revisedSpans = splitSentenceSpans(revisedText);

  return spans.map((s, idx) => {
    const errs = matches.filter((m) => m.start >= s.start && m.end <= s.end);
    const tags = errs.map((e) => e.tag);
    const uniqueTags = Array.from(new Set(tags));
    const reasons = errs.map((e) => {
      const rule = RULES.find((r) => r.tag === e.tag && new RegExp(r.pattern.source, r.pattern.flags).test(e.text));
      return rule?.why || ERROR_TAGS[e.tag] || 'Check this part';
    }).slice(0, 3);
    const revised = (revisedSpans[idx] && revisedSpans[idx].text)
      ? revisedSpans[idx].text
      : s.text.replace(/\s+([,.!?;:])/g, '$1').replace(/([,.!?;:])([A-Za-z])/g, '$1 $2');
    return { sentence: s.text, revised, tags: uniqueTags, reasons };
  }).filter((r) => r.tags.length > 0);
}

function buildCriticalErrors(text = '') {
  const priority = { sv: 10, tense: 9, wo: 8, art: 8, prep: 7, ww: 7, pron: 6, punc: 5, rep: 4, cap: 3 };
  const matches = collectMatches(text);
  return matches
    .map((m) => {
      const rule = RULES.find((r) => r.tag === m.tag && new RegExp(r.pattern.source, r.pattern.flags).test(m.text));
      const suggestion = SUGGESTIONS[m.tag] ? SUGGESTIONS[m.tag](m.text) : 'Revise this part.';
      return { tag: m.tag, text: m.text, why: rule?.why || ERROR_TAGS[m.tag] || 'Check usage', suggestion, severity: priority[m.tag] || 1 };
    })
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 15);
}


function buildWWExplanations(text) {
  if (!text) return [];
  const matches = collectMatches(text);
  const seen = new Set();
  const items = [];
  for (const m of matches) {
    if (!['ww','wo','sv','cap','art'].includes(m.tag)) continue;
    const key = `${m.tag}:${m.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const rule = RULES.find((r) => r.tag === m.tag && new RegExp(r.pattern.source, r.pattern.flags).test(m.text));
    const entry = getWordEntry(m.text.toLowerCase());
    const extras = entry?.synonyms?.slice(0, 3) || [];
    const primary = SUGGESTIONS[m.tag] ? SUGGESTIONS[m.tag](m.text) : 'Revise this part';
    const better = extras.length ? [primary, ...extras] : [primary];
    items.push({
      wrong: m.text,
      why: rule?.why || 'Check usage',
      better
    });
  }
  return items;
}

function buildNextSteps(base, errorSummary) {
  const steps = [...base];
  if (errorSummary.sv) steps.unshift('Check subject–verb agreement in each sentence.');
  if (errorSummary.cap) steps.unshift('Capitalize proper nouns and sentence starts.');
  if (errorSummary.wo) steps.unshift('Fix word order (especially infinitive “to + verb”).');
  if (errorSummary.ww) steps.unshift('Replace vague words with precise academic vocabulary.');
  if (errorSummary.prep) steps.unshift('Review common prepositions (depend on, interested in).');
  if (errorSummary.tense) steps.unshift('Check tense consistency (did + base verb).');
  if (errorSummary.rep) steps.unshift('Remove immediate word repetition.');
  return Array.from(new Set(steps));
}


function buildMetrics(text) {
  const words = wordCount(text || '');
  const sentences = (text || '').split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 0;
  const paragraphs = (text || '').split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;
  const avgSentence = sentences ? Math.round((words / sentences) * 10) / 10 : 0;
  const tokens = (text || '').toLowerCase().match(/[a-z][a-z'-]*/g) || [];
  const unique = new Set(tokens);
  const ttr = tokens.length ? Math.round((unique.size / tokens.length) * 100) / 100 : 0;
  const academicSet = new Set((academicList || []).map((w) => (w.word || w).toLowerCase()));
  const academicCount = tokens.filter((t) => academicSet.has(t)).length;
  return { words, sentences, paragraphs, avgSentence, ttr, academicCount };
}

function buildStrengths(metrics, errorSummary, repetition) {
  const strengths = [];
  if (metrics.words >= 180) strengths.push('Good length for an essay task.');
  if (metrics.sentences >= 6) strengths.push('Paragraph length seems appropriate.');
  if ((errorSummary.ww || 0) <= 1) strengths.push('Word choice is mostly clear.');
  if ((repetition || []).length <= 1) strengths.push('Limited repetition of key words.');
  if (metrics.ttr >= 0.45) strengths.push('Good lexical variety (type–token ratio).');
  if (metrics.academicCount >= 6) strengths.push('Academic vocabulary is present.');
  return strengths.length ? strengths : ['Structure is present; keep refining clarity.'];
}


function buildCriteriaFlags(text, metrics, errorSummary) {
  const hasLinkers = /\b(however|moreover|therefore|for example|for instance|in addition|on the other hand|as a result|consequently)\b/i.test(text || '');
  const matches = (text || '').match(/\b(however|moreover|therefore|for example|for instance|in addition|on the other hand|as a result|consequently)\b/gi) || [];
  const uniqueLinkers = new Set(matches.map((s) => s.toLowerCase()));
  const hasConclusion = /\b(in conclusion|to sum up|overall|in summary)\b/i.test(text || '');
  const hasExamples = /\b(for example|for instance|such as)\b/i.test(text || '');
  const longSentence = metrics.avgSentence >= 18;
  return {
    task: {
      completeResponse: metrics.words >= 120,
      appropriateWordCount: metrics.words >= 150,
      paragraphs: metrics.paragraphs >= 3,
      clearIdeas: metrics.sentences >= 5,
      relevantExamples: hasExamples
    },
    cohesion: {
      logicalStructure: metrics.paragraphs >= 3,
      introConclusion: hasConclusion,
      supportedMainPoints: metrics.words >= 150,
      accurateLinkingWords: hasLinkers,
      varietyInLinkingWords: uniqueLinkers.size >= 3
    },
    lexical: {
      variedVocabulary: metrics.words >= 150,
      spellingWordForm: (errorSummary.ww || 0) <= 2
    },
    grammar: {
      mixComplexSimple: longSentence && metrics.sentences >= 5,
      clearCorrectGrammar: (errorSummary.sv || 0) <= 1 && (errorSummary.wo || 0) <= 1
    }
  };
}

function buildIssues(metrics, errorSummary) {
  const issues = [];
  if (metrics.words < 120) issues.push('The response is short; develop ideas with examples.');
  if (metrics.avgSentence > 28) issues.push('Sentences are long; split for clarity.');
  if (errorSummary.sv) issues.push('Subject–verb agreement errors detected.');
  if (errorSummary.ww) issues.push('Vague or imprecise word choices detected.');
  if (errorSummary.cap) issues.push('Capitalization errors detected.');
  if (errorSummary.wo) issues.push('Word order issues detected.');
  if (errorSummary.art) issues.push('Structure/article issues detected.');
  if (errorSummary.punc) issues.push('Punctuation spacing issues detected.');
  if (errorSummary.tense) issues.push('Tense/verb‑form errors detected.');
  if (errorSummary.prep) issues.push('Preposition errors detected.');
  if (errorSummary.pron) issues.push('Pronoun agreement errors detected.');
  if (errorSummary.rep) issues.push('Immediate repetition detected.');
  return issues.length ? issues : ['No major errors detected; focus on depth and coherence.'];
}

function detectThesis(text = '') {
  const firstPara = text.split(/\n\s*\n/)[0] || '';
  return /\b(I (believe|think|argue)|this essay (argues|discusses)|should|must|ought to)\b/i.test(firstPara);
}

function buildSentenceFeedback(text = '') {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const feedback = [];
  sentences.forEach((s) => {
    const words = s.split(/\s+/).filter(Boolean).length;
    if (words >= 30) {
      feedback.push({ issue: 'Long sentence', sentence: s, fix: 'Split into two shorter sentences.' });
    }
    if (s.length > 0 && s[0] === s[0].toLowerCase()) {
      feedback.push({ issue: 'Sentence start', sentence: s, fix: 'Capitalize the first letter.' });
    }
  });
  return feedback.slice(0, 6);
}

function extractWeakPhrases(text = '') {
  const weak = ['very', 'really', 'a lot', 'good', 'bad', 'things', 'stuff', 'nice'];
  const found = [];
  weak.forEach((w) => {
    const re = new RegExp(`\\b${w}\\b`, 'gi');
    const m = text.match(re);
    if (m && m.length) found.push({ word: w, count: m.length });
  });
  return found;
}

function buildWeakWordSuggestions(text = '') {
  const weak = extractWeakPhrases(text);
  return weak.map((w) => {
    const entry = getWordEntry(w.word);
    const synonyms = entry?.synonyms?.slice(0, 6) || [];
    return { word: w.word, count: w.count, synonyms };
  });
}

function buildLexicalRangeFeedback(text = '') {
  const tokens = (text || '').toLowerCase().match(/[a-z][a-z'-]*/g) || [];
  const unique = new Set(tokens);
  const ratios = tokens.length ? unique.size / tokens.length : 0;
  const out = [];
  if (ratios < 0.32) out.push('Lexical range is low; reuse is high. Use more varied vocabulary.');
  if (ratios >= 0.45) out.push('Lexical range is strong.');
  return out;
}

function buildEvidenceSuggestions(text = '') {
  const tips = [];
  if (!/\b(for example|for instance|such as|according to)\b/i.test(text)) {
    tips.push('Add one concrete example to support each main point.');
  }
  if (!/\bdata|study|research|statistics\b/i.test(text)) {
    tips.push('Use one data-based reference to strengthen your argument.');
  }
  return tips;
}
function buildStyleFeedback(text = '', metrics) {
  const weak = extractWeakPhrases(text);
  const suggestions = [];
  if (weak.length) {
    suggestions.push(`Reduce weak words: ${weak.map((w) => `${w.word} (${w.count})`).join(', ')}`);
  }
  if (metrics.avgSentence < 10) {
    suggestions.push('Sentences are short; combine ideas to improve flow.');
  }
  if (metrics.avgSentence > 25) {
    suggestions.push('Sentences are long; split for clarity.');
  }
  return suggestions;
}

function detectStructure(text = '') {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const intro = paras[0] || '';
  const conclusion = paras[paras.length - 1] || '';
  const hasIntroSignal = /\b(this essay|in this essay|the purpose|i will discuss|this paragraph)\b/i.test(intro);
  const hasConclusionSignal = /\b(in conclusion|to sum up|overall|in summary)\b/i.test(conclusion);
  return { hasIntroSignal, hasConclusionSignal, paraCount: paras.length };
}

function buildCohesionAdvice(text = '') {
  const linkers = (text || '').match(/\b(however|moreover|therefore|for example|for instance|in addition|on the other hand|as a result|consequently|nevertheless|in contrast|similarly)\b/gi) || [];
  const unique = new Set(linkers.map((s) => s.toLowerCase()));
  const advice = [];
  if (unique.size === 0) advice.push('Add linking words to connect ideas.');
  if (unique.size > 0 && unique.size < 3) advice.push('Use a wider variety of linkers.');
  return advice;
}

function buildArgumentScaffold(type) {
  if (type === 'argumentative' || type === 'opinion') {
    return [
      'Thesis (1 sentence): state your position clearly.',
      'Reason 1 + example (2–3 sentences).',
      'Reason 2 + example (2–3 sentences).',
      'Counter‑argument + refutation (2 sentences).',
      'Conclusion: restate thesis + implication.'
    ];
  }
  if (type === 'cause_effect') {
    return [
      'Intro: define the phenomenon.',
      'Cause paragraph: 2–3 causes with one example.',
      'Effect paragraph: 2–3 effects with one example.',
      'Conclusion: summarize the chain.'
    ];
  }
  if (type === 'problem_solution') {
    return [
      'Intro: define the problem.',
      'Body 1: cause + evidence.',
      'Body 2: solution 1 + feasibility.',
      'Body 3: solution 2 + evaluation.',
      'Conclusion: best solution + reason.'
    ];
  }
  if (type === 'compare_contrast') {
    return [
      'Intro: define both items and criteria.',
      'Body 1: similarity with example.',
      'Body 2: difference with example.',
      'Conclusion: overall evaluation.'
    ];
  }
  if (type === 'definition') {
    return [
      'Intro: formal definition.',
      'Body 1: key characteristics.',
      'Body 2: example and boundary case.',
      'Conclusion: why the definition matters.'
    ];
  }
  return [
    'Intro: thesis/topic sentence.',
    'Body 1: main idea + example.',
    'Body 2: main idea + example.',
    'Conclusion: restate main point.'
  ];
}

function buildScaffoldExamples(type) {
  if (type === 'argumentative' || type === 'opinion') {
    return [
      'Thesis: “This essay argues that X should be limited because A and B.”',
      'Reason 1: “First, X leads to A; for example, …”',
      'Reason 2: “Moreover, X causes B; for instance, …”',
      'Counter: “Some claim Y; however, …”',
      'Conclusion: “In conclusion, X should be limited to protect …”'
    ];
  }
  if (type === 'cause_effect') {
    return [
      'Intro: “The rise of X has significant causes and effects.”',
      'Cause: “One major cause is A; for example, …”',
      'Effect: “As a result, B has increased; for instance, …”',
      'Conclusion: “Overall, X reshapes …”'
    ];
  }
  if (type === 'problem_solution') {
    return [
      'Intro: “X is a growing problem in …”',
      'Cause: “The main cause is A, which …”',
      'Solution 1: “A practical solution is …”',
      'Solution 2: “Another approach is …”',
      'Conclusion: “The most feasible solution is …”'
    ];
  }
  if (type === 'compare_contrast') {
    return [
      'Intro: “X and Y are similar in A but differ in B.”',
      'Similarity: “Both share … for example …”',
      'Difference: “However, X … whereas Y …”',
      'Conclusion: “Overall, X is more … because …”'
    ];
  }
  if (type === 'definition') {
    return [
      'Intro: “X can be defined as …”',
      'Body: “Key features include …”',
      'Example: “For instance, …”',
      'Conclusion: “Understanding X matters because …”'
    ];
  }
  return [
    'Intro: “This essay discusses …”',
    'Body: “First, … For example, …”',
    'Body: “Second, … As a result, …”',
    'Conclusion: “In conclusion, …”'
  ];
}

function buildThesisSuggestions(type) {
  if (type === 'argumentative' || type === 'opinion') {
    return [
      'Although X is common, it should be limited because A and B.',
      'X brings benefits, but the long‑term costs outweigh them.',
      'To address X effectively, institutions must prioritize Y and Z.'
    ];
  }
  if (type === 'cause_effect') {
    return [
      'The rise of X has several causes and produces serious effects.',
      'X results from A and B and leads to C.',
      'Because of A, X has become more common and affects B.'
    ];
  }
  if (type === 'problem_solution') {
    return [
      'X is a growing problem that requires multi‑level solutions.',
      'The main challenge of X can be addressed through A and B.',
      'Solving X depends on policy changes and individual action.'
    ];
  }
  return [
    'This essay argues that X is more effective than Y.',
    'A balanced view shows that X has benefits but also costs.',
    'Overall, X should be encouraged with clear limits.'
  ];
}

function buildDiagnostics(text, metrics, errorSummary) {
  const hasConclusion = /\b(in conclusion|to sum up|overall|in summary)\b/i.test(text || '');
  const hasExamples = /\b(for example|for instance|such as)\b/i.test(text || '');
  const linkers = (text || '').match(/\b(however|moreover|therefore|for example|for instance|in addition|on the other hand|as a result|consequently)\b/gi) || [];
  const uniqueLinkers = new Set(linkers.map((s) => s.toLowerCase()));
  const thesis = detectThesis(text);
  const diagnostics = [];
  if (!thesis) diagnostics.push('Thesis statement is weak or missing in the first paragraph.');
  if (!hasConclusion) diagnostics.push('Conclusion signal words not detected (e.g., “In conclusion”).');
  if (uniqueLinkers.size < 2) diagnostics.push('Few linking words; add cohesive devices.');
  if (!hasExamples && metrics.words >= 120) diagnostics.push('No explicit examples; add at least one example.');
  if ((errorSummary.punc || 0) >= 2) diagnostics.push('Punctuation spacing issues are frequent.');
  return diagnostics;
}

function buildCriteriaComments(metrics, errorSummary, criteria_flags) {
  const comments = {
    'Task Response': [],
    'Coherence & Cohesion': [],
    'Lexical Resource': [],
    'Grammar Range & Accuracy': []
  };
  if (!criteria_flags.task.completeResponse) comments['Task Response'].push('Response is incomplete; address all parts of the prompt.');
  if (!criteria_flags.task.appropriateWordCount) comments['Task Response'].push('Word count is low for full development.');
  if (criteria_flags.task.relevantExamples) comments['Task Response'].push('Examples are present, which strengthens task response.');

  if (!criteria_flags.cohesion.logicalStructure) comments['Coherence & Cohesion'].push('Paragraph structure is weak; use 3+ paragraphs.');
  if (!criteria_flags.cohesion.accurateLinkingWords) comments['Coherence & Cohesion'].push('Use linking words to connect ideas more clearly.');
  if (criteria_flags.cohesion.varietyInLinkingWords) comments['Coherence & Cohesion'].push('Good variety of linkers.');

  if (metrics.ttr < 0.32) comments['Lexical Resource'].push('Lexical range is limited; avoid repetition.');
  if (metrics.academicCount >= 6) comments['Lexical Resource'].push('Academic vocabulary is visible.');
  if (errorSummary.ww) comments['Lexical Resource'].push('Some word choices are imprecise; choose more academic alternatives.');

  if ((errorSummary.sv || 0) + (errorSummary.tense || 0) + (errorSummary.wo || 0) > 2) {
    comments['Grammar Range & Accuracy'].push('Grammar errors reduce clarity; focus on agreement and verb forms.');
  } else {
    comments['Grammar Range & Accuracy'].push('Grammar control is mostly steady; expand sentence variety.');
  }
  return comments;
}

function buildTone(level) {
  if (level === 'P1') return 'Use very clear, simple sentences and one idea per paragraph.';
  if (level === 'P2') return 'Aim for clearer thesis statements and one concrete example per body paragraph.';
  if (level === 'P3') return 'Use more academic connectors and show counter‑argument structure.';
  return 'Use precise academic vocabulary, cautious hedging, and deeper synthesis.';
}

function bandDescriptor(score) {
  if (score <= 3) return 'Limited control; frequent errors hinder clarity.';
  if (score <= 5) return 'Basic control; meaning is usually clear but accuracy is inconsistent.';
  if (score <= 7) return 'Good control; errors are occasional and do not impede meaning.';
  return 'Strong control; language is precise with minor errors only.';
}

function buildBandDescriptors(criteria) {
  const out = {};
  Object.entries(criteria).forEach(([k, v]) => {
    out[k] = bandDescriptor(v);
  });
  return out;
}

function buildCefrSummary(cefr, strengths = [], issues = []) {
  const up = strengths.slice(0, 3).map((s) => `+ ${s}`);
  const down = issues.slice(0, 3).map((s) => `- ${s}`);
  return [`Estimated CEFR: ${cefr}`, ...up, ...down];
}

function buildParaphraseBank(text = '') {
  const stop = new Set(repetitionRules.stopwords || []);
  const tokens = (text.toLowerCase().match(/[a-z][a-z'-]*/g) || []).filter((t) => !stop.has(t));
  const counts = {};
  tokens.forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  return top.map(([word, count]) => {
    const entry = getWordEntry(word);
    const synonyms = entry?.synonyms?.slice(0, 6) || [];
    return { word, count, synonyms };
  }).filter((x) => x.synonyms.length > 0);
}

function buildVariantDiffs(original = '', variants = []) {
  const base = new Set((original.toLowerCase().match(/[a-z][a-z'-]*/g) || []));
  return (variants || []).map((v) => {
    const words = (v.toLowerCase().match(/[a-z][a-z'-]*/g) || []);
    const unique = Array.from(new Set(words));
    const added = unique.filter((w) => !base.has(w)).slice(0, 12);
    return { added };
  });
}

function detectClaimEvidence(text = '') {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  let claimCount = 0;
  let evidenceCount = 0;
  paras.forEach((p) => {
    if (/\b(should|must|therefore|this shows|this suggests|argue|claim)\b/i.test(p)) claimCount += 1;
    if (/\b(for example|for instance|such as|according to|data|evidence)\b/i.test(p)) evidenceCount += 1;
  });
  return { claimCount, evidenceCount };
}

function buildChecklistGaps(criteria_flags) {
  const gaps = [];
  if (!criteria_flags.task.completeResponse) gaps.push('Complete the response; answer all parts of the prompt.');
  if (!criteria_flags.task.appropriateWordCount) gaps.push('Increase word count to meet task expectations.');
  if (!criteria_flags.task.paragraphs) gaps.push('Use at least 3 paragraphs.');
  if (!criteria_flags.cohesion.accurateLinkingWords) gaps.push('Add linking words (however, therefore, for example).');
  if (!criteria_flags.cohesion.varietyInLinkingWords) gaps.push('Use a wider variety of linkers.');
  if (!criteria_flags.lexical.variedVocabulary) gaps.push('Use a wider range of vocabulary.');
  if (!criteria_flags.grammar.clearCorrectGrammar) gaps.push('Reduce grammar errors (S–V agreement, word order).');
  return gaps;
}

function buildParagraphFeedback(text = '') {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const results = [];
  paras.forEach((p, idx) => {
    const sentences = p.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    const first = sentences[0] || '';
    const hasTopic = /\b(should|must|because|however|therefore|in my opinion|I believe|this paragraph)\b/i.test(first);
    const hasExample = /\b(for example|for instance|such as)\b/i.test(p);
    const hasConcluding = sentences.length >= 2 && /\b(in conclusion|overall|to sum up|therefore|thus)\b/i.test(sentences[sentences.length - 1]);
    results.push({
      index: idx + 1,
      hasTopic,
      hasExample,
      hasConcluding,
      length: sentences.length
    });
  });
  return results;
}

function buildPriorityFixes(errorSummary) {
  const priority = [];
  if (errorSummary.sv) priority.push('Fix subject–verb agreement first.');
  if (errorSummary.tense) priority.push('Fix tense/form errors (did + base verb).');
  if (errorSummary.wo) priority.push('Fix word order in problematic phrases.');
  if (errorSummary.prep) priority.push('Fix incorrect prepositions.');
  if (errorSummary.ww) priority.push('Replace vague words with academic alternatives.');
  if (errorSummary.punc) priority.push('Fix punctuation spacing.');
  if (errorSummary.rep) priority.push('Remove repeated words.');
  return priority.slice(0, 4);
}

function buildCohesionStats(text = '') {
  const linkers = (text || '').match(/\b(however|moreover|therefore|for example|for instance|in addition|on the other hand|as a result|consequently|nevertheless|in contrast|similarly)\b/gi) || [];
  const uniqueLinkers = new Set(linkers.map((s) => s.toLowerCase()));
  const score = Math.min(4, uniqueLinkers.size);
  return { linkers: uniqueLinkers.size, cohesionScore: score, used: Array.from(uniqueLinkers).slice(0, 8) };
}

function scoreRubric(base, metrics, errorSummary, repetition, text) {
  const clamp = (v) => Math.max(1, Math.min(4, v));
  const hasConclusion = /\b(in conclusion|to sum up|overall|in summary)\b/i.test(text || '');
  const hasExamples = /\b(for example|for instance|such as)\b/i.test(text || '');
  const linkers = (text || '').match(/\b(however|moreover|therefore|for example|for instance|in addition|on the other hand|as a result|consequently)\b/gi) || [];
  const uniqueLinkers = new Set(linkers.map((s) => s.toLowerCase()));

  let Grammar = base.Grammar;
  const gErrors = (errorSummary.sv || 0) + (errorSummary.wo || 0) + (errorSummary.art || 0);
  if (gErrors >= 3) Grammar -= 1;
  if (gErrors === 0 && metrics.avgSentence >= 12 && metrics.avgSentence <= 24) Grammar += 1;

  let Vocabulary = base.Vocabulary;
  if (metrics.ttr >= 0.45 && metrics.academicCount >= 6) Vocabulary += 1;
  if (metrics.ttr < 0.28 || (repetition || []).length >= 3) Vocabulary -= 1;

  let Organization = base.Organization;
  if (metrics.paragraphs >= 3 && hasConclusion && uniqueLinkers.size >= 2) Organization += 1;
  if (metrics.paragraphs < 3) Organization -= 1;

  let Content = base.Content;
  if (metrics.words >= 180 && hasExamples) Content += 1;
  if (metrics.words < 120) Content -= 1;

  let Mechanics = base.Mechanics;
  const mErrors = (errorSummary.cap || 0) + (errorSummary.punc || 0);
  if (mErrors >= 3) Mechanics -= 1;
  if (mErrors === 0) Mechanics += 1;

  return {
    Grammar: clamp(Grammar),
    Vocabulary: clamp(Vocabulary),
    Organization: clamp(Organization),
    Content: clamp(Content),
    Mechanics: clamp(Mechanics)
  };
}

function autoRevise(text) {
  if (!text) return '';
  let t = text;
  const replacements = [
    [/\bgovernment means who\b/gi, 'A government is a system that'],
    [/\bGovernments do because\b/g, 'Governments do this because'],
    [/\bnew way\b/gi, 'new ways'],
    [/\banother goals\b/gi, 'other goals'],
    [/\bfor prevent\b/gi, 'to prevent'],
    [/\bpeople goodness\b/gi, 'the good of the people'],
    [/\bcitizens’ favors\b/gi, 'citizens’ well-being'],
    [/\bIn Chinese example\b/gi, 'In the Chinese example'],
    [/\bchildren academic performance\b/gi, "children's academic performance"],
    [/\bfor national benefits\b/gi, 'for national benefit'],
    [/\bhard workers ,skilled employees\b/gi, 'hard workers and skilled employees']
  ];
  for (const [re, val] of replacements) t = t.replace(re, val);

  t = t.replace(/\s+([,.!?;:])/g, '$1');
  t = t.replace(/([,.!?;:])([A-Za-z])/g, '$1 $2');
  t = t.replace(/\s{2,}/g, ' ');

  const parts = t.split(/([.!?]\s+)/);
  t = parts.map((p) => {
    if (!p) return p;
    if (/^[.!?]\s*$/.test(p)) return p;
    const trimmed = p.trimStart();
    if (!trimmed) return p;
    return trimmed[0].toUpperCase() + trimmed.slice(1);
  }).join('');

  // Ensure thesis and conclusion signals
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length > 0 && !/\b(this essay|i believe|i think|this paragraph)\b/i.test(paras[0])) {
    paras[0] = `In this essay, ${paras[0][0].toLowerCase()}${paras[0].slice(1)}`;
  }
  if (paras.length > 1 && !/\b(in conclusion|to sum up|overall|in summary)\b/i.test(paras[paras.length - 1])) {
    paras[paras.length - 1] = `In conclusion, ${paras[paras.length - 1][0].toLowerCase()}${paras[paras.length - 1].slice(1)}`;
  }

  return paras.join('\n\n');
}

function advancedRewrite(text = '', level = 'P2') {
  if (!text) return '';
  let t = autoRevise(text);
  const replacements = [
    [/\bvery\b/gi, 'highly'],
    [/\breally\b/gi, 'considerably'],
    [/\ba lot\b/gi, 'substantially'],
    [/\bgood\b/gi, 'beneficial'],
    [/\bbad\b/gi, 'detrimental'],
    [/\bthings\b/gi, 'factors'],
    [/\bstuff\b/gi, 'materials'],
    [/\bnice\b/gi, 'positive']
  ];
  for (const [re, val] of replacements) t = t.replace(re, val);
  if (level === 'P3' || level === 'P4') {
    t = t.replace(/\b(is|are|shows|prove|proves)\b/gi, (m) => {
      const lower = m.toLowerCase();
      if (lower === 'is') return 'appears to be';
      if (lower === 'are') return 'tend to be';
      if (lower === 'shows' || lower === 'prove' || lower === 'proves') return 'suggests';
      return m;
    });
  }
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const starters = ['Moreover,', 'Furthermore,', 'However,', 'Consequently,', 'In contrast,'];
  for (let i = 1; i < paras.length; i++) {
    if (!/^(However|Moreover|Furthermore|Consequently|In contrast|On the other hand|In addition)\b/i.test(paras[i])) {
      paras[i] = `${starters[(i - 1) % starters.length]} ${paras[i][0].toLowerCase()}${paras[i].slice(1)}`;
    }
  }
  return paras.join('\n\n');

}

function buildRewriteVariants(text = '', level = 'P2') {
  const base = advancedRewrite(text, level);
  if (!base) return [];
  let v1 = base.replace(/\bMoreover,\b/gi, 'Additionally,').replace(/\bHowever,\b/gi, 'Nevertheless,');
  let v2 = base.replace(/\bFurthermore,\b/gi, 'In addition,').replace(/\bConsequently,\b/gi, 'As a result,');
  if (level === 'P4') {
    v1 = v1.replace(/\bappears to be\b/gi, 'seems to be').replace(/\btend to be\b/gi, 'are likely to be');
    v2 = v2.replace(/\bsuggests\b/gi, 'indicates');
  }
  return [v1, v2];
}

export function buildYS9Report(text, type = 'general', level = 'P2', meta = {}) {
  const t = TYPE_FEEDBACK[type] || TYPE_FEEDBACK.general;
  const profile = LEVEL_PROFILE[level] || LEVEL_PROFILE.P2;

  const inlineSegments = buildInlineSegments(text || '');
  const errorSummary = inlineSegments.reduce((acc, seg) => {
    if (seg.tag) acc[seg.tag] = (acc[seg.tag] || 0) + 1;
    return acc;
  }, {});

  const metrics = buildMetrics(text);
  const repetition = detectRepetition(text);
  const keywords = (meta?.keywords || []).map((k) => k.toLowerCase());
  const keywordHits = keywords.length
    ? keywords.filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(text || ''))
    : [];
  const scored = scoreRubric(profile.rubric, metrics, errorSummary, repetition, text);
  const total = Object.values(scored).reduce((a, b) => a + b, 0);
  const band = Math.max(1, Math.min(9, Math.round((total / 20) * 9 * 10) / 10));
  const strengths = buildStrengths(metrics, errorSummary, repetition);
  const issues = buildIssues(metrics, errorSummary);
  const criteria_flags = buildCriteriaFlags(text || '', metrics, errorSummary);
  const diagnostics = buildDiagnostics(text || '', metrics, errorSummary);
  const sentence_feedback = buildSentenceFeedback(text || '');
  const scaffold = buildArgumentScaffold(type);
  const scaffold_examples = buildScaffoldExamples(type);
  const thesis_suggestions = buildThesisSuggestions(type);
  const claimEvidence = detectClaimEvidence(text || '');
  const checklist_gaps = buildChecklistGaps(criteria_flags);
  const style_feedback = buildStyleFeedback(text || '', metrics);
  const weak_words = buildWeakWordSuggestions(text || '');
  const lexical_feedback = buildLexicalRangeFeedback(text || '');
  const evidence_suggestions = buildEvidenceSuggestions(text || '');
  const structure = detectStructure(text || '');
  const cohesion_advice = buildCohesionAdvice(text || '');
  const paragraph_feedback = buildParagraphFeedback(text || '');
  const priority_fixes = buildPriorityFixes(errorSummary);
  const cohesion_stats = buildCohesionStats(text || '');
  const sentence_corrections = buildSentenceCorrections(text || '');
  const critical_errors = buildCriticalErrors(text || '');
  const criteria_comments = buildCriteriaComments(metrics, errorSummary, criteria_flags);
  const tone_advice = buildTone(level);

  return {
    type,
    bravo: t.bravo,
    inline_feedback: text || '',
    inline_segments: inlineSegments,
    inline_legend: ERROR_TAGS,
    error_summary: errorSummary,
    ww_explanations: buildWWExplanations(text),
    revised: autoRevise(text),
    revised_advanced: advancedRewrite(text, level),
    revised_variants: buildRewriteVariants(text, level),
    revised_variant_diffs: buildVariantDiffs(text, buildRewriteVariants(text, level)),
    paraphrase_bank: buildParaphraseBank(text),
    sentence_corrections,
    critical_errors,
    next_steps: buildNextSteps(t.next, errorSummary),
    rubric: { ...scored, Total: total },
    writing9_style: {
      band,
      overall_comment: tone_advice,
      criteria_comments,
      criteria: {
        'Task Response': Math.max(1, Math.min(9, Math.round((profile.rubric.Content / 4) * 9))),
        'Coherence & Cohesion': Math.max(1, Math.min(9, Math.round((profile.rubric.Organization / 4) * 9))),
        'Lexical Resource': Math.max(1, Math.min(9, Math.round((profile.rubric.Vocabulary / 4) * 9))),
        'Grammar Range & Accuracy': Math.max(1, Math.min(9, Math.round((profile.rubric.Grammar / 4) * 9)))
      },
      band_descriptors: buildBandDescriptors({
        'Task Response': Math.max(1, Math.min(9, Math.round((profile.rubric.Content / 4) * 9))),
        'Coherence & Cohesion': Math.max(1, Math.min(9, Math.round((profile.rubric.Organization / 4) * 9))),
        'Lexical Resource': Math.max(1, Math.min(9, Math.round((profile.rubric.Vocabulary / 4) * 9))),
        'Grammar Range & Accuracy': Math.max(1, Math.min(9, Math.round((profile.rubric.Grammar / 4) * 9)))
      })
    },
    cefr: profile.cefr,
    cefr_summary: buildCefrSummary(profile.cefr, strengths, issues),
    repetition,
    metrics,
    strengths,
    issues,
    criteria_flags,
    diagnostics,
    sentence_feedback,
    scaffold,
    scaffold_examples,
    thesis_suggestions,
    claimEvidence,
    checklist_gaps,
    style_feedback,
    weak_words,
    lexical_feedback,
    evidence_suggestions,
    structure,
    cohesion_advice,
    paragraph_feedback,
    priority_fixes,
    cohesion_stats,
    keyword_coverage: {
      total: keywords.length,
      used: keywordHits.length,
      hits: keywordHits
    }
  };
}

export function countWords(text) {
  return wordCount(text);
}
