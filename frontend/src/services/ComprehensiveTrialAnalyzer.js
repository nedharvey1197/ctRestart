import { saveTrialAnalysis } from './api';
import { trialAnalyzerConfig } from '../config/trialAnalyzer.config';
import { TrialAnalysisError } from '../utils/errorHandler';

/**
 * @fileoverview Comprehensive Trial Analysis Engine
 * 
 * Core analysis service that processes clinical trial data from multiple sources:
 * - ClinicalTrials.gov API data
 * - Enriched company data
 * - Manual therapeutic area classifications
 * 
 * @architecture
 * - Singleton service pattern
 * - Implements caching for API responses
 * - Provides data normalization and analysis
 * 
 * @dataFlow
 * 1. Fetches raw trial data
 * 2. Normalizes and enriches data
 * 3. Generates analytics
 * 4. Caches results
 */
class ComprehensiveTrialAnalyzer {
  constructor() {
    // Base URL for ClinicalTrials.gov API v2
    this.BASE_URL = trialAnalyzerConfig.apiEndpoint

    // Complete set of required data modules from ClinicalTrials.gov
    this.REQUIRED_MODULES = trialAnalyzerConfig.requiredModules;

    // Add validation
    if (!this.validateModules()) {
      throw new Error('Invalid module configuration');
    }

    this.drugIdentifiers = new Set();
    this.cache = new Map();
  }

  validateModules() {
    // Define minimum required modules that must be present
    const minimumRequiredModules = [
        'IdentificationModule',
        'StatusModule',
        'DesignModule',
        'SponsorCollaboratorsModule',
        'DescriptionModule',
        'ConditionsModule'
    ];

    // Check if any required modules are missing from config
    const missingModules = minimumRequiredModules.filter(
        module => !this.REQUIRED_MODULES.includes(module)
    );

    // If any required modules are missing, log and fail validation
    if (missingModules.length > 0) {
        console.error('Missing required modules:', missingModules);
        return false;
    }

    // Check if all modules follow naming convention (end with 'Module')
    const invalidModules = this.REQUIRED_MODULES.filter(
        module => !module.endsWith('Module')
    );

    // If any modules don't follow naming convention, log and fail
    if (invalidModules.length > 0) {
        console.error('Invalid module format:', invalidModules);
        return false;
    }

    return true;  // All validations passed
  }

  /**
   * Normalizes company name for consistent searching
   */
  normalizeCompanyName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[^\w\s-]/g, '')  // Remove special chars except hyphen
        .replace(/\b(inc|corp|ltd|llc|pharmaceuticals|pharma|therapeutics|biosciences|biotechnology)\b/g, '')
        .replace(/\s+/g, ' ')      // Normalize spaces
        .trim();
  }

  /**
   * Builds the initial query URL for registered trials
   */
  buildRegisteredTrialsQuery(companyName) {
    if (!companyName || typeof companyName !== 'string') {
        throw new Error('Invalid company name provided');
    }

    const encodedName = encodeURIComponent(companyName);
    // Ensure we're requesting the right module names
    const moduleString = [
      'ConditionsModule',  // Make sure this matches CT.gov's API
      ...this.REQUIRED_MODULES
    ].join(',');
    console.log('Requesting modules:', moduleString);

    const queryUrl = `${this.BASE_URL}?query.term=${encodedName}&fields=${moduleString}&pageSize=100`;
    
    console.log('Query Construction:', {
        original: companyName,
        encoded: encodedName,
        modules: this.REQUIRED_MODULES.length,
        url: queryUrl
    });
    
    return queryUrl;
  }

  /**
   * Executes HTTP request to ClinicalTrials.gov API
   */
  async executeQuery(queryUrl) {
    let attempts = 0;
    while (attempts < trialAnalyzerConfig.maxRetries) {
        try {
            // Log attempt
            console.log(`Attempt ${attempts + 1}/${trialAnalyzerConfig.maxRetries}:`, {
                url: queryUrl.trim(),
                timestamp: new Date().toISOString()
            });

            // Execute query (preserved original functionality)
            const response = await fetch(queryUrl.trim(), {
                headers: { 'Accept': 'application/json' },
                timeout: trialAnalyzerConfig.timeout
            });

            // Handle response
            if (!response.ok) {
                console.error('Query failed:', {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(`API request failed: ${response.status}`);
            }

            // Process successful response
            const data = await response.json();
            console.log('Query successful:', {
                studiesCount: data.studies?.length || 0,
                hasData: !!data
            });
            // Validate study structure
            console.log('Sample study structure:', {
                hasProtocolSection: !!data.studies?.[0]?.protocolSection,
                modules: Object.keys(data.studies?.[0]?.protocolSection || {}),
                conditions: data.studies?.[0]?.protocolSection?.conditionsModule?.conditions,
                rawConditionsModule: data.studies?.[0]?.protocolSection?.conditionsModule
            });
            return data;

        } catch (error) {
            console.warn(`Attempt ${attempts + 1} failed:`, error.message);
            attempts++;
            
            if (attempts === trialAnalyzerConfig.maxRetries) {
                console.error('All retry attempts failed');
                throw error;
            }

            const delay = 1000 * attempts;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
  }

  /**
   * Extracts drug codes from intervention names and descriptions
   * @param {string} interventionText - The text to analyze for drug codes
   * @returns {string|null} The extracted drug code or null if none found
   */
  extractDrugCode(interventionText) {
    if (!interventionText) return null;
    
    // Pattern matches common drug code formats:
    // TERN-XXX, TERN-XXXX
    const drugCodePattern = /\b[A-Z]+-\d{3,4}\b/;
    
    const match = interventionText.match(drugCodePattern);
    if (match) {
        console.log('Extracted drug code:', match[0]);
        return match[0];
    }
    
    return null;
  }

  /**
   * Extracts drug identifiers from study data
   */
  extractDrugIdentifiers(studyData) {
    const identifiers = new Set();
    
    console.log('Extracting drug identifiers from study data:', {
        hasStudies: !!studyData.studies,
        studiesCount: studyData.studies?.length || 0
    });
    
    if (!studyData.studies) return identifiers;
    
    studyData.studies.forEach(study => {
        if (study.protocolSection?.armsInterventionsModule?.interventions) {
            study.protocolSection.armsInterventionsModule.interventions.forEach(intervention => {
                if (intervention.name) {
                    const drugCode = this.extractDrugCode(intervention.name);
                    if (drugCode) {  // Only add if we got a valid drug code
                        identifiers.add(drugCode);
                    }
                }
            });
        }
    });

    console.log('Extracted Drug Identifiers:', {
        count: identifiers.size,
        identifiers: Array.from(identifiers)
    });
    
    return identifiers;
  }

  /**
   * Builds query URL for searching trials by drug code
   */
  buildDrugQuery(drugCode) {
    try {
      console.log('Building drug query for:', drugCode);
      
      if (!drugCode) {
        console.error('No drug code provided');
        throw new Error('Drug code is required');
      }

      const encodedDrug = encodeURIComponent(drugCode);
      const moduleString = this.REQUIRED_MODULES.join(',');
      const queryUrl = `${this.BASE_URL}?query.term=${encodedDrug}&fields=${moduleString}&pageSize=100`;

      console.log('Drug query constructed:', {
        original: drugCode,
        encoded: encodedDrug,
        url: queryUrl
      });

      return queryUrl;
    } catch (error) {
      console.error('Error building drug query:', error);
      throw new Error(`Failed to build drug query: ${error.message}`);
    }
  }

  /**
   * Finds pre-registration trials using drug identifiers
   */
  async findPreRegistrationTrials(drugCodes) {
    try {
      console.log('Finding pre-registration trials for drug codes:', Array.from(drugCodes));

      const preRegTrials = [];
      for (const drugCode of drugCodes) {
        console.log('Processing drug code for finding pre-clinical registration:', drugCode);
        const query = this.buildDrugQuery(drugCode);
        const response = await this.executeQuery(query);
        console.log('Drug code query response:', {
          hasData: !!response,
          studiesCount: response?.studies?.length || 0
        });
        preRegTrials.push(...this.filterRelevantTrials(response.studies || []));
      }

      console.log('Found pre-registration trials:', {
        count: preRegTrials.length,
        drugCodesProcessed: Array.from(drugCodes).length
      });

      return preRegTrials;
    } catch (error) {
      console.error('Error finding pre-registration trials:', error);
      throw new Error(`Failed to find pre-registration trials: ${error.message}`);
    }
  }

  /**
   * Filters trials for relevance to company
   */
  filterRelevantTrials(studies) {
    console.log('Filtering trials for matching company:', {
      total: studies?.length || 0,
      companyName: this.companyNameNormalized
    });
    return studies.filter(study => this.isCompanyRelated(study));
  }

  /**
   * Checks if a study is related to the company
   */
  isCompanyRelated(study) {
    console.log('analyzing to see if  study is related to the company:', {
      hasProtocol: !!study?.protocolSection,
      sponsor: study?.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name,
      collaborators: study?.protocolSection?.sponsorCollaboratorsModule?.collaborators?.length
    });
    if (!study?.protocolSection) {
        console.warn('Invalid study structure');
        return false;
    }

    const sponsorModule = study.protocolSection.sponsorCollaboratorsModule;
    const descriptionModule = study.protocolSection.descriptionModule;

    // Check primary sponsor
    if (sponsorModule?.leadSponsor?.name && 
        this.isNameMatch(sponsorModule.leadSponsor.name)) {
        return true;
    }

    // Check collaborators
    if (sponsorModule?.collaborators?.some(c => 
        this.isNameMatch(c.name))) {
        return true;
    }

    // Check description
    if (descriptionModule?.briefSummary && 
        this.isNameMatch(descriptionModule.briefSummary)) {
        return true;
    }

    return false;
  }

  /**
   * Checks if a name matches the company name
   */
  isNameMatch(text) {
    console.log('Checking if name matches:', {
      text: text,
      companyName: this.companyNameNormalized
    });
    if (!text) return false;
    const normalizedText = this.normalizeCompanyName(text);
    return normalizedText.includes(this.companyNameNormalized);
  }

  /**
   * Main analysis method
   */
  async analyzeCompanyTrials(companyName) {
    try {
      console.log('Analyzing company trials:', {
        companyName: companyName
      });
      const normalizedName = this.normalizeCompanyName(companyName);
      this.companyNameNormalized = normalizedName;
      
      // Get trials data
      console.log('Building registered trials query and executiong the query', {
        query: this.buildRegisteredTrialsQuery(normalizedName)
      });   
      const registeredTrials = await this.executeQuery(
        this.buildRegisteredTrialsQuery(normalizedName)
      );
      
      const allTrials = registeredTrials.studies;
      
      // Generate complete analytics
      console.log('Generating analytics for registered trials', {
        totalTrials: allTrials.length
      });
      const analytics = this.generateAnalytics(allTrials);
      
      console.log('Registerd TrialAnalysis complete:', {
        studiesCount: allTrials.length,
        analyticsGenerated: {
          hasPhaseData: !!analytics.phaseDistribution,
          hasStatusData: !!analytics.statusSummary,
          hasTherapeuticAreas: !!analytics.therapeuticAreas,
          therapeuticAreaCount: Object.keys(analytics.therapeuticAreas || {}).length
        }
      });

      // This creates the initial analysis package
      const fullAnalysisPackage = {
          analytics: {
              phaseDistribution: analytics.phaseDistribution,
              statusSummary: analytics.statusSummary,
              therapeuticAreas: analytics.therapeuticAreas,
              totalTrials: allTrials.length
          },
          studies: allTrials,
          metadata: {
              companyName: normalizedName,
              queryDate: new Date().toISOString()
          }
      };

      console.log('Full Analysis Package:', fullAnalysisPackage);

    return fullAnalysisPackage;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  generateAnalytics(studies) {
    const normalizeArea = (area) => area.toLowerCase().trim();
    
    // Track data sources with their timestamps
    const dataSources = {
      analyzed: {
        source: 'ClinicalTrials.gov API',
        timestamp: new Date().toISOString(),
        method: 'analyzeTherapeuticAreas'
      },
      standalone: {
        source: 'Company Registration',
        timestamp: this.lastEnriched || new Date().toISOString(),
        method: 'manual_input'
      },
      enriched: {
        source: 'AI Enrichment Service',
        timestamp: this.lastEnriched,
        method: 'enrichCompanyData'
      }
    };

    // Get and tag data with sources
    const analyzedAreas = {
      data: this.analyzeTherapeuticAreas(studies),
      source: dataSources.analyzed
    };
    
    const standaloneAreas = {
      data: this.therapeuticAreas || [],
      source: dataSources.standalone
    };
    
    const enrichedAreas = {
      data: this.enrichedData?.therapeuticAreas || [],
      source: dataSources.enriched
    };

    const analytics = {
      phaseDistribution: this.analyzePhaseDistribution(studies),
      statusSummary: this.analyzeStatus(studies),
      therapeuticAreas: {
        analyzed: {
          areas: analyzedAreas.data,
          source: analyzedAreas.source
        },
        standalone: {
          areas: standaloneAreas.data,
          source: standaloneAreas.source
        },
        enriched: {
          areas: enrichedAreas.data,
          source: enrichedAreas.source
        }
      },
      totalTrials: studies.length,
      activeTrials: studies.filter(t => 
        t.protocolSection?.statusModule?.overallStatus === 'Recruiting'
      ).length,
      // Add enriched metadata
      enrichedData: {
        technologies: this.enrichedData?.technologies || [],
        locations: this.enrichedData?.locations || [],
        partnerships: this.enrichedData?.partnerships || []
      },
      contextualData: this.contextualData?.scrapedContent || {},
    };

    console.log('Generated analytics with enriched data:', {
      therapeuticAreas: {
        analyzed: Object.keys(analytics.therapeuticAreas.analyzed),
        standalone: analytics.therapeuticAreas.standalone,
        enriched: analytics.therapeuticAreas.enriched,
        overlap: Array.isArray(analytics.therapeuticAreas.standalone.areas) ?
          analytics.therapeuticAreas.standalone.areas.filter(area => 
            enrichedAreas.data.some(e => normalizeArea(e) === normalizeArea(area))
          ) : []
      },
      hasPhaseData: !!analytics.phaseDistribution,
      hasStatusData: !!analytics.statusSummary,
      hasEnrichedData: !!analytics.enrichedData,
      hasContextualData: !!analytics.contextualData
    });

    return analytics;
  }

  // Analytics helper methods
  countRegisteredTrials(studies) {
    return studies.filter(s => s.protocolSection?.identificationModule?.nctId).length;
  }

  countPreRegistrationTrials(studies) {
    return studies.length - this.countRegisteredTrials(studies);
  }

  analyzePhaseDistribution(studies) {
    console.log('Analyzing phase distribution:', {
      totalStudies: studies.length,
      hasPhaseData: studies.some(s => s.protocolSection?.designModule?.phases?.length > 0)
    });

    const distribution = studies.reduce((acc, study) => {
      const phase = study.protocolSection?.designModule?.phases?.[0] || 'Unknown';
      acc[phase] = (acc[phase] || 0) + 1;
      console.log(`Found phase: ${phase}`);
      return acc;
    }, {});

    console.log('Phase distribution results:', distribution);
    return distribution;
  }

  analyzeTherapeuticAreas(studies) {
    // Start analysis logging
    console.log('Starting therapeutic areas analysis:', {
      totalStudies: studies.length,
      studyIds: studies.map(s => s.protocolSection?.identificationModule?.nctId),
      conditions: studies.map(s => s.protocolSection?.conditionsModule?.conditions).flat()
    });

    const areas = studies.reduce((acc, study) => {
      const conditions = study.protocolSection?.conditionsModule?.conditions || [];
      if (conditions.length) {
        console.log('Found conditions for study:', {
          nctId: study.protocolSection?.identificationModule?.nctId,
          conditions: conditions
        });
      }

      conditions.forEach(condition => {
        acc[condition] = (acc[condition] || 0) + 1;
      });
      return acc;
    }, {});

    // Final results logging
    console.log('Therapeutic areas results:', {
      totalAreas: Object.keys(areas).length,
      areas: areas,  // This is the correct data being returned
      topAreas: Object.entries(areas),
    });

    // Verify data before return
    console.log('Returning therapeutic areas data:', {
      hasData: Object.keys(areas).length > 0,
      structure: areas,
      sampleEntry: Object.entries(areas)[0]
    });

    return areas;
  }

  analyzeInterventions(studies) {
    return studies.reduce((acc, study) => {
      const interventions = study.protocolSection?.armsInterventionsModule?.interventions || [];
      interventions.forEach(intervention => {
        if (!acc[intervention.type]) {
          acc[intervention.type] = [];
        }
        acc[intervention.type].push(intervention.name);
      });
      return acc;
    }, {});
  }

  analyzeEnrollment(studies) {
    const enrollments = studies.map(s => 
      s.protocolSection?.designModule?.enrollmentInfo?.count || 0
    ).filter(count => count > 0);

    return {
      total: enrollments.reduce((sum, count) => sum + count, 0),
      average: enrollments.length ? 
        Math.round(enrollments.reduce((sum, count) => sum + count, 0) / enrollments.length) : 0,
      median: this.calculateMedian(enrollments)
    };
  }

  analyzeStatus(studies) {
    return studies.reduce((acc, study) => {
      const status = study.protocolSection?.statusModule?.overallStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  calculateMedian(numbers) {
    if (!numbers.length) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? 
      sorted[middle] : 
      Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  async saveToJson(data, outputPath) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputPath || `${data.companyName}_trials.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error saving JSON:', error);
      throw new Error(`Failed to save JSON: ${error.message}`);
    }
  }

  async saveAnalysisResults(companyName, results) {
    try {
        await saveTrialAnalysis(companyName, results);  // Use imported function
        return true;
    } catch (error) {
        console.error('Failed to save analysis results:', error);
        throw new Error('Failed to save analysis results');
    }
  }

  async getCachedOrFetch(queryUrl) {
    const cacheKey = queryUrl.trim();
    if (this.cache.has(cacheKey)) {
        console.log('Using cached response for:', cacheKey);
        return this.cache.get(cacheKey);
    }
    
    const response = await this.executeQuery(queryUrl);
    this.cache.set(cacheKey, response);
    return response;
  }

  validateStudyData(study) {
    // Define required paths in study data structure
    const required = [
        'protocolSection',
        'protocolSection.identificationModule',
        'protocolSection.statusModule'
    ];

    // Check each required path exists
    return required.every(path => {
        // Split path into parts and traverse object
        const value = path.split('.').reduce((obj, key) => obj?.[key], study);
        return value !== undefined;
    });
  }

  async resetForNewCompany() {
    this.cache.clear();
    this.drugIdentifiers.clear();
    // Reset other state...
  }
}

export const comprehensiveTrialAnalyzer = new ComprehensiveTrialAnalyzer(); 