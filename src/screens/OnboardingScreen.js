import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Screen from '../components/Screen';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';

const levels = ['P1', 'P2', 'P3', 'P4'];

export default function OnboardingScreen({ navigation }) {
  const { setLevel } = useAppState();
  const [selected, setSelected] = useState('P2');

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.hero}>
        <LogoMark size={64} label="B" />
        <View style={styles.heroText}>
          <Text style={styles.h1}>Boğaziçi Prep</Text>
          <Text style={styles.sub}>BUEPT hazırlık</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Level Selection</Text>
        <Text style={styles.body}>Başlangıç seviyeni seç. Programın ritmi buna göre ayarlanır.</Text>
        <View style={styles.chips}>
          {levels.map((lvl) => (
            <Chip
              key={lvl}
              label={lvl}
              active={selected === lvl}
              onPress={() => setSelected(lvl)}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>What You’ll Get</Text>
        <Text style={styles.body}>• Reading + Listening + Writing + Grammar</Text>
        <Text style={styles.body}>• Vocab practice + unknown words list</Text>
        <Text style={styles.body}>• Essay templates + connectors</Text>
      </View>

      <Button
        label="Take Placement Test"
        onPress={() => {
          setLevel(selected);
          navigation.replace('PlacementTest');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
    justifyContent: 'center'
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  heroText: {
    flex: 1
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.sm
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
    color: colors.text
  }
});
