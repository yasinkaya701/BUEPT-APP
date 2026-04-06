import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
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

const TAB_LABELS_DEFAULT = {
  Home: 'Home',
  Reading: 'Reading',
  Grammar: 'Grammar',
  Writing: 'Writing',
  Vocab: 'Vocab',
  Listening: 'Listening',
  Speaking: 'Speaking',
};

const TAB_LABELS_COMPACT = {
  Home: 'Home',
  Reading: 'Read',
  Grammar: 'Gram',
  Writing: 'Write',
  Vocab: 'Vocab',
  Listening: 'Listen',
  Speaking: 'Speak',
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

function CustomTabBarButton(props) {
  return (
    <Pressable
      {...props}
      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      style={({ pressed }) => [
        props.style,
        pressed && styles.tabButtonPressed,
      ]}
    />
  );
}

export default function TabNavigator() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isCompact = width < 520;

  const tabLabels = useMemo(
    () => (isCompact ? TAB_LABELS_COMPACT : TAB_LABELS_DEFAULT),
    [isCompact]
  );

  const tabSizing = useMemo(
    () => ({
      barHeight: isTablet ? 90 : 82,
      barPaddingHorizontal: isTablet ? 12 : 6,
      barPaddingTop: isTablet ? 8 : 7,
      barPaddingBottom: isTablet ? 12 : 10,
      labelSize: isTablet ? 13 : isCompact ? 11 : 12,
      itemPaddingHorizontal: isTablet ? 6 : 1,
    }),
    [isTablet, isCompact]
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabSizing.barHeight,
            paddingHorizontal: tabSizing.barPaddingHorizontal,
            paddingTop: tabSizing.barPaddingTop,
            paddingBottom: tabSizing.barPaddingBottom,
          },
        ],
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarLabel: tabLabels[route.name] || route.name,
        tabBarLabelStyle: [styles.label, { fontSize: tabSizing.labelSize }],
        tabBarIconStyle: styles.iconStyle,
        tabBarItemStyle: [styles.itemStyle, { paddingHorizontal: tabSizing.itemPaddingHorizontal }],
        tabBarActiveBackgroundColor: 'transparent',
        tabBarAllowFontScaling: false,
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: TAB_ICON_RENDERERS[route.name],
        tabBarButton: CustomTabBarButton,
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
    justifyContent: 'center',
    zIndex: 9999,
  },
  label: {
    fontFamily: typography.fontHeadline,
    marginTop: 2,
    lineHeight: 15,
    fontWeight: '700',
  },
  itemStyle: {
    borderRadius: 14,
    marginHorizontal: 0,
    minWidth: 0,
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
    fontSize: 16,
  },
  iconEmojiActive: {
    fontSize: 18,
  },
  iconEmojiMuted: {
    opacity: 0.6,
  },
  tabButtonPressed: {
    opacity: 0.75,
  },
});
