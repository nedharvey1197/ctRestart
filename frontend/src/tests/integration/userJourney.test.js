import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../../services/api';
import { comprehensiveTrialAnalyzer } from '../../services/ComprehensiveTrialAnalyzer';
import CompanyEnrichment from '../../components/CompanyEnrichment';

describe('Single Company Trial Analysis Flow', () => {
  const mockCompany = {
    companyName: "Test Pharma",
    companyWebsite: "https://testpharma.com",
    contactEmail: "contact@testpharma.com"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial company setup triggers trial analysis', async () => {
    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    // Fill company form
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: mockCompany.companyName }
    });
    fireEvent.change(screen.getByLabelText(/website/i), {
      target: { value: mockCompany.companyWebsite }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: mockCompany.contactEmail }
    });

    // Save company - this should trigger analysis automatically
    fireEvent.click(screen.getByText(/save/i));

    // Verify save and automatic analysis flow
    await waitFor(() => {
      // Verify company save
      expect(api.createCompany).toHaveBeenCalledWith(mockCompany);
      
      // Verify automatic trial analysis trigger
      expect(comprehensiveTrialAnalyzer.analyzeCompanyTrials)
        .toHaveBeenCalledWith(mockCompany.companyName);
      
      // Verify analysis results storage
      expect(api.saveTrialAnalysis).toHaveBeenCalled();
    });

    // Verify UI feedback
    expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
  });

  test('company update triggers new analysis', async () => {
    // Mock existing company
    api.getCurrentCompany.mockResolvedValue(mockCompany);

    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    // Update company name
    const updatedName = "Updated Pharma";
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: updatedName }
    });

    // Save updates - should trigger new analysis
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      // Verify update saved
      expect(api.updateCompany).toHaveBeenCalledWith({
        ...mockCompany,
        companyName: updatedName
      });

      // Verify new analysis triggered automatically
      expect(comprehensiveTrialAnalyzer.analyzeCompanyTrials)
        .toHaveBeenCalledWith(updatedName);
    });
  });

  test('handles analysis errors during company save', async () => {
    render(
      <MemoryRouter>
        <CompanyEnrichment />
      </MemoryRouter>
    );

    // Mock analysis error
    comprehensiveTrialAnalyzer.analyzeCompanyTrials
      .mockRejectedValueOnce(new Error('Analysis Failed'));

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: mockCompany.companyName }
    });
    fireEvent.click(screen.getByText(/save/i));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });
}); 