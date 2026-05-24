import React from 'react'
import { AlertCircle, AlertTriangle, Info, ShoppingBag } from 'lucide-react'
import SewakBadge from './SewakBadge'
import { timeAgoHindi } from '../utils/timeAgoHindi'
import { motion } from 'framer-motion'
import { cardVariants } from '../lib/motionVariants'

const TYPE_CONFIG = {
  notice: {
    label: 'सूचना (Notice)',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: <Info size={13} className="text-blue-600" />
  },
  outage: {
    label: 'कटौती (Outage)',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <AlertTriangle size={13} className="text-amber-600" />
  },
  alert: {
    label: 'चेतावनी (Alert)',
    color: 'bg-[#FDECEA] text-[#C0392B] border-[#C0392B] border-opacity-10',
    icon: <AlertCircle size={13} className="text-[#C0392B]" />
  },
  market: {
    label: 'बाज़ार / मंडी (Market)',
    color: 'bg-[#E1F5EE] text-[#0F5C3A] border-[#1D9E75] border-opacity-10',
    icon: <ShoppingBag size={13} className="text-[#1D9E75]" />
  }
}

const MohallaPostCard = ({ post }) => {
  const config = TYPE_CONFIG[post.type] || TYPE_CONFIG.notice
  const authorName = post.author?.name || 'Nagarik'
  const authorBadge = post.author?.badge || 'Nagarik'

  // Detect if this post is a brand new real-time post
  const isRealtime = Date.now() - new Date(post.createdAt).getTime() < 5000

  return (
    <motion.div
      variants={cardVariants}
      whileTap={{ scale: 0.98 }}
      className={`bg-[#FDFFFE] border p-4 rounded-[20px] shadow-card space-y-3 transition-colors duration-300 relative overflow-hidden ${
        isRealtime ? 'border-[#1D9E75] border-l-4' : 'border-[#E8EDEA] hover:border-[#1D9E75]'
      }`}
    >
      {/* Visual pulse for real-time post */}
      {isRealtime && (
        <motion.div
          className="absolute inset-0 bg-[#E1F5EE] -z-10"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.5 }}
        />
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {/* Avatar Icon */}
          <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center font-extrabold text-[#0F5C3A] text-xs">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#0D1B12]">{authorName}</span>
              <SewakBadge badge={authorBadge} />
            </div>
            <span className="text-[9px] text-[#607068] font-bold uppercase tracking-wider block mt-0.5">
              {timeAgoHindi(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Post Type Badge */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border ${config.color}`}>
          {config.icon}
          <span>{config.label}</span>
        </span>
      </div>

      {/* Body text */}
      <p className="text-xs text-[#2D3A32] leading-relaxed font-medium whitespace-pre-wrap">
        {post.body}
      </p>
    </motion.div>
  )
}

const MohallaFeedList = ({ posts }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {posts.map(post => (
        <MohallaPostCard key={post._id} post={post} />
      ))}
    </motion.div>
  )
}

export default MohallaFeedList
export { MohallaPostCard }
