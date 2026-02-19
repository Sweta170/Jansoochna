import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await api.get('/gamification/leaderboard');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="text-center p-4">Loading Leaderboard...</div>;

    return (
        <div className="card">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>🏆 Model Citizens Leaderboard</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Rank</th>
                        <th style={{ padding: '10px' }}>Citizen</th>
                        <th style={{ padding: '10px' }}>Badge</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u, index) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem',
                                    background: u.rank === 'Hero' ? 'gold' : u.rank === 'Activist' ? 'silver' : '#eee',
                                    color: u.rank === 'Hero' ? 'black' : 'black'
                                }}>
                                    {u.rank}
                                </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {u.points}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
