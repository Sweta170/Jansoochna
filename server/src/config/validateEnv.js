/**
 * Validates required environment variables on server startup.
 * Crashes immediately with a clear error if any critical var is missing.
 * Much better than cryptic errors at runtime.
 */
function validateEnv() {
  const required = [
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL',
  ]

  const recommended = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
    'ANTHROPIC_API_KEY',
  ]

  const missing = required.filter(key => !process.env[key])
  const missingRecommended = recommended.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('\n❌ MISSING REQUIRED ENV VARIABLES:')
    missing.forEach(key => console.error(`   ${key}`))
    console.error('\nServer cannot start. Add these to server/.env\n')
    process.exit(1)
  }

  if (missingRecommended.length > 0) {
    console.warn('\n⚠️  Missing recommended env variables (some features may not work):')
    missingRecommended.forEach(key => console.warn(`   ${key}`))
    console.warn('')
  }

  // Warn if JWT secrets are too short (should be 32+ chars)
  const jwtKeys = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_ADMIN_ACCESS_SECRET', 'JWT_ADMIN_REFRESH_SECRET']
  jwtKeys.forEach(key => {
    if (process.env[key] && process.env[key].length < 32) {
      console.warn(`⚠️  ${key} is too short (${process.env[key].length} chars). Use 64+ random chars.`)
    }
  })

  // Warn if using default/example values
  const dangerousValues = ['your_secret', 'changeme', 'password', '123456', 'secret']
  Object.entries(process.env).forEach(([key, value]) => {
    if (dangerousValues.some(d => value?.toLowerCase().includes(d))) {
      console.warn(`⚠️  ${key} looks like a placeholder value. Replace with a real secret.`)
    }
  })

  console.log('✅ Environment variables validated')
}

module.exports = { validateEnv }
