import React from 'react';
import { Card, CardContent, Table, TableBody, TableCell, TableRow, Typography, Grid } from '@mui/material';

export function TrialAnalyticsSummary({ analytics }) {
  console.log('TrialAnalyticsSummary rendering:', {
    hasAnalytics: !!analytics,
    metrics: Object.keys(analytics || {}),
    phaseCount: Object.keys(analytics?.phaseDistribution || {}).length,
    statusData: analytics?.statusSummary,
    recruitingCount: analytics?.activeTrials || analytics?.statusSummary?.['Recruiting'] || 0,
    fullAnalytics: analytics
  });

  if (!analytics) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Trial Analysis Summary</Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Trials</TableCell>
              <TableCell>{analytics.totalTrials || analytics.studies?.length || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Recruiting Trials</TableCell>
              <TableCell>{analytics.statusSummary?.['RECRUITING'] || analytics.activeTrials || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Status Distribution</TableCell>
              <TableCell>
                {Object.entries(analytics.statusSummary || {})
                  .filter(([status]) => status !== '_id')
                  .map(([status, count]) => `${status}: ${count}`)
                  .join(', ') || 'No status data available'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Phase Distribution</TableCell>
              <TableCell>
                {Object.entries(analytics.phaseDistribution || {})
                  .filter(([phase]) => phase !== '_id')
                  .map(([phase, count]) => `${phase}: ${count}`)
                  .join(', ') || 'No phase data available'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 