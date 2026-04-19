// utils/webStorage.js
// This replaces AsyncStorage for web builds

const webStorage = {
  // Get an item
  getItem: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      console.warn('localStorage getItem error:', error);
      return Promise.resolve(null);
    }
  },
  
  // Set an item
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      console.warn('localStorage setItem error:', error);
      return Promise.resolve();
    }
  },
  
  // Remove an item
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      console.warn('localStorage removeItem error:', error);
      return Promise.resolve();
    }
  },
  
  // Clear all items
  clear: async () => {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (error) {
      console.warn('localStorage clear error:', error);
      return Promise.resolve();
    }
  },
  
  // Get all keys
  getAllKeys: async () => {
    try {
      const keys = Object.keys(localStorage);
      return Promise.resolve(keys);
    } catch (error) {
      console.warn('localStorage getAllKeys error:', error);
      return Promise.resolve([]);
    }
  },
  
  // Multi-get
  multiGet: async (keys) => {
    try {
      const result = keys.map(key => [key, localStorage.getItem(key)]);
      return Promise.resolve(result);
    } catch (error) {
      console.warn('localStorage multiGet error:', error);
      return Promise.resolve([]);
    }
  },
  
  // Multi-set
  multiSet: async (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return Promise.resolve();
    } catch (error) {
      console.warn('localStorage multiSet error:', error);
      return Promise.resolve();
    }
  },
  
  // Multi-remove
  multiRemove: async (keys) => {
    try {
      keys.forEach(key => localStorage.removeItem(key));
      return Promise.resolve();
    } catch (error) {
      console.warn('localStorage multiRemove error:', error);
      return Promise.resolve();
    }
  },
};

export default webStorage;