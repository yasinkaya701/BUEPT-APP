import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { AppStateProvider } from './context/AppState';
import { colors } from './theme/tokens';
import AppErrorBoundary from './components/AppErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Tts from 'react-native-tts';
import SimulatorSmokeRunner from './dev/SimulatorSmokeRunner';
import { DEV_SMOKE_TEST_ENABLED } from './dev/smokeTestConfig';

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = React.useState(null);

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
              if (DEV_SMOKE_TEST_ENABLED && routeName) {
                console.log(`[SMOKE] ready on ${routeName}`);
              }
            }}
            onStateChange={() => {
              const routeName = navigationRef.getCurrentRoute()?.name || null;
              setCurrentRouteName(routeName);
              if (DEV_SMOKE_TEST_ENABLED && routeName) {
                console.log(`[SMOKE] route ${routeName}`);
              }
            }}
          >
            <RootNavigator />
          </NavigationContainer>
          <SimulatorSmokeRunner navigationRef={navigationRef} currentRouteName={currentRouteName} />
        </AppStateProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
