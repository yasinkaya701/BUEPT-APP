/**
 * UniversityContext.js — active university edition provider
 *
 * FULLY SEPARATED DEPLOYMENTS: each web build ships with a hard-wired default
 * edition (`__APP_VARIANT__`, injected by webpack DefinePlugin). A BUEPT build
 * never switches to the METU/ODTÜ edition and vice versa — they are separate
 * apps deployed at separate GitHub Pages URLs:
 *   - BUEPT build  → https://yasinkaya701.github.io/BUEPT-APP/  (default: buept)
 *   - ODTÜ build   → https://yasinkaya701.github.io/BUEPT-ODTU/ (default: odtu)
 *
 * Within a build, the active edition may be reaffirmed via `?uni=<key>` (only
 * for the build's own family) or restored from the persisted
 * `preferredUniversity` storage key (native/return visits).
 *
 * Components consume `useUniversity()` to get the active university config
 * (format, pass rule, accent, feature flags, images) instead of hard-coding.
 */
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { getUniversity, resolveUniversityFromQuery, UNIVERSITY_KEYS } from '../config/universities';
import appStorage from '../utils/appStorage';

const UniversityContext = createContext(null);

const STORAGE_KEY = 'preferredUniversity';

// Each build family: buept builds serve only BUSEPT, odtu builds serve only
// the METU/ODTÜ edition. Variant is set at build time (never at runtime).
const VARIANT_DEFAULT =
  // eslint-disable-next-line no-undef
  (typeof __APP_VARIANT__ !== 'undefined' && typeof __APP_VARIANT__ === 'string' && __APP_VARIANT__) || 'buept';

function readInitial() {
  try {
    const saved = appStorage.getString(STORAGE_KEY);
    // Only honour a persisted edition when it belongs to this build's family.
    if (saved && UNIVERSITY_KEYS.includes(saved)) {
      const savedFamily = saved === 'odtu' ? 'odtu' : 'buept';
      if (savedFamily === VARIANT_DEFAULT) return saved;
    }
  } catch (_) {
    // ignore storage errors
  }
  if (Platform.OS === 'web') {
    try {
      const fromQuery = resolveUniversityFromQuery(typeof window !== 'undefined' ? window.location.search : '');
      // The query may only reaffirm this build's own edition (full separation).
      if (fromQuery && fromQuery.key === VARIANT_DEFAULT) return fromQuery.key;
    } catch (_) {
      // ignore
    }
  }
  return VARIANT_DEFAULT;
}

export function UniversityProvider({ children }) {
  const [uniKey, setUniKey] = useState(() => readInitial());
  const university = useMemo(() => getUniversity(uniKey), [uniKey]);

  const setUniversity = useCallback((key) => {
    // Full separation: never allow a cross-family switch inside a build.
    const family = key === 'odtu' ? 'odtu' : 'buept';
    if (!UNIVERSITY_KEYS.includes(key) || family !== VARIANT_DEFAULT) return;
    setUniKey(key);
    try {
      appStorage.set(STORAGE_KEY, key);
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  // Keep web in sync when the URL query changes (e.g. landing deeplinks).
  // Cross-family URLs are ignored to keep deployments fully separated.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onHash = () => {
      try {
        const fromQuery = resolveUniversityFromQuery(window.location.search);
        if (fromQuery && fromQuery.key === uniKey) return;
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
