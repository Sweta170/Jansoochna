const Queue = require('bull')

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const petitionQueue = new Queue('petition-generation', redisUrl)

module.exports = { petitionQueue }
