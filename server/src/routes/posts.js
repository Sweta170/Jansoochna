const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const postsController = require('../controllers/postsController')

// GET /api/posts?pincode=&page=1&limit=10
router.get('/', postsController.getPosts)

// GET /api/posts/my
router.get('/my', authMiddleware, postsController.getMyPosts)

// POST /api/posts (auth required)
router.post('/', authMiddleware, postsController.createPost)

module.exports = router
