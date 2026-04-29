import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../theme/tokens';

/**
 * React Error Boundary — catches JS errors in the child tree.
 * Wrap any critical screen or component to prevent full app crashes.
 *
 * Usage:
 *   <ErrorBoundary fallbackTitle="AI Bağlantısı Başarısız">
 *     <ChatbotScreen />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.warn('[ErrorBoundary] Caught error:', error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Bir Şeyler Ters Gitti';
      const subtitle = this.props.fallbackSubtitle || 'Beklenmeyen bir hata oluştu. Yeniden dene.';

      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {__DEV__ && this.state.error ? (
            <Text style={styles.devError}>{String(this.state.error.message || this.state.error)}</Text>
          ) : null}
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg || '#F8FAFC',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239,68,68,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: typography.h3 || 18,
    fontWeight: '800',
    color: colors.text || '#1A202C',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted || '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  devError: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: spacing.sm,
    borderRadius: radius.md || 8,
    marginBottom: spacing.lg,
    maxWidth: '100%',
  },
  retryBtn: {
    backgroundColor: colors.primary || '#3B82F6',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill || 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ErrorBoundary;
