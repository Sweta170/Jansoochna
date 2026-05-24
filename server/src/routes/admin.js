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

module.exports = router
