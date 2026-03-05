import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, Users, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import PasswordInput from './PasswordInput';
import './LoginPage.css';

export default function LoginPage({ setToken, setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('auth/login', { email, password });
            const token = res.data.token;
            const user = res.data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-v6-root">
            <div className="login-split">
                {/* Visual Side */}
                <div className="login-hero">
                    <div className="gov-logo-badge">
                        <div className="js-logo">JS</div>
                        <span>JanSoochna Portal</span>
                    </div>

                    <div className="hero-quote">
                        <h1>Civic engagement, <span className="highlight">unbounded.</span></h1>
                        <p>Access the professional operating system for city-wide resolutions and accountability.</p>
                    </div>

                    <div className="hero-cards">
                        <div className="mini-card">
                            <Zap size={16} />
                            <span>Real-time Dispatch</span>
                        </div>
                        <div className="mini-card">
                            <Users size={16} />
                            <span>Civic Ranks</span>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="login-area">
                    <div className="login-container">
                        <div className="login-header">
                            <h2>User Login</h2>
                            <p>Enter your details to access your account.</p>
                        </div>

                        {error && (
                            <div className="login-error">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="field-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="yourname@gmail.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="field-group">
                                <label>Password</label>
                                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="login-footer">
                            New contributor? <Link to="/signup">Apply for registration</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
