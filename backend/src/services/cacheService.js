const logger = require('../utils/logger');

class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async cacheTrialData(trialId, data, ttl = 3600) {
    try {
      await this.redis.setex(
        `trial:${trialId}`,
        ttl,
        JSON.stringify(data)
      );
      logger.info(`Cached data for trial ${trialId}`);
    } catch (error) {
      logger.error('Cache error:', error);
      throw error;
    }
  }

  async getCachedTrialData(trialId) {
    try {
      const data = await this.redis.get(`trial:${trialId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache retrieval error:', error);
      throw error;
    }
  }
}

module.exports = CacheService; 