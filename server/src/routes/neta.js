const express = require('express')
const router = express.Router()
const netaController = require('../controllers/netaController')
const { verifyAdmin } = require('../middleware/adminAuth')

// GET /api/neta
router.get('/', netaController.getNetaByPincode)

// GET /api/neta/:id
router.get('/:id', netaController.getNetaById)

// PATCH /api/netas/:id — Admin only
router.patch('/:id', verifyAdmin, netaController.updateNeta)

module.exports = router

