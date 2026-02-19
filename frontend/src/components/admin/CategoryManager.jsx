import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function CategoryManager() {
    const [categories, setCategories] = useState([])
    const [newName, setNewName] = useState('')

    useEffect(() => { fetchCats() }, [])

    async function fetchCats() {
        try {
            const res = await api.get('/admin/categories')
            setCategories(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    async function handleAdd(e) {
        e.preventDefault()
        if (!newName) return
        try {
            await api.post('/admin/categories', { name: newName, description: '' })
            setNewName('')
            fetchCats()
        } catch (err) { alert('Failed to add') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete category?')) return
        try {
            await api.delete(`/admin/categories/${id}`)
            fetchCats()
        } catch (err) { alert('Failed to delete') }
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Category Manager</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add New Category</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Street Lighting"
                            style={{ margin: 0 }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Category</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>{c.id}</td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{c.name}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="btn btn-danger"
                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
