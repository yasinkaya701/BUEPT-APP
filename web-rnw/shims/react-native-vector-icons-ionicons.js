const React = require('react');
const { Text } = require('react-native');

const MAP = {
  'book-outline': '📖',
  'headset-outline': '🎧',
  'create-outline': '✍️',
  'flash-outline': '⚡',
  'school-outline': '🏫',
  'chatbubble-ellipses-outline': '💬',
  'calendar-outline': '📅',
  'sparkles-outline': '✨',
  'bar-chart-outline': '📊',
  'library-outline': '📚',
  'mic-outline': '🎤',
  'people-outline': '👥',
  'analytics-outline': '📈',
  'document-text-outline': '📝',
  'arrow-forward': '→',
  'arrow-back': '←',
  'close': '✕',
  'play': '▶',
  'pause': '⏸',
};

function Ionicons(props) {
  const glyph = MAP[props?.name] || '•';
  const size = Number(props?.size || 16);
  const color = props?.color || '#0f172a';
  return React.createElement(Text, { style: [{ fontSize: size, color }, props?.style] }, glyph);
}

module.exports = Ionicons;
module.exports.default = Ionicons;
