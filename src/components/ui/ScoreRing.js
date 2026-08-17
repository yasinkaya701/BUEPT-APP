import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    lineHeight: 26,
  },
  label: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sublabel: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: 1,
  },
}

const DEFAULT_SIZE = 84;
const DEFAULT_STROKE = 8;

export function scoreBandColor(score, total = 100) {
  if (typeof score !== 'number' || typeof total !== 'number' || total === 0) return colors.muted;
  const pct = (score / total) * 100;
  if (pct >= 90) return colors.success;
  if (pct >= 80) return colors.primary;
  if (pct >= 70) return colors.primaryLight;
  if (pct >= 60) return colors.accentBright;
  return colors.error;
}

export function scoreBandLabel(pct) {
  if (pct >= 90) return 'Excellent';
  if (pct >= 80) return 'Strong';
  if (pct >= 70) return 'Good';
  if (pct >= 60) return 'Borderline';
  return 'Below Threshold';
}

/**
 * Animated circular score ring built on react-native-svg.
 * value: 0–100 percentage (or raw score with total prop).
 */
export default function ScoreRing({
  value = 0,
  total = 100,
  size = DEFAULT_SIZE,
  stroke = DEFAULT_STROKE,
  label,
  sublabel,
  color,
  trackColor,
  animated = true,
  style,
}) {
  const resolvedValue = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  const resolvedColor = color || scoreBandColor(resolvedValue);
  const resolvedTrack = trackColor || colors.primaryLight;
  const progress = useRef(0);
  const [displayed, setDisplayed] = React.useState(0);

  useEffect(() => {
    if (!animated) {
      setDisplayed(resolvedValue);
      return undefined;
    }
    const target = resolvedValue;
    const start = Date.now();
    const duration = 600;
    let rafId;
    const tick = () => {
      const now = Date.now();
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      progress.current = target * eased;
      setDisplayed(progress.current);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [resolvedValue, animated]);

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (displayed / 100) * circumference;
  const dashOffset = circumference - filled;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={resolvedTrack}
          strokeWidth={stroke}
        />
        <Circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[styles.inner, { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }]}>
        <Text style={[styles.value, { color: resolvedColor }]}>{Math.round(displayed)}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

);
