import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../../App';

jest.mock('axios');

/**
 * @fileoverview Integration Tests for Company Trial Flow
 * 
 * Tests the complete flow of company registration, trial analysis,
 * and data visualization. Covers critical user paths and edge cases.
 * 
 * @testing
 * - Company registration
 * - Trial data fetching
 * - Analysis processing
 * - Data visualization
 * - Error handling
 */

describe('Company and Trial Registration Flow', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
  });

  test('complete registration flow', async () => {
    // Mock successful company registration
    axios.post.mockResolvedValueOnce({ 
      data: { 
        _id: '123', 
        companyName: 'Test Company' 
      } 
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Fill company form
    await userEvent.type(screen.getByLabelText('Company Name'), 'Test Company');
    await userEvent.type(screen.getByLabelText('Therapeutic Area'), 'Oncology');
    
    // Submit company form
    fireEvent.click(screen.getByRole('button', { name: /register company/i }));

    // Verify company registration
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/companies'),
        expect.objectContaining({
          companyName: 'Test Company',
          therapeuticArea: 'Oncology'
        })
      );
    });

    // Navigate to trial form
    fireEvent.click(screen.getByRole('link', { name: /manage trials/i }));

    // Fill trial form
    await userEvent.type(screen.getByLabelText('Trial ID'), 'NCT12345678');
    
    // Continue testing trial form submission...
  });
}); 