import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>{message}</Typography>
      </Box>
    </Box>
  );
};

export default LoadingOverlay; 