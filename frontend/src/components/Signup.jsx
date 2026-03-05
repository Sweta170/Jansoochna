import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    MapPin, Bot, Trophy, Bell, Shield,
    AlertTriangle, ArrowRight, UserPlus
} from 'lucide-react'
import api from '../services/api'
import PasswordInput from './PasswordInput'

// Password strength helper
function getStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { label: '', color: 'transparent' },
        { label: 'Weak', color: '#EF4444' },
        { label: 'Fair', color: '#F59E0B' },
        { label: 'Good', color: '#3B82F6' },
        { label: 'Strong', color: '#10B981' },
    ];
    return { score, ...map[score] };
}

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const strength = getStrength(password);

    async function handleSignup(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('auth/register', { name, email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/';
        } catch (err) {
            const msgs = err.response?.data?.errors?.map(e => e.msg).join(', ')
                || err.response?.data?.error
                || 'Registration failed. Please try again.';
            setError(msgs);
        } finally {
            setLoading(false);
        }
    }

    const features = [
        { icon: <MapPin size={18} />, text: 'GPS-tagged complaint filing' },
        { icon: <Bot size={18} />, text: 'AI-powered category suggestions' },
        { icon: <Trophy size={18} />, text: 'Earn points & climb the leaderboard' },
        { icon: <Bell size={18} />, text: 'Real-time status alerts' },
        { icon: <Shield size={18} />, text: 'Anonymous reporting available' },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            minHeight: '100vh',
        }}>
            {/* LEFT — Hero Panel (inverted purple/green for distinction from login) */}
            <div style={{
                background: 'linear-gradient(135deg, #065F46 0%, #059669 45%, #10B981 100%)',
                padding: '2rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', fontSize: '1rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif' }}>JS</div>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>JanSoochna</span>
                    </div>

                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
                        Join the Movement
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '340px', marginBottom: '2rem' }}>
                        Become an active citizen. File complaints, verify resolutions, and help make your city better — one report at a time.
                    </p>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {features.map(f => (
                            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.15)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>{f.icon}</div>
                                <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.85rem', fontWeight: 500 }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT — Signup Form */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--background)' }}>
                <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '0.3rem' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>It's free and takes less than a minute</p>
                    </div>

                    {error && (
                        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="input-label">Full Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="input-label">Password</label>
                            <PasswordInput
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {/* Strength meter */}
                            {password && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(strength.score / 4) * 100}%`,
                                            background: strength.color,
                                            borderRadius: '9999px',
                                            transition: 'all 0.3s ease',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: strength.color, marginTop: '0.25rem', display: 'block' }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                            style={{ height: '48px', marginTop: '0.25rem', background: '#059669', fontSize: '0.9rem', fontWeight: 800, borderRadius: '12px', boxShadow: '0 2px 12px rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {loading ? 'Creating account…' : <><UserPlus size={18} /> Create My Account</>}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Sign in <ArrowRight size={14} /></Link>
                    </div>

                    <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                        By creating an account you agree to our Terms of Service and Privacy Policy. Your data is safe with us.
                    </p>
                </div>
            </div>
        </div>
    );
}
