import { comprehensiveTrialAnalyzer } from './ComprehensiveTrialAnalyzer';
import * as api from './api';

export const CompanyService = {
  async enrichCompanyData(company) {
    const analysis = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(company.name);
    await api.saveTrialAnalysis(company.id, analysis);
    
    // Extract company-related info from trials
    const enrichedCompany = this.extractCompanyInfo(company, analysis);
    await api.updateCompany(company.id, enrichedCompany);
    
    return { company: enrichedCompany, trials: analysis };
  },

  extractCompanyInfo(company, analysis) {
    // Extract relevant company info from trial data
    return {
      ...company,
      therapeuticAreas: this.extractTherapeuticAreas(analysis),
      developmentStages: this.extractDevelopmentStages(analysis),
      // Add other extracted fields
    };
  }
}; 