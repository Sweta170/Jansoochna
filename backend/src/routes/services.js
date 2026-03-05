const express = require('express');
const router = express.Router();
const { ServiceApplication, User } = require('../models');
const { authenticate } = require('../middleware/auth');

// Apply for a service (Authenticated)
router.post('/apply', authenticate, async (req, res) => {
    try {
        const { serviceType, formData } = req.body;
        if (!serviceType) {
            return res.status(400).json({ error: 'Service type is required' });
        }

        const application = await ServiceApplication.create({
            user_id: req.user.id,
            service_type: serviceType,
            form_data: JSON.stringify(formData || {}),
            status: 'pending'
        });

        res.status(201).json(application);
    } catch (err) {
        console.error('Service application error:', err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Get user's application history
router.get('/user/me', authenticate, async (req, res) => {
    try {
        const applications = await ServiceApplication.findAll({
            where: { user_id: req.user.id },
            order: [['submitted_at', 'DESC']]
        });

        // Parse JSON strings back to objects
        const formatted = applications.map(app => ({
            ...app.toJSON(),
            form_data: JSON.parse(app.form_data)
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Admin/Official: Process application
router.put('/:id/process', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'official') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { status } = req.body;
        const application = await ServiceApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        await application.update({
            status,
            processed_at: new Date()
        });

        res.json(application);
    } catch (err) {
        res.status(500).json({ error: 'Failed to process application' });
    }
});

module.exports = router;
