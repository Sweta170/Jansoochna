const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const userController = require('../controllers/userController')

// GET /api/user/me
router.get('/me', authMiddleware, userController.getMe)

// GET /api/user/leaderboard?pincode=
router.get('/leaderboard', userController.getLeaderboard)

// PUT /api/user/profile
router.put('/profile', authMiddleware, userController.updateProfile)

// PATCH /api/user/location
router.patch('/location', authMiddleware, async (req, res) => {
  try {
    const { ward, pincode, state, district, city } = req.body
    const User = require('../models/User')
    const { lookupPincode } = require('../utils/pincodeLookup')

    // If pincode changed, re-lookup
    let locationData = { state, district, city }
    if (pincode) {
      const detected = await lookupPincode(pincode)
      if (detected) {
        locationData = {
          state:    state    || detected.state,
          district: district || detected.district,
          city:     city     || detected.city,
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        ward:     ward?.trim() || '',
        pincode:  pincode || undefined,
        state:    locationData.state,
        district: locationData.district,
        city:     locationData.city,
        location: {
          address:  ward ? `${ward.trim()}, ${locationData.city}` : locationData.city,
          city:     locationData.city,
          district: locationData.district,
          state:    locationData.state,
          pincode:  pincode,
          ward:     ward?.trim() || '',
          country:  'India',
        }
      },
      { new: true }
    ).select('-otp -otpExpiry -password')

    res.json({ user: updatedUser, message: 'Location updated' })
  } catch (err) {
    console.error('[location update]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/user/notifications
router.get('/notifications', authMiddleware, userController.getNotifications)

// PATCH /api/user/notifications/:id/read
router.patch('/notifications/:id/read', authMiddleware, userController.markNotificationRead)

module.exports = router
