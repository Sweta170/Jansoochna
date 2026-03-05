const express = require('express');
const router = express.Router();
const { Category, User, Complaint, Notification, Role, Department } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendAssignmentEmail } = require('../utils/email');
const bcrypt = require('bcrypt');

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

// Get all Departments
router.get('/departments', authenticate, requireRole(['admin', 'official', 'authority']), async (req, res) => {
  const depts = await Department.findAll();
  res.json(depts);
});

// Create Department
router.post('/departments', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const existing = await Department.findOne({ where: { name } });
    if (existing) return res.status(409).json({ error: 'department already exists' });

    const dept = await Department.create({ name, description });
    res.status(201).json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Assign Complaint to Department
router.put('/complaints/:id/assign', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { department_id } = req.body;
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }]
    });
    if (!complaint) return res.status(404).json({ error: 'not found' });

    complaint.department_id = department_id || null;
    await complaint.save();

    // Emit socket
    try { req.app.get('io').emit('complaint:updated', complaint); } catch (e) { }

    // In-app notification + email for the reporter
    if (department_id && complaint.reporter) {
      const dept = await Department.findByPk(department_id);
      await Notification.create({
        user_id: complaint.reporter_id,
        type: 'status_change',
        message: `Your complaint "${complaint.title}" has been assigned to ${dept ? dept.name : 'a department'}.`,
        complaint_id: complaint.id
      });
      try { req.app.get('io').emit('notification:new', { user_id: complaint.reporter_id }); } catch (e) { }
      sendAssignmentEmail({
        to: complaint.reporter.email,
        reporterName: complaint.reporter.name,
        complaintTitle: complaint.title,
        complaintId: complaint.id,
        departmentName: dept ? dept.name : 'a department'
      });
    }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Assign User to Department (Make Official)
router.put('/users/:id/assign-department', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { department_id, role } = req.body; // Expect role='official' usually
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'not found' });

    if (department_id) user.department_id = department_id;

    // Update role if provided
    if (role) {
      const r = await Role.findOne({ where: { name: role } });
      if (r) user.role_id = r.id;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Create Official (Register + Assign Department)
router.post('/create-official', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const officialRole = await Role.findOne({ where: { name: 'official' } });

    const user = await User.create({
      name,
      email,
      password_hash: hash,
      role_id: officialRole ? officialRole.id : null,
      department_id: department_id || null
    });

    res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get all Officials/Admins
router.get('/officials', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const officials = await User.findAll({
      attributes: ['id', 'name', 'email', 'status', 'points', 'rank', 'department_id', 'role_id'],
      include: [
        { model: Role, as: 'role', where: { name: ['official', 'admin'] } },
        { model: Department, as: 'department' }
      ]
    });
    res.json(officials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Batch Update Complaints (admin/official)
router.post('/complaints/batch-update', authenticate, requireRole(['admin', 'official']), async (req, res) => {
  try {
    const { ids, updates } = req.body; // ids: [1, 2, 3], updates: { status: 'resolved', department_id: 4 }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required' });
    }

    const { status, department_id } = updates || {};
    const updateData = {};
    if (status) updateData.status = status;
    if (department_id) updateData.department_id = department_id;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'no valid updates provided' });
    }

    await Complaint.update(updateData, { where: { id: ids } });

    // Emit socket for all updated complaints
    try {
      const io = req.app.get('io');
      ids.forEach(id => io.emit('complaint:updated', { id, ...updateData }));
    } catch (e) { }

    res.json({ success: true, count: ids.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
