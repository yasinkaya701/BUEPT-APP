import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';

const FALLBACK_LINKS = [
  { id: 'calendar', label: 'Academic Calendar', url: 'https://akademiktakvim.bogazici.edu.tr/en' },
  { id: 'yadyok', label: 'YADYOK', url: 'https://yadyok.bogazici.edu.tr/en' },
  { id: 'buept_info', label: 'BUEPT Info', url: 'https://yadyok.bogazici.edu.tr/en/pages/buept/2440' },
];

function normalizeUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export default function WebViewerScreen({ route }) {
  const webRef = useRef(null);
  const title = route?.params?.title || 'Resource';
  const initialUrl = useMemo(() => normalizeUrl(route?.params?.url), [route?.params?.url]);
  const externalPreferred = Boolean(route?.params?.externalPreferred);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [error, setError] = useState(null);
  const [externalOpened, setExternalOpened] = useState(false);

  useEffect(() => {
    setCurrentUrl(initialUrl);
    setError(null);
    setExternalOpened(false);
  }, [initialUrl]);

  useEffect(() => {
    if (!externalPreferred || !currentUrl || externalOpened) return;
    Linking.openURL(currentUrl).catch(() => {});
    setExternalOpened(true);
  }, [externalPreferred, currentUrl, externalOpened]);

  const openSafeLink = (url) => {
    setCurrentUrl(url);
    setError(null);
  };

  const retry = () => {
    setError(null);
    webRef.current?.reload?.();
  };

  if (!currentUrl) {
    return (
      <Screen contentStyle={styles.fallbackScreen}>
        <Card style={styles.fallbackCard}>
          <Text style={styles.h1}>{title}</Text>
          <Text style={styles.body}>No URL provided.</Text>
          <View style={styles.actions}>
            {FALLBACK_LINKS.map((item) => (
              <Button key={item.id} label={item.label} variant="secondary" onPress={() => openSafeLink(item.url)} />
            ))}
          </View>
        </Card>
      </Screen>
    );
  }

  if (externalPreferred) {
    return (
      <Screen contentStyle={styles.fallbackScreen}>
        <Card style={styles.fallbackCard}>
          <Text style={styles.h1}>{title}</Text>
          <Text style={styles.body}>
            This source works better in the device browser, so we open it externally to avoid broken embeds.
          </Text>
          <View style={styles.actions}>
            <Button label="Open in Browser" onPress={() => Linking.openURL(currentUrl).catch(() => {})} />
            {FALLBACK_LINKS.map((item) => (
              <Button key={item.id} label={item.label} variant="secondary" onPress={() => openSafeLink(item.url)} />
            ))}
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: currentUrl }}
        style={styles.web}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={colors.primaryDark} />
          </View>
        )}
        onError={(event) => {
          const desc = event?.nativeEvent?.description || 'Page could not be loaded.';
          setError({ kind: 'load', message: desc });
        }}
        onHttpError={(event) => {
          const status = Number(event?.nativeEvent?.statusCode || 0);
          const failedUrl = event?.nativeEvent?.url || currentUrl;
          if (status >= 400) {
            setError({
              kind: 'http',
              message: `HTTP ${status} at ${failedUrl}`,
            });
          }
        }}
      />

      {error ? (
        <View style={styles.overlay}>
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Page not reachable</Text>
            <Text style={styles.errorBody}>{error.message}</Text>
            <View style={styles.actions}>
              <Button label="Try Again" onPress={retry} />
              {FALLBACK_LINKS.map((item) => (
                <Button key={item.id} label={item.label} variant="secondary" onPress={() => openSafeLink(item.url)} />
              ))}
            </View>
          </Card>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  web: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.2)',
  },
  errorCard: {
    marginBottom: 0,
  },
  errorTitle: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  errorBody: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  fallbackScreen: {
    paddingBottom: spacing.xl,
  },
  fallbackCard: {
    marginBottom: 0,
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.xs,
  },
});
