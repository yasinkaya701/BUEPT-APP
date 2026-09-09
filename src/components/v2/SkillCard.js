import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getV2Theme, v2Radius, v2Shadow, v2Spacing, v2Typography } from '../../theme/v2';
import { useUniversity } from '../../context/UniversityContext';

export default function SkillCard({ title, subtitle, score, icon, asset, onPress }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle || ''}`}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: theme.surface, borderColor: theme.border },
        v2Shadow.card,
        pressed && styles.pressed,
      ]}
    >
      <ImageBackground source={asset?.source} resizeMode="cover" style={styles.media} imageStyle={styles.mediaImage}>
        <View style={styles.mediaOverlay} />
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={22} color={theme.primary} />
        </View>
      </ImageBackground>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {score !== null && score !== undefined ? (
            <Text style={[styles.score, { color: theme.primary }]}>{score}</Text>
          ) : null}
        </View>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
        <View style={styles.footer}>
          <Text style={[styles.action, { color: theme.interactive }]}>Open practice</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.interactive} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minWidth: 220,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: v2Radius.lg,
  },
  pressed: { opacity: 0.94 },
  media: { height: 128, justifyContent: 'flex-end', padding: v2Spacing.md },
  mediaImage: { borderTopLeftRadius: v2Radius.lg, borderTopRightRadius: v2Radius.lg },
  mediaOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,23,42,0.12)' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: v2Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: v2Spacing.sm },
  title: { fontSize: v2Typography.h3, fontWeight: '900' },
  score: { fontSize: 18, fontWeight: '900' },
  subtitle: { fontSize: v2Typography.small, lineHeight: 20, marginTop: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: v2Spacing.md },
  action: { fontSize: 13, fontWeight: '800' },
});
