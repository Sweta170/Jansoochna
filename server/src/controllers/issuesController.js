const Issue = require('../models/Issue')
const Vote = require('../models/Vote')
const { awardPoints } = require('../utils/points')
const cloudinary = require('../config/cloudinary')
const sanitizeHtml = require('sanitize-html')

// GET /api/issues?pincode=&category=&status=&page=1&limit=10
exports.getIssues = async (req, res) => {
  try {
    const { pincode, category, status, page = 1, limit = 10 } = req.query

    const query = {}
    if (pincode) query['location.pincode'] = pincode
    if (category && category !== 'all') query.category = category
    if (status && status !== 'all') query.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const issues = await Issue.find(query)
      .populate('author', 'name badge')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Check if current user has voted on each issue
    let issuesWithVoteStatus = issues.map(i => i.toObject())

    if (req.user) {
      const userVotes = await Vote.find({
        user: req.user.id,
        issue: { $in: issues.map(i => i._id) }
      })
      const votedIssueIds = new Set(userVotes.map(v => v.issue.toString()))

      issuesWithVoteStatus = issuesWithVoteStatus.map(issue => ({
        ...issue,
        userHasVoted: votedIssueIds.has(issue._id.toString()),
      }))
    }

    const total = await Issue.countDocuments(query)

    res.json({
      issues: issuesWithVoteStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore: skip + issues.length < total,
      }
    })
  } catch (err) {
    console.error('getIssues error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/issues/:id
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('author', 'name badge phone')

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    let userHasVoted = false
    if (req.user) {
      const vote = await Vote.findOne({ user: req.user.id, issue: issue._id })
      userHasVoted = !!vote
    }

    res.json({
      ...issue.toObject(),
      userHasVoted,
    })
  } catch (err) {
    console.error('getIssueById error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/issues
exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, lat, lng, pincode, address, photoBase64 } = req.body

    if (!title || !description || !category || !pincode) {
      return res.status(400).json({ error: 'Title, description, category, and pincode required.' })
    }

    if (description.length < 30) {
      return res.status(400).json({ error: 'Description mein kam se kam 30 characters chahiye.' })
    }

    const sanitizedTitle = sanitizeHtml(title.trim(), { allowedTags: [], allowedAttributes: {} })
    const sanitizedDesc = sanitizeHtml(description.trim(), { allowedTags: [], allowedAttributes: {} })

    let photoUrl = null
    if (photoBase64) {
      try {
        // Validate MIME type
        const mimeMatch = photoBase64.match(/^data:(image\/(jpeg|png|webp));base64,/)
        if (!mimeMatch) {
          return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images allowed.' })
        }

        const result = await cloudinary.uploader.upload(photoBase64, {
          folder: 'jansoochna/issues',
          transformation: [
            { width: 800, crop: 'limit' },
            { quality: 'auto:good' },
          ],
        })
        photoUrl = result.secure_url
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr)
        // Continue without photo rather than failing
      }
    }

    const issue = new Issue({
      title: sanitizedTitle,
      description: sanitizedDesc,
      category,
      location: { lat, lng, pincode: req.user.pincode, address },
      photoUrl,
      author: req.user.id,
    })

    await issue.save()

    const populatedIssue = await Issue.findById(issue._id)
      .populate('author', 'name badge')

    // Award points
    const pointResult = await awardPoints(req.user.id, 'REPORT_ISSUE')

    res.status(201).json({
      issue: populatedIssue,
      pointResult,
    })
  } catch (err) {
    console.error('createIssue error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/issues/:id/vote
exports.voteIssue = async (req, res) => {
  try {
    const issueId = req.params.id
    const userId = req.user.id

    const issue = await Issue.findById(issueId)
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    const existingVote = await Vote.findOne({ user: userId, issue: issueId })

    if (existingVote) {
      // Remove vote
      await Vote.deleteOne({ _id: existingVote._id })
      issue.voteCount = Math.max(0, issue.voteCount - 1)
      await issue.save()

      return res.json({ voteCount: issue.voteCount, userHasVoted: false })
    }

    // Add vote
    await Vote.create({ user: userId, issue: issueId })
    issue.voteCount += 1
    await issue.save()

    // Award points to issue author (first vote gets points)
    if (issue.voteCount === 1) {
      await awardPoints(issue.author, 'VOTE_ISSUE')
    }

    // Award voter points
    await awardPoints(userId, 'VOTE_ISSUE')

    // Check if vote count hit 50 — trigger petition
    if (issue.voteCount === 50 && !issue.petitionUrl) {
      // Emit socket event
      if (req.io) {
        req.io.to(issue.location.pincode).emit('petition-ready', { issueId: issue._id })
      }

      // Trigger petition generation asynchronously
      try {
        const petitionController = require('./petitionController')
        await petitionController.generatePetitionForIssue(issue._id)
      } catch (petErr) {
        console.error('Auto-petition generation error:', petErr)
      }
    }

    res.json({ voteCount: issue.voteCount, userHasVoted: true })
  } catch (err) {
    console.error('voteIssue error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/issues/my
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ author: req.user.id })
      .populate('author', 'name badge')
      .sort({ createdAt: -1 })
    res.json(issues)
  } catch (err) {
    console.error('getMyIssues error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
