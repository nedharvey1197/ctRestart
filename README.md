# Clinical Trial Optimizer

A system for optimizing clinical trial processes and management.

## Prerequisites

- Python 3.11
- Node.js (v14 or higher)
- MongoDB Community Edition
- Conda or Miniconda
- npm or yarn

### Environment Setup

1. Create and activate conda environment:
   ```bash
   conda create -n clinical_trials python=3.11 nodejs
   conda activate clinical_trials
   ```

2. Install Python dependencies:
   ```bash
   cd python_services
   pip install -r requirements.txt
   ```

### Installing Prerequisites (MacOS)

1. Install Homebrew (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install MongoDB:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

3. Start MongoDB:
   ```bash
   brew services start mongodb-community
   ```

4. Verify MongoDB is running:
   ```bash
   brew services list
   mongosh
   ```

## Project Structure

- `backend/`: Node.js/Express backend service
- `frontend/`: React frontend application

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend runs on: http://localhost:3001
- Frontend runs on: http://localhost:5173

## Testing

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage report
```

## Troubleshooting

### MongoDB Issues

If MongoDB isn't running:
```bash
# Start MongoDB service
brew services start mongodb-community

# Check MongoDB status
brew services list
```

If you need to stop MongoDB:
```bash
brew services stop mongodb-community
```

### Port Conflicts

If you get port in use errors:
1. Find the process using the port:
   ```bash
   lsof -i :3001    # For backend port
   lsof -i :5173    # For frontend port
   ```
2. Kill the process:
   ```bash
   kill -9 <PID>
   ``` 