const express = require('express');
const router = express.Router();
const { Complaint, User, Category } = require('../../models');
const { predictCategory } = require('../../utils/ai_service');
const { Complaint: ComplaintModel } = require('../../models');

/**
 * Webhook for Twilio WhatsApp
 * Expected Body (Twilio Format):
 * {
 *   Body: "Text description of the issue",
 *   From: "whatsapp:+123456789",
 *   Latitude: "123.456", (Optional if location sent)
 *   Longitude: "45.678"  (Optional)
 * }
 */
router.post('/webhook', async (req, res) => {
    try {
        const { Body, From, Latitude, Longitude } = req.body;

        // 1. Find or Create User by Phone
        // For FYP, we'll map phone to an "External Citizen" placeholder if not found
        let user = await User.findOne({ where: { email: `${From}@whatsapp.com` } });
        if (!user) {
            user = await User.create({
                name: `WA User (${From.slice(-4)})`,
                email: `${From}@whatsapp.com`,
                password_hash: 'whatsapp_auth_external',
                role_id: 3 // Citizen
            });
        }

        // 2. Use AI to predict category from the message body
        let predictedCategoryId = null;
        try {
            const predictions = await predictCategory(Body);
            if (predictions && predictions.length > 0) {
                const cat = await Category.findOne({ where: { name: predictions[0].label } });
                if (cat) predictedCategoryId = cat.id;
            }
        } catch (e) { console.error('WA AI Predict fail', e); }

        // 3. Create Complaint
        const complaint = await Complaint.create({
            title: Body.substring(0, 100),
            description: Body,
            reporter_id: user.id,
            latitude: Latitude || 0,
            longitude: Longitude || 0,
            category_id: predictedCategoryId,
            status: 'open'
        });

        // 4. Respond with Twilio TwiML (optional)
        res.type('text/xml');
        res.send(`<Response><Message>Thank you for reporting! Your case ID is #${complaint.id}. You can track it on the JanSoochna app.</Message></Response>`);

        // Emit socket event if active
        try { req.app.get('io').emit('complaint:created', complaint); } catch (e) { }

    } catch (err) {
        console.error('WhatsApp Webhook Error:', err);
        res.status(500).send('Error processing message');
    }
});

module.exports = router;
