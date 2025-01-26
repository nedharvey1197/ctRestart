import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clinical Trial Optimizer
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Company
          </Button>
          <Button color="inherit" onClick={() => navigate('/trials')}>
            Trials
          </Button>
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
} 