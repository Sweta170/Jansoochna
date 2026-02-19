const Queue = require('bull');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

const aiQueue = new Queue('ai', { redis: { host: redisHost, port: redisPort } });

module.exports = aiQueue;
