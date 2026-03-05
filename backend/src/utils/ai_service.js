const natural = require('natural');
const Sentiment = require('sentiment');
const levenshtein = require('fast-levenshtein');
const models = require('../models/index');

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
        // We enhance score based on presence of urgent keywords
        const urgentKeywords = ['danger', 'accident', 'fire', 'emergency', 'help', 'bloody', 'collapse', 'deadly'];
        let keywordBoost = 0;
        const lowText = text.toLowerCase();
        urgentKeywords.forEach(k => {
            if (lowText.includes(k)) keywordBoost -= 3;
        });

        const finalScore = result.score + keywordBoost;
        let urgency = 'normal';
        if (finalScore < -2) urgency = 'high';
        if (finalScore < -6) urgency = 'critical';
        return { score: finalScore, urgency, tokens: result.tokens };
    },

    checkDuplicates: async (title, lat, lng) => {
        const { Complaint } = require('../models');
        const { Op } = require('sequelize');

        // Fetch recent complaints within 1km and 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentComplaints = await Complaint.findAll({
            where: {
                status: ['open', 'in_progress'],
                created_at: { [Op.gte]: sevenDaysAgo }
            },
            limit: 100
        });

        for (const c of recentComplaints) {
            // 1. Precise Text Similarity
            const distance = levenshtein.get(title.toLowerCase(), c.title.toLowerCase());
            const similarity = 1 - (distance / Math.max(title.length, c.title.length));

            // 2. Geospatial Proximity (Approx 500m)
            let isGeoMatch = false;
            if (lat && lng && c.latitude && c.longitude) {
                const geoDist = Math.sqrt(Math.pow(lat - c.latitude, 2) + Math.pow(lng - c.longitude, 2));
                if (geoDist < 0.005) isGeoMatch = true;
            }

            // High similarity OR (Moderate similarity AND geo match)
            if (similarity > 0.85 || (similarity > 0.6 && isGeoMatch)) {
                return {
                    isDuplicate: true,
                    originalId: c.id,
                    similarityScore: Math.round(similarity * 100),
                    isGeoMatch
                };
            }
        }
        return { isDuplicate: false };
    }
};

module.exports = aiService;
