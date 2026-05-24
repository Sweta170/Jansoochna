const Post = require('../models/Post')
const { awardPoints } = require('../utils/points')
const sanitizeHtml = require('sanitize-html')

// GET /api/posts?pincode=&page=1&limit=10
exports.getPosts = async (req, res) => {
  try {
    const { pincode, page = 1, limit = 10 } = req.query

    if (!pincode) {
      return res.status(400).json({ error: 'Pincode required' })
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const posts = await Post.find({ pincode })
      .populate('author', 'name badge')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Post.countDocuments({ pincode })

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore: skip + posts.length < total,
      }
    })
  } catch (err) {
    console.error('getPosts error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { body, type } = req.body

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Post body required' })
    }

    if (body.length > 200) {
      return res.status(400).json({ error: 'Post body must be 200 characters or less' })
    }

    const sanitizedBody = sanitizeHtml(body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    })

    const post = new Post({
      body: sanitizedBody,
      type: type || 'notice',
      pincode: req.user.pincode,
      state: req.user.state || '',
      district: req.user.district || '',
      author: req.user.id,
    })

    await post.save()

    // Populate author for response
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name badge')

    // Award points
    const pointResult = await awardPoints(req.user.id, 'MOHALLA_POST')

    // Emit to pincode room via Socket.io
    if (req.io) {
      req.io.to(req.user.pincode).emit('new-post', populatedPost)
    }

    res.status(201).json({
      post: populatedPost,
      pointResult,
    })
  } catch (err) {
    console.error('createPost error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/posts/my
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'name badge')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    console.error('getMyPosts error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
