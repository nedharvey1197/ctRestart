const express = require('express');
const router = express.Router();
const enrichmentController = require('../controllers/enrichmentController');
const { param, validationResult } = require('express-validator');

// Basic validation middleware
const validateId = [
  param('id').isMongoId().withMessage('Invalid company ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Debug logging
console.log('Setting up enrichment routes');

// Routes with basic validation
router.post('/company/:id/enrich', validateId, enrichmentController.enrichCompanyData);
router.get('/company/:id/status', validateId, enrichmentController.getEnrichmentStatus);
router.get('/company/:id/history', validateId, enrichmentController.getEnrichmentHistory);
router.get('/company/:id/trials', validateId, enrichmentController.getCompanyTrials);
router.get('/company/:id/news', validateId, enrichmentController.getCompanyNews);
router.get('/company/:id/pipeline', validateId, enrichmentController.getCompanyPipeline);

module.exports = router; 