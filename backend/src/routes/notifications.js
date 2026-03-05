const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

// Get notifications for logged in user
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

// Mark as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });
        if (!notification) return res.status(404).json({ error: 'not found' });

        notification.is_read = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const count = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'server error' });
    }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
