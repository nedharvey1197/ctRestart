import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { LoadingOverlay } from './LoadingOverlay';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { comprehensiveTrialAnalyzer } from '../services/ComprehensiveTrialAnalyzer';
import { useLoadingState } from '../hooks/useLoadingState';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';
import AnalysisSummary from './AnalysisSummary';

export default function CompanyEnrichment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, startLoading, stopLoading } = useLoadingState('enrichment', 'analyze');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleAnalyze = async () => {
    try {
      startLoading();
      const company = await api.getCompany(id);
      
      // Run analysis
      const results = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(company.companyName);
      
      // Save results
      await api.saveTrialAnalysis(id, results);
      
      setAnalysisData(results);
    } catch (err) {
      stopLoading(err);
    } finally {
      stopLoading();
    }
  };

  const handleCompanySubmit = async (companyData) => {
    try {
      setIsAnalyzing(true);
      
      // Save/Update company info
      const company = await api.createCompany(companyData);
      
      // Show AI analysis message
      toast.info("AI is scrubbing ClinicalTrials.gov to gather trial data...");
      
      // Run comprehensive analysis
      const trialAnalysis = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(company.name);
      
      // Save analysis to backend
      await api.saveTrialAnalysis(company.id, trialAnalysis);
      
      setAnalysisResults(trialAnalysis);
      
      // Navigate to overview with new data
      navigate(`/company/${company.id}/overview`);
      
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Company Enrichment
      </Typography>
      
      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Analyze Clinical Trials'}
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate(`/companies/${id}`)}
        >
          View Overview
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isAnalyzing && (
        <LoadingOverlay message="AI Analysis in Progress..." />
      )}

      {analysisResults && (
        <AnalysisSummary data={analysisResults} />
      )}

      {analysisData && (
        <Box mt={4}>
          {/* Company Details Section */}
          <Typography variant="h5" gutterBottom>
            Company Details
          </Typography>
          <Grid container spacing={3}>
            {/* Therapeutic Areas */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Therapeutic Areas
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {analysisData.enrichedFields?.therapeuticAreas?.map((area, i) => (
                      <Chip key={i} label={area} color="primary" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Technologies */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Technologies
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {analysisData.enrichedFields?.technologies?.map((tech, i) => (
                      <Chip key={i} label={tech} color="secondary" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Locations */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Global Presence
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {analysisData.enrichedFields?.locations?.map((location, i) => (
                      <Chip key={i} label={location} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Metrics */}
            {analysisData.contextualData.metrics?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Metrics
                    </Typography>
                    <Box>
                      {analysisData.contextualData.metrics.map((metric, i) => (
                        <Typography key={i} variant="body2">
                          • {metric.context}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Development Stages */}
            {analysisData.contextualData.developmentStages?.size > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Development Stages
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {[...analysisData.contextualData.developmentStages].map((stage, i) => (
                        <Chip key={i} label={stage} color="info" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
} 