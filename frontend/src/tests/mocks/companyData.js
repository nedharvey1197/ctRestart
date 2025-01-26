export const mockCompanyData = {
  companyName: 'Test Pharma',
  companyWebsite: 'https://testpharma.com',
  description: 'Test pharmaceutical company',
  enrichedData: {
    therapeuticAreas: ['Oncology', 'Neurology'],
    technologies: ['Small Molecules', 'Biologics']
  },
  contextualData: {
    metrics: [
      { context: 'Revenue: $100M' },
      { context: 'Employees: 500' }
    ],
    developmentStages: new Set(['Phase 1', 'Phase 2'])
  }
};

export const mockTrialData = {
  studies: [
    {
      protocolSection: {
        identificationModule: {
          nctId: 'NCT0001',
          briefTitle: 'Test Trial'
        },
        statusModule: {
          overallStatus: 'Active',
          startDateStruct: { date: '2023-01-01' }
        }
      }
    }
  ],
  analytics: {
    totalTrials: 1,
    registeredTrials: 1,
    phaseDistribution: { 'Phase 1': 1 }
  },
  queryDate: new Date().toISOString()
}; 