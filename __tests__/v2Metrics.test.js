import {
  averageHistory,
  computeReadiness,
  latestHistoryPercent,
  readinessLabel,
  resultPercent,
  weakestSkill,
} from '../src/utils/v2Metrics';

describe('v2Metrics', () => {
  test('normalizes result shapes', () => {
    expect(resultPercent({ score: 7, total: 10 })).toBe(70);
    expect(resultPercent({ overall: 82.4 })).toBe(82);
    expect(resultPercent({ percent: 91 })).toBe(91);
  });

  test('averages only valid histories', () => {
    expect(averageHistory([{ result: { score: 5, total: 10 } }, { result: { score: 9, total: 10 } }])).toBe(70);
    expect(latestHistoryPercent([{ result: { score: 8, total: 10 } }])).toBe(80);
  });

  test('computes readiness and labels it', () => {
    const readiness = computeReadiness({ reading: 70, listening: 60, grammar: 80, mock: 75 });
    expect(readiness).toBeGreaterThan(60);
    expect(readinessLabel(70)).toBe('On track');
  });

  test('finds weakest measured skill', () => {
    expect(weakestSkill([{ key: 'reading', score: 72 }, { key: 'writing', score: 55 }]).key).toBe('writing');
  });
});
