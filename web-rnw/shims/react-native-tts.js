const listeners = new Map();

function addEventListener(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return {
    remove: () => {
      try {
        listeners.get(event)?.delete(handler);
      } catch (_) {
        // ignore
      }
    },
  };
}

const Tts = {
  getInitStatus: () => Promise.resolve('ready'),
  setDefaultLanguage: () => Promise.resolve(),
  setIgnoreSilentSwitch: () => Promise.resolve(),
  setDucking: () => Promise.resolve(),
  speak: () => Promise.resolve(),
  stop: () => Promise.resolve(),
  addEventListener,
  removeAllListeners: (event) => {
    if (event) listeners.delete(event);
    else listeners.clear();
  },
};

module.exports = Tts;
module.exports.default = Tts;
