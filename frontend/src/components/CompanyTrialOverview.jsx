import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Typography,
  Chip,
  Alert,
  Box
} from '@mui/material';

export function CompanyTrialOverview({ trials }) {
  console.log('CompanyTrialOverview rendering:', {
    trialCount: trials?.length,
    hasTrials: !!trials,
    firstTrial: trials?.[0]
  });

  if (!trials?.length) {
    return (
      <Alert severity="info">No clinical trials found</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Total Trials: {trials.length}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NCT ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Phase</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trials.map((trial, index) => (
              <TableRow 
                key={`${trial.protocolSection.identificationModule.nctId}-${index}`}
              >
                <TableCell>
                  {trial.protocolSection.identificationModule.nctId}
                </TableCell>
                <TableCell>
                  {trial.protocolSection.identificationModule.briefTitle}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={trial.protocolSection.designModule.phases[0] || 'N/A'} 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={trial.protocolSection.statusModule.overallStatus} 
                    color={getStatusColor(trial.protocolSection.statusModule.overallStatus)}
                  />
                </TableCell>
                <TableCell>
                  {formatDate(trial.protocolSection.statusModule.startDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'recruiting':
      return 'success';
    case 'completed':
      return 'default';
    case 'active':
      return 'primary';
    case 'terminated':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}; 