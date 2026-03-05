import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Home, Droplets, Baby, FileText, ClipboardList } from 'lucide-react';

const ServiceCard = ({ icon, title, description, onApply, price }) => (
    <div className="glass-panel animate-fade-in" style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '24px',
        transition: 'transform 0.3s ease, border-color 0.3s ease'
    }}>
        <div>
            <div style={{ color: 'var(--primary)', marginBottom: '1rem', background: 'var(--primary-light)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{description}</p>
        </div>
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1rem' }}>{price}</span>
            <button
                onClick={onApply}
                className="btn-primary-glow"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem' }}
            >
                Apply Now
            </button>
        </div>
    </div>
);

export default function ServicesPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        try {
            const res = await api.get('services/user/me');
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const services = [
        { id: 'property_tax', icon: <Home size={32} />, title: 'Property Tax', description: 'Pay your annual municipal property tax securely and track payment receipts.', price: 'Starts ₹500', group: 'payment' },
        { id: 'water_bill', icon: <Droplets size={32} />, title: 'Water Connection', description: 'Apply for a new water connection or pay pending utility bills online.', price: 'Starts ₹120', group: 'payment' },
        { id: 'birth_certificate', icon: <Baby size={32} />, title: 'Birth Certificate', description: 'Apply for a certified birth record from the municipal health department.', price: '₹50 Fee', group: 'document' },
        { id: 'death_certificate', icon: <FileText size={32} />, title: 'Death Certificate', description: 'Request an official death certificate for legal and insurance purposes.', price: '₹50 Fee', group: 'document' }
    ];

    async function handleApply(e) {
        e.preventDefault();
        try {
            await api.post('services/apply', { serviceType: selectedService.id, formData: { name: e.target.name?.value, address: e.target.address?.value } });
            setShowModal(false);
            fetchHistory();
            alert('Application submitted successfully!');
        } catch (err) {
            alert('Failed to submit application');
        }
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <div className="badge-modern" style={{ marginBottom: '0.75rem' }}>
                    <span className="dot" />
                    OFFICIAL SERVICES • DIRECT_ACTION
                </div>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 900 }}>
                    Citizen <span className="tricolor-text">Services</span>
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>Access essential civic services and secure payments directly from the professional Bharat operating system.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {services.map(s => (
                    <ServiceCard
                        key={s.id}
                        {...s}
                        onApply={() => { setSelectedService(s); setShowModal(true); }}
                    />
                ))}
            </div>

            <section style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Your Applications</h2>
                    <div style={{ flexGrow: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }}></div>
                </div>
                <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : history.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Service</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Date</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(app => (
                                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 800, fontSize: '0.85rem' }}>{app.service_type.replace('_', ' ').toUpperCase()}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(app.submitted_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: app.status === 'pending' ? 'rgb(161, 98, 7)' : 'rgb(5, 150, 105)'
                                            }}>
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <ClipboardList size={40} strokeWidth={1.5} />
                            </div>
                            <p>No application history found.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Application Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '440px', padding: '2rem', borderRadius: '24px' }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '0.25rem', fontSize: '1.25rem' }}>Apply for {selectedService?.title}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Please provide the required information below.</p>

                        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="input-label">Full Name</label>
                                <input name="name" type="text" placeholder="John Doe" required />
                            </div>
                            <div>
                                <label className="input-label">Address / Landmark</label>
                                <input name="address" type="text" placeholder="Sector 4, PHC Road" required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn w-full" style={{ background: 'var(--surface-2)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary w-full">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
