import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, AlertTriangle, Plus, ClipboardList, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const BottomNav = () => {
  const location = useLocation()
  const [openIssuesCount, setOpenIssuesCount] = useState(3) // Fallback count

  // Fetch actual open issues count in background
  useEffect(() => {
    const fetchIssuesCount = async () => {
      try {
        const response = await api.get('/issues?limit=1')
        if (response.data && response.data.total) {
          setOpenIssuesCount(response.data.total)
        }
      } catch (err) {
        console.warn('Could not fetch issues count, using mock count')
      }
    }
    fetchIssuesCount()
  }, [location.pathname])

  const tabs = [
    { path: '/app', label: 'Board', icon: MessageSquare },
    { path: '/app/issues', label: 'Issues', icon: AlertTriangle, badge: true },
    { path: '/app/report', label: 'Report', icon: Plus, isFab: true },
    { path: '/app/forms', label: 'Forms', icon: ClipboardList },
    { path: '/app/profile', label: 'Profile', icon: UserCheck }
  ]

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[#FDFFFE] bg-opacity-95 backdrop-blur-md border-t border-[#E8EDEA] h-[68px] flex items-center justify-around px-2 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(15,92,58,0.05)]">
      {tabs.map((tab) => {
        const isFab = tab.isFab
        const isActive = location.pathname === tab.path

        if (isFab) {
          return (
            <Link
              to={tab.path}
              key={tab.path}
              className="relative -top-5 z-50 flex flex-col items-center"
              aria-label="Report Issue"
            >
              <motion.div
                className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-[#1D9E75] to-[#0F5C3A] flex items-center justify-center text-[#FDFFFE] shadow-[0_8px_24px_rgba(15,92,58,0.22)] border-[3px] border-[#FDFFFE] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                initial={{ y: 20, scale: 0.8 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 250 }}
              >
                <motion.div
                  animate={{ rotate: isActive ? 45 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Plus size={26} strokeWidth={3} />
                </motion.div>
              </motion.div>
            </Link>
          )
        }

        return (
          <Link
            to={tab.path}
            key={tab.path}
            className="relative flex-1 flex flex-col items-center justify-center h-full text-[10px] font-bold focus:outline-none"
          >
            <div className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-300">
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-[#E1F5EE] rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-[#1D9E75]' : 'text-[#607068]'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`mt-1 transition-colors duration-200 ${
                  isActive ? 'text-[#0F5C3A]' : 'text-[#607068]'
                }`}
              >
                {tab.label}
              </span>

              {/* Issues Count Badge */}
              {tab.badge && openIssuesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-[#C0392B] text-[9px] text-[#FDFFFE] rounded-full flex items-center justify-center font-extrabold px-1 border border-white shadow-sm">
                  {openIssuesCount}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
