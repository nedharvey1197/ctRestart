import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CompanyRegistration from '../components/CompanyRegistration';

// Mock axios
jest.mock('axios');

describe('CompanyRegistration Component', () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  test('renders registration form', () => {
    render(<CompanyRegistration />);
    expect(screen.getByText('Company Registration')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: '123' } });

    render(<CompanyRegistration />);

    await userEvent.type(screen.getByLabelText('Company Name'), 'Test Company');
    await userEvent.type(screen.getByLabelText('Therapeutic Area'), 'Oncology');
    
    fireEvent.click(screen.getByRole('button', { name: /register company/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          companyName: 'Test Company',
          therapeuticArea: 'Oncology'
        })
      );
    });
  });
}); 