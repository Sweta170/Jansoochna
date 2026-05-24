import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAdmin } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(false);

    try {
      // Endpoint from your node server (we set up admin auth earlier in backend)
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

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card w-full max-w-[400px] p-8 rounded-2xl shadow-xl border border-border"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">JanSoochna</h1>
          <h2 className="text-muted-foreground font-medium text-sm mt-1">Admin Portal (सरकारी उपयोगकर्ता)</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <label className="block text-sm font-semibold text-foreground mb-1">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              className={`w-full bg-secondary border ${error ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
              placeholder="admin@jansoochna.in"
            />
          </motion.div>

          <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <label className="block text-sm font-semibold text-foreground mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-secondary border ${error ? 'border-destructive' : 'border-border'} rounded-lg pl-4 pr-12 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </motion.div>

          <button 
            type="submit" 
            disabled={loading || !email || !password}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg mt-4 disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {loading ? 'Logging in...' : 'Login करें'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
