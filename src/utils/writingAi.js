import { buildYS9Report, countWords } from './ys9Mock';

export function buildWritingAiTips(text, type = 'general', level = 'P2') {
  const report = buildYS9Report(text || '', type, level);
  const words = countWords(text || '');
  const tips = [];

  if (words < 120) tips.push('Increase length: add one example or explanation in each body paragraph.');
  if ((report.error_summary?.sv || 0) > 0) tips.push('Review subject–verb agreement in each sentence.');
  if ((report.error_summary?.ww || 0) > 0) tips.push('Replace vague words with precise academic vocabulary.');
  if (!/\b(in conclusion|to sum up|overall|in summary)\b/i.test(text || '')) tips.push('Add a clear conclusion signal in the final paragraph.');
  if (!/\b(for example|for instance|such as)\b/i.test(text || '')) tips.push('Include at least one concrete example.');

  return {
    tips: tips.length ? tips : ['Writing looks solid. Focus on clarity and cohesion.'],
    report
  };
}
