import React, { useEffect, useRef, useState } from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { motion } from '../../theme/tokens';

/**
 * CountUp — animated numeric counter for metric tiles (web).
 *
 * Counts from 0 to `value` over ~700ms with ease-out. Falls back to plain
 * text on native. Handles non-numeric values (passes through untouched).
 */
export default function CountUp({ value, end, style, textStyle, duration = 700 }) {
  const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  text: {},
});

  const target = end !== undefined ? end : value;
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const numeric = Number(String(target).replace(/[^0-9.]/g, ''));
    if (!isWeb || isNaN(numeric) || numeric <= 0) {
      setDisplay(target);
      return;
    }
    doneRef.current = false;
    const start = Date.now();
    const prefix = String(target).match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = String(target).match(/[^0-9.]*$/)?.[0] ?? '';
    const isFloat = String(target).includes('.');

    const tick = () => {
      if (doneRef.current) return;
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = numeric * eased;
      setDisplay(
        `${prefix}${isFloat ? current.toFixed(1) : Math.round(current)}${suffix}`
      );
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        doneRef.current = true;
        setDisplay(target);
      }
    };
    const raf = requestAnimationFrame(tick);
    rafRef.current = raf;
    return () => {
      doneRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, isWeb, duration]);

  return (
    <Text style={[styles.text, textStyle]}>{display}</Text>
  );
}

