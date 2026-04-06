const React = require('react');
const { View, StyleSheet } = require('react-native');

function clamp01(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function computeAngle(start, end) {
  const sx = clamp01(start?.x, 0);
  const sy = clamp01(start?.y, 0);
  const ex = clamp01(end?.x, 0);
  const ey = clamp01(end?.y, 1);
  const rad = Math.atan2(ey - sy, ex - sx);
  return ((rad * 180) / Math.PI) + 90;
}

function LinearGradient(props) {
  const { children, style, colors = [], start, end, ...rest } = props || {};
  const flat = StyleSheet.flatten(style) || {};
  const list = Array.isArray(colors) ? colors.filter(Boolean) : [];
  const angle = computeAngle(start, end);

  let gradientStyle = {};
  if (list.length >= 2) {
    gradientStyle = {
      backgroundImage: `linear-gradient(${angle}deg, ${list.join(', ')})`,
      backgroundColor: list[0],
    };
  } else if (list.length === 1) {
    gradientStyle = { backgroundColor: list[0] };
  }

  return React.createElement(
    View,
    { style: [flat, gradientStyle], ...rest },
    children
  );
}

module.exports = LinearGradient;
module.exports.default = LinearGradient;
