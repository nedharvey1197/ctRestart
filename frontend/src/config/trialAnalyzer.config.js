/**
 * @fileoverview Trial Analyzer Configuration
 * 
 * Central configuration for the trial analysis system.
 * Controls API endpoints, timeouts, and required data modules.
 * 
 * @configuration
 * - API endpoints
 * - Timeout settings
 * - Required data modules
 * - Cache settings
 * - Retry policies
 */

export const trialAnalyzerConfig = {
  apiEndpoint: 'https://clinicaltrials.gov/api/v2/studies',
  maxRetries: 3,
  timeout: 30000,
  pageSize: 100,
  requiredModules: [
    'IdentificationModule', 
    'StatusModule', 
    'SponsorCollaboratorsModule',
    'OversightModule',
    'DescriptionModule', 
    'ConditionsModule',
    'DesignModule', 
    'ArmsInterventionsModule', 
    'OutcomesModule',
    'EligibilityModule', 
    'ContactsLocationsModule', 
    'ReferencesModule',
    'IPDSharingStatementModule', 
    'ParticipantFlowModule',
    'BaselineCharacteristicsModule', 
    'OutcomeMeasuresModule',
    'AdverseEventsModule'
  ]
}; 