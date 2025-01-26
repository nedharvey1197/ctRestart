/**
 * API Service Layer
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

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
 * Save raw trials data for a company
 */
export const saveCompanyTrials = async (companyId, trials) => {
    const url = `${API_BASE_URL}/companies/${companyId}/trials`;
    
    console.log('Saving trials:', {
        url,
        trialCount: trials.length,
        sampleTrial: trials[0]?.protocolSection?.identificationModule?.nctId
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ trials })  // Wrap in object to match FastAPI expectation
        });

        if (!response.ok) {
            const errorText = await response.text();  // Get raw error response
            console.error('Server error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`Failed to save trials: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to save company trials:', error);
        throw error;
    }
};

/**
 * Save analysis results for a company
 */
export const saveTrialAnalysis = async (companyId, analysisData) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/analysis`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
    });

    if (!response.ok) {
        throw new Error('Failed to save analysis');
    }

    return response.json();
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