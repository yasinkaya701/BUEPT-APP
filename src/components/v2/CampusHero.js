import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { getV2Theme, v2Radius, v2Spacing, v2Typography } from '../../theme/v2';
import { useUniversity } from '../../context/UniversityContext';

export default function CampusHero({
  asset,
  eyebrow,
  title,
  body,
  children,
  minHeight = 260,
  compact = false,
}) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  return (
    <ImageBackground
      source={asset?.source}
      resizeMode="cover"
      accessibilityLabel={asset?.alt}
      style={[styles.hero, { minHeight: compact ? 210 : minHeight }]}
      imageStyle={styles.image}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.heroOverlay }]} />
      <View style={styles.content}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: v2Radius.xl,
    justifyContent: 'flex-end',
    marginBottom: v2Spacing.xl,
  },
  image: { borderRadius: v2Radius.xl },
  content: {
    padding: v2Spacing.xl,
    maxWidth: 720,
  },
  eyebrow: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: v2Spacing.sm,
  },
  title: {
    color: '#FFFFFF',
    fontSize: v2Typography.display,
    lineHeight: 48,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  titleCompact: { fontSize: v2Typography.h1, lineHeight: 38 },
  body: {
    marginTop: v2Spacing.sm,
    color: 'rgba(255,255,255,0.92)',
    fontSize: v2Typography.body,
    lineHeight: 24,
    maxWidth: 620,
  },
  actions: {
    marginTop: v2Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Spacing.sm,
  },
});
