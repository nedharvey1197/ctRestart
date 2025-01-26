/**
 * @fileoverview Company Overview Dashboard Component
 * 
 * Primary dashboard component that displays comprehensive company trial data including:
 * - Basic company information
 * - Trial analytics visualizations
 * - Therapeutic area breakdowns
 * - Phase distribution charts
 * 
 * @integration
 * - Connects to ComprehensiveTrialAnalyzer for data processing
 * - Uses API service for data fetching
 * - Integrates with MUI components for UI
 * 
 * @flow
 * 1. Loads company data on mount
 * 2. Automatically triggers analysis if data is stale
 * 3. Updates visualizations with processed data
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { comprehensiveTrialAnalyzer } from '../services/ComprehensiveTrialAnalyzer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { useLoadingState } from '../hooks/useLoadingState';
import { PhaseDistributionChart } from '../analytics/PhaseDistributionChart';
import { StatusDistributionChart } from '../analytics/StatusDistributionChart';
import { TherapeuticAreasChart } from '../analytics/TherapeuticAreasChart';
import { TrialAnalyticsSummary } from './TrialAnalyticsSummary';
import { CompanyTrialOverview } from './CompanyTrialOverview';
import { SearchProgressIndicator } from './SearchProgressIndicator';

export default function CompanyOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const { isLoading: isLoadingAnalytics, startLoading, stopLoading } = 
    useLoadingState('overview', 'analytics');

  useEffect(() => {
    loadCompanyData();  // Single source of truth
  }, [id]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const data = await api.getCompany(id);
      console.log('Company data from API:', {
        hasAnalytics: !!data.trialAnalytics,
        analytics: data.trialAnalytics,
        trials: data.clinicalTrials?.length
      });

      setCompany(data);
      
      // Check if we need to analyze trials
      const needsAnalysis = !data.trialAnalytics || 
        !data.trialAnalytics.therapeuticAreas?.analyzed?.areas ||
        !data.lastAnalyzed ||
        new Date(data.lastAnalyzed) < new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours old
      
      if (data.clinicalTrials?.length) {
        if (needsAnalysis) {
          console.log('Analysis needed:', {
            hasAnalytics: !!data.trialAnalytics,
            lastAnalyzed: data.lastAnalyzed,
            hasAreas: !!data.trialAnalytics?.therapeuticAreas?.analyzed?.areas
          });
          setAnalyzing(true);
          try {
            // Run new analysis
            const results = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(data.companyName);
            // Save results
            await api.saveTrialAnalysis(id, results);
            // Get updated data
            const updatedData = await api.getCompany(id);
            setCompany(updatedData);
            setTrialData({
              studies: updatedData.clinicalTrials,
              analytics: updatedData.trialAnalytics,
              lastUpdated: new Date(updatedData.lastAnalyzed)
            });
          } catch (err) {
            console.error('Analysis failed:', err);
            // Still show existing data if analysis fails
            setTrialData({
              studies: data.clinicalTrials,
              analytics: data.trialAnalytics,
              lastUpdated: new Date(data.lastAnalyzed)
            });
          } finally {
            setAnalyzing(false);
          }
        } else {
          // Use stored analytics from backend
          setTrialData({
            studies: data.clinicalTrials,
            analytics: data.trialAnalytics,
            lastUpdated: new Date(data.lastAnalyzed)
          });
        }

        console.log('Using stored analytics:', {
          hasPhaseData: !!data.trialAnalytics?.phaseDistribution,
          hasStatusData: !!data.trialAnalytics?.statusSummary,
          hasTherapeuticAreas: !!data.trialAnalytics?.therapeuticAreas
        });
      }
    } catch (err) {
      console.error('Error loading company data:', err);
      setError(err.message || 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box p={4}>
        <Alert severity="warning">Company not found</Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Return to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Company Overview</Typography>
      </Box>

      {/* Basic Company Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Company Details</Typography>
              <Typography><strong>Name:</strong> {company.companyName}</Typography>
              <Typography><strong>Website:</strong> {company.companyWebsite}</Typography>
              {company.description && (
                <Typography><strong>Description:</strong> {company.description}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trial Analytics Section */}
        {trialData && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Clinical Trial Analytics
            </Typography>
            {console.log('Passing to TrialAnalyticsSummary:', {
              fullAnalytics: trialData.analytics,
              structure: {
                totalTrials: trialData.analytics?.totalTrials,
                phaseDistribution: trialData.analytics?.phaseDistribution,
                statusSummary: trialData.analytics?.statusSummary,
                therapeuticAreas: trialData.analytics?.therapeuticAreas
              }
            })}
            <TrialAnalyticsSummary analytics={trialData.analytics} />
          </Grid>
        )}

        {/* Clinical Trials List */}
        {analyzing && (
          <SearchProgressIndicator 
            message="AI is analyzing clinical trials data..." 
          />
        )}

        {trialData?.studies && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Clinical Trials
            </Typography>
            <CompanyTrialOverview trials={trialData.studies} />
          </Grid>
        )}

        {trialData && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Trial Distribution
              </Typography>
              {console.log('Passing to Distribution Charts:', {
                phaseData: {
                  raw: trialData.analytics.phaseDistribution,
                  keys: Object.keys(trialData.analytics.phaseDistribution || {}),
                  values: Object.values(trialData.analytics.phaseDistribution || {})
                },
                statusData: {
                  raw: trialData.analytics.statusSummary,
                  keys: Object.keys(trialData.analytics.statusSummary || {}),
                  values: Object.values(trialData.analytics.statusSummary || {})
                }
              })}
              <Box display="flex" gap={2}>
                <PhaseDistributionChart data={trialData.analytics.phaseDistribution} />
                <StatusDistributionChart data={trialData.analytics.statusSummary} />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Therapeutic Areas
              </Typography>
              {console.log('Passing to TherapeuticAreasChart:', {
                raw: trialData.analytics.therapeuticAreas,
                analyzed: trialData.analytics.therapeuticAreas?.analyzed?.areas,
                dataType: typeof trialData.analytics.therapeuticAreas?.analyzed?.areas
              })}
              {trialData.analytics.therapeuticAreas?.analyzed?.areas && (
                <TherapeuticAreasChart 
                  data={trialData.analytics.therapeuticAreas.analyzed.areas}
                />
              )}
              {!trialData.analytics.therapeuticAreas?.analyzed?.areas && (
                <Alert severity="info">
                  No therapeutic area data available
                </Alert>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 