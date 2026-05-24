const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { otpLimiter } = require('../middleware/rateLimit')
const authController = require('../controllers/authController')

// Middleware to handle validation results
const validateFields = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() })
  }
  next()
}

// POST /api/auth/send-otp
router.post(
  '/send-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Sahi email address enter karein.').normalizeEmail()
  ],
  validateFields,
  authController.sendOTP
)

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Sahi email address enter karein.').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP 6-digit hona chahiye.').isNumeric()
  ],
  validateFields,
  authController.verifyOTP
)

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
