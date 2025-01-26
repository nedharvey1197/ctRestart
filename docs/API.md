# Clinical Trial Analyzer API Documentation

## Endpoints

### POST /companies/:id/trials
Analyzes and stores clinical trial data for a company.

**Request:**
```json
{
  "companyName": "string",
  "options": {
    "forceRefresh": boolean,
    "outputPath": "string"
  }
}
```

**Response:**
```json
{
  "studies": Array<Study>,
  "analytics": {
    "totalTrials": number,
    "phaseDistribution": object,
    "therapeuticAreas": object
  }
}
```

### GET /companies/:id/trials
Retrieves analyzed trial data for a company.

**Response:**
```json
{
  "clinicalTrials": Array<Study>,
  "trialAnalytics": object,
  "lastAnalyzed": string
}
```

### Error Responses
- 400: Invalid Request Format
- 404: Company Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error

### Rate Limiting
- Maximum 100 requests per minute
- Bulk analysis limited to 1000 trials

### Caching Behavior
- Cache TTL: 1 hour
- Force refresh available 