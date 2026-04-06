const Voice = {
  onSpeechStart: null,
  onSpeechRecognized: null,
  onSpeechEnd: null,
  onSpeechError: null,
  onSpeechResults: null,
  onSpeechPartialResults: null,

  isAvailable: async () => true,
  start: async () => true,
  stop: async () => true,
  cancel: async () => true,
  destroy: async () => true,
  removeAllListeners: () => true,
};

module.exports = Voice;
module.exports.default = Voice;
