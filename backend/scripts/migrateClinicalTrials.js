const mongoose = require('mongoose');
const Company = require('../models/Company');
const { comprehensiveTrialAnalyzer } = require('../../frontend/src/services/ComprehensiveTrialAnalyzer');

async function migrateTrialData() {
  try {
    const companies = await Company.find({ clinicalTrials: { $exists: true } });
    
    for (const company of companies) {
      console.log(`Migrating trial data for ${company.companyName}...`);
      
      try {
        const analysisResults = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(company.companyName);
        
        company.clinicalTrials = analysisResults.studies;
        company.trialAnalytics = analysisResults.analytics;
        company.lastAnalyzed = new Date();
        
        await company.save();
        console.log(`Successfully migrated ${company.companyName}`);
      } catch (error) {
        console.error(`Failed to migrate ${company.companyName}:`, error);
      }
    }
    
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

migrateTrialData(); 