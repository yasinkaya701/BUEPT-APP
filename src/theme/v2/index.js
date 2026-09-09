export const v2Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const v2Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const v2Typography = {
  display: 42,
  h1: 32,
  h2: 24,
  h3: 19,
  body: 16,
  small: 14,
  caption: 12,
};

const common = {
  canvas: '#F7FAFF',
  surface: '#FFFFFF',
  surfaceSoft: '#EFF6FF',
  text: '#08172A',
  muted: '#64748B',
  border: '#DCE7F5',
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
};

export function getV2Theme(uniKey = 'buept') {
  if (uniKey === 'odtu') {
    return {
      ...common,
      primary: '#8B1E2D',
      primaryDark: '#5F1420',
      primarySoft: '#F9E9EC',
      interactive: '#C2412D',
      sky: '#FDE8D8',
      heroOverlay: 'rgba(33, 10, 15, 0.56)',
    };
  }
  return {
    ...common,
    primary: '#1D4ED8',
    primaryDark: '#102A56',
    primarySoft: '#DBEAFE',
    interactive: '#2563EB',
    sky: '#93C5FD',
    heroOverlay: 'rgba(8, 23, 42, 0.46)',
  };
}

export const v2Shadow = {
  card: {
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  float: {
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
};
