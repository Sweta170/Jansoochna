import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import PasswordInput from './PasswordInput'

export default function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleSignup(e) {
        e.preventDefault()
        try {
            const res = await api.post('/auth/register', { name, email, password })
            const token = res.data.token
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            alert('Registration successful! Welcome to JanSoochna.')
            window.location.href = '/'
        } catch (err) {
            console.error(err)
            if (err.response && err.response.data && err.response.data.errors) {
                const obs = err.response.data.errors.map(e => e.msg).join(', ');
                alert(`Registration failed: ${obs}`);
            } else if (err.response && err.response.data && err.response.data.error) {
                alert(`Registration failed: ${err.response.data.error}`);
            } else {
                alert('Registration failed. Please try again.');
            }
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>JanSoochna</h1>
                    <p className="text-muted">Create your account</p>
                </div>

                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
                        <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Create Account</button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span className="text-muted">Already have an account?</span> <Link to="/" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
