import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

export const SearchProgressIndicator = ({ message = "AI Analysis in Progress..." }) => {
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        textAlign: 'center'
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {message}
      </Typography>
      <LinearProgress sx={{ mt: 2, width: '100%' }} />
    </Box>
  );
}; 