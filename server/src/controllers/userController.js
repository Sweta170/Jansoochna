const User = require('../models/User')
const Vote = require('../models/Vote')
const Issue = require('../models/Issue')
const Post = require('../models/Post')
const Notification = require('../models/Notification')

// GET /api/user/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpiry')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get activity stats
    const issuesReported = await Issue.countDocuments({ author: user._id })
    const votesCast = await Vote.countDocuments({ user: user._id })
    const postsMade = await Post.countDocuments({ author: user._id })

    res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        pincode: user.pincode,
        area: user.area || '',
        city: user.city || '',
        state: user.state,
        ward: user.ward || '',
        district: user.district || '',
        location: user.location,
        points: user.points,
        badge: user.badge,
        createdAt: user.createdAt,
      },
      stats: {
        issuesReported,
        votesCast,
        postsMade,
      }
    })
  } catch (err) {
    console.error('getMe error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// GET /api/user/leaderboard?pincode=
exports.getLeaderboard = async (req, res) => {
  try {
    const { pincode } = req.query
    if (!pincode) {
      return res.status(400).json({ error: 'Pincode required' })
    }

    const leaders = await User.find({ pincode })
      .select('name points badge')
      .sort({ points: -1 })
      .limit(10)

    res.json(leaders)
  } catch (err) {
    console.error('getLeaderboard error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, pincode, area, city, state } = req.body
    const updates = {}
    if (name) updates.name = name
    if (pincode && /^\d{6}$/.test(pincode)) updates.pincode = pincode
    if (area) updates.area = area
    if (city) updates.city = city
    if (state) updates.state = state

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('-otp -otpExpiry')

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      pincode: user.pincode,
      area: user.area || '',
      city: user.city || '',
      state: user.state || '',
      ward: user.ward || '',
      district: user.district || '',
      location: user.location,
      points: user.points,
      badge: user.badge,
    })
  } catch (err) {
    console.error('updateProfile error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: 'Not found' })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
