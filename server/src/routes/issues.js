const express = require('express')
const router = express.Router()
const { authMiddleware, optionalAuth } = require('../middleware/auth')
const { voteLimiter } = require('../middleware/rateLimit')
const issuesController = require('../controllers/issuesController')

// GET /api/issues
router.get('/', optionalAuth, issuesController.getIssues)

// GET /api/issues/my
router.get('/my', authMiddleware, issuesController.getMyIssues)

// GET /api/issues/:id
router.get('/:id', optionalAuth, issuesController.getIssueById)

// POST /api/issues
router.post('/', authMiddleware, issuesController.createIssue)

// POST /api/issues/:id/vote
router.post('/:id/vote', authMiddleware, voteLimiter, issuesController.voteIssue)

module.exports = router
