import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { connectSocket } from '../services/socket'
import ComplaintMap from './common/ComplaintMap'



export default function ComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchComplaint()
    if (token) {
      const socket = connectSocket(token)
      socket.emit('complaint:subscribe', id)
      socket.on('comment:new', (comment) => {
        setComplaint(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : prev)
      })
      socket.on('upvote:changed', () => {
        fetchComplaint()
      })
      socket.on('complaint:updated', (updated) => {
        if (updated.id === Number(id)) {
          setComplaint(prev => ({ ...prev, ...updated }))
        }
      })
      return () => {
        socket.off('comment:new')
        socket.off('upvote:changed')
        socket.off('complaint:updated')
      }
    }
  }, [id, token])

  async function fetchComplaint() {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load complaint')
      setLoading(false)
    }
  }

  async function handleUpvote() {
    try {
      await api.post(`/complaints/${id}/upvote`)
      fetchComplaint()
    } catch (err) {
      if (err.response && err.response.status === 409) alert('Already upvoted')
      else alert('Upvote failed')
    }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentBody.trim()) return
    try {
      const res = await api.post(`/complaints/${id}/comments`, { body: commentBody })
      setCommentBody('')
    } catch (err) {
      alert('Failed to post comment')
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      const res = await api.put(`/complaints/${id}/status`, { status: newStatus })
      setComplaint(prev => ({ ...prev, status: res.data.status }))
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>
  if (error) return <div className="container" style={{ padding: '2rem' }}>{error}</div>
  if (!complaint) return <div className="container" style={{ padding: '2rem' }}>Complaint not found</div>

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminOrAuthority = user.role === 'admin' || user.role === 'authority';

  return (
    <div className="container">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
        ← Back to Feed
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

        {/* LEFT COLUMN: DETAILS */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>{complaint.title}</h1>
            </div>

            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <span>📅 {new Date(complaint.created_at).toLocaleDateString()}</span>
              <span>👤 {complaint.reporter?.name || 'Unknown'}</span>
              {complaint.category && <span>📍 {complaint.category.name}</span>}
            </div>

            {complaint.image_url && (
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem', boxShadow: 'var(--shadow-md)' }}>
                <img
                  src={`http://localhost:4000/${complaint.image_url}`}
                  alt="Proof"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              {complaint.description}
            </div>

            {complaint.ai_summary && (
              <div style={{ background: '#EFF6FF', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>🤖 AI Analysis</strong>
                {complaint.ai_summary.summary || complaint.ai_summary}
              </div>
            )}

            <ComplaintMap latitude={complaint.latitude} longitude={complaint.longitude} />
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & COMMENTS */}
        <div>
          {/* STATUS CARD */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Current Status</h3>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1rem' }}>
              <span className={`badge badge-${complaint.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {isAdminOrAuthority && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Update Status</label>
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          {/* UPVOTE CARD */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Priority</h3>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{complaint.priority_score || 0}</span>
            </div>
            <button
              onClick={handleUpvote}
              className="btn btn-secondary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              👍 Boost Priority ({complaint.upvotes ? complaint.upvotes.length : 0})
            </button>
          </div>

          {/* COMMENTS */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Discussion</h3>

            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
              {complaint.comments && complaint.comments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {complaint.comments.map(c => (
                    <div key={c.id} style={{
                      background: c.author_id === Number(complaint.reporter_id) ? '#F0F9FF' : 'var(--background)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      alignSelf: c.author_id === user.id ? 'flex-end' : 'flex-start',
                      maxWidth: '90%'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                        {c.author_id === Number(complaint.reporter_id) ? 'OP' : `User #${c.author_id}`}
                      </div>
                      <div>{c.body}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No comments yet.</div>
              )}
            </div>

            <form onSubmit={handleComment}>
              <div className="input-group">
                <textarea
                  value={commentBody}
                  onChange={e => setCommentBody(e.target.value)}
                  placeholder="Add a comment..."
                  rows="2"
                  style={{ resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Comment</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
