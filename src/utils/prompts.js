import prompts from '../../data/writing_prompts.json';
import meta from '../../data/prompt_meta.json';

function seededIndex(length, seed) {
  if (!length) return 0;
  if (seed === null || seed === undefined) return Math.floor(Math.random() * length);
  const x = Math.abs(Math.sin(seed + length) * 10000);
  return Math.floor(x) % length;
}

export function getPromptForLevel(level = 'P2', type = null, task = null, difficulty = null, topic = null, seed = null) {
  let list = prompts.filter((p) => p.level === level);
  if (type) list = list.filter((p) => p.type === type);
  if (task) list = list.filter((p) => p.task === task);
  if (difficulty) list = list.filter((p) => (meta.difficulty[p.level] || 'medium') === difficulty);
  if (topic) list = list.filter((p) => (p.keywords || []).includes(topic));
  if (!list.length) return { prompt: 'Write a short paragraph about your topic.', type: 'opinion', task: 'paragraph', estMin: 15, difficulty: 'easy' };
  const item = list[seededIndex(list.length, seed)];
  return { ...item, estMin: item.task === 'essay' ? 40 : 20, difficulty: meta.difficulty[level] || 'medium' };
}
