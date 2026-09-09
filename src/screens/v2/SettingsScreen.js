import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import Page from '../../components/v2/Page';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Theme, v2Spacing, v2Typography } from '../../theme/v2';

function Row({ icon, title, body, onPress, theme }) {
  return (
    <SurfaceCard onPress={onPress} style={styles.row}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={theme.muted} /> : null}
    </SurfaceCard>
  );
}

export default function SettingsScreen({ navigation }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  return (
    <Page>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>SETTINGS</Text>
        <Text style={[styles.title, { color: theme.text }]}>Keep the product quiet.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Account, AI and advanced diagnostics are separated so developer configuration never becomes a primary learning surface.</Text>
      </View>

      <View style={styles.list}>
        <Row theme={theme} icon="sparkles-outline" title="AI access" body="Hosted AI by default; optional BYOK credentials live only for the current session." onPress={() => navigation.navigate('AISettings')} />
        <Row theme={theme} icon="shield-checkmark-outline" title="Privacy & local data" body="Local learning data stays on device. Cloud vocabulary sync is currently disabled until authenticated user isolation exists." />
        <Row theme={theme} icon="notifications-outline" title="Notifications" body="No noisy notification system is enabled in this release." />
        <Row theme={theme} icon="accessibility-outline" title="Accessibility" body="V2 surfaces target readable text, 44px touch targets and reduced visual clutter." />
      </View>

      <SurfaceCard style={styles.advanced}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>Advanced</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Diagnostics and local-model tooling are available for development and troubleshooting, not as normal student settings.</Text>
        <View style={styles.actions}>
          <Button label="Developer diagnostics" variant="secondary" onPress={() => navigation.navigate('Developer')} />
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: v2Spacing.xl, maxWidth: 720 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 7 },
  title: { fontSize: v2Typography.h1, fontWeight: '900', letterSpacing: -0.7 },
  body: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  list: { gap: v2Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.md, paddingVertical: v2Spacing.md },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  advanced: { marginTop: v2Spacing.xl },
  actions: { marginTop: v2Spacing.lg, alignItems: 'flex-start' },
});
