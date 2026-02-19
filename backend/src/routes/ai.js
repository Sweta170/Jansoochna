const express = require('express');
const router = express.Router();
const aiService = require('../utils/ai_service');

// POST /api/ai/predict - Predict category from text
router.post('/predict', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const category = aiService.predictCategory(text);
        const sentiment = aiService.analyzeSentiment(text);

        res.json({ category, sentiment });
    } catch (err) {
        console.error('AI Predict Error:', err);
        res.status(500).json({ error: 'Failed to process AI prediction' });
    }
});

// POST /api/ai/duplicates - Check for duplicate complaints
router.post('/duplicates', async (req, res) => {
    try {
        const { title, latitude, longitude } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const duplicates = await aiService.checkDuplicates(title, latitude, longitude);
        res.json({ duplicates });
    } catch (err) {
        console.error('AI Duplicate Error:', err);
        res.status(500).json({ error: 'Failed to check duplicates' });
    }
});

module.exports = router;
