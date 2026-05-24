const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { verifyAdmin, requireRole } = require('../middleware/adminAuth')

// All routes here require admin auth
router.use(verifyAdmin)

// Issues
router.get('/issues', adminController.getIssues)
router.patch('/issues/:id/status', adminController.updateIssueStatus)
router.patch('/issues/:id/priority', adminController.updateIssuePriority)
router.patch('/issues/:id/assign', adminController.assignIssue)
router.delete('/issues/:id', requireRole(['superadmin']), adminController.deleteIssue)

// Posts
router.get('/posts/reported', adminController.getReportedPosts)
router.get('/posts', adminController.getAllPosts)
router.patch('/posts/:id/hide', adminController.hidePost)
router.delete('/posts/:id', adminController.deletePost)

// Users
router.get('/users', adminController.getUsers)
router.patch('/users/:id/block', adminController.blockUser)

// PATCH /api/admin/users/:id/unlock — superadmin only
router.patch('/users/:id/unlock', requireRole(['superadmin']), async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          otpAttempts:    0,
          otpLockedUntil: null,
          otpLockCount:   0,
          otp:            undefined,
          otpExpiry:      undefined,
        }
      },
      { new: true }
    ).select('name email otpLockCount')

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({
      message: `Account unlocked for ${user.name}`,
      user,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/admin/users/:id/notify — Send notification to citizen
router.post('/users/:id/notify', async (req, res) => {
  try {
    const { title, body } = req.body
    if (!body) return res.status(400).json({ message: 'Notification body is required' })

    const Notification = require('../models/Notification')
    const notification = await Notification.create({
      user: req.params.id,
      type: 'admin_broadcast',
      title: title || 'Admin Sandesh',
      body,
      data: { sentBy: req.admin._id }
    })

    if (req.io) {
      req.io.to(req.params.id).emit('notification', {
        type: 'admin_broadcast',
        title: title || 'Admin Sandesh',
        body,
      })
    }

    res.json({ message: 'Notification sent successfully', notification })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
