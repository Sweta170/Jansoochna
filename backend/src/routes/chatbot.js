const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const chatbotService = require('../services/chatbotService');

// POST /api/chatbot/message - Process chatbot message
router.post('/message', authenticate, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const result = await chatbotService.processUserIntent(message, userId);
        res.json(result);
    } catch (err) {
        console.error('Chatbot Route Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/chatbot/session - Clear chatbot session
router.delete('/session', authenticate, (req, res) => {
    chatbotService.clearSession(req.user.id);
    res.json({ status: 'cleared' });
});

module.exports = router;
