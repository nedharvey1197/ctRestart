import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

const AnalysisSummary = ({ data }) => {
    if (!data) return null;

    const { 
        totalTrials,
        registeredTrials,
        preRegistrationTrials,
        phaseDistribution,
        therapeuticAreas,
        statusSummary,
        enrollmentStats
    } = data;

    return (
        <Box mt={4}>
            <Typography variant="h5" gutterBottom>
                Analysis Summary
            </Typography>
            <Grid container spacing={3}>
                {/* Trial Counts */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trial Overview
                            </Typography>
                            <Typography>Total Trials: {totalTrials}</Typography>
                            <Typography>Registered: {registeredTrials}</Typography>
                            <Typography>Pre-registration: {preRegistrationTrials}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Phase Distribution */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Phase Distribution
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {Object.entries(phaseDistribution || {}).map(([phase, count]) => (
                                    <Chip 
                                        key={phase}
                                        label={`${phase}: ${count}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Enrollment Stats */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Enrollment Statistics
                            </Typography>
                            <Typography>Total: {enrollmentStats?.total || 0}</Typography>
                            <Typography>Average: {enrollmentStats?.average || 0}</Typography>
                            <Typography>Median: {enrollmentStats?.median || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Therapeutic Areas */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Therapeutic Areas
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Area</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(therapeuticAreas || {})
                                            .sort(([,a], [,b]) => b - a)
                                            .map(([area, count]) => (
                                                <TableRow key={area}>
                                                    <TableCell>{area}</TableCell>
                                                    <TableCell align="right">{count}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Status Summary */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trial Status Summary
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {Object.entries(statusSummary || {}).map(([status, count]) => (
                                    <Chip 
                                        key={status}
                                        label={`${status}: ${count}`}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalysisSummary; 