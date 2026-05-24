import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'
import api from '../services/api'
import { Mail, Smartphone, Lock, User, MapPin, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, slideUp, fadeIn } from '../lib/motionVariants'

const SignIn = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [pincode, setPincode] = useState('')
  const [area, setArea] = useState('')
  const [city, setCity] = useState('')
  const [ward, setWard] = useState('')
  const [district, setDistrict] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [lockoutState, setLockoutState] = useState(null)

  // Lockout countdown timer:
  useEffect(() => {
    if (!lockoutState?.locked || !lockoutState.minutesLeft) return

    const timer = setInterval(() => {
      setLockoutState(prev => {
        if (!prev) return null
        const newMinutes = prev.minutesLeft - 1
        if (newMinutes <= 0) {
          clearInterval(timer)
          return null  // unlock
        }
        return { ...prev, minutesLeft: newMinutes }
      })
    }, 60000)  // update every minute

    return () => clearInterval(timer)
  }, [lockoutState?.locked, lockoutState?.minutesLeft])
  const [pincodeError, setPincodeError] = useState('')
  const [wardFocused, setWardFocused] = useState(false)
  const [districtFocused, setDistrictFocused] = useState(false)
  const [stateNameFocused, setStateNameFocused] = useState(false)

  const handlePincodeChange = async (val) => {
    const cleanVal = val.replace(/\D/g, '')
    setPincode(cleanVal)
    setPincodeError('')

    if (cleanVal.length === 6 && /^\d{6}$/.test(cleanVal)) {
      setPincodeLoading(true)
      try {
        const res = await api.get(`/auth/lookup-pincode?pincode=${cleanVal}`)
        setStateName(res.data.state || '')
        setDistrict(res.data.district || '')
        setCity(res.data.city || '')
      } catch (err) {
        setPincodeError('Pincode nahi mila — manually bharen')
        setStateName('')
        setDistrict('')
        setCity('')
      } finally {
        setPincodeLoading(false)
      }
    }
  }
  
  const [step, setStep] = useState(1) // 1: Send OTP, 2: Verify OTP
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtpMessage, setDevOtpMessage] = useState('')
  const [devOtp, setDevOtp] = useState('')
  
  // Custom states for visual indicator transitions
  const [emailFocused, setEmailFocused] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [pincodeFocused, setPincodeFocused] = useState(false)
  const [areaFocused, setAreaFocused] = useState(false)
  const [cityFocused, setCityFocused] = useState(false)
  const [shakeActive, setShakeActive] = useState(false)
  const [successOtp, setSuccessOtp] = useState(false)

  const otpRefs = useRef([])

  useEffect(() => {
    // Pre-fetch CSRF token when login page loads
    // This ensures the CSRF cookie is set before user submits
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/csrf-token`, {
      withCredentials: true
    }).catch(() => {})  // silent — will retry on form submit
  }, [])

  useEffect(() => {
    // Focus first OTP field when step transitions to 2
    if (step === 2 && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0].focus(), 100)
    }
  }, [step])

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Zaroori: Sahi email address enter karein.')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      const response = await api.post('/auth/send-otp', { email })
      
      setIsNewUser(response.data.isNewUser)
      setStep(2)
      
      // Dev mode: server returns OTP directly
      if (response.data.devOtp) {
        setDevOtp(response.data.devOtp)
      }
      if (response.data.isNewUser) {
        setDevOtpMessage('Apna profile banayein (First-time sign-in)')
      }
    } catch (err) {
      console.error(err)
      const data = err.response?.data
      const status = err.response?.status
      if (status === 429) {
        setLockoutState({
          locked: true,
          minutesLeft: data.minutesLeft,
          isHardLock: data.isHardLock,
          message: data.message || 'Too many failed attempts.',
        })
        setStep(2) // Move to step 2 so we show the lockout screen
        setError('')
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'OTP bhejne mein dikkat aayi. Kripya dobara try karein.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    const otp = otpArray.join('')
    if (!/^\d{6}$/.test(otp)) {
      setError('Zaroori: 6-digit OTP enter karein.')
      setShakeActive(true)
      return
    }
    
    if (isNewUser && (!name.trim() || !/^\d{6}$/.test(pincode))) {
      setError('Zaroori: Sahi naam aur 6-digit pin code enter karein.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
        name: isNewUser ? name : undefined,
        pincode: isNewUser ? pincode : undefined,
        state: isNewUser ? stateName : undefined,
        district: isNewUser ? district : undefined,
        city: isNewUser ? city : undefined,
        ward: isNewUser ? ward : undefined,
        area: isNewUser ? area : undefined
      })

      // Turn boxes green visually on success
      setSuccessOtp(true)
      
      setTimeout(() => {
        // Complete login
        login(response.data.user, response.data.accessToken)
        navigate('/app')
      }, 600)
    } catch (err) {
      console.error(err)
      const data = err.response?.data
      const status = err.response?.status

      if (status === 429) {
        setLockoutState({
          locked: true,
          minutesLeft: data.minutesLeft,
          isHardLock: data.isHardLock,
          message: data.message || 'Too many failed attempts.',
        })
        setError('')
        setOtpArray(['', '', '', '', '', ''])
      } else {
        if (data?.attemptsLeft !== undefined) {
          setError(`${data.message || data.error} (${data.attemptsLeft} मौका बचा है)`)
        } else {
          setError(data?.error || data?.message || 'Verification failed. OTP check karein.')
        }
        setShakeActive(true)
        setOtpArray(['', '', '', '', '', ''])
        if (otpRefs.current[0]) otpRefs.current[0].focus()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (val, idx) => {
    const numericVal = val.replace(/\D/g, '')
    if (!numericVal) {
      const newOtp = [...otpArray]
      newOtp[idx] = ''
      setOtpArray(newOtp)
      return
    }

    const newOtp = [...otpArray]
    // If pasted or typed multiple digits
    if (numericVal.length > 1) {
      const digits = numericVal.slice(0, 6 - idx).split('')
      digits.forEach((d, i) => {
        if (idx + i < 6) newOtp[idx + i] = d
      })
      setOtpArray(newOtp)
      const nextIdx = Math.min(5, idx + digits.length)
      if (otpRefs.current[nextIdx]) otpRefs.current[nextIdx].focus()
    } else {
      newOtp[idx] = numericVal
      setOtpArray(newOtp)
      if (idx < 5 && otpRefs.current[idx + 1]) {
        otpRefs.current[idx + 1].focus()
      }
    }

    // Auto submit if complete
    const fullOtp = newOtp.join('')
    if (fullOtp.length === 6 && !isNewUser) {
      setTimeout(() => {
        handleVerifyOtp()
      }, 100)
    }
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!otpArray[idx] && idx > 0 && otpRefs.current[idx - 1]) {
        const newOtp = [...otpArray]
        newOtp[idx - 1] = ''
        setOtpArray(newOtp)
        otpRefs.current[idx - 1].focus()
      } else {
        const newOtp = [...otpArray]
        newOtp[idx] = ''
        setOtpArray(newOtp)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#E1F5EE] to-[#FDFFFE] max-w-md mx-auto justify-center px-6 relative shadow-2xl border-x border-[#E8EDEA] overflow-hidden pb-12">
      
      {/* Illustrated SVG city skyline + Diya Hero */}
      <div className="flex flex-col justify-center items-center w-full mb-6">
        <div className="w-full max-w-[200px] h-[100px] relative flex justify-center items-end overflow-hidden mb-2">
          {/* Skyline silhouette */}
          <svg className="absolute bottom-0 w-full h-[60px] text-[#A8B5AD] text-opacity-35" viewBox="0 0 200 60" fill="currentColor">
            <rect x="10" y="20" width="15" height="40" rx="1" />
            <rect x="30" y="10" width="20" height="50" rx="1" />
            <rect x="55" y="30" width="25" height="30" rx="1" />
            <rect x="85" y="15" width="18" height="45" rx="1" />
            <rect x="110" y="5" width="22" height="55" rx="1" />
            <rect x="140" y="25" width="16" height="35" rx="1" />
            <rect x="165" y="10" width="20" height="50" rx="1" />
          </svg>
          
          {/* Glowing Diya oil lamp */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="z-10 cursor-pointer"
          >
            <svg className="w-20 h-20 text-[#1D9E75]" viewBox="0 0 100 100" fill="currentColor">
              {/* Flame shadow */}
              <circle cx="50" cy="30" r="14" fill="#FDF0E6" filter="blur(6px)" opacity="0.8" />
              {/* Diya Base */}
              <path d="M20,60 C20,75 80,75 80,60 L20,60 Z" fill="#E07B2A" />
              <path d="M15,60 C15,62 85,62 85,60 C85,55 70,55 50,55 C30,55 15,55 15,60 Z" fill="#C9A227" />
              {/* Diya Wick wickholder */}
              <rect x="48" y="50" width="4" height="8" fill="#0D1B12" />
              {/* Flame */}
              <path d="M50,15 C55,30 58,45 50,52 C42,45 45,30 50,15 Z" fill="#E07B2A" />
              <path d="M50,22 C53,32 54,42 50,47 C46,42 47,32 50,22 Z" fill="#C9A227" />
              <path d="M50,30 C51,36 52,42 50,45 C48,42 49,36 50,30 Z" fill="#FDFFFE" />
            </svg>
          </motion.div>
        </div>

        {/* Brand Block */}
        <h1 className="text-3xl font-extrabold text-[#0F5C3A] font-display tracking-wide mb-1 leading-none text-center">
          JanSoochna
        </h1>
        <p className="text-[15px] font-semibold text-[#E07B2A] font-accent italic text-center leading-tight">
          जन की आवाज़
        </p>
        <span className="text-[10px] uppercase font-bold text-[#607068] tracking-widest text-center mt-1">
          अपने मोहल्ले की नब्ज़ पकड़ें
        </span>
      </div>

      {/* Main Form Container */}
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="bg-[#FDFFFE] rounded-[24px] p-6 shadow-card border border-[#E8EDEA] relative"
      >
        <h2 className="text-xl font-bold text-center text-[#0F5C3A] font-display mb-1">
          {step === 1 ? 'Login / Register' : 'OTP Verification'}
        </h2>
        <p className="text-[11px] text-[#607068] text-center mb-5 font-medium leading-tight">
          {step === 1 ? 'Apna email address darj karein' : `Humne ${email} par code bheja hai`}
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-[#FDECEA] text-[#C0392B] border border-[#C0392B] border-opacity-15 rounded-xl p-3 text-xs mb-4 flex items-center gap-2 justify-center font-semibold"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev mode OTP banner — auto-fill button */}
        <AnimatePresence mode="wait">
          {devOtp && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mb-4"
            >
              <div className="bg-[#FDF0E6] border border-[#E07B2A] border-opacity-30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-extrabold text-[#E07B2A] uppercase tracking-wider">🛠 Dev Mode OTP</p>
                  <p className="text-2xl font-extrabold text-[#0D1B12] tracking-[0.2em] font-display">{devOtp}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpArray(devOtp.split(''))
                    setDevOtp('')
                  }}
                  className="bg-[#E07B2A] text-white text-[10px] font-extrabold px-3 py-2 rounded-lg uppercase tracking-wide flex-shrink-0 active:scale-95 transition-transform"
                >
                  Auto-fill ↵
                </button>
              </div>
              <p className="text-[8px] text-[#607068] text-center mt-1 font-bold uppercase">Only visible in development mode</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {devOtpMessage && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-[#E1F5EE] text-[#0F5C3A] border border-[#1D9E75] border-opacity-20 rounded-xl p-3 text-xs mb-4 text-center font-bold"
            >
              {devOtpMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                Email Address
              </label>
              
              {/* Bottom-border indicator wrapper */}
              <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Apna email enter karein"
                  className="w-full bg-transparent pl-1 pr-8 py-2 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                  required
                />
                
                <Mail className="absolute right-2 text-[#607068]" size={16} />

                {/* Animated active border indicator line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: emailFocused ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] hover:opacity-95 text-[#FDFFFE] font-bold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(15,92,58,0.15)] active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {loading ? 'Bhej rahe hain...' : 'OTP Bhejein'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {lockoutState?.locked ? (
              <div
                className="rounded-2xl p-6 text-center my-4"
                style={{
                  background: lockoutState.isHardLock ? '#FCEBEB' : '#FDF0E6',
                  border: `0.5px solid ${lockoutState.isHardLock ? '#F09595' : '#F0C070'}`,
                }}
              >
                {/* Lock icon */}
                <div className="text-3xl mb-3">
                  {lockoutState.isHardLock ? '🔒' : '⏳'}
                </div>

                {/* Message */}
                <p
                  className="text-sm font-semibold mb-2 font-display"
                  style={{
                    color: lockoutState.isHardLock ? '#A32D2D' : '#854F0B',
                    fontFamily: 'Mukta, sans-serif',
                  }}
                >
                  {lockoutState.message}
                </p>

                {/* Countdown */}
                {lockoutState.minutesLeft > 0 && (
                  <p
                    className="text-xs"
                    style={{
                      color: lockoutState.isHardLock ? '#C0392B' : '#E07B2A',
                      fontFamily: 'Mukta, sans-serif',
                    }}
                  >
                    {lockoutState.minutesLeft} मिनट बाद unlock होगा
                  </p>
                )}

                {/* Hard lock extra message */}
                {lockoutState.isHardLock && (
                  <p
                    className="text-xs text-[#A8B5AD] mt-2"
                    style={{
                      fontFamily: 'Mukta, sans-serif',
                    }}
                  >
                    बहुत ज़्यादा गलत प्रयास के कारण account lock है।
                    Support के लिए contact करें।
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide block text-center">
                  Enter 6-Digit OTP
                </label>
                
                {/* 6 Digit Grid inputs with Shake error and Correct sequentially */}
                <motion.div
                  animate={shakeActive ? { x: [0, -8, 8, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onAnimationComplete={() => setShakeActive(false)}
                  className="flex justify-between gap-1.5 max-w-[280px] mx-auto"
                >
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      pattern="\d*"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className={`w-9 h-11 border rounded-lg text-center font-extrabold text-sm focus:outline-none transition-all ${
                        successOtp
                          ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F5C3A]'
                          : 'border-[#E8EDEA] bg-[#F4F7F5] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] text-[#0D1B12]'
                      }`}
                    />
                  ))}
                </motion.div>

                <p className="text-[9px] text-[#607068] text-center mt-2 italic font-medium leading-tight">
                  * OTP is logged directly to the server command console output.
                </p>
              </div>
            )}

            {/* Profile fields slideup if user is new */}
            <AnimatePresence>
              {isNewUser && (
                <motion.div
                  variants={slideUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4 pt-4 border-t border-[#E8EDEA] border-dashed"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                      Apna Naam
                    </label>
                    <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        placeholder="Naam likhein"
                        className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                        required
                      />
                      <User className="absolute right-2 text-[#607068]" size={15} />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: nameFocused ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                      Pincode
                    </label>

                    <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        onFocus={() => setPincodeFocused(true)}
                        onBlur={() => setPincodeFocused(false)}
                        placeholder="e.g. 110001"
                        className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                        required
                      />
                      {pincodeLoading && (
                        <span className="absolute right-8 text-[10px] font-bold text-[#1D9E75] animate-pulse">
                          Detecting...
                        </span>
                      )}
                      <MapPin className="absolute right-2 text-[#607068]" size={15} />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: pincodeFocused ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                    {pincodeError && (
                      <p className="text-[10px] text-[#C0392B] mt-0.5 font-medium">{pincodeError}</p>
                    )}
                  </div>

                  {stateName && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                        State
                      </label>
                      <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          onFocus={() => setStateNameFocused(true)}
                          onBlur={() => setStateNameFocused(false)}
                          placeholder="State"
                          className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                          required
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: stateNameFocused ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                        />
                      </div>
                    </div>
                  )}

                  {district && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                        Zila (District)
                      </label>
                      <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          onFocus={() => setDistrictFocused(true)}
                          onBlur={() => setDistrictFocused(false)}
                          placeholder="District"
                          className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                          required
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: districtFocused ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                      Ward / Area (optional)
                    </label>

                    <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                      <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        onFocus={() => setWardFocused(true)}
                        onBlur={() => setWardFocused(false)}
                        placeholder="e.g. Ward 12"
                        className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: wardFocused ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                      Area / Mohalla
                    </label>

                    <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        onFocus={() => setAreaFocused(true)}
                        onBlur={() => setAreaFocused(false)}
                        placeholder="e.g. Model Town"
                        className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                        required
                      />
                      <MapPin className="absolute right-2 text-[#607068]" size={15} />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: areaFocused ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                      City / Town
                    </label>

                    <div className="relative border-b border-[#E8EDEA] pb-1 flex items-center">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onFocus={() => setCityFocused(true)}
                        onBlur={() => setCityFocused(false)}
                        placeholder="e.g. Ludhiana"
                        className="w-full bg-transparent pr-8 py-1.5 focus:outline-none text-sm font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                        required
                      />
                      <MapPin className="absolute right-2 text-[#607068]" size={15} />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: cityFocused ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                  </div>

                  {(city || district || stateName) && (
                    <div className="bg-[#E1F5EE] border border-[#5DC9A1] rounded-[16px] p-3.5 flex items-start gap-2.5 mt-2">
                      <span className="text-base mt-0.5">📍</span>
                      <div>
                        <p className="text-[11px] font-bold text-[#0A3D24] mb-0.5 uppercase tracking-wide">
                          Aapka area:
                        </p>
                        <p className="text-xs font-semibold text-[#085041] leading-tight">
                          {[ward, city, district, stateName, pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!lockoutState?.locked && (
              <button
                type="submit"
                disabled={loading || successOtp}
                className="w-full bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] hover:opacity-95 text-[#FDFFFE] font-bold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(15,92,58,0.15)] active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {loading ? 'Verify kar rahe hain...' : 'Verify & Sign In'}
              </button>
            )}

            {!lockoutState && error && (error.includes('मौका') || error.includes('attempt')) && (
              <div
                className="rounded-xl p-3 text-xs text-center my-3 font-semibold"
                style={{
                  background: '#FDF0E6',
                  border: '0.5px solid #F0C070',
                  color: '#854F0B',
                  fontFamily: 'Mukta, sans-serif',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtpArray(['', '', '', '', '', ''])
                setIsNewUser(false)
                setDevOtpMessage('')
                setDevOtp('')
                setSuccessOtp(false)
                setLockoutState(null)
                setError('')
              }}
              className="w-full text-center text-xs font-bold text-[#1D9E75] hover:underline pt-1"
            >
              Email address badlein
            </button>
          </form>
        )}
      </motion.div>

      <div className="text-center mt-6 text-[10px] text-[#607068] font-bold uppercase tracking-wider">
        Made with trust for India 🇮🇳
      </div>
    </div>
  )
}

export default SignIn
export { scaleIn, slideUp, fadeIn }
