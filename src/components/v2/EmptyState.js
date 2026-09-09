import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Button from '../Button';
import { getV2Theme, v2Radius, v2Spacing, v2Typography } from '../../theme/v2';
import { useUniversity } from '../../context/UniversityContext';

export default function EmptyState({ asset, title, body, actionLabel, onAction }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  return (
    <View style={[styles.root, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {asset ? (
        <ImageBackground source={asset.source} style={styles.media} resizeMode="cover" imageStyle={styles.mediaImage}>
          <View style={styles.overlay} />
        </ImageBackground>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.copy, { color: theme.muted }]}>{body}</Text>
        {onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', borderWidth: 1, borderRadius: v2Radius.lg },
  media: { height: 150 },
  mediaImage: { borderTopLeftRadius: v2Radius.lg, borderTopRightRadius: v2Radius.lg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.08)' },
  body: { padding: v2Spacing.xl, alignItems: 'flex-start' },
  title: { fontSize: v2Typography.h3, fontWeight: '900', marginBottom: v2Spacing.xs },
  copy: { fontSize: v2Typography.body, lineHeight: 23, marginBottom: v2Spacing.lg, maxWidth: 520 },
});
