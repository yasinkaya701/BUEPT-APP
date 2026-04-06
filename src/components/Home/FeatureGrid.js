import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../Card';
import { colors, spacing, typography } from '../../theme/tokens';

const FEATURES = [
  {
    id: 'placement',
    title: 'Placement',
    body: 'Diagnostics and CEFR mapping',
    route: 'PlacementTest',
    icon: 'bar-chart-outline',
    tone: '#1D4ED8',
    surface: '#EEF4FF',
  },
  {
    id: 'writing',
    title: 'Writing Studio',
    body: 'Draft, feedback, revision',
    route: 'Writing',
    icon: 'create-outline',
    tone: '#9A3412',
    surface: '#FFF7ED',
  },
  {
    id: 'speaking',
    title: 'Speaking',
    body: 'AI partner and oral practice',
    route: 'AISpeakingPartner',
    icon: 'mic-outline',
    tone: '#7C3AED',
    surface: '#F5F3FF',
  },
  {
    id: 'exams',
    title: 'BUEPT Exams',
    body: 'Official-style mock practice',
    route: 'Mock',
    icon: 'school-outline',
    tone: '#FFFFFF',
    surface: colors.primaryDark,
    dark: true,
  },
  {
    id: 'chat',
    title: 'Chat Coach',
    body: 'Fast study support',
    route: 'Chatbot',
    icon: 'chatbubble-ellipses-outline',
    tone: '#0F766E',
    surface: '#ECFEFF',
  },
  {
    id: 'resources',
    title: 'Resources',
    body: 'Guides and materials',
    route: 'Resources',
    icon: 'library-outline',
    tone: '#334155',
    surface: '#F8FAFC',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    body: 'Program and holidays',
    route: 'ClassScheduleCalendar',
    icon: 'calendar-outline',
    tone: '#5B21B6',
    surface: '#F5F3FF',
  },
  {
    id: 'vocab',
    title: 'Vocabulary',
    body: 'Word bank and weak areas',
    route: 'Vocab',
    icon: 'book-outline',
    tone: '#166534',
    surface: '#ECFDF3',
  },
];

export default function FeatureGrid({ navigation }) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 900;

  return (
    <View style={[styles.grid, isNarrow && styles.gridNarrow]}>
      {FEATURES.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.itemWrap, !isNarrow && styles.itemWrapWide]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate(item.route)}
        >
          <Card style={[styles.miniCard, { backgroundColor: item.surface }, item.dark && styles.darkCard]}>
            <View style={styles.cardHead}>
              <View style={[styles.iconBadge, item.dark ? styles.iconBadgeDark : null]}>
                <Ionicons name={item.icon} size={18} color={item.dark ? colors.primaryDark : item.tone} />
              </View>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={item.dark ? '#DDE8FF' : item.tone}
              />
            </View>
            <Text style={[styles.h3, item.dark && styles.darkCardTitle]}>{item.title}</Text>
            <Text style={[styles.body, item.dark && styles.darkCardBody]}>{item.body}</Text>
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, item.dark && styles.linkTextDark]}>Open</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridNarrow: {
    flexDirection: 'column',
  },
  itemWrap: {
    width: '100%',
  },
  itemWrapWide: {
    width: '48.7%',
  },
  miniCard: {
    padding: spacing.md,
    marginBottom: 0,
    minHeight: 146,
  },
  darkCard: {
    borderColor: colors.primary,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeDark: {
    backgroundColor: colors.surfaceRaised,
  },
  darkCardTitle: {
    color: colors.textOnDark,
  },
  darkCardBody: {
    color: colors.textOnDarkMuted,
  },
  h3: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  linkRow: {
    marginTop: 'auto',
  },
  linkText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  linkTextDark: {
    color: colors.textOnDark,
  },
});
