const Issue = require('../models/Issue')
const User = require('../models/User')

exports.getOverview = async (req, res) => {
  try {
    const match = {}
    if (req.admin.role === 'state_admin') match['location.state'] = req.admin.state
    if (req.admin.role === 'district_admin') {
      match['location.state'] = req.admin.state
      match['location.district'] = req.admin.district
    }

    const totalIssues = await Issue.countDocuments(match)
    const resolvedIssues = await Issue.countDocuments({ ...match, status: 'resolved' })
    const openIssues = await Issue.countDocuments({ ...match, status: 'open' })
    
    const userMatch = {}
    if (req.admin.role === 'state_admin') userMatch.state = req.admin.state
    if (req.admin.role === 'district_admin') {
      userMatch.state = req.admin.state
      userMatch.district = req.admin.district
    }
    const totalUsers = await User.countDocuments(userMatch)

    res.json({ totalIssues, resolvedIssues, openIssues, totalUsers })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.getCategories = async (req, res) => {
  try {
    const match = {}
    if (req.admin.role === 'state_admin') match['location.state'] = req.admin.state
    if (req.admin.role === 'district_admin') {
      match['location.state'] = req.admin.state
      match['location.district'] = req.admin.district
    }

    const categoryStats = await Issue.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])

    res.json(categoryStats)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
