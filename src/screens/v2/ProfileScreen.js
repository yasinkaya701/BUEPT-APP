import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import CampusHero from '../../components/v2/CampusHero';
import Page from '../../components/v2/Page';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useAppState } from '../../context/AppState';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Assets } from '../../config/bueptAssets';
import { getV2Theme, v2Radius, v2Spacing, v2Typography } from '../../theme/v2';

function SettingRow({ icon, title, body, action, theme }) {
  return (
    <SurfaceCard onPress={action} style={styles.setting}>
      <View style={[styles.settingIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingBody, { color: theme.muted }]}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </SurfaceCard>
  );
}

export default function ProfileScreen({ navigation }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const {
    userProfile,
    level,
    aiAccessConfig,
    logout,
    xp,
    streakDays,
  } = useAppState();

  const initials = String(userProfile?.name || 'Student')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'S';

  return (
    <Page>
      <CampusHero asset={assets.campus.southGate} eyebrow="PROFILE" title="Your BUEPT workspace." body="Goals, preferences and advanced tools live here — not in the primary learning navigation." compact />

      <SurfaceCard style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={[styles.name, { color: theme.text }]}>{userProfile?.name || 'Local Student'}</Text>
          <Text style={[styles.email, { color: theme.muted }]}>{userProfile?.email || 'Local profile'}</Text>
          <View style={styles.pills}>
            <View style={[styles.pill, { backgroundColor: theme.primarySoft }]}><Text style={[styles.pillText, { color: theme.primaryDark }]}>{level || 'P2'} current track</Text></View>
            <View style={[styles.pill, { backgroundColor: theme.successSoft }]}><Text style={[styles.pillText, { color: theme.success }]}>{streakDays || 0} day streak</Text></View>
            <View style={[styles.pill, { backgroundColor: theme.surfaceSoft }]}><Text style={[styles.pillText, { color: theme.text }]}>{xp || 0} XP</Text></View>
          </View>
        </View>
      </SurfaceCard>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
      <View style={styles.list}>
        <SettingRow theme={theme} icon="flag-outline" title="Study goal" body={`Current preparation level: ${level || 'P2'}`} action={() => navigation.navigate('StudyPlan')} />
        <SettingRow theme={theme} icon="settings-outline" title="Settings" body="Privacy, accessibility and advanced product preferences." action={() => navigation.navigate('Settings')} />
        <SettingRow theme={theme} icon="sparkles-outline" title="AI access" body={aiAccessConfig?.mode === 'hosted' ? 'Hosted BUEPT AI · no client secret required' : `${aiAccessConfig?.provider || 'Custom'} · session-only credential`} action={() => navigation.navigate('AISettings')} />
        <SettingRow theme={theme} icon="shield-checkmark-outline" title="Privacy & local data" body="Local profile passwords are not collected. Legacy stored passwords are removed on hydration." action={() => navigation.navigate('Settings')} />
      </View>

      <SurfaceCard style={styles.safetyCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Data safety</Text>
        <Text style={[styles.settingBody, { color: theme.muted }]}>Cloud vocabulary sync is disabled until the backend has authenticated, user-scoped storage. Your local vocabulary and SRS continue to work normally.</Text>
      </SurfaceCard>

      <View style={styles.logout}>
        <Button label="Leave local profile" variant="secondary" onPress={logout} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.lg, marginBottom: v2Spacing.xl },
  avatar: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  profileCopy: { flex: 1 },
  name: { fontSize: v2Typography.h2, fontWeight: '900' },
  email: { fontSize: 14, marginTop: 3 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.xs, marginTop: v2Spacing.md },
  pill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: v2Radius.pill },
  pillText: { fontSize: 11, fontWeight: '800' },
  sectionTitle: { fontSize: v2Typography.h2, fontWeight: '900', marginBottom: v2Spacing.md },
  list: { gap: v2Spacing.sm },
  setting: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.md, paddingVertical: v2Spacing.md },
  settingIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '900' },
  settingBody: { fontSize: 13, lineHeight: 20, marginTop: 3 },
  safetyCard: { marginTop: v2Spacing.xl },
  logout: { marginTop: v2Spacing.xl, alignItems: 'flex-start' },
});
