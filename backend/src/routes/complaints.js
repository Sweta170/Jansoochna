const express = require('express');
const router = express.Router();
const { Complaint, Category, User, Comment, Upvote, Department } = require('../models');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const aiQueue = require('../queue/aiQueue');
const { authenticate } = require('../middleware/auth');
const { addPoints } = require('../utils/gamification');
const { sendNotification } = require('../services/notificationService');
const { sendStatusChangeEmail, sendResolutionEmail } = require('../utils/email');

const { Op } = require('sequelize');

// List complaints with optional filters
router.get('/', async (req, res) => {
  try {
    const where = {};

    // Simple filters
    if (req.query.status) where.status = req.query.status;
    if (req.query.reporter_id) where.reporter_id = req.query.reporter_id;
    if (req.query.category_id) where.category_id = req.query.category_id;
    if (req.query.department_id) where.department_id = req.query.department_id;

    // Full-text keyword search (title OR description)
    if (req.query.q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.q}%` } },
        { description: { [Op.like]: `%${req.query.q}%` } }
      ];
    }

    // Date range
    if (req.query.from || req.query.to) {
      where.created_at = {};
      if (req.query.from) where.created_at[Op.gte] = new Date(req.query.from);
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = to;
      }
    }

    // Sort
    let order = [['priority_score', 'DESC']]; // default
    if (req.query.sort === 'newest') order = [['created_at', 'DESC']];
    else if (req.query.sort === 'oldest') order = [['created_at', 'ASC']];
    else if (req.query.sort === 'priority') order = [['priority_score', 'DESC']];

    const complaints = await Complaint.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        },
        { model: Comment, as: 'comments' },
        { model: Department, as: 'department', required: false }
      ],
      order
    });

    // Post-process to hide anonymous reporters
    const safeComplaints = complaints.map(c => {
      const data = c.toJSON();
      if (data.is_anonymous) {
        data.reporter = { id: 0, name: 'Anonymous', email: 'hidden' };
      }
      return data;
    });

    res.json(safeComplaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


// Create complaint (authenticated)
router.post('/', authenticate, upload.single('image'),
  body('title').notEmpty().withMessage('title required'),
  body('description').isLength({ min: 10 }).withMessage('description too short'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { title, description, category_id, category, is_anonymous } = req.body;
      let catId = category_id || null;
      if (!catId && category) {
        const [cat] = await Category.findOrCreate({ where: { name: category }, defaults: { description: '' } });
        catId = cat.id;
      }

      // Default SLA: 3 days from now
      const sla_deadline = new Date();
      sla_deadline.setDate(sla_deadline.getDate() + 3);

      const complaint = await Complaint.create({
        title,
        description,
        category_id: catId,
        reporter_id: req.user.id,
        status: 'open',
        image_url: req.file ? req.file.path : null,
        is_anonymous: is_anonymous === 'true' || is_anonymous === true,
        sla_deadline,
        status_changed_at: new Date(),
        timeline: JSON.stringify([{
          stage: 'Submitted',
          updatedAt: new Date(),
          updatedBy: req.user.id
        }])
      });

      // Gamification: Award 10 points for reporting
      await addPoints(req.user.id, 10);

      // enqueue AI job for categorization/summarization/priority scoring
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 100)); // 100ms timeout
        await Promise.race([
          aiQueue.add('processComplaint', { complaintId: complaint.id }),
          timeout
        ]);
      } catch (e) { console.error('Failed to enqueue AI job (Redis likely down)', e.message); }

      // Emit via Socket.IO if available
      try { req.app.get('io').emit('complaint:created', complaint); } catch (e) { }

      res.status(201).json(complaint);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  });

// Get complaint details
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: Comment, as: 'comments' },
        { model: Upvote, as: 'upvotes' },
        { model: Department, as: 'department' }
      ]
    });
    if (!complaint) return res.status(404).json({ error: 'not found' });

    const data = complaint.toJSON();
    if (data.is_anonymous) {
      data.reporter = { id: 0, name: 'Anonymous', email: 'hidden' };
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticate,
  body('body').notEmpty().withMessage('body required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const complaint = await Complaint.findByPk(req.params.id);
      if (!complaint) return res.status(404).json({ error: 'not found' });

      const comment = await Comment.create({ complaint_id: complaint.id, author_id: req.user.id, body: req.body.body });

      try { req.app.get('io').to(`complaint:${complaint.id}`).emit('comment:new', comment); } catch (e) { }

      // Notify reporter if comment is from someone else
      if (complaint.reporter_id !== req.user.id) {
        const { Notification } = require('../models');
        await Notification.create({
          user_id: complaint.reporter_id,
          type: 'new_comment',
          message: `New comment on: ${complaint.title}`,
          complaint_id: complaint.id
        });
        try { req.app.get('io').emit('notification:new', { user_id: complaint.reporter_id }); } catch (e) { }

        // Push Notification
        try {
          const reporter = await User.findByPk(complaint.reporter_id);
          if (reporter && reporter.expo_push_token) {
            await sendNotification(
              reporter.expo_push_token,
              'New Comment',
              `Someone commented on your report: "${complaint.title}"`,
              { complaintId: complaint.id }
            );
          }
        } catch (e) { console.error('Push Error:', e); }
      }

      res.status(201).json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  });

// Upvote (creates unique upvote)
router.post('/:id/upvote', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'not found' });

    const existing = await Upvote.findOne({ where: { complaint_id: complaint.id, user_id: req.user.id } });
    if (existing) return res.status(409).json({ error: 'already upvoted' });

    const upvote = await Upvote.create({ complaint_id: complaint.id, user_id: req.user.id });

    // Gamification: Award 1 point to reporter for receiving an upvote
    if (complaint.reporter_id !== req.user.id) {
      await addPoints(complaint.reporter_id, 1);
    }

    try { req.app.get('io').to(`complaint:${complaint.id}`).emit('upvote:changed', { complaint_id: complaint.id }); } catch (e) { }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update status (admin/authority only)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'authority') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'invalid status' });

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'not found' });

    complaint.status = status;

    // Update timeline
    const timeline = JSON.parse(complaint.timeline || '[]');
    const stageMap = {
      'open': 'Submitted',
      'in_progress': 'Assigned',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    timeline.push({
      stage: stageMap[status] || status,
      updatedAt: new Date(),
      updatedBy: req.user.id
    });
    complaint.timeline = JSON.stringify(timeline);

    if (status === 'resolved') {
      complaint.resolved_at = new Date();
      await addPoints(complaint.reporter_id, 50);
    }

    await complaint.save();

    // Emit update
    try { req.app.get('io').emit('complaint:updated', complaint); } catch (e) { }

    const { Notification } = require('../models');
    const reporter = await User.findByPk(complaint.reporter_id, { attributes: ['id', 'name', 'email'] });

    await Notification.create({
      user_id: complaint.reporter_id,
      type: 'status_change',
      message: `Status updated to ${status}: ${complaint.title}`,
      complaint_id: complaint.id
    });
    try { req.app.get('io').emit('notification:new', { user_id: complaint.reporter_id }); } catch (e) { }

    // Push Notification
    try {
      if (reporter && reporter.expo_push_token) {
        await sendNotification(
          reporter.expo_push_token,
          'Status Updated',
          `Your report "${complaint.title}" status is now ${status}.`,
          { complaintId: complaint.id }
        );
      }
    } catch (e) { console.error('Push Error:', e); }

    // Send email
    if (reporter) {
      if (status === 'resolved') {
        sendResolutionEmail({ to: reporter.email, reporterName: reporter.name, complaintTitle: complaint.title, complaintId: complaint.id });
      } else {
        sendStatusChangeEmail({ to: reporter.email, reporterName: reporter.name, complaintTitle: complaint.title, complaintId: complaint.id, newStatus: status });
      }
    }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Verify a resolved complaint
router.post('/:id/verify', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.status !== 'resolved') return res.status(400).json({ error: 'Only resolved complaints can be verified' });

    if (complaint.reporter_id === req.user.id) return res.status(400).json({ error: 'You cannot verify your own complaint' });

    let verifiedBy = JSON.parse(complaint.verified_by || '[]');
    if (verifiedBy.includes(req.user.id)) return res.status(409).json({ error: 'Already verified' });

    verifiedBy.push(req.user.id);
    complaint.verified_by = JSON.stringify(verifiedBy);
    complaint.verification_count = verifiedBy.length;

    await complaint.save();

    await addPoints(req.user.id, 5);
    try { req.app.get('io').emit('complaint:updated', complaint); } catch (e) { }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Rate a resolved complaint
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) required' });
    }

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    // Only original reporter can rate
    if (complaint.reporter_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the reporter can rate this resolution' });
    }

    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return res.status(400).json({ error: 'Complaint must be resolved to be rated' });
    }

    if (complaint.rating) {
      return res.status(409).json({ error: 'Complaint already rated' });
    }

    await complaint.update({
      rating,
      feedback,
      rated_at: new Date()
    });

    res.json({ success: true, rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
