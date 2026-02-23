import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';

const CHECKLIST_ITEMS = [
  { key: 'placement', label: 'Placement testi tamamla' },
  { key: 'calendar', label: 'Takvimden bu haftayı planla' },
  { key: 'mock', label: '1 proficiency mock çöz' },
  { key: 'writing', label: '1 writing görevi yaz' },
  { key: 'listening', label: '2 listening set tamamla' },
];

const OFFICIAL_LINKS = [
  { key: 'academic-calendar', label: 'Academic Calendar', url: 'https://www.boun.edu.tr/en_US/Content/Academic/Academic_Calendar' },
  { key: 'announcements', label: 'Announcements', url: 'https://www.boun.edu.tr/en_US/Content/Announcements' },
  { key: 'english', label: 'School of Foreign Languages', url: 'https://www.yadyok.boun.edu.tr/' },
];

export default function BogaziciHubScreen({ navigation }) {
  const { level, screenTime, readingHistory, listeningHistory, grammarHistory } = useAppState();
  const [checked, setChecked] = useState({});

  const minutesToday = Math.floor((screenTime?.seconds || 0) / 60);
  const weeklySets = useMemo(() => ({
    reading: readingHistory.slice(0, 7).length,
    listening: listeningHistory.slice(0, 7).length,
    grammar: grammarHistory.slice(0, 7).length,
  }), [readingHistory, listeningHistory, grammarHistory]);

  const completion = useMemo(() => {
    const done = Object.values(checked).filter(Boolean).length;
    return Math.round((done / CHECKLIST_ITEMS.length) * 100);
  }, [checked]);

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Screen scroll contentStyle={styles.container}>
      <Card style={styles.hero}>
        <Text style={styles.heroTitle}>Boğaziçi Hub</Text>
        <Text style={styles.heroSub}>Proficiency + akademik takvim + resmi kaynaklar tek ekran.</Text>
        <Text style={styles.heroMeta}>Current Level: {level} • Today: {minutesToday} min • Checklist: {completion}%</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.row}>
          <Button label="Placement" variant="secondary" onPress={() => navigation.navigate('PlacementTest')} />
          <Button label="Proficiency Mock" variant="secondary" onPress={() => navigation.navigate('ProficiencyMock')} />
          <Button label="Class Calendar" onPress={() => navigation.navigate('ClassScheduleCalendar')} />
        </View>
        <View style={styles.row}>
          <Button label="Study Plan" variant="secondary" onPress={() => navigation.navigate('StudyPlan')} />
          <Button label="Analytics" variant="secondary" onPress={() => navigation.navigate('Analytics')} />
          <Button label="Exams" variant="secondary" onPress={() => navigation.navigate('Exams')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Weekly Activity Snapshot</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{weeklySets.reading}</Text>
            <Text style={styles.statLabel}>Reading</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{weeklySets.listening}</Text>
            <Text style={styles.statLabel}>Listening</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{weeklySets.grammar}</Text>
            <Text style={styles.statLabel}>Grammar</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Boğaziçi Prep Checklist</Text>
        {CHECKLIST_ITEMS.map((item) => {
          const active = !!checked[item.key];
          return (
            <TouchableOpacity key={item.key} style={[styles.checkRow, active && styles.checkRowActive]} onPress={() => toggle(item.key)}>
              <View style={[styles.checkbox, active && styles.checkboxActive]} />
              <Text style={[styles.checkText, active && styles.checkTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Official Sources</Text>
        {OFFICIAL_LINKS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.linkRow}
            onPress={() => navigation.navigate('WebViewer', { title: item.label, url: item.url })}
          >
            <Text style={styles.linkLabel}>{item.label}</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  hero: { marginBottom: spacing.lg, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  heroTitle: { fontSize: typography.h2, color: '#1D4ED8', fontFamily: typography.fontHeadline, marginBottom: spacing.xs },
  heroSub: { fontSize: typography.small, color: '#1E3A8A', marginBottom: spacing.xs },
  heroMeta: { fontSize: typography.xsmall, color: colors.muted },
  card: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, borderWidth: 1, borderColor: '#DBEAFE', borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', backgroundColor: '#F8FAFC' },
  statValue: { fontSize: typography.h2, color: colors.primaryDark, fontFamily: typography.fontHeadline },
  statLabel: { marginTop: 4, fontSize: typography.xsmall, color: colors.muted, textTransform: 'uppercase' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: '#fff',
  },
  checkRowActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#94A3B8', marginRight: spacing.sm },
  checkboxActive: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  checkText: { fontSize: typography.small, color: colors.text },
  checkTextActive: { color: '#1E3A8A', fontFamily: typography.fontHeadline },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  linkLabel: { fontSize: typography.small, color: colors.text, fontFamily: typography.fontHeadline },
  linkArrow: { fontSize: 22, color: colors.primary },
});
