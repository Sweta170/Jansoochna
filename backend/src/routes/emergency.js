const express = require('express');
const router = express.Router();
const { EmergencyLog } = require('../models');
const { authenticate } = require('../middleware/auth');

// Log an emergency SOS event
router.post('/log', authenticate, async (req, res) => {
    try {
        const { type, latitude, longitude } = req.body;

        const log = await EmergencyLog.create({
            user_id: req.user.id,
            type,
            latitude,
            longitude
        });

        // Broadcast to relevant admin/officials via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('emergency:sos', {
                id: log.id,
                user_id: req.user.id,
                type,
                location: { lat: latitude, lng: longitude },
                timestamp: log.timestamp
            });
        }

        res.status(201).json(log);
    } catch (err) {
        console.error('Emergency log error:', err);
        res.status(500).json({ error: 'Failed to log emergency event' });
    }
});

module.exports = router;
