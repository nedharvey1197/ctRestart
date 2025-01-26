const rateLimit = require('express-rate-limit');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const enrichmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many enrichment requests, please try again later',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many enrichment requests, please try again later'
    });
  }
});

const cacheEnrichmentData = async (req, res, next) => {
  const key = `enrichment:${req.params.id}:${req.path}`;
  const cachedData = await cache.get(key);

  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    cache.set(key, JSON.stringify(body), process.env.CACHE_DURATION || 3600);
    res.sendResponse(body);
  };

  next();
};

// Validate enrichment request
const validateEnrichmentRequest = (req, res, next) => {
  const { companyId } = req.params;
  
  if (!companyId) {
    return res.status(400).json({
      error: 'Company ID is required'
    });
  }

  next();
};

// Export middleware
module.exports = {
  enrichmentLimiter,
  cacheEnrichmentData,
  validateEnrichmentRequest
}; 