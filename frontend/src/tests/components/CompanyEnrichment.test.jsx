import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import CompanyEnrichment from '../../components/CompanyEnrichment';
import { comprehensiveTrialAnalyzer } from '../../services/ComprehensiveTrialAnalyzer';
import { mockCompanyData, mockTrialData } from '../mocks/companyData';

jest.mock('../../services/ComprehensiveTrialAnalyzer');

describe('CompanyEnrichment Component', () => {
  beforeEach(() => {
    comprehensiveTrialAnalyzer.analyzeCompanyTrials.mockResolvedValue(mockTrialData);
  });

  test('renders and handles enrichment', async () => {
    render(
      <MemoryRouter initialEntries={['/companies/TEST001/enrich']}>
        <Route path="/companies/:id/enrich">
          <CompanyEnrichment />
        </Route>
      </MemoryRouter>
    );

    // Check initial render
    expect(screen.getByText('Company Enrichment')).toBeInTheDocument();

    // Click enrich button
    fireEvent.click(screen.getByText('Analyze Clinical Trials'));

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Clinical Trial Analytics')).toBeInTheDocument();
    });

    // Verify data display
    expect(screen.getByText('Total Trials: 1')).toBeInTheDocument();
  });
}); 