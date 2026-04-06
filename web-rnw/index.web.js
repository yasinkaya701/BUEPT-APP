import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from '../src/App';
import { name as appName } from '../app.json';

// Web: auto-login with demo profile so users skip the login wall
// and see the full app immediately.
try {
  const TOKEN_KEY = '@buept_auth_token';
  const PROFILE_KEY = '@buept_user_profile_v1';
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
} catch (_) {}

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
