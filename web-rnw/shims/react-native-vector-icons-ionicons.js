const React = require('react');
const { Text } = require('react-native');

const MAP = {
  add: '+',
  'add-circle': '+',
  alert: '⚠',
  'alert-circle': '⚠',
  analytics: '📈',
  archive: '🗄',
  'arrow-back': '←',
  'arrow-forward': '→',
  'arrow-down': '↓',
  'arrow-up': '↑',
  attach: '📎',
  bar: '📊',
  bookmark: '🔖',
  book: '📖',
  briefcase: '💼',
  bug: '🐞',
  calendar: '📅',
  camera: '📷',
  chat: '💬',
  check: '✓',
  chevron: '›',
  close: '✕',
  cloud: '☁',
  code: '</>',
  compass: '🧭',
  copy: '⧉',
  create: '✍',
  document: '📄',
  download: '⬇',
  ellipsis: '⋯',
  eye: '👁',
  filter: '⟂',
  flame: '🔥',
  flash: '⚡',
  folder: '📁',
  funnel: '⏳',
  game: '🎮',
  globe: '🌐',
  grid: '▦',
  hammer: '🔨',
  happy: '🙂',
  headset: '🎧',
  heart: '♥',
  help: '?',
  home: '⌂',
  image: '🖼',
  information: 'ℹ',
  key: '🔑',
  language: '🌍',
  library: '📚',
  link: '🔗',
  list: '☰',
  location: '📍',
  lock: '🔒',
  log: '📋',
  mail: '✉',
  menu: '☰',
  mic: '🎤',
  moon: '☾',
  musical: '♪',
  open: '↗',
  pause: '⏸',
  people: '👥',
  person: '👤',
  play: '▶',
  print: '🖨',
  refresh: '↻',
  remove: '−',
  repeat: '↺',
  rocket: '🚀',
  school: '🎓',
  search: '⌕',
  settings: '⚙',
  share: '⇪',
  sparkles: '✨',
  speedometer: '⏱',
  star: '★',
  stop: '■',
  sync: '⇄',
  time: '⏰',
  trash: '🗑',
  trophy: '🏆',
  unlock: '🔓',
  videocam: '🎥',
  volume: '🔊',
  warning: '⚠',
};

function resolveGlyph(name = '') {
  const raw = String(name || '').toLowerCase();
  if (!raw) return '•';
  const compact = raw.replace(/-outline|-sharp|-circle|-half|-off|-small|-large/g, '');

  if (MAP[raw]) return MAP[raw];
  if (MAP[compact]) return MAP[compact];

  const foundKey = Object.keys(MAP).find((key) => compact.includes(key));
  if (foundKey) return MAP[foundKey];
  return '•';
}

function Ionicons(props) {
  const glyph = resolveGlyph(props?.name);
  const size = Number(props?.size || 16);
  const color = props?.color || '#0f172a';
  return React.createElement(Text, { style: [{ fontSize: size, color }, props?.style] }, glyph);
}

module.exports = Ionicons;
module.exports.default = Ionicons;
