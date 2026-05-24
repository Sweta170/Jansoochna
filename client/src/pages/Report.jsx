import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Camera, MapPin, Sparkles, ArrowLeft, Loader2, Check } from 'lucide-react'
import { greenIcon } from '../components/OfficeLocator'
import { motion, AnimatePresence } from 'framer-motion'
import { slideUp, scaleIn, fadeIn } from '../lib/motionVariants'
import confetti from 'canvas-confetti'

const CATEGORIES = [
  { id: 'road', label: 'खराब सड़क (Road)', emoji: '🛣️' },
  { id: 'water', label: 'पानी (Water Supply)', emoji: '💧' },
  { id: 'electricity', label: 'बिजली (Electricity)', emoji: '⚡' },
  { id: 'garbage', label: 'कूड़ा-कचरा (Garbage)', emoji: '🧹' },
  { id: 'other', label: 'अन्य (Other)', emoji: '⚠️' }
]

// Draggable Map Events listener
const DraggableMapMarker = ({ position, setPosition, setAddressDetails, userPincode }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    }
  })

  const markerRef = useRef(null)

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const latLng = marker.getLatLng()
          setPosition([latLng.lat, latLng.lng])
        }
      },
    }),
    [setPosition]
  )

  // Reverse geocoding on position change
  useEffect(() => {
    const reverseGeocode = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
        const response = await fetch(url, {
          headers: { 'User-Agent': 'JanSoochna-App-Reporting' }
        })
        const data = await response.json()
        
        if (data) {
          const address = data.display_name
          setAddressDetails({ address, pincode: userPincode })
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err)
      }
    }
    reverseGeocode()
  }, [position, setAddressDetails, userPincode])

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={greenIcon}
    />
  )
}

const Report = () => {
  const { user, updateUserProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Category, 2: Form text, 3: Photo upload, 4: GPS Map, 5: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields state
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoBase64, setPhotoBase64] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [position, setPosition] = useState([30.9010, 75.8573]) // Default Ludhiana
  const [addressDetails, setAddressDetails] = useState({ address: '', pincode: user?.pincode || '' })

  useEffect(() => {
    if (user?.pincode && !addressDetails.pincode) {
      setAddressDetails(prev => ({ ...prev, pincode: user.pincode }))
    }
  }, [user?.pincode])
  
  const [gpsLoading, setGpsLoading] = useState(false)
  
  // Custom states
  const [titleFocused, setTitleFocused] = useState(false)
  const [descFocused, setDescFocused] = useState(false)

  // GPS geolocation setup
  useEffect(() => {
    if (step === 4) {
      setGpsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
          setGpsLoading(false)
        },
        (err) => {
          console.warn('Geolocation denied or failed. Using default.', err)
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [step])

  // Localized confetti pop on success mount
  useEffect(() => {
    if (step === 5) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      })
    }
  }, [step])

  // Canvas Image Compression helper
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    setPhotoPreview(URL.createObjectURL(file))

    // Compress
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max_width = 800
        let width = img.width
        let height = img.height

        if (width > max_width) {
          height = Math.round((height * max_width) / width)
          width = max_width
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        setPhotoBase64(compressedBase64)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!category || !title || !description || !addressDetails.pincode) {
      setError('Form parameters complete karein.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/issues', {
        title,
        description,
        category,
        lat: position[0],
        lng: position[1],
        pincode: addressDetails.pincode,
        address: addressDetails.address,
        photoBase64: photoBase64 || undefined
      })

      // Award points (20 points for reporting)
      if (response.data.pointResult && response.data.pointResult.points !== undefined) {
        updateUserProfile({ points: response.data.pointResult.points })
      }

      setStep(5) // Move to success page
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Issue report karne mein problem aayi.')
      setLoading(false)
    }
  }

  return (
    <div className="p-5 min-h-[85vh] flex flex-col justify-between relative overflow-hidden pb-20">
      
      {/* Header back */}
      {step < 5 && (
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/issues')}
            className="p-1.5 hover:bg-[#E8EDEA] rounded-full text-[#607068]"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
            Step {step} of 4 — Report Issue
          </span>
        </div>
      )}

      {error && (
        <div className="bg-[#FDECEA] text-[#C0392B] p-3 rounded-2xl border border-[#C0392B] border-opacity-10 text-xs font-bold text-center mb-4">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Category */}
        {step === 1 && (
          <motion.div
            key="cat"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 flex-1"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0F5C3A] font-display leading-none">Shikayat ki category chunein</h2>
              <p className="text-xs text-[#607068] font-medium">Select the type of civic problem in your area</p>
            </div>

            <div className="grid gap-2.5 pt-4">
              {CATEGORIES.map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  onClick={() => {
                    setCategory(cat.id)
                    setStep(2)
                  }}
                  className="bg-[#FDFFFE] hover:bg-[#E1F5EE] border border-[#E8EDEA] hover:border-[#1D9E75] p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all text-left font-bold"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-[#0F5C3A] text-sm">{cat.label}</span>
                  </div>
                  <span className="text-[#1D9E75] text-lg font-bold">➔</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Title and Description */}
        {step === 2 && (
          <motion.div
            key="details"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 flex-1"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#0F5C3A] font-display">Samasya ka vivaran likhein</h2>
              <p className="text-xs text-[#607068] font-medium">Write issue title and details</p>
            </div>

            <div className="space-y-4 pt-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                  Issue Title (Short)
                </label>
                <div className="relative border border-[#E8EDEA] rounded-xl p-2.5 bg-[#F4F7F5]">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={() => setTitleFocused(false)}
                    placeholder="e.g. Sector 7 road main potholes hai"
                    className="w-full bg-transparent border-none focus:outline-none text-xs font-bold text-[#0D1B12] placeholder-[#A8B5AD]"
                    required
                  />
                  <motion.div
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1D9E75] rounded-b-xl"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: titleFocused ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                  <label>Description (Kam se kam 30 letters)</label>
                  <span className={description.length < 30 ? 'text-[#C0392B]' : 'text-[#1D9E75]'}>
                    {description.length} letters
                  </span>
                </div>
                <div className="relative border border-[#E8EDEA] rounded-2xl p-3 bg-[#F4F7F5]">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setDescFocused(true)}
                    onBlur={() => setDescFocused(false)}
                    placeholder="Sadak tooti hui hai, accident ka khatra bana rehta hai..."
                    rows={5}
                    className="w-full bg-transparent border-none focus:outline-none text-xs font-semibold text-[#0D1B12] placeholder-[#A8B5AD] resize-none"
                    required
                  ></textarea>
                  <motion.div
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1D9E75] rounded-b-2xl"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: descFocused ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!title.trim() || description.length < 30}
              className="w-full bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] text-[#FDFFFE] font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-4 text-xs uppercase tracking-wider"
            >
              Aage Badhein
            </button>
          </motion.div>
        )}

        {/* STEP 3: Photo (optional) */}
        {step === 3 && (
          <motion.div
            key="photo"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 flex-1"
          >
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-[#0F5C3A] font-display">Photo upload (Optional)</h2>
              <p className="text-xs text-[#607068] font-medium">Take a picture of the issue from your mobile camera</p>
            </div>

            <div className="flex flex-col items-center justify-center pt-6 space-y-4">
              <AnimatePresence mode="wait">
                {photoPreview ? (
                  <motion.div
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full max-w-[280px] h-48 rounded-2xl overflow-hidden border-2 border-[#1D9E75] relative shadow-md"
                  >
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setPhotoPreview('')
                        setPhotoBase64('')
                      }}
                      className="absolute right-2 top-2 bg-[#0D1B12] bg-opacity-70 text-[#FDFFFE] p-1.5 rounded-full hover:bg-opacity-95 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </motion.div>
                ) : (
                  <motion.label
                    variants={fadeIn}
                    className="w-full max-w-[280px] h-48 rounded-2xl border-2 border-dashed border-[#A8B5AD] bg-[#FDFFFE] hover:border-[#1D9E75] flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center"
                  >
                    <Camera size={38} className="text-[#607068] mb-2" />
                    <span className="text-xs font-bold text-[#0D1B12]">Camera se photo kheenchein</span>
                    <span className="text-[9px] text-[#607068] mt-1 font-bold uppercase tracking-wider">(Tap to capture/upload)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </motion.label>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-[#FDFFFE] hover:bg-[#F4F7F5] text-[#1D9E75] border border-[#1D9E75] font-extrabold py-3.5 rounded-xl transition-all active:scale-95 text-xs uppercase"
              >
                Skip Karein
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!photoBase64}
                className="flex-1 bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] text-[#FDFFFE] font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                Aage Badhein
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Geolocation Pin drop */}
        {step === 4 && (
          <motion.div
            key="location"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 flex-1 flex flex-col"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#0F5C3A] font-display">Location verify karein</h2>
              <p className="text-xs text-[#607068] font-medium">Drag the pin to mark the exact spot of the problem</p>
            </div>

            {/* Draggable Map with spring drop effects */}
            <div className="h-52 w-full rounded-[24px] overflow-hidden border border-[#E8EDEA] shadow-card relative my-1 z-10">
              {gpsLoading && (
                <div className="absolute inset-0 bg-[#FDFFFE] bg-opacity-70 flex flex-col items-center justify-center z-20">
                  <Loader2 className="animate-spin text-[#1D9E75] mb-1" size={24} />
                  <span className="text-[10px] font-bold text-[#607068] uppercase tracking-wide">Finding GPS location...</span>
                </div>
              )}
              <MapContainer
                center={position}
                zoom={15}
                zoomControl={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMapMarker
                  position={position}
                  setPosition={setPosition}
                  setAddressDetails={setAddressDetails}
                  userPincode={user?.pincode}
                />
              </MapContainer>
            </div>

            {/* Autocompleted address display */}
            <div className="bg-[#F4F7F5] p-3.5 rounded-2xl border border-[#E8EDEA] space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#607068] font-bold uppercase text-[9px] tracking-wide">Pincode:</span>
                <span className="font-extrabold text-[#0F5C3A] text-xs px-1">
                  {user?.pincode || 'Not Set'} (Registered)
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#E8EDEA] border-dashed">
                <span className="text-[#607068] font-bold uppercase text-[9px] tracking-wide block">Address:</span>
                <span className="font-semibold text-[#0D1B12] leading-relaxed block text-[11px]">{addressDetails.address || 'Locating pin address...'}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !addressDetails.pincode}
              className="w-full bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] text-[#FDFFFE] font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Publish ho raha hai...</span>
                </>
              ) : (
                <span>Report Publish Karein</span>
              )}
            </button>
          </motion.div>
        )}

        {/* STEP 5: Success screen (takeover) */}
        {step === 5 && (
          <motion.div
            key="success"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            className="space-y-6 text-center py-8 flex-1 flex flex-col justify-center items-center relative"
          >
            {/* Draw checkmark circle */}
            <div className="w-20 h-20 bg-[#E1F5EE] text-[#1D9E75] rounded-full flex items-center justify-center shadow-lg border border-[#1D9E75] border-opacity-15 relative overflow-hidden">
              <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="4">
                <motion.path
                  d="M14 27l8 8 16-16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                />
              </svg>
            </div>

            {/* Golden points and stars trails flying upwards */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 80, x: (i - 2.5) * 35, opacity: 0, scale: 0.4 }}
                animate={{ y: -160, opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 0.6] }}
                transition={{ duration: 1.8, delay: i * 0.15, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
                className="absolute text-[#E07B2A] font-extrabold text-[10px] bg-[#FDF0E6] px-2 py-0.5 rounded-full border border-[#E07B2A] border-opacity-15 shadow-sm"
              >
                ✨ +20 pts
              </motion.div>
            ))}

            <div className="space-y-2 z-10 pt-4">
              <h2 className="text-2xl font-extrabold text-[#0F5C3A] font-display leading-snug">
                शुक्रिया! आपने अपनी आवाज़ उठाई 🙌
              </h2>
              <p className="text-xs text-[#607068] leading-relaxed max-w-xs mx-auto font-medium">
                Aapki shikayat safaltapoorvak publish ho gayi hai aur aapko 20 Sewak points mil gaye hain!
              </p>
            </div>

            <div className="bg-[#E1F5EE] border border-[#1D9E75] border-opacity-15 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#0F5C3A] shadow-sm z-10">
              <Sparkles size={14} className="text-[#C9A227] animate-pulse" />
              <span>+20 points added to profile</span>
            </div>

            <button
              onClick={() => navigate('/issues')}
              className="bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] text-[#FDFFFE] font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 mt-6 text-xs uppercase tracking-wider z-10"
            >
              Issues Board dekhein
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Report
export { DraggableMapMarker }
