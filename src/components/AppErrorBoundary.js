import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/tokens';
import { DEV_SMOKE_TEST_REPORT_KEY } from '../dev/smokeTestConfig';

function getMessage(error) {
  if (!error) return 'Unknown runtime error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return String(error);
}

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: getMessage(error) };
  }

  componentDidCatch(error) {
    // Keep logging explicit so Metro/Xcode surfaces useful stack details.
    console.error('[AppErrorBoundary]', error, 'last_smoke_step=', global.__BUEPT_LAST_SMOKE_STEP__ || 'n/a');
    const payload = {
      type: 'error',
      at: new Date().toISOString(),
      step: global.__BUEPT_LAST_SMOKE_STEP__ || 'n/a',
      message: getMessage(error),
    };
    AsyncStorage.getItem(DEV_SMOKE_TEST_REPORT_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : { startedAt: new Date().toISOString(), events: [] };
        parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
        parsed.events.push(payload);
        return AsyncStorage.setItem(DEV_SMOKE_TEST_REPORT_KEY, JSON.stringify(parsed));
      })
      .catch(() => {});
  }

  handleNuclearReset = async () => {
    try {
      await AsyncStorage.clear();
      // On some platforms/versions DevSettings might not be available
      const { DevSettings } = require('react-native');
      if (DevSettings && DevSettings.reload) {
        DevSettings.reload();
      }
    } catch (e) {
      console.error('Nuclear reset failed:', e);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root}>
        <Text style={styles.title}>App Recovered From A Runtime Error</Text>
        <Text style={styles.body}>Details: {this.state.message}</Text>
        <View style={styles.actions}>
            <Text style={styles.retry} onPress={this.handleRetry}>
            Tap to Retry Rendering
            </Text>
            <View style={styles.divider} />
            <Text style={[styles.retry, { color: colors.error }]} onPress={this.handleNuclearReset}>
            Clear All Data & Restart (Nuclear Option)
            </Text>
        </View>
        <Text style={styles.hint}>Note: The nuclear option will reset your XP and progress but is guaranteed to fix persistent crashes.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    justifyContent: 'center'
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.error,
    marginBottom: spacing.md
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    color: colors.text,
    marginBottom: spacing.sm
  },
  retry: {
    color: colors.primary,
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    paddingVertical: spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.xs,
  },
  hint: {
    marginTop: spacing.xl,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
