# API Endpoint Analysis

## Current Frontend Integration Points

### Company Trial Flow Tests
Location: frontend/src/tests/integration/CompanyTrialFlow.test.jsx

Required Endpoints:

1. Company Search
```typescript
GET /api/companies/search
Query params:
  - name: string
  - limit?: number
Response: {
  companies: Array<{
    id: string,
    name: string,
    // other company fields
  }>
}
```

2. Trial Data
```typescript
GET /api/trials/{company_id}
Response: {
  trials: Array<{
    nct_id: string,
    title: string,
    status: string,
    // other trial fields
  }>
}
```

## Implementation Plan

1. Create API Router Structure
```python
backend-python/
├── app/
│   ├── routes/
│   │   ├── companies.py
│   │   └── trials.py
│   ├── models/
│   │   ├── company.py
│   │   └── trial.py
│   └── services/
       ├── company_service.py
       └── trial_service.py
```

2. Database Models
```python
# MongoDB collections
- companies
- trials
- trial_companies (relationships)

# Neo4j (future)
- Company nodes
- Trial nodes
- PARTICIPATES_IN relationships
``` 