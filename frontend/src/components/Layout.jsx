import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import ChatWidget from './chatbot/ChatWidget';
import {
    Home, Trophy, Building2, BarChart3, Moon, Sun, Bell,
    User, Settings, LogOut, Inbox, ChevronDown, ExternalLink,
    Landmark, Globe, Shield, LayoutDashboard, AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import EmergencyPanel from './EmergencyPanel';

export default function Layout({ children, token, user, onLogout, notifications, markRead, isFluid }) {
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const notifRef = useRef(null);
    const userMenuRef = useRef(null);

    const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

    // Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Shadow on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`app-layout ${theme}`} data-theme={theme}>
            {/* 🇮🇳 OFFICIAL GOV STRIP */}
            <div style={{ background: '#000', color: '#fff', padding: '6px 0', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Landmark size={12} />
                        <span>GOVERNMENT OF BHARAT • OFFICIAL CIVIC PORTAL</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', opacity: 0.6 }}>
                        <span>Digital India</span>
                        <span>MyGov</span>
                    </div>
                </div>
            </div>

            <nav className="navbar" style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'none' }}>
                <div className="container nav-content">

                    {/* Logo (Extreme Left) */}
                    <Link to="/" className="nav-logo" style={{ marginLeft: '-1.5rem', marginRight: 'auto' }}>
                        <div className="nav-logo-icon" style={{
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px'
                        }}>
                            <Landmark size={20} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            <span className="tricolor-text" style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>JanSoochna</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '2px' }}>Digital Citizen Portal</span>
                        </div>
                    </Link>

                    {/* Center Links */}
                    <div className="nav-links" style={{ gap: '0.5rem' }}>
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
                            <Building2 size={18} /> Services
                        </Link>
                        <Link to="/transparency" className={`nav-link ${isActive('/transparency') ? 'active' : ''}`}>
                            <BarChart3 size={18} /> Public Stats
                        </Link>
                        <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
                            <Trophy size={18} /> Leaderboard
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="nav-links" style={{ gap: '0.75rem' }}>
                        {/* Theme toggle */}
                        <button className="theme-toggle" onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {token ? (
                            <>
                                <div className="nav-divider" />

                                {/* Notification Bell */}
                                <div ref={notifRef} style={{ position: 'relative' }}>
                                    <button
                                        className="notif-bell"
                                        onClick={() => { setShowNotif(p => !p); setShowUserMenu(false); }}
                                        title="Notifications"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="notif-badge">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotif && (
                                        <div className="notif-dropdown">
                                            <div className="notif-header">
                                                <span className="notif-title">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button
                                                        className="notif-mark-all"
                                                        onClick={async () => {
                                                            await api.put('notifications/read-all');
                                                            markRead('all');
                                                        }}
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="notif-list">
                                                {!notifications || notifications.length === 0 ? (
                                                    <div className="notif-empty">
                                                        <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                                            <Inbox size={32} strokeWidth={1.5} />
                                                        </div>
                                                        <div>No notifications yet</div>
                                                    </div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div
                                                            key={n.id}
                                                            className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                                                            onClick={() => markRead(n.id)}
                                                        >
                                                            {!n.is_read && <div className="notif-dot" />}
                                                            <div style={{ flex: 1, paddingLeft: n.is_read ? '20px' : 0 }}>
                                                                <div className="notif-msg">{n.message}</div>
                                                                <div className="notif-time">
                                                                    {new Date(n.created_at).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User avatar + dropdown */}
                                <div className="nav-user" ref={userMenuRef}>
                                    <button
                                        className="nav-avatar-btn"
                                        onClick={() => { setShowUserMenu(p => !p); setShowNotif(false); }}
                                        style={{ padding: '0.25rem 0.6rem 0.25rem 0.25rem' }}
                                    >
                                        <div className="nav-avatar" style={{ width: '26px', height: '26px', fontSize: '0.65rem' }}>{getInitials(user?.name)}</div>
                                        <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user?.name?.split(' ')[0] || 'Me'}
                                        </span>
                                        <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                    </button>

                                    {showUserMenu && (
                                        <div className="nav-dropdown">
                                            <div className="nav-dropdown-header">
                                                <div className="nav-dropdown-name">{user?.name}</div>
                                                <div className="nav-dropdown-email">{user?.email}</div>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="nav-dropdown-item"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User size={16} /> My Profile
                                            </Link>
                                            {user?.role === 'official' && (
                                                <Link
                                                    to="/official"
                                                    className="nav-dropdown-item"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Building2 size={16} /> My Work
                                                </Link>
                                            )}
                                            {user?.role === 'admin' && (
                                                <>
                                                    <Link
                                                        to="/admin"
                                                        className="nav-dropdown-item"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <Shield size={16} /> Admin Console
                                                    </Link>
                                                    <a
                                                        href={`http://localhost:3000?token=${token}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="nav-dropdown-item"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <Settings size={16} /> Authority Hub <ExternalLink size={14} style={{ opacity: 0.5 }} />
                                                    </a>
                                                </>
                                            )}
                                            <div className="divider" style={{ margin: '0.25rem 0' }} />
                                            <button
                                                className="nav-dropdown-item danger"
                                                onClick={() => { setShowUserMenu(false); onLogout(); }}
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="nav-divider" />
                                <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className={`${isFluid ? 'fluid-root' : 'container'} animate-fade-in`} style={{ paddingTop: isFluid ? '0' : '2rem', paddingBottom: '5rem' }}>
                {children}
            </main>

            {/* AI Assistant Chatbot */}
            {token && <ChatWidget />}

            {/* Global Emergency Panel */}
            <EmergencyPanel />
        </div>
    );
}
