// Simple in-memory cache
const cache = new Map();

module.exports = {
  async get(key) {
    try {
      const item = cache.get(key);
      if (!item) return null;
      
      // Check if expired
      if (item.expiry && item.expiry < Date.now()) {
        cache.delete(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key, value, duration) {
    try {
      cache.set(key, {
        value,
        expiry: Date.now() + (duration * 1000)
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}; 