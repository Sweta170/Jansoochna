const express = require('express');
const router = express.Router();
const { Complaint, Category, User, Comment, Upvote } = require('../models');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const aiQueue = require('../queue/aiQueue');
const { authenticate } = require('../middleware/auth');
const { addPoints } = require('../utils/gamification');

// List complaints with optional filters
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.reporter_id) where.reporter_id = req.query.reporter_id;
    if (req.query.category_id) where.category_id = req.query.category_id;

    const complaints = await Complaint.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: Comment, as: 'comments' }
      ],
      order: [['priority_score', 'DESC']]
    });
    console.log('GET /complaints found:', complaints.length);
    res.json(complaints);
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
      const { title, description, category_id, category } = req.body;
      let catId = category_id || null;
      if (!catId && category) {
        const [cat] = await Category.findOrCreate({ where: { name: category }, defaults: { description: '' } });
        catId = cat.id;
      }

      const complaint = await Complaint.create({
        title,
        description,
        category_id: catId,
        reporter_id: req.user.id,
        status: 'open',
        image_url: req.file ? req.file.path : null
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
        { model: Upvote, as: 'upvotes' }
      ]
    });
    if (!complaint) return res.status(404).json({ error: 'not found' });
    res.json(complaint);
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
    // (Optional: check if reporter != voter, but allowing self-vote points is also fine for engagement, 
    // let's stick to reporter != voter for fairness)
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
    // simple role check (since middleware requires authenticated user)
    // In production use requireRole middleware, here inline for simplicity matches existing patterns
    if (req.user.role !== 'admin' && req.user.role !== 'authority') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'invalid status' });

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'not found' });

    complaint.status = status;
    if (status === 'resolved') {
      complaint.resolved_at = new Date();
      // Gamification: Award 50 points to reporter for having their issue resolved
      await addPoints(complaint.reporter_id, 50);
    }

    await complaint.save();

    // Emit update
    try { req.app.get('io').emit('complaint:updated', complaint); } catch (e) { }

    // Notify reporter on status change
    const { Notification } = require('../models');
    await Notification.create({
      user_id: complaint.reporter_id,
      type: 'status_change',
      message: `Status updated to ${status}: ${complaint.title}`,
      complaint_id: complaint.id
    });
    try { req.app.get('io').emit('notification:new', { user_id: complaint.reporter_id }); } catch (e) { }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
