const aiQueue = require('../queue/aiQueue');
const models = require('../models');

function simpleSummary(text, maxWords = 30) {
  if (!text) return '';
  return text.split(' ').slice(0, maxWords).join(' ');
}

const aiService = require('../utils/ai_service');

const { computePriority } = require('../utils/priority');

function startAIWorker(io) {
  aiQueue.process('processComplaint', async (job, done) => {
    try {
      const { complaintId } = job.data;
      const complaint = await models.Complaint.findByPk(complaintId);
      if (!complaint) return done(new Error('complaint not found'));

      // Build text for processing
      const text = `${complaint.title || ''} ${complaint.description || ''}`;

      // Count upvotes
      const upvoteCount = await models.Upvote.count({ where: { complaint_id: complaint.id } });

      const summary = simpleSummary(text, 40);

      // Duplicate Detection
      const dupCheck = await aiService.checkDuplicates(complaint.title, complaint.latitude, complaint.longitude);
      if (dupCheck.isDuplicate && dupCheck.originalId !== complaint.id) {
        complaint.is_duplicate = true;
        complaint.parent_complaint_id = dupCheck.originalId;
        console.log(`[AI WORKER] Flagged #${complaint.id} as duplicate of #${dupCheck.originalId}`);
      }

      // Sentiment & Priority
      const sentiment = aiService.analyzeSentiment(text);
      const priority = computePriority(text, upvoteCount);

      // Save AI summary
      await models.AISummary.create({
        complaint_id: complaint.id,
        summary,
        model_version: 'smart-v1',
        sentiment_score: sentiment.score
      });

      // Update complaint details
      complaint.priority_score = priority + (sentiment.score < 0 ? Math.abs(sentiment.score) : 0);
      await complaint.save();

      // Emit event
      try { io.emit('ai:summary_ready', { complaint_id: complaint.id, summary, priority_score: priority }); } catch (e) { }

      done();
    } catch (err) {
      console.error('AI worker error', err);
      done(err);
    }
  });
  console.log('AI worker started');
}

module.exports = startAIWorker;
