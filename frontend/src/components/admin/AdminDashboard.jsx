import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import {
    FileText, AlertCircle, Hammer, CheckCircle2,
    Clock, BarChart3, Flame
} from 'lucide-react'

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)

    const [complaints, setComplaints] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                const [metricsRes, complaintsRes] = await Promise.all([
                    api.get('admin/metrics'),
                    api.get('complaints?status=open')
                ]);
                setMetrics(metricsRes.data);
                setComplaints(complaintsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading dashboard metrics...</div>
    if (!metrics) return (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--danger)' }}>Access Denied</h3>
            <p>Unable to load metrics. Please ensure you are logged in with an Admin account.</p>
        </div>
    )

    const cards = [
        { label: 'Total Complaints', value: metrics.total, color: 'var(--primary)', icon: <FileText size={24} /> },
        { label: 'Open Issues', value: metrics.open, color: 'var(--danger)', icon: <AlertCircle size={24} /> },
        { label: 'In Progress', value: metrics.inProgress, color: 'var(--warning)', icon: <Hammer size={24} /> },
        { label: 'Resolved', value: metrics.resolved, color: 'var(--success)', icon: <CheckCircle2 size={24} /> },
        { label: 'Avg Resolution Time', value: metrics.avgResolutionHours ? `${metrics.avgResolutionHours.toFixed(1)} hrs` : '—', color: '#8B5CF6', icon: <Clock size={24} /> },
    ]

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                    <p className="text-muted">Overview of platform activity and performance.</p>
                </div>
                <Link to="/admin/insights" className="btn btn-outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={18} /> View Full Insights
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {cards.map((c, i) => (
                    <div key={i} className="card" style={{
                        borderLeft: `5px solid ${c.color}`,
                        padding: '1.5rem',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>{c.label.toUpperCase()}</span>
                            <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {c.value}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={24} color="var(--danger)" /> High Priority & Urgent Issues
                </h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {complaints.filter(c => c.priority_score > 0).slice(0, 5).map(c => (
                        <div key={c.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: c.priority_score > 10 ? '5px solid var(--danger)' : '5px solid var(--warning)' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>
                                    #{c.id} {c.title}
                                    {c.priority_score > 15 && <span style={{ marginLeft: '10px', fontSize: '0.8rem', background: 'red', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>CRITICAL</span>}
                                </h4>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {c.category ? c.category.name : 'Uncategorized'} • {new Date(c.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: c.priority_score > 10 ? 'var(--danger)' : 'var(--warning)' }}>
                                    {c.priority_score}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Priority Score</div>
                            </div>
                        </div>
                    ))}
                    {complaints.length === 0 && <p className="text-muted">No high priority issues found.</p>}
                </div>
            </div>
        </div>
    )
}
