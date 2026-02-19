import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { connectSocket } from '../services/socket'

export default function ComplaintList({ token }) {
  const [complaints, setComplaints] = useState([])
  const [categories, setCategories] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchList()

    if (token) {
      const socket = connectSocket(token)
      socket.on('complaint:created', (c) => {
        setComplaints(prev => [c, ...prev])
      })
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

  // Re-fetch when filters change
  useEffect(() => {
    fetchList()
  }, [statusFilter, categoryFilter])

  async function fetchCategories() {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch (err) { console.error(err) }
  }

  async function fetchList() {
    try {
      let query = '?'
      if (statusFilter) query += `status=${statusFilter}&`
      if (categoryFilter) query += `category_id=${categoryFilter}&`

      const res = await api.get(`/complaints${query}`)
      setComplaints(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Latest Complaints</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', minWidth: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ padding: '0.5rem', minWidth: '150px' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {complaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h3>No complaints found</h3>
          <p>Try adjusting your filters or report a new issue.</p>
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {complaints.map(c => (
          <Link key={c.id} to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              {/* Image Thumbnail */}
              <div style={{ height: '180px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {c.image_url ? (
                  <img src={`http://localhost:4000/${c.image_url}`} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem', opacity: 0.2 }}>📷</span>
                )}
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', flex: 1 }}>{c.title}</h3>

                {c.category && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    📍 {c.category.name}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {c.ai_summary || (c.ai_summary && c.ai_summary.summary) ? (
                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#555' }}>
                      "{(c.ai_summary?.summary || c.ai_summary).substring(0, 80)}..."
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#999' }}>Processing summary...</div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
