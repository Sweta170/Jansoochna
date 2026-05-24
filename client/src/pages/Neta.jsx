import React, { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Phone, Calendar, Landmark, CheckSquare, Share2, Award } from 'lucide-react'
import html2canvas from 'html2canvas'
import { motion } from 'framer-motion'
import { fadeIn, scaleIn, staggerContainer } from '../lib/motionVariants'

const Neta = () => {
  const { user } = useAuth()
  const [neta, setNeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sharing, setSharing] = useState(false)

  const cardRef = useRef(null)

  useEffect(() => {
    const fetchNetaData = async () => {
      try {
        const response = await api.get(`/neta?pincode=${user?.pincode || '141001'}`)
        setNeta(response.data)
      } catch (err) {
        console.error(err)
        setError('Politician data load karne mein problem aayi.')
      } finally {
        setLoading(false)
      }
    }
    fetchNetaData()
  }, [user?.pincode])

  const handleShareScreenshot = async () => {
    if (!cardRef.current || sharing) return

    setSharing(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#FDFFFE'
      })
      const imgData = canvas.toDataURL('image/png')
      
      const link = document.createElement('a')
      link.download = `Neta_ReportCard_${neta?.name.replace(/\s+/g, '_')}.png`
      link.href = imgData
      link.click()
    } catch (err) {
      console.error('Screenshot failed:', err)
    } finally {
      setSharing(false)
    }
  }

  const handleContactWhatsApp = () => {
    if (!neta) return
    const plainPhone = neta.contact.phone.replace(/\D/g, '')
    const msg = `Namaskar ${neta.name} ji,\n\n` +
      `Hum aapke constituency (Ward: ${neta.ward}) ke nagarik hain.\n` +
      `JanSoochna app ke report card ke anusar hum aapka performance track kar rahe hain.\n\n` +
      `Dhanyavaad.`

    window.open(`https://wa.me/91${plainPhone}?text=${encodeURIComponent(msg)}`)
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-[70vh]">
        <div className="w-6 h-6 border-3 border-[#1D9E75] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-[#607068] mt-2 font-extrabold uppercase tracking-wide">Politician data loading...</p>
      </div>
    )
  }

  if (error || !neta) {
    return (
      <div className="p-4 text-center">
        <div className="bg-[#FDECEA] text-[#C0392B] p-4 rounded-2xl border border-[#C0392B] border-opacity-15 text-xs font-bold">
          {error || 'Politician not found'}
        </div>
      </div>
    )
  }

  const attendancePercent = Math.round((neta.attendance.attended / neta.attendance.meetings) * 100)
  const spentPercent = Math.round((neta.funds.spent / neta.funds.allocated) * 100)

  return (
    <div className="p-4 space-y-4 pb-20">
      
      <div className="space-y-0.5">
        <h1 className="text-xl font-extrabold text-[#0F5C3A] font-display leading-none">
          Neta Report Card
        </h1>
        <p className="text-[10px] font-bold text-[#607068] uppercase tracking-wider">आपके जन-प्रतिनिधि का हिसाब</p>
      </div>

      {/* Main Report Card Wrapper */}
      <div
        ref={cardRef}
        className="bg-[#FDFFFE] rounded-[24px] border border-[#E8EDEA] p-5 shadow-card space-y-5 relative overflow-hidden"
      >
        {/* Neta Header */}
        <div className="flex items-center justify-between border-b border-[#E8EDEA] border-dashed pb-4">
          <div className="space-y-1">
            <span className="bg-[#0F5C3A] text-[#FDFFFE] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              {neta.party}
            </span>
            <h2 className="text-lg font-bold text-[#0F5C3A] leading-tight font-display">
              {neta.name}
            </h2>
            <p className="text-[10px] text-[#607068] font-extrabold uppercase tracking-wide">
              {neta.designation} • {neta.ward}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center font-bold text-[#0F5C3A] text-lg border border-[#1D9E75] border-opacity-15 shadow-sm">
            🧑‍💼
          </div>
        </div>

        {/* Dynamic Circular Attendance Progress SVG */}
        <div className="grid grid-cols-2 gap-3">
          
          <div className="bg-[#F4F7F5] rounded-2xl p-3 border border-[#E8EDEA] flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-[9px] font-extrabold text-[#607068] uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} className="text-[#1D9E75]" /> Attendance
            </span>
            
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-[#E8EDEA]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Main Progress Ring */}
                <motion.path
                  className="text-[#1D9E75]"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - attendancePercent }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Value inside SVG */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-extrabold text-[#0F5C3A]">{attendancePercent}%</span>
              </div>
            </div>

            <span className="text-[9px] text-[#607068] font-bold">
              {neta.attendance.attended}/{neta.attendance.meetings} Sabhas
            </span>
          </div>

          {/* Vikas Fund details */}
          <div className="bg-[#F4F7F5] rounded-2xl p-3 border border-[#E8EDEA] flex flex-col justify-between text-center space-y-2">
            <span className="text-[9px] font-extrabold text-[#607068] uppercase tracking-wider flex items-center justify-center gap-1">
              <Landmark size={11} className="text-[#1D9E75]" /> Vikas Fund
            </span>

            <div className="space-y-0.5">
              <span className="text-lg font-extrabold text-[#0F5C3A] font-display">
                ₹{neta.funds.spent}L
              </span>
              <span className="text-[9px] text-[#607068] font-bold block">
                Spent of ₹{neta.funds.allocated}L ({spentPercent}%)
              </span>
            </div>

            {/* Spent bar indicator */}
            <div className="w-full bg-[#E8EDEA] h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#1D9E75] to-[#E07B2A] h-full"
                initial={{ width: 0 }}
                animate={{ width: `${spentPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>

        </div>

        {/* Promises checklist with staggered bounce loads */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide flex items-center gap-1">
            <CheckSquare size={12} className="text-[#1D9E75]" /> Chunavi Vaade Status (चुनावी वादे):
          </span>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-1.5"
          >
            {neta.promises.map((promise, idx) => {
              let statusLabel = 'नहीं हुआ'
              let statusColor = 'bg-[#FDECEA] text-[#C0392B] border-[#C0392B]'
              let statusEmoji = '❌'

              if (promise.status === 'done') {
                statusLabel = 'पूरा हुआ'
                statusColor = 'bg-[#E1F5EE] text-[#0F5C3A] border-[#1D9E75]'
                statusEmoji = '✅'
              } else if (promise.status === 'partial') {
                statusLabel = 'आंशिक'
                statusColor = 'bg-[#FDF0E6] text-[#E07B2A] border-[#E07B2A]'
                statusEmoji = '🔶'
              }

              return (
                <motion.div
                  key={idx}
                  variants={scaleIn}
                  className="bg-[#F4F7F5] p-2.5 rounded-xl border border-[#E8EDEA] flex items-center justify-between text-xs font-semibold"
                >
                  <span className="text-[#2D3A32]">{promise.text}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-opacity-15 text-[10px] font-bold ${statusColor}`}>
                    <span>{statusEmoji}</span>
                    <span>{statusLabel}</span>
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Ward Projects status list */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">Ongoing Projects:</span>
          <div className="space-y-1.5">
            {neta.funds.projects.map((p, idx) => (
              <div key={idx} className="flex justify-between text-xs font-bold text-[#607068] bg-[#FDFFFE] border border-[#E8EDEA] p-2 rounded-xl">
                <span>• {p.name}</span>
                <span className={p.status === 'complete' ? 'text-[#0F5C3A] font-extrabold' : p.status === 'stalled' ? 'text-[#C0392B] font-extrabold' : 'text-[#E07B2A] font-extrabold'}>
                  {p.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact address */}
        <div className="text-[9px] font-bold text-[#607068] border-t border-[#E8EDEA] pt-3 uppercase tracking-wide">
          <span className="block">Office Address:</span>
          <span className="text-[#0D1B12] normal-case leading-relaxed">{neta.contact.office}</span>
        </div>

      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleShareScreenshot}
          disabled={sharing}
          className="bg-[#FDFFFE] hover:bg-[#F4F7F5] text-[#1D9E75] border border-[#1D9E75] font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow transition-colors disabled:opacity-50 uppercase tracking-wide"
        >
          <Share2 size={13} />
          <span>{sharing ? 'Saving...' : 'Share Report'}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleContactWhatsApp}
          className="bg-[#25D366] hover:bg-[#128C7E] text-[#FDFFFE] font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow transition-colors uppercase tracking-wide"
        >
          <Phone size={13} />
          <span>Sampark Karein</span>
        </motion.button>
      </div>

    </div>
  )
}

export default Neta
export { Neta }
