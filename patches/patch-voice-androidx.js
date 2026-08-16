// Postinstall patch: replace legacy com.android.support appcompat-v7 (28.0.0)
// in react-native-voice with androidx.appcompat to resolve Duplicate class
// build errors when targeting compileSdk 36 (AndroidX project).
const fs = require('fs');
const path = require('path');
const target = path.join(
  __dirname, '..', 'node_modules', '@react-native-voice', 'voice', 'android', 'build.gradle'
);
if (!fs.existsSync(target)) { process.exit(0); }
let src = fs.readFileSync(target, 'utf8');
const marker = 'androidx.appcompat:appcompat:1.6.1';
if (!src.includes(marker)) {
  src = src.replace(
    'implementation "com.android.support:appcompat-v7:${supportVersion}"',
    'implementation "androidx.appcompat:appcompat:1.6.1"'
  );
  fs.writeFileSync(target, src);
  console.log('[postinstall] patched @react-native-voice/android to androidx.appcompat');
}
