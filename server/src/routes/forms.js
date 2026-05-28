const express = require('express')
const router = express.Router()
const formController = require('../controllers/formController')
const { verifyAdmin } = require('../middleware/adminAuth')

// GET /api/forms - list all (supports optional ?state= and ?category= filters)
router.get('/', formController.getForms)

// GET /api/forms/:slug - get single form details
router.get('/:slug', formController.getFormBySlug)

// POST /api/forms - admin: add new form
router.post('/', verifyAdmin, formController.addForm)

// PATCH /api/forms/:slug - admin: update a form
router.patch('/:slug', verifyAdmin, formController.updateForm)

module.exports = router
