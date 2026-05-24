const express = require('express')
const router = express.Router()
const netaController = require('../controllers/netaController')

// GET /api/neta
router.get('/', netaController.getNetaByPincode)

// GET /api/neta/:id
router.get('/:id', netaController.getNetaById)

module.exports = router
