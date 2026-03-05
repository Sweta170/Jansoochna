import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Building2, CheckCircle2, FileText, Sparkles, Zap,
    Lock, Trophy, FolderOpen, Plus
} from 'lucide-react'
import api from '../services/api'

export default function Profile() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))

    useEffect(() => {
        if (user.id) {
            fetchData()
        } else {
            setLoading(false)
        }
    }, [])

    async function fetchData() {
        try {
            // Fetch latest user data (points, rank) AND complaints in parallel
            const [userRes, complaintsRes] = await Promise.all([
                api.get('auth/me'),
                api.get(`/complaints?reporter_id=${user.id}`)
            ]);

            setUser(userRes.data); // Update user state with fresh data (points/rank)
            // Optionally update localStorage? Nah, simpler to just use state.

            setComplaints(complaintsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (!user.id) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div className="card">
                <h3>Access Denied</h3>
                <p>Please <Link to="/" style={{ color: 'var(--primary)' }}>login</Link> to view your profile.</p>
            </div>
        </div>
    )

    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
    const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;

    // Gamification Logic
    const nextRank = user.points < 100 ? 'Silver' : user.points < 500 ? 'Gold' : 'Platinum';
    const nextRankPoints = user.points < 100 ? 100 : user.points < 500 ? 500 : 1000;
    const progressPercent = Math.min((user.points / nextRankPoints) * 100, 100);

    if (!user.id) return (
        <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '6rem' }}>
            <div className="card" style={{ padding: '3rem', borderRadius: '24px' }}>
                <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                    <Lock size={64} strokeWidth={1} />
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900 }}>Access Denied</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please authentication to unlock your personalized citizen dashboard.</p>
                <Link to="/" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '12px' }}>Back to Home</Link>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            {/* COMPACT PROFILE HEADER */}
            <div style={{
                background: 'var(--surface)',
                borderRadius: '20px',
                padding: '1.5rem 2rem',
                border: '1px solid var(--border)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 900, color: 'white',
                        boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)'
                    }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.15rem' }}>
                            <h1 style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{user.name}</h1>
                            <span style={{
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>{user.role || 'Citizen'}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{user.email}</p>
                    </div>
                </div>

                {/* Rank Overview (Compact) */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Rank</div>
                    <div style={{
                        background: 'var(--surface-2)',
                        color: 'var(--text-main)',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Trophy size={14} className="text-primary" /> {user.rank || 'Bronze Citizen'}
                    </div>
                </div>
            </div>

            {/* HIGH-DENSITY STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: "Impact Points", value: user.points || 0, icon: Sparkles, color: 'var(--primary)' },
                    { label: "Issues Filed", value: complaints.length, icon: FileText, color: 'var(--text-main)' },
                    { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: '#10B981' },
                    { label: "Resolution", value: "4.2d", icon: Zap, color: '#F59E0B' }
                ].map((stat, i) => (
                    <div key={i} style={{
                        background: 'var(--surface)',
                        padding: '1rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ color: stat.color, background: `${stat.color}10`, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

                {/* MY ACTIVITY SECTION */}
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>Activity Stream</h2>
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => window.location.href = '/'}
                        ><Plus size={14} /> File Issue</button>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3].map(i => <div key={i} className="card skeleton-loader" style={{ height: '260px', borderRadius: '16px' }} />)}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                            {complaints.map(c => (
                                <Link key={c.id} to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="card" style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: 0,
                                        overflow: 'hidden',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ height: '110px', background: 'var(--surface-2)', position: 'relative' }}>
                                            {c.image_url ? (
                                                <img src={`http://localhost:4000/${c.image_url}`} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Building2 size={24} style={{ opacity: 0.1 }} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span className={`badge badge-${c.status}`} style={{ fontSize: '0.6rem' }}>{c.status.replace('_', ' ')}</span>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{c.title}</h3>

                                            {c.ai_summary && (
                                                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Sparkles size={12} /> AI Insight
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* SIDEBAR: COMPACT */}
                <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Progress Card */}
                    <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.25rem' }}>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1rem' }}>Level Progress</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>To {nextRank}</span>
                            <span style={{ color: 'var(--primary)' }}>{user.points}/{nextRankPoints} pts</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: 'var(--primary)',
                                borderRadius: '10px',
                                transition: 'width 1s ease-out'
                            }} />
                        </div>
                    </div>

                    {/* Resolution Hub */}
                    <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.25rem' }}>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1rem' }}>Community Pulse</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { label: 'Resolved', count: resolvedCount, color: '#10B981' },
                                { label: 'In Progress', count: inProgressCount, color: '#F59E0B' },
                                { label: 'Pending', count: complaints.length - resolvedCount - inProgressCount, color: 'var(--primary)' }
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.color }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{row.label}</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{row.count}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Success Rate</span>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>
                                {complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
