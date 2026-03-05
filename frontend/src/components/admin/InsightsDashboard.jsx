import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function InsightsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('analytics/performance');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div>Loading Analytics...</div>;
    if (!data) return <div>Failed to load insights.</div>;

    const statusData = {
        labels: data.statusDist.map(s => s.status.toUpperCase()),
        datasets: [{
            label: 'Complaints by Status',
            data: data.statusDist.map(s => s.count),
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#64748b'],
        }]
    };

    const trendData = {
        labels: data.trends.map(t => t.month),
        datasets: [{
            label: 'Monthly Complaint Volume',
            data: data.trends.map(t => t.count),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
        }]
    };

    const deptData = {
        labels: data.deptPerformance.map(d => d.department?.name || 'Unknown'),
        datasets: [{
            label: 'Avg Resolution Time (Sec)',
            data: data.deptPerformance.map(d => d.avg_seconds || 0),
            backgroundColor: '#8b5cf6',
        }]
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={24} /> City Performance Insights
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Chart 1: Status Distribution */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>Complaint Status Distribution</h3>
                    <Pie data={statusData} />
                </div>

                {/* Chart 2: Monthly Trends */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>Monthly Reporting Trends</h3>
                    <Line data={trendData} />
                </div>

                {/* Chart 3: Department Performance */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>Department Resolution Speed (Avg Seconds)</h3>
                    <Bar data={deptData} options={{ indexAxis: 'y' }} />
                </div>

                {/* Summary Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ ...cardStyle, background: 'var(--primary)', color: 'white', alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{data.trends.reduce((a, b) => a + b.count, 0)}</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Lifetime Complaints</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const cardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const chartTitle = {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#0f172a'
};
