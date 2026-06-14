// Server configuration
export const config = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || 'development',
  
  // CORS origins - adjust for production
  corsOrigins: [
    'http://localhost:5173',      // Frontend dev
    'http://localhost:3000',      // Fallback dev port
    // Add production URLs here when deploying
    // 'https://your-frontend-domain.com'
  ],
  
  // Database
  mongoUri: process.env.MONGO_URI,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d',
  
  // Validation rules
  validation: {
    minPasswordLength: 6,
    minNameLength: 2,
    minTitleLength: 3,
    minDescriptionLength: 10,
  },
};

export const getOriginForCors = () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    return {
      origin: config.corsOrigins,
      credentials: true,
    };
  }
  // Development: allow all origins
  return {
    origin: true,
    credentials: true,
  };
};
