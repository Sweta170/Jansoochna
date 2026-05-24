const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const formGuideController = require('../controllers/formGuideController')

// GET /api/form-guide
router.get('/', formGuideController.getFormGuides)

// GET /api/form-guide/search
router.get('/search', formGuideController.searchFormGuides)

// GET /api/form-guide/:id
router.get('/:id', formGuideController.getFormGuideById)

// POST /api/form-guide/flag
router.post('/flag', authMiddleware, formGuideController.flagCorrection)

module.exports = router
