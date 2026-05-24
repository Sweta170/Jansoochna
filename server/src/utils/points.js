const User = require('../models/User')

const POINTS = {
  REPORT_ISSUE: 20,
  VOTE_ISSUE: 5,
  MOHALLA_POST: 10,
  FORM_GUIDE_USED: 2,
  CORRECTION_SUBMITTED: 15,
  CORRECTION_VERIFIED: 50,
}

const BADGES = [
  { name: 'Nagarik',     minPoints: 0,    color: '#888780' },
  { name: 'Sewak',       minPoints: 100,  color: '#1D9E75' },
  { name: 'Jan Nayak',   minPoints: 500,  color: '#BA7517' },
  { name: 'Pratinidhi',  minPoints: 1000, color: '#534AB7' },
]

async function awardPoints(userId, action) {
  const pts = POINTS[action]
  if (!pts) return { badgeUpgraded: false }

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { points: pts } },
    { new: true }
  )

  if (!user) return { badgeUpgraded: false }

  // Check badge upgrade
  const newBadge = BADGES.filter(b => user.points >= b.minPoints).pop()
  if (newBadge && newBadge.name !== user.badge) {
    await User.findByIdAndUpdate(userId, { badge: newBadge.name })
    return { badgeUpgraded: true, newBadge: newBadge.name, points: user.points }
  }

  return { badgeUpgraded: false, points: user.points }
}

module.exports = { awardPoints, POINTS, BADGES }
