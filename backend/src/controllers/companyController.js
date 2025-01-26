const Company = require('../models/Company');
const CompanyEnrichmentService = require('../services/companyEnrichmentService');
const enrichmentService = new CompanyEnrichmentService();
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Cache frequently accessed companies
const companyCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get from cache or DB
async function getCompanyFromCacheOrDB(id) {
    const cached = companyCache.get(id);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    const company = await Company.findById(id);
    if (company) {
        companyCache.set(id, { data: company, timestamp: Date.now() });
    }
    return company;
}

// Helper for validation
function validateCompanyId(id) {
    if (!id) {
        throw new Error('Company ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid company ID format');
    }
}

/**
 * @fileoverview Company Controller
 * 
 * Handles all company-related operations including:
 * - CRUD operations for company profiles
 * - Trial analysis management
 * - Data enrichment processing
 * 
 * @database
 * - MongoDB for company profiles
 * - Redis for caching (planned)
 * 
 * @integration
 * - Trial Analysis Service
 * - Data Enrichment Pipeline
 * - Authentication Service
 */

exports.createCompany = async (req, res) => {
    try {
        logger.info('Creating company:', req.body.companyName);

        // Check for existing company
        const existingCompany = await Company.findOne({ 
            companyName: req.body.companyName 
        });

        // Get enriched data regardless
        const enrichedData = await enrichmentService.enrichCompanyData(
            req.body.companyWebsite,
            req.body.companyName
        );

        if (existingCompany) {
            // Update existing company with new data
            const updatedData = {
                ...req.body,
                enrichedData: enrichedData?.enrichedFields || {},
                contextualData: enrichedData?.contextualData || {},
                lastEnriched: new Date()
            };

            const updated = await Company.findByIdAndUpdate(
                existingCompany._id,
                updatedData,
                { new: true }
            );

            logger.info('Company updated successfully:', updated._id);
            return res.json(updated);
        }

        // Create new company if doesn't exist
        const companyData = {
            ...req.body,
            enrichedData: enrichedData?.enrichedFields || {},
            contextualData: enrichedData?.contextualData || {},
            lastEnriched: new Date()
        };

        const company = await Company.create(companyData);
        logger.info('Company created successfully:', company._id);
        res.status(201).json(company);
    } catch (error) {
        logger.error('Error creating/updating company:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getCompany = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Backend getCompany called for id:', id);
        
        validateCompanyId(id);
        
        const company = await getCompanyFromCacheOrDB(id);
        console.log('Backend found company:', {
            hasTrialAnalytics: !!company?.trialAnalytics,
            analyticsStructure: company?.trialAnalytics ? {
                therapeuticAreas: Object.keys(company.trialAnalytics.therapeuticAreas || {}).length,
                phaseDistribution: Object.keys(company.trialAnalytics.phaseDistribution || {}).length,
                statusSummary: Object.keys(company.trialAnalytics.statusSummary || {}).length
            } : null
        });
        
        if (!company) {
            logger.warn(`Company not found with ID: ${id}`);
            return res.status(404).json({ error: 'Company not found' });
        }

        logger.info(`Successfully retrieved company: ${company.companyName}`);
        res.json(company);
    } catch (error) {
        console.error('Backend getCompany error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        validateCompanyId(id);

        const company = await Company.findByIdAndUpdate(
            id,
            { 
                $set: req.body,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true,
                lean: true // Performance optimization for read-only data
            }
        );

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Update cache
        companyCache.set(id, { data: company, timestamp: Date.now() });
        res.json(company);
    } catch (error) {
        logger.error('Error updating company:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getCurrentCompany = async (req, res) => {
    try {
        // Find most recently created company
        const company = await Company.findOne()
            .sort({ createdAt: -1 })
            .lean();

        if (!company) {
            return res.status(404).json({ message: 'No company found' });
        }

        res.json(company);
    } catch (error) {
        logger.error('Error getting current company:', error);
        res.status(500).json({ error: 'Error getting company data' });
    }
};

exports.resetCompany = async (req, res) => {
    try {
        await Company.deleteMany({});
        companyCache.clear(); // Clear cache
        logger.info('Company data reset successfully');
        res.json({ message: 'Company data reset successfully' });
    } catch (error) {
        logger.error('Error resetting company data:', error);
        res.status(500).json({ error: 'Error resetting company data' });
    }
};

exports.saveTrialAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const trialData = req.body;
        console.log('Backend saveTrialAnalysis endpoint hit:', {
            endpoint: `/companies/${id}/trials`,
            method: 'POST',
            bodySize: JSON.stringify(trialData).length,
            timestamp: new Date().toISOString()
        });
        console.log('Backend saveTrialAnalysis received:', {
            id,
            hasAnalytics: !!trialData.analytics,
            analyticsStructure: trialData.analytics ? {
                therapeuticAreas: Object.keys(trialData.analytics.therapeuticAreas || {}).length,
                phaseDistribution: Object.keys(trialData.analytics.phaseDistribution || {}).length,
                statusSummary: Object.keys(trialData.analytics.statusSummary || {}).length
            } : null
        });

        const updates = {
            clinicalTrials: trialData.studies,
            trialAnalytics: {
                phaseDistribution: trialData.analytics.phaseDistribution,
                statusSummary: trialData.analytics.statusSummary,
                therapeuticAreas: trialData.analytics.therapeuticAreas,
                totalTrials: trialData.studies.length,
                activeTrials: trialData.analytics.activeTrials
            },
            lastAnalyzed: new Date()
        };

        console.log('Backend saving updates:', {
            trialsCount: updates.clinicalTrials.length,
            analyticsStructure: {
                therapeuticAreas: Object.keys(updates.trialAnalytics.therapeuticAreas || {}).length,
                phaseDistribution: Object.keys(updates.trialAnalytics.phaseDistribution || {}).length,
                statusSummary: Object.keys(updates.trialAnalytics.statusSummary || {}).length
            }
        });

        await Company.updateOne({ _id: id }, { $set: updates });
        res.json({ message: 'Success', data: updates });
    } catch (error) {
        console.error('Backend saveTrialAnalysis error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        validateCompanyId(id);

        const result = await Company.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: 'Company not found' });
        }

        companyCache.delete(id); // Remove from cache
        logger.info(`Company deleted successfully: ${id}`);
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        logger.error('Error deleting company:', error);
        res.status(error.message.includes('ID') ? 400 : 500)
           .json({ error: error.message });
    }
}; 