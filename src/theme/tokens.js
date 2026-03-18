// ── Hybrid design tokens: solid readable cards + colorful accents ──
// Background is Boğaziçi campus photo with dark overlay.
// Cards are solid white for readability. Text is dark. Buttons are blue.
// Photo peeks through in gaps between cards.

export const colors = {
  bg: 'transparent',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  surfaceRaised: '#FFFFFF',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primarySoft: '#DBEAFE',
  primaryDeeper: '#1E3A8A',
  primaryUltraLight: '#F5F8FF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  secondary: '#9CA3AF',
  accent: '#0891B2',
  accentSoft: '#ECFEFF',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorDark: '#991B1B',
  success: '#059669',
  successDark: '#065F46',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  background: 'transparent',
  focusRing: '#93C5FD',
};

export const typography = {
  fontHeadline: 'Avenir Next',
  fontBody: 'Avenir Next',
  h1: 26,
  h2: 20,
  h3: 17,
  body: 14,
  small: 13,
  xsmall: 11,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 42,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 9999,
  round: 9999,
};

export const shadow = {
  none: {},
  slight: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  elev1: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  elev2: {
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  glow: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  accentGlow: {
    shadowColor: '#0891B2',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const theme = { colors, typography, spacing, radius, shadow };
