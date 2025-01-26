import React from 'react';
import { Card, CardContent, Typography, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TherapeuticAreasChart({ data }) {
  console.log('TherapeuticAreasChart received:', {
    hasData: !!data,
    dataType: typeof data,
    keys: Object.keys(data || {}),
    sample: data ? Object.entries(data).slice(0, 3) : null
  });

  if (!data || Object.keys(data).length === 0) {
    return <Alert severity="info">No therapeutic area data available</Alert>;
  }

  // Transform data for chart
  const chartData = Object.entries(data)
    .filter(([area]) => area !== '_id')  // Filter out MongoDB _id
    .map(([area, count]) => ({
      name: area,
      value: count
    }))
    .sort((a, b) => b.value - a.value);  // Sort by frequency

  return (
    <Card sx={{ minWidth: 300, height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Therapeutic Areas
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={90} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 