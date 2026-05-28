const Queue = require('bull')

let petitionQueue
const redisUrl = process.env.REDIS_URL

if (redisUrl) {
  petitionQueue = new Queue('petition-generation', redisUrl)
  
  petitionQueue.on('error', (err) => {
    console.warn('⚠️ [Bull Queue Error] Redis connection failed. Background worker features may not execute:', err.message)
  })
} else {
  console.log('ℹ️ [Bull Queue] REDIS_URL not configured. Running mock queue with in-process task execution.')
  petitionQueue = {
    add: async (data) => {
      console.log('[Mock Queue] Running petition generation task immediately in-process...')
      try {
        const { generatePetitionForIssue } = require('../controllers/petitionController')
        const Issue = require('../models/Issue')
        const Notification = require('../models/Notification')
        
        const { issueId } = data
        const petitionUrl = await generatePetitionForIssue(issueId)
        
        const issue = await Issue.findById(issueId)
        if (issue && issue.author) {
          await Notification.create({
            user: issue.author,
            type: 'petition_ready',
            title: 'Petition Taiyaar Hai',
            body: `Aapki shikayat "${issue.title}" ki petition PDF taiyaar ho chuki hai.`,
            data: { issueId: issue._id, petitionUrl }
          })
        }
      } catch (err) {
        console.error('[Mock Queue] Failed to generate petition:', err.message)
      }
      return { id: 'mock-job-id' }
    },
    process: (fn) => {
      console.log('[Mock Queue] Worker registered process handler (skipped in mock mode)')
    },
    on: (event, handler) => {}
  }
}

module.exports = { petitionQueue }
