/**
 * OTP Lockout Utility for JanSoochna
 *
 * Rules:
 * - 3 wrong guesses → 15 minute lockout
 * - 5 lockouts total → 24 hour hard lock
 * - Successful OTP → resets all counters
 * - New OTP requested → resets attempt counter (not lock count)
 */

const MAX_ATTEMPTS       = 3      // wrong guesses before lockout
const LOCKOUT_DURATION   = 15     // minutes for standard lockout
const HARD_LOCK_DURATION = 24 * 60 // minutes for hard lock (24 hours)
const MAX_LOCKOUTS       = 5      // lockouts before hard lock

/**
 * Check if account is currently locked
 * Returns: { locked: boolean, minutesLeft: number, isHardLock: boolean }
 */
function checkLockStatus(user) {
  if (!user.otpLockedUntil) {
    return { locked: false, minutesLeft: 0, isHardLock: false }
  }

  const now = new Date()
  const lockedUntil = new Date(user.otpLockedUntil)

  if (now < lockedUntil) {
    const msLeft = lockedUntil - now
    const minutesLeft = Math.ceil(msLeft / 60000)
    const isHardLock = user.otpLockCount >= MAX_LOCKOUTS
    return { locked: true, minutesLeft, isHardLock }
  }

  // Lock has expired
  return { locked: false, minutesLeft: 0, isHardLock: false }
}

/**
 * Record a failed OTP attempt
 * Returns updated lockout status
 */
async function recordFailedAttempt(user) {
  user.otpAttempts = (user.otpAttempts || 0) + 1

  if (user.otpAttempts >= MAX_ATTEMPTS) {
    // Trigger lockout
    user.otpLockCount = (user.otpLockCount || 0) + 1

    const isHardLock = user.otpLockCount >= MAX_LOCKOUTS
    const lockDuration = isHardLock ? HARD_LOCK_DURATION : LOCKOUT_DURATION

    user.otpLockedUntil = new Date(Date.now() + lockDuration * 60 * 1000)
    user.otpAttempts = 0  // reset attempts for next window
    user.otp = undefined  // invalidate the OTP
    user.otpExpiry = undefined

    // Security log
    console.warn(
      `[SECURITY] OTP lockout triggered for ${user.email}`,
      `| Lock #${user.otpLockCount}`,
      `| Hard lock: ${isHardLock}`,
      `| Duration: ${lockDuration} min`,
      `| Time: ${new Date().toISOString()}`
    )

    await user.save()

    return {
      justLocked: true,
      isHardLock,
      lockDuration,
      lockCount: user.otpLockCount,
    }
  }

  await user.save()

  return {
    justLocked: false,
    attemptsLeft: MAX_ATTEMPTS - user.otpAttempts,
  }
}

/**
 * Reset all lockout counters on successful OTP verification
 */
async function clearLockout(user) {
  user.otpAttempts    = 0
  user.otpLockedUntil = null
  user.otpLockCount   = 0
  user.lastOtpRequest = null
  user.otp            = undefined
  user.otpExpiry      = undefined
  await user.save()
}

/**
 * Reset attempt counter when new OTP is requested
 * (Don't reset lock count — prevents endless OTP requests to reset lockout)
 */
async function resetAttemptCounter(user) {
  // Only reset attempts if NOT currently locked
  const { locked } = checkLockStatus(user)
  if (!locked) {
    user.otpAttempts    = 0
    user.lastOtpRequest = new Date()
    await user.save()
  }
}

/**
 * Build human-readable lockout message in Hindi + English
 */
function getLockoutMessage(minutesLeft, isHardLock, attemptsLeft) {
  if (isHardLock) {
    const hoursLeft = Math.ceil(minutesLeft / 60)
    return {
      hi: `बहुत ज़्यादा गलत प्रयास। ${hoursLeft} घंटे बाद दोबारा कोशिश करें।`,
      en: `Too many failed attempts. Try again after ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.`,
      code: 'HARD_LOCKED',
    }
  }

  if (minutesLeft > 0) {
    return {
      hi: `गलत OTP बहुत बार डाला। ${minutesLeft} मिनट बाद दोबारा कोशिश करें।`,
      en: `Too many wrong attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
      code: 'LOCKED',
    }
  }

  if (attemptsLeft !== undefined) {
    return {
      hi: `गलत OTP। ${attemptsLeft} और मौका बचा है।`,
      en: `Wrong OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
      code: 'WRONG_OTP',
    }
  }

  return {
    hi: 'गलत OTP।',
    en: 'Wrong OTP.',
    code: 'WRONG_OTP',
  }
}

module.exports = {
  checkLockStatus,
  recordFailedAttempt,
  clearLockout,
  resetAttemptCounter,
  getLockoutMessage,
  MAX_ATTEMPTS,
  LOCKOUT_DURATION,
  HARD_LOCK_DURATION,
  MAX_LOCKOUTS,
}
