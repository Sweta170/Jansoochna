import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
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
import Leaderboard from './components/Leaderboard'
import Signup from './components/Signup'
import PasswordInput from './components/PasswordInput'
import Layout from './components/Layout'

function CitizenHome() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [socketConnected, setSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      const socket = connectSocket(token);
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));

      socket.on('notification:new', () => {
        fetchNotifications();
      });

      fetchNotifications();

      return () => {
        socket.disconnect();
        socket.off('notification:new');
      };
    } else {
      setNotifications([]);
    }
  }, [token]);

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  }

  async function markRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await api.post('/auth/login', { email, password });
      const t = res.data.token;
      const u = res.data.user;
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
      setToken(t);
      setUser(u);
    } catch (err) {
      alert('Login failed. Please check credentials.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }

  return (
    <Layout token={token} user={user} onLogout={handleLogout} notifications={notifications} markRead={markRead}>
      {!token ? (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
          <div className="card">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Citizen Login</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input name="email" placeholder="Email Address" required />
              </div>
              <div className="input-group">
                <PasswordInput />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                <Link to="/signup" className="text-muted">Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</span></Link>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', padding: '3rem 0', background: 'white', borderRadius: 'var(--radius-md)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h1>Speak Up, Change Your City</h1>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
              Join thousands of citizens making a difference. Report issues, track progress, and improve your community.
            </p>
            <button className="btn btn-primary" onClick={() => document.getElementById('complaint-form').scrollIntoView({ behavior: 'smooth' })}>
              Report an Issue
            </button>
          </div>

          <div id="complaint-form" style={{ marginBottom: '2rem' }}>
            <ComplaintForm token={token} />
          </div>

          <ComplaintList token={token} />
        </>
      )}
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CitizenHome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/complaints/:id" element={<ComplaintDetail />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="users" element={<UserList />} />
      </Route>
    </Routes>
  )
}
