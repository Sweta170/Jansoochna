const rateLimit = require('express-rate-limit')

const janbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,
  message: { error: 'JanBot limit: 20 requests per hour. Thodi der baad try karein.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 min
  max: 100,
  message: { error: 'Too many OTP attempts. Please try again after 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 min
  max: 30,
  message: { error: 'Dheere chalein. Too many requests.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 200,
  message: { error: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { janbotLimiter, otpLimiter, voteLimiter, generalLimiter }
