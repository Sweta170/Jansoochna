import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, MapPin, Calendar } from 'lucide-react'
import api from '../services/api'
import { timeAgoHindi } from '../utils/timeAgoHindi'
import SewakBadge from './SewakBadge'
import { motion, AnimatePresence } from 'framer-motion'
import { cardVariants } from '../lib/motionVariants'
import confetti from 'canvas-confetti'

const CATEGORY_TAGS = {
  road: { label: 'सड़क (Road)', color: 'bg-red-50 text-red-800 border-red-200' },
  water: { label: 'पानी (Water)', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  electricity: { label: 'बिजली (Electricity)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  garbage: { label: 'कूड़ा (Garbage)', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  other: { label: 'अन्य (Other)', color: 'bg-gray-50 text-gray-800 border-gray-200' }
}

const STATUS_TAGS = {
  open: { label: 'खुला (Open)', color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'काम चालू (In Progress)', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'सुलझाया गया (Resolved)', color: 'bg-green-100 text-green-800' }
}

const IssueCard = ({ issue, onVoteUpdated }) => {
  const [voteCount, setVoteCount] = useState(issue.voteCount || 0)
  const [hasVoted, setHasVoted] = useState(issue.userHasVoted || false)
  const [voting, setVoting] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)

  // Confetti pop on petition unlocking
  useEffect(() => {
    if (voteCount === 50 && hasVoted) {
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.8 }
      })
    }
  }, [voteCount, hasVoted])

  const handleVote = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (voting) return

    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 350)

    const previousVoteCount = voteCount
    const previousHasVoted = hasVoted

    const nextHasVoted = !hasVoted
    const nextVoteCount = nextHasVoted ? voteCount + 1 : Math.max(0, voteCount - 1)

    setHasVoted(nextHasVoted)
    setVoteCount(nextVoteCount)
    setVoting(true)

    try {
      const response = await api.post(`/issues/${issue._id}/vote`)
      setVoteCount(response.data.voteCount)
      setHasVoted(response.data.userHasVoted)
      if (onVoteUpdated) {
        onVoteUpdated(issue._id, response.data.voteCount, response.data.userHasVoted)
      }
    } catch (err) {
      console.error('Error voting:', err)
      setHasVoted(previousHasVoted)
      setVoteCount(previousVoteCount)
    } finally {
      setVoting(false)
    }
  }

  const catConfig = CATEGORY_TAGS[issue.category] || CATEGORY_TAGS.other
  const statusConfig = STATUS_TAGS[issue.status] || STATUS_TAGS.open

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className="bg-[#FDFFFE] border border-[#E8EDEA] p-4 rounded-[20px] shadow-card block hover:border-[#1D9E75] transition-colors duration-300"
    >
      <Link to={`/issues/${issue._id}`} className="space-y-3 block">
        {/* Header tags */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catConfig.color}`}>
            {catConfig.label}
          </span>
          <span className={`text-[9px] px-2 py-0.5 rounded-lg font-extrabold uppercase ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Title & Desc */}
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-[#0F5C3A] font-display leading-tight">
            {issue.title}
          </h3>
          <p className="text-[11px] text-[#607068] line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Optional Photo Thumbnail */}
        {issue.photoUrl ? (
          <div className="w-full h-28 rounded-xl overflow-hidden border border-[#E8EDEA] bg-[#F4F7F5]">
            <img
              src={issue.photoUrl}
              alt={issue.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-10 bg-gradient-to-r from-[#E1F5EE] to-[#FDF0E6] rounded-xl flex items-center justify-center text-[10px] font-bold text-[#607068] opacity-60">
            📍 No photo attached
          </div>
        )}

        {/* Metadata & Vote button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8EDEA] border-dashed text-[10px] text-[#607068] font-bold">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-[#1D9E75]" />
              <span className="truncate max-w-[150px]">{issue.location?.address || 'India'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={11} />
              <span>{timeAgoHindi(issue.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Glowing Petition Badge */}
            {voteCount >= 50 && (
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-[#E1F5EE] border border-[#1D9E75] text-[#0F5C3A] font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(29,158,117,0.25)] flex items-center gap-1"
              >
                <span>📋</span>
                <span>Petition Ready</span>
              </motion.div>
            )}

            {/* Voting Spring Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleVote}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#1D9E75] ${
                hasVoted
                  ? 'bg-[#1D9E75] text-[#FDFFFE] border-[#1D9E75] shadow-sm'
                  : 'bg-[#FDFFFE] text-[#1D9E75] border-[#1D9E75] hover:bg-[#E1F5EE]'
              }`}
            >
              <motion.span
                animate={isBouncing ? { y: [-4, 2, 0], scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ThumbsUp size={12} strokeWidth={hasVoted ? 3 : 2} />
              </motion.span>
              <span>{hasVoted ? 'Maine bhi' : 'Main bhi'}</span>
              
              {/* Flip counter numbers */}
              <span className="bg-black bg-opacity-10 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold inline-block relative h-4 min-w-[12px] overflow-hidden text-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={voteCount}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {voteCount}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
          </div>
        </div>

        {/* Author signature */}
        <div className="flex items-center gap-1 text-[9px] text-[#607068] font-bold border-t border-[#E8EDEA] border-opacity-40 pt-1.5">
          <span>Reported by:</span>
          <span className="text-[#0D1B12]">{issue.author?.name || 'Nagarik'}</span>
          {issue.author?.badge && <SewakBadge badge={issue.author.badge} />}
        </div>
      </Link>
    </motion.div>
  )
}

export default IssueCard
export { CATEGORY_TAGS, STATUS_TAGS }
