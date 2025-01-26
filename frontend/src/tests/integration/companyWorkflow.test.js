import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { comprehensiveTrialAnalyzer } from '../../services/ComprehensiveTrialAnalyzer';
import { mockCompanyData, mockTrialData } from '../mocks/companyData';
import CompanyOverview from '../../components/CompanyOverview';
import CompanyEnrichment from '../../components/CompanyEnrichment';
import * as api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../services/ComprehensiveTrialAnalyzer');

describe('Company Workflow Integration', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup mock responses
    api.getCompany.mockResolvedValue(mockCompanyData);
    api.getTrialAnalysis.mockResolvedValue(mockTrialData);
    comprehensiveTrialAnalyzer.analyzeCompanyTrials.mockResolvedValue(mockTrialData);
  });

  test('Complete company enrichment workflow', async () => {
    render(
      <MemoryRouter initialEntries={['/companies/TEST001/enrich']}>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    // Verify initial render
    expect(screen.getByText('Company Enrichment')).toBeInTheDocument();

    // Trigger analysis
    fireEvent.click(screen.getByText('Analyze Clinical Trials'));

    // Verify loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for analysis completion
    await waitFor(() => {
      expect(screen.getByText('Clinical Trial Analytics')).toBeInTheDocument();
    });

    // Verify data was saved
    expect(api.saveTrialAnalysis).toHaveBeenCalledWith(
      'TEST001',
      expect.objectContaining({
        studies: expect.any(Array),
        analytics: expect.any(Object)
      })
    );
  });

  test('Analytics integration in overview', async () => {
    render(
      <MemoryRouter initialEntries={['/companies/TEST001']}>
        <CompanyOverview />
      </MemoryRouter>
    );

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('Clinical Trial Analytics')).toBeInTheDocument();
    });

    // Verify analytics components
    expect(screen.getByText('Phase Distribution')).toBeInTheDocument();
    expect(screen.getByText('Trial Status')).toBeInTheDocument();
    expect(screen.getByText('Therapeutic Areas')).toBeInTheDocument();

    // Test refresh functionality
    fireEvent.click(screen.getByText('Refresh Analytics'));
    
    await waitFor(() => {
      expect(api.getTrialAnalysis).toHaveBeenCalledTimes(2);
    });
  });

  test('Error handling and recovery', async () => {
    // Mock error scenario
    api.getTrialAnalysis.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter initialEntries={['/companies/TEST001']}>
        <CompanyOverview />
      </MemoryRouter>
    );

    // Verify error display
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    // Test recovery
    api.getTrialAnalysis.mockResolvedValueOnce(mockTrialData);
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('Clinical Trial Analytics')).toBeInTheDocument();
    });
  });

  test('Data persistence across components', async () => {
    // First enrich the company
    render(
      <MemoryRouter initialEntries={['/companies/TEST001/enrich']}>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Analyze Clinical Trials'));
    await waitFor(() => {
      expect(api.saveTrialAnalysis).toHaveBeenCalled();
    });

    // Then verify data in overview
    render(
      <MemoryRouter initialEntries={['/companies/TEST001']}>
        <CompanyOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Clinical Trial Analytics')).toBeInTheDocument();
      expect(api.getTrialAnalysis).toHaveBeenCalled();
    });

    // Verify data matches
    const savedData = await api.getTrialAnalysis('TEST001');
    expect(savedData).toEqual(mockTrialData);
  });
}); 