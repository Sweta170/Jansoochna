import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Flame, Clock, Calendar, List, Map, Filter,
  Sparkles, Camera, ThumbsUp, MessageSquare, Lightbulb, RotateCcw
} from 'lucide-react'
import api from '../services/api'
import { connectSocket } from '../services/socket'
import MapView from './MapView'
import ComplaintCalendar from './ComplaintCalendar'

export default function ComplaintList({ token }) {
  const [complaints, setComplaints] = useState([])
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' or 'map'

  // Filters
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('') // debounced
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('priority')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null) // calendar selection

  useEffect(() => {
    fetchCategories()
    fetchDepartments()

    if (token) {
      const socket = connectSocket(token)
      socket.on('complaint:created', fetchList)
      socket.on('ai:summary_ready', ({ complaint_id, summary, priority_score }) => {
        setComplaints(prev => prev.map(p => p.id === complaint_id ? { ...p, ai_summary: summary, priority_score } : p))
      })
      socket.on('complaint:updated', (updated) => {
        setComplaints(prev => prev.map(p => p.id === updated.id ? updated : p))
      })
      return () => {
        try { socket.off('complaint:created') } catch (e) { }
        try { socket.off('ai:summary_ready') } catch (e) { }
        try { socket.off('complaint:updated') } catch (e) { }
      }
    }
  }, [token])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  // Re-fetch when any filter changes
  useEffect(() => {
    fetchList()
  }, [search, statusFilter, categoryFilter, departmentFilter, sortFilter, dateFrom, dateTo])

  async function fetchCategories() {
    try { const r = await api.get('categories'); setCategories(r.data) } catch (e) { }
  }
  async function fetchDepartments() {
    try {
      const r = await api.get('departments')
      setDepartments(r.data)
    } catch (e) {
      console.error('Failed to fetch departments:', e)
    }
  }

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('category_id', categoryFilter)
      if (departmentFilter) params.set('department_id', departmentFilter)
      if (sortFilter) params.set('sort', sortFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const res = await api.get(`/complaints?${params.toString()}`)
      setComplaints(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, categoryFilter, departmentFilter, sortFilter, dateFrom, dateTo])

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
    setDepartmentFilter('')
    setSortFilter('priority')
    setDateFrom('')
    setDateTo('')
    setSelectedDate(null)
  }

  function handleDateSelect(dateKey) {
    setSelectedDate(dateKey)
    if (dateKey) {
      setDateFrom(dateKey)
      setDateTo(dateKey)
    } else {
      setDateFrom('')
      setDateTo('')
    }
  }

  const hasActiveFilters = search || statusFilter || categoryFilter || departmentFilter || dateFrom || dateTo || selectedDate

  const statusColors = {
    open: { bg: '#FEE2E2', color: '#991B1B' },
    in_progress: { bg: '#FEF3C7', color: '#92400E' },
    resolved: { bg: '#D1FAE5', color: '#065F46' },
    closed: { bg: '#E2E8F0', color: '#475569' }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.5rem', alignItems: 'start' }} className="animate-fade-in">
      {/* LEFT: Main Feed Content */}
      <div style={{ minWidth: 0 }}>
        {/* PREMIUM TOOLBAR */}
        <div style={{
          background: 'var(--surface)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar - Main focus */}
            <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--primary)' }} />
              <input
                type="text"
                placeholder="Search issues, categories..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{
                  paddingLeft: '3rem',
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--background)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
            </div>

            {/* View Switcher Toggle */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', padding: '3px', borderRadius: '14px', border: '1px solid var(--border)', height: '44px', alignItems: 'center' }}>
              <button
                onClick={() => setView('list')}
                style={{
                  padding: '0 1rem',
                  height: '38px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: view === 'list' ? 'var(--surface)' : 'transparent',
                  color: view === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: view === 'list' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} /> List
              </button>
              <button
                onClick={() => setView('map')}
                style={{
                  padding: '0 1rem',
                  height: '38px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: view === 'map' ? 'var(--surface)' : 'transparent',
                  color: view === 'map' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: view === 'map' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Map size={16} /> Map
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                height: '44px',
                minWidth: '110px',
                background: showFilters ? 'var(--primary)' : 'var(--background)',
                color: showFilters ? 'white' : 'var(--text-main)',
                border: '1.5px solid ' + (showFilters ? 'var(--primary)' : 'var(--border)'),
                borderRadius: '12px',
                padding: '0 1.25rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: showFilters ? '0 8px 16px var(--primary-glow)' : 'none'
              }}
            >
              <Filter size={18} />
              <span>Filters</span>
              {hasActiveFilters && (
                <div style={{
                  background: showFilters ? 'white' : 'var(--primary)',
                  color: showFilters ? 'var(--primary)' : 'white',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>!</div>
              )}
            </button>
          </div>

          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            alignItems: 'end',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div>
              <label className="input-label">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field" style={{ height: '44px', borderRadius: '12px', fontSize: '0.85rem', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
                <option value="">Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="input-label">Category</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-field" style={{ height: '44px', borderRadius: '12px', fontSize: '0.85rem', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
                <option value="">Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="input-label">Sort Order</label>
              <select value={sortFilter} onChange={e => setSortFilter(e.target.value)} className="input-field" style={{ height: '44px', borderRadius: '12px', fontSize: '0.85rem', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
                <option value="priority">Priority Score</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div style={{ display: 'flex' }}>
              <button
                onClick={clearFilters}
                style={{
                  height: '44px',
                  width: '100%',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  border: '1.5px solid transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  opacity: hasActiveFilters ? 1 : 0.5
                }}
                disabled={!hasActiveFilters}
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          {/* Search Result Meta */}
          <div style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {loading ? (
              <span className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> Refreshing issues list...
              </span>
            ) : (
              <span>
                Found <strong>{complaints.length}</strong> {complaints.length === 1 ? 'issue' : 'issues'}
                {search && <span> for "<strong>{search}</strong>"</span>}
              </span>
            )}
          </div>
        </div>

        {/* FEED CONTENT */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card skeleton-loader" style={{ height: '380px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '2px dashed var(--border)',
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              <Search size={64} strokeWidth={1} />
            </div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>No issues matched</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 2rem auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
              We couldn't find any reports matching your current search or filters. Try adjusting your criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-primary btn-lg"
                style={{ borderRadius: '14px', padding: '0.75rem 2rem' }}
              >
                <RotateCcw size={18} /> Clear All Filters
              </button>
            )}
          </div>
        ) : view === 'map' ? (
          <div style={{ height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapView complaints={complaints} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {complaints.map(c => (
              <Link key={c.id} to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '20px',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.18)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Card Media Section */}
                  <div style={{ height: '140px', background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                    {c.image_url ? (
                      <img
                        src={`http://localhost:4000/${c.image_url}`}
                        alt="proof"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
                        <Camera size={48} style={{ opacity: 0.1 }} />
                      </div>
                    )}

                    {/* Quality/Status Badge Floating */}
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      padding: '5px 12px',
                      borderRadius: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'white',
                      color: statusColors[c.status]?.color || 'var(--text-main)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                      {c.status.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Meta Info Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(14, 165, 233, 0.08)', color: 'var(--primary)', padding: '3px 6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ThumbsUp size={11} /> {c.upvotes?.length || 0}
                        </div>
                        <div style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '3px 6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MessageSquare size={11} /> {c.comments?.length || 0}
                        </div>
                      </div>
                    </div>

                    {/* Issue Title */}
                    <h3 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 800,
                      lineHeight: 1.3,
                      marginBottom: '0.75rem',
                      color: 'var(--text-main)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '2.6rem',
                      letterSpacing: '-0.01em'
                    }}>
                      {c.title}
                    </h3>

                    {/* AI Summary Card */}
                    {c.ai_summary?.summary ? (
                      <div style={{
                        marginTop: 'auto',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.08) 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.12)',
                        minHeight: '60px'
                      }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> AI Insight
                        </div>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-main)',
                          fontWeight: 500,
                          lineHeight: 1.4,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {c.ai_summary.summary}
                        </p>
                      </div>
                    ) : (
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {c.description}
                        </p>
                      </div>
                    )}

                    {/* Card Footer: Category + Reporter */}
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--primary) 0%, #0EA5E9 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: 'white',
                          boxShadow: '0 4px 8px rgba(14, 165, 233, 0.3)'
                        }}>
                          {c.reporter?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {c.reporter?.name?.split(' ')[0] || 'Citizen'}
                        </span>
                      </div>

                      {c.category && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'var(--surface-2)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)'
                        }}>
                          #{c.category.name.toLowerCase().replace(/\s+/g, '')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Calendar Sidebar */}
      <div style={{ position: 'sticky', top: '100px', zIndex: 5 }}>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '4px' }}></div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Activity Pulse</span>
        </div>
        <ComplaintCalendar
          complaints={complaints}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        <div style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'var(--surface)',
          borderRadius: '18px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} color="#F59E0B" /> Quick Tip
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Click on any date in the calendar to view issues reported on that specific day.
          </p>
        </div>
      </div>
    </div>
  );
}
