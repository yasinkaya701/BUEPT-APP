import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import LogoMark from '../components/LogoMark';
import SurfaceCard from '../components/v2/SurfaceCard';
import { useUniversity } from '../context/UniversityContext';
import { getV2Assets } from '../config/bueptAssets';
import { getV2Theme, v2Radius, v2Shadow, v2Spacing, v2Typography } from '../theme/v2';

function FeatureCard({ icon, eyebrow, title, body, asset, theme }) {
  return (
    <SurfaceCard style={styles.featureCard}>
      <ImageBackground
        source={asset?.source}
        accessibilityLabel={asset?.alt}
        resizeMode="cover"
        style={styles.featureMedia}
        imageStyle={styles.featureMediaImage}
      >
        <View style={styles.featureOverlay} />
        <View style={styles.featureIcon}>
          <Ionicons name={icon} size={21} color={theme.primary} />
        </View>
      </ImageBackground>
      <View style={styles.featureBody}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{eyebrow}</Text>
        <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      </View>
    </SurfaceCard>
  );
}

function JourneyStep({ number, icon, title, body, theme, last }) {
  return (
    <View style={styles.journeyItem}>
      <View style={[styles.journeyIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={21} color={theme.primary} />
      </View>
      <View style={styles.journeyCopy}>
        <Text style={[styles.journeyNumber, { color: theme.primary }]}>0{number}</Text>
        <Text style={[styles.journeyTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      </View>
      {!last ? <View style={[styles.journeyLine, { backgroundColor: theme.border }]} /> : null}
    </View>
  );
}

export default function LandingScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const { university, uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const assets = getV2Assets(uniKey);
  const isBuept = uniKey === 'buept';

  const start = () => navigation.navigate('Onboarding');
  const title = isBuept ? 'Your Path to\nBoğaziçi Begins Here.' : `A clearer path to\n${university?.shortName || 'your proficiency exam'}.`;
  const subtitle = isBuept
    ? 'A focused BUSEPT preparation workspace for Listening, Reading and Writing — with grammar, vocabulary, mocks and progress working around those real exam needs.'
    : `A focused preparation workspace built around ${university?.examName || 'your university proficiency exam'}.`;

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.brand}>
            <LogoMark size={42} label={isBuept ? 'BÜ' : 'MET'} />
            <View>
              <Text style={[styles.brandTitle, { color: theme.text }]}>{university?.shortName || 'BUEPT-APP'}</Text>
              <Text style={[styles.brandSub, { color: theme.muted }]}>Practice. Improve. Go further.</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Button label="Continue" variant="ghost" onPress={() => navigation.navigate('Login')} />
            <Button label="Get started" onPress={start} />
          </View>
        </View>

        <View style={styles.page}>
          <ImageBackground
            source={assets.campus.southGate.source}
            accessibilityLabel={assets.campus.southGate.alt}
            resizeMode="cover"
            style={[styles.hero, compact && styles.heroCompact]}
            imageStyle={styles.heroImage}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.heroOverlay }]} />
            <View style={[styles.heroContent, compact && styles.heroContentCompact]}>
              <View style={styles.heroPill}>
                <Ionicons name="school-outline" size={14} color="#FFFFFF" />
                <Text style={styles.heroPillText}>{isBuept ? 'BUSEPT · BOĞAZİÇİ PREP' : `${university?.shortName || 'PREP'} · EXAM PREP`}</Text>
              </View>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{title}</Text>
              <Text style={styles.heroBody}>{subtitle}</Text>
              <View style={styles.heroActions}>
                <Button label="Start your journey" icon="arrow-forward" onPress={start} />
                <Button label="I have a local profile" variant="secondary" onPress={() => navigation.navigate('Login')} />
              </View>
            </View>
            {!compact ? (
              <View style={[styles.heroQuote, v2Shadow.card]}>
                <Text style={styles.quoteMark}>“</Text>
                <Text style={styles.quoteText}>{isBuept ? 'Same questions.\nA brighter you.' : 'Practice with purpose.\nSee the next step.'}</Text>
              </View>
            ) : null}
          </ImageBackground>

          <View style={[styles.promiseStrip, { backgroundColor: theme.surface, borderColor: theme.border }, v2Shadow.card]}>
            {[
              ['locate-outline', 'Diagnostic', 'Know your starting point'],
              ['list-outline', 'Personalized plan', 'Focus on what matters'],
              ['document-text-outline', 'Mock exams', 'Practice the real pressure'],
              ['bar-chart-outline', 'Progress', 'See what changed'],
            ].map(([icon, label, body]) => (
              <View key={label} style={styles.promiseItem}>
                <View style={[styles.promiseIcon, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name={icon} size={19} color={theme.primary} />
                </View>
                <View style={styles.promiseCopy}>
                  <Text style={[styles.promiseTitle, { color: theme.text }]}>{label}</Text>
                  <Text style={[styles.promiseBody, { color: theme.muted }]}>{body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>THE PRODUCT</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Everything important, in the right layer.</Text>
            <Text style={[styles.sectionBody, { color: theme.muted }]}>
              The new experience removes the feature wall. Today tells you what to do; Practice builds skills; Mock simulates the exam; Progress explains the trend.
            </Text>
          </View>

          <View style={[styles.featureGrid, compact && styles.stack]}>
            <FeatureCard
              theme={theme}
              icon="locate-outline"
              eyebrow="DIAGNOSTIC"
              title="Know your starting point"
              body="Build a baseline before the app starts recommending work."
              asset={assets.campus.northCampus}
            />
            <FeatureCard
              theme={theme}
              icon="list-outline"
              eyebrow="DAILY PLAN"
              title="A plan built around you"
              body="Recent performance determines the next useful practice instead of exposing every tool at once."
              asset={assets.campus.sunset}
            />
            <FeatureCard
              theme={theme}
              icon="document-text-outline"
              eyebrow="MOCK EXAM"
              title="A focused real-test mode"
              body="When the mock begins, unrelated navigation, gamification and marketing disappear."
              asset={assets.editorial.mock}
            />
            <FeatureCard
              theme={theme}
              icon="bar-chart-outline"
              eyebrow="PROGRESS"
              title="See the story, not just the score"
              body="Skill mastery, mock results, streaks and recommendations live in one readable progress surface."
              asset={assets.editorial.progress}
            />
          </View>

          <View style={[styles.visualBand, compact && styles.stack]}>
            <ImageBackground
              source={assets.campus.bosphorus.source}
              accessibilityLabel={assets.campus.bosphorus.alt}
              resizeMode="cover"
              style={styles.visualPhoto}
              imageStyle={styles.visualPhotoImage}
            >
              <View style={styles.visualOverlay} />
              <View style={styles.visualCopy}>
                <Text style={styles.visualEyebrow}>{isBuept ? 'BOĞAZİÇİ, NOT GENERIC CAMPUS ART' : 'REAL CAMPUS IDENTITY'}</Text>
                <Text style={styles.visualTitle}>{isBuept ? 'A real sense of place.' : 'Your university stays recognizable.'}</Text>
                <Text style={styles.visualBody}>
                  {isBuept
                    ? 'The interface uses real campus photography already in the product instead of fabricated European-university imagery or AI text baked into pictures.'
                    : 'The visual layer follows the active university edition and never leaks Boğaziçi branding into the ODTÜ build.'}
                </Text>
              </View>
            </ImageBackground>
            <View style={[styles.editorialCard, { backgroundColor: theme.primaryDark }]}>
              <Text style={styles.editorialQuote}>{isBuept ? '“Discipline today,\nBoğaziçi tomorrow.”' : '“Small steps.\nClear progress.”'}</Text>
              <Text style={styles.editorialMeta}>{isBuept ? 'KNOWLEDGE · PEOPLE · POSSIBILITIES' : 'PREPARE · PRACTICE · PROGRESS'}</Text>
            </View>
          </View>

          <View style={[styles.journeySection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sectionHeadingNoTop}>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>YOUR JOURNEY</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>From uncertainty to the next clear action.</Text>
            </View>
            <View style={[styles.journey, compact && styles.stack]}>
              <JourneyStep number={1} icon="locate-outline" title="Find the baseline" body="Estimate your level, then validate it with a diagnostic." theme={theme} />
              <JourneyStep number={2} icon="list-outline" title="Build the plan" body="Turn weak signals into a short daily plan." theme={theme} />
              <JourneyStep number={3} icon="book-outline" title="Practice deeply" body="Work inside a consistent skill layout." theme={theme} />
              <JourneyStep number={4} icon="document-text-outline" title="Simulate the exam" body="Take a focused mock when the timing is useful." theme={theme} />
              <JourneyStep number={5} icon="bar-chart-outline" title="Adjust" body="Use progress to choose what happens next." theme={theme} last />
            </View>
          </View>

          <ImageBackground
            source={assets.campus.sunset.source}
            accessibilityLabel={assets.campus.sunset.alt}
            resizeMode="cover"
            style={styles.finalCta}
            imageStyle={styles.finalImage}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,23,42,0.66)' }]} />
            <View style={styles.finalCopy}>
              <Text style={styles.finalTitle}>Ready for a calmer preparation system?</Text>
              <Text style={styles.finalBody}>Start with the five-step setup. You can create a local profile with no password and choose whether to take the diagnostic immediately.</Text>
              <View style={styles.heroActions}>
                <Button label="Get started" icon="arrow-forward" onPress={start} />
                <Button label="Continue" variant="secondary" onPress={() => navigation.navigate('Login')} />
              </View>
            </View>
          </ImageBackground>

          <View style={styles.footer}>
            <View style={styles.brand}>
              <LogoMark size={34} label={isBuept ? 'BÜ' : 'MET'} />
              <Text style={[styles.footerBrand, { color: theme.text }]}>{university?.shortName || 'BUEPT-APP'}</Text>
            </View>
            <Text style={[styles.disclaimer, { color: theme.muted }]}>
              Independent preparation tool. Not an official service of {university?.name || 'the university'}.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    minHeight: 74,
    borderBottomWidth: 1,
    paddingHorizontal: v2Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: v2Spacing.md,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm },
  brandTitle: { fontSize: 17, fontWeight: '900' },
  brandSub: { fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: v2Spacing.sm },
  page: { width: '100%', maxWidth: 1440, alignSelf: 'center', padding: v2Spacing.lg },
  hero: {
    minHeight: 580,
    borderRadius: v2Radius.xl,
    overflow: 'hidden',
    padding: v2Spacing.xxl,
    justifyContent: 'center',
    position: 'relative',
  },
  heroCompact: { minHeight: 560, padding: v2Spacing.lg },
  heroImage: { borderRadius: v2Radius.xl },
  heroContent: { maxWidth: 760 },
  heroContentCompact: { maxWidth: '100%' },
  heroPill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    marginBottom: v2Spacing.lg,
  },
  heroPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 58, lineHeight: 62, fontWeight: '900', letterSpacing: -2 },
  heroTitleCompact: { fontSize: 41, lineHeight: 45, letterSpacing: -1.2 },
  heroBody: { color: 'rgba(255,255,255,0.93)', fontSize: 17, lineHeight: 26, maxWidth: 700, marginTop: v2Spacing.lg },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm, marginTop: v2Spacing.xl },
  heroQuote: {
    position: 'absolute', right: v2Spacing.xl, bottom: v2Spacing.xl,
    width: 250, borderRadius: v2Radius.lg, padding: v2Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  quoteMark: { color: '#2563EB', fontSize: 28, lineHeight: 28, fontWeight: '900' },
  quoteText: { color: '#102A56', fontSize: 19, lineHeight: 25, fontWeight: '800' },
  promiseStrip: {
    marginTop: -26, marginHorizontal: v2Spacing.lg, minHeight: 104, borderRadius: v2Radius.lg,
    borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    padding: v2Spacing.md, zIndex: 4,
  },
  promiseItem: { flex: 1, minWidth: 180, flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm, padding: v2Spacing.sm },
  promiseIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  promiseCopy: { flex: 1 },
  promiseTitle: { fontSize: 13, fontWeight: '900' },
  promiseBody: { fontSize: 11, marginTop: 2 },
  sectionHeading: { marginTop: 82, marginBottom: v2Spacing.xl, maxWidth: 820 },
  sectionHeadingNoTop: { marginBottom: v2Spacing.xl, maxWidth: 820 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  sectionTitle: { fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -0.8 },
  sectionBody: { fontSize: 15, lineHeight: 23, marginTop: 10 },
  body: { fontSize: 13, lineHeight: 20 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.lg },
  stack: { flexDirection: 'column' },
  featureCard: { width: '48%', padding: 0, overflow: 'hidden' },
  featureMedia: { height: 190, padding: v2Spacing.md, justifyContent: 'flex-end' },
  featureMediaImage: { borderTopLeftRadius: v2Radius.lg, borderTopRightRadius: v2Radius.lg },
  featureOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,23,42,0.12)' },
  featureIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.95)' },
  featureBody: { padding: v2Spacing.lg },
  featureTitle: { fontSize: 20, fontWeight: '900', marginBottom: 7 },
  visualBand: { flexDirection: 'row', gap: v2Spacing.lg, marginTop: 82 },
  visualPhoto: { flex: 1.5, minHeight: 340, borderRadius: v2Radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  visualPhotoImage: { borderRadius: v2Radius.xl },
  visualOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,23,42,0.47)' },
  visualCopy: { padding: v2Spacing.xl, maxWidth: 620 },
  visualEyebrow: { color: '#DBEAFE', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  visualTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '900', marginTop: 7 },
  visualBody: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, marginTop: 9 },
  editorialCard: { flex: 0.6, minHeight: 340, borderRadius: v2Radius.xl, padding: v2Spacing.xl, justifyContent: 'space-between' },
  editorialQuote: { color: '#FFFFFF', fontSize: 28, lineHeight: 36, fontWeight: '700' },
  editorialMeta: { color: '#93C5FD', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  journeySection: { marginTop: 82, borderWidth: 1, borderRadius: v2Radius.xl, padding: v2Spacing.xl },
  journey: { flexDirection: 'row', gap: v2Spacing.md },
  journeyItem: { flex: 1, minWidth: 160, position: 'relative' },
  journeyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: v2Spacing.md },
  journeyCopy: { position: 'relative', zIndex: 2 },
  journeyNumber: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  journeyTitle: { fontSize: 16, fontWeight: '900', marginVertical: 5 },
  journeyLine: { position: 'absolute', top: 24, left: 58, right: -20, height: 1, zIndex: 0 },
  finalCta: { minHeight: 330, marginTop: 82, borderRadius: v2Radius.xl, overflow: 'hidden', justifyContent: 'center' },
  finalImage: { borderRadius: v2Radius.xl },
  finalCopy: { padding: v2Spacing.xxl, maxWidth: 780 },
  finalTitle: { color: '#FFFFFF', fontSize: 36, lineHeight: 42, fontWeight: '900' },
  finalBody: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 23, marginTop: v2Spacing.md },
  footer: { minHeight: 110, marginTop: v2Spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: v2Spacing.lg },
  footerBrand: { fontSize: 15, fontWeight: '900' },
  disclaimer: { fontSize: 11, flex: 1, textAlign: 'right' },
});
