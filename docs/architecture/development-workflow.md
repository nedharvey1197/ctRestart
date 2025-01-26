# Development Workflow

## Overview
During migration, we'll maintain two parallel environments while gradually shifting functionality to the Python backend.

## Development Environments

### 1. Local Development
```
Local Machine
├── VS Code/PyCharm
│   ├── Python Debug Configuration
│   ├── Node.js Debug Configuration
│   └── Frontend Debug Configuration
│
├── Docker Desktop
│   └── Development Containers
│
└── Jupyter Lab
    └── Analysis Notebooks
```

### 2. Development Flow

#### A. Feature Development
1. Start Environment
   ```bash
   # Start all services
   docker-compose -f docker/dev/docker-compose.yml up -d

   # For specific service development
   docker-compose -f docker/dev/docker-compose.yml up backend-python
   ```

2. Code Changes
   - Python Backend:
     * Hot reload enabled
     * Changes reflect immediately
     * Jupyter for prototyping

   - Frontend:
     * Vite hot module replacement
     * Instant UI updates
     * Mock service worker for testing

3. Testing
   ```bash
   # Run Python tests
   docker-compose -f docker/test/docker-compose.test.yml up

   # Run specific tests
   docker exec backend-python-test pytest tests/unit/

   # Frontend tests
   npm test
   ```

#### B. Database Development
1. MongoDB
   - Direct access via MongoDB Compass
   - Test data population
   - Schema validation

2. Neo4j
   - Browser interface (localhost:7474)
   - Graph visualization
   - Query testing

#### C. API Development
1. Documentation
   - FastAPI Swagger UI (localhost:8000/docs)
   - API testing
   - Schema validation

2. Testing
   - Parallel endpoint testing
   - Performance comparison
   - Migration validation

### 3. Common Development Tasks

#### A. Adding New Features
1. Start in Python Backend
   ```bash
   cd backend-python
   poetry add new-package
   ```

2. Create Feature Branch
   ```bash
   git checkout -b feature/new-capability
   ```

3. Development Cycle
   - Write tests
   - Implement feature
   - Test in isolation
   - Integration testing

#### B. Data Migration Tasks
1. Create Migration Script
   ```python
   # backend-python/scripts/migrate_data.py
   async def migrate_collection():
       # Migration logic
   ```

2. Test Migration
   ```bash
   # Run with test data
   docker-compose exec backend-python python scripts/migrate_data.py --test
   ```

3. Verify Results
   - Check data integrity
   - Validate relationships
   - Performance testing

#### C. Analytics Development
1. Jupyter Workflow
   ```bash
   # Start Jupyter environment
   docker-compose exec backend-python jupyter lab
   ```

2. Development Cycle
   - Prototype in notebooks
   - Test with sample data
   - Move to production code
   - Integration testing

### 4. Debugging

#### A. Python Backend
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

#### B. Database Debugging
- MongoDB Compass for document inspection
- Neo4j Browser for graph queries
- Logging configuration for query tracking

### 5. Deployment Testing
1. Local Testing
   ```bash
   docker-compose -f docker/dev/docker-compose.yml up --build
   ```

2. Integration Testing
   ```bash
   docker-compose -f docker/test/docker-compose.test.yml up --build
   ```

3. Performance Testing
   - Load testing
   - Stress testing
   - Comparison with Node.js backend 