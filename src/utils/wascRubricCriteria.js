/**
 * WASC Official BUEPT Rubric — Criterion Matrix
 * Derived directly from the Boğaziçi University "Writing Marking Scheme (BUEPT) —
 * OFFICIAL DOCUMENT" (5 pages) provided by the Writing and Academic Support Center.
 *
 * This module translates each band descriptor into machine-testable criteria:
 *  - Per-band expectations and disqualifiers (what must be present / absent)
 *  - Detectable rubric evidence (cliches, run-ons, task-replication risk, etc.)
 *  - Per-band "what the raters look for / against" guidance used by the AI feedback panel
 */

export const WASC_BAND_ORDER = ['E', 'VG', 'MA', 'A', 'D', 'NA', 'FBA', 'INS', 'WN'];

export const WASC_PASS_BANDS = new Set(['E', 'VG', 'MA', 'A']);

/** Official WASC criterion areas, each mapped to descriptor language */
export const WASC_CRITERIA = [
  {
    key: 'taskDevelopment',
    label: 'Task Development',
    rubricNote:
      'Raters check whether the whole task is addressed and ideas are developed beyond the prompts/guidelines. Replicating or repeating the task concepts in a simplistic manner caps the essay at Not Adequate.',
    bandExpectations: {
      E: 'Topic fully developed with systematic discussion, sophisticated argumentation and a personal stance that communicates conviction effectively.',
      VG: 'Topic developed with extended argumentation and support; significance of points elaborated in a fluent style.',
      MA: 'Task addressed; topic developed with additional ideas and examples beyond the prompt.',
      A: 'Task addressed with adequate elaboration and examples for the points given in the task.',
      D: 'Content generally relevant and adequate, but some points supported only with simple arguments or under-developed.',
      NA: 'Not all of the task addressed, or ideas cannot go beyond the prompts — repetitive and simplistic.',
      FBA: 'Task failed or addressed in a very limited way with only simple or unintelligible messages.',
    },
  },
  {
    key: 'organization',
    label: 'Organization & Coherence',
    rubricNote:
      'A sound logical structure with natural flow is required for the top bands. Long introductions, short body paragraphs, broken paragraph unity or ideas that do not logically follow each other are NA-level signals.',
    bandExpectations: {
      E: 'Effectively organised and coherent with a sound logical structure; organisation naturally flows from the ideas.',
      VG: 'Effectively organised and coherent with a sound logical structure and connections.',
      MA: 'Clear organisational structure; paragraphs have inner coherence; argumentation flows logically throughout.',
      A: 'Clear, logical organisation with each aspect in separate paragraphs; only slight coherence problems allowed.',
      D: 'Adequately developed structure, though occasionally unclear or inconsistent.',
      NA: 'Only surface organisation; paragraphing problems; ideas may not logically follow each other.',
      FBA: 'No identifiable organisation; coherence seriously disrupted.',
    },
  },
  {
    key: 'grammar',
    label: 'Grammatical Range & Accuracy',
    rubricNote:
      'Top bands show firm control of complex structures. Frequent run-ons, word-order problems, subject-verb and tense disagreement, and sentence fragments are Not Adequate-level evidence.',
    bandExpectations: {
      E: 'Firm control and flexible use of complex structures; free of errors except negligible slips.',
      VG: 'Complex structures used effectively; only occasional word-choice/collocation errors and typical lapses such as articles.',
      MA: 'Blend of simple and complex sentences with a few possible lapses in more complex structures.',
      A: 'Language may be mostly simple but almost fully correct, or complex with some errors; frequent error-free sentences.',
      D: 'Handles only simple sentences with ease; errors appear at complex sentences.',
      NA: 'Major sentence structure problems: frequent run-ons, word order, S-V/tense disagreement, fragments.',
      FBA: 'Frequently unintelligible sentence structures.',
    },
  },
  {
    key: 'vocabulary',
    label: 'Vocabulary Range',
    rubricNote:
      'The raters expect writers to extend beyond the vocabulary given in the task. Limited range with frequent word-choice and collocation errors that impede meaning is a Not Adequate signal.',
    bandExpectations: {
      E: 'Wide range of vocabulary with effective, precise use.',
      VG: 'Wide range used effectively; only occasional word choice and collocation errors.',
      MA: 'Task-specific vocabulary adequate; some collocation errors possible; meaning never obscured.',
      A: 'Limited but adequate range; occasional collocation errors; writer uses words beyond the task vocabulary.',
      D: 'Limited task-related vocabulary; some wrong word choices; cannot comfortably extend task vocabulary.',
      NA: 'Frequent word choice and collocation errors that impede meaning at points.',
      FBA: 'Frequently unintelligible due to sentence structure and vocabulary errors.',
    },
  },
  {
    key: 'authenticity',
    label: 'Authentic Voice',
    rubricNote:
      'Official warning from the WASC scheme: a text built mostly on rote-learned introductions/conclusions, memorised pat phrases and clichés ("Government has to take necessary precautions") with no genuine argumentation can only achieve Not Adequate. Off-topic or fully memorised texts score Far Below Adequacy.',
    bandExpectations: {
      E: 'Personal stance communicated with effective style and genuine argumentation.',
      VG: 'Significance of points highlighted; style fluent and personal, not formulaic.',
      MA: 'Ideas developed with the writer\'s own support; no dependence on memorised patterns.',
      A: 'Genuine argumentation present; no irrelevant digressions.',
      D: 'Content relevant but argumentation thin and partly formulaic.',
      NA: 'Dominated by rote-learned openings/closings and clichés; no genuine argumentation in adequate length.',
      FBA: 'Completely off-topic and/or clearly rote-learned.',
    },
  },
];

/** Rote-learned clichés and empty sentences named or implied in the official scheme */
export const ROTE_PHRASES = [
  'government has to take necessary precautions',
  'necessary precautions should be taken',
  'take necessary precautions',
  'in today\'s modern world',
  'in today\'s modern world, ',
  'since the beginning of time',
  'throughout human history',
  'all in all',
  'this is a very important issue',
  'everyone knows that',
  'as everyone knows',
  'last but not least',
  'every coin has two sides',
  'it cannot be denied that',
  'it is obvious that',
  'in conclusion, i think',
  'to conclude, i think',
];


export function detectRotePhrases(text = '') {
  const lower = String(text || '').toLowerCase();
  return ROTE_PHRASES.filter((phrase) => lower.includes(phrase));
}

export function detectStructureRisks(text = '') {
  const source = String(text || '').trim();
  const risks = [];
  const sentences = source.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  sentences.forEach((sentence) => {
    const words = sentence.split(/\s+/).length;
    // Long sentence with a mid-sentence comma followed by a clause starter (comma-splice risk)
    if (words >= 28 && /, (i |we |they |he |she |it |this |that |there )/i.test(sentence)) {
      risks.push({ id: 'commaSplice', why: 'Possible comma splice in a long sentence — consider splitting or adding a conjunction.' });
    }
    if (words >= 45 && sentence.indexOf('.') === -1) {
      risks.push({ id: 'runOn', why: 'Very long sentence with no internal punctuation — likely run-on.' });
    }
  });
  if (!/\b(I|We|They)\b/.test(source) && source.split(/\s+/).length > 60 && !/[,;]/.test(source.slice(0, 80))) {
    risks.push({ id: 'wallOfText', why: 'Opening runs long without a punctuation break — check sentence boundaries.' });
  }
  return risks;
}

/**
 * Evidence items the rubric explicitly mentions. Each maps to the exact
 * descriptor language so the AI feedback panel can quote the official scheme.
 */
export function buildRubricEvidence({ text = '', prompt = '', metrics = {} } = {}) {
  const wc = Number(metrics.wordCount || 0);
  const source = String(text || '').trim();
  const evidence = [];

  if (!source) {
    evidence.push({ band: 'WN', kind: 'fail', text: 'No text produced — official band: Wrote Nothing (no score).', criterion: 'Authentic Voice' });
    return evidence;
  }
  if (wc < 25) {
    evidence.push({ band: 'INS', kind: 'fail', text: 'Only a few lines — not enough output for a rater to evaluate (official: Insufficient).', criterion: 'Task Development' });
    return evidence;
  }

  const rote = detectRotePhrases(source);
  if (rote.length >= 1) {
    evidence.push({ band: 'NA', kind: 'warn', text: `Rote-learned phrasing detected ("${rote[0]}") — the official scheme caps memorised clichés at Not Adequate.`, criterion: 'Authentic Voice' });
  }
  if ((metrics.repeatedStems || 0) >= 2 && (metrics.connectors || 0) <= 2) {
    evidence.push({ band: 'NA', kind: 'warn', text: 'Repeated sentence openings with little linking — a memorised-pattern signal raters penalise.', criterion: 'Authentic Voice' });
  }

  const risks = detectStructureRisks(source);
  const spliceCount = risks.filter((r) => r.id === 'commaSplice' || r.id === 'runOn').length;
  if (spliceCount >= 2) {
    evidence.push({ band: 'NA', kind: 'warn', text: 'Multiple run-on / comma-splice risks — major sentence structure problems are NA-level evidence.', criterion: 'Grammatical Range & Accuracy' });
  } else if (spliceCount === 1) {
    evidence.push({ band: 'D', kind: 'info', text: 'One long-sentence risk — trim or split it to stay clear of the NA threshold.', criterion: 'Grammatical Range & Accuracy' });
  }

  const coverage = metrics.coverage || {};
  if (coverage.total > 0 && coverage.ratio < 0.25) {
    evidence.push({ band: 'NA', kind: 'warn', text: 'Most prompt keywords missing — raters see this as not addressing all of the task.', criterion: 'Task Development' });
  } else if (coverage.total > 0 && coverage.ratio < 0.5) {
    evidence.push({ band: 'D', kind: 'info', text: 'Partial prompt coverage — develop the missing aspects to move from Doubts to Adequate.', criterion: 'Task Development' });
  }

  if ((metrics.paragraphs || 0) < 3 && wc >= 150) {
    evidence.push({ band: 'D', kind: 'info', text: 'Long text with few paragraphs — the scheme rewards separate paragraphs per aspect.', criterion: 'Organization & Coherence' });
  }
  if ((metrics.supportHits || 0) === 0 && wc >= 120) {
    evidence.push({ band: 'D', kind: 'info', text: 'No concrete support signals (examples, data, studies) — developed support separates A from D.', criterion: 'Task Development' });
  }
  if ((metrics.ttr || 0) < 0.4 && (metrics.repetition || 0) >= 3) {
    evidence.push({ band: 'D', kind: 'info', text: 'Narrow lexical range with repeated words — limited task-related vocabulary is a D-level marker.', criterion: 'Vocabulary Range' });
  }

  if (evidence.length === 0) {
    evidence.push({ band: 'A', kind: 'good', text: 'No critical rubric red flags detected — the draft is on track for the Adequate band.', criterion: 'Overall' });
  }
  return evidence.slice(0, 5);
}

/** What the next band up requires, verbatim-style from the scheme */
export function nextBandRequirements(currentCode = '') {
  const map = {
    E: { target: null, note: 'You are at the top band — maintain this standard across both exam essays.' },
    VG: { target: 'E', note: 'Add a confident personal stance and near-perfect sentence control; polish the last collocation slips.' },
    MA: { target: 'VG', note: 'Extend argumentation and support further; use complex structures with only occasional lapses.' },
    A: { target: 'MA', note: 'Move beyond simple-but-correct language: add one more developed example and complex structures.' },
    D: { target: 'A', note: 'A short Advanced English training is what raters prescribe — fix complex-sentence errors and extend the task vocabulary.' },
    NA: { target: 'D', note: 'Fix run-ons, word-order and S-V agreement first; make ideas follow each other logically.' },
    FBA: { target: 'NA', note: 'Address the task directly with identifiable paragraphs before anything else.' },
    INS: { target: 'NA', note: 'Write at least a full page (~250 words) to give raters something to evaluate.' },
    WN: { target: 'INS', note: 'Any text, even a few lines, moves you out of Wrote Nothing.' },
  };
  return map[String(currentCode || '').toUpperCase()] || map.A;
}
