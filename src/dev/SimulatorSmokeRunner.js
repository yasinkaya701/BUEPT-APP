import React from 'react';
import { InteractionManager } from 'react-native';
import { useAppState } from '../context/AppState';
import {
  DEV_SMOKE_TEST_ENABLED,
  DEV_SMOKE_TEST_STEP_DELAY_MS,
  DEV_SMOKE_TEST_STEPS,
} from './smokeTestConfig';

function navigateStep(navigationRef, step) {
  if (!navigationRef?.isReady?.()) return;
  global.__BUEPT_LAST_SMOKE_STEP__ = step.label;
  console.log(`[SMOKE] opening ${step.label}`);
  if (step.type === 'tab') {
    navigationRef.navigate('MainTabs', { screen: step.screen });
    return;
  }
  navigationRef.navigate(step.name, step.params || undefined);
}

export default function SimulatorSmokeRunner({ navigationRef, currentRouteName }) {
  const { authReady, userToken, login } = useAppState();
  const startedRef = React.useRef(false);
  const timerRef = React.useRef(null);

  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  React.useEffect(() => {
    if (!DEV_SMOKE_TEST_ENABLED || !authReady || userToken || startedRef.current) return;
    startedRef.current = true;
    console.log('[SMOKE] logging in with demo profile');
    login({ mode: 'demo' }).catch((error) => {
      console.error('[SMOKE] demo login failed', error);
    });
  }, [authReady, login, userToken]);

  React.useEffect(() => {
    if (!DEV_SMOKE_TEST_ENABLED || !authReady || !userToken || !navigationRef?.isReady?.()) return;
    if (startedRef.current === 'running' || startedRef.current === 'complete') return;
    if (!currentRouteName || currentRouteName === 'Splash' || currentRouteName === 'Login' || currentRouteName === 'Signup') return;

    startedRef.current = 'running';
    console.log(`[SMOKE] start from ${currentRouteName}`);

    const runStep = (index) => {
      if (index >= DEV_SMOKE_TEST_STEPS.length) {
        startedRef.current = 'complete';
        console.log('[SMOKE] completed all configured screens');
        navigationRef.navigate('MainTabs', { screen: 'Home' });
        return;
      }
      const step = DEV_SMOKE_TEST_STEPS[index];
      InteractionManager.runAfterInteractions(() => {
        navigateStep(navigationRef, step);
        timerRef.current = setTimeout(() => runStep(index + 1), DEV_SMOKE_TEST_STEP_DELAY_MS);
      });
    };

    timerRef.current = setTimeout(() => runStep(0), 900);
  }, [authReady, currentRouteName, navigationRef, userToken]);

  return null;
}
