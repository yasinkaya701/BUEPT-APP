import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WritingScreen from '../screens/WritingScreen';
import VocabScreen from '../screens/VocabScreen';
import ListeningScreen from '../screens/ListeningScreen';
import SpeakingScreen from '../screens/SpeakingScreen';
import ReadingScreen from '../screens/ReadingScreen';
import GrammarScreen from '../screens/GrammarScreen';
import { typography, spacing } from '../theme/tokens';
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Reading: '📖',
  Grammar: '🧩',
  Writing: '✍️',
  Vocab: '📕',
  Listening: '🎧',
  Speaking: '🎤',
};
const TAB_ICON_RENDERERS = Object.fromEntries(
  Object.entries(TAB_ICONS).map(([routeName, icon]) => ([
    routeName,
    ({ focused }) => <TabIcon icon={icon} focused={focused} />,
  ]))
);

function TabIcon({ icon, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.iconEmoji, !focused && styles.iconEmojiMuted, focused && styles.iconEmojiActive]}>{icon}</Text>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarLabelStyle: styles.label,
        tabBarIconStyle: styles.iconStyle,
        tabBarItemStyle: styles.itemStyle,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarAllowFontScaling: false,
        tabBarIcon: TAB_ICON_RENDERERS[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Reading" component={ReadingScreen} />
      <Tab.Screen name="Grammar" component={GrammarScreen} />
      <Tab.Screen name="Writing" component={WritingScreen} />
      <Tab.Screen name="Vocab" component={VocabScreen} />
      <Tab.Screen name="Listening" component={ListeningScreen} />
      <Tab.Screen name="Speaking" component={SpeakingScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    alignSelf: 'center',
    maxWidth: 760,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderTopWidth: 1,
    height: 68,
    paddingHorizontal: 6,
    paddingBottom: 8,
    paddingTop: 6,
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.fontHeadline,
    fontSize: 9,
    marginTop: 1,
    fontWeight: '700',
  },
  itemStyle: {
    borderRadius: 14,
    marginHorizontal: 1,
    paddingVertical: 2,
  },
  iconStyle: {
    marginTop: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 24,
    borderRadius: 12,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconEmoji: {
    fontSize: 15,
  },
  iconEmojiActive: {
    fontSize: 17,
  },
  iconEmojiMuted: {
    opacity: 0.6,
  },
});
