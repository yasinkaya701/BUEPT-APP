import { Linking, Platform } from 'react-native';

function normalizeUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export async function openExternalResource({ url = '', navigation = null, title = 'Resource' } = {}) {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) return false;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const opened = window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
      if (opened) return true;
      // If popup blocker blocked it, we shouldn't redirect the whole page.
      // We will let it fall through to the WebViewer or fail gracefully.
    } catch (_) {
      // fall through
    }
  }

  try {
    const supported = await Linking.canOpenURL(normalizedUrl);
    if (supported) {
      await Linking.openURL(normalizedUrl);
      return true;
    }
  } catch (_) {
    // fall through to in-app fallback
  }

  if (navigation?.navigate) {
    navigation.navigate('WebViewer', {
      title,
      url: normalizedUrl,
      externalPreferred: false,
    });
  }
  return false;
}

export function normalizeExternalUrl(url = '') {
  return normalizeUrl(url);
}
