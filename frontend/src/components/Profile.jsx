import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
                api.get('/auth/me'),
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

    return (
        <div className="container">
            {/* Header / Profile Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', padding: '2rem' }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'var(--primary)', color: 'white', fontSize: '2.5rem', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{user.name}</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <span>📧 {user.email}</span>
                        <span className="badge" style={{ background: '#E2E8F0', color: '#475569' }}>{user.role || 'Citizen'}</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 2rem', borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{user.points || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Points</div>
                    <div style={{ marginTop: '0.5rem', background: 'gold', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {user.rank || 'Citizen'}
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 2rem', borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{complaints.length}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Complaints</div>
                </div>
            </div>

            {/* My Complaints Grid */}
            <h2 style={{ marginBottom: '1.5rem' }}>My Activity</h2>

            {loading ? <div>Loading...</div> : (
                <>
                    {complaints.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>You haven't submitted any complaints yet.</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.location.href = '/'}>
                                Create Your First Complaint
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {complaints.map(c => (
                                <Link key={c.id} to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                        {/* Image Thumbnail */}
                                        <div style={{ height: '150px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {c.image_url ? (
                                                <img src={`http://localhost:4000/${c.image_url}`} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '2rem', opacity: 0.2 }}>📷</span>
                                            )}
                                        </div>

                                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', flex: 1 }}>{c.title}</h3>

                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {c.description}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
