function emptyStat() {
  return { attempted: 0, correct: 0, total: 0, accuracy: null };
}

function fromHistory(history = []) {
  const stat = emptyStat();
  history.forEach((item) => {
    const score = Number(item?.result?.score || 0);
    const total = Number(item?.result?.total || 0);
    if (!total) return;
    stat.attempted += 1;
    stat.correct += score;
    stat.total += total;
  });
  stat.accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
  return stat;
}

function writingStat(history = []) {
  const stat = emptyStat();
  history.forEach((item) => {
    const total = Number(item?.report?.rubric?.Total || 0);
    if (!total) return;
    stat.attempted += 1;
    stat.correct += total;
    stat.total += 20;
  });
  stat.accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
  return stat;
}

function rankWeakModules(stats) {
  const modules = Object.entries(stats).map(([key, value]) => ({
    key,
    attempted: value.attempted,
    accuracy: value.accuracy == null ? 100 : value.accuracy
  }));
  return modules.sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return b.attempted - a.attempted;
  });
}

function vocabTarget(level = 'P2') {
  if (level === 'P1') return '8 new words + 8 review';
  if (level === 'P2') return '10 new words + 10 review';
  if (level === 'P3') return '12 new words + 12 review';
  return '15 new words + 15 review';
}

function writingTarget(level = 'P2') {
  if (level === 'P1') return '1 short paragraph';
  if (level === 'P2') return '1 paragraph';
  if (level === 'P3') return '1 paragraph + 1 rewrite';
  return '1 full essay + revision';
}

export function buildDailyPlan(level = 'P2') {
  return {
    listening: '1 listening set (10 questions)',
    reading: '1 reading set (10 questions)',
    writing: writingTarget(level),
    grammar: '1 grammar drill (10 questions)',
    vocab: vocabTarget(level)
  };
}

export function buildAdaptivePlan({
  level = 'P2',
  readingHistory = [],
  listeningHistory = [],
  grammarHistory = [],
  writingHistory = []
} = {}) {
  const stats = {
    reading: fromHistory(readingHistory),
    listening: fromHistory(listeningHistory),
    grammar: fromHistory(grammarHistory),
    writing: writingStat(writingHistory)
  };
  const ranked = rankWeakModules(stats);
  const weakest = ranked[0]?.key || 'writing';
  const secondary = ranked[1]?.key || 'reading';
  const focusTitles = {
    reading: 'Reading focus',
    listening: 'Listening focus',
    grammar: 'Grammar focus',
    writing: 'Writing focus'
  };
  const focusActions = {
    reading: 'Solve 2 reading sets, then review wrong answers.',
    listening: 'Solve 2 listening sets and replay transcript with notes.',
    grammar: 'Solve 2 grammar drills and review explanations.',
    writing: 'Write one task and complete one revised version.'
  };

  return {
    stats,
    weakest,
    secondary,
    focusTitle: focusTitles[weakest],
    focusAction: focusActions[weakest],
    daily: {
      ...buildDailyPlan(level),
      priority1: `${focusTitles[weakest]}: ${focusActions[weakest]}`,
      priority2: `${focusTitles[secondary]}: ${focusActions[secondary]}`
    }
  };
}

export function buildRecommendedTask(tasks = [], history = [], preferredLevel = 'P2') {
  const byId = {};
  history.forEach((item) => {
    const taskId = item?.result?.taskId;
    if (!taskId) return;
    const score = Number(item?.result?.score || 0);
    const total = Number(item?.result?.total || 0);
    if (!total) return;
    byId[taskId] = {
      taskId,
      score,
      total,
      accuracy: Math.round((score / total) * 100),
      createdAt: item?.createdAt || ''
    };
  });

  const attempted = tasks
    .map((t) => ({ task: t, perf: byId[t.id] }))
    .filter((x) => x.perf);
  const weakAttempt = attempted
    .filter((x) => x.perf.accuracy < 70)
    .sort((a, b) => a.perf.accuracy - b.perf.accuracy)[0];
  if (weakAttempt) {
    return {
      task: weakAttempt.task,
      reason: `Retry suggested (${weakAttempt.perf.accuracy}% last score)`
    };
  }

  const freshSameLevel = tasks.find((t) => t.level === preferredLevel && !byId[t.id]);
  if (freshSameLevel) {
    return {
      task: freshSameLevel,
      reason: `New ${preferredLevel} task`
    };
  }

  const freshAny = tasks.find((t) => !byId[t.id]);
  if (freshAny) {
    return {
      task: freshAny,
      reason: 'New task based on progress'
    };
  }

  if (tasks[0]) {
    return {
      task: tasks[0],
      reason: 'Review cycle restart'
    };
  }
  return null;
}
