export function buildInlineMarkedText(text) {
  if (!text) return '';
  let marked = text;

  // Missing space after period
  marked = marked.replace(/\.([A-Za-z])/g, '. [SPACE]$1');

  // Double spaces
  marked = marked.replace(/\s{2,}/g, ' [DOUBLE_SPACE] ');

  // Immediate repeated word
  marked = marked.replace(/\b(\w+)\s+\1\b/gi, '$1 [REPEAT] $1');

  return marked;
}

export function parseMarkedText(marked) {
  if (!marked) return [];
  const tokens = marked.split(/(\[SPACE\]|\[DOUBLE_SPACE\]|\[REPEAT\])/g).filter(Boolean);
  return tokens.map((t) => {
    if (t === '[SPACE]') return { type: 'space', text: '⟂' };
    if (t === '[DOUBLE_SPACE]') return { type: 'double_space', text: '␣␣' };
    if (t === '[REPEAT]') return { type: 'repeat', text: '⟲' };
    return { type: 'text', text: t };
  });
}
