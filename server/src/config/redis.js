const Queue = require('bull')

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const petitionQueue = new Queue('petition-generation', redisUrl)

// Add error listener to prevent the Node process from crashing when Redis is not available
petitionQueue.on('error', (err) => {
  console.warn('⚠️ [Bull Queue Error] Redis connection failed. Background worker features may not execute:', err.message)
})

module.exports = { petitionQueue }
