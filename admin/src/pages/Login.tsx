import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAdmin } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAdmin();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'login' | 'request'>('login');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Request Access Form State
  const [fullName, setFullName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  // Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(false);

    try {
      const res = await api.post('/admin/auth/login', { email, password });
      login(res.data.admin, res.data.accessToken);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      setError(true);
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Request Access Submission
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !reqEmail || !designation || !state || !district) {
      toast.error('All fields are required.');
      return;
    }

    const cleanEmail = reqEmail.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setReqLoading(true);
    try {
      await api.post('/admin/request-access', {
        full_name: fullName.trim(),
        email: cleanEmail,
        designation: designation.trim(),
        state: state.trim(),
        district: district.trim()
      });
      toast.success('Access request submitted successfully! Pending review.');
      
      // Clear form
      setFullName('');
      setReqEmail('');
      setDesignation('');
      setState('');
      setDistrict('');
      
      // Switch back to login
      setActiveTab('login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-4 selection:bg-[#1D9E75]/35 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-[#1a2535] w-full max-w-[400px] p-8 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] border border-white/5"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#1d9e75]/15 rounded-2xl flex items-center justify-center mb-4 border border-[#1d9e75]/30">
            <ShieldCheck size={28} className="text-[#1D9E75]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">JanSoochna</h1>
          <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mt-1">
            Admin Portal (सरकारी पोर्टल)
          </p>
        </div>

        {/* Pill-style Segmented Control */}
        <div className="bg-[#111d2a] p-1 rounded-xl flex gap-1 mb-6 border border-white/5 relative z-0">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative ${
              activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div 
                layoutId="activeTabPill" 
                className="absolute inset-0 bg-[#1D9E75] rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative ${
              activeTab === 'request' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'request' && (
              <motion.div 
                layoutId="activeTabPill" 
                className="absolute inset-0 bg-[#1D9E75] rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            Request Access
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            // --- SIGN IN FORM ---
            <motion.form 
              key="login-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLogin} 
              className="space-y-4"
            >
              <motion.div animate={error ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                  Official Email
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(false); }}
                  className={`w-full bg-[#111d2a] border ${
                    error ? 'border-red-500/50' : 'border-white/10'
                  } rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all`}
                  placeholder="name@gov.in"
                  required
                />
              </motion.div>

              <motion.div animate={error ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    className={`w-full bg-[#111d2a] border ${
                      error ? 'border-red-500/50' : 'border-white/10'
                    } rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all`}
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              <button 
                type="submit" 
                disabled={loading || !email || !password}
                className="w-full bg-[#1D9E75] hover:bg-[#1a8d68] text-white font-bold py-3 rounded-lg mt-4 disabled:opacity-50 transition-colors shadow-md shadow-[#1D9E75]/10"
              >
                {loading ? 'Logging in...' : 'Login करें'}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                New admin?{' '}
                <span 
                  onClick={() => setActiveTab('request')} 
                  className="text-[#1D9E75] font-bold hover:underline cursor-pointer"
                >
                  Request access →
                </span>
              </p>
            </motion.form>
          ) : (
            // --- REQUEST ACCESS FORM ---
            <motion.form 
              key="request-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRequestAccess} 
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                  Full Name
                </label>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#111d2a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                  Official Email
                </label>
                <input 
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  className="w-full bg-[#111d2a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                  placeholder="e.g. rajesh.kumar@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                  Designation
                </label>
                <input 
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-[#111d2a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                  placeholder="e.g. Sub-Divisional Magistrate"
                  required
                />
              </div>

              {/* State & District Two-column */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                    State
                  </label>
                  <input 
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#111d2a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                    placeholder="e.g. Punjab"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1.5 block">
                    District
                  </label>
                  <input 
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#111d2a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                    placeholder="e.g. Ludhiana"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={reqLoading || !fullName || !reqEmail || !designation || !state || !district}
                className="w-full bg-[#1D9E75] hover:bg-[#1a8d68] text-white font-bold py-3 rounded-lg mt-4 disabled:opacity-50 transition-colors shadow-md shadow-[#1D9E75]/10"
              >
                {reqLoading ? 'Submitting...' : 'Request Access'}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already have an account?{' '}
                <span 
                  onClick={() => setActiveTab('login')} 
                  className="text-[#1D9E75] font-bold hover:underline cursor-pointer"
                >
                  Sign In →
                </span>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
