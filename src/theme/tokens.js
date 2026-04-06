// ── Premium Design System: "Midnight Sapphire" ──
// A rich, saturated palette with warm gold accents.
// Elevated shadows, refined typography, and premium surfaces.

export const colors = {
  // Core backgrounds
  bg: 'transparent',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5FB',
  surfaceRaised: '#FFFFFF',
  background: 'transparent',

  // Premium Blue Family (richer saturation)
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primaryLight: '#EFF6FF',
  primarySoft: '#DBEAFE',
  primaryDeeper: '#172554',
  primaryUltraLight: '#F0F5FF',

  // Gold Accent (premium warmth)
  accent: '#B45309',
  accentSoft: '#FFF7ED',
  accentBright: '#F59E0B',
  accentGold: '#D97706',

  // Teal (secondary accent)
  teal: '#0D9488',
  tealSoft: '#F0FDFA',

  // Text
  text: '#0F172A',
  textSecondary: '#334155',
  muted: '#64748B',
  textOnDark: '#F1F5F9',
  textOnDarkMuted: 'rgba(241,245,249,0.72)',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: 'rgba(0,0,0,0.06)',

  // Semantic
  secondary: '#94A3B8',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorDark: '#991B1B',
  success: '#059669',
  successDark: '#065F46',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',

  // Focus & UI
  focusRing: '#93C5FD',
};

export const typography = {
  fontHeadline: 'Avenir Next',
  fontBody: 'Avenir Next',
  h1: 28,
  h2: 21,
  h3: 17,
  body: 15,
  small: 13,
  xsmall: 11,
  micro: 9,
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
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sm: {
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  md: {
    shadowColor: '#172554',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  lg: {
    shadowColor: '#172554',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  elev1: {
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  elev2: {
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  glow: {
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.30,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  accentGlow: {
    shadowColor: '#D97706',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  premium: {
    shadowColor: '#172554',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const theme = { colors, typography, spacing, radius, shadow };

export const motion = {
  quick: 140,
  normal: 220,
  slow: 320,
};
