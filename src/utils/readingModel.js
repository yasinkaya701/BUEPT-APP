function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toWords(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function evaluateReadingModel({
  task = null,
  answers = {},
  evidenceNote = '',
  paragraphStatus = {},
  scanChecked = false,
  scanPick = null,
  scanTarget = null,
} = {}) {
  const questions = Array.isArray(task?.questions) ? task.questions : [];
  const total = questions.length;
  let correct = 0;
  let clozeCorrect = 0;
  let clozeTotal = 0;

  questions.forEach((q, i) => {
    const hit = answers[i] === q.answer;
    if (hit) correct += 1;
    const isCloze = q.type === 'cloze';
    if (isCloze) {
      clozeTotal += 1;
      if (hit) clozeCorrect += 1;
    }
  });

  const comprehension = total ? Math.round((correct / total) * 100) : 0;
  const cloze = clozeTotal ? Math.round((clozeCorrect / clozeTotal) * 100) : comprehension;
  const evidence = (() => {
    const words = toWords(evidenceNote);
    if (!words.length) return 0;
    const keyHints = ['because', 'therefore', 'evidence', 'line', 'paragraph', 'according', 'shows', 'indicates'];
    const hits = keyHints.filter((k) => words.includes(k)).length;
    return clamp(Math.round((hits / keyHints.length) * 100) + Math.min(30, words.length), 0, 100);
  })();
  const paragraphMap = (() => {
    const values = Object.values(paragraphStatus || {});
    if (!values.length) return 50;
    const clear = values.filter((v) => v === 'clear').length;
    return Math.round((clear / values.length) * 100);
  })();
  const scanning = scanChecked
    ? (scanTarget && scanPick === scanTarget.paragraphIndex ? 100 : 35)
    : 50;

  const dimensions = {
    comprehension,
    clozeAccuracy: cloze,
    evidenceUse: evidence,
    paragraphMapping: paragraphMap,
    scanningSpeed: scanning,
  };

  const overall = clamp(Math.round(
    (dimensions.comprehension * 0.4) +
    (dimensions.clozeAccuracy * 0.2) +
    (dimensions.evidenceUse * 0.2) +
    (dimensions.paragraphMapping * 0.1) +
    (dimensions.scanningSpeed * 0.1)
  ), 0, 100);

  const band = overall >= 85 ? 'Strong B2' : overall >= 70 ? 'Developing B2' : overall >= 55 ? 'Strong B1' : 'Developing B1';

  const weaknesses = [];
  if (dimensions.comprehension < 65) weaknesses.push('Evidence-based comprehension');
  if (dimensions.clozeAccuracy < 65) weaknesses.push('Cloze/context accuracy');
  if (dimensions.evidenceUse < 55) weaknesses.push('Evidence note quality');
  if (dimensions.paragraphMapping < 60) weaknesses.push('Paragraph main-idea mapping');
  if (dimensions.scanningSpeed < 60) weaknesses.push('Scanning speed');

  const actions = [];
  if (dimensions.comprehension < 65) actions.push('Locate and mark one supporting sentence before answering each question.');
  if (dimensions.clozeAccuracy < 65) actions.push('Use grammar + collocation around blanks to eliminate implausible options.');
  if (dimensions.evidenceUse < 55) actions.push('Write short note format: claim + evidence line + why it supports your choice.');
  if (dimensions.paragraphMapping < 60) actions.push('After each paragraph, write a 6-8 word main idea label.');
  if (dimensions.scanningSpeed < 60) actions.push('Run 2 scanning drills focusing only on keyword location time.');
  if (!actions.length) actions.push('Move to harder texts and keep the same evidence-first routine.');

  return {
    overall,
    band,
    dimensions,
    weaknesses,
    actions,
  };
}

export function buildReadingSnapshot({ accuracy = 0, clozePct = 0, compPct = 0, weeklyPct = 0 } = {}) {
  const safeAcc = clamp(Number(accuracy || 0), 0, 100);
  const safeCloze = clamp(Number(clozePct ?? safeAcc), 0, 100);
  const safeComp = clamp(Number(compPct ?? safeAcc), 0, 100);
  const safeWeekly = clamp(Number(weeklyPct || 0), 0, 100);
  const overall = clamp(Math.round((safeAcc * 0.55) + (Math.min(safeCloze, safeComp) * 0.25) + (safeWeekly * 0.2)), 0, 100);
  const band = overall >= 80 ? 'Strong B2' : overall >= 65 ? 'Developing B2' : overall >= 50 ? 'Strong B1' : 'Developing B1';
  return { overall, band };
}
