const React = require('react');
const { View } = require('react-native');

function LinearGradient(props) {
  const { children, style, ...rest } = props || {};
  return React.createElement(View, { style, ...rest }, children);
}

module.exports = LinearGradient;
module.exports.default = LinearGradient;
