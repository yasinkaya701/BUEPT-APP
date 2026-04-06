const React = require('react');
const { View, Text, ActivityIndicator, StyleSheet } = require('react-native');

function bridgeId() {
  return `rnw_webview_${Math.random().toString(36).slice(2)}`;
}

function toMessagePayload(data) {
  return {
    nativeEvent: {
      data: typeof data === 'string' ? data : JSON.stringify(data),
    },
  };
}

function buildSrcDoc(html, id, injectedJavaScript) {
  const bridge = `
<script>
window.ReactNativeWebView = {
  postMessage: function(payload) {
    try {
      window.parent.postMessage({ __RNW_WEBVIEW__: true, id: '${id}', data: String(payload || '') }, '*');
    } catch (_) {}
  }
};
</script>
`;

  const injected = injectedJavaScript
    ? `<script>(function(){ try { ${String(injectedJavaScript)} } catch(_){} })();</script>`
    : '';

  return `${bridge}${String(html || '')}${injected}`;
}

const WebViewImpl = React.forwardRef(function WebView(props, ref) {
  const {
    source = {},
    style,
    onMessage,
    onError,
    onLoadStart,
    onLoadEnd,
    startInLoadingState,
    renderLoading,
    injectedJavaScript,
    title = 'webview-frame',
  } = props || {};

  const frameRef = React.useRef(null);
  const [loading, setLoading] = React.useState(!!startInLoadingState);
  const [reloadKey, setReloadKey] = React.useState(0);
  const idRef = React.useRef(bridgeId());
  const srcDoc = typeof source?.html === 'string'
    ? buildSrcDoc(source.html, idRef.current, injectedJavaScript)
    : '';
  const uri = typeof source?.uri === 'string' ? source.uri : '';

  React.useEffect(() => {
    if (!uri && !srcDoc) return;
    setLoading(!!startInLoadingState);
    if (typeof onLoadStart === 'function') onLoadStart({});
  }, [uri, srcDoc, reloadKey, startInLoadingState, onLoadStart]);

  React.useEffect(() => {
    function handleWindowMessage(event) {
      const payload = event?.data;
      if (!payload || payload.__RNW_WEBVIEW__ !== true || payload.id !== idRef.current) return;
      if (typeof onMessage === 'function') onMessage(toMessagePayload(payload.data));
    }
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onMessage]);

  React.useImperativeHandle(ref, () => ({
    injectJavaScript: (script) => {
      const frame = frameRef.current;
      if (!frame) return;
      try {
        const win = frame.contentWindow;
        if (win && typeof win.eval === 'function') {
          win.eval(String(script || ''));
        }
      } catch (_) {
        // Cross-origin frames cannot be scripted; ignore.
      }
    },
    reload: () => {
      const frame = frameRef.current;
      if (!frame) return;
      try {
        frame.contentWindow?.location?.reload?.();
      } catch (_) {
        setReloadKey((prev) => prev + 1);
      }
    },
    goBack: () => {
      try {
        frameRef.current?.contentWindow?.history?.back?.();
      } catch (_) {
        // ignore
      }
    },
    goForward: () => {
      try {
        frameRef.current?.contentWindow?.history?.forward?.();
      } catch (_) {
        // ignore
      }
    },
    stopLoading: () => {
      try {
        frameRef.current?.contentWindow?.stop?.();
      } catch (_) {
        // ignore
      }
    },
  }), []);

  const frameStyle = StyleSheet.flatten([
    { borderWidth: 0, width: '100%', height: '100%', minHeight: 280 },
    style,
  ]);

  const hasContent = !!uri || !!srcDoc;

  if (!hasContent) {
    return React.createElement(
      View,
      { style: [styles.placeholder, style] },
      React.createElement(Text, { style: styles.placeholderText }, 'Web content unavailable.')
    );
  }

  return React.createElement(
    View,
    { style: [styles.wrap, style] },
    loading
      ? (
        typeof renderLoading === 'function'
          ? renderLoading()
          : React.createElement(
            View,
            { style: styles.loader },
            React.createElement(ActivityIndicator, { size: 'small' })
          )
      )
      : null,
    React.createElement('iframe', {
      key: reloadKey,
      ref: frameRef,
      title,
      src: uri || undefined,
      srcDoc: srcDoc || undefined,
      style: {
        border: '0',
        width: '100%',
        height: '100%',
        minHeight: Number(frameStyle?.minHeight || 280),
        opacity: loading ? 0 : 1,
      },
      allow: 'autoplay; microphone; clipboard-read; clipboard-write',
      onLoad: () => {
        if (typeof onLoadEnd === 'function') onLoadEnd({});
        setLoading(false);
      },
      onError: (evt) => {
        setLoading(false);
        if (typeof onError === 'function') {
          onError({
            nativeEvent: {
              description: 'Failed to load frame',
              url: uri,
              target: evt?.target || null,
            },
          });
        }
      },
    }),
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    minHeight: 280,
  },
  loader: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 2,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    padding: 16,
  },
  placeholderText: {
    color: '#475569',
    fontSize: 14,
  },
});

module.exports = { WebView: WebViewImpl };
module.exports.default = { WebView: WebViewImpl };
