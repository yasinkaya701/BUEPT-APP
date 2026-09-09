/**
 * BUEPT Web Entry Point.
 * Keep boot deterministic: do not mutate auth/profile/onboarding storage here.
 * Demo mode and local profiles are explicit user actions handled by React.
 */
import { Platform, AppRegistry } from 'react-native';

if (typeof window !== 'undefined') {
  window.Platform = Platform;
}

import 'react-native-gesture-handler';
import App from '../src/App';
import { name as appName } from '../app.json';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
