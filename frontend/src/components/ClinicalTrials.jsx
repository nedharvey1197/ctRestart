import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ClinicalTrials({ trials }) {
  if (!trials?.length) {
    return (
      <Typography color="textSecondary">
        No clinical trials found
      </Typography>
    );
  }

  return (
    <Box>
      {trials.map((trial) => (
        <Accordion key={trial.nctId}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography variant="subtitle1">
                {trial.title}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip 
                  label={trial.phase || 'Phase Not Specified'} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={trial.status} 
                  size="small" 
                  color={trial.status === 'Completed' ? 'success' : 'default'}
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Conditions</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {trial.conditions?.map((condition, i) => (
                    <Chip key={i} label={condition} size="small" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2">Interventions</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {trial.interventions?.map((intervention, i) => (
                    <Chip key={i} label={intervention} size="small" />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Start Date</Typography>
                <Typography>{trial.startDate || 'Not specified'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Completion Date</Typography>
                <Typography>{trial.completionDate || 'Not specified'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Locations</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {trial.locations?.map((location, i) => (
                    <Chip 
                      key={i} 
                      label={`${location.city}, ${location.country}`} 
                      size="small" 
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Link 
                  href={trial.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on ClinicalTrials.gov
                </Link>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 