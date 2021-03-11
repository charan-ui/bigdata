const redis = require('redis');
const logger = require('../utils/logger');

// Create redis client
const client = redis.createClient();

// Function sets up redis connection
const connectRedis = () => {
  // Connect client to Redis
  client.on('connect', () => logger.info(`Connected to Redis...`));
}

module.exports = {
  client,
  connectRedis,
};
