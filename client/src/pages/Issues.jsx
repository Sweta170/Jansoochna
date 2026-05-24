import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import IssueCard, { CATEGORY_TAGS } from '../components/IssueCard'
import { Map, List, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, scaleIn } from '../lib/motionVariants'

// Custom category icons for Map markers
const getMarkerIcon = (category) => {
  let color = 'blue'
  if (category === 'road') color = 'red'
  if (category === 'water') color = 'blue'
  if (category === 'electricity') color = 'orange'
  if (category === 'garbage') color = 'violet'
  if (category === 'other') color = 'grey'

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [22, 36],
    iconAnchor: [11, 36],
    popupAnchor: [1, -30],
    shadowSize: [36, 36]
  })
}

const CATEGORY_FILTERS = [
  { id: 'all', labelHindi: 'सभी', emoji: '⚠️' },
  { id: 'road', labelHindi: 'सड़क', emoji: '🛣️' },
  { id: 'water', labelHindi: 'पानी', emoji: '💧' },
  { id: 'electricity', labelHindi: 'बिजली', emoji: '⚡' },
  { id: 'garbage', labelHindi: 'कूड़ा', emoji: '🧹' }
]

const Issues = () => {
  const { user } = useAuth()
  const [view, setView] = useState('list') // 'list' | 'map'
  const [issues, setIssues] = useState([])
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [mapCenter, setMapCenter] = useState([30.9010, 75.8573]) // Default Ludhiana

  const observerRef = useRef(null)
  const loadMoreBoundaryRef = useRef(null)

  const fetchIssues = async (pageNum, replace = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await api.get(
        `/issues?pincode=${user?.pincode || ''}&category=${category}&page=${pageNum}&limit=10`
      )
      const fetched = response.data.issues
      
      setIssues(prev => replace ? fetched : [...prev, ...fetched])
      setHasMore(response.data.pagination.hasMore)
      
      // Update map center to match first issue if available
      if (replace && fetched.length > 0 && fetched[0].location?.lat) {
        setMapCenter([fetched[0].location.lat, fetched[0].location.lng])
      }
    } catch (err) {
      console.error('Error fetching issues:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchIssues(1, true)
  }, [category, user?.pincode])

  // Setup infinite scroll observer for List view
  useEffect(() => {
    if (loading || !hasMore || view !== 'list') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchIssues(nextPage)
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
  }, [page, hasMore, loading, loadingMore, view])

  const handleVoteUpdated = (issueId, nextCount, nextVoted) => {
    setIssues(prev =>
      prev.map(i =>
        i._id === issueId
          ? { ...i, voteCount: nextCount, userHasVoted: nextVoted }
          : i
      )
    )
  }

  return (
    <div className="flex flex-col h-full relative pb-20">
      
      {/* Top Filter Bar */}
      <div className="bg-[#FDFFFE] border-b border-[#E8EDEA] p-3 space-y-3 z-30 shadow-[0_2px_8px_rgba(15,92,58,0.03)]">
        
        {/* Map / List toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-extrabold text-[#0F5C3A] font-display leading-none">
              Ward Issues
            </h1>
            <p className="text-[10px] font-bold text-[#607068] uppercase tracking-wider">
              आस-पास की शिकायतें
            </p>
          </div>

          <div className="bg-[#F4F7F5] p-1 rounded-xl border border-[#E8EDEA] flex gap-0.5">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                view === 'list'
                  ? 'bg-[#1D9E75] text-[#FDFFFE] shadow-sm'
                  : 'text-[#607068] hover:text-[#0D1B12]'
              }`}
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                view === 'map'
                  ? 'bg-[#1D9E75] text-[#FDFFFE] shadow-sm'
                  : 'text-[#607068] hover:text-[#0D1B12]'
              }`}
            >
              <Map size={13} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Category filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-none">
          {CATEGORY_FILTERS.map(f => {
            const isSelected = category === f.id
            return (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCategory(f.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-[#0F5C3A] text-[#FDFFFE] border-[#0F5C3A] shadow-sm'
                    : 'bg-[#FDFFFE] text-[#607068] border-[#E8EDEA] hover:border-[#0F5C3A]'
                }`}
              >
                <span>{f.emoji}</span>
                <span>{f.labelHindi}</span>
              </motion.button>
            )
          })}
        </div>

      </div>

      {/* Main Body view */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list-view"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-[#FDFFFE] p-4 rounded-[20px] border border-[#E8EDEA] animate-pulse space-y-3">
                      <div className="flex justify-between">
                        <div className="w-16 h-4 bg-[#E8EDEA] rounded"></div>
                        <div className="w-12 h-3 bg-[#E8EDEA] rounded"></div>
                      </div>
                      <div className="h-4 bg-[#E8EDEA] rounded w-3/4"></div>
                      <div className="h-2 bg-[#E8EDEA] rounded w-full"></div>
                      <div className="h-2 bg-[#E8EDEA] rounded w-5/6"></div>
                      <div className="h-8 bg-[#E8EDEA] rounded-xl w-full mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : issues.length === 0 ? (
                <motion.div
                  variants={scaleIn}
                  className="text-center py-16 bg-[#FDFFFE] rounded-[24px] border border-[#E8EDEA] p-6 space-y-3 shadow-sm"
                >
                  <span className="text-5xl block">🛠️</span>
                  <h3 className="font-extrabold text-[#0F5C3A] text-lg font-display">Sari shikayatein hal ho gayi hain!</h3>
                  <p className="text-xs text-[#607068] max-w-[240px] mx-auto leading-relaxed">
                    Aapke pincode mein is category ka koi khula issue nahi hai. Nagarik banein aur naye issues report karein!
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {issues.map(issue => (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        onVoteUpdated={handleVoteUpdated}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div ref={loadMoreBoundaryRef} className="h-14 flex items-center justify-center pt-2">
                      {loadingMore && (
                        <div className="w-6 h-6 border-3 border-[#1D9E75] border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            /* Map View Container */
            <motion.div
              key="map-view"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-[60vh] w-full rounded-[24px] overflow-hidden border border-[#E8EDEA] shadow-card relative z-10"
            >
              <MapContainer
                center={mapCenter}
                zoom={14}
                zoomControl={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.map(issue => {
                  if (!issue.location?.lat) return null
                  const statusConfig = STATUS_TAGS[issue.status] || STATUS_TAGS.open
                  return (
                    <Marker
                      key={issue._id}
                      position={[issue.location.lat, issue.location.lng]}
                      icon={getMarkerIcon(issue.category)}
                    >
                      <Popup maxWidth={260}>
                        <div className="space-y-2 p-1.5 font-noto">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[9px] font-extrabold text-[#C0392B] uppercase">
                              {issue.category}
                            </span>
                            <span className="text-[8px] font-extrabold uppercase bg-[#E1F5EE] text-[#0F5C3A] px-1 rounded">
                              {statusConfig.label}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-xs leading-snug font-display text-[#0F5C3A] m-0">
                            {issue.title}
                          </h4>
                          <p className="text-[10px] text-[#607068] m-0 line-clamp-2 leading-relaxed">
                            {issue.description}
                          </p>
                          <Link
                            to={`/issues/${issue._id}`}
                            className="text-[10px] text-[#1D9E75] font-extrabold hover:underline block pt-1 border-t border-[#E8EDEA] text-right"
                          >
                            Poora dekhein ➔
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB to Report new issue */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <Link
          to="/report"
          className="bg-gradient-to-r from-[#1D9E75] to-[#0F5C3A] hover:opacity-95 text-[#FDFFFE] p-4 rounded-full shadow-float flex items-center justify-center border-[3px] border-[#FDFFFE]"
          title="Shikayat report karein"
        >
          <Plus size={22} />
        </Link>
      </motion.div>

    </div>
  )
}

const STATUS_TAGS = {
  open: { label: 'खुला', color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'काम चालू', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'सुलझाया गया', color: 'bg-green-100 text-green-800' }
}

export default Issues
export { getMarkerIcon }
