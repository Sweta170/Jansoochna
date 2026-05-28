const { doubleCsrf } = require('csrf-csrf')

const {
  generateCsrfToken: generateToken,
  doubleCsrfProtection: _doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: 'csrf_token',
  cookieOptions: {
    httpOnly: false, // MUST be false — client JS needs to read this cookie
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  size: 64, // token size in bytes
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] || req.body?._csrf,
  getSessionIdentifier: (req) => req.cookies?.refreshToken || 'anonymous',
})

// Wrapper that skips CSRF for mobile app / admin (Bearer token auth) and safe methods
function csrfProtection(req, res, next) {
  // Skip CSRF for:
  // 1. Mobile app & admin requests (use Bearer token, not cookies)
  // 2. GET, HEAD, OPTIONS (read-only, safe methods)
  // 3. Admin portal API routes (use localStorage Bearer tokens, not cookies)
  // 4. Non-browser clients (CSRF only affects browsers where cookies are auto-sent)
  const authHeader = req.headers['authorization']
  const isMobileAppOrAdmin = authHeader && authHeader.startsWith('Bearer ')
  const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  const isAdminRoute = req.path.startsWith('/api/admin')

  const ua = req.headers['user-agent'] || ''
  const isBrowser = ua.includes('Mozilla')

  if (isMobileAppOrAdmin || isSafeMethod || isAdminRoute || !isBrowser) {
    return next()
  }

  return _doubleCsrfProtection(req, res, next)
}

module.exports = { generateToken, csrfProtection }
