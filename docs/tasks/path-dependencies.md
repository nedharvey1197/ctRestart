# Path Dependency Analysis

## Current Structure
```
CLINICAL_TRIAL_RESTART/
├── backend/               # Current Node.js backend
└── frontend/             # React frontend
```

## Proposed Structure
```
CLINICAL_TRIAL_RESTART/
├── backend/              # Keep current Node.js backend as-is
├── backend-python/       # New Python backend
├── frontend/            # Current frontend unchanged
└── docker/             # New container configurations
```

## Path Impact Analysis

### No Changes Required
1. Frontend Files (paths remain valid):
   - frontend/src/services/api.js
   - frontend/src/tests/integration/CompanyTrialFlow.test.jsx
   - frontend/src/tests/setup/testSetup.js
   - frontend/src/App.jsx
   - frontend/src/main.jsx

2. Backend Files (unchanged):
   - backend/.eslintrc.js
   - backend/.env
   - All current backend paths

### New Files Only
1. Docker Configuration
   ```yaml:docker/dev/docker-compose.yml
   services:
     backend:
       build: ../../backend
       # ... existing backend config

     backend-python:
       build: ../../backend-python
       # ... new Python backend config
   ```

2. Python Backend
   ```
   backend-python/
   ├── app/
   ├── tests/
   └── notebooks/
   ```

## Implementation Steps
```bash
# 1. Create new directories (keeping existing structure)
cd CLINICAL_TRIAL_RESTART
mkdir backend-python
mkdir docker
mkdir docker/dev
mkdir docker/test

# 2. Initialize Python project
cd backend-python
poetry init
poetry add fastapi uvicorn

# 3. Create Docker configs
cd ../docker/dev
touch docker-compose.yml
```

## Advantages
1. No path updates needed
2. Existing code untouched
3. Gradual migration possible
4. Clean separation of concerns

## 1. Files Requiring Updates

### Frontend Files
1. API Configuration
   - src/services/api.js (API_BASE_URL)
   - src/config/config.js (if exists)
   - .env files (API paths)

2. Test Files
   - src/tests/integration/CompanyTrialFlow.test.jsx
   - src/tests/setup/testSetup.js
   - Any mock configurations

### Backend Files
1. Configuration
   - .env files
   - Docker configurations
   - MongoDB connection strings

2. Package.json
   - Script paths
   - Module references

## 2. Alternative Approach

### Option 1: Symbolic Link
```bash
# Keep old path working while reorganizing
mv backend backend-node
ln -s backend-node backend
```

### Option 2: Staged Migration
1. Create new structure:
   ```
   project_root/
   ├── services/
   │   ├── backend/         # Current (unchanged)
   │   └── backend-python/  # New Python backend
   ```

2. Later reorganize:
   ```
   project_root/
   ├── services/
   │   ├── legacy-node/    # Renamed after migration
   │   └── backend/        # Python becomes primary
   ```

## Recommendation
1. Use Option 2 (Staged Migration):
   - Minimal immediate impact
   - No path updates needed now
   - Cleaner final structure
   - Better migration control

2. Implementation Steps:
   ```bash
   # 1. Create new directories
   mkdir -p services
   mv backend services/backend
   mkdir services/backend-python

   # 2. Update docker-compose paths only
   # 3. No other immediate path changes needed
   ```



