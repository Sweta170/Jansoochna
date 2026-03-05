import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Users, CheckCircle2, Globe, Building2, Landmark } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-root">
            {/* 🇮🇳 TOP FLOATING BAR */}
            <div className="gov-strip">
                <div className="container strip-content">
                    <div className="gov-brand">
                        <Landmark size={14} />
                        <span>GOVERNMENT OF BHARAT • OFFICIAL CIVIC PORTAL</span>
                    </div>
                    <div className="gov-links">
                        <span>Digital India</span>
                        <span>MyGov</span>
                        <span>Data.gov.in</span>
                    </div>
                </div>
            </div>

            {/* 🧭 NAVIGATION */}
            <nav className="landing-nav">
                <div className="container nav-container">
                    <div className="brand" onClick={() => navigate('/')}>
                        <div className="logo-box">JS</div>
                        <span className="brand-name">JanSoochna</span>
                    </div>
                    <div className="nav-actions">
                        <Link to="/transparency" className="nav-link">Public Stats</Link>
                        <Link to="/services" className="nav-link">Services</Link>
                        <div className="nav-divider" />
                        <button className="btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
                        <button className="btn-primary-glow" onClick={() => navigate('/signup')}>Join Portal</button>
                    </div>
                </div>
            </nav>

            {/* 🎭 HERO SECTION */}
            <header className="hero">
                <div className="hero-glow-1" />
                <div className="hero-glow-2" />

                <div className="container hero-content">
                    <div className="hero-text animate-slide-up">
                        <div className="badge-modern">
                            <span className="dot" />
                            POWERED BY NEXT-GEN GOVERNANCE
                        </div>
                        <h1 className="hero-title">
                            Empowering <span className="tricolor-text">Citizens</span><br />
                            Ensuring <span className="gradient-text">Accountability.</span>
                        </h1>
                        <p className="hero-subtitle">
                            JanSoochna is Bharat's professional operating system for city-wide resolutions.
                            Report issues, track progress, and build a smarter city together.
                        </p>

                        <div className="hero-btns">
                            <button className="primary-cta" onClick={() => navigate('/signup')}>
                                Start My Journey <ArrowRight size={20} />
                            </button>
                            <button className="secondary-cta" onClick={() => navigate('/login')}>
                                Access Dashboard
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-value">50k+</span>
                                <span className="stat-label">Active Users</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">98%</span>
                                <span className="stat-label">SLA Resolution</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">24/7</span>
                                <span className="stat-label">AI Assistance</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual animate-fade-in">
                        <div className="visual-wrapper">
                            {/* ASHOKA CHAKRA AMBIENT ELEMENT */}
                            <div className="chakra-bg" />
                            <div className="floating-card c1">
                                <CheckCircle2 size={18} color="#10b981" />
                                <span>Road Fix Verified</span>
                            </div>
                            <div className="floating-card c2">
                                <Zap size={18} color="#facc15" />
                                <span>AI Dispatched</span>
                            </div>
                            <div className="main-display">
                                <div className="display-header">
                                    <div className="dots"><span /><span /><span /></div>
                                    <span>SYSTEM_TERMINAL [v6.0]</span>
                                </div>
                                <div className="display-body">
                                    <div className="pulse-line" />
                                    <div className="pulse-line" style={{ width: '60%', opacity: 0.5 }} />
                                    <div className="pulse-line" style={{ width: '80%', opacity: 0.3 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 🛡️ FEATURES SECTION */}
            <section className="features-section">
                <div className="container">
                    <div className="section-head">
                        <h2 className="section-title">A Secure Digital Infrastructure</h2>
                        <p className="section-subtitle">Designed for impact, scaled for the nation.</p>
                    </div>

                    <div className="feature-grid">
                        <div className="feat-card">
                            <div className="feat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}><Zap size={24} /></div>
                            <h3>Instant Dispatch</h3>
                            <p>AI-powered categorization routes your complaint to the right department in milliseconds.</p>
                        </div>
                        <div className="feat-card">
                            <div className="feat-icon" style={{ background: '#10b98115', color: '#10b981' }}><Shield size={24} /></div>
                            <h3>Radical Transparency</h3>
                            <p>Public performance stats ensure every department is held accountable to the citizens.</p>
                        </div>
                        <div className="feat-card">
                            <div className="feat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}><Users size={24} /></div>
                            <h3>Community Trust</h3>
                            <p>Join civic leaderboard and earn rewards for being an active contributor to city evolution.</p>
                        </div>
                        <div className="feat-card">
                            <div className="feat-icon" style={{ background: '#6366f115', color: '#6366f1' }}><Globe size={24} /></div>
                            <h3>Digital India First</h3>
                            <p>Built on the principles of open data and modern architecture for the citizens of Bharat.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🇮🇳 FOOTER */}
            <footer className="landing-footer">
                <div className="container footer-content">
                    <div className="footer-brand">
                        <div className="logo-box">JS</div>
                        <span className="brand-name">JanSoochna</span>
                        <p>Towards a more accountable and transparent Bharat.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Platform</h4>
                            <Link to="/leaderboard">Leaderboard</Link>
                            <Link to="/services">Services</Link>
                            <Link to="/transparency">Public Stats</Link>
                        </div>
                        <div className="link-group">
                            <h4>Official</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Use</a>
                            <a href="#">Data Security</a>
                        </div>
                    </div>
                </div>
                <div className="footer-strip">
                    <p>© 2026 DIGITAL BHARAT MISSION • DESIGNED FOR IMPACT</p>
                </div>
            </footer>
        </div>
    );
}
