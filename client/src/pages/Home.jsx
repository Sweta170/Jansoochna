import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import useSocket from '../hooks/useSocket'
import api from '../services/api'
import PostCard from '../components/PostCard'
import { getClientPincodeName } from '../components/layout/AppShell'
import { X, Send, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideUp, fadeIn, scaleIn } from '../lib/motionVariants'
import { POST_TYPES, FILTER_CHIPS, shortLocation } from '../utils/boardHelpers'

const Home = () => {
  const { user, updateUserProfile } = useAuth()
  const socket = useSocket()
  
  const [posts, setPosts] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Modal states
  const [showPostModal, setShowPostModal] = useState(false)
  const [postBody, setPostBody] = useState('')
  const [postType, setPostType] = useState('notice')
  const [submitting, setSubmitting] = useState(false)
  const [postError, setPostError] = useState('')
  
  // Custom states
  const [bodyFocused, setBodyFocused] = useState(false)
  const [pendingPosts, setPendingPosts] = useState([])
  const [newPostsAvailable, setNewPostsAvailable] = useState(false)

  const observerRef = useRef(null)
  const loadMoreBoundaryRef = useRef(null)

  // Fetch initial posts on load or pincode change
  const fetchPosts = async (pageNum, replace = false) => {
    if (!user?.pincode) return
    
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await api.get(`/posts?pincode=${user.pincode}&page=${pageNum}&limit=15`)
      const fetched = response.data.posts
      
      setPosts(prev => replace ? fetched : [...prev, ...fetched])
      setHasMore(response.data.pagination.hasMore)
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchPosts(1, true)
  }, [user?.pincode])

  // Setup Socket listener
  useEffect(() => {
    if (!socket) return

    const handleNewPost = (post) => {
      if (post.pincode === user?.pincode) {
        setPendingPosts(prev => {
          if (prev.some(p => p._id === post._id)) return prev
          return [post, ...prev]
        })
        setNewPostsAvailable(true)
      }
    }

    socket.on('new-post', handleNewPost)
    return () => {
      socket.off('new-post', handleNewPost)
    }
  }, [socket, user?.pincode])

  // Setup Infinite Scroll Observer
  useEffect(() => {
    if (loading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchPosts(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreBoundaryRef.current) {
      observer.observe(loadMoreBoundaryRef.current)
    }
    observerRef.current = observer

    return () => {
      if (observerRef.current && loadMoreBoundaryRef.current) {
        observerRef.current.unobserve(loadMoreBoundaryRef.current)
      }
    }
  }, [page, hasMore, loading, loadingMore])

  // Shadow on scroll
  useEffect(() => {
    const header = document.querySelector('.board-header')
    const onScroll = () => {
      header?.classList.toggle('board-header-scrolled', window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCreatePost = async (e) => {
    if (e) e.preventDefault()
    if (!postBody.trim()) return

    if (postBody.length > 200) {
      setPostError('Post 200 letters se zyada nahi ho sakti.')
      return
    }

    setSubmitting(true)
    setPostError('')

    try {
      const response = await api.post('/posts', {
        body: postBody,
        type: postType
      })

      // Add to feed immediately
      setPosts(prev => [response.data.post, ...prev])
      
      // Update points in user state
      if (response.data.pointResult && response.data.pointResult.points !== undefined) {
        updateUserProfile({ points: response.data.pointResult.points })
      }

      // Close modal
      setShowPostModal(false)
      setPostBody('')
      setPostType('notice')
    } catch (err) {
      console.error(err)
      setPostError(err.response?.data?.error || 'Post share karne mein error aayi.')
    } finally {
      setSubmitting(false)
    }
  }

  function loadNewPosts() {
    setPosts(prev => {
      const uniquePending = pendingPosts.filter(
        pending => !prev.some(p => p._id === pending._id)
      )
      return [...uniquePending, ...prev]
    })
    setPendingPosts([])
    setNewPostsAvailable(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filtered posts derived value:
  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.type === activeFilter)

  return (
    <div style={{
      background: '#F4F7F5',
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
    }}>

      {/* ── HEADER ───────────────────────────────── */}
      <div className="board-header" style={{
        background: '#0A3D24',
        padding: '20px 16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        transition: 'box-shadow 0.25s ease',
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '14px',
        }}>
          {/* Left: title + location */}
          <div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '5px',
              fontFamily: 'Mukta, sans-serif',
            }}>
              आपका मोहल्ला
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              {/* Live pulsing dot */}
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#5DC9A1',
                animation: 'livePulse 1.8s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'Mukta, sans-serif',
              }}>
                {/* Show short location only */}
                {shortLocation(user?.location)} · Live
              </span>
            </div>
          </div>

          {/* Right: icon buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Search */}
            <button
              style={{
                width: '34px', height: '34px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                fontSize: '16px',
              }}
              aria-label="Search posts"
            >
              <i className="ti ti-search" aria-hidden="true" />
            </button>
            {/* Notifications */}
            <button
              style={{
                width: '34px', height: '34px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                fontSize: '16px',
              }}
              aria-label="Notifications"
            >
              <i className="ti ti-bell" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Quick post input bar */}
        <button
          onClick={() => setShowPostModal(true)}
          style={{
            width: '100%',
            background: '#1D9E75',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '14px',
          }}
        >
          <span style={{
            flex: 1,
            textAlign: 'left',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Mukta, sans-serif',
          }}>
            अपने मोहल्ले को कुछ बताएं...
          </span>
          <span style={{
            width: '28px', height: '28px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', color: '#fff',
          }}>
            <i className="ti ti-pencil" aria-hidden="true" />
          </span>
        </button>

        {/* Filter chips — no visible scrollbar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '14px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
          className="hide-scrollbar"
        >
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              style={{
                flexShrink: 0,
                padding: '6px 16px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: activeFilter === chip.key ? 600 : 500,
                cursor: 'pointer',
                border: activeFilter === chip.key
                  ? '0.5px solid #fff'
                  : '0.5px solid rgba(255,255,255,0.2)',
                background: activeFilter === chip.key
                  ? '#fff'
                  : 'transparent',
                color: activeFilter === chip.key
                  ? '#0A3D24'
                  : 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s ease',
                fontFamily: 'Mukta, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── FEED ─────────────────────────────────── */}
      <div style={{ padding: '14px 16px' }}>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: '16px',
                height: '130px',
                border: '0.5px solid #E8EDEA',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '3px',
                  background: '#E8EDEA',
                  animation: 'shimmer 1.4s ease-in-out infinite',
                  backgroundImage: 'linear-gradient(90deg,#E8EDEA 25%,#F4F7F5 50%,#E8EDEA 75%)',
                  backgroundSize: '200% 100%',
                }} />
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '10px', width: '80px', background: '#F4F7F5', borderRadius: '100px' }} />
                  <div style={{ height: '12px', width: '100%', background: '#F4F7F5', borderRadius: '6px' }} />
                  <div style={{ height: '12px', width: '75%', background: '#F4F7F5', borderRadius: '6px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real-time new post indicator */}
        {newPostsAvailable && (
          <button
            onClick={loadNewPosts}
            style={{
              width: '100%',
              background: '#0A3D24',
              color: '#5DC9A1',
              border: 'none',
              borderRadius: '100px',
              padding: '9px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'Mukta, sans-serif',
            }}
          >
            <i className="ti ti-arrow-up" style={{ fontSize: '14px' }} />
            नए पोस्ट देखें
          </button>
        )}

        {/* Post cards */}
        {!loading && filteredPosts.length > 0 && (
          filteredPosts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}

        {/* Empty state — shown when no posts */}
        {!loading && filteredPosts.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 24px 32px',
            textAlign: 'center',
          }}>
            {/* Icon in rounded box */}
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '20px',
              background: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '28px', color: '#085041',
            }}>
              <i className="ti ti-news" aria-hidden="true" />
            </div>

            <h3 style={{
              fontSize: '16px', fontWeight: 600,
              color: '#0D1B12', marginBottom: '6px',
              fontFamily: 'Mukta, sans-serif',
            }}>
              {activeFilter === 'all'
                ? 'अभी कोई पोस्ट नहीं'
                : `कोई ${POST_TYPES[activeFilter]?.label} पोस्ट नहीं`}
            </h3>

            <p style={{
              fontSize: '13px', color: '#607068',
              lineHeight: '1.6', maxWidth: '220px',
              marginBottom: '20px',
              fontFamily: 'Mukta, sans-serif',
            }}>
              {activeFilter === 'all'
                ? 'अपने मोहल्ले में पहले पोस्ट करें और Sewak बनने की ओर बढ़ें!'
                : 'इस category में अभी कोई update नहीं है।'}
            </p>

            <button
              onClick={() => setShowPostModal(true)}
              style={{
                background: '#1D9E75',
                color: '#fff',
                border: 'none',
                borderRadius: '100px',
                padding: '11px 24px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                fontFamily: 'Mukta, sans-serif',
              }}
            >
              <i className="ti ti-pencil" aria-hidden="true" style={{ fontSize: '15px' }} />
              पोस्ट करें
            </button>
          </div>
        )}

        {/* Infinite scroll trigger — attach your existing observer here */}
        <div ref={loadMoreBoundaryRef} style={{ height: '20px' }} />
      </div>

      {/* ── POST MODAL ───────────────────────────── */}
      <AnimatePresence>
        {showPostModal && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setShowPostModal(false)}
              className="fixed inset-0 bg-[#0D1B12] bg-opacity-40 z-50 backdrop-blur-[2px]"
            />

            {/* Bottom sheet content */}
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-0 inset-x-0 bg-[#FDFFFE] rounded-t-[28px] p-5 shadow-float z-50 border-t border-[#E8EDEA] max-w-md mx-auto"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-[#A8B5AD] rounded-full mx-auto mb-4 opacity-50" />
              
              {/* Close Button */}
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-[#F4F7F5] hover:bg-[#E8EDEA] transition-colors"
              >
                <X size={16} className="text-[#607068]" />
              </button>

              <h3 className="font-extrabold text-[#0F5C3A] text-lg font-display mb-1 flex items-center gap-1.5">
                <Award className="text-[#E07B2A]" size={18} />
                <span>Board par post karein (+10 pts)</span>
              </h3>
              <p className="text-[11px] text-[#607068] mb-4 font-medium">
                Apne ward ke nagarikon ke sath koi suchna ya update share karein.
              </p>

              {postError && (
                <div className="bg-[#FDECEA] text-[#C0392B] text-xs p-2.5 rounded-xl border border-[#C0392B] border-opacity-15 text-center font-bold mb-4">
                  {postError}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                
                {/* Category selectors */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                    Post Category
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {Object.keys(POST_TYPES).map(key => {
                      const type = POST_TYPES[key]
                      const isSelected = postType === key
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPostType(key)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                            isSelected
                              ? 'bg-[#1D9E75] text-[#FDFFFE] border-[#1D9E75] shadow-sm'
                              : 'bg-[#F4F7F5] text-[#607068] border-transparent hover:border-[#1D9E75]'
                          }`}
                        >
                          <i className={`ti ${type.icon}`} aria-hidden="true" style={{ fontSize: '14px' }} />
                          <span className="text-[9px]">{type.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Floating label message input */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-extrabold text-[#607068] uppercase tracking-wide">
                    <span>Write Message</span>
                    <span className={postBody.length > 185 ? 'text-[#C0392B]' : ''}>
                      {postBody.length}/200
                    </span>
                  </div>
                  
                  <div className="relative border border-[#E8EDEA] rounded-2xl p-3 bg-[#F4F7F5] transition-all">
                    <textarea
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      onFocus={() => setBodyFocused(true)}
                      onBlur={() => setBodyFocused(false)}
                      placeholder="Apne mohalle ke liye sandesh likhein..."
                      maxLength={200}
                      rows={3}
                      className="w-full bg-transparent border-none focus:outline-none text-xs font-bold text-[#0D1B12] placeholder-[#A8B5AD] resize-none"
                      required
                    />
                    
                    {/* Focus growing line */}
                    <motion.div
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1D9E75] rounded-b-2xl"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: bodyFocused ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !postBody.trim()}
                  className="w-full bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] hover:opacity-95 text-[#FDFFFE] font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(15,92,58,0.15)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Send size={14} />
                  <span>Board Par Share Karein</span>
                </button>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Home
