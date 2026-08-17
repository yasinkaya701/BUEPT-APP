import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, ImageBackground } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Card from '../components/Card';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 40, 0.82)',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  scrollContentCompact: {
    padding: spacing.md,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    color: '#D7DEFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    color: '#C9D1E8',
    lineHeight: 22,
  },
  showcase: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  showcaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(215, 222, 255, 0.35)',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  showcaseIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  showcaseTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: 4,
  },
  showcaseBody: {
    fontSize: typography.small,
    fontFamily: typography.fontBody,
    color: colors.muted,
    lineHeight: 18,
    flex: 1,
  },
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.small,
    fontFamily: typography.fontBody,
    color: colors.muted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ctaWrap: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footerNote: {
    fontSize: typography.small,
    color: '#98A2C8',
    textAlign: 'center',
    lineHeight: 18,
  },
  xxl: {
    paddingBottom: spacing.xxl,
  },
}

const BG_IMAGE = require('../assets/images/real_south_gate.jpg');
const levels = ['P1', 'P2', 'P3', 'P4'];
const levelLabels = {
  P1: 'A1 — Beginner',
  P2: 'A2 — Elementary',
  P3: 'B1 — Intermediate',
  P4: 'B2 — Upper Int.',
};

const showcase = [
  {
    icon: 'school-outline',
    accent: '#312E81',
    accentSoft: '#EEF2FF',
    title: 'Official BUSEPT Format',
    body: 'Reading, Listening, Writing, Grammar and Speaking practice built on the real BUEPT structure used at Boğaziçi University.',
  },
  {
    icon: 'create-outline',
    accent: '#B45309',
    accentSoft: '#FFFBEB',
    title: 'WASC-Scored Essay Bank',
    body: 'Study real BUSEPT essays scored by YADYOK graders, then get your own writing evaluated against the official 10-band rubric.',
  },
  {
    icon: 'pulse-outline',
    accent: '#0E7490',
    accentSoft: '#ECFEFF',
    title: 'Adaptive Daily Plan',
    body: 'A study plan that rebuilds itself from your weak areas — word formation, collocations, careful listening and connectors.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const { setLevel, setOnboarded, onboarded } = useAppState();
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const [selected, setSelected] = useState('P2');

  const startPlacement = () => {
    setLevel(selected);
    navigation.replace('PlacementTest');
  };

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <LogoMark size={40} label="B" />
            <Text style={styles.heroBadgeText}>Bosphorus-Ready</Text>
          </View>
          <Text style={styles.h1}>Boğaziçi Prep</Text>
          <Text style={styles.heroSub}>
            BUEPT hazırlık için tek başlangıç noktası. Boğaziçi standardında okuma, dinleme, yazma ve kelime çalışması —
            resmi sınav formatında, resmi puanlanmış örneklerle.
          </Text>
        </View>

        {/* ── Showcase ── */}
        <View style={styles.showcase}>
          {showcase.map((item) => (
            <View key={item.title} style={styles.showcaseCard}>
              <View style={[styles.showcaseIconWrap, { backgroundColor: item.accentSoft }]}>
                <Ionicons name={item.icon} size={22} color={item.accent} />
              </View>
              <Text style={styles.showcaseTitle}>{item.title}</Text>
              <Text style={styles.showcaseBody}>{item.body}</Text>
            </View>
          ))}
        </View>

        {/* ── Level selection ── */}
        <Card style={styles.card}>
          <Text style={styles.title}>Nereden başlıyorsun?</Text>
          <Text style={styles.subtitle}>
            Başlangıç seviyeni seç; program, quiz ritmi ve prompt zorluğu buna göre ayarlanır. İstersen hemen placement
            testini çözebilirsin.
          </Text>
          <View style={styles.chips}>
            {levels.map((lvl) => (
              <Chip key={lvl} label={`${lvl} · ${levelLabels[lvl]}`} active={selected === lvl} onPress={() => setSelected(lvl)} />
            ))}
          </View>
        </Card>

        <View style={styles.ctaWrap}>
          <Button label="Take Placement Test" icon="flash-outline" onPress={startPlacement} />
          <Button
            label="Skip and go to Dashboard"
            variant="ghost"
            onPress={() => {
              setLevel(selected);
              setOnboarded(true);
              navigation.replace('MainTabs');
            }}
          />
        </View>

        {onboarded ? (
          <Text style={styles.footerNote}>
            Onboarding tamamlandı. Bundan sonra ilk girişte Dashboard açılacak.
          </Text>
        ) : (
          <Text style={styles.footerNote}>
            İlk girişinde bu ekran bir kez gösterilir. Sonra Dashboard doğrudan açılır.
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

);
