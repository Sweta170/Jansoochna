import React, { useEffect, useState, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, MapPin, Award } from 'lucide-react'
import BottomNav from './BottomNav'
import JanBot from '../JanBot'
import { pincodeMap } from '../../utils/pincodeMap'
import { AnimatePresence, motion } from 'framer-motion'
import { pageVariants } from '../../lib/motionVariants'
import api from '../../services/api'

// Quick helper to lookup pincode name on client
const getClientPincodeName = (pincode) => {
  return pincodeMap[pincode] || `Ward (${pincode})`
}

const AppShell = () => {
  const { user, logout, loading, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const mainRef = useRef(null)

  // Profile completion form states
  const [completeName, setCompleteName] = useState(user?.name || '')
  const [completePincode, setCompletePincode] = useState(user?.pincode === '000000' ? '' : (user?.pincode || ''))
  const [completeArea, setCompleteArea] = useState(user?.area || '')
  const [completeCity, setCompleteCity] = useState(user?.city || '')
  const [completeState, setCompleteState] = useState(user?.state || 'Punjab')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (user) {
      setCompleteName(user.name || '')
      setCompletePincode(user.pincode === '000000' ? '' : (user.pincode || ''))
      setCompleteArea(user.area || '')
      setCompleteCity(user.city || '')
      setCompleteState(user.state || 'Punjab')
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin')
    }
  }, [user, loading, navigate])

  const handleCompleteProfileSubmit = async (e) => {
    e.preventDefault()
    if (!completeName.trim() || !/^\d{6}$/.test(completePincode) || !completeArea.trim() || !completeCity.trim() || !completeState.trim()) {
      setSubmitError('Kripya sabhi fields sahi se enter karein.')
      return
    }
    setSubmitLoading(true)
    setSubmitError('')
    try {
      const { data } = await api.put('/user/profile', {
        name: completeName,
        pincode: completePincode,
        area: completeArea,
        city: completeCity,
        state: completeState
      })
      updateUserProfile(data)
    } catch (err) {
      console.error(err)
      setSubmitError(err.response?.data?.error || 'Profile update karne mein dikkat aayi.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleScroll = (e) => {
    if (e.target.scrollTop > 15) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F4F7F5] max-w-md mx-auto border-x border-[#E8EDEA]">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            🔥
          </div>
        </div>
        <p className="mt-4 text-[#607068] text-xs font-semibold tracking-wider font-mukta">JanSoochna load ho raha hai...</p>
      </div>
    )
  }

  if (!user) return null

  // Block access to Mohalla features if profile is incomplete
  const isProfileIncomplete = !user.pincode || user.pincode === '000000' || !user.area || !user.city || !user.state

  if (isProfileIncomplete) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-[#E1F5EE] to-[#FDFFFE] max-w-md mx-auto px-6 relative shadow-2xl border-x border-[#E8EDEA] overflow-y-auto pb-12 pt-8 font-mukta">
        <div className="flex flex-col justify-center items-center w-full mb-6">
          <div className="text-[#1D9E75] flex items-center mb-2 animate-bounce">
            <svg className="w-12 h-12 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C12 2 7 9 7 13C7 15.7614 9.23858 18 12 18C14.7614 18 17 15.7614 17 13C17 9 12 2 12 2Z" fill="currentColor" />
              <path d="M12 6C12 6 9.5 10 9.5 12.5C9.5 13.8807 10.6193 15 12 15C13.3807 15 14.5 13.8807 14.5 12.5C14.5 10 12 6 12 6Z" fill="#FDFFFE" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F5C3A] font-display text-center leading-none">
            Profile Complete Karein
          </h1>
          <p className="text-xs font-semibold text-[#E07B2A] font-accent italic text-center mt-2">
            Apne Mohalla Board, Neta Scorecard aur issues features access karne ke liye kripya yeh information fill karein.
          </p>
        </div>

        <form onSubmit={handleCompleteProfileSubmit} className="bg-[#FDFFFE] rounded-[24px] p-6 shadow-card border border-[#E8EDEA] space-y-4">
          <h2 className="text-sm font-bold text-[#0F5C3A] font-display uppercase tracking-wider text-center border-b border-[#E8EDEA] pb-2">
            Mandatory details
          </h2>

          {submitError && (
            <div className="bg-[#FDECEA] text-[#C0392B] border border-[#C0392B] border-opacity-15 rounded-xl p-3 text-xs flex items-center gap-2 justify-center font-semibold">
              <span>{submitError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
              Apna Naam
            </label>
            <input
              type="text"
              value={completeName}
              onChange={(e) => setCompleteName(e.target.value)}
              placeholder="Name likhein"
              className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D1B12] focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
              6-Digit Pincode
            </label>
            <input
              type="text"
              maxLength={6}
              value={completePincode}
              onChange={(e) => setCompletePincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 141001"
              className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D1B12] focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
              Area / Mohalla / Colony
            </label>
            <input
              type="text"
              value={completeArea}
              onChange={(e) => setCompleteArea(e.target.value)}
              placeholder="e.g. Model Town"
              className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D1B12] focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
              City / Town
            </label>
            <input
              type="text"
              value={completeCity}
              onChange={(e) => setCompleteCity(e.target.value)}
              placeholder="e.g. Ludhiana"
              className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D1B12] focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
              State
            </label>
            <select
              value={completeState}
              onChange={(e) => setCompleteState(e.target.value)}
              className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D1B12] focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
              required
            >
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Delhi">Delhi</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jammu & Kashmir">Jammu & Kashmir</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] hover:opacity-95 text-[#FDFFFE] font-bold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(15,92,58,0.15)] active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider mt-2"
          >
            {submitLoading ? 'Save kar rahe hain...' : 'Save & Enter Mohalla'}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-xs font-bold text-[#C0392B] hover:underline pt-1"
          >
            Logout
          </button>
        </form>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FDFFFE] shadow-2xl relative overflow-hidden border-x border-[#E8EDEA]">
      {/* Top Header Bar */}
      <header
        className={`bg-[#FDFFFE] border-b border-[#E8EDEA] px-4 flex items-center justify-between z-40 transition-all duration-300 ${
          scrolled ? 'h-11 shadow-sm' : 'h-[52px]'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Animated Diya logo */}
          <div className="text-[#1D9E75] flex items-center">
            <svg className="w-5 h-5 diya-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C12 2 7 9 7 13C7 15.7614 9.23858 18 12 18C14.7614 18 17 15.7614 17 13C17 9 12 2 12 2Z" fill="currentColor" />
              <path d="M12 6C12 6 9.5 10 9.5 12.5C9.5 13.8807 10.6193 15 12 15C13.3807 15 14.5 13.8807 14.5 12.5C14.5 10 12 6 12 6Z" fill="#FDFFFE" />
            </svg>
          </div>
          <Link to="/app" className="text-lg font-extrabold text-[#0F5C3A] font-display leading-none">
            JanSoochna
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Pincode with live pulsing green dot */}
          <div className="flex items-center gap-1.5 bg-[#E1F5EE] px-2 py-0.5 rounded-full border border-[#1D9E75] border-opacity-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] live-dot"></span>
            <span className="text-[10px] font-bold text-[#0F5C3A] leading-none uppercase tracking-wide">
              {user.area && user.city ? `${user.area} (${user.city})` : getClientPincodeName(user.pincode)}
            </span>
          </div>

          {/* User Points Badge */}
          <Link
            to="/profile"
            className="flex items-center gap-1 bg-[#FDF0E6] px-2 py-0.5 rounded-full border border-[#E07B2A] border-opacity-20 hover:bg-opacity-80 transition-all text-[10px] font-bold text-[#E07B2A]"
          >
            <Award size={11} />
            <span>{user.points} pts</span>
          </Link>

          {/* Quick Logout */}
          <button
            onClick={() => {
              logout()
              navigate('/signin')
            }}
            className="p-1 rounded-full text-[#607068] hover:text-[#0F5C3A] transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-20 bg-[#F4F7F5] focus:outline-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating JanBot AI Assistant */}
      <JanBot />

      {/* Persistent Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default AppShell
export { getClientPincodeName }
