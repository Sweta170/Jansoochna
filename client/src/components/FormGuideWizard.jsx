import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Share2, PhoneCall, AlertTriangle, FileText, X, ChevronRight, ChevronLeft } from 'lucide-react'
import OfficeLocator from './OfficeLocator'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { slideUp, scaleIn, fadeIn } from '../lib/motionVariants'

const FormGuideWizard = ({ entry }) => {
  const { user, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1 to 4
  const [checkedDocs, setCheckedDocs] = useState({})
  
  // Correction Flagging Modal state
  const [isFlagOpen, setIsFlagOpen] = useState(false)
  const [flagField, setFlagField] = useState('documents')
  const [flagCorrection, setFlagCorrection] = useState('')
  const [flagLoading, setFlagLoading] = useState(false)
  const [flagSuccess, setFlagSuccess] = useState('')

  const handleDocToggle = (docName) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }))
  }

  const docCount = entry.documents.length
  const checkedCount = Object.values(checkedDocs).filter(Boolean).length
  const progressPercent = docCount > 0 ? Math.round((checkedCount / docCount) * 100) : 0

  // Flag/Correction submit handler
  const handleFlagSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!flagCorrection.trim()) return

    setFlagLoading(true)
    setFlagSuccess('')

    try {
      const response = await api.post('/form-guide/flag', {
        entryId: entry.id,
        field: flagField,
        correction: flagCorrection
      })
      
      setFlagSuccess('शुक्रिया! आपकी सुधार रिपोर्ट दर्ज हो गई है और आपको 15 points मिल गए हैं! 🙌')
      setFlagCorrection('')
      
      // Update points in auth context
      if (response.data.pointResult && response.data.pointResult.points !== undefined) {
        updateUserProfile({ points: response.data.pointResult.points })
      }
      
      setTimeout(() => {
        setIsFlagOpen(false)
        setFlagSuccess('')
      }, 3000)
    } catch (err) {
      console.error(err)
      setFlagSuccess('Error: Submitting correction failed.')
    } finally {
      setFlagLoading(false)
    }
  }

  // WhatsApp share builder
  const handleWhatsAppShare = () => {
    const msg = `JanSoochna se mila guide 📋\n\n` +
      `*${entry.nameHindi}* ke liye ye documents chahiye:\n` +
      entry.documents.map(d => `• ${d.nameHindi} (${d.note || 'Original'})`).join('\n') +
      `\n\nOffice: ${entry.office.type}\n` +
      `Samay: ${entry.office.hours}\n` +
      `Fees: ${entry.fees}\n\n` +
      `App download: https://jansoochna.in`

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
  }

  return (
    <div className="bg-[#FDFFFE] rounded-[24px] border border-[#E8EDEA] shadow-card overflow-hidden flex flex-col min-h-[70vh] relative">
      
      {/* Wizard Progress Header */}
      <div className="bg-[#E1F5EE] px-4 py-3 flex items-center justify-between border-b border-[#E8EDEA] relative z-10">
        <div className="flex items-center gap-2">
          <span className="bg-[#0F5C3A] text-[#FDFFFE] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
            {step}
          </span>
          <span className="text-[10px] font-extrabold text-[#0F5C3A] uppercase tracking-wide">
            Step {step} of 4
          </span>
        </div>
        
        {/* Completed Line Tracker drawing left to right */}
        <div className="w-24 bg-[#E8EDEA] h-1.5 rounded-full overflow-hidden relative">
          <motion.div
            className="bg-[#1D9E75] h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          />
        </div>
      </div>

      {/* Wizard Step Content - with slide transitions */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="overflow-x-hidden relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="space-y-4 flex-1"
            >
              
              {/* STEP 1: Confirmation */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-center space-y-2 py-2">
                    <span className="text-4xl inline-block p-4 bg-[#E1F5EE] rounded-full mb-1">
                      {entry.categoryIcon || '📄'}
                    </span>
                    <h2 className="text-lg font-bold text-[#0F5C3A] font-display leading-snug">
                      क्या आप *{entry.nameHindi}* बनवाना चाहते हैं?
                    </h2>
                    <p className="text-[11px] text-[#607068] font-bold uppercase tracking-wider">
                      (Process to obtain: {entry.name})
                    </p>
                  </div>

                  <div className="bg-[#F4F7F5] p-4 rounded-2xl border border-[#E8EDEA] space-y-2">
                    <p className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wider">
                      Required Documents Checklist:
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {entry.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-[#2D3A32]">
                          <span className="text-[#1D9E75]">✓</span>
                          <div>
                            <p className="leading-tight">{doc.nameHindi}</p>
                            <p className="text-[9px] text-[#607068] font-medium">{doc.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Checklist */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E8EDEA] pb-1">
                    <h3 className="font-extrabold text-sm text-[#0F5C3A] font-display">
                      Documents Checklist (दस्तावेज़ सूची)
                    </h3>
                    <p className="text-[9px] text-[#607068] font-medium">तैयार कागज़ात पर टिक करें</p>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                    {entry.documents.map((doc, idx) => {
                      const isChecked = !!checkedDocs[doc.nameHindi]
                      return (
                        <motion.div
                          key={idx}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDocToggle(doc.nameHindi)}
                          className={`border rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                            isChecked
                              ? 'bg-[#E1F5EE] border-[#1D9E75]'
                              : 'bg-[#FDFFFE] border-[#E8EDEA] hover:border-[#1D9E75]'
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-xs text-[#0D1B12] leading-tight">{doc.nameHindi}</p>
                            <p className="text-[9px] text-[#607068] font-bold uppercase tracking-wider mt-0.5">{doc.name}</p>
                            {doc.note && (
                              <p className="text-[9px] text-[#E07B2A] font-extrabold mt-1">⚠️ {doc.note}</p>
                            )}
                          </div>
                          
                          {/* Custom SVG tick checkmark with draw animation */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#1D9E75] border-[#1D9E75] text-[#FDFFFE]'
                              : 'border-[#A8B5AD]'
                          }`}>
                            <AnimatePresence>
                              {isChecked && (
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                  <motion.path
                                    d="M5 13l4 4L19 7"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    exit={{ pathLength: 0 }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                  />
                                </svg>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Checklist progress springs */}
                  <div className="bg-[#F4F7F5] p-3 rounded-2xl border border-[#E8EDEA] flex items-center justify-between text-[11px] font-bold text-[#607068]">
                    <span>Progress:</span>
                    <span className="text-[#0F5C3A]">{checkedCount} of {docCount} files ({progressPercent}%)</span>
                  </div>

                  <button
                    onClick={() => setIsFlagOpen(true)}
                    className="w-full text-center text-[10px] font-bold text-[#C0392B] hover:underline block pt-1"
                  >
                    🚩 Report/Flag: checklist galat ya purani hai?
                  </button>
                </div>
              )}

              {/* STEP 3: Office details */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-[#0F5C3A] font-display border-b border-[#E8EDEA] pb-1">
                    कहाँ जाना है? (Office details)
                  </h3>

                  <div className="bg-[#F4F7F5] border border-[#E8EDEA] p-4 rounded-2xl space-y-2 text-xs shadow-sm">
                    <div>
                      <span className="text-[9px] text-[#607068] uppercase font-extrabold block">Official Center:</span>
                      <p className="font-bold text-sm text-[#0F5C3A]">{entry.office.typeHindi}</p>
                      <p className="text-[10px] text-[#607068] font-bold uppercase tracking-wider">{entry.office.type}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8EDEA] border-dashed text-[10px] font-bold">
                      <div>
                        <span className="text-[#607068] block">Counter No:</span>
                        <span className="text-[#0D1B12]">{entry.office.counter}</span>
                      </div>
                      <div>
                        <span className="text-[#607068] block">Timings:</span>
                        <span className="text-[#0D1B12]">{entry.office.hours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Locator map */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#607068] uppercase font-extrabold flex items-center gap-1">
                      📍 Map locate pointer:
                    </span>
                    <OfficeLocator officeName={entry.office.type} pincode={user?.pincode || '141001'} />
                  </div>

                  {entry.office.onlineAvailable && entry.office.onlineUrl && (
                    <a
                      href={entry.office.onlineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#E1F5EE] text-[#0F5C3A] hover:bg-[#1D9E75] hover:text-[#FDFFFE] border border-[#1D9E75] border-opacity-25 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-sm active:scale-95"
                    >
                      <FileText size={16} />
                      <span>Online Apply Link (Govt Portal)</span>
                    </a>
                  )}
                </div>
              )}

              {/* STEP 4: Tips + Share */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-[#0F5C3A] font-display border-b border-[#E8EDEA] pb-1">
                    काम की सलाह (Important tips)
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#E1F5EE] p-3 rounded-xl text-center border border-[#1D9E75] border-opacity-10">
                      <span className="text-[9px] text-[#607068] block font-bold uppercase">Fees (सरकारी फीस)</span>
                      <span className="text-xs font-extrabold text-[#0F5C3A]">{entry.fees}</span>
                    </div>
                    <div className="bg-[#FDF0E6] p-3 rounded-xl text-center border border-[#E07B2A] border-opacity-10">
                      <span className="text-[9px] text-[#607068] block font-bold uppercase">Processing Time</span>
                      <span className="text-xs font-extrabold text-[#E07B2A]">{entry.processingDays}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-extrabold text-[#607068] uppercase tracking-wide">
                      Urgent Tips:
                    </span>
                    <div className="space-y-1.5">
                      {entry.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-[#FDF0E6] border border-[#E07B2A] border-opacity-15 p-2.5 rounded-xl text-[10px] font-bold text-[#607068]">
                          <AlertTriangle size={13} className="text-[#E07B2A] mt-0.5 flex-shrink-0" />
                          <p className="leading-normal">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Helpline support */}
                  <a
                    href={`tel:${entry.helpline}`}
                    className="flex items-center justify-between bg-[#FDECEA] hover:bg-opacity-80 p-3 rounded-2xl border border-[#C0392B] border-opacity-10 text-[#C0392B] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall size={16} />
                      <div className="font-bold">
                        <p className="text-[9px] uppercase tracking-wide opacity-80">Helpline Call Support</p>
                        <p className="text-xs">{entry.helpline}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold border border-[#C0392B] px-2 py-0.5 rounded-lg uppercase">Dial</span>
                  </a>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Footer Nav Buttons */}
        <div className="border-t border-[#E8EDEA] pt-4 mt-4 space-y-2">
          {step === 4 && (
            /* Premium WhatsApp Share button with shine-sweep */
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-[#FDFFFE] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md shine-sweep focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            >
              <Share2 size={15} strokeWidth={2.5} />
              <span>WhatsApp Par Share Karein</span>
            </motion.button>
          )}

          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="flex-1 bg-[#FDFFFE] hover:bg-[#F4F7F5] text-[#1D9E75] border border-[#1D9E75] font-extrabold py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1 uppercase"
              >
                <ChevronLeft size={14} />
                <span>Peechhe</span>
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="flex-1 bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] text-[#FDFFFE] font-extrabold py-2.5 rounded-xl text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 uppercase"
              >
                <span>Aage Badhein</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setStep(1)
                  setCheckedDocs({})
                  navigate('/forms')
                }}
                className="flex-1 bg-[#FDFFFE] hover:bg-[#F4F7F5] text-[#0F5C3A] border border-[#E8EDEA] font-extrabold py-2.5 rounded-xl text-xs transition-all active:scale-95 uppercase"
              >
                Done / Back
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Flag Outdated Modal */}
      <AnimatePresence>
        {isFlagOpen && (
          <>
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setIsFlagOpen(false)}
              className="fixed inset-0 bg-[#0D1B12] bg-opacity-40 z-50 backdrop-blur-[2px]"
            />

            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-[#FDFFFE] rounded-[24px] p-5 shadow-float z-50 border border-[#E8EDEA]"
            >
              <button
                onClick={() => setIsFlagOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-[#F4F7F5] hover:bg-[#E8EDEA]"
              >
                <X size={15} className="text-[#607068]" />
              </button>

              <h4 className="font-extrabold text-base text-[#C0392B] font-display mb-1">
                Report Incorrect Guide
              </h4>
              <p className="text-[10px] text-[#607068] mb-4 font-semibold leading-relaxed">
                Is checklist mein koi galati hai? Report likh kar 15 points kamayein!
              </p>

              {flagSuccess ? (
                <div className="bg-[#E1F5EE] text-[#0F5C3A] border border-[#1D9E75] border-opacity-20 rounded-2xl p-4 text-xs font-extrabold text-center">
                  {flagSuccess}
                </div>
              ) : (
                <form onSubmit={handleFlagSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-[#607068] uppercase">
                      Field (konsa data galat hai?)
                    </label>
                    <select
                      value={flagField}
                      onChange={(e) => setFlagField(e.target.value)}
                      className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#1D9E75]"
                    >
                      <option value="documents">Required Documents (दस्तावेज़)</option>
                      <option value="office">Office Details (कार्यालय)</option>
                      <option value="fees">Fees/Cost (सरकारी फीस)</option>
                      <option value="tips">Tips/Processing time (सलाह)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-[#607068] uppercase">
                      Correct Information
                    </label>
                    <textarea
                      value={flagCorrection}
                      onChange={(e) => setFlagCorrection(e.target.value)}
                      placeholder="Sahi details yahan likhein..."
                      rows={3}
                      className="w-full bg-[#F4F7F5] border border-[#E8EDEA] rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#1D9E75] resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={flagLoading}
                    className="w-full bg-[#C0392B] hover:opacity-95 text-[#FDFFFE] font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 uppercase tracking-wider"
                  >
                    {flagLoading ? 'Sending...' : 'Submit Report (+15 pts)'}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default FormGuideWizard
export { FormGuideWizard }
