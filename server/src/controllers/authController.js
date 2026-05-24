const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendOTPEmail } = require('../utils/emailTransporter')

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Map pincode prefix to Indian state
function getStateFromPincode(pincode) {
  if (!pincode || pincode.length !== 6) return 'India'
  const prefix = pincode.substring(0, 2)
  const p1 = pincode.charAt(0)
  
  switch(p1) {
    case '1':
      if (prefix === '11') return 'Delhi'
      if (prefix === '12' || prefix === '13') return 'Haryana'
      if (prefix === '14' || prefix === '15' || prefix === '16') return 'Punjab'
      if (prefix === '17') return 'Himachal Pradesh'
      if (prefix === '18' || prefix === '19') return 'Jammu & Kashmir'
      return 'Punjab'
    case '2':
      if (prefix >= '20' && prefix <= '28') return 'Uttar Pradesh'
      return 'Uttarakhand'
    case '3':
      if (prefix >= '30' && prefix <= '34') return 'Rajasthan'
      if (prefix >= '36' && prefix <= '39') return 'Gujarat'
      return 'Gujarat'
    case '4':
      if (prefix >= '40' && prefix <= '44') return 'Maharashtra'
      if (prefix >= '45' && prefix <= '48') return 'Madhya Pradesh'
      if (prefix === '49') return 'Chhattisgarh'
      return 'Maharashtra'
    case '5':
      if (prefix >= '50' && prefix <= '53') return 'Andhra Pradesh'
      if (prefix >= '56' && prefix <= '59') return 'Karnataka'
      return 'Andhra Pradesh'
    case '6':
      if (prefix >= '60' && prefix <= '64') return 'Tamil Nadu'
      if (prefix >= '67' && prefix <= '69') return 'Kerala'
      return 'Tamil Nadu'
    case '7':
      if (prefix >= '70' && prefix <= '74') return 'West Bengal'
      if (prefix >= '75' && prefix <= '77') return 'Odisha'
      if (prefix === '78') return 'Assam'
      return 'West Bengal'
    case '8':
      if (prefix >= '80' && prefix <= '85') return 'Bihar'
      return 'Jharkhand'
    default:
      return 'India'
  }
}


// Generate JWT tokens
function generateTokens(user) {
  const payload = {
    id: user._id,
    email: user.email,
    phone: user.phone || '',
    pincode: user.pincode,
    area: user.area || '',
    city: user.city || '',
    state: user.state || '',
    ward: user.ward || '',
    district: user.district || '',
    location: user.location,
    name: user.name,
    badge: user.badge,
  }

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

  return { accessToken, refreshToken }
}

// POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Sahi email address enter karein.' })
    }

    const otp = generateOTP()
    const hashedOTP = await bcrypt.hash(otp, 10)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    // Find user by email
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      existingUser.otp = hashedOTP
      existingUser.otpExpiry = otpExpiry
      if (phone) existingUser.phone = phone
      await existingUser.save()
    } else {
      // For new users, we'll store OTP in a temporary way
      // Create a pending user entry with placeholder pincode
      await User.create({
        email: email.toLowerCase(),
        phone: phone || '',
        pincode: '000000', // placeholder, will be updated on verify
        otp: hashedOTP,
        otpExpiry,
      })
    }

    const sent = await sendOTPEmail(email.toLowerCase(), otp)
    if (!sent && process.env.NODE_ENV !== 'development') {
      return res.status(500).json({ error: 'OTP bhejne mein problem hui. Dobara try karein.' })
    }

    const responsePayload = { 
      message: 'OTP sent', 
      isNewUser: !existingUser || existingUser.pincode === '000000' 
    }
    
    // In development mode, or if SMTP is not configured, send otp in response for ease of testing
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS
    if (process.env.NODE_ENV === 'development' || !smtpConfigured) {
      responsePayload.devOtp = otp
    }
    
    res.json(responsePayload)
  } catch (err) {
    console.error('sendOTP error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, name, pincode, state, district, city, ward, area } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email aur OTP zaroori hai.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(400).json({ error: 'User nahi mila. Pehle OTP bhejein.' })
    }

    // Check expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Naya OTP bhejein.' })
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otp)
    if (!isValid) {
      return res.status(400).json({ error: 'Galat OTP. Dobara try karein.' })
    }

    // Clear OTP
    user.otp = undefined
    user.otpExpiry = undefined

    // If new user (placeholder pincode), require name + pincode
    if (user.pincode === '000000') {
      if (!name || !pincode || !/^\d{6}$/.test(pincode)) {
        return res.status(400).json({ error: 'Naye user ke liye Name aur Pincode zaroori hai.' })
      }

      const { lookupPincode } = require('../utils/pincodeLookup')
      const pincodeData = await lookupPincode(pincode)

      const detectedState    = pincodeData?.state    || state    || ''
      const detectedDistrict = pincodeData?.district || district || ''
      const detectedCity     = pincodeData?.city     || city     || area || ''

      user.name = name.trim()
      user.pincode = pincode
      user.ward = ward?.trim() || ''
      user.area = area || ''
      user.city = detectedCity
      user.state = detectedState
      user.district = detectedDistrict

      user.location = {
        address: ward ? `${ward.trim()}, ${detectedCity}` : detectedCity,
        city: detectedCity,
        district: detectedDistrict,
        state: detectedState,
        pincode: pincode,
        ward: ward?.trim() || '',
        country: 'India',
      }
    }

    await user.save()

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user)

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        pincode: user.pincode,
        area: user.area || '',
        city: user.city || '',
        state: user.state || '',
        ward: user.ward || '',
        district: user.district || '',
        location: user.location,
        points: user.points,
        badge: user.badge,
      }
    })
  } catch (err) {
    console.error('verifyOTP error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken
    if (!token) {
      return res.status(401).json({ error: 'No refresh token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    const { accessToken, refreshToken } = generateTokens(user)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ accessToken, refreshToken })
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    console.error('logout error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
