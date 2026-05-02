import React from 'react';
import { LogBox, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { AppStateProvider } from './context/AppState';
import RootNavigator from './navigation/RootNavigator';
import { colors } from './theme/tokens';
import AppErrorBoundary from './components/AppErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Tts from 'react-native-tts';
import SimulatorSmokeRunner from './dev/SimulatorSmokeRunner';
import BueptChatButton from './components/GlobalChatButton';

// Only touch react-native-screens on iOS.
if (Platform.OS === 'ios') {
  enableScreens(false);
}

// Web: linking is disabled to prevent 404s on GitHub Pages
const LINKING_CONFIG = undefined;

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

  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.__BUEPT_NAV__ = navigationRef;
    }
    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        delete window.__BUEPT_NAV__;
      }
    };
  }, [navigationRef]);

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
    const isMobileWeb = Platform.OS === 'web' && (typeof window !== 'undefined' && window.innerWidth < 768);
    
    return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, height: Platform.OS === 'web' ? '100%' : undefined }}>
        <SafeAreaProvider style={{ flex: 1, height: Platform.OS === 'web' ? '100%' : undefined }}>
          <AppStateProvider>
            <NavigationContainer
              ref={navigationRef}
              theme={navTheme}
              onReady={() => {
                const routeName = navigationRef.getCurrentRoute()?.name || null;
                setCurrentRouteName(routeName);
              }}
              onStateChange={() => {
                const routeName = navigationRef.getCurrentRoute()?.name || null;
                setCurrentRouteName(routeName);
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.__BUEPT_ROUTE__ = navigationRef.getCurrentRoute?.() || null;
                }
              }}
            >
              <RootNavigator />
              <BueptChatButton 
                navigationRef={navigationRef} 
                currentRouteName={currentRouteName} 
              />
              {Platform.OS !== 'web' ? (
                <SimulatorSmokeRunner navigationRef={navigationRef} currentRouteName={currentRouteName} />
              ) : null}
            </NavigationContainer>
          </AppStateProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
