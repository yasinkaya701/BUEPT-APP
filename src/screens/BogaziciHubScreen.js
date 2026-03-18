import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import prepProfile from '../../data/bogazici_prep_profile.json';

const LEVEL_CHECKLIST = {
  P1: [
    { key: 'calendar', label: 'Takvimden bu haftayi planla' },
    { key: 'reading_foundation', label: '2 temel reading metni coz' },
    { key: 'listening_foundation', label: '2 temel listening set tamamla' },
    { key: 'writing_short', label: '1 kisa paragraph yaz' },
  ],
  P2: [
    { key: 'calendar', label: 'Takvimden bu haftayi planla' },
    { key: 'reading', label: '2 reading metni + soru seti tamamla' },
    { key: 'listening', label: '2 listening set tamamla' },
    { key: 'writing', label: '1 writing gorevi yaz' },
    { key: 'mock_half', label: '1 mini proficiency practice coz' },
  ],
  P3: [
    { key: 'calendar', label: 'Takvimde sinavlari kontrol et' },
    { key: 'mock', label: '1 full mock (timed) coz' },
    { key: 'writing', label: '2 writing task (40 dk disiplin) yap' },
    { key: 'listening', label: '2 selective + careful listening calis' },
    { key: 'reading', label: '2 academic reading seti bitir' },
  ],
  P4: [
    { key: 'calendar', label: 'Takvimde next exam ve deadline kontrol et' },
    { key: 'essay', label: '2 essay (40 dk) yaz ve feedback al' },
    { key: 'reading', label: '2 uzun academic reading metni coz' },
    { key: 'listening', label: '2 lecture-style listening seti yap' },
    { key: 'policy', label: 'Resmi BUEPT kurallarini tekrar et' },
  ],
};

const QUICK_MODULES = [
  { key: 'placement', label: 'Placement Test', route: 'PlacementTest', icon: 'analytics-outline', tone: '#EAF2FF', color: '#1D4ED8' },
  { key: 'mock', label: 'Proficiency Mock', route: 'ProficiencyMock', icon: 'school-outline', tone: '#ECFDF3', color: '#166534' },
  { key: 'calendar', label: 'Class Calendar', route: 'ClassScheduleCalendar', icon: 'calendar-outline', tone: '#F5F3FF', color: '#5B21B6' },
  { key: 'plan', label: 'Study Plan', route: 'StudyPlan', icon: 'map-outline', tone: '#FFF7ED', color: '#9A3412' },
  { key: 'analytics', label: 'Analytics', route: 'Analytics', icon: 'stats-chart-outline', tone: '#EFF6FF', color: '#0F4C81' },
  { key: 'exams', label: 'Exams', route: 'Exams', icon: 'document-text-outline', tone: '#FEFCE8', color: '#854D0E' },
];

const WASC_COURSES = [
  {
    key: 'wasc_reading',
    label: 'BUEPT Reading Practice',
    route: 'Reading',
    moodleUrl: 'https://wasc.bogazici.edu.tr/moodlelogin?course=112',
  },
  {
    key: 'wasc_listening',
    label: 'BUEPT Listening Practice',
    route: 'Listening',
    moodleUrl: 'https://wasc.bogazici.edu.tr/moodlelogin?course=113',
  },
  {
    key: 'wasc_writing',
    label: 'Writing Academy',
    route: 'Writing',
    moodleUrl: 'https://wasc.bogazici.edu.tr/moodlelogin?course=114',
  },
];

const WASC_TRACKS = [
  {
    key: 'prep',
    label: 'Prep Students',
    subtitle: 'Targeted resources and guidance',
    route: 'StudyPlan',
    url: 'https://wasc.bogazici.edu.tr/kaynaklar',
  },
  {
    key: 'remedial',
    label: 'Remedial Students',
    subtitle: 'Support content for make-up prep',
    route: 'ProficiencyMock',
    url: 'https://wasc.bogazici.edu.tr/kaynaklar',
  },
  {
    key: 'podcasts',
    label: 'WASC Podcasts',
    subtitle: 'Listening practice at your pace',
    route: 'Listening',
    url: 'https://wasc.bogazici.edu.tr/kaynaklar',
  },
  {
    key: 'self_study',
    label: 'Self-Study Tasks',
    subtitle: 'Independent progress tasks',
    route: 'StudyPlan',
    url: 'https://wasc.bogazici.edu.tr/kaynaklar',
  },
];

const WASC_LINKS = [
  {
    key: 'resources',
    label: 'WASC Resources Library',
    subtitle: 'Vocabulary, writing, APA, integrity, workshops',
    url: 'https://wasc.bogazici.edu.tr/kaynaklar',
    icon: 'library-outline',
  },
  {
    key: 'announcements',
    label: 'Events & Announcements',
    subtitle: 'Workshops and announcements',
    url: 'https://wasc.bogazici.edu.tr/announcements.php',
    icon: 'megaphone-outline',
  },
  {
    key: 'book',
    label: 'Book Appointment',
    subtitle: 'Request support or an appointment',
    url: 'https://wasc.bogazici.edu.tr/contact.php',
    icon: 'calendar-outline',
  },
  {
    key: 'about',
    label: 'About WASC',
    subtitle: 'Expert staff, flexible hours, online support',
    url: 'https://wasc.bogazici.edu.tr/about.php',
    icon: 'information-circle-outline',
  },
];

export default function BogaziciHubScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const { level, screenTime, readingHistory, listeningHistory, grammarHistory } = useAppState();
  const [checked, setChecked] = useState({});
  const activeProgram = useMemo(
    () => prepProfile.programs.find((p) => p.level === level) || prepProfile.programs[0],
    [level]
  );
  const checklistItems = useMemo(
    () => LEVEL_CHECKLIST[level] || LEVEL_CHECKLIST.P2,
    [level]
  );
  const officialLinks = prepProfile.officialSources || [];
  const examSections = prepProfile.examFramework?.sections || [];
  const policyRules = prepProfile.examFramework?.coreRules || [];

  const minutesToday = Math.floor((screenTime?.seconds || 0) / 60);
  const weeklySets = useMemo(() => ({
    reading: readingHistory.slice(0, 7).length,
    listening: listeningHistory.slice(0, 7).length,
    grammar: grammarHistory.slice(0, 7).length,
  }), [readingHistory, listeningHistory, grammarHistory]);

  const completion = useMemo(() => {
    const done = Object.values(checked).filter(Boolean).length;
    return Math.round((done / checklistItems.length) * 100);
  }, [checked, checklistItems.length]);

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const openWeb = (title, url) => navigation.navigate('WebViewer', { title, url });

  return (
    <Screen scroll contentStyle={styles.container}>
      <Card style={styles.hero}>
        <View style={styles.heroBubbleA} />
        <View style={styles.heroBubbleB} />
        <Text style={styles.heroTitle}>Bogazici Hub</Text>
        <Text style={styles.heroSub}>YADYOK resmi politika ozeti + gunluk BUEPT hazirlik akisi.</Text>
        <View style={styles.heroMetaRow}>
          <Text style={styles.heroMeta}>Level {level}</Text>
          <Text style={styles.heroMeta}>Today {minutesToday} min</Text>
          <Text style={styles.heroMeta}>Checklist {completion}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completion}%` }]} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Modules</Text>
        <View style={[styles.moduleGrid, isWide && styles.moduleGridWide]}>
          {QUICK_MODULES.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.moduleCard, { backgroundColor: item.tone }]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.85}
            >
              <View style={styles.moduleIconWrap}>
                <Ionicons name={item.icon} size={17} color={item.color} />
              </View>
              <Text style={styles.moduleLabel}>{item.label}</Text>
              <Text style={styles.moduleAction}>Open</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>WASC Moodle Courses</Text>
        <View style={[styles.wascCourseGrid, isWide && styles.wascCourseGridWide]}>
          {WASC_COURSES.map((course) => (
            <View key={course.key} style={styles.wascCourseCard}>
              <View style={styles.wascCourseHeader}>
                <Ionicons name="school-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.wascCourseTitle}>{course.label}</Text>
              </View>
              <Text style={styles.wascCourseSub}>Open in-app for practice or go to Moodle.</Text>
              <View style={styles.wascCourseActions}>
                <TouchableOpacity
                  style={[styles.wascActionPrimary, styles.wascActionInline]}
                  onPress={() => navigation.navigate(course.route)}
                >
                  <Text style={styles.wascActionPrimaryText}>Open in App</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.wascActionGhost, styles.wascActionInline]}
                  onPress={() => openWeb(course.label, course.moodleUrl)}
                >
                  <Text style={styles.wascActionGhostText}>Open Moodle</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.wascCourseCard, styles.wascAllCoursesCard]}
            onPress={() => openWeb('All Courses (Moodle)', 'https://wasc.bogazici.edu.tr/moodlelogin')}
          >
            <View style={styles.wascCourseHeader}>
              <Ionicons name="apps-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.wascCourseTitle}>All Courses (Moodle)</Text>
            </View>
            <Text style={styles.wascCourseSub}>See all WASC courses in Moodle.</Text>
            <Text style={styles.wascCourseActionHint}>Open →</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>WASC Support Tracks</Text>
        <View style={[styles.wascTrackGrid, isWide && styles.wascTrackGridWide]}>
          {WASC_TRACKS.map((item) => (
            <View key={item.key} style={styles.wascTrackCard}>
              <Text style={styles.wascTrackTitle}>{item.label}</Text>
              <Text style={styles.wascTrackSub}>{item.subtitle}</Text>
              <View style={styles.wascTrackActions}>
                <TouchableOpacity
                  style={styles.wascActionPrimary}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <Text style={styles.wascActionPrimaryText}>Open in App</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.wascActionGhost}
                  onPress={() => openWeb(item.label, item.url)}
                >
                  <Text style={styles.wascActionGhostText}>Open WASC</Text>
                  <Ionicons name="open-outline" size={14} color={colors.primaryDark} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>WASC Quick Links</Text>
        {WASC_LINKS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.wascLinkRow}
            onPress={() => openWeb(item.label, item.url)}
          >
            <View style={styles.wascLinkLeft}>
              <Ionicons name={item.icon} size={18} color={colors.primaryDark} />
              <View style={styles.wascLinkTextBlock}>
                <Text style={styles.wascLinkLabel}>{item.label}</Text>
                <Text style={styles.wascLinkSub}>{item.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        ))}
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
        <Text style={styles.sectionTitle}>Official Policy Snapshot</Text>
        <View style={styles.policyGrid}>
          {examSections.map((section) => (
            <View key={section.key} style={styles.policyBadge}>
              <Text style={styles.policyBadgeTitle}>{section.label}</Text>
              <Text style={styles.policyBadgeValue}>{section.weightPercent}%</Text>
            </View>
          ))}
        </View>
        {policyRules.map((rule) => (
          <View key={rule} style={styles.policyRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#1D4ED8" />
            <Text style={styles.policyText}>{rule}</Text>
          </View>
        ))}
        <View style={styles.policyRow}>
          <Ionicons name="alert-circle-outline" size={16} color="#1D4ED8" />
          <Text style={styles.policyText}>
            Attendance rule: min {prepProfile.attendancePolicy?.minAttendancePercent}% attendance, max {prepProfile.attendancePolicy?.maxAbsencePercent}% absence.
          </Text>
        </View>
        <View style={styles.policyRow}>
          <Ionicons name="school-outline" size={16} color="#1D4ED8" />
          <Text style={styles.policyText}>{prepProfile.gradingPolicy?.winterBueptRule}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{activeProgram?.level} Program Focus</Text>
        <Text style={styles.programMeta}>
          Weekly load {activeProgram?.weeklyMinutes} min
          {activeProgram?.onlineMinutes ? ` + ${activeProgram.onlineMinutes} min online` : ''}
        </Text>
        <Text style={styles.programFocus}>{activeProgram?.focus}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Boğaziçi Prep Checklist</Text>
        {checklistItems.map((item) => {
          const active = !!checked[item.key];
          return (
            <TouchableOpacity key={item.key} style={[styles.checkRow, active && styles.checkRowActive]} onPress={() => toggle(item.key)}>
              <View style={[styles.checkbox, active && styles.checkboxActive]}>
                {active ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
              </View>
              <Text style={[styles.checkText, active && styles.checkTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Official Sources</Text>
        {officialLinks.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.linkRow}
            onPress={() => navigation.navigate('WebViewer', { title: item.title, url: item.url })}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="open-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.linkLabel}>{item.title}</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.sourceStamp}>Source sync: {prepProfile.lastVerified}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  hero: {
    marginBottom: spacing.lg,
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
    overflow: 'hidden',
  },
  heroBubbleA: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#60A5FA',
    opacity: 0.3,
  },
  heroBubbleB: {
    position: 'absolute',
    left: -35,
    bottom: -50,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#34D399',
    opacity: 0.25,
  },
  heroTitle: {
    fontSize: typography.h2,
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  heroSub: {
    fontSize: typography.small,
    color: '#DBEAFE',
    marginBottom: spacing.sm,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroMeta: {
    fontSize: typography.xsmall,
    color: '#E2E8F0',
    fontFamily: typography.fontHeadline,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#86EFAC',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moduleGridWide: {
    gap: spacing.md,
  },
  moduleCard: {
    width: '48.5%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    padding: spacing.sm,
  },
  moduleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  moduleLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  moduleAction: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  wascCourseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wascCourseGridWide: {
    gap: spacing.md,
  },
  wascCourseCard: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#fff',
  },
  wascAllCoursesCard: {
    justifyContent: 'center',
  },
  wascCourseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  wascCourseTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    flex: 1,
  },
  wascCourseSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  wascCourseActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  wascCourseActionHint: {
    marginTop: spacing.xs,
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  wascActionPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wascActionPrimaryText: {
    color: '#fff',
    fontSize: typography.xsmall,
    fontWeight: '800',
  },
  wascActionGhost: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  wascActionGhostText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  wascActionInline: {
    flex: 1,
  },
  wascTrackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wascTrackGridWide: {
    gap: spacing.md,
  },
  wascTrackCard: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#fff',
  },
  wascTrackTitle: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  wascTrackSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  wascTrackActions: {
    gap: spacing.xs,
  },
  wascLinkRow: {
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
  wascLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  wascLinkTextBlock: {
    flex: 1,
  },
  wascLinkLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  wascLinkSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statBox: {
    flex: 1,
    minWidth: 92,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  statValue: {
    fontSize: typography.h2,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  statLabel: {
    marginTop: 4,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  policyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  policyBadge: {
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFF',
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  policyBadgeTitle: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  policyBadgeValue: {
    marginTop: 2,
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  policyText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
  },
  programMeta: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  programFocus: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 18,
  },
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
  checkRowActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  checkText: {
    fontSize: typography.small,
    color: colors.text,
  },
  checkTextActive: {
    color: '#1E3A8A',
    fontFamily: typography.fontHeadline,
  },
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
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkLabel: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  linkArrow: {
    fontSize: 22,
    color: colors.primary,
  },
  sourceStamp: {
    marginTop: spacing.xs,
    fontSize: typography.xsmall,
    color: colors.muted,
  },
});
