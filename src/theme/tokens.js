// ── Design System: variant-aware palette ──
// BUSEPT build  → "Midnight Sapphire" (rich blue, gold accents)
// ODTÜ build    → "METU Forest" (METU green brand identity)
//
// The build-time constant __APP_VARIANT__ is injected by webpack
// DefinePlugin. Relative import specifiers do NOT match webpack resolve
// aliases, so the palette choice lives in this module itself.

// ── BUSEPT: Midnight Sapphire ──
const sapphire = {
  // Core backgrounds
  bg: 'transparent',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5FB',
  surfaceRaised: '#FFFFFF',
  background: 'transparent',

  // Premium Blue Family
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primaryLight: '#EFF6FF',
  primarySoft: '#DBEAFE',
  primaryDeeper: '#172554',
  primaryUltraLight: '#F0F5FF',
  // Dark surfaces (BUSEPT: midnight navy)
  headerDark: 'rgba(13, 18, 37, 0.97)',
  finalCta: '#312E81',
  footerDark: '#0B1220',

  // Gold Accent (premium warmth)
  accent: '#B45309',
  accentSoft: '#FFF7ED',
  accentBright: '#F59E0B',
  accentGold: '#D97706',

  // Teal (secondary accent)
  teal: '#0D9488',
  tealSoft: '#F0FDFA',
};

// ── ODTÜ-EPE: METU Crimson (red brand identity — official METU logo color) ──
const forest = {
  bg: 'transparent',
  surface: '#FFFFFF',
  surfaceAlt: '#FDF3F5',
  surfaceRaised: '#FFFFFF',
  background: 'transparent',

  // METU Crimson Family (official logo red #C8102E)
  primary: '#C8102E',
  primaryDark: '#9B0A20',
  primaryLight: '#FEF2F4',
  primarySoft: '#FDE3E8',
  primaryDeeper: '#6D0718',
  primaryUltraLight: '#FFF5F7',
  // Dark surfaces (ODTÜ: crimson night)
  headerDark: 'rgba(30, 10, 18, 0.97)',
  finalCta: '#7A0B1D',
  footerDark: '#1A0810',

  // Gold Accent (kept — premium warmth still works with red)
  accent: '#B45309',
  accentSoft: '#FFF7ED',
  accentBright: '#F59E0B',
  accentGold: '#D97706',

  // Teal (secondary accent)
  teal: '#0D9488',
  tealSoft: '#F0FDFA',
};

export const colors = {
  ...forest,

  // Text (shared)
  text: '#0F172A',
  textSecondary: '#334155',
  muted: '#64748B',
  textOnDark: '#F1F5F9',
  textOnDarkMuted: 'rgba(241,245,249,0.72)',

  // Borders & Dividers (shared)
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: 'rgba(0,0,0,0.06)',

  // Semantic (shared)
  secondary: '#94A3B8',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorDark: '#991B1B',
  success: '#059669',
  successDark: '#065F46',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',

  // Focus & UI (shared)
  focusRing: '#86EFAC',
  tintBlue: '#F0F7FF',
  card: '#FFFFFF',

  // Skill identity colors (one per core tab)
  skill: {
    vocab: '#0D9488',        // teal
    listening: '#C8102E',    // ODTÜ: METU crimson // BUSEPT: indigo — overridden below
    writing: '#B45309',      // amber
    speaking: '#7C3AED',     // violet
  },
  skillSoft: {
    vocab: '#F0FDFA',
    listening: '#FEF2F4',    // ODTÜ: crimson soft
    writing: '#FFF7ED',
    speaking: '#F5F3FF',
  },

  // Score bands
  bands: {
    E: '#059669',   // Excellent (BUSEPT: WASC E; ODTÜ: 85+)
    VG: '#10B981',  // Very Good
    MA: '#22C55E',  // More than Adequate / Good pass
    A: '#4ADE80',   // Adequate (ODTÜ pass zone 60-69)
    D: '#F59E0B',   // Doubts / below pass
    NA: '#EF4444',  // Not Adequate
    FBA: '#DC2626', // Far Below
    INS: '#991B1B', // Insufficient
  },
};

const isOdtu =
  // eslint-disable-next-line no-undef
  (typeof __APP_VARIANT__ !== 'undefined' && __APP_VARIANT__ === 'odtu') || false;

if (isOdtu) {
  Object.assign(colors, {
    primary: forest.primary,
    primaryDark: forest.primaryDark,
    primaryLight: forest.primaryLight,
    primarySoft: forest.primarySoft,
    primaryDeeper: forest.primaryDeeper,
    primaryUltraLight: forest.primaryUltraLight,
    headerDark: forest.headerDark,
    finalCta: forest.finalCta,
    footerDark: forest.footerDark,
    surfaceAlt: forest.surfaceAlt,
    focusRing: '#F9A8BC',
    skill: {
      vocab: '#0D9488',
      listening: '#C8102E',
      writing: '#B45309',
      speaking: '#7C3AED',
    },
    skillSoft: {
      vocab: '#F0FDFA',
      listening: '#FEF2F4',
      writing: '#FFF7ED',
      speaking: '#F5F3FF',
    },
    bands: {
      E: '#059669',
      VG: '#10B981',
      MA: '#22C55E',
      A: '#4ADE80',
      D: '#F59E0B',
      NA: '#F97316',
      FBA: '#DC2626',
      INS: '#991B1B',
    },
  });
} else {
  Object.assign(colors, {
    primary: sapphire.primary,
    primaryDark: sapphire.primaryDark,
    primaryLight: sapphire.primaryLight,
    primarySoft: sapphire.primarySoft,
    primaryDeeper: sapphire.primaryDeeper,
    primaryUltraLight: sapphire.primaryUltraLight,
    headerDark: sapphire.headerDark,
    finalCta: sapphire.finalCta,
    footerDark: sapphire.footerDark,
    surfaceAlt: sapphire.surfaceAlt,
    focusRing: '#93C5FD',
    skill: {
      vocab: '#0D9488',
      listening: '#4F46E5',
      writing: '#B45309',
      speaking: '#7C3AED',
    },
    skillSoft: {
      vocab: '#F0FDFA',
      listening: '#EEF2FF',
      writing: '#FFF7ED',
      speaking: '#F5F3FF',
    },
    bands: {
      E: '#10B981',
      VG: '#059669',
      MA: '#2563EB',
      A: '#3B82F6',
      D: '#F59E0B',
      NA: '#EF4444',
      FBA: '#DC2626',
      INS: '#991B1B',
    },
  });
}

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

const shadowFamily = isOdtu ? { dark: '#9B0A20', deeper: '#6D0718' } : { dark: '#1E3A8A', deeper: '#172554' };

export const shadow = {
  none: {},
  slight: {
    shadowColor: shadowFamily.dark,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sm: {
    shadowColor: shadowFamily.dark,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  md: {
    shadowColor: shadowFamily.deeper,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  lg: {
    shadowColor: shadowFamily.deeper,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  elev1: {
    shadowColor: shadowFamily.dark,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  elev2: {
    shadowColor: shadowFamily.dark,
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  glow: {
    shadowColor: isOdtu ? '#C8102E' : '#1D4ED8',
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
    shadowColor: shadowFamily.deeper,
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
  ultra: 90,
  pageIn: 340,
  stagger: 55,
  overshoot: 5,
};
