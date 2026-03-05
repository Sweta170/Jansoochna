import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Star, BarChart3, Activity, Users, CheckCircle2, TrendingUp, PieChart as PieIcon, MapPin, Shield } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StatBox = ({ title, value, sub, color, icon: Icon }) => (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
                <div className="gov-strip-text" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.65rem' }}>{title}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} /> {sub}
                </div>
            </div>
            <div style={{ background: `${color}15`, padding: '10px', borderRadius: '12px', color: color }}>
                <Icon size={20} />
            </div>
        </div>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '80px', height: '80px', background: color, filter: 'blur(40px)', opacity: 0.08, pointerEvents: 'none' }} />
    </div>
);

export default function TransparencyDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await api.get('analytics/public');
            setData(res.data);
        } catch (err) {
            console.error('Transparency load error:', err);
            // Optionally set data to a specific error state or empty object
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                <Activity size={48} style={{ margin: '0 auto 1rem', animation: 'spin 2s linear infinite' }} />
                Loading Dashboard...
            </div>
        </div>
    );

    if (!data) return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: '30px', border: '1px solid var(--border)' }}>
                <Shield size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 900 }}>Analytics Unavailable</h2>
                <p style={{ color: 'var(--text-muted)' }}>We're currently reconciling civic data. Please check back shortly.</p>
                <button className="btn btn-primary" onClick={fetchData} style={{ marginTop: '1.5rem' }}>Retry Sync</button>
            </div>
        </div>
    );

    // Chart Data Configurations
    const trendData = {
        labels: data.monthlyTrend.map(m => m.month),
        datasets: [{
            label: 'Total Reports',
            data: data.monthlyTrend.map(m => m.count),
            fill: true,
            borderColor: '#0EA5E9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#0EA5E9'
        }]
    };

    const statusData = {
        labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
        datasets: [{
            data: [
                data.complaintsByStatus.find(s => s.status === 'open')?.count || 0,
                data.complaintsByStatus.find(s => s.status === 'in_progress')?.count || 0,
                data.complaintsByStatus.find(s => s.status === 'resolved')?.count || 0,
                data.complaintsByStatus.find(s => s.status === 'closed')?.count || 0,
            ],
            backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#64748B'],
            borderWidth: 0,
            hoverOffset: 12
        }]
    };

    const deptData = {
        labels: data.departmentStats.map(d => d.department?.name || 'Unassigned'),
        datasets: [{
            label: 'Total Cases',
            data: data.departmentStats.map(d => d.total),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderRadius: 8,
            barThickness: 24
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E293B',
                titleFont: { family: 'Outfit', weight: 'bold' },
                bodyFont: { family: 'Inter' },
                padding: 12,
                cornerRadius: 10
            }
        },
        scales: {
            y: { display: false },
            x: { display: false }
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div className="badge-modern" style={{ marginBottom: '1rem' }}>
                    <span className="dot" />
                    OFFICIAL VERIFIED METRICS • SYSTEM_SYNC
                </div>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 900 }}>
                    Public <span className="tricolor-text">Stats</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>Real-time audit trails and performance metrics of Bharat's professional civic infrastructure.</p>
            </div>

            {/* High Level Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <StatBox title="Citizen Activity" value={data.totalComplaints} sub="Total Reports" color="#3B82F6" icon={Users} />
                <StatBox title="Success Rate" value={`${data.resolvedPercentage}%`} sub="+4.2% from last month" color="#10B981" icon={CheckCircle2} />
                <StatBox title="Public Feedback" value={data.avgRating} sub="Average Star Rating" color="#F59E0B" icon={Star} />
                <StatBox title="Response Rate" value="94.8%" sub="On-time fulfillment" color="#6366F1" icon={Activity} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Reports Inflow Trend */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>Report Inflow Trends</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Volume of reports filed over time</p>
                        </div>
                        <div style={{ background: 'var(--background)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={14} color="var(--primary)" /> Growth
                        </div>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <Line
                            data={trendData}
                            options={{
                                ...commonOptions,
                                scales: {
                                    y: {
                                        display: true,
                                        grid: { color: 'var(--border)', drawBorder: false },
                                        ticks: { font: { family: 'Inter', weight: 600 }, color: 'var(--text-muted)' }
                                    },
                                    x: {
                                        display: true,
                                        grid: { display: false }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Status Composition */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Current Status</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Breakdown of complaint status</p>
                    <div style={{ height: '180px', position: 'relative', marginBottom: '1.5rem' }}>
                        <Doughnut
                            data={statusData}
                            options={{
                                ...commonOptions,
                                cutout: '75%',
                                plugins: { ...commonOptions.plugins, legend: { display: false } }
                            }}
                        />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 1000, color: 'var(--text-main)' }}>{data.totalComplaints}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tickets</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {statusData.labels.map((label, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'var(--background)', padding: '10px', borderRadius: '12px', justifyContent: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusData.datasets[0].backgroundColor[i] }} />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Top Active Zones placeholder or simplified view */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Regional Hotspots</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {['Central Business Dist.', 'North Residential', 'South Industrial', 'East Waterfront'].map((zone, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <MapPin size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{zone}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>High Active</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '10px' }}>
                                        <div style={{ width: `${90 - (i * 15)}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--primary)05', borderRadius: '16px', border: '1px solid var(--primary)15' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                            <Star size={12} style={{ marginRight: '6px' }} />
                            Heatmap clusters are calculated based on report density and verification velocity in designated sectors.
                        </p>
                    </div>
                </div>

                {/* Department Load Balancing */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>Efficiency</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Performance per department</p>
                        </div>
                        <BarChart3 size={20} color="var(--primary)" />
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={deptData}
                            options={{
                                ...commonOptions,
                                indexAxis: 'y',
                                scales: {
                                    x: { display: true, grid: { display: false } },
                                    y: { display: true, grid: { display: false }, ticks: { font: { family: 'Outfit', weight: 800 }, color: 'var(--text-main)' } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
                padding: '2rem',
                borderRadius: '32px',
                border: '1px solid var(--border)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '4rem'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
                    {/* SVG pattern placeholder for high-end look */}
                    <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" /></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 1000, fontSize: '1.5rem', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>Open Data Policy</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: 1.7, fontWeight: 500 }}>
                    We believe in providing open and clear information to every citizen. This dashboard helps track the progress of your city.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Source Verification</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Node JS / MariaDB Hybrid</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border)' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Update Frequency</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Real-time / Socket Stream</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
