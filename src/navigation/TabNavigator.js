import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LogoMark from '../components/LogoMark';
import { useUniversity } from '../context/UniversityContext';
import { getV2Theme, v2Radius, v2Shadow, v2Spacing } from '../theme/v2';

const Tab = createBottomTabNavigator();
const DESKTOP_RAIL_WIDTH = 228;

const META = {
  Today: { label: 'Today', icon: 'home-outline', iconActive: 'home' },
  Practice: { label: 'Practice', icon: 'book-outline', iconActive: 'book' },
  MockHub: { label: 'Mock', icon: 'document-text-outline', iconActive: 'document-text' },
  ProgressHub: { label: 'Progress', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  Profile: { label: 'Profile', icon: 'person-outline', iconActive: 'person' },
};

function DesktopRail({ state, navigation }) {
  const { university, uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);

  return (
    <View style={[styles.rail, { backgroundColor: theme.surface, borderRightColor: theme.border }, v2Shadow.card]}>
      <View style={styles.brand}>
        <LogoMark size={44} label={uniKey === 'odtu' ? 'ODTÜ' : 'BÜ'} />
        <View style={styles.brandCopy}>
          <Text style={[styles.brandTitle, { color: theme.text }]}>{university?.shortName || 'BUEPT'}</Text>
          <Text style={[styles.brandSub, { color: theme.muted }]} numberOfLines={1}>{university?.name || 'University Prep'}</Text>
        </View>
      </View>

      <View style={styles.railNav}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = META[route.name] || { label: route.name, icon: 'ellipse-outline', iconActive: 'ellipse' };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              style={({ pressed }) => [
                styles.railItem,
                focused && { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={focused ? meta.iconActive : meta.icon} size={20} color={focused ? theme.primary : theme.muted} />
              <Text style={[styles.railLabel, { color: focused ? theme.primaryDark : theme.muted }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.railFooter, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerEyebrow, { color: theme.primary }]}>FOCUS</Text>
        <Text style={[styles.footerCopy, { color: theme.muted }]}>
          {uniKey === 'odtu' ? 'Practice the next useful task.' : 'Prepare. Improve. Go further.'}
        </Text>
      </View>
    </View>
  );
}

export default function TabNavigator() {
  const { width } = useWindowDimensions();
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  return (
    <Tab.Navigator
      initialRouteName="Today"
      tabBar={isDesktop ? (props) => <DesktopRail {...props} /> : undefined}
      screenOptions={({ route }) => {
        const meta = META[route.name] || {};
        return {
          headerShown: false,
          sceneStyle: isDesktop ? { paddingLeft: DESKTOP_RAIL_WIDTH, backgroundColor: theme.canvas } : { backgroundColor: theme.canvas },
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
          tabBarLabelStyle: styles.mobileLabel,
          tabBarStyle: isDesktop
            ? { display: 'none' }
            : [
                styles.mobileBar,
                {
                  backgroundColor: theme.surface,
                  borderTopColor: theme.border,
                },
              ],
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? meta.iconActive : meta.icon} size={size || 21} color={color} />
          ),
          tabBarLabel: meta.label || route.name,
        };
      }}
    >
      <Tab.Screen
        name="Today"
        getComponent={() => React.lazy(() => import(/* webpackChunkName: "tab-v2-today" */ '../screens/v2/TodayScreen'))}
        options={{ tabBarButtonTestID: 'tab-today' }}
      />
      <Tab.Screen
        name="Practice"
        getComponent={() => React.lazy(() => import(/* webpackChunkName: "tab-v2-practice" */ '../screens/v2/PracticeHubScreen'))}
        options={{ tabBarButtonTestID: 'tab-practice' }}
      />
      <Tab.Screen
        name="MockHub"
        getComponent={() => React.lazy(() => import(/* webpackChunkName: "tab-v2-mock" */ '../screens/v2/MockHubScreen'))}
        options={{ tabBarButtonTestID: 'tab-mock' }}
      />
      <Tab.Screen
        name="ProgressHub"
        getComponent={() => React.lazy(() => import(/* webpackChunkName: "tab-v2-progress" */ '../screens/v2/ProgressHubScreen'))}
        options={{ tabBarButtonTestID: 'tab-progress' }}
      />
      <Tab.Screen
        name="Profile"
        getComponent={() => React.lazy(() => import(/* webpackChunkName: "tab-v2-profile" */ '../screens/v2/ProfileScreen'))}
        options={{ tabBarButtonTestID: 'tab-profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DESKTOP_RAIL_WIDTH,
    borderRightWidth: 1,
    paddingHorizontal: v2Spacing.md,
    paddingTop: v2Spacing.lg,
    zIndex: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: v2Spacing.sm,
    paddingHorizontal: v2Spacing.xs,
    paddingBottom: v2Spacing.xl,
  },
  brandCopy: { flex: 1 },
  brandTitle: { fontSize: 17, fontWeight: '900' },
  brandSub: { fontSize: 11, marginTop: 2 },
  railNav: { gap: 6 },
  railItem: {
    minHeight: 48,
    borderRadius: v2Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: v2Spacing.sm,
    paddingHorizontal: v2Spacing.md,
  },
  railLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.78 },
  railFooter: {
    marginTop: 'auto',
    borderTopWidth: 1,
    paddingHorizontal: v2Spacing.sm,
    paddingVertical: v2Spacing.lg,
  },
  footerEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  footerCopy: { fontSize: 12, lineHeight: 18, marginTop: 5, fontWeight: '600' },
  mobileBar: {
    minHeight: 66,
    paddingTop: 7,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  mobileLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
});
