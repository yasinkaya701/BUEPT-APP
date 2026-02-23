export function detectBasicErrors(text) {
  const issues = [];
  if (!text) return issues;

  // Missing space after period
  if (/\.[A-Za-z]/.test(text)) {
    issues.push('Possible missing space after a period (e.g., ".However").');
  }

  // Sentence starts with lowercase (very basic)
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    const first = trimmed[0];
    if (first && first === first.toLowerCase()) {
      issues.push('Some sentences start with a lowercase letter.');
      break;
    }
  }

  // Repeated spaces
  if (/\s{2,}/.test(text)) {
    issues.push('Multiple spaces detected. Consider single spacing.');
  }

  // Simple article + vowel heuristic (very rough)
  if (/\b(a)\s+[aeiouAEIOU]/.test(text)) {
    issues.push('Check article usage: "a" before vowel sounds may need "an".');
  }

  // Repeated word (immediate)
  if (/\b(\w+)\s+\1\b/i.test(text)) {
    issues.push('Repeated word detected (e.g., "the the").');
  }

  return issues;
}
