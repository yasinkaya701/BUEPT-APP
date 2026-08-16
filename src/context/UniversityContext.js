/**
 * UniversityContext.js — active university edition provider
 *
 * The app supports a per-university edition model. The active university is
 * resolved from:
 *   - the URL query param `?uni=<key>` on web (deeplink-friendly), or
 *   - the persisted `preferredUniversity` storage key on native/return visits.
 *
 * Components consume `useUniversity()` to get the active university config
 * (format, pass rule, accent, feature flags) instead of hard-coding BUSEPT.
 */
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { getUniversity, resolveUniversityFromQuery, UNIVERSITY_KEYS } from '../config/universities';
import appStorage from '../utils/appStorage';

const UniversityContext = createContext(null);

const STORAGE_KEY = 'preferredUniversity';

function readInitial() {
  if (Platform.OS === 'web') {
    try {
      const fromQuery = resolveUniversityFromQuery(typeof window !== 'undefined' ? window.location.search : '');
      if (fromQuery && fromQuery.key !== 'buept') return fromQuery.key;
    } catch (_) {
      // ignore
    }
  }
  try {
    const saved = appStorage.getString(STORAGE_KEY);
    if (saved && UNIVERSITY_KEYS.includes(saved)) return saved;
  } catch (_) {
    // ignore storage errors
  }
  return 'buept';
}

export function UniversityProvider({ children }) {
  const [uniKey, setUniKey] = useState(() => readInitial());
  const university = useMemo(() => getUniversity(uniKey), [uniKey]);

  const setUniversity = useCallback((key) => {
    if (!UNIVERSITY_KEYS.includes(key)) return;
    setUniKey(key);
    try {
      appStorage.set(STORAGE_KEY, key);
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  // Keep web in sync when the URL query changes (e.g. landing deeplinks).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onHash = () => {
      try {
        const fromQuery = resolveUniversityFromQuery(window.location.search);
        if (fromQuery.key !== uniKey) setUniKey(fromQuery.key);
      } catch (_) {
        // ignore
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UniversityContext.Provider value={{ university, uniKey, setUniversity }}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const ctx = useContext(UniversityContext);
  if (!ctx) {
    throw new Error('useUniversity must be used within UniversityProvider');
  }
  return ctx;
}
