const express = require('express')
const router = express.Router()
const adminAuthController = require('../controllers/adminAuthController')
const { verifyAdmin, requireRole } = require('../middleware/adminAuth')

router.post('/login', adminAuthController.login)
router.post('/refresh', adminAuthController.refresh)
router.post('/logout', adminAuthController.logout)

// Only superadmins can create new admins via the UI API
router.post('/create-admin', verifyAdmin, requireRole(['superadmin']), adminAuthController.createAdmin)
router.get('/list', verifyAdmin, requireRole(['superadmin']), adminAuthController.getAdmins)
router.patch('/:id/toggle-status', verifyAdmin, requireRole(['superadmin']), adminAuthController.toggleAdminStatus)

module.exports = router
