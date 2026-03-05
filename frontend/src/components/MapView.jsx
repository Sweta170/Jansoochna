import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const statusColors = {
    open: '#EF4444',
    in_progress: '#F59E0B',
    resolved: '#10B981',
    closed: '#64748B'
};

const MapView = ({ complaints }) => {
    const [center, setCenter] = useState([20.5937, 78.9629]); // India center

    useEffect(() => {
        if (complaints && complaints.length > 0) {
            const valid = complaints.filter(c => c.latitude && c.longitude);
            if (valid.length > 0) {
                setCenter([valid[0].latitude, valid[0].longitude]);
            }
        }
    }, [complaints]);

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2rem' }}>
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {complaints.filter(c => c.latitude && c.longitude).map(c => (
                    <Marker key={c.id} position={[c.latitude, c.longitude]}>
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                                        background: statusColors[c.status], color: 'white'
                                    }}>
                                        {c.status.toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>#{c.id}</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{c.title}</h4>
                                <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0', color: '#444' }}>
                                    {c.description?.substring(0, 60)}...
                                </p>
                                <a href={`/complaints/${c.id}`} style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View Details <ArrowRight size={14} />
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
