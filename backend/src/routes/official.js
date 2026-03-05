const express = require('express');
const router = express.Router();
const { Complaint, Category, User, Department, Comment, Upvote } = require('../models');
const { authenticate, requireOfficial } = require('../middleware/auth');
const { addPoints } = require('../utils/gamification');
const { sendNotification } = require('../services/notificationService');
const upload = require('../middleware/upload');

// Middleware to ensure user is an Official
// ... (requireOfficial remains same)

// Get complaints assigned to my department
// ...

// Update status of a complaint (Official only)
router.put('/complaints/:id/status', authenticate, requireOfficial, upload.single('resolution_image'), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['open', 'in_progress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'invalid status' });
        }

        const complaint = await Complaint.findOne({
            where: { id: req.params.id, department_id: req.user.department_id }
        });

        if (!complaint) return res.status(404).json({ error: 'not found or not assigned to your department' });

        complaint.status = status;
        complaint.status_changed_at = new Date();
        if (status === 'resolved') {
            complaint.resolved_at = new Date();
            if (req.file) {
                complaint.resolution_image_url = req.file.path;
            }
            // Award points to reporter
            await addPoints(complaint.reporter_id, 50);
        }

        await complaint.save();

        // Emit socket event
        try { req.app.get('io').emit('complaint:updated', complaint); } catch (e) { }

        // Notify reporter (Database & Socket)
        const { Notification } = require('../models');
        await Notification.create({
            user_id: complaint.reporter_id,
            type: 'status_change',
            message: `Your complaint is now ${status}: ${complaint.title}`,
            complaint_id: complaint.id
        });

        try { req.app.get('io').emit('notification:new', { user_id: complaint.reporter_id }); } catch (e) { }

        // Send Real-Time Push Notification
        try {
            const reporter = await User.findByPk(complaint.reporter_id);
            if (reporter && reporter.expo_push_token) {
                await sendNotification(
                    reporter.expo_push_token,
                    'Complaint Update',
                    `Your complaint "${complaint.title}" is now ${status.replace('_', ' ')}.`,
                    { complaintId: complaint.id }
                );
            }
        } catch (pushErr) {
            console.error('Push Notification Error:', pushErr);
        }

        res.json(complaint);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
