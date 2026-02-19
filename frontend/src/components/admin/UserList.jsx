import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function UserList() {
    const [users, setUsers] = useState([])

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await api.get('/admin/users')
                setUsers(res.data)
            } catch (err) { console.error(err) }
        }
        fetchUsers()
    }, [])

    function getRoleBadge(roleId) {
        // Assuming 1=Admin, 2=Authority, 3=Citizen based on typical seeding
        // Adjust logic if backend returns strings or different IDs
        if (roleId === 1) return <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Admin</span>
        if (roleId === 2) return <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B' }}>Authority</span>
        return <span className="badge" style={{ background: '#F1F5F9', color: '#475569' }}>Citizen</span>
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>User Management</h2>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Email</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>{u.id}</td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                <td style={{ padding: '1rem' }}>{getRoleBadge(u.role_id)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
