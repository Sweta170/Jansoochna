import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Building, MapPin, Calendar, User, ThumbsUp,
  Check, Sparkles, AlertTriangle, CheckCircle2, MessageSquare,
  Star, ChevronRight, Inbox, Volume2, VolumeX
} from 'lucide-react';
import api from '../services/api'
import { connectSocket } from '../services/socket'
import ComplaintMap from './common/ComplaintMap'

export default function ComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [error, setError] = useState(null)
  const [departments, setDepartments] = useState([])
  const [assigningDept, setAssigningDept] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const token = localStorage.getItem('token')

  // Monitor for speech ending to reset button state
  useEffect(() => {
    const checkSpeech = () => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
      }
    };
    const interval = setInterval(checkSpeech, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSpeak = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const isAdminOrAuthority = isAdmin || user.role === 'authority';

  useEffect(() => {
    api.get('departments').then(res => setDepartments(res.data)).catch(() => { })
  }, [])

  async function fetchComplaint() {
    try {
      const res = await api.get(`complaints/${id}`);
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
      await api.post(`/complaints/${id}/comments`, { body: commentBody })
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

  async function handleAssignDepartment(deptId) {
    try {
      setAssigningDept(true)
      await api.put(`/admin/complaints/${id}/assign`, { department_id: deptId || null })
      await fetchComplaint()
      alert(deptId ? 'Department assigned successfully!' : 'Department unassigned.')
    } catch (err) {
      alert('Failed to assign department')
    } finally {
      setAssigningDept(false)
    }
  }

  async function handleVerify() {
    try {
      await api.post(`/complaints/${id}/verify`)
      await fetchComplaint()
      alert('Thank you for verifying! +5 points rewarded.')
    } catch (err) {
      if (err.response?.status === 409) alert('You have already verified this fix.')
      else alert(err.response?.data?.error || 'Verification failed')
    }
  }

  async function handleRate(rating, feedback) {
    try {
      await api.post(`/complaints/${id}/rate`, { rating, feedback });
      await fetchComplaint();
      alert('Thank you for your feedback!');
    } catch (err) {
      alert(err.response?.data?.error || 'Rating failed');
    }
  }

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>
  if (error) return <div className="container" style={{ padding: '2rem' }}>{error}</div>
  if (!complaint) return <div className="container" style={{ padding: '2rem' }}>Complaint not found</div>

  const statusSteps = ['open', 'in_progress', 'resolved', 'closed'];
  const currentStepIndex = statusSteps.indexOf(complaint.status);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Back Button */}
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '0.9rem',
        transition: 'color 0.2s'
      }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
        <ArrowLeft size={16} /> Back to Feed
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem', alignItems: 'start' }}>

        {/* LEFT COLUMN: Main Content */}
        <div style={{ minWidth: 0 }}>

          {/* PREMIUM HERO SECTION */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2rem'
          }}>
            {/* Image Banner */}
            <div style={{ height: '280px', background: 'var(--surface-2)', position: 'relative' }}>
              {complaint.image_url ? (
                <img
                  src={`http://localhost:4000/${complaint.image_url}`}
                  alt="Complaint Proof"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
                  <Building size={80} style={{ opacity: 0.1 }} />
                </div>
              )}

              {/* Category Floating Badge */}
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 900,
                color: 'var(--primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <MapPin size={14} /> {complaint.category?.name || 'Uncategorized'}
              </div>
            </div>

            {/* Title & Stats */}
            <div style={{ padding: '1.5rem 2rem' }}>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.75rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>{complaint.title}</h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Filed by {complaint.reporter?.name || 'Citizen'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ThumbsUp size={14} /> {complaint.upvotes?.length || 0} Citizens impacted
                </div>
              </div>
            </div>
          </div>

          {/* STATUS TRACKER (Lifecycle Timeline) */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.5rem' }}>Complaint Lifecycle</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {JSON.parse(complaint.timeline || '[]').map((evt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                  {/* Vertical line connector */}
                  {idx < JSON.parse(complaint.timeline || '[]').length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      left: '14px',
                      width: '2px',
                      height: 'calc(100% + 0.5rem)',
                      background: 'var(--border)'
                    }} />
                  )}

                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                    zIndex: 2
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{evt.stage}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(evt.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RATING SECTION (If Resolved & Not Rated) */}
          {(complaint.status === 'resolved' || complaint.status === 'closed') && !complaint.rating && complaint.reporter_id === user.id && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.12) 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '2.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '0.5rem' }}>Rate the Resolution</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Help us improve by rating how this issue was handled.</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => {
                      const feedback = prompt('Optional feedback:');
                      handleRate(star, feedback);
                    }}
                    style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 18px', fontSize: '1.2rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    <Star size={18} fill="#F59E0B" stroke="#F59E0B" /> {star}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RATING DISPLAY (If Rated) */}
          {complaint.rating && (
            <div style={{
              background: 'var(--surface)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '2rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <Sparkles size={40} color="#F59E0B" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Citizen Rating</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, marginTop: '4px', display: 'flex', gap: '2px' }}>
                  {Array(complaint.rating).fill(0).map((_, i) => <Star key={i} size={18} fill="#F59E0B" stroke="#F59E0B" />)}
                </div>
                {complaint.feedback && <p style={{ margin: '8px 0 0', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>"{complaint.feedback}"</p>}
              </div>
            </div>
          )}

          {/* DESCRIPTION & AI INSIGHT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'var(--surface)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '1.5rem 2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Details</h3>
                <button
                  onClick={() => handleSpeak(complaint.description)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: isSpeaking ? 'var(--primary-light)' : 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isSpeaking ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSpeaking ? <><VolumeX size={14} /> Stop Reading</> : <><Volume2 size={14} /> Read Description</>}
                </button>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-main)', margin: 0 }}>
                {complaint.description}
              </p>
            </div>

            {complaint.ai_summary && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} /> AI CORE INSIGHT
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#1E293B', fontWeight: 500, margin: 0 }}>
                  {complaint.ai_summary.summary || complaint.ai_summary}
                </p>
                {/* Decorative glow */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', opacity: 0.1, filter: 'blur(60px)', pointerEvents: 'none' }} />
              </div>
            )}
          </div>

          {/* RESOLUTION COMPARISON (If Resolved) */}
          {complaint.status === 'resolved' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.25rem', textAlign: 'center' }}>Resolution Progress</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-2)', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--danger)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <AlertTriangle size={12} /> Reported Condition
                  </div>
                  <img src={`http://localhost:4000/${complaint.image_url}`} alt="Before" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid #10B981' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} /> Fixed & Verified
                  </div>
                  <img src={`http://localhost:4000/${complaint.resolution_image_url}`} alt="After" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          )}

          {/* LOCATION MAP */}
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '3rem' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, margin: 0 }}>Incident Location</h3>
            </div>
            <div style={{ height: '300px' }}>
              <ComplaintMap latitude={complaint.latitude} longitude={complaint.longitude} />
            </div>
          </div>

          {/* DISCUSSION HUB */}
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={18} /> Discussion Hub <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>({complaint.comments?.length || 0})</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments.map(c => {
                  const isAuthor = c.author_id === complaint.reporter_id;
                  const isSelf = c.author_id === user.id;
                  return (
                    <div key={c.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isAuthor ? 'var(--primary)' : 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        color: isAuthor ? 'white' : 'var(--text-muted)',
                        boxShadow: isAuthor ? '0 4px 10px rgba(14, 165, 233, 0.3)' : 'none'
                      }}>
                        {String(c.author_id).charAt(0)}
                      </div>
                      <div style={{
                        flex: 1,
                        background: isAuthor ? 'rgba(14, 165, 233, 0.05)' : 'var(--background)',
                        padding: '1.25rem',
                        borderRadius: '0 18px 18px 18px',
                        border: isAuthor ? '1px solid rgba(14, 165, 233, 0.15)' : '1px solid var(--border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>User #{c.author_id}</span>
                          {isAuthor && <span style={{ fontSize: '0.55rem', fontWeight: 900, padding: '2px 5px', background: 'var(--primary)', color: 'white', borderRadius: '4px', textTransform: 'uppercase' }}>Reporter</span>}
                          {isSelf && <span style={{ fontSize: '0.55rem', fontWeight: 900, padding: '2px 5px', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: '4px', textTransform: 'uppercase' }}>You</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-main)' }}>{c.body}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <MessageSquare size={48} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontWeight: 600 }}>No comments yet. Start the discussion!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleComment} style={{ position: 'relative' }}>
              <textarea
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                placeholder="Share your thoughts or update..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '1.25rem',
                  borderRadius: '18px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--background)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!commentBody.trim()}
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 700
                }}
              >
                Post Comment
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Actions Hub */}
        <div style={{ position: 'sticky', top: '100px' }}>

          {/* ACTION CENTER CARD */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 900, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Action Center</h3>

            {/* Priority Booster */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Issue Priority</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{complaint.priority_score || 0}</span>
              </div>
              <button
                onClick={handleUpvote}
                className="btn"
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #0EA5E9 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <ThumbsUp size={16} /> Boost Priority
              </button>
            </div>

            {/* Verification (If Resolved) */}
            {complaint.status === 'resolved' && (
              <div style={{
                padding: '1.25rem',
                background: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '18px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Verification Pulse</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                  <span>Community Trust</span>
                  <span>{Math.round((complaint.verification_count / 3) * 100)}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div style={{ width: `${Math.min((complaint.verification_count / 3) * 100, 100)}%`, height: '100%', background: '#10B981', transition: 'width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
                </div>

                {complaint.verification_count < 3 && user.id && complaint.reporter_id !== user.id && !JSON.parse(complaint.verified_by || '[]').includes(user.id) ? (
                  <button
                    onClick={handleVerify}
                    className="btn"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#10B981', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <CheckCircle2 size={16} /> Confirm Resolution
                  </button>
                ) : complaint.verification_count >= 3 && (
                  <div style={{ textAlign: 'center', color: '#10B981', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Check size={16} /> VERIFIED BY CITIZENS
                  </div>
                )}
              </div>
            )}

            {/* Admin Controls */}
            {isAdminOrAuthority && (
              <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Authority Actions</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Update Status</span>
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="input-field"
                      style={{ height: '44px', fontWeight: 600 }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {isAdmin && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Assign Department</span>
                      <select
                        defaultValue={complaint.department_id || ''}
                        onChange={(e) => handleAssignDepartment(e.target.value)}
                        className="input-field"
                        style={{ height: '44px', fontWeight: 600 }}
                        disabled={assigningDept}
                      >
                        <option value="">&mdash; Unassigned &mdash;</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* QUICK INFO CARD */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Impact Stats</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upvotes</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{complaint.upvotes?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Discussion</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{complaint.comments?.length || 0}</span>
              </div>
              {complaint.department && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Handling Dept</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{complaint.department.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
