const express = require('express');
const router = express.Router();
const { Category, User, Complaint } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

// Category CRUD (admin only)
router.get('/categories', authenticate, requireRole(['admin']), async (req, res) => {
  const cats = await Category.findAll();
  res.json(cats);
});

router.post('/categories', authenticate, requireRole(['admin']), async (req, res) => {
  const { name, description } = req.body;
  const c = await Category.create({ name, description });
  res.status(201).json(c);
});

router.put('/categories/:id', authenticate, requireRole(['admin']), async (req, res) => {
  const c = await Category.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  c.name = req.body.name || c.name;
  c.description = req.body.description || c.description;
  await c.save();
  res.json(c);
});

router.delete('/categories/:id', authenticate, requireRole(['admin']), async (req, res) => {
  const c = await Category.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  await c.destroy();
  res.json({ success: true });
});

// Users list (admin)
router.get('/users', authenticate, requireRole(['admin']), async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role_id'] });
  res.json(users);
});

// Metrics: counts and average resolution time
router.get('/metrics', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const total = await Complaint.count();
    const open = await Complaint.count({ where: { status: 'open' } });
    const inProgress = await Complaint.count({ where: { status: 'in_progress' } });
    const resolved = await Complaint.count({ where: { status: 'resolved' } });

    // average resolution time (in hours)
    const resolvedComplaints = await Complaint.findAll({ where: { status: 'resolved' }, attributes: ['created_at', 'resolved_at'] });
    let avgHours = null;
    if (resolvedComplaints.length > 0) {
      const totalMs = resolvedComplaints.reduce((acc, r) => {
        const created = new Date(r.created_at).getTime();
        const resolvedAt = r.resolved_at ? new Date(r.resolved_at).getTime() : created;
        return acc + Math.max(0, resolvedAt - created);
      }, 0);
      avgHours = (totalMs / resolvedComplaints.length) / (1000 * 60 * 60);
    }

    res.json({ total, open, inProgress, resolved, avgResolutionHours: avgHours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
