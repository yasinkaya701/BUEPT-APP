import React from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppState } from '../context/AppState';
import {
  DEV_SMOKE_TEST_ENABLED,
  DEV_SMOKE_TEST_STEP_DELAY_MS,
  DEV_SMOKE_TEST_STEPS,
  DEV_SMOKE_TEST_REPORT_KEY,
} from './smokeTestConfig';
import { emitSmokeAction } from './smokeBus';
import { runDiagnostics } from '../utils/diagnostics';

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

async function appendSmokeEvent(event) {
  try {
    const raw = await AsyncStorage.getItem(DEV_SMOKE_TEST_REPORT_KEY);
    const parsed = raw ? JSON.parse(raw) : { startedAt: new Date().toISOString(), events: [] };
    parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
    parsed.events.push(event);
    await AsyncStorage.setItem(DEV_SMOKE_TEST_REPORT_KEY, JSON.stringify(parsed));
  } catch (_) { }
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
    appendSmokeEvent({ type: 'start', at: new Date().toISOString(), route: currentRouteName });

    const runStep = (index) => {
      if (index >= DEV_SMOKE_TEST_STEPS.length) {
        startedRef.current = 'complete';
        console.log('[SMOKE] completed all configured screens');
        appendSmokeEvent({ type: 'complete', at: new Date().toISOString(), total: DEV_SMOKE_TEST_STEPS.length });
        navigationRef.navigate('MainTabs', { screen: 'Home' });
        return;
      }
      const step = DEV_SMOKE_TEST_STEPS[index];
      InteractionManager.runAfterInteractions(() => {
        try {
          navigateStep(navigationRef, step);
          appendSmokeEvent({ type: 'nav', at: new Date().toISOString(), label: step.label });
          if (step.action) {
            setTimeout(() => {
              emitSmokeAction({ ...step.action, stepLabel: step.label });
              appendSmokeEvent({ type: 'action', at: new Date().toISOString(), label: step.label, action: step.action });
            }, Math.max(200, step.actionDelayMs || 300));
          }
          if (step.backAfterMs) {
            setTimeout(() => {
              try { navigationRef.goBack(); } catch (_) { }
            }, step.backAfterMs);
          }
        } catch (error) {
          console.error('[SMOKE] navigation error', error);
          appendSmokeEvent({ type: 'nav_error', at: new Date().toISOString(), label: step.label, message: String(error?.message || error) });
        }
        timerRef.current = setTimeout(() => runStep(index + 1), DEV_SMOKE_TEST_STEP_DELAY_MS);
      });
    };

    (async () => {
      try {
        const results = await runDiagnostics();
        appendSmokeEvent({ type: 'diag', at: new Date().toISOString(), results });
      } catch (error) {
        appendSmokeEvent({ type: 'diag_error', at: new Date().toISOString(), message: String(error?.message || error) });
      }
      timerRef.current = setTimeout(() => runStep(0), 900);
    })();
  }, [authReady, currentRouteName, navigationRef, userToken]);

  return null;
}
