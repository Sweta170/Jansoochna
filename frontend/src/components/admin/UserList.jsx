import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function UserList() {
    const [users, setUsers] = useState([])
    const [departments, setDepartments] = useState([])
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const [usersRes, deptsRes] = await Promise.all([
                    api.get('admin/users'),
                    api.get('departments')
                ])
                setUsers(usersRes.data)
                setDepartments(deptsRes.data)
            } catch (err) { console.error(err) }
        }
        fetchData()
    }, [])

    async function handleAssignDepartment(userId, deptId, role) {
        try {
            setUpdatingId(userId)
            await api.put(`/admin/users/${userId}/assign-department`, {
                department_id: deptId || null,
                role: deptId ? 'official' : role
            })
            // Refresh
            const res = await api.get('admin/users')
            setUsers(res.data)
        } catch (err) {
            alert('Failed to update user')
        } finally {
            setUpdatingId(null)
        }
    }

    function getRoleBadge(roleId) {
        if (roleId === 1) return <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Admin</span>
        if (roleId === 2) return <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B' }}>Authority</span>
        if (roleId === 4) return <span className="badge" style={{ background: '#D1FAE5', color: '#065F46' }}>Official</span>
        return <span className="badge" style={{ background: '#F1F5F9', color: '#475569' }}>Citizen</span>
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>User Management</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Assign users to departments to grant them Official access.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>ID</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Name</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Email</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Role</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Assign Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>#{u.id}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>{u.name}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>{u.email}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>{getRoleBadge(u.role_id)}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <select
                                            defaultValue={u.department_id || ''}
                                            onChange={(e) => handleAssignDepartment(u.id, e.target.value, u.role_id)}
                                            style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                                            disabled={updatingId === u.id || u.role_id === 1}
                                        >
                                            <option value="">— No Dept —</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        {updatingId === u.id && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saving...</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
