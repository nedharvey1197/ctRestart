const Company = require('../models/Company');
const CompanyEnrichmentService = require('../services/companyEnrichmentService');
const logger = require('../utils/logger');

// Create instance of service
const enrichmentService = new CompanyEnrichmentService();

// Export object with all controller methods
module.exports = {
  enrichCompanyData: async (req, res, next) => {
    try {
      const { id } = req.params;
      logger.info(`Starting enrichment for company ID: ${id}`);
      
      const company = await Company.findById(id);
      if (!company) {
        logger.warn(`Company not found: ${id}`);
        return res.status(404).json({ error: 'Company not found' });
      }

      logger.info(`Enriching data for: ${company.companyName}`);
      
      if (!company.companyWebsite) {
        return res.status(400).json({ error: 'Company website is required for enrichment' });
      }

      const enrichedData = await enrichmentService.enrichCompanyData(
        company.companyWebsite,
        company.companyName
      );

      company.enrichedData = enrichedData.enrichedFields;
      company.contextualData = enrichedData.contextualData;
      company.lastEnriched = new Date();
      company.enrichmentStatus = 'completed';
      
      await company.save();
      
      res.json({
        message: 'Company data enriched successfully',
        data: {
          enrichedFields: company.enrichedData,
          contextualData: company.contextualData
        }
      });
    } catch (error) {
      logger.error('Enrichment error:', error);
      next(error);
    }
  },

  getEnrichmentStatus: async (req, res, next) => {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json({
        lastEnriched: company.lastEnriched,
        hasEnrichedData: !!company.enrichedData,
        status: company.enrichmentStatus || 'none'
      });
    } catch (error) {
      next(error);
    }
  }
};

// Log initialization
logger.info('Enrichment controller initialized');