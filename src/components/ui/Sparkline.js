import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';

/**
 * Minimal SVG trend line for recent scores/XP series.
 * data: array of numbers (0–100 percentiles if not normalized).
 */
export default function Sparkline({
  data = [],
  width = 120,
  height = 36,
  color,
  filled = true,
  endpoint = true,
  stroke = 2,
}) {
  if (!data.length) return <View style={{ width, height }} />;
  const pad = 4;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (data.length > 1 ? (i / (data.length - 1)) * (width - pad * 2) : width / 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const last = points[points.length - 1];
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const strokeColor = color || colors.primary;
  const fillArea = filled
    ? `${pad},${height - pad} ${line} ${width - pad},${height - pad}`
    : line;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {filled ? (
          <Polyline
            points={fillArea}
            fill={`${strokeColor}18`}
            stroke="none"
          />
        ) : null}
        <Polyline
          points={line}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {endpoint && last ? (
          <Circle cx={last[0]} cy={last[1]} r={stroke + 1.5} fill={strokeColor} />
        ) : null}
      </Svg>
    </View>
  );
}
