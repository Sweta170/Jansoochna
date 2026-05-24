const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const generateTokens = (admin) => {
  const payload = { id: admin._id, role: admin.role, state: admin.state, district: admin.district }
  const accessToken = jwt.sign(payload, process.env.JWT_ADMIN_ACCESS_SECRET || 'fallback_admin_secret', { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, process.env.JWT_ADMIN_REFRESH_SECRET || 'fallback_admin_refresh', { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' })
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    admin.lastLogin = new Date()
    await admin.save()

    const { accessToken, refreshToken } = generateTokens(admin)

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    
    // Also set access token for ease of use in some setups
    res.cookie('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    const adminData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      state: admin.state,
      district: admin.district
    }

    res.json({ accessToken, admin: adminData })
  } catch (err) {
    console.error('admin login error', err)
    res.status(500).json({ error: 'Server error' })
  }
}

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.adminRefreshToken
    if (!token) return res.status(401).json({ error: 'No refresh token' })

    const decoded = jwt.verify(token, process.env.JWT_ADMIN_REFRESH_SECRET || 'fallback_admin_refresh')
    const admin = await Admin.findById(decoded.id)
    if (!admin || !admin.isActive) return res.status(401).json({ error: 'Admin invalid' })

    const { accessToken, refreshToken } = generateTokens(admin)

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    
    res.cookie('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    res.json({ accessToken })
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}

exports.logout = (req, res) => {
  res.clearCookie('adminRefreshToken')
  res.clearCookie('adminAccessToken')
  res.json({ message: 'Logged out' })
}

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name, role, state, district } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(400).json({ error: 'Email already in use' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      state: role === 'superadmin' ? null : state,
      district: (role === 'superadmin' || role === 'state_admin') ? null : district
    })

    res.json({ message: 'Admin created', id: admin._id })
  } catch (err) {
    console.error('create admin error', err)
    res.status(500).json({ error: 'Server error' })
  }
}

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 })
    res.json(admins)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params
    const admin = await Admin.findById(id)
    if (!admin) return res.status(404).json({ error: 'Admin not found' })
    if (admin.role === 'superadmin') return res.status(400).json({ error: 'Cannot deactivate superadmin' })

    admin.isActive = !admin.isActive
    await admin.save()
    res.json({ message: `Admin status toggled successfully`, isActive: admin.isActive })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
