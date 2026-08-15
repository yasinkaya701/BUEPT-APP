/**
 * BUEPT Web Entry Point
 * Defensive: Inject Platform into global scope to prevent intermittent "Can't find variable: Platform" errors 
 * during Webpack hydration.
 */
import { Platform, AppRegistry } from 'react-native';
if (typeof window !== 'undefined') {
  window.Platform = Platform;
}

import 'react-native-gesture-handler';
import App from '../src/App';
import { name as appName } from '../app.json';

// Web: seed a friction-free demo profile so visitors never hit a dead login wall,
// but FIRST-TIME visitors (onboarded flag missing) are routed through Onboarding
// by SplashAnimationScreen before the dashboard. The demo profile is prepared here
// so the onboarding skip/placement flow lands on a live, working app state.
try {
  const TOKEN_KEY = '@buept_auth_token';
  const PROFILE_KEY = '@buept_user_profile_v1';
  const ONBOARDED_KEY = '@buept_onboarded_v1';
  if (!localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, 'demo_student');
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      name: 'Guest Student',
      email: 'demo@buept.app',
      faculty: 'General',
      role: 'Student',
      mode: 'demo',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }));
  }
  // Mark first-run so Splash shows the branded Onboarding experience.
  if (!localStorage.getItem(ONBOARDED_KEY)) {
    localStorage.setItem(ONBOARDED_KEY, '0');
  }
} catch (_) {}

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
