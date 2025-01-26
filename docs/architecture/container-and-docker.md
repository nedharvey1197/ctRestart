# Containers and Docker Explained

## Container Contents
- Can contain either:
  * Source code (development)
  * Compiled code (production)
  * Or both (hybrid setup)
- Code is modifiable if:
  * Volume mounts are used
  * Development mode is enabled
  * Source is included

## Docker Specifically
- Docker is a container platform
- Provides:
  * Container creation (Dockerfile)
  * Container management
  * Image distribution
  * Resource control

## Key Docker Concepts
1. Dockerfile
   - Recipe to build container
   - Specifies:
     * Base image (e.g., Node.js)
     * Dependencies to install
     * Code to include
     * Commands to run

2. Docker Image
   - Built from Dockerfile
   - Like a snapshot
   - Shareable/downloadable
   - Versioned

3. Docker Container
   - Running instance of image
   - Can be:
     * Development (with live reload)
     * Production (optimized)
     * Testing (isolated)

## Development vs Production
### Development Container
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
VOLUME ["/app/src"]  # Live code updates
CMD ["npm", "run", "dev"]
```

### Production Container
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm ci --production
RUN npm run build   # Compiled/optimized
CMD ["npm", "start"]
```

## Common Uses
1. Development:
   - Consistent dev environment
   - Easy onboarding
   - Isolated dependencies

2. Production:
   - Reliable deployment
   - Scalable services
   - Resource management 