import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const StatusDistributionChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name === 'null' ? 'Not Specified' : name,
    value: value
  }));

  return (
    <Card sx={{ minWidth: 300, height: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 