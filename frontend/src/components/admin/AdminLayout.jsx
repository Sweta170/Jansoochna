import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
    const navigate = useNavigate();
    // In a real app, check for token and role here.
    // if (!token) return <Navigate to="/" />

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside style={{ width: '250px', background: '#333', color: 'white', padding: '20px' }}>
                <h2>JanSoochna Admin</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to="/admin/insights" style={{ color: 'white', textDecoration: 'none' }}>Analytics</Link>
                    <Link to="/admin/categories" style={{ color: 'white', textDecoration: 'none' }}>Categories</Link>
                    <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>Users</Link>
                    <hr style={{ width: '100%', borderColor: '#555' }} />
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer' }}>Back to Citizen View</button>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '20px', background: '#f5f5f5' }}>
                <Outlet />
            </main>
        </div>
    )
}
