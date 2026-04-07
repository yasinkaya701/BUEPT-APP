import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Platform } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WritingScreen from '../screens/WritingScreen';
import VocabScreen from '../screens/VocabScreen';
import ListeningScreen from '../screens/ListeningScreen';
import SpeakingScreen from '../screens/SpeakingScreen';
import ReadingScreen from '../screens/ReadingScreen';
import GrammarScreen from '../screens/GrammarScreen';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';

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

const TAB_TEST_IDS = {
  Home: 'tab-home',
  Reading: 'tab-reading',
  Grammar: 'tab-grammar',
  Writing: 'tab-writing',
  Vocab: 'tab-vocab',
  Listening: 'tab-listening',
  Speaking: 'tab-speaking',
};

const TAB_ICON_RENDERERS = Object.fromEntries(
  Object.entries(TAB_ICONS).map(([routeName, icon]) => ([
    routeName,
    ({ focused }) => <TabIcon icon={icon} focused={focused} />,
  ]))
);

const TAB_ICON_RENDERERS_DENSE = Object.fromEntries(
  Object.entries(TAB_ICONS).map(([routeName, icon]) => ([
    routeName,
    ({ focused }) => <TabIcon icon={icon} focused={focused} dense />,
  ]))
);

function TabIcon({ icon, focused, dense = false }) {
  return (
    <View style={[styles.iconWrap, dense && styles.iconWrapDense, focused && styles.iconWrapActive]}>
      <Text style={[styles.iconEmoji, dense && styles.iconEmojiDense, !focused && styles.iconEmojiMuted, focused && styles.iconEmojiActive]}>{icon}</Text>
    </View>
  );
}

function CustomTabBarButton(props) {
  return (
    <Pressable
      {...props}
      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      style={({ pressed }) => [
        styles.tabButton,
        props.style,
        pressed && styles.tabButtonPressed,
      ]}
    />
  );
}

function WebSidebarTabBar({ state, descriptors, navigation, tabLabels }) {
  return (
    <View style={styles.webSidebar}>
      <View style={styles.webSidebarHero}>
        <View style={styles.webSidebarBadge}>
          <Text style={styles.webSidebarBadgeText}>BU</Text>
        </View>
        <Text style={styles.webSidebarEyebrow}>Bosphorus-ready</Text>
        <Text style={styles.webSidebarTitle}>BUEPT Web Campus</Text>
        <Text style={styles.webSidebarCopy}>
          Desktop workflow for reading, writing, vocab, and AI coaching in one place.
        </Text>
      </View>

      <View style={styles.webSidebarList}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const focused = state.index === index;
          const label = tabLabels[route.name] || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              testID={TAB_TEST_IDS[route.name]}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.webSidebarItem,
                focused && styles.webSidebarItemActive,
                pressed && styles.webSidebarItemPressed,
              ]}
            >
              <View style={[styles.webSidebarItemIcon, focused && styles.webSidebarItemIconActive]}>
                <Text style={[styles.webSidebarItemEmoji, focused && styles.webSidebarItemEmojiActive]}>
                  {TAB_ICONS[route.name]}
                </Text>
              </View>
              <View style={styles.webSidebarItemTextWrap}>
                <Text style={[styles.webSidebarItemLabel, focused && styles.webSidebarItemLabelActive]}>
                  {label}
                </Text>
                <Text style={[styles.webSidebarItemHint, focused && styles.webSidebarItemHintActive]}>
                  {descriptor?.options?.title || `${label} workspace`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.webSidebarFooter}>
        <Text style={styles.webSidebarFooterTitle}>AI status</Text>
        <Text style={styles.webSidebarFooterBody}>
          Local fallback is always available. If the API comes online, modules upgrade automatically.
        </Text>
      </View>
    </View>
  );
}

export default function TabNavigator() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWebDesktop = isWeb && width >= 1024;
  const isTablet = width >= 768;
  const isCompact = width < 520;

  const tabLabels = useMemo(
    () => (isCompact ? TAB_LABELS_COMPACT : TAB_LABELS_DEFAULT),
    [isCompact]
  );

  const tabSizing = useMemo(
    () => ({
      barHeight: isWebDesktop ? 64 : isTablet ? 90 : 82,
      barPaddingHorizontal: isWebDesktop ? 10 : isTablet ? 12 : 6,
      barPaddingTop: isWebDesktop ? 8 : isTablet ? 8 : 7,
      barPaddingBottom: isWebDesktop ? 8 : isTablet ? 12 : 10,
      labelSize: isWebDesktop ? 14 : isTablet ? 13 : isCompact ? 11 : 12,
      itemPaddingHorizontal: isWebDesktop ? 8 : isTablet ? 6 : 1,
    }),
    [isWebDesktop, isTablet, isCompact]
  );

  const computedTabBarStyle = useMemo(() => {
    if (isWebDesktop) {
      return [
        styles.tabBarWeb,
        width >= 1400 && styles.tabBarWebWide,
        {
          height: tabSizing.barHeight,
          paddingHorizontal: tabSizing.barPaddingHorizontal,
          paddingTop: tabSizing.barPaddingTop,
          paddingBottom: tabSizing.barPaddingBottom,
        },
      ];
    }

    return [
      styles.tabBar,
      {
        height: tabSizing.barHeight,
        paddingHorizontal: tabSizing.barPaddingHorizontal,
        paddingTop: tabSizing.barPaddingTop,
        paddingBottom: tabSizing.barPaddingBottom,
      },
    ];
  }, [isWebDesktop, tabSizing, width]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      detachInactiveScreens
      tabBar={isWebDesktop ? (props) => <WebSidebarTabBar {...props} tabLabels={tabLabels} /> : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        unmountOnBlur: isWeb,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        animation: isWebDesktop ? 'none' : 'shift',
        tabBarStyle: isWebDesktop ? { display: 'none' } : computedTabBarStyle,
        sceneStyle: isWebDesktop ? styles.sceneWebDesktop : undefined,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarLabel: tabLabels[route.name] || route.name,
        tabBarLabelStyle: [styles.label, { fontSize: tabSizing.labelSize }],
        tabBarIconStyle: styles.iconStyle,
        tabBarItemStyle: [
          styles.itemStyle,
          isWebDesktop && styles.itemStyleWeb,
          { paddingHorizontal: tabSizing.itemPaddingHorizontal },
        ],
        tabBarActiveBackgroundColor: 'transparent',
        tabBarAllowFontScaling: false,
        tabBarLabelPosition: isWebDesktop ? 'beside-icon' : 'below-icon',
        tabBarIcon: isWebDesktop ? TAB_ICON_RENDERERS_DENSE[route.name] : TAB_ICON_RENDERERS[route.name],
        tabBarButton: CustomTabBarButton,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Home }} />
      <Tab.Screen name="Reading" component={ReadingScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Reading }} />
      <Tab.Screen name="Grammar" component={GrammarScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Grammar }} />
      <Tab.Screen name="Writing" component={WritingScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Writing }} />
      <Tab.Screen name="Vocab" component={VocabScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Vocab }} />
      <Tab.Screen name="Listening" component={ListeningScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Listening }} />
      <Tab.Screen name="Speaking" component={SpeakingScreen} options={{ tabBarButtonTestID: TAB_TEST_IDS.Speaking }} />
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
  tabBarWeb: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    alignSelf: 'center',
    width: 'auto',
    maxWidth: 1260,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(10px)',
  },
  tabBarWebWide: {
    maxWidth: 1400,
  },
  sceneWebDesktop: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingLeft: 304,
    paddingRight: spacing.lg,
  },
  label: {
    fontFamily: typography.fontHeadline,
    marginTop: 2,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  itemStyle: {
    borderRadius: 14,
    marginHorizontal: 0,
    minWidth: 0,
    paddingVertical: 2,
  },
  itemStyleWeb: {
    marginHorizontal: 2,
    minHeight: 44,
    justifyContent: 'center',
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
  iconWrapDense: {
    width: 24,
    height: 24,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconEmoji: {
    fontSize: 16,
  },
  iconEmojiDense: {
    fontSize: 14,
  },
  iconEmojiActive: {
    fontSize: 18,
  },
  iconEmojiMuted: {
    opacity: 0.6,
  },
  tabButton: {
    borderRadius: 14,
  },
  tabButtonPressed: {
    opacity: 0.75,
  },
  webSidebar: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    bottom: spacing.lg,
    width: 264,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(8, 15, 35, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    justifyContent: 'space-between',
    ...shadow.premium,
    zIndex: 2000,
    backdropFilter: 'blur(14px)',
  },
  webSidebarHero: {
    gap: spacing.sm,
  },
  webSidebarBadge: {
    width: 54,
    height: 54,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  webSidebarBadgeText: {
    fontFamily: typography.fontHeadline,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textOnDark,
  },
  webSidebarEyebrow: {
    color: 'rgba(191, 219, 254, 0.9)',
    fontFamily: typography.fontHeadline,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  webSidebarTitle: {
    color: colors.textOnDark,
    fontFamily: typography.fontHeadline,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  webSidebarCopy: {
    color: colors.textOnDarkMuted,
    fontFamily: typography.fontBody,
    fontSize: 14,
    lineHeight: 21,
  },
  webSidebarList: {
    flex: 1,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  webSidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  webSidebarItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.24)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  webSidebarItemPressed: {
    opacity: 0.82,
  },
  webSidebarItemIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  webSidebarItemIconActive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  webSidebarItemEmoji: {
    fontSize: 18,
  },
  webSidebarItemEmojiActive: {
    fontSize: 20,
  },
  webSidebarItemTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  webSidebarItemLabel: {
    color: colors.textOnDark,
    fontFamily: typography.fontHeadline,
    fontSize: 15,
    fontWeight: '700',
  },
  webSidebarItemLabelActive: {
    color: '#FFFFFF',
  },
  webSidebarItemHint: {
    marginTop: 2,
    color: 'rgba(226, 232, 240, 0.72)',
    fontFamily: typography.fontBody,
    fontSize: 12,
    lineHeight: 17,
  },
  webSidebarItemHintActive: {
    color: 'rgba(255,255,255,0.88)',
  },
  webSidebarFooter: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  webSidebarFooterTitle: {
    color: colors.textOnDark,
    fontFamily: typography.fontHeadline,
    fontSize: 13,
    fontWeight: '800',
  },
  webSidebarFooterBody: {
    marginTop: spacing.xs,
    color: colors.textOnDarkMuted,
    fontFamily: typography.fontBody,
    fontSize: 12,
    lineHeight: 18,
  },
});
