// web/asyncStorageMock.js
// This replaces AsyncStorage on web with localStorage

const asyncStorageMock = {
  getItem: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.resolve(null);
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
  getAllKeys: async () => {
    try {
      const keys = Object.keys(localStorage);
      return Promise.resolve(keys);
    } catch (error) {
      return Promise.resolve([]);
    }
  },
  multiGet: async (keys) => {
    try {
      const result = keys.map(key => [key, localStorage.getItem(key)]);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.resolve([]);
    }
  },
  multiSet: async (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
  multiRemove: async (keys) => {
    try {
      keys.forEach(key => localStorage.removeItem(key));
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
};

export default asyncStorageMock;