import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SkillsScreen from '../screens/SkillsScreen';
import WritingScreen from '../screens/WritingScreen';
import VocabScreen from '../screens/VocabScreen';
import ListeningScreen from '../screens/ListeningScreen';
import SpeakingScreen from '../screens/SpeakingScreen';
import { colors, typography, spacing, radius } from '../theme/tokens';
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Skills: '📚',
  Writing: '✍️',
  Vocab: '📖',
  Listening: '🎧',
  Speaking: '🎤',
};

function TabIcon({ icon, focused, label }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.iconEmoji}>{icon}</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused }) => (
          <TabIcon icon={TAB_ICONS[route.name]} focused={focused} label={route.name} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Skills" component={SkillsScreen} />
      <Tab.Screen name="Writing" component={WritingScreen} />
      <Tab.Screen name="Vocab" component={VocabScreen} />
      <Tab.Screen name="Listening" component={ListeningScreen} />
      <Tab.Screen name="Speaking" component={SpeakingScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    position: 'absolute',
    bottom: 24, // Float above bottom edge
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.pill, // Floating pill shape
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#1E293B',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    height: 64, // Sleeker height
    paddingBottom: 0, // Remove notch padding since it's floating
    paddingTop: 0,
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.fontHeadline,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8 // Slight padding inside the pill
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 32,
    marginTop: 8 // Balance icon vertically
  },
  iconEmoji: { fontSize: 20 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});
