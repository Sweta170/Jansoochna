const aiQueue = require('../queue/aiQueue');
const models = require('../models');

function simpleSummary(text, maxWords = 30) {
  if (!text) return '';
  return text.split(' ').slice(0, maxWords).join(' ');
}

const aiService = require('../utils/ai_service');

function computePriority(text, upvotes) {
  const { score: sentimentScore } = aiService.analyzeSentiment(text);

  const keywords = ['urgent', 'danger', 'accident', 'fire', 'collapse', 'flood', 'injury', 'critical'];
  const t = (text || '').toLowerCase();
  let score = 0;
  for (const k of keywords) {
    const count = t.split(k).length - 1;
    if (count > 0) score += count * 2;
  }

  // Add sentiment impact: Negative sentiment (urgency) increases priority
  if (sentimentScore < 0) {
    score += Math.abs(sentimentScore);
  }

  score += (upvotes || 0);
  return score;
}

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
      const priority = computePriority(text, upvoteCount);

      // Save AI summary
      await models.AISummary.create({ complaint_id: complaint.id, summary, model_version: 'mock-v1' });

      // Update complaint priority score
      complaint.priority_score = priority;
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
