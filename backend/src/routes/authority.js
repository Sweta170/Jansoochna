const express = require('express');
const router = express.Router();
const { Complaint, Assignment, User, Department } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

// Get complaints assigned to the authenticated authority user (or department)
router.get('/assigned', authenticate, requireRole(['authority', 'admin']), async (req, res) => {
  try {
    // simple: fetch assignments where assigned_to == user.id
    const assignments = await Assignment.findAll({ where: { assigned_to: req.user.id } });
    const complaintIds = assignments.map(a => a.complaint_id);
    const complaints = await Complaint.findAll({ where: { id: complaintIds } });
    res.json({ assignments, complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Assign complaint to department/user
router.post('/complaints/:id/assign', authenticate, requireRole(['admin', 'authority']), async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'not found' });

    const { department_id, assigned_to } = req.body;
    const assignment = await Assignment.create({ complaint_id: complaint.id, department_id, assigned_to });

    try { req.app.get('io').emit('complaint:assigned', { complaint_id: complaint.id, assignment }); } catch (e) {}

    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Change complaint status
router.patch('/complaints/:id/status', authenticate, requireRole(['authority', 'admin']), async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'not found' });

    const { status } = req.body;
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) return res.status(400).json({ error: 'invalid status' });

      complaint.status = status;
      if (status === 'resolved') complaint.resolved_at = new Date();
      else complaint.resolved_at = null;
      await complaint.save();

    try { req.app.get('io').emit('complaint:updated', complaint); } catch (e) {}

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
