import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SewakBadge from '../components/SewakBadge'
import { Award, MessageSquare, AlertTriangle, Trophy, Star, MapPin } from 'lucide-react'
import { getPincodeName } from '../utils/pincodeMap'
import { useNavigate } from 'react-router-dom'

import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, scaleIn, staggerContainer } from '../lib/motionVariants'
import confetti from 'canvas-confetti'

const BADGE_LEVELS = [
  { name: 'Nagarik', minPoints: 0, nextPoints: 100, emoji: '👤' },
  { name: 'Sewak', minPoints: 100, nextPoints: 250, emoji: '🛡️' },
  { name: 'Jan Nayak', minPoints: 250, nextPoints: 500, emoji: '🔥' },
  { name: 'Pratinidhi', minPoints: 500, nextPoints: 1000000, emoji: '👑' } // Max level
]

const BADGE_THRESHOLDS = { Nagarik: 0, Sewak: 100, 'Jan Nayak': 250, Pratinidhi: 500 }
const BADGE_ORDER = ['Nagarik', 'Sewak', 'Jan Nayak', 'Pratinidhi']

function getBadgeColor(badge) {
  const map = {
    'Nagarik':    '#5DC9A1',
    'Sewak':      '#1D9E75',
    'Jan Nayak':  '#C9A227',
    'Pratinidhi': '#8B5CF6',
  }
  return map[badge] || '#5DC9A1'
}

function formatLocation(user) {
  if (!user) return '—'
  if (user.location && typeof user.location === 'object') {
    const { ward, city, district, state, pincode } = user.location
    const parts = [ward, city || district, district, state].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)
    return parts.join(', ') + (pincode ? ` · ${pincode}` : '')
  }
  if (user.area && user.city) {
    return `${user.area}, ${user.city}, ${user.state || 'Punjab'} · ${user.pincode}`
  }
  return `${getPincodeName(user.pincode)}, ${user.state || 'Punjab'} · ${user.pincode}`
}

const Profile = () => {
  const { user, logout, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('stats') // 'stats' | 'posts' | 'issues' | 'ranks'
  
  // Location editing states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editPincode, setEditPincode] = useState('')
  const [editState, setEditState] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editWard, setEditWard] = useState('')
  const [editArea, setEditArea] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)

  const handleOpenEditLocation = () => {
    setEditPincode(user?.pincode || '')
    setEditState(user?.state || user?.location?.state || '')
    setEditDistrict(user?.district || user?.location?.district || '')
    setEditCity(user?.city || user?.location?.city || '')
    setEditWard(user?.ward || user?.location?.ward || '')
    setEditArea(user?.area || user?.location?.address || '')
    setEditError('')
    setShowEditModal(true)
  }

  const handleEditPincodeChange = async (val) => {
    const cleanVal = val.replace(/\D/g, '')
    setEditPincode(cleanVal)
    setEditError('')

    if (cleanVal.length === 6 && /^\d{6}$/.test(cleanVal)) {
      setPincodeLoading(true)
      try {
        const response = await api.get(`/auth/lookup-pincode?pincode=${cleanVal}`)
        setEditState(response.data.state || '')
        setEditDistrict(response.data.district || '')
        setEditCity(response.data.city || '')
      } catch (err) {
        setEditError('Pincode nahi mila — manually bharen')
        setEditState('')
        setEditDistrict('')
        setEditCity('')
      } finally {
        setPincodeLoading(false)
      }
    }
  }

  const handleSaveLocation = async (e) => {
    if (e) e.preventDefault()
    if (editPincode.length !== 6) {
      setEditError('Zaroori: 6-digit Pincode enter karein.')
      return
    }
    if (!editState.trim() || !editDistrict.trim()) {
      setEditError('Zaroori: State and District enter karein.')
      return
    }

    setEditLoading(true)
    setEditError('')
    try {
      const response = await api.patch('/user/location', {
        pincode: editPincode,
        state: editState.trim(),
        district: editDistrict.trim(),
        city: editCity.trim() || editDistrict.trim(),
        ward: editWard.trim(),
        area: editArea.trim()
      })
      
      updateUserProfile(response.data.user)
      setShowEditModal(false)
    } catch (err) {
      console.error('Error saving location:', err)
      setEditError(err.response?.data?.error || 'Location update fail ho gaya.')
    } finally {
      setEditLoading(false)
    }
  }
  
  // Tab states
  const [myPosts, setMyPosts] = useState([])
  const [myIssues, setMyIssues] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingIssues, setLoadingIssues] = useState(false)
  const [loadingLeader, setLoadingLeader] = useState(false)

  const [stats, setStats] = useState({
    issuesReported: 0,
    votesCast: 0,
    postsMade: 0,
  })
  const [loading, setLoading] = useState(true)

  // Spring count-up state for points
  const targetPoints = user?.points || 0
  const [displayPoints, setDisplayPoints] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await api.get('/user/me')
        if (response.data.stats) {
          setStats(response.data.stats)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    let start = 0
    const end = targetPoints
    if (end === 0) {
      setDisplayPoints(0)
      return
    }
    const duration = 1000
    const stepTime = Math.max(Math.floor(duration / (end / 10)), 15)
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 30)
      if (start >= end) {
        clearInterval(timer)
        setDisplayPoints(end)
      } else {
        setDisplayPoints(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [targetPoints])

  // Confetti explosion trigger when points increase or level updates
  useEffect(() => {
    if (user?.points > 0) {
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 }
      })
    }
  }, [user?.badge])

  // Fetch my posts
  const fetchMyPosts = async () => {
    setLoadingPosts(true)
    try {
      const response = await api.get(`/posts/my?pincode=${user?.pincode || ''}`)
      setMyPosts(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPosts(false)
    }
  }

  // Fetch my issues
  const fetchMyIssues = async () => {
    setLoadingIssues(true)
    try {
      const response = await api.get(`/issues/my?pincode=${user?.pincode || ''}`)
      setMyIssues(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingIssues(false)
    }
  }

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeader(true)
    try {
      const response = await api.get(`/user/leaderboard?pincode=${user?.pincode || ''}`)
      setLeaderboard(response.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingLeader(false)
    }
  }

  // Tab change trigger
  useEffect(() => {
    if (activeTab === 'posts') fetchMyPosts()
    if (activeTab === 'issues') fetchMyIssues()
    if (activeTab === 'ranks') fetchLeaderboard()
  }, [activeTab])

  // Threshold / progress calculations
  const currentPoints = user?.points || 0
  const currentBadgeIndex = BADGE_ORDER.indexOf(user?.badge || 'Nagarik')
  const nextBadge = BADGE_ORDER[currentBadgeIndex + 1]
  const nextThreshold = BADGE_THRESHOLDS[nextBadge] || BADGE_THRESHOLDS['Pratinidhi']
  const currentThreshold = BADGE_THRESHOLDS[user?.badge || 'Nagarik']
  
  const divisor = nextThreshold - currentThreshold
  const rawPct = divisor > 0 ? ((currentPoints - currentThreshold) / divisor) * 100 : 100
  const progressPct = Math.max(0, Math.min(rawPct, 100))

  const statItems = [
    {
      icon: '🪙',
      iconBg: '#E1F5EE',
      value: currentPoints,
      label: 'Citizen points',
      trend: currentPoints > 0 ? `+${currentPoints}` : null,
      trendColor: '#3B6D11',
      trendBg: '#EAF3DE',
    },
    {
      icon: '⚠️',
      iconBg: '#EAF3DE',
      value: stats?.issuesReported || 0,
      label: 'Issues reported',
    },
    {
      icon: '👍',
      iconBg: '#FAEEDA',
      value: stats?.votesCast || 0,
      label: 'Votes cast',
    },
    {
      icon: '💬',
      iconBg: '#E6F1FB',
      value: stats?.postsMade || 0,
      label: 'Posts made',
    },
  ]

  const earnItems = [
    { color: '#1D9E75', text: 'Report an issue in your area', pts: '+20' },
    { color: '#BA7517', text: 'Flag outdated form guide info', pts: '+15' },
    { color: '#185FA5', text: 'Write a Mohalla Board post', pts: '+10' },
    { color: '#5DC9A1', text: "Upvote another citizen's issue", pts: '+1' },
  ]

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#F4F7F5',
      position: 'relative',
    }}>
      {loading ? (
        <div style={{ padding: '16px' }}>
          {/* Hero skeleton */}
          <div style={{ background: '#0A3D24', borderRadius: '16px', height: '140px', marginBottom: '16px' }} />
          {/* Info card skeleton */}
          {[1, 2].map(i => (
            <div key={i} style={{
              height: '16px', background: '#E8EDEA',
              borderRadius: '8px', marginBottom: '10px',
              animation: 'shimmer 1.4s ease-in-out infinite',
              backgroundImage: 'linear-gradient(90deg, #E8EDEA 25%, #F4F7F5 50%, #E8EDEA 75%)',
              backgroundSize: '200% 100%',
            }} />
          ))}
          {/* Stats skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: '90px', background: '#E8EDEA',
                borderRadius: '16px',
                animation: 'shimmer 1.4s ease-in-out infinite',
                backgroundImage: 'linear-gradient(90deg, #E8EDEA 25%, #F4F7F5 50%, #E8EDEA 75%)',
                backgroundSize: '200% 100%',
              }} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Section 1 — Hero band */}
          <div style={{
            background: '#0A3D24',
            padding: '20px 20px 56px 20px',
            position: 'relative',
          }}>
            {/* Top row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Mukta, sans-serif',
              }}>
                My profile
              </span>
              <button
                onClick={() => navigate('/profile')} // fallbacks to profile itself since settings doesn't exist
                style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                }}
                aria-label="Settings"
              >
                ⚙️
              </button>
            </div>

            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
              {/* Avatar circle — initials */}
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1D9E75, #5DC9A1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 500, color: '#fff',
                border: '3px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
                fontFamily: 'Mukta, sans-serif',
              }}>
                {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'NA'}
              </div>

              <div style={{ flex: 1, paddingBottom: '4px' }}>
                {/* Name — NOT all caps, sentence case */}
                <div style={{
                  fontSize: '22px', fontWeight: 600,
                  color: '#fff', marginBottom: '6px',
                  fontFamily: 'Mukta, sans-serif',
                }}>
                  {user?.name || 'Nagarik'}
                </div>

                {/* Badge pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  borderRadius: '100px',
                  padding: '3px 10px 3px 8px',
                }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: getBadgeColor(user?.badge),
                  }} />
                  <span style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500, fontFamily: 'Mukta, sans-serif',
                  }}>
                    {user?.badge || 'Nagarik'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Floating info card */}
          <div style={{
            background: '#fff',
            border: '0.5px solid #E8EDEA',
            borderRadius: '16px',
            margin: '0 16px',
            marginTop: '-32px',      /* KEY — overlaps the hero band */
            padding: '0 16px',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 4px 20px rgba(10,61,36,0.08)',
          }}>
            {/* Email row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 0',
              borderBottom: '0.5px solid #E8EDEA',
            }}>
              <span style={{ fontSize: '15px', color: '#A8B5AD', flexShrink: 0 }}>✉</span>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#A8B5AD',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                width: '44px', flexShrink: 0,
              }}>Email</span>
              <span className="profile-email" style={{
                fontSize: '13px', color: '#0D1B12',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1,
              }}>
                {user?.email?.toLowerCase() || '—'}
              </span>
            </div>

            {/* Location row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 0',
              borderBottom: (user?.ward || user?.location?.ward) ? '0.5px solid #E8EDEA' : 'none',
            }}>
              <span style={{ fontSize: '15px', color: '#A8B5AD', flexShrink: 0 }}>📍</span>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#A8B5AD',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                width: '44px', flexShrink: 0,
              }}>Area</span>
              <span className="profile-location" style={{
                fontSize: '13px', color: '#0D1B12',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1,
                marginRight: '8px'
              }}>
                {formatLocation(user)}
              </span>
              <button
                onClick={handleOpenEditLocation}
                style={{
                  background: 'none', border: 'none', color: '#1D9E75',
                  fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                  padding: '4px 8px', borderRadius: '6px',
                  backgroundColor: '#E1F5EE', flexShrink: 0,
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                Edit
              </button>
            </div>

            {/* Ward row */}
            {(user?.ward || user?.location?.ward) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 0',
              }}>
                <span style={{ fontSize: '15px', color: '#A8B5AD', flexShrink: 0 }}>🏢</span>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#A8B5AD',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  width: '44px', flexShrink: 0,
                }}>Ward</span>
                <span className="profile-ward" style={{
                  fontSize: '13px', color: '#0D1B12',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {user?.ward || user?.location?.ward}
                </span>
              </div>
            )}
          </div>

          {/* Section 3 — Tabs */}
          <div style={{
            display: 'flex', gap: '4px',
            background: '#F4F7F5',
            borderRadius: '10px',
            padding: '3px',
            margin: '16px 16px 0',
          }}>
            {['stats', 'posts', 'issues', 'ranks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  border: activeTab === tab ? '0.5px solid #E8EDEA' : 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Mukta, sans-serif',
                  transition: 'all 0.15s ease',
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#0D1B12' : '#607068',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'posts' ? 'Posts' : tab === 'issues' ? 'Issues' : tab === 'ranks' ? 'Ranks' : 'Stats'}
              </button>
            ))}
          </div>

          {/* Section 4 — Tab Body Contents */}
          <div style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ padding: '0 16px' }}
                >
                  {/* 4a — Level progress card */}
                  <div style={{
                    background: '#fff',
                    border: '0.5px solid #E8EDEA',
                    borderRadius: '16px',
                    padding: '16px',
                    marginTop: '16px',
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'baseline', marginBottom: '12px',
                    }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 500, color: '#0D1B12',
                        fontFamily: 'Mukta, sans-serif',
                      }}>
                        Level progress
                      </span>
                      <span style={{
                        fontSize: '13px', fontWeight: 500, color: '#1D9E75',
                        fontFamily: 'Mukta, sans-serif',
                      }}>
                        {displayPoints} / {nextThreshold} pts
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      background: '#F4F7F5', borderRadius: '100px',
                      height: '6px', marginBottom: '16px', overflow: 'hidden',
                    }}>
                      <div className="progress-fill" style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #1D9E75, #5DC9A1)',
                        borderRadius: '100px',
                        width: `${progressPct}%`,
                      }} />
                    </div>

                    {/* Badge milestone steps */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '6px',
                    }}>
                      {BADGE_ORDER.map((badge, i) => {
                        const isDone = i < currentBadgeIndex
                        const isActive = i === currentBadgeIndex
                        return (
                          <div key={badge} style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '6px',
                          }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px',
                              background: isDone ? '#E1F5EE' : isActive ? '#0A3D24' : '#F4F7F5',
                              border: isDone ? '0.5px solid #5DC9A1'
                                    : isActive ? '0.5px solid #1D9E75'
                                    : '0.5px solid #E8EDEA',
                              boxShadow: isActive ? '0 0 0 3px #E1F5EE' : 'none',
                            }}>
                              {isDone  ? '✓' :
                               badge === 'Nagarik'    ? '👤' :
                               badge === 'Sewak'      ? '🌿' :
                               badge === 'Jan Nayak'  ? '⭐' : '🏆'}
                            </div>
                            <span style={{
                              fontSize: '10px', textAlign: 'center',
                              fontFamily: 'Mukta, sans-serif',
                              fontWeight: isActive ? 600 : 400,
                              color: isDone ? '#0F6E56' : isActive ? '#0A3D24' : '#A8B5AD',
                            }}>
                              {badge}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Hint chip */}
                    {nextBadge && (
                      <div style={{
                        marginTop: '14px',
                        background: '#E1F5EE',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#0F6E56',
                        textAlign: 'center',
                        fontFamily: 'Mukta, sans-serif',
                      }}>
                        {nextThreshold - currentPoints} more points to reach {nextBadge} 🌿
                      </div>
                    )}
                  </div>

                  {/* 4b — Stats 2×2 grid */}
                  <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginTop: '10px',
                  }}>
                    {statItems.map((item, i) => (
                      <div key={i} style={{
                        background: '#fff',
                        border: '0.5px solid #E8EDEA',
                        borderRadius: '16px',
                        padding: '14px',
                      }}>
                        {/* Icon row */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '10px',
                        }}>
                          <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: item.iconBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px',
                          }}>
                            {item.icon}
                          </div>
                          {item.trend && (
                            <span style={{
                              fontSize: '11px', fontWeight: 500,
                              background: item.trendBg, color: item.trendColor,
                              padding: '2px 8px', borderRadius: '100px',
                              fontFamily: 'Mukta, sans-serif',
                            }}>
                              {item.trend}
                            </span>
                          )}
                        </div>
                        {/* Number */}
                        <div style={{
                          fontSize: '26px', fontWeight: 600,
                          color: '#0D1B12', lineHeight: 1,
                          marginBottom: '3px',
                          fontFamily: 'Mukta, sans-serif',
                        }}>
                          {item.value.toLocaleString('en-IN')}
                        </div>
                        {/* Label */}
                        <div style={{
                          fontSize: '11px', color: '#607068',
                          fontFamily: 'Mukta, sans-serif',
                        }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 4c — Earn points card */}
                  <div style={{
                    background: '#fff',
                    border: '0.5px solid #E8EDEA',
                    borderRadius: '16px',
                    padding: '16px',
                    marginTop: '10px',
                    marginBottom: '24px',
                  }}>
                    {/* Title */}
                    <div style={{
                      fontSize: '11px', fontWeight: 600,
                      color: '#607068',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      marginBottom: '12px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontFamily: 'Mukta, sans-serif',
                    }}>
                      ✨ How to earn points
                    </div>

                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {earnItems.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 0',
                          borderTop: i === 0 ? 'none' : '0.5px solid #E8EDEA',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '7px', height: '7px', borderRadius: '50%',
                              background: item.color, flexShrink: 0,
                            }} />
                            <span style={{
                              fontSize: '13px', color: '#0D1B12',
                              fontFamily: 'Mukta, sans-serif',
                            }}>
                              {item.text}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '13px', fontWeight: 500,
                            color: '#1D9E75',
                            background: '#E1F5EE',
                            padding: '2px 10px',
                            borderRadius: '100px',
                            flexShrink: 0,
                            fontFamily: 'Mukta, sans-serif',
                          }}>
                            {item.pts}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* POSTS TAB */}
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {loadingPosts ? (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[1, 2].map(n => (
                        <div key={n} style={{ height: '70px', bg: '#fff', border: '0.5px solid #E8EDEA', borderRadius: '16px', animation: 'shimmer 1.4s infinite' }} />
                      ))}
                    </div>
                  ) : myPosts.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '60px 20px',
                      color: '#A8B5AD',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
                      <div style={{
                        fontSize: '15px', fontWeight: 500,
                        color: '#607068', marginBottom: '6px',
                        fontFamily: 'Mukta, sans-serif',
                      }}>
                        No posts yet
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#A8B5AD',
                        fontFamily: 'Mukta, sans-serif',
                        maxWidth: '200px', lineHeight: '1.5',
                      }}>
                        Your Mohalla Board posts will appear here
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {myPosts.map(p => (
                        <div
                          key={p._id}
                          style={{
                            background: '#fff',
                            border: '0.5px solid #E8EDEA',
                            borderRadius: '16px',
                            padding: '14px',
                            boxShadow: '0 2px 10px rgba(10,61,36,0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.type}</span>
                            <span style={{ fontSize: '10px', color: '#A8B5AD' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#2D3A32', margin: 0, lineHeight: 1.5, fontFamily: 'Mukta, sans-serif' }}>{p.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ISSUES TAB */}
              {activeTab === 'issues' && (
                <motion.div
                  key="issues"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {loadingIssues ? (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[1, 2].map(n => (
                        <div key={n} style={{ height: '80px', bg: '#fff', border: '0.5px solid #E8EDEA', borderRadius: '16px', animation: 'shimmer 1.4s infinite' }} />
                      ))}
                    </div>
                  ) : myIssues.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '60px 20px',
                      color: '#A8B5AD',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
                      <div style={{
                        fontSize: '15px', fontWeight: 500,
                        color: '#607068', marginBottom: '6px',
                        fontFamily: 'Mukta, sans-serif',
                      }}>
                        No issues reported yet
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#A8B5AD',
                        fontFamily: 'Mukta, sans-serif',
                        maxWidth: '200px', lineHeight: '1.5',
                      }}>
                        Issues you report will appear here
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {myIssues.map(i => (
                        <div
                          key={i._id}
                          style={{
                            background: '#fff',
                            border: '0.5px solid #E8EDEA',
                            borderRadius: '16px',
                            padding: '14px',
                            boxShadow: '0 2px 10px rgba(10,61,36,0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{i.category}</span>
                            <span style={{ fontSize: '10px', color: '#1D9E75', background: '#E1F5EE', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>{i.status}</span>
                          </div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F5C3A', margin: '0 0 4px 0', fontFamily: 'Mukta, sans-serif' }}>{i.title}</h4>
                          <p style={{ fontSize: '12px', color: '#607068', margin: 0, lineHeight: 1.4, fontFamily: 'Mukta, sans-serif' }}>{i.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* RANKS TAB */}
              {activeTab === 'ranks' && (
                <motion.div
                  key="ranks"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {loadingLeader ? (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[1, 2, 3].map(n => (
                        <div key={n} style={{ height: '40px', bg: '#fff', border: '0.5px solid #E8EDEA', borderRadius: '12px', animation: 'shimmer 1.4s infinite' }} />
                      ))}
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '60px 20px',
                      color: '#A8B5AD',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</div>
                      <div style={{
                        fontSize: '15px', fontWeight: 500,
                        color: '#607068', marginBottom: '6px',
                        fontFamily: 'Mukta, sans-serif',
                      }}>
                        Leaderboard coming soon
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#A8B5AD',
                        fontFamily: 'Mukta, sans-serif',
                        maxWidth: '200px', lineHeight: '1.5',
                      }}>
                        Top citizens in your ward will be shown here
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontFamily: 'Mukta, sans-serif' }}>
                        🏆 local Leaderboard (Top 10 users)
                      </div>
                      {leaderboard.map((lead, idx) => {
                        const isMe = lead._id === user?._id
                        return (
                          <div
                            key={lead._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              background: isMe ? '#E1F5EE' : '#fff',
                              border: isMe ? '1px solid #1D9E75' : '0.5px solid #E8EDEA',
                              boxShadow: '0 2px 6px rgba(10,61,36,0.02)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#607068', width: '16px' }}>{idx + 1}</span>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B12', fontFamily: 'Mukta, sans-serif' }}>{lead.name}</span>
                              <span style={{ fontSize: '10px', background: isMe ? '#1D9E75' : '#F4F7F5', color: isMe ? '#fff' : '#607068', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>{lead.badge}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F5C3A', fontFamily: 'Mukta, sans-serif' }}>{lead.points} pts</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(10, 61, 36, 0.45)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#fff',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(10, 61, 36, 0.15)',
                border: '1px solid rgba(29, 158, 117, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A3D24', margin: 0, fontFamily: 'Mukta, sans-serif' }}>
                  📍 Edit Location
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    border: 'none', background: '#F4F7F5', width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px',
                    color: '#607068'
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
                
                {/* Pincode */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Pincode
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={editPincode}
                      onChange={(e) => handleEditPincodeChange(e.target.value)}
                      placeholder="e.g. 144402"
                      required
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E8EDEA',
                        background: '#F4F7F5', fontSize: '13px', fontWeight: 600, color: '#0D1B12', outline: 'none'
                      }}
                    />
                    {pincodeLoading && (
                      <span style={{ position: 'absolute', right: '12px', fontSize: '9px', fontWeight: 700, color: '#1D9E75' }}>
                        Checking...
                      </span>
                    )}
                  </div>
                </div>

                {/* State */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. Punjab"
                    required
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E8EDEA',
                      background: '#F4F7F5', fontSize: '13px', fontWeight: 600, color: '#0D1B12', outline: 'none'
                    }}
                  />
                </div>

                {/* District */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Zila (District)
                  </label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="e.g. Kapurthala"
                    required
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E8EDEA',
                      background: '#F4F7F5', fontSize: '13px', fontWeight: 600, color: '#0D1B12', outline: 'none'
                    }}
                  />
                </div>

                {/* City */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Phagwara"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E8EDEA',
                      background: '#F4F7F5', fontSize: '13px', fontWeight: 600, color: '#0D1B12', outline: 'none'
                    }}
                  />
                </div>

                {/* Ward */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ward (optional)
                  </label>
                  <input
                    type="text"
                    value={editWard}
                    onChange={(e) => setEditWard(e.target.value)}
                    placeholder="e.g. Ward 12"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E8EDEA',
                      background: '#F4F7F5', fontSize: '13px', fontWeight: 600, color: '#0D1B12', outline: 'none'
                    }}
                  />
                </div>

                {/* Area / Mohalla */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#607068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Area / Mohalla (optional)
                  </label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    placeholder="e.g. Model Town"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E8EDEA',
                      background: '#F4F7F5', fontSize: '13px', fontWeight: 600, color: '#0D1B12', outline: 'none'
                    }}
                  />
                </div>

                {editError && (
                  <p style={{ color: '#C0392B', fontSize: '11px', margin: 0, fontWeight: 500 }}>
                    {editError}
                  </p>
                )}

                {/* Preview */}
                {(editState || editDistrict) && (
                  <div style={{ background: '#E1F5EE', padding: '10px 12px', borderRadius: '10px', fontSize: '11px', color: '#085041', fontWeight: 500, lineHeight: 1.4 }}>
                    📍 <strong>Preview:</strong> {[editWard, editCity || editDistrict, editDistrict, editState, editPincode].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E8EDEA', background: '#fff',
                      fontSize: '12px', fontWeight: 700, color: '#607068', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || pincodeLoading}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1D9E75, #0F5C3A)',
                      fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: editLoading ? 0.6 : 1
                    }}
                  >
                    {editLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile
export { BADGE_LEVELS }
