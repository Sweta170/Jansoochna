const natural = require('natural');
const Sentiment = require('sentiment');
const levenshtein = require('fast-levenshtein');
const models = require('../models');

const sentiment = new Sentiment();
const classifier = new natural.BayesClassifier();

// Train the classifier with seed data
// In a real app, this would load from a JSON file or DB
function trainClassifier() {
    classifier.addDocument('pothole on the road', 'Roads');
    classifier.addDocument('road is broken', 'Roads');
    classifier.addDocument('street light not working', 'Electricity');
    classifier.addDocument('power outage in my area', 'Electricity');
    classifier.addDocument('water pipe leaking', 'Water');
    classifier.addDocument('no water supply', 'Water');
    classifier.addDocument('garbage not collected', 'Waste');
    classifier.addDocument('trash overflow', 'Waste');
    classifier.train();
}

trainClassifier();

const aiService = {
    predictCategory: (text) => {
        return classifier.classify(text);
    },

    analyzeSentiment: (text) => {
        const result = sentiment.analyze(text);
        // Score < 0 means negative (urgent/angry), > 0 positive
        // We enhance priority if score is very negative
        let urgency = 'normal';
        if (result.score < -2) urgency = 'high';
        if (result.score < -5) urgency = 'critical';
        return { score: result.score, urgency };
    },

    checkDuplicates: async (title, lat, lng) => {
        // 1. Text Similarity (Levenshtein)
        // Fetch recent open complaints
        const recentComplaints = await models.Complaint.findAll({
            where: { status: ['open', 'in_progress'] },
            limit: 50,
            order: [['created_at', 'DESC']]
        });

        const duplicates = [];

        for (const c of recentComplaints) {
            const distance = levenshtein.get(title.toLowerCase(), c.title.toLowerCase());
            const similarity = 1 - (distance / Math.max(title.length, c.title.length));

            let isGeoMatch = false;
            if (lat && lng && c.latitude && c.longitude) {
                // Simple Euclidean distance for MVP (approx 0.001 deg ~ 111m)
                const geoDist = Math.sqrt(Math.pow(lat - c.latitude, 2) + Math.pow(lng - c.longitude, 2));
                if (geoDist < 0.001) isGeoMatch = true;
            }

            // If text is > 80% similar OR (> 50% similar AND close location)
            if (similarity > 0.8 || (similarity > 0.5 && isGeoMatch)) {
                duplicates.push({
                    id: c.id,
                    title: c.title,
                    similarity: Math.round(similarity * 100),
                    isGeoMatch
                });
            }
        }
        return duplicates;
    }
};

module.exports = aiService;
