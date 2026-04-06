import { DeviceEventEmitter } from 'react-native';

const EVENT_NAME = 'buept_smoke_action';

export function emitSmokeAction(action) {
  try {
    DeviceEventEmitter.emit(EVENT_NAME, action);
  } catch (_) { }
}

export function subscribeSmokeActions(handler) {
  const sub = DeviceEventEmitter.addListener(EVENT_NAME, handler);
  return () => sub.remove();
}
