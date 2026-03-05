import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox, User, Calendar, Tag, Camera } from 'lucide-react'
import api from '../../services/api'

export default function OfficialDashboard() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [resolutionFiles, setResolutionFiles] = useState({}) // { complaintId: File }
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        async function fetchComplaints() {
            try {
                const res = await api.get('official/complaints')
                setComplaints(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchComplaints()
    }, [])

    async function handleStatusChange(complaintId, newStatus) {
        if (newStatus === 'resolved' && !resolutionFiles[complaintId]) {
            alert('Please select a proof-of-work image first.');
            return;
        }

        try {
            setUpdatingId(complaintId)

            const formData = new FormData();
            formData.append('status', newStatus);
            if (newStatus === 'resolved' && resolutionFiles[complaintId]) {
                formData.append('resolution_image', resolutionFiles[complaintId]);
            }

            await api.put(`/official/complaints/${complaintId}/status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setComplaints(prev =>
                prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c)
            )
            // Clear file after success
            setResolutionFiles(prev => {
                const updated = { ...prev };
                delete updated[complaintId];
                return updated;
            });
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdatingId(null)
        }
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your department's complaints...</div>

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Official Dashboard</h1>
                <p className="text-muted">Manage issues assigned to your department.</p>
            </div>

            {complaints.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
                        <Inbox size={64} strokeWidth={1} />
                    </div>
                    <p>No complaints assigned to your department yet.</p>
                    <p style={{ fontSize: '0.9rem' }}>Ask an Admin to assign issues to your department.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {complaints.map(c => (
                        <div key={c.id} className="card" style={{
                            borderLeft: c.status === 'resolved' ? '5px solid var(--success)' :
                                c.status === 'in_progress' ? '5px solid var(--warning)' : '5px solid var(--danger)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <Link to={`/complaints/${c.id}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none', color: 'var(--text-main)' }}>
                                            #{c.id} {c.title}
                                        </Link>
                                        <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                                        {c.priority_score > 10 && (
                                            <span style={{ fontSize: '0.75rem', background: 'red', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>URGENT</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {c.reporter?.name || 'Unknown'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(c.created_at).toLocaleDateString()}</span>
                                        {c.category && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> {c.category.name}</span>}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {c.description}
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div style={{ minWidth: '220px', textAlign: 'right' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Update Status</label>
                                    <select
                                        id={`status-${c.id}`}
                                        defaultValue={c.status}
                                        disabled={updatingId === c.id || c.status === 'resolved'}
                                        style={{ fontSize: '0.85rem', width: '100%', height: '40px', padding: '0 0.75rem', borderRadius: '8px' }}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== 'resolved') {
                                                handleStatusChange(c.id, val);
                                            }
                                        }}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>

                                    {/* Resolution Proof Upload */}
                                    {document.getElementById(`status-${c.id}`)?.value === 'resolved' && c.status !== 'resolved' && (
                                        <div style={{ marginTop: '0.75rem', textAlign: 'left', background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--success)' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', color: 'var(--success)' }}>
                                                <Camera size={14} /> Upload Proof Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setResolutionFiles(prev => ({ ...prev, [c.id]: e.target.files[0] }))}
                                                style={{ fontSize: '0.75rem', width: '100%' }}
                                            />
                                            <button
                                                onClick={() => handleStatusChange(c.id, 'resolved')}
                                                disabled={updatingId === c.id || !resolutionFiles[c.id]}
                                                style={{ marginTop: '0.5rem', width: '100%', background: 'var(--success)', fontSize: '0.8rem', padding: '0.4rem', borderRadius: '6px' }}
                                            >
                                                Confirm Resolution
                                            </button>
                                        </div>
                                    )}

                                    {updatingId === c.id && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Updating...</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
