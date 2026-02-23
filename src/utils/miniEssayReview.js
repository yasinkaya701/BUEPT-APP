import { buildYS9Report, countWords } from './ys9Mock';
import { buildInlineMarkedText, parseMarkedText } from './highlightBasic';

export function buildMiniEssayReview(text, level = 'P2') {
  const words = countWords(text);
  const report = buildYS9Report(text, 'general', level);
  const inlineMarked = buildInlineMarkedText(text);
  const inlineSegments = parseMarkedText(inlineMarked);
  const band = report?.writing9_style?.band || '—';
  const top3 = (report?.issues || []).slice(0, 3);
  const positives = (report?.strengths || []).slice(0, 2);
  return {
    words,
    band,
    positives,
    top3,
    revised: report?.revised || '',
    checklist: report?.criteria_flags || null,
    inlineSegments
  };
}
