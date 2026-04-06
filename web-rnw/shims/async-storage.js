/**
 * Web shim for @react-native-async-storage/async-storage
 * Uses localStorage under the hood for web compatibility.
 */
const AsyncStorage = {
  getItem: (key) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
    return Promise.resolve();
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    return Promise.resolve();
  },
  multiGet: (keys) => {
    try {
      return Promise.resolve(keys.map((k) => [k, localStorage.getItem(k)]));
    } catch (e) {
      return Promise.resolve(keys.map((k) => [k, null]));
    }
  },
  multiSet: (kvPairs) => {
    try {
      kvPairs.forEach(([k, v]) => localStorage.setItem(k, v));
    } catch (e) {}
    return Promise.resolve();
  },
  multiRemove: (keys) => {
    try {
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    return Promise.resolve();
  },
  getAllKeys: () => {
    try {
      return Promise.resolve(Object.keys(localStorage));
    } catch (e) {
      return Promise.resolve([]);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {}
    return Promise.resolve();
  },
  mergeItem: (key, value) => {
    try {
      const existing = localStorage.getItem(key);
      const merged = existing
        ? JSON.stringify({ ...JSON.parse(existing), ...JSON.parse(value) })
        : value;
      localStorage.setItem(key, merged);
    } catch (e) {}
    return Promise.resolve();
  },
};

export default AsyncStorage;
