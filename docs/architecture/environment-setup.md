# Complete Environment & Testing Setup

## 1. Full Environment Structure
```
project_root/
├── backend-node/          # Current backend (to be migrated)
│   ├── .env
│   ├── .eslintrc.js
│   └── package.json
│
├── backend-python/        # New Python backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── settings.py
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── integration/
│   │   └── unit/
│   ├── notebooks/
│   │   ├── analysis/
│   │   └── development/
│   ├── pyproject.toml
│   ├── poetry.lock
│   ├── .env
│   └── Dockerfile
│
├── frontend/             # Existing frontend
│   ├── src/
│   │   ├── tests/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── docker/
    ├── dev/
    │   ├── docker-compose.yml
    │   └── .env
    └── test/
        ├── docker-compose.test.yml
        └── .env.test
```

## 2. Docker Configuration

```yaml:docker/dev/docker-compose.yml
version: '3.8'

services:
  backend-python:
    build: 
      context: ../../backend-python
      dockerfile: Dockerfile
    volumes:
      - ../../backend-python:/app
      - python-deps:/app/.venv
    environment:
      - PYTHONPATH=/app
      - ENVIRONMENT=development
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
      - neo4j

  backend-node:
    build: ../../backend-node
    volumes:
      - ../../backend-node:/app
      - node-modules:/app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - mongodb

  frontend:
    build: ../../frontend
    volumes:
      - ../../frontend:/app
      - frontend-node-modules:/app/node_modules
    ports:
      - "5173:5173"

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db

  neo4j:
    image: neo4j:latest
    environment:
      - NEO4J_AUTH=neo4j/password
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j-data:/data

volumes:
  python-deps:
  node-modules:
  frontend-node-modules:
  mongodb-data:
  neo4j-data:
```

## 3. Testing Isolation

### A. Python Backend Tests
```python:backend-python/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings

@pytest.fixture(scope="session")
def test_settings():
    return get_settings(env_file=".env.test")

@pytest.fixture
def test_client(test_settings):
    return TestClient(app)

@pytest.fixture(scope="session")
def mongo_client(test_settings):
    # Setup test MongoDB connection
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(test_settings.MONGODB_URL)
    yield client
    client.close()

@pytest.fixture(scope="session")
def neo4j_client(test_settings):
    # Setup test Neo4j connection
    from neo4j import GraphDatabase
    driver = GraphDatabase.driver(
        test_settings.NEO4J_URL,
        auth=(test_settings.NEO4J_USER, test_settings.NEO4J_PASSWORD)
    )
    yield driver
    driver.close()
```

### B. Test Docker Configuration
```yaml:docker/test/docker-compose.test.yml
version: '3.8'

services:
  backend-python-test:
    build: 
      context: ../../backend-python
      dockerfile: Dockerfile.test
    environment:
      - PYTHONPATH=/app
      - ENVIRONMENT=test
    depends_on:
      - mongodb-test
      - neo4j-test
    command: pytest

  mongodb-test:
    image: mongo:latest
    environment:
      - MONGO_INITDB_DATABASE=test_db

  neo4j-test:
    image: neo4j:latest
    environment:
      - NEO4J_AUTH=neo4j/test_password
```

### C. Frontend Test Integration
```javascript:frontend/src/tests/setup/testSetup.js
import { beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup mock service worker
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
```

## 4. Environment Variables

```env:backend-python/.env.example
# API Settings
API_VERSION=v1
DEBUG=True
ENVIRONMENT=development

# Server
HOST=0.0.0.0
PORT=8000

# Database
MONGODB_URL=mongodb://mongodb:27017/clinical_trials
NEO4J_URL=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Services
NODE_BACKEND_URL=http://backend-node:3000
JUPYTER_TOKEN=your_secure_token
``` 