import React, { useEffect, useRef, useState } from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { motion } from '../../theme/tokens';

/**
 * CountUp — animated numeric counter for metric tiles (web).
 *
 * Counts from 0 to `value` over ~700ms with ease-out. Falls back to plain
 * text on native. Handles non-numeric values (passes through untouched).
 */
export default function CountUp({ value, style, textStyle }) {
  const isWeb = Platform.OS === 'web';
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    if (!isWeb || isNaN(numeric) || numeric <= 0) {
      setDisplay(value);
      return;
    }
    doneRef.current = false;
    const start = Date.now();
    const duration = 700;
    const prefix = String(value).match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = String(value).match(/[^0-9.]*$/)?.[0] ?? '';
    const isFloat = String(value).includes('.');

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
        setDisplay(value);
      }
    };
    const raf = requestAnimationFrame(tick);
    rafRef.current = raf;
    return () => {
      doneRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, isWeb]);

  return (
    <Text style={[styles.text, textStyle]}>{display}</Text>
  );
}

const styles = StyleSheet.create({
  text: {},
});
