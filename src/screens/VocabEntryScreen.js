import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, InteractionManager } from 'react-native';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';

export default function VocabEntryScreen(props) {
  const [LoadedScreen, setLoadedScreen] = useState(null);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const safeLoad = () => {
      if (cancelled || loadingRef.current) return;
      loadingRef.current = true;
      try {
        const ScreenModule = require('./VocabScreen');
        if (!cancelled) setLoadedScreen(() => ScreenModule.default || ScreenModule);
      } catch (e) {
        const message = e?.message || 'Failed to load Vocabulary screen.';
        console.log('VocabEntryScreen load failed:', e);
        if (!cancelled) setError(message);
      }
    };
    const task = InteractionManager.runAfterInteractions(safeLoad);
    const immediate = setTimeout(safeLoad, 80);
    const watchdog = setTimeout(() => {
      if (!cancelled && !LoadedScreen && !error) {
        setError('Vocabulary screen is taking too long to load. Tap to retry.');
      }
    }, 5000);
    return () => {
      cancelled = true;
      task.cancel?.();
      clearTimeout(immediate);
      clearTimeout(watchdog);
    };
  }, [LoadedScreen, error]);

  if (LoadedScreen) {
    return <LoadedScreen {...props} />;
  }

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{error ? 'Vocabulary Load Error' : 'Loading Vocabulary'}</Text>
        <Text style={styles.body}>
          {error ? error : 'Preparing the dictionary workspace…'}
        </Text>
        {error ? (
          <Text style={styles.retry} onPress={() => { setError(''); setLoadedScreen(null); loadingRef.current = false; }}>
            Tap to Retry
          </Text>
        ) : (
          <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  body: {
    fontSize: typography.small,
    color: colors.muted,
  },
  retry: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
  },
  spinner: { marginTop: spacing.sm },
});
