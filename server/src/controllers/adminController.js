const Issue = require('../models/Issue')
const Post = require('../models/Post')
const User = require('../models/User')
const Notification = require('../models/Notification')
const { checkJurisdiction } = require('../middleware/adminAuth')
const { POINTS } = require('../utils/points')

// Helper for jurisdiction query building
const buildJurisdictionQuery = (admin, baseQuery = {}) => {
  if (admin.role === 'superadmin') return baseQuery
  if (admin.role === 'state_admin') {
    return { ...baseQuery, 'location.state': admin.state }
  }
  if (admin.role === 'district_admin') {
    return { ...baseQuery, 'location.state': admin.state, 'location.district': admin.district }
  }
  return baseQuery
}

exports.getIssues = async (req, res) => {
  try {
    const query = buildJurisdictionQuery(req.admin)
    
    if (req.query.status) query.status = req.query.status
    if (req.query.category) query.category = req.query.category
    
    const issues = await Issue.find(query)
      .populate('author', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json(issues)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, note } = req.body
    const issueId = req.params.id

    const issue = await Issue.findById(issueId)
    if (!issue) return res.status(404).json({ error: 'Issue not found' })

    if (!checkJurisdiction(req, issue)) {
      return res.status(403).json({ error: 'Out of jurisdiction' })
    }

    const previousStatus = issue.status
    issue.status = status
    
    issue.timeline.push({
      status,
      note,
      updatedBy: req.admin._id,
      date: new Date()
    })

    if (status === 'resolved' && previousStatus !== 'resolved') {
      issue.resolvedAt = new Date()
      // Award points and notify author
      const user = await User.findById(issue.author)
      if (user) {
        user.points += POINTS.ISSUE_RESOLVED || 30
        await user.save()

        await Notification.create({
          user: user._id,
          type: 'issue_update',
          title: 'Samasya Hal (Resolved)',
          body: `Aapki shikayat "${issue.title}" ka samadhan ho gaya hai. Aapko 30 points mile hain!`,
          data: { issueId: issue._id }
        })
        
        if (req.io) {
          req.io.to(user._id.toString()).emit('notification', {
            type: 'issue_update',
            title: 'Samasya Hal (Resolved)'
          })
        }
      }
    }

    await issue.save()

    if (req.io) {
      req.io.to(`pincode:${issue.location.pincode}`).emit('issue-updated', issue)
    }

    res.json(issue)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.updateIssuePriority = async (req, res) => {
  try {
    const { priority } = req.body
    const issue = await Issue.findById(req.params.id)
    if (!issue) return res.status(404).json({ error: 'Not found' })
    if (!checkJurisdiction(req, issue)) return res.status(403).json({ error: 'Out of jurisdiction' })
    
    issue.priority = priority
    await issue.save()
    res.json(issue)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.assignIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
    if (!issue) return res.status(404).json({ error: 'Not found' })
    if (!checkJurisdiction(req, issue)) return res.status(403).json({ error: 'Out of jurisdiction' })
    
    issue.assignedTo = req.admin._id
    await issue.save()
    res.json(issue)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.deleteIssue = async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.getReportedPosts = async (req, res) => {
  try {
    const query = { reported: { $gt: 0 } }
    if (req.admin.role === 'state_admin') query.state = req.admin.state
    if (req.admin.role === 'district_admin') {
      query.state = req.admin.state
      query.district = req.admin.district
    }
    
    const posts = await Post.find(query).populate('author', 'name').sort({ reported: -1 }).limit(50)
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.hidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Not found' })
    post.hidden = true
    await post.save()
    res.json(post)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const query = {}
    if (req.admin.role === 'state_admin') query.state = req.admin.state
    if (req.admin.role === 'district_admin') {
      query.state = req.admin.state
      query.district = req.admin.district
    }
    
    const users = await User.find(query).select('-otp').sort({ createdAt: -1 }).limit(100)
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'Not found' })
    user.isBlocked = !user.isBlocked
    await user.save()
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
