import React, { useState } from 'react';
import api from '../services/api';
import { Shield, ShieldCheck, Ambulance, Flame, User, Zap, AlertCircle } from 'lucide-react';

export default function EmergencyPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [sosLoading, setSosLoading] = useState(null);

    const emergencyContacts = [
        { name: 'Police', number: '100', icon: <ShieldCheck size={24} />, color: '#1E40AF' },
        { name: 'Ambulance', number: '102', icon: <Ambulance size={24} />, color: '#DC2626' },
        { name: 'Fire Brigade', number: '101', icon: <Flame size={24} />, color: '#EA580C' },
        { name: 'Women Helpline', number: '1091', icon: <User size={24} />, color: '#DB2777' },
        { name: 'Disaster SOS', number: '108', icon: <Zap size={24} />, color: '#000000' }
    ];

    async function handleSOS(contact) {
        setSosLoading(contact.name);
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    await api.post('emergency/log', {
                        type: contact.name.toLowerCase().replace(' ', '_'),
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    alert(`SOS Signal for ${contact.name} sent with your location.`);
                    setSosLoading(null);
                }, (err) => {
                    console.error("Geo error", err);
                    api.post('emergency/log', { type: contact.name.toLowerCase().replace(' ', '_') });
                    alert(`SOS Signal for ${contact.name} sent (Location access denied).`);
                    setSosLoading(null);
                });
            } else {
                await api.post('emergency/log', { type: contact.name.toLowerCase().replace(' ', '_') });
                alert(`SOS Signal for ${contact.name} sent.`);
                setSosLoading(null);
            }
        } catch (err) {
            console.error(err);
            setSosLoading(null);
        }
    }

    return (
        <>
            {!isOpen && (
                <button
                    className="sos-floating-fab"
                    onClick={() => setIsOpen(true)}
                    title="Emergency SOS"
                >
                    <div className="sos-beacon"></div>
                    <div className="sos-beacon"></div>
                    <AlertCircle size={28} strokeWidth={3} />
                    <span>SOS</span>
                </button>
            )}

            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', border: '2px solid rgba(220, 38, 38, 0.2)', background: 'var(--surface)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ color: '#DC2626', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <Shield size={48} strokeWidth={1.5} />
                            </div>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.75rem', marginBottom: '0.5rem' }}>Emergency Panel</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quick access to help. One tap will dial and log your location.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {emergencyContacts.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => handleSOS(c)}
                                    disabled={sosLoading !== null}
                                    style={{
                                        padding: '1.25rem',
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        opacity: sosLoading && sosLoading !== c.name ? 0.5 : 1
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                                    <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{sosLoading === c.name ? 'Sending...' : c.name}</span>
                                    <span style={{ color: c.color, fontWeight: 900, fontSize: '1rem' }}>{c.number}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="btn w-full"
                            style={{ background: 'var(--surface-2)', fontWeight: 800 }}
                        >
                            Close Panel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = `
.sos-floating-fab {
    position: fixed;
    top: 140px;
    left: 40px;
    z-index: 2500;
    width: 65px;
    height: 65px;
    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    border: 4px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(220, 38, 38, 0.5);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: 'Outfit', sans-serif;
    padding: 0;
}

.sos-floating-fab:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 15px 40px rgba(220, 38, 38, 0.7);
    border-color: rgba(255, 255, 255, 0.5);
}

.sos-floating-fab span {
    font-size: 0.7rem;
    font-weight: 900;
    margin-top: -2px;
    letter-spacing: 0.05em;
}

.sos-beacon {
    position: absolute;
    inset: -6px;
    border: 2px solid #ef4444;
    border-radius: 50%;
    animation: sos-beacon-pulse 2s infinite;
    opacity: 0;
    pointer-events: none;
}

.sos-beacon:nth-child(2) {
    animation-delay: 0.5s;
}

@keyframes sos-beacon-pulse {
    0% { transform: scale(0.9); opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
}

@media (max-width: 768px) {
    .sos-floating-fab {
        top: auto;
        bottom: 110px;
        right: 20px;
        width: 55px;
        height: 55px;
    }
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
