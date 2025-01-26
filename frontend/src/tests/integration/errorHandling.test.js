import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../../services/api';
import { comprehensiveTrialAnalyzer } from '../../services/ComprehensiveTrialAnalyzer';
import CompanyEnrichment from '../../components/CompanyEnrichment';
import { mockCompanyData } from '../mocks/companyData';

jest.mock('../../services/api');
jest.mock('../../services/ComprehensiveTrialAnalyzer');

describe('Error Handling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles API failures gracefully', async () => {
    // Mock API failure
    api.getCompany.mockRejectedValue(new Error('Network Error'));

    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  test('handles validation errors', async () => {
    // Mock invalid data
    const invalidData = { ...mockCompanyData, clinicalTrials: null };
    api.getCompany.mockResolvedValue(invalidData);

    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invalid trial data/i)).toBeInTheDocument();
    });
  });

  test('handles timeout scenarios', async () => {
    // Mock timeout
    jest.useFakeTimers();
    api.getCompany.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText(/Request timed out/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  // Additional test cases
  test('handles data validation edge cases', async () => {
    // Test partial data
    const partialData = {
      ...mockCompanyData,
      clinicalTrials: [{
        protocolSection: { identificationModule: {} } // Missing required fields
      }]
    };
    api.getCompany.mockResolvedValue(partialData);

    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invalid trial data structure/i)).toBeInTheDocument();
    });

    // Test malformed data
    const malformedData = {
      ...mockCompanyData,
      clinicalTrials: 'not-an-array'
    };
    api.getCompany.mockResolvedValue(malformedData);

    rerender(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invalid data format/i)).toBeInTheDocument();
    });
  });

  test('handles concurrent requests', async () => {
    // Setup multiple requests
    const requests = [
      comprehensiveTrialAnalyzer.analyzeCompanyTrials(mockCompanyData.companyName),
      comprehensiveTrialAnalyzer.analyzeCompanyTrials(mockCompanyData.companyName),
      comprehensiveTrialAnalyzer.analyzeCompanyTrials(mockCompanyData.companyName)
    ];

    // Verify only one request is processed
    const results = await Promise.all(requests);
    expect(api.saveTrialAnalysis).toHaveBeenCalledTimes(1);
  });

  test('handles cache invalidation', async () => {
    // Test cache hit
    await comprehensiveTrialAnalyzer.analyzeCompanyTrials(mockCompanyData.companyName);
    expect(api.getTrialAnalysis).toHaveBeenCalledTimes(1);

    // Test forced refresh
    await comprehensiveTrialAnalyzer.analyzeCompanyTrials(mockCompanyData.companyName, {
      forceRefresh: true
    });
    expect(api.getTrialAnalysis).toHaveBeenCalledTimes(2);
  });
}); 