import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function Layout({ children, token, user, onLogout, notifications, markRead }) {
    const [showNotif, setShowNotif] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;
    const location = useLocation();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div>
            <nav className="navbar">
                <div className="container nav-content">
                    <Link to="/" className="nav-logo">JanSoochna</Link>

                    <div className="nav-links">
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                                padding: '0.25rem', display: 'flex', alignItems: 'center'
                            }}
                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                        <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>Leaderboard</Link>

                        {token ? (
                            <>
                                <Link to="/profile" className="nav-link">My Profile</Link>

                                {/* Notifications */}
                                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotif(!showNotif)}>
                                    <span style={{ fontSize: '1.2rem' }}>🔔</span>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -5, right: -5,
                                            background: 'var(--danger)', color: 'white', borderRadius: '50%',
                                            padding: '2px 5px', fontSize: '0.7rem', fontWeight: 'bold'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                    {showNotif && (
                                        <div style={{
                                            position: 'absolute', top: '40px', right: 0,
                                            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                            width: '320px', maxHeight: '400px', overflowY: 'auto',
                                            boxShadow: 'var(--shadow-lg)', zIndex: 100
                                        }} onClick={e => e.stopPropagation()}>
                                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Notifications</div>
                                            {notifications.length === 0 ? <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No notifications</div> : (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {notifications.map(n => (
                                                        <li key={n.id} style={{
                                                            padding: '1rem', borderBottom: '1px solid var(--border)',
                                                            background: n.is_read ? (theme === 'dark' ? '#1E293B' : 'white') : (theme === 'dark' ? '#0F172A' : '#F1F5F9'),
                                                            cursor: 'pointer'
                                                        }} onClick={() => markRead(n.id)}>
                                                            <div style={{ fontSize: '0.9rem' }}>{n.message}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                                {new Date(n.created_at).toLocaleString()}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Logout</button>
                            </>
                        ) : (
                            <Link to="/" className="btn btn-primary">Login</Link>
                        )}
                        <Link to="/admin" className="nav-link" style={{ fontSize: '0.9rem' }}>Admin</Link>
                    </div>
                </div>
            </nav>

            <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
                {children}
            </main>
        </div>
    );
}
