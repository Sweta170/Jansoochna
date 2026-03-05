const { Complaint, AISummary, Upvote, sequelize } = require('../models');
const aiService = require('../utils/ai_service');
const { computePriority } = require('../utils/priority');

async function processComplaints() {
    console.log('[AI STANDALONE WORKER] Starting deep analysis loop...');

    while (true) {
        try {
            // Find complaints that don't have an AI summary yet
            const pendingComplaints = await Complaint.findAll({
                include: [{
                    model: AISummary,
                    as: 'ai_summary',
                    required: false
                }],
                where: {
                    '$ai_summary.id$': null
                },
                limit: 5
            });

            if (pendingComplaints.length === 0) {
                // Wait 10 seconds before polling again
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }

            for (const complaint of pendingComplaints) {
                console.log(`[AI WORKER] Processing Complaint #${complaint.id}: ${complaint.title}`);

                const text = `${complaint.title} ${complaint.description}`;
                const upvoteCount = await Upvote.count({ where: { complaint_id: complaint.id } });

                // 1. Text Summary
                const summary = text.substring(0, 100) + '...';

                // 2. Duplicate Detection
                const dupCheck = await aiService.checkDuplicates(complaint.title, complaint.latitude, complaint.longitude);
                if (dupCheck.isDuplicate && dupCheck.originalId !== complaint.id) {
                    complaint.is_duplicate = true;
                    complaint.parent_complaint_id = dupCheck.originalId;
                }

                // 3. Sentiment & Priority
                const sentiment = aiService.analyzeSentiment(text);
                const basePriority = computePriority(text, upvoteCount);

                // 4. Save Insights
                await AISummary.create({
                    complaint_id: complaint.id,
                    summary,
                    model_version: 'enterprise-v1',
                    sentiment_score: sentiment.score
                });

                complaint.priority_score = basePriority + (sentiment.score < 0 ? Math.abs(sentiment.score) : 0);
                await complaint.save();

                console.log(`[AI WORKER] Finished #${complaint.id}. Priority: ${complaint.priority_score}`);
            }
        } catch (err) {
            console.error('[AI WORKER] Error:', err);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Start processing
processComplaints();
