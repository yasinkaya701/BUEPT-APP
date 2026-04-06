const React = require('react');
const { View, Text } = require('react-native');

function WebView(props) {
  const source = props?.source || {};
  const uri = typeof source.uri === 'string' ? source.uri : '';

  if (!uri) {
    return React.createElement(
      View,
      { style: [{ alignItems: 'center', justifyContent: 'center', padding: 16 }, props?.style] },
      React.createElement(Text, null, 'Web content unavailable.'),
    );
  }

  return React.createElement('iframe', {
    src: uri,
    title: props?.title || 'webview-frame',
    style: {
      border: '0',
      width: '100%',
      height: '100%',
      minHeight: '320px',
      ...(props?.style || {}),
    },
    allow: 'clipboard-read; clipboard-write',
  });
}

module.exports = { WebView };
module.exports.default = { WebView };
