const React = require('react');

function passthrough(value) {
  return value;
}

const Reanimated = {
  View: null,
  Text: null,
  ScrollView: null,
  createAnimatedComponent: (Component) => Component,
  useSharedValue: (initial) => ({ value: initial }),
  useAnimatedStyle: (fn) => (typeof fn === 'function' ? fn() : {}),
  useAnimatedReaction: () => undefined,
  useAnimatedScrollHandler: () => () => undefined,
  withTiming: passthrough,
  withSpring: passthrough,
  withDelay: (_d, v) => v,
  withSequence: (...args) => args[args.length - 1],
  withRepeat: (v) => v,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  cancelAnimation: () => undefined,
  Easing: {
    linear: passthrough,
    ease: passthrough,
    in: passthrough,
    out: passthrough,
    inOut: passthrough,
    bezier: () => passthrough,
  },
};

module.exports = Reanimated;
module.exports.default = Reanimated;
