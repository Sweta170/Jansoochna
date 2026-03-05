const { OpenAI } = require('openai');
const aiService = require('../utils/ai_service');
const { Complaint, Category } = require('../models');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

const { mockChatbotLogic } = require('./mockChatbotService');

// In-memory session store (In production, use Redis or DB)
const sessions = {};

// ... (SYSTEM_PROMPT remains same)

async function processUserIntent(message, userId) {
    if (!sessions[userId]) {
        sessions[userId] = { state: 'idle', history: [], data: {} };
    }
    const session = sessions[userId];

    // Add user message to history
    session.history.push({ role: 'user', content: message });

    try {
        let result;
        const MOCK_MODE = process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here';

        if (MOCK_MODE) {
            console.log('--- Chatbot: Running in MOCK Mode ---');
            result = mockChatbotLogic(message, session);
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...session.history.slice(-5) // Send last 5 messages for context
                ],
                response_format: { type: "json_object" }
            });
            result = JSON.parse(response.choices[0].message.content);
        }

        // Logic based on recognized intent
        if (result.intent === 'check_status' && result.entities.complaintId) {
            const complaint = await Complaint.findByPk(result.entities.complaintId);
            if (complaint) {
                result.reply = `The status of your complaint #${complaint.id} (${complaint.title}) is currently: **${complaint.status.toUpperCase()}**. It was filed on ${new Date(complaint.created_at).toLocaleDateString()}.`;
            } else {
                result.reply = `I couldn't find a complaint with ID #${result.entities.complaintId}. Please double check the number.`;
            }
        }

        if (result.intent === 'file_complaint') {
            if (result.action === 'confirm_submission') {
                // Here we would actually trigger the creation or wait for final frontend confirmation
                // For now, let the bot confirm we have all info
            }
        }

        // Update session history with bot response
        session.history.push({ role: 'assistant', content: result.reply });

        return result;
    } catch (err) {
        console.error('Chatbot API Error:', err);
        return {
            reply: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.",
            intent: "general",
            action: "none"
        };
    }
}

function clearSession(userId) {
    delete sessions[userId];
}

module.exports = { processUserIntent, clearSession };
