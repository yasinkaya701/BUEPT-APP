export const colors = {
  bg: '#F9FAFB',           // Modern extra-light gray bg (Tailwind gray-50)
  surface: '#FFFFFF',      // Pure white cards
  surfaceAlt: '#F3F4F6',   // Soft alternate surface
  primary: '#3B82F6',      // Bright blue (Tailwind blue-500)
  primaryDark: '#2563EB',  // Deeper interactive blue (blue-600)
  primaryLight: '#EFF6FF', // Soft blue background for active states
  text: '#111827',         // Very dark gray/black (gray-900)
  muted: '#6B7280',        // Subdued text (gray-500)
  border: '#E5E7EB',       // Very light borders (gray-200)
  secondary: '#E2E8F0',    // Secondary border/soft background
  accent: '#8B5CF6',       // Vibrant purple accent (violet-500)
  error: '#EF4444',        // Vibrant red
  errorLight: '#FEF2F2',   // Light red background
  success: '#10B981',      // Energetic green
  background: '#F9FAFB',     // Alias for bg
  primarySoft: '#EFF6FF',    // Alias for primaryLight
  successDark: '#065F46',    // Deep green for success text
  errorDark: '#991B1B',      // Deep red for error text
  successLight: '#ECFDF5',   // Light green background
  warning: '#F59E0B',        // Amber
  warningLight: '#FFFBEB',   // Light amber background
};

export const typography = {
  fontHeadline: 'Avenir Next', // Clean, premium geometric sans
  fontBody: 'Georgia',         // Sophisticated serif for reading texts
  h1: 32,                      // Larger, more impactful H1
  h2: 24,
  h3: 18,
  body: 16,
  small: 14,
  xsmall: 12
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,    // Substantial rounding for modern card feel
  xl: 32,    // Extra curve for hero elements
  pill: 9999,
  round: 9999, // Alias for pill - used for circular buttons
};

export const shadow = {
  // Named presets used across app screens
  none: {},
  slight: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10
  },
  // Legacy names kept for backwards compat
  elev1: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  elev2: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6
  },
  glow: {
    // Elegant glow for primary buttons
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  accentGlow: {
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  }
};

export const theme = { colors, typography, spacing, radius, shadow };
