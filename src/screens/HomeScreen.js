import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, ImageBackground } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../components/Card';
import Button from '../components/Button';
import Screen from '../components/Screen';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography, shadow, radius } from '../theme/tokens';

import { useAppState } from '../context/AppState';
import readingTasks from '../../data/reading_tasks.json';
import listeningTasks from '../../data/listening_tasks.json';
import grammarTasks from '../../data/grammar_tasks.json';
import testEnglishGrammarTasks from '../../data/test_english_grammar_tasks.json';
import { buildAdaptivePlan } from '../utils/studyPlan';
import { triggerBootNotification } from '../utils/MockNotificationEngine';

// Extracted Sub-components
import HeroWidget from '../components/Home/HeroWidget';
import QuickActions from '../components/Home/QuickActions';
import LearningPaths from '../components/Home/LearningPaths';
import DailyTasks from '../components/Home/DailyTasks';
import FeatureGrid from '../components/Home/FeatureGrid';

function calcAccuracy(history = []) {
  const recent = Array.isArray(history) ? history.slice(0, 5) : [];
  let correct = 0;
  let total = 0;
  recent.forEach((item) => {
    correct += Number(item?.result?.score || 0);
    total += Number(item?.result?.total || 0);
  });
  if (!total) return null;
  return Math.round((correct / total) * 100);
}

function formatAccuracy(value) {
  return value == null ? '--' : `${value}%`;
}

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 700;
  const [homeMode, setHomeMode] = useState('ESSENTIAL');
  const {
    level,
    setLevel,
    academicFocus,
    history,
    mockHistory,
    reviews,
    screenTime,
    readingHistory,
    listeningHistory,
    grammarHistory,
    userProfile,
    isDemoUser,
    logout,
    consumePostAuthRoute,
  } = useAppState();
  const todayLabel = React.useMemo(() => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    return `${now.getDate()} ${month} ${now.getFullYear()}`;
  }, []);

  React.useEffect(() => {
    const nextRoute = consumePostAuthRoute();
    if (nextRoute) {
      const timeoutId = setTimeout(() => {
        navigation.navigate(nextRoute);
      }, 120);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [consumePostAuthRoute, navigation]);

  React.useEffect(() => {
    // Fire the mock notification 3 seconds after reaching home screen
    if (academicFocus) {
      triggerBootNotification(academicFocus);
    }
  }, [academicFocus]);

  // Stats
  const latestMock = mockHistory[0]?.result;
  const dueCount = reviews.filter((r) => r.nextReviewAt <= Date.now()).length;
  const minutes = Math.floor((screenTime?.seconds || 0) / 60);
  const readingAcc = calcAccuracy(readingHistory);
  const listeningAcc = calcAccuracy(listeningHistory);
  const grammarAcc = calcAccuracy(grammarHistory);
  const skillScores = [
    { key: 'Reading', route: 'Reading', value: readingAcc },
    { key: 'Listening', route: 'Listening', value: listeningAcc },
    { key: 'Grammar', route: 'Grammar', value: grammarAcc },
  ];
  const weakSkill = skillScores
    .map((item) => ({ ...item, safe: item.value == null ? 0 : item.value }))
    .sort((a, b) => a.safe - b.safe)[0];
  const skillComposite = React.useMemo(() => {
    const vals = [readingAcc, listeningAcc, grammarAcc].filter((v) => v != null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((sum, value) => sum + value, 0) / vals.length);
  }, [readingAcc, listeningAcc, grammarAcc]);

  // Resume Trackers
  const lastReadingId = readingHistory[0]?.result?.taskId;
  const lastListeningId = listeningHistory[0]?.result?.taskId;
  const lastGrammarId = grammarHistory[0]?.result?.taskId;
  const lastReading = readingTasks.find((t) => t.id === lastReadingId);
  const lastListening = listeningTasks.find((t) => t.id === lastListeningId);
  const allGrammarTasks = React.useMemo(() => [...grammarTasks, ...testEnglishGrammarTasks], []);
  const lastGrammar = allGrammarTasks.find((t) => t.id === lastGrammarId);
  const resumeModules = [
    lastReading ? {
      key: `reading-${lastReading.id}`,
      icon: 'book-outline',
      title: lastReading.title,
      onPress: () => navigation.navigate('ReadingDetail', { taskId: lastReading.id }),
    } : null,
    lastListening ? {
      key: `listening-${lastListening.id}`,
      icon: 'headset-outline',
      title: lastListening.title,
      onPress: () => navigation.navigate('ListeningDetail', { taskId: lastListening.id }),
    } : null,
    lastGrammar ? {
      key: `grammar-${lastGrammar.id}`,
      icon: 'create-outline',
      title: lastGrammar.title,
      onPress: () => navigation.navigate('GrammarDetail', { taskId: lastGrammar.id }),
    } : null,
  ].filter(Boolean);

  // Adaptive Plan
  const adaptive = buildAdaptivePlan({
    level,
    readingHistory,
    listeningHistory,
    grammarHistory,
    writingHistory: history
  });
  const primaryLaunches = [
    {
      key: 'podcast',
      title: 'Daily Podcast',
      body: 'Listen to Boğaziçi prep audio lessons and insights.',
      icon: 'headset-outline',
      route: 'Podcast',
      bg: colors.surface,
      iconBg: '#FCE7F3',
      iconColor: '#BE185D',
      titleColor: colors.text,
    },
    {
      key: 'focus',
      title: weakSkill?.key || 'Reading',
      body: adaptive.focusAction,
      icon: 'flash-outline',
      route: weakSkill?.route || 'Reading',
      bg: colors.surface,
      iconBg: '#DBEAFE',
      iconColor: '#1D4ED8',
      titleColor: colors.text,
    },
    {
      key: 'vocab',
      title: 'Vocabulary',
      body: dueCount > 0 ? `${dueCount} review items due now.` : 'Open dictionary and weekly quiz workspace.',
      icon: 'book-outline',
      route: 'Vocab',
      bg: colors.surface,
      iconBg: '#D1FAE5',
      iconColor: '#065F46',
      titleColor: colors.text,
    },
    {
      key: 'demo',
      title: isDemoUser ? 'Demo Hub' : 'Feature Hub',
      body: isDemoUser ? 'Open the presenter flow and live modules.' : 'Open the tool hub and feature showcase.',
      icon: 'sparkles-outline',
      route: 'DemoFeatures',
      bg: colors.surface,
      iconBg: '#EDE9FE',
      iconColor: '#5B21B6',
      titleColor: colors.text,
    },
  ];
  const todayBoard = [
    { key: 'today', label: 'Study Time', value: `${minutes} min`, meta: 'today' },
    { key: 'mock', label: 'Last Mock', value: latestMock ? String(latestMock.overall) : '--', meta: 'overall' },
    { key: 'review', label: 'Review Queue', value: String(dueCount), meta: dueCount > 0 ? 'due now' : 'clear' },
    { key: 'writing', label: 'Writing Logs', value: String(history.length), meta: 'saved drafts' },
  ];
  const aiStudioTools = [
    { key: 'ai-speaking', label: 'AI Speaking', route: 'AISpeakingPartner' },
    { key: 'chat', label: 'Chat Coach', route: 'Chatbot' },
    { key: 'presentation', label: 'Presentation', route: 'AIPresentationPrep' },
    { key: 'lesson-video', label: 'Lesson Video', route: 'AILessonVideoStudio' },
  ];
  const planningTools = [
    { key: 'placement', label: 'Placement', route: 'PlacementTest' },
    { key: 'study-plan', label: 'Study Plan', route: 'StudyPlan' },
    { key: 'analytics', label: 'Analytics', route: 'Analytics' },
    { key: 'exams', label: 'Exams', route: 'Exams' },
  ];
  const campusTools = [
    { key: 'calendar', label: 'Calendar', route: 'ClassScheduleCalendar' },
    { key: 'resources', label: 'Resources', route: 'Resources' },
    { key: 'bogazici', label: 'Boğaziçi Hub', route: 'BogaziciHub' },
    { key: 'weak-analysis', label: 'Weak Analysis', route: 'WeakPointAnalysis' },
  ];

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* ── Glass hero card (background comes from Screen component) ── */}
      <ImageBackground source={require('../assets/images/real_north_campus.jpg')} style={[styles.heroBgImg, isCompact && styles.heroBgImgCompact]} resizeMode="cover">
        <View style={[styles.header, isCompact && styles.headerCompact]}>
          <LogoMark size={36} />
          <View style={[styles.headerCopy, isCompact && styles.headerCopyCompact]}>
            <Text style={[styles.h1, isCompact && styles.h1Compact]}>Boğaziçi Prep Dashboard</Text>
            <Text style={styles.sub}>{
              level === 'P1' ? 'P1 (A1) • Beginner' :
                level === 'P2' ? 'P2 (A2) • Pre-Int' :
                  level === 'P3' ? 'P3 (B1) • Intermediate' :
                    level === 'P4' ? 'P4 (B2) • Upper-Int' : level
            } • {academicFocus}</Text>
            <Text style={styles.dateText}>Today: {todayLabel}</Text>
          </View>
          <View style={[styles.accountPanel, isCompact && styles.accountPanelCompact]}>
            <Text style={styles.accountName} numberOfLines={1}>
              {userProfile?.name || 'Student'}
            </Text>
            <Text style={styles.accountMeta} numberOfLines={1}>
              {isDemoUser ? 'Demo mode' : (userProfile?.faculty || 'General track')}
            </Text>
            <TouchableOpacity style={styles.accountAction} onPress={logout}>
              <Ionicons name="log-out-outline" size={14} color={colors.textOnDark} />
              <Text style={styles.accountActionText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.topMetaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillLabel}>Today</Text>
            <Text style={styles.metaPillValue}>{minutes} min</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillLabel}>Vocab Due</Text>
            <Text style={styles.metaPillValue}>{dueCount}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillLabel}>Last Mock</Text>
            <Text style={styles.metaPillValue}>{latestMock ? latestMock.overall : '--'}</Text>
          </View>
        </View>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeChip, homeMode === 'ESSENTIAL' && styles.modeChipActive]}
            onPress={() => setHomeMode('ESSENTIAL')}
          >
            <Ionicons name="flash-outline" size={14} color={homeMode === 'ESSENTIAL' ? colors.primaryDeeper : colors.textOnDarkMuted} />
            <Text style={[styles.modeChipText, homeMode === 'ESSENTIAL' && styles.modeChipTextActive]}>Essentials</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeChip, homeMode === 'ALL' && styles.modeChipActive]}
            onPress={() => setHomeMode('ALL')}
          >
            <Ionicons name="grid-outline" size={14} color={homeMode === 'ALL' ? colors.primaryDeeper : colors.textOnDarkMuted} />
            <Text style={[styles.modeChipText, homeMode === 'ALL' && styles.modeChipTextActive]}>All Tools</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileStrip}>
          <View style={styles.profileStripBox}>
            <Text style={styles.profileStripLabel}>Account</Text>
            <Text style={styles.profileStripValue}>{isDemoUser ? 'Demo Student' : 'Local Student Profile'}</Text>
          </View>
          <View style={styles.profileStripBox}>
            <Text style={styles.profileStripLabel}>Focus Track</Text>
            <Text style={styles.profileStripValue}>{academicFocus || 'General'}</Text>
          </View>
          <View style={styles.profileStripBox}>
            <Text style={styles.profileStripLabel}>Writing Logs</Text>
            <Text style={styles.profileStripValue}>{history.length}</Text>
          </View>
        </View>

        <View style={[styles.launchGrid, !isCompact && styles.launchGridWide]}>
          {primaryLaunches.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.launchCard, !isCompact && styles.launchCardWide, { backgroundColor: item.bg }]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.88}
            >
              <View style={styles.launchHead}>
                <View style={[styles.launchIconWrap, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={16} color={item.iconColor} />
                </View>
                <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
              </View>
              <Text style={[styles.launchTitle, { color: item.titleColor }]}>{item.title}</Text>
              <Text style={styles.launchBody} numberOfLines={2}>{item.body}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ImageBackground>

      <HeroWidget adaptive={adaptive} navigation={navigation} />

      <QuickActions navigation={navigation} />

      <Card style={styles.card}>
        <View style={styles.sectionHeadRow}>
          <View style={styles.flexOne}>
            <Text style={styles.sectionTitle}>Today Board</Text>
            <Text style={styles.sectionCaption}>Current numbers and the fastest way back into active work.</Text>
          </View>
          <Button label="Open Demo" variant="secondary" icon="sparkles-outline" onPress={() => navigation.navigate('DemoFeatures')} />
        </View>
        <View style={styles.todayGrid}>
          {todayBoard.map((item) => (
            <View key={item.key} style={styles.todayBox}>
              <Text style={styles.todayValue}>{item.value}</Text>
              <Text style={styles.todayLabel}>{item.label}</Text>
              <Text style={styles.todayMeta}>{item.meta}</Text>
            </View>
          ))}
        </View>
        {resumeModules.length > 0 ? (
          <>
            <Text style={styles.miniSectionTitle}>Resume Progress</Text>
            {resumeModules.map((module) => (
              <View key={module.key} style={styles.resumeRow}>
                <View style={styles.resumeLeft}>
                  <View style={styles.resumeIconBadge}>
                    <Ionicons name={module.icon} size={15} color={colors.primaryDark} />
                  </View>
                  <Text style={styles.resumeText} numberOfLines={1}>{module.title}</Text>
                </View>
                <Button label="Continue" variant="secondary" style={styles.resumeBtn} textStyle={styles.resumeBtnText} onPress={module.onPress} />
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.sectionCaption}>No recent module yet. Use the launch cards above or Quick Actions to start.</Text>
        )}
      </Card>

      {homeMode === 'ALL' ? <LearningPaths setLevel={setLevel} navigation={navigation} /> : null}

      <DailyTasks adaptive={adaptive} navigation={navigation} />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Skill Snapshot</Text>
        <View style={styles.skillRow}>
          <View style={styles.skillBox}>
            <Text style={styles.skillValue}>{formatAccuracy(readingAcc)}</Text>
            <Text style={styles.skillLabel}>Reading</Text>
          </View>
          <View style={styles.skillBox}>
            <Text style={styles.skillValue}>{formatAccuracy(listeningAcc)}</Text>
            <Text style={styles.skillLabel}>Listening</Text>
          </View>
          <View style={styles.skillBox}>
            <Text style={styles.skillValue}>{formatAccuracy(grammarAcc)}</Text>
            <Text style={styles.skillLabel}>Grammar</Text>
          </View>
        </View>
        <Text style={styles.skillMeta}>
          Focus: {weakSkill?.key || 'Reading'} • Composite: {formatAccuracy(skillComposite)}
        </Text>
        <View style={styles.bouRow}>
          <Button label={`Train ${weakSkill?.key || 'Reading'}`} onPress={() => navigation.navigate(weakSkill?.route || 'Reading')} />
          <Button label="Review" variant="secondary" onPress={() => navigation.navigate('Review')} />
          <Button label="History" variant="secondary" onPress={() => navigation.navigate('History')} />
          <Button label="Progress" variant="secondary" onPress={() => navigation.navigate('Progress')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Control Center</Text>
        <Text style={styles.bouBody}>The post-login home screen now groups high-use tools by task instead of stacking unrelated buttons.</Text>
        <View style={[styles.controlGrid, !isCompact && styles.controlGridWide]}>
          <View style={[styles.controlPanel, !isCompact && styles.controlPanelWide]}>
            <Text style={styles.controlPanelTitle}>AI Studio</Text>
            <Text style={styles.controlPanelBody}>Speaking, chat, presentation, and lesson generation.</Text>
            <View style={styles.bouRow}>
              {aiStudioTools.map((item) => (
                <Button key={item.key} label={item.label} variant="secondary" onPress={() => navigation.navigate(item.route)} />
              ))}
            </View>
          </View>
          <View style={[styles.controlPanel, !isCompact && styles.controlPanelWide]}>
            <Text style={styles.controlPanelTitle}>Planning & Exams</Text>
            <Text style={styles.controlPanelBody}>Placement, study planning, analytics, and timed exam routes.</Text>
            <View style={styles.bouRow}>
              {planningTools.map((item) => (
                <Button key={item.key} label={item.label} variant={item.key === 'exams' ? 'primary' : 'secondary'} onPress={() => navigation.navigate(item.route)} />
              ))}
            </View>
          </View>
        </View>
        <View style={[styles.controlGrid, !isCompact && styles.controlGridWide]}>
          <View style={[styles.controlPanel, !isCompact && styles.controlPanelWide]}>
            <Text style={styles.controlPanelTitle}>Campus & Resources</Text>
            <Text style={styles.controlPanelBody}>Calendar, resources, Boğaziçi hub, and weak-point analysis.</Text>
            <View style={styles.bouRow}>
              {campusTools.map((item) => (
                <Button key={item.key} label={item.label} variant="ghost" onPress={() => navigation.navigate(item.route)} />
              ))}
            </View>
          </View>
        </View>
      </Card>

      {homeMode === 'ALL' ? (
        <>
          <Card style={styles.expansionCard}>
            <View style={styles.expansionRow}>
              <View style={styles.expansionBody}>
                <Text style={styles.expansionTitle} numberOfLines={1}>Explore Full Platform</Text>
                <Text style={styles.expansionText}>Open the feature hub, full content grid, and campus-specific tool stack.</Text>
              </View>
              <Button
                label="Demos"
                variant="secondary"
                style={styles.expansionBtn}
                onPress={() => navigation.navigate('DemoFeatures')}
              />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Explore Content</Text>
          <FeatureGrid navigation={navigation} />

          <Card style={styles.bouCard}>
            <Text style={styles.bouTitle}>Prep Control Center</Text>
            <Text style={styles.bouBody}>Calendar, mock, weak-point analysis, and official resources in one place.</Text>
            <View style={styles.bouRow}>
              <Button label="Boğaziçi Hub" onPress={() => navigation.navigate('BogaziciHub')} />
              <Button label="Academic Calendar" variant="secondary" onPress={() => navigation.navigate('ClassScheduleCalendar')} />
              <Button label="Proficiency Mock" variant="secondary" onPress={() => navigation.navigate('ProficiencyMock')} />
              <Button label="Weak Analysis" variant="secondary" onPress={() => navigation.navigate('WeakPointAnalysis')} />
            </View>
            <View style={styles.bouRow}>
              <Button label="Official Calendar" variant="ghost" onPress={() => navigation.navigate('WebViewer', { title: 'Boğaziçi Academic Calendar', url: 'https://akademiktakvim.bogazici.edu.tr/en' })} />
              <Button label="Announcements" variant="ghost" onPress={() => navigation.navigate('WebViewer', { title: 'YADYOK Announcements', url: 'https://yadyok.bogazici.edu.tr/en' })} />
            </View>
          </Card>
        </>
      ) : null}

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 120 },

  // ── Premium hero card ──
  heroCard: { marginBottom: spacing.md, borderRadius: radius.xl, backgroundColor: '#172554', padding: spacing.md, overflow: 'hidden', ...shadow.premium },

  header: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: spacing.sm },
  headerCompact: { flexDirection: 'column' },
  headerCopy: { flex: 1 },
  headerCopyCompact: { minWidth: 0, flexBasis: '100%', marginBottom: 4 },
  accountPanel: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  accountPanelCompact: { width: '100%' },
  accountName: { fontSize: 14, fontFamily: typography.fontHeadline, color: colors.textOnDark, fontWeight: '800' },
  accountMeta: { fontSize: 11, color: colors.textOnDarkMuted, fontWeight: '600' },
  accountAction: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start' },
  accountActionText: { fontSize: 11, color: colors.textOnDark, fontFamily: typography.fontHeadline, fontWeight: '700' },
  dateText: { fontSize: 11, color: colors.textOnDarkMuted, marginTop: 2, fontWeight: '600' },
  topMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  metaPill: { flex: 1, minWidth: 85, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 8 },
  metaPillLabel: { fontSize: typography.micro, color: colors.textOnDarkMuted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaPillValue: { marginTop: 3, fontSize: 18, color: '#F59E0B', fontFamily: typography.fontHeadline, fontWeight: '900' },
  h1: { fontSize: 22, fontFamily: typography.fontHeadline, fontWeight: '900', color: colors.textOnDark, letterSpacing: -0.5 },
  h1Compact: { fontSize: 19 },
  sub: { fontSize: 12, fontFamily: typography.fontHeadline, color: colors.textOnDarkMuted, fontWeight: '700', marginTop: 3 },
  modeRow: { flexDirection: 'row', gap: 3, marginBottom: 10, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 999, padding: 3, alignSelf: 'flex-start' },
  modeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'transparent', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  modeChipActive: { backgroundColor: colors.surfaceRaised },
  modeChipText: { fontSize: 11, color: colors.textOnDarkMuted, fontFamily: typography.fontHeadline, fontWeight: '700' },
  modeChipTextActive: { color: '#172554', fontWeight: '800' },
  profileStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  profileStripBox: { flex: 1, minWidth: 85, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', padding: 10 },
  profileStripLabel: { fontSize: typography.micro, textTransform: 'uppercase', color: colors.textOnDarkMuted, fontWeight: '800', letterSpacing: 0.6 },
  profileStripValue: { marginTop: 3, fontSize: 13, color: colors.textOnDark, fontFamily: typography.fontHeadline, fontWeight: '800' },
  launchGrid: { gap: 8, marginTop: 10 },
  launchGridWide: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  launchCard: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 5, ...shadow.sm, flexBasis: '48%', backgroundColor: colors.surface },
  launchCardWide: { flexBasis: '23.5%' },
  launchHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  launchIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  launchTitle: { fontSize: 14, color: colors.text, fontFamily: typography.fontHeadline, marginTop: 5, fontWeight: '800' },
  launchBody: { fontSize: 11, color: colors.muted, lineHeight: 16, fontWeight: '500' },

  // ── Premium white cards below hero ──
  card: { marginBottom: spacing.sm },
  sectionHeadRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontFamily: typography.fontHeadline, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  sectionCaption: { fontSize: 12, color: colors.muted, lineHeight: 18, fontWeight: '500', marginTop: 2 },
  miniSectionTitle: { marginTop: spacing.sm, marginBottom: 6, fontSize: 14, fontFamily: typography.fontHeadline, color: colors.text, fontWeight: '900' },
  resumeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  resumeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 6 },
  resumeIconBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  resumeText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '700' },
  resumeBtn: { height: 44, minWidth: 80, paddingHorizontal: 16, borderRadius: 999 },
  resumeBtnText: { fontSize: 12, fontWeight: '800' },
  todayGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  todayBox: { flex: 1, minWidth: 95, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  todayValue: { fontSize: 24, fontFamily: typography.fontHeadline, fontWeight: '900', color: '#1D4ED8', letterSpacing: -0.4 },
  todayLabel: { fontSize: typography.micro, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '800' },
  todayMeta: { fontSize: 10, color: '#B45309', marginTop: 3, fontWeight: '700' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  skillBox: { flex: 1, minWidth: 85, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 12 },
  skillValue: { fontSize: 18, color: '#172554', fontFamily: typography.fontHeadline, fontWeight: '900' },
  skillLabel: { marginTop: 4, fontSize: typography.micro, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '800' },
  skillMeta: { fontSize: 11, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  expansionCard: { backgroundColor: '#172554', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 0, ...shadow.premium },
  expansionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expansionBody: { flex: 1, paddingRight: 10 },
  expansionTitle: { color: '#F59E0B', fontSize: 17, marginBottom: 5, fontFamily: typography.fontHeadline, fontWeight: '900' },
  expansionText: { color: colors.textOnDarkMuted, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  expansionBtn: { height: 36, paddingHorizontal: 14, minWidth: 0, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)', borderRadius: 999 },
  bouCard: { marginTop: 8, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadow.sm },
  bouTitle: { fontSize: 17, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: 5, fontWeight: '900' },
  bouBody: { fontSize: 12, color: colors.muted, marginBottom: spacing.sm, lineHeight: 18, fontWeight: '500' },
  bouRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  controlGrid: { gap: 8, marginTop: 8 },
  controlGridWide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  controlPanel: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: spacing.md },
  controlPanelWide: { width: '48.5%' },
  controlPanelTitle: { fontSize: 15, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: 4, fontWeight: '900' },
  controlPanelBody: { fontSize: 12, color: colors.muted, marginBottom: 10, lineHeight: 18, fontWeight: '500' },
  flexOne: { flex: 1 }
});
