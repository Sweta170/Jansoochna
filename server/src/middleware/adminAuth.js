const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminAccessToken || req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No admin token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ADMIN_ACCESS_SECRET || 'fallback_admin_secret')
    const admin = await Admin.findById(decoded.id).select('-password')

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Admin access revoked or invalid.' })
    }

    req.admin = admin
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid admin token.' })
  }
}

// Role based middleware
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin not authenticated.' })
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' })
    }
    next()
  }
}

exports.checkJurisdiction = (req, issue) => {
  const { role, state, district } = req.admin
  if (role === 'superadmin') return true
  if (role === 'state_admin' && issue.location.state === state) return true
  if (role === 'district_admin' && issue.location.state === state && issue.location.district === district) return true
  return false
}
