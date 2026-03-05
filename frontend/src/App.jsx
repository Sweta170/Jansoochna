import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import {
  Building2, CheckCircle2, Users, Zap, AlertCircle,
  AlertTriangle, Lock, ArrowRight, Shield, FileText, Plus, Trophy, BarChart3
} from 'lucide-react'
import api from './services/api'
import { connectSocket } from './services/socket'
import ComplaintList from './components/ComplaintList'
import ComplaintForm from './components/ComplaintForm'
import ComplaintDetail from './components/ComplaintDetail'
import Profile from './components/Profile'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import CategoryManager from './components/admin/CategoryManager'
import UserList from './components/admin/UserList'
import InsightsDashboard from './components/admin/InsightsDashboard'
import Leaderboard from './components/Leaderboard'
import ServicesPage from './components/ServicesPage'
import TransparencyDashboard from './components/TransparencyDashboard'
import OfficialDashboard from './components/official/OfficialDashboard'
import { ToastProvider } from './components/common/Toast'
import Signup from './components/Signup'
import PasswordInput from './components/PasswordInput'
import Layout from './components/Layout'
import EmergencyPanel from './components/EmergencyPanel'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import './HomeStyles.css'

// Guards a route — redirects to '/' if the user doesn't have the required role
function ProtectedRoute({ allowedRole, children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const socket = connectSocket(token);

      socket.on('notification:new', () => {
        fetchNotifications();
      });

      fetchNotifications();

      socket.on('hazard:nearby', (hazard) => {
        alert(`CAUTION: ${hazard.count} safety hazard(s) nearby! Primary: ${hazard.primary}`);
      });

      const locInterval = setInterval(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            socket.emit('location:update', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          });
        }
      }, 30000);

      return () => {
        socket.disconnect();
        socket.off('notification:new');
        socket.off('hazard:nearby');
        clearInterval(locInterval);
      };
    } else {
      setNotifications([]);
    }
  }, [token]);

  async function fetchNotifications() {
    try {
      const res = await api.get('notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  }

  async function markRead(id) {
    try {
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } else {
        await api.put(`notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) { console.error(err); }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/');
  }

  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await api.post('auth/login', { email, password });
      const t = res.data.token;
      const u = res.data.user;
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
      setToken(t);
      setUser(u);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  }

  const LayoutWrapper = ({ children, fluid }) => (
    <Layout token={token} user={user} onLogout={handleLogout} notifications={notifications} markRead={markRead} isFluid={fluid}>
      {children}
    </Layout>
  );

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage setToken={setToken} setUser={setUser} />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <Signup />} />
        <Route path="/dashboard" element={<CitizenDashboard token={token} LayoutWrapper={LayoutWrapper} />} />
        <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
        <Route path="/leaderboard" element={<LayoutWrapper><Leaderboard /></LayoutWrapper>} />
        <Route path="/services" element={<LayoutWrapper><ServicesPage /></LayoutWrapper>} />
        <Route path="/transparency" element={<LayoutWrapper><TransparencyDashboard /></LayoutWrapper>} />
        <Route path="/official" element={
          <ProtectedRoute allowedRole="official">
            <OfficialDashboard />
          </ProtectedRoute>
        } />
        <Route path="/complaints/:id" element={<LayoutWrapper><ComplaintDetail /></LayoutWrapper>} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="users" element={<UserList />} />
          <Route path="insights" element={<InsightsDashboard />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

function CitizenDashboard({ token, LayoutWrapper }) {
  const [showReportingArea, setShowReportingArea] = useState(false);

  useEffect(() => {
    if (showReportingArea) {
      setTimeout(() => {
        const element = document.getElementById('reporting-v6');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [showReportingArea]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <LayoutWrapper fluid={true}>
      <div className="dashboard-v6-root" style={{ background: 'var(--background)' }}>
        <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
          <div className="dashboard-v6-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="badge-modern">
                <span className="dot" />
                AUTHORIZED ACCESS • SYSTEM_ACTIVE
              </div>
              <h1 className="hero-title" style={{ fontSize: '2.25rem', marginBottom: '0.25rem', fontWeight: 900 }}>
                Citizen <span className="tricolor-text">Dashboard</span>
              </h1>
              <p className="swiss-body" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Welcome back, <strong>{JSON.parse(localStorage.getItem('user'))?.name}</strong></p>
            </div>
            <button
              className="btn-primary-glow"
              style={{ padding: '14px 28px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
              onClick={() => setShowReportingArea(!showReportingArea)}
            >
              <Plus size={20} /> NEW COMPLAINT
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setShowReportingArea(!showReportingArea)}>
              <div style={{ background: '#3b82f615', color: '#3b82f6', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><FileText size={20} /></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Report Center</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Register a new complaint.</p>
            </div>
            <Link to="/leaderboard" className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#f59e0b15', color: '#f59e0b', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><Trophy size={20} /></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Ranks</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>View your city standing.</p>
            </Link>
            <Link to="/services" className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#10b98115', color: '#10b981', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><Building2 size={20} /></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>City Services</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Access gov services.</p>
            </Link>
            <Link to="/transparency" className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#6366f115', color: '#6366f1', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><BarChart3 size={20} /></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Analytics</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Recent city updates.</p>
            </Link>
          </div>

          {showReportingArea && (
            <div id="reporting-v6" className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '4rem' }}>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Register Complaint</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fill in the details below to notify authorities.</p>
              </div>
              <ComplaintForm token={token} />
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Recent Complaints</h2>
              <div style={{ flexGrow: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }}></div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '24px' }}>
              <ComplaintList token={token} />
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
