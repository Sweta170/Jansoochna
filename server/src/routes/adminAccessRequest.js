const express = require('express')
const router = express.Router()
const controller = require('../controllers/adminAccessRequestController')
const { verifyAdmin, requireRole } = require('../middleware/adminAuth')
const { generalLimiter } = require('../middleware/rateLimit')

// POST /api/admin/request-access (Public)
router.post(
  '/request-access',
  generalLimiter,
  controller.requestAccess
)

// All routes below require Admin Auth & Superadmin Role
router.use(verifyAdmin)
router.use(requireRole(['superadmin']))

// GET /api/admin/access-requests
router.get('/access-requests', controller.getAccessRequests)

// PATCH /api/admin/access-requests/:id/approve
router.patch('/access-requests/:id/approve', controller.approveAccessRequest)

// PATCH /api/admin/access-requests/:id/reject
router.patch('/access-requests/:id/reject', controller.rejectAccessRequest)

module.exports = router
