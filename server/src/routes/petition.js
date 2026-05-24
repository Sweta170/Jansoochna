const express = require('express')
const router = express.Router()
const petitionController = require('../controllers/petitionController')

// GET /api/petition/:issueId
router.get('/:issueId', petitionController.getPetition)

module.exports = router
