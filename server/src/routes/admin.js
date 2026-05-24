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
router.patch('/posts/:id/hide', adminController.hidePost)

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

module.exports = router
