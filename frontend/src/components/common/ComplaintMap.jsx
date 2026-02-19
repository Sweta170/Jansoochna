import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ComplaintMap = ({ latitude, longitude }) => {
    if (!latitude || !longitude) return null;

    const position = [latitude, longitude];

    return (
        <div style={{ height: '300px', width: '100%', marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        Complaint Location
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default ComplaintMap;
