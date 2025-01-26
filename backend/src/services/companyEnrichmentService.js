const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../utils/logger');

class CompanyEnrichmentService {
  constructor() {
    // Define keywords as class properties
    this.therapeuticKeywords = {
      'mrna': ['mrna', 'messenger rna', 'messenger ribonucleic acid'],
      'vaccine': ['vaccine', 'vaccines', 'vaccination', 'immunization', 'preventive'],
      'infectious disease': ['infectious disease', 'viral', 'bacterial', 'infection', 'virus'],
      'oncology': ['cancer', 'oncology', 'tumor', 'tumour', 'oncological', 'melanoma'],
      'rare disease': ['rare disease', 'orphan disease', 'genetic disorder', 'rare condition'],
      'respiratory': ['respiratory', 'lung disease', 'pulmonary', 'breathing', 'respiratory syncytial'],
      'cardiology': ['cardiology', 'cardiovascular', 'heart disease', 'cardiac', 'myocardial'],
      'immunology': ['immunology', 'immune system', 'immunological', 'autoimmune', 'immune response'],
      'genetic': ['genetic', 'genetics', 'genomic', 'dna', 'gene therapy', 'gene editing']
    };

    this.technologyKeywords = {
      'mrna platform': ['mrna platform', 'mrna technology', 'messenger rna platform', 'mrna medicines', 'mrna therapeutics'],
      'ai': ['artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning', 'data science'],
      'digital health': ['digital health', 'digital medicine', 'digital therapeutic', 'digital platform', 'telemedicine'],
      'gene therapy': ['gene therapy', 'genetic therapy', 'gene editing', 'genetic modification', 'crispr'],
      'cell therapy': ['cell therapy', 'cellular therapy', 'cell-based', 'stem cell'],
      'platform technology': ['platform technology', 'technological platform', 'drug development platform'],
      'clinical trials': ['clinical trial', 'clinical study', 'clinical research', 'phase 1', 'phase 2', 'phase 3']
    };

    // Add country and city lists
    this.countries = [
      'United States', 'Canada', 'Germany', 'France', 'United Kingdom', 'Japan',
      'Switzerland', 'Italy', 'Spain', 'Australia', 'Singapore', 'Hong Kong'
    ];

    this.majorCities = [
      'Cambridge', 'Boston', 'New York', 'London', 'Paris', 'Berlin', 'Tokyo',
      'Basel', 'Zurich', 'San Francisco', 'Shanghai', 'Singapore'
    ];

    this.locationBlacklist = [
      'moderna',
      'contact',
      'learn',
      'meet',
      'about',
      'careers',
      'overview',
      'search',
      'menu',
      'blog'
    ];

    // Add company-specific patterns
    this.partnershipPatterns = [
      /(?:partner(?:ed|ship|ing)?|collaboration|agreement)\s+with\s+([A-Z][A-Za-z\s&]+?)(?=\s+(?:to|for|in|\.|\,))/gi,
      /(?:working|collaborating)\s+(?:together\s+)?with\s+([A-Z][A-Za-z\s&]+?)(?=\s+(?:to|for|in|\.|\,))/gi,
      /(?:joint\s+venture|strategic\s+alliance)\s+with\s+([A-Z][A-Za-z\s&]+?)(?=\s+(?:to|for|in|\.|\,))/gi
    ];

    // Add disease patterns
    this.diseasePatterns = [
      /(?:treating|treatment of|therapy for)\s+([a-zA-Z\s]+?(?:disease|disorder|cancer|syndrome))(?=\s+(?:with|using|through|\.|\,))/gi,
      /(?:patients with|people with)\s+([a-zA-Z\s]+?(?:disease|disorder|cancer|syndrome))(?=\s+(?:are|can|may|will|\.|\,))/gi
    ];

    // Add research focus areas
    this.researchKeywords = {
      'drug development': ['drug development', 'drug discovery', 'therapeutic development'],
      'biomarkers': ['biomarker', 'biomarkers', 'biological marker'],
      'personalized medicine': ['personalized medicine', 'precision medicine', 'targeted therapy'],
      'manufacturing': ['manufacturing', 'production', 'scale-up', 'gmp']
    };
  }

  async enrichCompanyData(websiteUrl, companyName) {
    try {
      logger.info(`Starting enrichment for: ${companyName} ${websiteUrl}`);
      
      // Just do website scraping - trials analysis happens in frontend
      const scrapedData = await this.scrapeWebsite(websiteUrl);

      // Extract structured information
      const enrichedData = await this.extractStructuredInfo(scrapedData);
      
      // Remove trials fetching since that's handled by frontend
      return {
        enrichedFields: {
          therapeuticAreas: Array.from(enrichedData.therapeuticFocus),
          technologies: Array.from(enrichedData.technologies),
          locations: Array.from(enrichedData.locations),
          partnerships: enrichedData.partnerships
        },
        contextualData: {
          scrapedContent: {
            about: scrapedData.aboutSection,
            pipeline: scrapedData.pipelineSection,
            research: scrapedData.researchSection,
            products: scrapedData.productsSection,
            technology: scrapedData.technologySection,
            mission: scrapedData.missionSection
          }
        }
      };
    } catch (error) {
      logger.error('Enrichment error:', error);
      throw error;
    }
  }

  async scrapeWebsite(url) {
    try {
      console.log('Starting website scrape:', url);
      
      if (!url) {
        console.log('No URL provided');
        return null;
      }

      // Ensure URL has protocol
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      console.log('Fetching URL:', url);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);
      
      // Remove unwanted elements but keep more content
      $('script').remove();
      $('style').remove();
      $('noscript').remove();
      $('iframe').remove();
      
      // Clean text function with better preservation
      const cleanText = (text) => {
        return text
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, ' ')
          .replace(/[^\w\s-.,]/g, ' ') // Keep only words, spaces, and basic punctuation
          .trim();
      };

      // More comprehensive section selectors
      const data = {
        rawText: cleanText($('body').text()),
        aboutSection: cleanText($('[id*="about"], [class*="about"], [data-section*="about"], section:contains("About"), div:contains("About Us")').text()),
        pipelineSection: cleanText($('[id*="pipeline"], [class*="pipeline"], [data-section*="pipeline"], section:contains("Pipeline"), div:contains("Development"), div:contains("Programs")').text()),
        researchSection: cleanText($('[id*="research"], [class*="research"], [data-section*="research"], section:contains("Research"), div:contains("Science"), div:contains("Technology")').text()),
        productsSection: cleanText($('[id*="product"], [class*="product"], [data-section*="product"], section:contains("Product"), div:contains("Medicine"), div:contains("Treatment")').text()),
        technologySection: cleanText($('[id*="technology"], [class*="technology"], [data-section*="technology"], section:contains("Technology"), div:contains("Platform"), div:contains("Innovation")').text()),
        // Add mission section as it often contains key information
        missionSection: cleanText($('[id*="mission"], [class*="mission"], section:contains("Mission"), div:contains("Mission")').text()),
        // Extract meta tags for additional context
        metaSection: cleanText($('meta[name="description"]').attr('content') || '')
      };

      // Extract meta tags for additional context
      const metaTags = {
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        ogDescription: $('meta[property="og:description"]').attr('content')
      };

      // Combine meta information into sections
      if (metaTags.description || metaTags.keywords || metaTags.ogDescription) {
        data.metaSection = cleanText(`${metaTags.description || ''} ${metaTags.keywords || ''} ${metaTags.ogDescription || ''}`);
      }

      console.log('Scraped sections:', {
        aboutLength: data.aboutSection?.length || 0,
        pipelineLength: data.pipelineSection?.length || 0,
        researchLength: data.researchSection?.length || 0,
        productsLength: data.productsSection?.length || 0,
        technologyLength: data.technologySection?.length || 0,
        missionLength: data.missionSection?.length || 0,
        metaLength: data.metaSection?.length || 0
      });

      return data;
    } catch (error) {
      console.error('Scraping error:', error);
      return null;
    }
  }

  async findNewsArticles(companyName) {
    // Implement news API integration (e.g., NewsAPI, Google News)
    // Return recent relevant articles
  }

  async findExistingTrials(companyName) {
    try {
      logger.info(`Searching trials for: ${companyName}`);
      const response = await fetch(
        `https://clinicaltrials.gov/api/query/study_fields?expr=${encodeURIComponent(companyName)}&fields=NCTId,BriefTitle,Phase,Condition&fmt=json`
      );

      if (!response.ok) {
        logger.warn(`ClinicalTrials.gov API returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      logger.info(`Found ${data.StudyFieldsResponse?.StudyFields?.length || 0} trials`);
      return data.StudyFieldsResponse?.StudyFields || [];
    } catch (error) {
      logger.error('Error fetching trials:', error);
      return [];
    }
  }

  async findPipelineInfo(companyName) {
    // Could integrate with databases like Cortellis, AdisInsight, etc.
    // For now, extract from website and news
  }

  async extractLocations(text) {
    try {
      if (!text || typeof text !== 'string') {
        logger.warn('Invalid text provided for location extraction');
        return [];
      }

      const locations = new Set();

      // Common address patterns - Add /g flag to make them global
      const patterns = [
        /(?:headquartered|located|based) in ([^,.]+)/gi,
        /(\w+(?:,\s*[A-Z]{2})?)\s*\d{5}/g,  // City, State ZIP
        /(\d+[^,]+,[^,]+,[^,]+(?:CA|NY|MA|TX|IL|PA|FL))/gi,  // Full address
        /([^,]+(?:CA|NY|MA|TX|IL|PA|FL))/gi  // City, State
      ];

      // Check each pattern
      patterns.forEach(pattern => {
        try {
          const matches = Array.from(text.matchAll(pattern));
          matches.forEach(match => {
            if (match[1] && !this.locationBlacklist.some(term => 
              match[1].toLowerCase().includes(term.toLowerCase())
            )) {
              locations.add(match[1].trim());
            }
          });
        } catch (err) {
          logger.warn(`Pattern matching error: ${err.message}`);
        }
      });

      // Check for specific cities and countries
      [...this.majorCities, ...this.countries].forEach(location => {
        if (text.toLowerCase().includes(location.toLowerCase())) {
          locations.add(location);
        }
      });

      const extractedLocations = Array.from(locations);
      logger.info(`Found ${extractedLocations.length} locations:`, extractedLocations);
      return extractedLocations;
    } catch (error) {
      logger.error('Error extracting locations:', error);
      return [];
    }
  }

  extractStructuredInfo(scrapedData) {
    try {
      const enrichedData = {
        therapeuticFocus: new Set(),
        technologies: new Set(),
        locations: new Set(),
        partnerships: [],
        contextualData: {
          developmentStages: new Set(),
          metrics: []
        }
      };

      const sections = {
        about: scrapedData.aboutSection || '',
        pipeline: scrapedData.pipelineSection || '',
        research: scrapedData.researchSection || '',
        products: scrapedData.productsSection || '',
        technology: scrapedData.technologySection || '',
        mission: scrapedData.missionSection || '',
        meta: scrapedData.metaSection || ''
      };

      // Process each section
      Object.entries(sections).forEach(([sectionName, text]) => {
        if (!text) return;

        const lowerText = text.toLowerCase();
        
        // Extract therapeutic areas
        Object.entries(this.therapeuticKeywords).forEach(([key, patterns]) => {
          if (patterns.some(pattern => lowerText.includes(pattern))) {
            enrichedData.therapeuticFocus.add(key);
            logger.info(`Found therapeutic area in ${sectionName}: ${key}`);
          }
        });

        // Extract technologies
        Object.entries(this.technologyKeywords).forEach(([key, patterns]) => {
          if (patterns.some(pattern => lowerText.includes(pattern))) {
            enrichedData.technologies.add(key);
            logger.info(`Found technology in ${sectionName}: ${key}`);
          }
        });

        // Extract locations with proper array handling
        const foundLocations = this.extractLocations(text) || [];
        if (Array.isArray(foundLocations)) {
          foundLocations.forEach(location => {
            if (location) {
              enrichedData.locations.add(location);
              logger.info(`Found location in ${sectionName}: ${location}`);
            }
          });
        }

        // Extract diseases mentioned
        this.diseasePatterns.forEach(pattern => {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            const disease = match[1].trim().toLowerCase();
            if (disease.length > 3) { // Avoid short matches
              enrichedData.therapeuticFocus.add(disease);
              logger.info(`Found disease in ${sectionName}: ${disease}`);
            }
          }
        });

        // Extract partnerships with improved patterns
        this.partnershipPatterns.forEach(pattern => {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            const partner = match[1].trim();
            if (
              partner.length > 2 && 
              !this.locationBlacklist.includes(partner.toLowerCase()) &&
              !enrichedData.partnerships.some(p => p.partnerName === partner)
            ) {
              enrichedData.partnerships.push({
                partnerName: partner,
                partnershipType: this.determinePartnershipType(match[0]),
                source: `website_${sectionName}`,
                context: match[0]
              });
              logger.info(`Found partnership in ${sectionName}: ${partner}`);
            }
          }
        });

        // Add research focus extraction
        Object.entries(this.researchKeywords).forEach(([key, patterns]) => {
          if (patterns.some(pattern => lowerText.includes(pattern))) {
            enrichedData.technologies.add(key);
            logger.info(`Found research focus in ${sectionName}: ${key}`);
          }
        });

        // Look for development stages
        const stagePattern = /(?:phase|stage)\s+(?:[1-3]|one|two|three|i|ii|iii)/gi;
        const stageMatches = text.matchAll(stagePattern);
        for (const match of stageMatches) {
          enrichedData.contextualData.developmentStages = 
            enrichedData.contextualData.developmentStages || new Set();
          enrichedData.contextualData.developmentStages.add(match[0].toLowerCase());
        }

        // Look for numerical metrics
        const metricsPattern = /(\d+(?:\.\d+)?)\s*(?:patients?|trials?|programs?|products?|candidates?)/gi;
        const metricsMatches = text.matchAll(metricsPattern);
        for (const match of metricsMatches) {
          enrichedData.contextualData.metrics = 
            enrichedData.contextualData.metrics || [];
          enrichedData.contextualData.metrics.push({
            value: match[1],
            context: match[0],
            source: sectionName
          });
        }
      });

      // Deduplicate and clean locations
      enrichedData.locations = new Set([...enrichedData.locations].filter(
        location => !this.locationBlacklist.some(term => 
          location.toLowerCase().includes(term.toLowerCase())
        )
      ));

      logger.info('Extraction complete');
      logger.info('Found therapeutic areas:', [...enrichedData.therapeuticFocus]);
      logger.info('Found technologies:', [...enrichedData.technologies]);
      logger.info('Found locations:', [...enrichedData.locations]);
      logger.info('Found partnerships:', enrichedData.partnerships.length);

      return enrichedData;
    } catch (error) {
      logger.error('Error in extractStructuredInfo:', error);
      throw error;
    }
  }

  determinePartnershipType(context) {
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes('collaboration')) return 'collaboration';
    if (lowerContext.includes('joint venture')) return 'joint venture';
    if (lowerContext.includes('strategic')) return 'strategic alliance';
    return 'partnership';
  }
}

module.exports = CompanyEnrichmentService; 