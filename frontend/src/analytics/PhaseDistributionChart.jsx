import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const PhaseDistributionChart = ({ data }) => {
  // Transform data for chart
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name === 'null' ? 'Not Specified' : name,
    value: value
  }));

  return (
    <Card sx={{ minWidth: 300, height: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Phase Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 