import React, { useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import LogoMark from '../components/LogoMark';
import { useAppState } from '../context/AppState';
import { useUniversity } from '../context/UniversityContext';
import { getV2Assets } from '../config/bueptAssets';
import { getV2Theme, v2Radius, v2Shadow, v2Spacing, v2Typography } from '../theme/v2';

const LEVELS = [
  { key: 'P1', label: 'P1', meta: 'Starting foundation' },
  { key: 'P2', label: 'P2', meta: 'Building control' },
  { key: 'P3', label: 'P3', meta: 'Exam preparation' },
  { key: 'P4', label: 'P4', meta: 'Advanced practice' },
];

function ProgressDots({ active, theme }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Onboarding step ${active + 1} of 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === active ? theme.interactive : theme.border },
            index === active && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

function CheckRow({ children, theme }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkIcon, { backgroundColor: theme.successSoft }]}>
        <Ionicons name="checkmark" size={14} color={theme.success} />
      </View>
      <Text style={[styles.checkText, { color: theme.text }]}>{children}</Text>
    </View>
  );
}

function ReadinessPreview({ theme }) {
  return (
    <View style={[styles.previewPanel, { backgroundColor: 'rgba(255,255,255,0.94)' }, v2Shadow.float]}>
      <Text style={[styles.previewEyebrow, { color: theme.primary }]}>READINESS</Text>
      <View style={styles.readinessRow}>
        <View style={[styles.ring, { borderColor: theme.primarySoft }]}>
          <View style={[styles.ringAccent, { borderTopColor: theme.interactive, borderRightColor: theme.interactive }]} />
          <Text style={[styles.ringValue, { color: theme.text }]}>P2 → P3</Text>
        </View>
        <View style={styles.previewCopy}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>Know where you stand.</Text>
          <Text style={[styles.previewBody, { color: theme.muted }]}>Reading, Listening and Writing become one clear preparation signal.</Text>
        </View>
      </View>
    </View>
  );
}

function PlanPreview({ theme }) {
  const rows = [
    ['headset-outline', 'Listening practice', '25 min'],
    ['book-outline', 'Reading inference', '30 min'],
    ['create-outline', 'Writing task', '25 min'],
  ];
  return (
    <View style={[styles.previewPanel, { backgroundColor: 'rgba(255,255,255,0.95)' }, v2Shadow.float]}>
      <View style={styles.previewHeader}>
        <Text style={[styles.previewTitle, { color: theme.text }]}>Your study plan</Text>
        <View style={[styles.personalPill, { backgroundColor: theme.successSoft }]}>
          <Ionicons name="sparkles-outline" size={12} color={theme.success} />
          <Text style={[styles.personalText, { color: theme.success }]}>Personalized</Text>
        </View>
      </View>
      {rows.map(([icon, title, meta]) => (
        <View key={title} style={[styles.planRow, { borderColor: theme.border }]}>
          <View style={[styles.planIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name={icon} size={17} color={theme.primary} />
          </View>
          <Text style={[styles.planTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.planMeta, { color: theme.muted }]}>{meta}</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={theme.interactive} />
        </View>
      ))}
    </View>
  );
}

function ProgressPreview({ theme }) {
  return (
    <View style={[styles.previewPanel, { backgroundColor: 'rgba(255,255,255,0.95)' }, v2Shadow.float]}>
      <Text style={[styles.previewEyebrow, { color: theme.primary }]}>YOUR PROGRESS</Text>
      <View style={styles.bars}>
        {[24, 42, 51, 68, 82].map((height, index) => (
          <View key={height} style={styles.barColumn}>
            <View style={[styles.progressBar, { height, backgroundColor: index === 4 ? theme.interactive : theme.primarySoft }]} />
          </View>
        ))}
      </View>
      <Text style={[styles.previewTitle, { color: theme.text }]}>Small steps become visible.</Text>
      <Text style={[styles.previewBody, { color: theme.muted }]}>Track skill mastery, mock results and the work that actually moved them.</Text>
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const compact = width < 760 || height < 720;
  const { university, uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const { setLevel } = useAppState();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState('P2');

  const isBuept = uniKey === 'buept';
  const steps = useMemo(() => [
    {
      eyebrow: isBuept ? 'BOĞAZİÇİ · BUSEPT' : `${university?.name || 'University'} · PREP`,
      title: isBuept ? 'More than an exam.\nA clearer path through it.' : 'A calmer way to prepare.',
      body: isBuept
        ? 'Real campus identity, official-format practice and one focused preparation system — built around what you should do next.'
        : `A focused preparation workspace for ${university?.examName || 'your proficiency exam'}.`,
      asset: assets.campus.southGate,
      preview: 'welcome',
    },
    {
      eyebrow: 'STARTING POINT',
      title: 'Let’s find where you are.',
      body: 'Choose the level that feels closest today. A diagnostic can replace the guess with evidence after you create your local profile.',
      asset: assets.campus.northCampus,
      preview: 'level',
    },
    {
      eyebrow: 'READINESS',
      title: 'Know what deserves attention.',
      body: isBuept
        ? 'BUSEPT is Listening, Reading and Writing. Grammar and vocabulary support those scored sections instead of pretending to be separate official exam parts.'
        : 'Your core exam sections roll up into one preparation signal so weak areas stay visible.',
      asset: assets.campus.bosphorus,
      preview: 'readiness',
    },
    {
      eyebrow: 'PERSONALIZED PLAN',
      title: 'A plan built around your work.',
      body: 'Your recent results choose the next useful practice. The home screen stays quiet: readiness, today’s plan, resume, and one recommendation.',
      asset: assets.campus.sunset,
      preview: 'plan',
    },
    {
      eyebrow: 'PROGRESS',
      title: 'Practice. Measure. Improve.',
      body: 'Mocks, skill history and daily practice tell one story. When the full exam starts, everything unrelated disappears.',
      asset: assets.campus.southGate,
      preview: 'progress',
    },
  ], [assets, isBuept, university]);

  const current = steps[step];
  const goNext = () => setStep((value) => Math.min(steps.length - 1, value + 1));
  const goBack = () => setStep((value) => Math.max(0, value - 1));

  const finish = (diagnostic) => {
    setLevel(selected);
    // Onboarding is marked complete only after a local profile/demo session
    // actually succeeds. Closing the app on Signup should not skip setup forever.
    navigation.replace('Signup', diagnostic ? { nextRoute: 'PlacementTest' } : undefined);
  };

  const renderPreview = () => {
    if (current.preview === 'readiness') return <ReadinessPreview theme={theme} />;
    if (current.preview === 'plan') return <PlanPreview theme={theme} />;
    if (current.preview === 'progress') return <ProgressPreview theme={theme} />;
    if (current.preview === 'level') {
      return (
        <View style={[styles.previewPanel, { backgroundColor: 'rgba(255,255,255,0.95)' }, v2Shadow.float]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>Your current level</Text>
          <Text style={[styles.previewBody, { color: theme.muted }]}>This is only a starting estimate. You can change it after the diagnostic.</Text>
          <View style={styles.levelGrid}>
            {LEVELS.map((level) => {
              const active = level.key === selected;
              return (
                <Pressable
                  key={level.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelected(level.key)}
                  style={({ pressed }) => [
                    styles.levelCard,
                    {
                      borderColor: active ? theme.interactive : theme.border,
                      backgroundColor: active ? theme.primarySoft : theme.surface,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.levelName, { color: active ? theme.primaryDark : theme.text }]}>{level.label}</Text>
                  <Text style={[styles.levelMeta, { color: theme.muted }]}>{level.meta}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.quotePanel, v2Shadow.float]}>
        <LogoMark size={48} label={isBuept ? 'BÜ' : 'MET'} />
        <Text style={styles.quote}>“A little progress each day adds up.”</Text>
        <Text style={styles.quoteMeta}>{isBuept ? 'Knowledge · People · Possibilities' : 'Practice with purpose.'}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, compact && styles.scrollCompact]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.shell, compact && styles.shellCompact]}>
          <ImageBackground
            source={current.asset?.source}
            resizeMode="cover"
            accessibilityLabel={current.asset?.alt}
            style={[styles.media, compact && styles.mediaCompact]}
            imageStyle={styles.mediaImage}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.heroOverlay }]} />
            <View style={styles.mediaTop}>
              <View style={styles.brandRow}>
                <LogoMark size={38} label={isBuept ? 'BÜ' : 'MET'} />
                <Text style={styles.brandText}>{university?.shortName || 'BUEPT-APP'}</Text>
              </View>
              <Text style={styles.stepCount}>{String(step + 1).padStart(2, '0')} / 05</Text>
            </View>
            <View style={styles.mediaCopy}>
              <Text style={styles.mediaEyebrow}>{current.eyebrow}</Text>
              <Text style={styles.mediaTitle}>{current.title}</Text>
              <Text style={styles.mediaBody}>{current.body}</Text>
            </View>
          </ImageBackground>

          <View style={[styles.content, { backgroundColor: theme.surface }]}>
            <View style={styles.topLine}>
              <ProgressDots active={step} theme={theme} />
              {step < steps.length - 1 ? (
                <Pressable onPress={() => finish(false)} hitSlop={10}>
                  <Text style={[styles.skip, { color: theme.interactive }]}>Skip</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.previewWrap}>{renderPreview()}</View>

            {step === 0 ? (
              <View style={styles.checkList}>
                <CheckRow theme={theme}>Official-format core practice</CheckRow>
                <CheckRow theme={theme}>Focused Today plan instead of a feature wall</CheckRow>
                <CheckRow theme={theme}>Local-first learning data; no local password stored</CheckRow>
              </View>
            ) : null}

            <View style={styles.footer}>
              {step > 0 ? <Button label="Back" variant="ghost" onPress={goBack} /> : <View />}
              <View style={styles.footerActions}>
                {step === steps.length - 1 ? (
                  <>
                    <Button label="Create profile" variant="secondary" onPress={() => finish(false)} />
                    <Button label="Create profile + diagnostic" icon="arrow-forward" onPress={() => finish(true)} />
                  </>
                ) : (
                  <Button label={step === 0 ? 'Get started' : 'Next'} icon="arrow-forward" onPress={goNext} />
                )}
              </View>
            </View>

            {step === steps.length - 1 ? (
              <Pressable onPress={() => navigation.replace('Login')} style={styles.existingLink}>
                <Text style={[styles.existingText, { color: theme.muted }]}>
                  Already have a local profile? <Text style={{ color: theme.interactive, fontWeight: '900' }}>Continue</Text>
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: v2Spacing.xl, justifyContent: 'center' },
  scrollCompact: { padding: 0, justifyContent: 'flex-start' },
  shell: {
    width: '100%',
    maxWidth: 1120,
    minHeight: 650,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: v2Radius.xl,
    overflow: 'hidden',
    ...v2Shadow.float,
  },
  shellCompact: { flexDirection: 'column', minHeight: 0, borderRadius: 0 },
  media: { flex: 1.05, minHeight: 650, padding: v2Spacing.xl, justifyContent: 'space-between' },
  mediaCompact: { minHeight: 320, flex: 0 },
  mediaImage: { borderTopLeftRadius: v2Radius.xl, borderBottomLeftRadius: v2Radius.xl },
  mediaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm },
  brandText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.4 },
  stepCount: { color: 'rgba(255,255,255,0.82)', fontWeight: '800', fontSize: 12 },
  mediaCopy: { maxWidth: 500 },
  mediaEyebrow: { color: '#DBEAFE', fontWeight: '900', fontSize: 11, letterSpacing: 1.6, marginBottom: v2Spacing.sm },
  mediaTitle: { color: '#FFFFFF', fontSize: 38, lineHeight: 43, fontWeight: '900', letterSpacing: -1 },
  mediaBody: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 23, marginTop: v2Spacing.md },
  content: { flex: 0.95, padding: v2Spacing.xl, justifyContent: 'space-between' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 999 },
  dotActive: { width: 28 },
  skip: { fontSize: 13, fontWeight: '900' },
  previewWrap: { marginVertical: v2Spacing.lg },
  previewPanel: { borderRadius: v2Radius.lg, padding: v2Spacing.lg },
  previewEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: v2Spacing.sm },
  previewTitle: { fontSize: v2Typography.h3, fontWeight: '900' },
  previewBody: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.lg },
  ring: {
    width: 132, height: 132, borderRadius: 66, borderWidth: 10,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  ringAccent: {
    ...StyleSheet.absoluteFillObject, borderRadius: 66, borderWidth: 10,
    borderLeftColor: 'transparent', borderBottomColor: 'transparent',
    transform: [{ rotate: '32deg' }],
  },
  ringValue: { fontSize: 20, fontWeight: '900' },
  previewCopy: { flex: 1 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: v2Spacing.sm },
  personalPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 },
  personalText: { fontSize: 10, fontWeight: '900' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm, borderWidth: 1, borderRadius: 14, padding: 11, marginTop: 8 },
  planIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  planTitle: { flex: 1, fontSize: 13, fontWeight: '800' },
  planMeta: { fontSize: 11 },
  bars: { height: 100, flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginVertical: v2Spacing.md },
  barColumn: { flex: 1, justifyContent: 'flex-end' },
  progressBar: { width: '100%', borderTopLeftRadius: 7, borderTopRightRadius: 7 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm, marginTop: v2Spacing.lg },
  levelCard: { width: '47%', borderWidth: 1.5, borderRadius: v2Radius.md, padding: v2Spacing.md },
  levelName: { fontSize: 18, fontWeight: '900' },
  levelMeta: { fontSize: 11, marginTop: 3 },
  pressed: { opacity: 0.82 },
  quotePanel: {
    borderRadius: v2Radius.lg, padding: v2Spacing.xl,
    backgroundColor: 'rgba(239,246,255,0.96)', alignItems: 'flex-start',
  },
  quote: { color: '#102A56', fontSize: 22, lineHeight: 29, fontWeight: '700', marginTop: v2Spacing.lg },
  quoteMeta: { color: '#64748B', fontSize: 11, fontWeight: '900', letterSpacing: 1.1, marginTop: v2Spacing.md, textTransform: 'uppercase' },
  checkList: { gap: 9 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm },
  checkIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: v2Spacing.sm, marginTop: v2Spacing.lg },
  footerActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: v2Spacing.sm },
  existingLink: { alignSelf: 'center', marginTop: v2Spacing.md, padding: 6 },
  existingText: { fontSize: 12 },
});
