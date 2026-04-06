import React from 'react';
import { LogBox, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './navigation/RootNavigator';
import { AppStateProvider } from './context/AppState';
import { colors } from './theme/tokens';
import AppErrorBoundary from './components/AppErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Tts from 'react-native-tts';
import SimulatorSmokeRunner from './dev/SimulatorSmokeRunner';

// Disable react-native-screens globally as early as possible.
// This avoids the iOS pointerEvents freeze that can make taps unresponsive.
enableScreens(false);

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = React.useState(null);

  const syncWebNavigationDebug = React.useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const isReady = typeof navigationRef.isReady === 'function' ? navigationRef.isReady() : false;
    window.__BUEPT_NAV__ = navigationRef;
    window.__BUEPT_ROUTE__ = isReady ? navigationRef.getCurrentRoute?.() || null : null;
  }, [navigationRef]);

  React.useEffect(() => {
    if (__DEV__) {
      LogBox.ignoreAllLogs(true);
    }
  }, []);

  React.useEffect(() => {
    try {
      Tts.getInitStatus().then(() => {
        Tts.setDefaultLanguage('en-US');
        Tts.setIgnoreSilentSwitch('ignore');
        Tts.setDucking(true);
      }).catch(err => console.log('TTS init error in App.js:', err));
    } catch (e) { console.log(e) }
  }, []);

  React.useEffect(() => {
    syncWebNavigationDebug();
    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        delete window.__BUEPT_NAV__;
        delete window.__BUEPT_ROUTE__;
      }
    };
  }, [syncWebNavigationDebug]);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      primary: colors.primary,
      card: colors.surface,
      text: colors.text,
      border: colors.secondary
    }
  };
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <AppStateProvider>
          <NavigationContainer
            ref={navigationRef}
            theme={navTheme}
            onReady={() => {
              const routeName = navigationRef.getCurrentRoute()?.name || null;
              setCurrentRouteName(routeName);
              syncWebNavigationDebug();
            }}
            onStateChange={() => {
              const routeName = navigationRef.getCurrentRoute()?.name || null;
              setCurrentRouteName(routeName);
              syncWebNavigationDebug();
            }}
          >
            <RootNavigator />
            {Platform.OS !== 'web' ? (
              <SimulatorSmokeRunner navigationRef={navigationRef} currentRouteName={currentRouteName} />
            ) : null}
          </NavigationContainer>
        </AppStateProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
