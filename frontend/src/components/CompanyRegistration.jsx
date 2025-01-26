import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { comprehensiveTrialAnalyzer } from '../services';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as api from '../services/api';

const COMPANY_SIZES = [
  'Small (<50 employees)',
  'Medium (50-250 employees)',
  'Large (251-1000 employees)',
  'Enterprise (1000+ employees)'
];

const THERAPEUTIC_AREAS = [
  'Oncology',
  'Cardiology',
  'Neurology',
  'Immunology',
  'Rare Diseases',
  'Infectious Diseases',
  'Other'
];

export default function CompanyRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companySize: '',
    therapeuticAreas: [],
    headquarters: '',
    contactEmail: ''
  });

  useEffect(() => {
    checkExistingCompany();
  }, []);

  const checkExistingCompany = async () => {
    try {
      setLoading(true);
      const company = await api.getCurrentCompany();
      if (company) {
        setIsEditing(true);
        setFormData({
          companyName: company.companyName || '',
          companyWebsite: company.companyWebsite || '',
          companySize: company.companySize || '',
          therapeuticAreas: company.therapeuticAreas || [],
          headquarters: company.headquarters || '',
          contactEmail: company.contactEmail || ''
        });
      }
    } catch (err) {
      console.error('Error checking existing company:', err);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        const company = await api.saveCompany(formData);
        
        const trialAnalysis = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(
            formData.companyName
        );
        
        await api.saveCompanyTrials(company._id, trialAnalysis.studies);
        await api.saveTrialAnalysis(company._id, trialAnalysis);
        
        navigate(`/companies/${company._id}/overview`);
        
    } catch (error) {
        console.error('Submission failed:', error);
        setError(error.message || 'Failed to save company and analysis data');
        toast.error('Failed to save company data. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  if (loading && !formData.companyName) {  // Only show loading state for initial load
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Company' : 'Register Company'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        required
        name="companyName"
        label="Company Name"
        margin="normal"
        value={formData.companyName}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        required
        name="companyWebsite"
        label="Company Website"
        margin="normal"
        type="url"
        value={formData.companyWebsite}
        onChange={handleChange}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="company-size-label">Company Size</InputLabel>
        <Select
          labelId="company-size-label"
          name="companySize"
          value={formData.companySize}
          onChange={handleChange}
          label="Company Size"
        >
          {COMPANY_SIZES.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="therapeutic-areas-label">Therapeutic Areas</InputLabel>
        <Select
          labelId="therapeutic-areas-label"
          name="therapeuticAreas"
          multiple
          value={formData.therapeuticAreas}
          onChange={handleChange}
          label="Therapeutic Areas"
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {THERAPEUTIC_AREAS.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        name="headquarters"
        label="Headquarters Location"
        margin="normal"
        value={formData.headquarters}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        required
        name="contactEmail"
        label="Contact Email"
        margin="normal"
        type="email"
        value={formData.contactEmail}
        onChange={handleChange}
      />

      {/* Add analysis indicator */}
      {isAnalyzing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          AI is analyzing clinical trials data...
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          loading={loading}
          variant="contained"
          fullWidth
        >
          Register and Analyze
        </LoadingButton>
      </Box>
    </Box>
  );
} 