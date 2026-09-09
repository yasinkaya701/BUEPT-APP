export function resultPercent(result = null) {
  if (!result || typeof result !== 'object') return null;

  const overall = Number(result.overall);
  if (Number.isFinite(overall)) {
    return Math.max(0, Math.min(100, Math.round(overall)));
  }

  const score = Number(result.score);
  const total = Number(result.total);
  if (Number.isFinite(score) && Number.isFinite(total) && total > 0) {
    return Math.max(0, Math.min(100, Math.round((score / total) * 100)));
  }

  const pct = Number(result.percent ?? result.percentage);
  if (Number.isFinite(pct)) return Math.max(0, Math.min(100, Math.round(pct)));
  return null;
}

export function averageHistory(history = []) {
  const values = (Array.isArray(history) ? history : [])
    .map((item) => resultPercent(item?.result || item))
    .filter((value) => value !== null);
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function latestHistoryPercent(history = []) {
  const list = Array.isArray(history) ? history : [];
  if (!list.length) return null;
  return resultPercent(list[0]?.result || list[0]);
}

export function computeReadiness({
  reading = null,
  listening = null,
  grammar = null,
  writing = null,
  mock = null,
} = {}) {
  const weighted = [
    [reading, 1],
    [listening, 1],
    [grammar, 0.8],
    [writing, 1.2],
    [mock, 1.4],
  ].filter(([value]) => Number.isFinite(value));

  if (!weighted.length) return 0;
  const totalWeight = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  return Math.round(weighted.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight);
}

export function readinessLabel(value = 0) {
  const score = Number(value) || 0;
  if (score >= 80) return 'Strong';
  if (score >= 65) return 'On track';
  if (score >= 45) return 'Building';
  return 'Starting';
}

export function weakestSkill(skills = []) {
  return (Array.isArray(skills) ? skills : [])
    .filter((item) => Number.isFinite(item?.score))
    .sort((a, b) => a.score - b.score)[0] || null;
}
