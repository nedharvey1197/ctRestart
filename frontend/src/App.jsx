import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import CompanyRegistration from './components/CompanyRegistration';
import CompanyEnrichment from './components/CompanyEnrichment';
import CompanyOverview from './components/CompanyOverview';
import theme from './theme'; // You might need to create this
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<CompanyRegistration />} />
              <Route path="companies/:id/enrich" element={<CompanyEnrichment />} />
              <Route path="companies/:id/overview" element={<CompanyOverview />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App; 