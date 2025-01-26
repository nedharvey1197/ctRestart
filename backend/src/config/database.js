const mongoose = require('mongoose');
const Redis = require('ioredis');
const neo4j = require('neo4j-driver');
const logger = require('../utils/logger');

// MongoDB Configuration
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    logger.info('MongoDB connected');
    await mongoose.connection.db.admin().ping();
    logger.info('MongoDB ping successful');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

// Redis Configuration
const connectRedis = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redis.on('connect', () => logger.info('Redis connected'));
  redis.on('error', (error) => logger.error('Redis error:', error));

  return redis;
};

// Neo4j Configuration
const connectNeo4j = () => {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER || 'neo4j',
      process.env.NEO4J_PASSWORD || 'password'
    )
  );

  return driver;
};

module.exports = {
  connectMongo,
  connectRedis,
  connectNeo4j
}; 