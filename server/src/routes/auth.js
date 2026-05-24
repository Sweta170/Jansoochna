const express = require('express')
const router = express.Router()
const { otpLimiter } = require('../middleware/rateLimit')
const authController = require('../controllers/authController')

// POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, authController.sendOTP)

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP)

// GET /api/auth/lookup-pincode
router.get('/lookup-pincode', async (req, res) => {
  const { pincode } = req.query
  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ error: 'Valid 6-digit pincode required' })
  }
  const { lookupPincode } = require('../utils/pincodeLookup')
  const data = await lookupPincode(pincode)
  if (!data) {
    return res.status(404).json({ error: 'Pincode not found' })
  }
  return res.json(data)
})

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken)

// POST /api/auth/logout
router.post('/logout', authController.logout)

module.exports = router
