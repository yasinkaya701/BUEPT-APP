import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';

export default function WebViewerScreen({ route }) {
  const url = route?.params?.url;
  const title = route?.params?.title || 'Resource';

  if (!url) {
    return (
      <Screen contentStyle={styles.container}>
        <Text style={styles.h1}>{title}</Text>
        <Text style={styles.body}>No URL provided.</Text>
      </Screen>
    );
  }

  return (
    <WebView source={{ uri: url }} />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody
  }
});
