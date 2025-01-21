/**
 * API Service Layer
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    // Handle error cases where response might not be JSON
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || 'Request failed';
    } catch (e) {
      errorMessage = response.statusText || 'An error occurred';
    }
    throw new Error(errorMessage);
  }

  // Handle successful responses
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Error parsing response:', e);
    throw new Error('Invalid response format');
  }
};

// Core Company Operations
export const createCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(companyData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getCompany = async (id) => {
  console.log('API getCompany called with id:', id);
  const response = await fetch(`${API_BASE_URL}/companies/${id}`);
  const data = await response.json();
  console.log('API getCompany response:', {
    hasTrialAnalytics: !!data.trialAnalytics,
    analyticsStructure: data.trialAnalytics ? {
      hasPhaseData: !!data.trialAnalytics.phaseDistribution,
      hasStatusData: !!data.trialAnalytics.statusSummary,
      hasTherapeuticAreas: !!data.trialAnalytics.therapeuticAreas,
      therapeuticAreaCount: Object.keys(data.trialAnalytics.therapeuticAreas || {}).length
    } : null,
    trialsCount: data.clinicalTrials?.length
  });
  return data;
};

export const updateCompany = async (id, companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(companyData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Trial Analysis Operations
/**
 * Saves trial analysis data for a company
 * @param {string} id - Company ID
 * @param {Object} data - Analysis results containing:
 *   - studies: Array of clinical trials
 *   - analytics: Object containing statistical analysis
 *   - rawData: Complete analysis results for persistence
 * @returns {Promise<Object>} Saved analysis data
 */
export const saveTrialAnalysis = async (id, analysisResults) => {
  // Deep inspection of analysis results
  console.log('Full Analysis Package:', {
    // Top level structure
    topLevel: {
      keys: Object.keys(analysisResults),
      hasStudies: !!analysisResults.studies,
      hasAnalytics: !!analysisResults.analytics
    },
    // Studies details
    studies: {
      count: analysisResults.studies?.length,
      firstStudy: analysisResults.studies?.[0] ? {
        id: analysisResults.studies[0].protocolSection?.identificationModule?.nctId,
        hasProtocolSection: !!analysisResults.studies[0].protocolSection,
        modules: Object.keys(analysisResults.studies[0].protocolSection || {})
      } : null
    },
    // Analytics details
    analytics: {
      raw: analysisResults.analytics,
      keys: Object.keys(analysisResults.analytics || {}),
      phaseDistribution: analysisResults.analytics?.phaseDistribution,
      statusSummary: analysisResults.analytics?.statusSummary,
      therapeuticAreas: {
        keys: Object.keys(analysisResults.analytics?.therapeuticAreas || {}),
        sampleEntries: Object.entries(analysisResults.analytics?.therapeuticAreas || {}).slice(0, 3)
      }
    },
    // Metadata
    metadata: {
      companyName: analysisResults.companyName,
      queryDate: analysisResults.queryDate
    }
  });

  const url = `${API_BASE_URL}/companies/${id}/trials`;
  
  // Log the full payload structure
  console.log('Trial Analysis Payload:', {
    studies: {
      count: analysisResults.studies?.length,
      sampleStudy: analysisResults.studies?.[0]?.protocolSection?.identificationModule?.nctId
    },
    analytics: {
      therapeuticAreas: {
        count: Object.keys(analysisResults.analytics?.therapeuticAreas || {}).length,
        sample: Object.entries(analysisResults.analytics?.therapeuticAreas || {}).slice(0, 2)
      },
      phaseDistribution: analysisResults.analytics?.phaseDistribution,
      statusSummary: analysisResults.analytics?.statusSummary,
      totalTrials: analysisResults.analytics?.totalTrials
    },
    metadata: {
      companyName: analysisResults.companyName,
      queryDate: analysisResults.queryDate
    }
  });

  console.log('Attempting API call to:', {
    url,
    method: 'POST',
    headers: defaultHeaders,
    dataSize: JSON.stringify(analysisResults).length,
    analyticsKeys: Object.keys(analysisResults.analytics || {})
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(analysisResults)
    });

    console.log('Raw API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const result = await response.json();
    console.log('API saveTrialAnalysis response:', {
      success: response.ok,
      savedAnalytics: !!result.data?.trialAnalytics
    });
    return result;
  } catch (error) {
    console.error('API call failed:', {
      error: error.message,
      type: error.name,
      url
    });
    throw error;
  }
};

// Get the most recently created company
export const getCurrentCompany = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/current`);
    return handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};