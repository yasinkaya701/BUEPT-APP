import React from 'react';
import { LogBox, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef, getStateFromPath, getPathFromState } from '@react-navigation/native';
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
// Calling enableScreens on Web crashes the browser bundle because
// react-native-screens has no web implementation.
if (Platform.OS === 'ios') {
  enableScreens(false);
}

const LINKING_CONFIG = Platform.OS === 'web' ? {
  prefixes: [window.location.origin],
  config: {
    screens: {
      Splash: 'splash',
      Onboarding: 'onboarding',
      Login: 'login',
      Signup: 'signup',
      MainTabs: {
        screens: {
          Home: '',
          Reading: 'reading',
          Grammar: 'grammar',
          Writing: 'writing',
          Vocab: 'vocab',
          Listening: 'listening',
          Speaking: 'speaking',
        },
      },
      ReadingDetail: 'reading/:taskId',
      ListeningDetail: 'listening/:taskId',
      GrammarDetail: 'grammar/:taskId',
      WritingEditor: 'writing-editor',
      Feedback: 'writing-feedback',
      VocabFlashcard: 'flashcard/:deckId',
      FlashcardHome: 'flashcards',
      Exams: 'exams',
      ExamDetail: 'exam/:examId',
      MockResult: 'mock-result',
      Chatbot: 'chat',
      StudyPlan: 'study-plan',
      Analytics: 'analytics',
      Progress: 'progress',
      Developer: 'developer',
      ClassScheduleCalendar: 'calendar',
      BogaziciHub: 'hub',
    },
  },
  // Force hash routing for GitHub Pages compatibility with subfolder support
  getStateFromPath: (path, config) => {
    // 1. Handle the GitHub Pages subfolder (BUEPT-APP)
    // path might be "/BUEPT-APP/reading" or "/BUEPT-APP/#/reading"
    let cleanPath = path;
    if (path.startsWith('/BUEPT-APP')) {
      cleanPath = path.replace('/BUEPT-APP', '');
    }
    
    // 2. Handle the hash
    const hashPath = cleanPath.includes('#') ? cleanPath.split('#')[1] : cleanPath;
    
    // 3. Ensure we have at least a "/"
    const finalPath = hashPath || '/';
    return getStateFromPath(finalPath, config);
  },
  getPathFromState: (state, config) => {
    const path = getPathFromState(state, config);
    // On GitHub Pages, we must keep the subfolder in the URL 
    // but put the app state after the hash.
    // Example: /BUEPT-APP/#/reading
    return `/BUEPT-APP/#${path}`;
  },
} : undefined;

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
  return (
    <AppErrorBoundary>
      {/* On Web, flex containers must have minHeight: 0 to contain scrolling children. 
          We also enforce height: '100%' to prevent the container from expanding infinitely. */}
      <GestureHandlerRootView style={{ flex: 1, minHeight: 0, height: Platform.OS === 'web' ? '100%' : undefined }}>
        <SafeAreaProvider style={{ flex: 1, minHeight: 0, height: Platform.OS === 'web' ? '100%' : undefined }}>
          <AppStateProvider>
            <NavigationContainer
              ref={navigationRef}
              theme={navTheme}
              linking={LINKING_CONFIG}
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
