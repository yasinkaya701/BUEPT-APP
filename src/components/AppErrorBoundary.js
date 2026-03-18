import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

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
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root}>
        <Text style={styles.title}>App Recovered From A Runtime Error</Text>
        <Text style={styles.body}>Details: {this.state.message}</Text>
        <Text style={styles.body}>Tap to retry rendering.</Text>
        <Text style={styles.retry} onPress={this.handleRetry}>
          Retry
        </Text>
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
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: typography.body,
    fontFamily: typography.fontHeadline
  }
});
