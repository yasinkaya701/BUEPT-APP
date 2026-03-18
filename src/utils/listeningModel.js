function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'because', 'while', 'although', 'so', 'of', 'to', 'in', 'on', 'at',
  'for', 'from', 'by', 'with', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'that', 'this', 'these',
  'those', 'it', 'its', 'they', 'them', 'their', 'he', 'she', 'his', 'her', 'we', 'our', 'you', 'your', 'i', 'my',
  'me', 'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must',
  'not', 'no', 'yes', 'than', 'then', 'there', 'here', 'about', 'into', 'over', 'after', 'before', 'during', 'also',
  'very', 'more', 'most', 'such', 'only', 'just', 'some', 'any', 'many', 'much', 'each', 'other', 'another', 'which',
  'what', 'who', 'whom', 'when', 'where', 'why', 'how', 'according', 'following', 'main', 'idea', 'detail', 'speaker',
  'lecture', 'student', 'professor', 'talk', 'question', 'option', 'statement', 'mentioned', 'says', 'said'
]);

function toWords(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function toContentWords(text = '') {
  return toWords(text).filter((word) => word.length >= 4 && !STOPWORDS.has(word));
}

function normalizeSkill(skill = '') {
  const lower = String(skill || '').toLowerCase().replace(/\s+/g, '_');
  if (lower.includes('main_idea') || lower.includes('summary')) return 'gist';
  if (lower.includes('inference') || lower.includes('tone') || lower.includes('purpose') || lower.includes('function')) return 'inference';
  if (lower.includes('vocabulary')) return 'vocabulary';
  if (lower.includes('detail') || lower.includes('not_stated')) return 'detail';
  return 'detail';
}

export function deriveListeningKeywords(task = null) {
  const transcriptWords = toContentWords(task?.transcript || '');
  const counts = new Map();
  transcriptWords.forEach((word) => {
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  const questionWords = [];
  (task?.questions || []).forEach((question) => {
    questionWords.push(...toContentWords(question?.q || ''));
    (question?.options || []).forEach((option) => {
      questionWords.push(...toContentWords(option));
    });
  });

  questionWords.forEach((word) => {
    counts.set(word, (counts.get(word) || 0) + 2);
  });

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([word]) => word)
    .slice(0, 12);
}

function buildSkillScores(task = null, answers = {}) {
  const buckets = {
    detail: { correct: 0, total: 0 },
    gist: { correct: 0, total: 0 },
    inference: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
  };

  (task?.questions || []).forEach((question, index) => {
    const bucket = normalizeSkill(question?.skill);
    const hit = answers[index] === question.answer;
    buckets[bucket].total += 1;
    if (hit) buckets[bucket].correct += 1;
  });

  return Object.fromEntries(
    Object.entries(buckets).map(([key, value]) => {
      const score = value.total ? Math.round((value.correct / value.total) * 100) : null;
      return [key, { ...value, score }];
    })
  );
}

function scoreNoteQuality(task = null, noteText = '', derivedKeywords = []) {
  const noteWords = toContentWords(noteText);
  if (!noteWords.length) {
    return {
      score: 18,
      keywordHits: 0,
      keywordTarget: derivedKeywords.length,
      noteDensity: 0,
      noteHits: [],
    };
  }

  const uniqueNoteWords = Array.from(new Set(noteWords));
  const keywordHits = derivedKeywords.filter((keyword) => uniqueNoteWords.includes(keyword));
  const keywordCoverage = derivedKeywords.length
    ? Math.round((keywordHits.length / derivedKeywords.length) * 100)
    : 55;

  const transcriptOverlapBase = Array.from(new Set(toContentWords(task?.transcript || '')));
  const transcriptHits = transcriptOverlapBase.filter((word) => uniqueNoteWords.includes(word)).length;
  const transcriptCoverage = transcriptOverlapBase.length
    ? Math.round((transcriptHits / Math.min(18, transcriptOverlapBase.length)) * 100)
    : 55;

  const noteDensity = Math.min(100, Math.round((uniqueNoteWords.length / 18) * 100));
  const score = clamp(
    Math.round((keywordCoverage * 0.45) + (transcriptCoverage * 0.3) + (noteDensity * 0.25)),
    0,
    100
  );

  return {
    score,
    keywordHits: keywordHits.length,
    keywordTarget: derivedKeywords.length,
    noteDensity,
    noteHits: keywordHits.slice(0, 8),
  };
}

function scoreSignpostAwareness(signposts = [], noteText = '') {
  const transcriptSignals = Array.isArray(signposts) ? signposts : [];
  if (!transcriptSignals.length) {
    return { score: 65, transcriptCount: 0, noteHits: 0, matched: [] };
  }
  const lowerNotes = String(noteText || '').toLowerCase();
  const matched = transcriptSignals.filter((signal) => lowerNotes.includes(String(signal).toLowerCase()));
  const coverage = Math.round((matched.length / transcriptSignals.length) * 100);
  return {
    score: clamp(Math.round((coverage * 0.8) + (Math.min(transcriptSignals.length, 5) * 4)), 0, 100),
    transcriptCount: transcriptSignals.length,
    noteHits: matched.length,
    matched,
  };
}

function buildDictationScore(dictationResult = null, answerAccuracy = 0) {
  if (Number.isFinite(Number(dictationResult?.score))) {
    return clamp(Number(dictationResult.score), 0, 100);
  }
  return clamp(Math.round((answerAccuracy * 0.6) + 20), 45, 78);
}

function labelWeakness(key) {
  return key === 'comprehension'
    ? 'Overall comprehension'
    : key === 'detailTracking'
      ? 'Detail tracking'
      : key === 'gistTracking'
        ? 'Main idea tracking'
        : key === 'inferenceControl'
          ? 'Inference and tone'
          : key === 'noteTaking'
            ? 'Note-taking quality'
            : key === 'signpostAwareness'
              ? 'Signpost awareness'
              : 'Dictation precision';
}

export function evaluateListeningModel({
  task = null,
  answers = {},
  noteText = '',
  dictationResult = null,
  signposts = [],
} = {}) {
  const questions = Array.isArray(task?.questions) ? task.questions : [];
  const total = questions.length;
  let correct = 0;

  questions.forEach((question, index) => {
    if (answers[index] === question.answer) correct += 1;
  });

  const answerAccuracy = total ? Math.round((correct / total) * 100) : 0;
  const skillScores = buildSkillScores(task, answers);
  const derivedKeywords = deriveListeningKeywords(task);
  const noteQuality = scoreNoteQuality(task, noteText, derivedKeywords);
  const signpostAwareness = scoreSignpostAwareness(signposts, noteText);
  const dictationScore = buildDictationScore(dictationResult, answerAccuracy);
  const detailTracking = skillScores.detail.score ?? answerAccuracy;
  const gistTracking = skillScores.gist.score ?? answerAccuracy;
  const inferenceControl = Math.round(
    [skillScores.inference.score, skillScores.vocabulary.score]
      .filter((value) => value != null)
      .reduce((sum, value, _, arr) => sum + value / arr.length, 0)
  ) || answerAccuracy;

  const dimensions = {
    comprehension: answerAccuracy,
    detailTracking,
    gistTracking,
    inferenceControl,
    noteTaking: noteQuality.score,
    signpostAwareness: signpostAwareness.score,
    dictationPrecision: dictationScore,
  };

  const overall = clamp(
    Math.round(
      (dimensions.comprehension * 0.34) +
      (dimensions.detailTracking * 0.17) +
      (dimensions.gistTracking * 0.13) +
      (dimensions.inferenceControl * 0.11) +
      (dimensions.noteTaking * 0.13) +
      (dimensions.signpostAwareness * 0.05) +
      (dimensions.dictationPrecision * 0.07)
    ),
    0,
    100
  );

  const band = overall >= 85 ? 'Strong B2' : overall >= 70 ? 'Developing B2' : overall >= 55 ? 'Strong B1' : 'Developing B1';

  const weaknesses = Object.entries(dimensions)
    .filter(([, value]) => value < 65)
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => labelWeakness(key));

  const strongest = Object.entries(dimensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => labelWeakness(key));

  const actions = [];
  if (dimensions.detailTracking < 65) actions.push('Replay at 0.6x and capture only numbers, names, qualifiers, and evidence words.');
  if (dimensions.gistTracking < 65) actions.push('On the first listen, write one 8-word summary sentence for each paragraph before looking at options.');
  if (dimensions.inferenceControl < 65) actions.push('For tone and inference questions, underline attitude words and contrast markers before choosing.');
  if (dimensions.noteTaking < 60) actions.push(`Aim to capture at least 5 of these key terms next time: ${derivedKeywords.slice(0, 5).join(', ')}.`);
  if (dimensions.signpostAwareness < 60) actions.push('Write transition words such as however, therefore, and for example in the margin during playback.');
  if (dimensions.dictationPrecision < 65) actions.push('Do one extra dictation round after the quiz and compare missing function words carefully.');
  if (!actions.length) actions.push('Move to a harder lecture and keep the same note-taking structure under time pressure.');

  const insights = [];
  if (skillScores.gist.score != null && skillScores.detail.score != null) {
    if (skillScores.gist.score >= skillScores.detail.score + 15) {
      insights.push('You understand the main message better than fine detail. Shift practice toward precise evidence capture.');
    } else if (skillScores.detail.score >= skillScores.gist.score + 15) {
      insights.push('You catch detail better than the global idea. Start each listening with a one-line summary before answering.');
    }
  }
  if (noteQuality.keywordTarget) {
    insights.push(`Notes captured ${noteQuality.keywordHits}/${noteQuality.keywordTarget} high-value terms from the lecture.`);
  }
  if (signpostAwareness.transcriptCount) {
    insights.push(`You noted ${signpostAwareness.noteHits}/${signpostAwareness.transcriptCount} structural signposts from the transcript.`);
  }

  const weakestDimension = Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0] || null;

  return {
    overall,
    band,
    dimensions,
    weaknesses,
    strongest,
    actions,
    insights,
    weakestDimension: weakestDimension ? { key: weakestDimension[0], label: labelWeakness(weakestDimension[0]), score: weakestDimension[1] } : null,
    derivedKeywords,
    skillBreakdown: skillScores,
    noteQuality,
    signpost: signpostAwareness,
  };
}
