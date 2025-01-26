export interface TrialSearchRequest {
  companyName: string;
  outputPath?: string;
  parameters?: SearchParameters;
}

export interface TrialSearchResponse {
  trialData: CompanyTrialData;
  analytics: AnalyticsSummary;
  metadata: SearchMetadata;
}

export interface CompanyTrialData {
  companyName: string;
  queryDate: string;
  studies: Study[];
  analytics: AnalyticsSummary;
}

export interface AnalyticsSummary {
  totalTrials: number;
  registeredTrials: number;
  preRegistrationTrials: number;
  phaseDistribution: Record<string, number>;
  therapeuticAreas: Record<string, number>;
  interventions: Record<string, string[]>;
  enrollmentStats: EnrollmentStats;
  statusSummary: Record<string, number>;
}

export interface Study {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
    };
    statusModule: {
      overallStatus: string;
      startDateStruct: { date: string };
      completionDateStruct: { date: string };
    };
    sponsorCollaboratorsModule: {
      leadSponsor: { name: string };
    };
    designModule: {
      phases: string[];
      enrollmentInfo: { count: number };
    };
    conditionsModule: {
      conditions: string[];
    };
    armsInterventionsModule: {
      interventions: Array<{
        type: string;
        name: string;
      }>;
    };
  };
}

export interface SearchParameters {
  pageSize?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchMetadata {
  totalResults: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  queryTimestamp: string;
}

export interface EnrollmentStats {
  total: number;
  average: number;
  median: number;
} 