const helmet = require('helmet');
const cors = require('cors');

const setupSecurity = (app) => {
  // CORS configuration for development
  app.use(cors({
    origin: true,  // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Requested-With']
  }));

  // Handle preflight requests
  app.options('*', cors());

  // Only use helmet in production
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  }
};

module.exports = { setupSecurity }; 