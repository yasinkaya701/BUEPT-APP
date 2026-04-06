/* eslint-env jest */

require('react-native-gesture-handler/jestSetup');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  voices: jest.fn().mockResolvedValue([]),
  getInitStatus: jest.fn().mockResolvedValue(true),
  setIgnoreSilentSwitch: jest.fn(),
  setDucking: jest.fn(),
  setDefaultLanguage: jest.fn(),
  setDefaultRate: jest.fn(),
  setDefaultVoice: jest.fn()
}));

jest.mock('react-native-webview', () => ({
  WebView: 'WebView'
}));

jest.mock('@react-native-voice/voice', () => ({
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechError: null,
  onSpeechResults: null,
  onSpeechVolumeChanged: null,
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(() => Promise.resolve()),
  removeAllListeners: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
