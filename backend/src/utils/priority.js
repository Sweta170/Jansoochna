const aiService = require('./ai_service');

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

module.exports = { computePriority };
