/**
 * LandingScreen.js — public marketing landing page for BUEPT-APP
 *
 * The first touchpoint for web visitors before sign-up. Follows the
 * "Midnight Sapphire" design language (real_south_gate hero, deep-navy
 * surfaces, gold accents) so the brand feels continuous from marketing
 * page into the app.
 *
 * Sections: header, hero with animated rise, stats band, feature grid,
 * "Nasıl Çalışıyor" steps, social-proof strips, other-university preview,
 * FAQ accordion, final CTA, footer. NO pricing (product decision).
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, radius, spacing } from '../theme/tokens';
import Button from '../components/Button';
import Card from '../components/Card';
import MotionGroup from '../components/ui/MotionGroup';
import CountUp from '../components/ui/CountUp';
import { UNIVERSITIES } from '../config/universities';
import { useUniversity } from '../context/UniversityContext';
const isWeb = Platform.OS === 'web';
const STATS_BY_UNI = {
  buept: [
    { value: 28000, suffix: '+', label: 'Soru bankası' },
    { value: 40, suffix: '+', label: 'Tam mock sınav' },
    { value: 4, suffix: '', label: 'AI puanlamalı beceri' },
    { value: 3.5, suffix: ' saat', label: 'Resmi sınav replikası' },
  ],
  odtu: [
    { value: 32, suffix: ' puan', label: 'Okuma ağırlıklı puan' },
    { value: 4, suffix: '+', label: 'Tam ODTÜ formatlı mock' },
    { value: 4, suffix: '', label: 'AI puanlamalı beceri' },
    { value: 165, suffix: ' dk', label: 'Tek oturum sınav replikası' },
  ],
};
const FEATURES_BY_UNI = {
  buept: {
    icon: 'headset-outline',
    title: 'Resmi BUSEPT Formatı',
    body: 'Selective + Careful Listening, Reading I/II ve iki essay — gerçek sınavın üç resmi bölümünün birebir kopyası. (Gerçek BUSEPT\'te Speaking yok; mülakat pratiği bonus olarak sunulur.)',
    color: colors.skill.listening,
    soft: colors.skillSoft.listening,
  },
  odtu: {
    icon: 'headset-outline',
    title: 'Resmi ODTÜ İYS Formatı',
    body: 'Dinleme, okuma, not alma ve yazma tek oturumda; yüz yüze konuşma bölümüyle birlikte. Okuma puanın baskın (~32 puan) — ona göre çalış. Konuşma gerçek sınavda var; bonus değil.',
    color: colors.skill.listening,
    soft: colors.skillSoft.listening,
  },
};

const FEATURES = [
  {
    icon: 'document-text-outline',
    title: 'WASC Puanlı Essay Bankası',
    body: 'Puanlanmış gerçek essay örnekleri ve WASC rubricine bağlı AI yazma değerlendirmesi.',
    color: colors.skill.writing,
    soft: colors.skillSoft.writing,
  },
  {
    icon: 'mic-outline',
    title: 'Gerçek Konuşma Değerlendirmesi',
    body: 'Mülakat simülasyonu ile telaffuz, akıcılık ve içerik puanlaması. BUSEPT\'te speaking yok — bu, üniversite mülakatları ve genel pratik için bonus.',
    color: colors.skill.speaking,
    soft: colors.skillSoft.speaking,
  },
  {
    icon: 'layers-outline',
    title: 'SRS Zayıf Kelime Motoru',
    body: 'Mock sınavlarda kaçırılan kelimeler aralıklı tekrar kuyruğuna düşer. Zayıf alanlar hatırlatmayla kapanır.',
    color: colors.skill.vocab,
    soft: colors.skillSoft.vocab,
  },
  {
    icon: 'calendar-outline',
    title: 'Günlük Adaptif Plan',
    body: 'Seviyene göre her gün otomatik iş planı. Progress takibi, badge sistemi ve zincir motivasyonu.',
    color: colors.accent,
    soft: colors.accentSoft,
  },
  {
    icon: 'sparkles-outline',
    title: 'AI Mock Üretici',
    body: 'Gemini ile P1–P4 seviyelerinde sınırsız resmi format mock. LLM anahtarı olmadan da 4 hazır mock var.',
    color: '#1D4ED8',
    soft: colors.primaryLight,
  },
];

const STEPS = [
  { icon: 'clipboard-outline', title: 'Seviye tespiti', body: '10 dakikalık placement testiyle P seviyen belirilir.' },
  { icon: 'list-outline', title: 'Günlük plan', body: 'Uygulama her gün dinleme, okuma ve kelime işleri atar.' },
  { icon: 'school-outline', title: 'Mock sınav', body: 'Resmi formatta tam deneme; AI essay puanlaması ve konuşma provası.' },
  { icon: 'refresh-outline', title: 'SRS tekrar', body: 'Yanlış soruların kelimeleri aralıklı tekrarla pekiştirilir.' },
];
const STEP3_BODY_BY_UNI = {
  buept: 'Resmi formatta tam deneme; AI essay puanlaması ve bonus mülakat provası.',
  odtu: 'Tek oturumda tam ODTÜ format denemesi: dinleme, okuma, not alma, essay ve yüz yüze konuşma provası.',
};

const FAQS = [
  {
    q: 'BUSEPT tam olarak nedir?',
    a: 'Boğaziçi Üniversitesi YADYÖK tarafından düzenlenen İngilizce Yeterlilik Sınavı\'dır. Üç bölümden oluşur: Listening, Reading ve Writing. Writing ortalaması 56+, Listening + Reading toplamı 60+ olmalıdır; genel notunuz C (60–64) ve üzeriyse geçersiniz. Sonuçlar 2 yıl geçerlidir.'
  },
  {
    q: 'Bu platform ücretsiz mi?',
    a: 'Evet. Tüm çekirdek özellikler — soru bankası, mock sınavlar, placement testi, günlük plan ve SRS motoru — şu anda ücretsiz. AI mock üretimi için Gemini anahtarı yeterlidir.',
  },
  {
    q: 'Mobil uygulamayı nereden indiririm?',
    a: 'Android sürümü GitHub Releases sayfasında APK olarak yayında. iOS sürümü için Mac\'te tek komutla derleme mümkündür; mağaza yayını hazırlık aşamasındadır.',
  },
  {
    q: 'LLM anahtarı olmadan kullanabilir miyim?',
    a: 'Evet. P1–P4 seviyelerinde 4 tam resmi format offline mock hemen kullanılabilir. AI üretici, essay bankası ve gelişmiş puanlama Gemini anahtarı ister.',
  },
];

const FAQS_ODTU = [
  {
    q: 'ODTÜ İYS (EPE) nasıl bir sınavdır?',
    a: 'ODTÜ SFL\'nin resmi İngilizce Yeterlilik Sınavı tek oturumda (~165 dk) yapılır: Dinleme, Okuma, Not Alma ve Yazma. Yüz yüze konuşma bölümü de gerçek sınavda vardır. Geçme bandı ~60/100\'dür; okuma en büyük puan payına sahiptir (~32/76).',
  },
  {
    q: 'Bu platform ücretsiz mi?',
    a: 'Evet. Tüm çekirdek özellikler — ODTÜ formatlı mock sınavlar, günlük plan, SRS motoru ve not alma bloğu — şu anda ücretsiz. AI mock üretimi için Gemini anahtarı yeterlidir.',
  },
  {
    q: 'Mobil uygulamayı nereden indiririm?',
    a: 'Android sürümü GitHub Releases sayfasında APK olarak yayında. iOS sürümü için Mac\'te tek komutla derleme mümkündür; mağaza yayını hazırlık aşamasındadır.',
  },
  {
    q: 'LLM anahtarı olmadan kullanabilir miyim?',
    a: 'Evet. 4 tam ODTÜ formatlı offline mock hemen kullanılabilir. AI üretici, essay bankası ve gelişmiş puanlama Gemini anahtarı ister.',
  },
];

const OTHER_UNIS = UNIVERSITIES.filter((u) => u.key !== 'buept' && u.key !== 'odtu').slice(0, 2);

export default function LandingScreen({ navigation }) {
  const { university, uniKey } = useUniversity();
  const isOdtu = uniKey === 'odtu';
  const STATS = STATS_BY_UNI[uniKey] || STATS_BY_UNI.buept;
  const [openFaq, setOpenFaq] = useState(null);
  const heroFade = useMemo(() => new Animated.Value(0), []);
  const heroRise = useMemo(() => new Animated.Value(18), []);

  React.useEffect(() => {
    if (!isWeb) return;
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(heroRise, { toValue: 0, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [heroFade, heroRise]);

  const toggleFaq = useCallback((i) => setOpenFaq((o) => (o === i ? null : i)), []);

  const steps = useMemo(
    () =>
      STEPS.map((s, i) => (i === 2 ? { ...s, body: STEP3_BODY_BY_UNI[uniKey] || s.body } : s)),
    [uniKey],
  );

  const heroImg = useMemo(
    () => (university.images && university.images.hero) || require('../assets/images/real_south_gate.jpg'),
    [university],
  );

  const featureFormat = FEATURES_BY_UNI[uniKey] || FEATURES_BY_UNI.buept;
  const features = [featureFormat, ...FEATURES.slice(1)];

  const start = useCallback(() => {
    if (isOdtu) {
      // ODTÜ build: enter the app directly (placement test is Boğaziçi-specific).
      navigation.navigate('TodayBoard');
      return;
    }
    navigation.navigate('PlacementTest');
  }, [navigation, isOdtu]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoBadge, { backgroundColor: university.accent }]}>
            <Text style={styles.logoText}>{isOdtu ? 'MET' : 'BÜ'}</Text>
          </View>
          <Text style={styles.brandName}>{isOdtu ? 'ODTÜ PREP' : 'BOĞAZİÇİ PREP'}</Text>
        </View>
        <View style={styles.headerRight}>
          <Button label="Giriş Yap" variant="ghost" onPress={() => navigation.navigate('Login')} />
          <Button label="Hemen Başla" onPress={start} />
        </View>
      </View>

      {/* ── Hero ── */}
      <ImageBackground source={heroImg} style={styles.hero} resizeMode="cover">
        <LinearGradient colors={['rgba(13, 18, 37, 0.82)', 'rgba(13, 18, 37, 0.94)']} style={styles.heroOverlay} />
        <Animated.View style={[styles.heroInner, { opacity: heroFade, transform: [{ translateY: heroRise }] }]}>
          <View style={styles.pill}>
            <Ionicons name="school-outline" size={13} color={colors.accentBright} />
            <Text style={styles.pillText}>
              {isOdtu ? 'ODTÜ İYS/EPE İÇİN · RESMİ SFL FORMATI' : 'BUSEPT\'E ÖZEL · YADYÖK FORMATI'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            {isOdtu ? 'ODTÜ İYS\'e hazırlığın' : 'BUSEPT\'e hazırlığın'}{'\n'}tek platformu
          </Text>
          <Text style={styles.heroSub}>
            {isOdtu
              ? 'Resmi sınavın birebir replikası: dinleme, okuma, not alma, essay ve yüz yüze konuşma. AI puanlamayla gerçek sınavdan önce her bölümü provaya al.'
              : 'Resmi sınavın birebir replikası: dinleme, okuma ve iki essay.\nAI puanlamayla gerçek sınavdan önce her bölümü provaya al.'}
          </Text>
          <View style={styles.heroCtaRow}>
            <Button label="Hemen Başla" icon="play" onPress={start} />
            <Button label="Tanıtım Turu" variant="ghost" onPress={() => navigation.navigate('DemoFeatures')} />
          </View>
        </Animated.View>
      </ImageBackground>

      {/* ── Stats band ── */}
      <View style={styles.statsBand}>
        <MotionGroup stagger={90}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statTile}>
              <CountUp value={s.suffix === ' saat' ? '3.5 saat' : String(s.value)} textStyle={styles.statValue} />
              {s.suffix !== ' saat' && <Text style={styles.statSuffix}>+</Text>}
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </MotionGroup>
      </View>

      {/* ── Features ── */}
      <View style={styles.section}>
        <Text style={styles.sectionKicker}>ÖZELLİKLER</Text>
        <Text style={styles.sectionTitle}>Her beceri için sınav kalitesinde araç</Text>
        <View style={styles.featureGrid}>
          <MotionGroup stagger={70}>
            {features.map((f, i) => (
              <Card key={i} style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: f.soft }]}>
                  <Ionicons name={f.icon} size={22} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </Card>
            ))}
          </MotionGroup>
        </View>
      </View>

      {/* ── How it works ── */}
      <View style={[styles.section, styles.sectionAlt]}>
        <Text style={styles.sectionKicker}>NASIL ÇALIŞIYOR</Text>
        <Text style={styles.sectionTitle}>Dört adımda sınava hazır</Text>
        <View style={styles.stepsGrid}>
          <MotionGroup stagger={80}>
            {steps.map((s, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <Ionicons name={s.icon} size={20} color={colors.primary} />
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            ))}
          </MotionGroup>
        </View>
      </View>

      {/* ── Social proof strip ── */}
      <View style={styles.proofStrip}>
        <View style={styles.proofRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.proofText}>
            {isOdtu ? 'ODTÜ İYS formatına birebir uyarlanmış dijital hazırlık platformu' : 'Boğaziçi\'ne özgü ilk ve tek dijital hazırlık platformu'}
          </Text>
        </View>
        <View style={styles.proofRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.proofText}>APK üretim derlemesi doğrulandı — offline mock&apos;lar anahtarsız çalışır</Text>
        </View>
        <View style={styles.proofRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.proofText}>36/36 test, 0 lint hatası — her release doğrulanarak yayına</Text>
        </View>
      </View>

      {/* ── Other universities ── */}
      <View style={styles.section}>
        <Text style={styles.sectionKicker}>GENİŞLEME</Text>
        <Text style={styles.sectionTitle}>
          {isOdtu ? 'Aynı altyapı, diğer üniversiteler' : 'Aynı platform, diğer üniversiteler'}
        </Text>
        <Text style={styles.otherSub}>
          {isOdtu
            ? 'Boğaziçi (BUSEPT) versiyonu ayrı bir sitede yayında; YTÜ, İTÜ, Sabancı ve Bilkent çok yakında bu altyapıda.'
            : 'YTÜ-EPE, İTÜ-EPE, Sabancı PE ve Bilkent PPE altyapı hazır — resmi format duyurulduğunda aynı platformdan açılır.'}
        </Text>
        <View style={styles.otherGrid}>
          <MotionGroup stagger={70}>
            {OTHER_UNIS.map((u) => (
              <Card key={u.key} style={styles.otherCard}>
                <View style={[styles.otherBadge, { backgroundColor: u.accentSoft }]}>
                  <Text style={[styles.otherBadgeText, { color: u.accent }]}>{u.shortName}</Text>
                </View>
                <Text style={styles.otherName}>{u.name}</Text>
                <Text style={styles.otherBlurb}>{u.blurb}</Text>
                <View style={styles.comingBadge}>
                  <Text style={styles.comingText}>Yakında</Text>
                </View>
              </Card>
            ))}
          </MotionGroup>
        </View>
      </View>

      {/* ── FAQ ── */}
      <View style={[styles.section, styles.sectionAlt]}>
        <Text style={styles.sectionKicker}>SSS</Text>
        <Text style={styles.sectionTitle}>Sık sorulanlar</Text>
        <View style={styles.faqList}>
          {FAQS.map((f, i) => (
            <Pressable
              key={i}
              onPress={() => toggleFaq(i)}
              accessibilityRole="button"
              accessibilityLabel={f.q}
            >
              <Card style={styles.faqCard}>
                <View style={styles.faqHead}>
                  <Text style={styles.faqQuestion}>{f.q}</Text>
                  <Ionicons
                    name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.muted}
                  />
                </View>
                {openFaq === i && <Text style={styles.faqAnswer}>{f.a}</Text>}
              </Card>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Final CTA ── */}
      <View style={styles.finalCta}>
        <Text style={styles.finalTitle}>
          {isOdtu ? 'ODTÜ İYS\'e hazır mısın?' : 'BUSEPT\'e hazır mısın?'}
        </Text>
        <Text style={styles.finalSub}>
          {isOdtu
            ? 'İlk ODTÜ formatlı mock sınavınla başla: dinleme, okuma, not alma ve essay. Günlük planın aynı gün hazır.'
            : 'Placement testinle başla, 10 dakikada seviyeni öğren. Günlük planın ve ilk mock sınavın aynı gün hazır.'}
        </Text>
        <Button
          label={isOdtu ? 'İlk Mock Sınava Başla' : 'Placement Testine Başla'}
          icon="school-outline"
          onPress={start}
          style={styles.finalBtn}
        />
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>{isOdtu ? 'ODTÜ PREP' : 'BOĞAZİÇİ PREP'}</Text>
        <Text style={styles.footerCopy}>
          {isOdtu
            ? 'Resmi ODTÜ veya SFL ile bağlantısı yoktur; bağımsız bir hazırlık aracıdır.'
            : 'Resmi Boğaziçi Üniversitesi veya YADYÖK ile bağlantısı yoktur; bağımsız bir hazırlık aracıdır.'}
        </Text>
        <Text style={styles.footerCopy}>© 2026 BUEPT-APP — Açık kaynak · GitHub&apos;da yayında</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(13, 18, 37, 0.97)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#FFF', fontSize: 15, fontWeight: '900', fontFamily: typography.fontHeadline },
  brandName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: typography.fontHeadline,
  },
  headerRight: { flexDirection: 'row', gap: 8 },

  hero: { minHeight: 520, padding: 28, justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroInner: { paddingTop: 40 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },
  pillText: { color: colors.accentBright, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    fontFamily: typography.fontHeadline,
    lineHeight: 48,
    marginBottom: 14,
  },
  heroSub: { color: 'rgba(226,232,240,0.88)', fontSize: 16, lineHeight: 24, maxWidth: 560, marginBottom: 26 },
  heroCtaRow: { flexDirection: 'row', gap: 12 },

  statsBand: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    paddingVertical: 26,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statTile: { alignItems: 'center', padding: 10, minWidth: '40%' },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: typography.fontHeadline,
    color: colors.primary,
  },
  statSuffix: { fontSize: 13, color: colors.muted, marginTop: 2 },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  section: { padding: spacing.xxl, backgroundColor: '#FFFFFF' },
  sectionAlt: { backgroundColor: colors.surfaceAlt },
  sectionKicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.primary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: typography.fontHeadline,
    color: colors.primaryDeeper,
    marginBottom: 22,
  },

  featureGrid: { gap: 14 },
  featureCard: { padding: 18 },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  featureBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },

  stepsGrid: { gap: 12 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  stepNumBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: { color: colors.primary, fontWeight: '900', fontSize: 14 },
  stepTitle: { fontSize: 15, fontWeight: '800', color: colors.text, minWidth: 120 },
  stepBody: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  proofStrip: {
    backgroundColor: colors.primaryDeeper,
    padding: spacing.lg,
    gap: 12,
  },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proofText: { color: 'rgba(241,245,249,0.92)', fontSize: 13, flex: 1 },

  otherSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
    maxWidth: 620,
  },
  otherGrid: { gap: 14 },
  otherCard: { padding: 18, position: 'relative' },
  otherBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  otherBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  otherName: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  otherBlurb: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, paddingRight: 60 },
  comingBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  comingText: { fontSize: 10, fontWeight: '800', color: colors.accent, letterSpacing: 1 },
  liveBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: colors.successSoft || '#e6f7ee',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  liveText: { fontSize: 10, fontWeight: '800', color: colors.success, letterSpacing: 1 },

  faqList: { gap: 10 },
  faqCard: { padding: 16 },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, paddingRight: 12 },
  faqAnswer: { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginTop: 10 },

  finalCta: {
    backgroundColor: '#312E81',
    padding: spacing.xxl,
    alignItems: 'center',
  },
  finalTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    fontFamily: typography.fontHeadline,
    marginBottom: 10,
  },
  finalSub: {
    color: 'rgba(226,232,240,0.88)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 520,
  },
  finalBtn: { minWidth: 280 },

  footer: {
    backgroundColor: '#0B1220',
    padding: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  footerBrand: { color: '#E2E8F0', fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  footerCopy: { color: 'rgba(148,163,184,0.8)', fontSize: 11, textAlign: 'center' },
});
