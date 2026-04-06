/* Web runtime polyfills for RN ecosystem packages. */
(function ensureProcessPolyfill() {
  if (typeof globalThis === 'undefined') return;
  if (!globalThis.process) {
    globalThis.process = { env: {} };
  } else if (!globalThis.process.env) {
    globalThis.process.env = {};
  }

  if (!globalThis.process.env.NODE_ENV) {
    globalThis.process.env.NODE_ENV = 'production';
  }

  if (!globalThis.global) {
    globalThis.global = globalThis;
  }
})();

