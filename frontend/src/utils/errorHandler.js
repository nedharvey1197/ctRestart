export class TrialAnalysisError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'TrialAnalysisError';
    this.code = code;
    this.details = details;
  }
}

export const handleTrialAnalysisError = (error) => {
  if (error instanceof TrialAnalysisError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  return {
    message: 'An unexpected error occurred during trial analysis',
    code: 'UNKNOWN_ERROR',
    details: { originalError: error.message }
  };
}; 