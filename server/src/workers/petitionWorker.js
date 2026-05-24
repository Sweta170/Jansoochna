const { petitionQueue } = require('../config/redis')
const { generatePetitionForIssue } = require('../controllers/petitionController')
const Notification = require('../models/Notification')
const Issue = require('../models/Issue')
const User = require('../models/User')

petitionQueue.process(async (job, done) => {
  try {
    const { issueId } = job.data
    console.log(`[Worker] Starting PDF generation for issue: ${issueId}`)
    
    const petitionUrl = await generatePetitionForIssue(issueId)
    
    const issue = await Issue.findById(issueId)
    
    // Notify the author that petition is ready
    if (issue && issue.author) {
      await Notification.create({
        user: issue.author,
        type: 'petition_ready',
        title: 'Petition Taiyaar Hai',
        body: `Aapki shikayat "${issue.title}" ki petition PDF taiyaar ho chuki hai.`,
        data: { issueId: issue._id, petitionUrl }
      })
      // Note: In a real distributed setup, we might need a redis adapter for socket.io to emit from a worker,
      // but for this monolithic worker setup, the user will see it in their notifications page.
    }

    console.log(`[Worker] Completed PDF for issue: ${issueId} -> ${petitionUrl}`)
    done(null, { petitionUrl })
  } catch (err) {
    console.error(`[Worker] Failed PDF generation: ${err.message}`)
    done(err)
  }
})

console.log('[Worker] Petition background worker started listening on Bull queue.')
