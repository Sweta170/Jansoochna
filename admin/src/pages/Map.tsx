import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers, List } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const mockMarkers = [
  { id: '1', lat: 30.9010, lng: 75.8573, title: 'Deep Pothole', category: 'Roads', status: 'open' },
  { id: '2', lat: 30.9080, lng: 75.8480, title: 'Streetlight out', category: 'Electricity', status: 'in_progress' },
  { id: '3', lat: 30.8950, lng: 75.8600, title: 'Garbage dump', category: 'Sanitation', status: 'urgent' },
];

export default function MapView() {
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 relative">
      
      {/* Map Container */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden relative z-0">
        <div className="absolute top-4 right-4 z-[400] flex bg-card rounded-lg shadow-md border border-border overflow-hidden">
          <button 
            onClick={() => setViewMode('markers')}
            className={`px-3 py-2 flex items-center gap-2 text-sm font-semibold transition-colors ${viewMode === 'markers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <MapPinIcon size={16} /> Markers
          </button>
          <button 
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-2 flex items-center gap-2 text-sm font-semibold transition-colors ${viewMode === 'heatmap' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <Layers size={16} /> Heatmap
          </button>
        </div>

        <MapContainer center={[30.9010, 75.8573]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // clean base map
          />
          
          {viewMode === 'markers' && mockMarkers.map(marker => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]}>
              <Popup>
                <div className="font-sans">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{marker.category}</span>
                  <h3 className="font-bold text-foreground text-sm m-0 leading-tight">{marker.title}</h3>
                  <p className="text-xs text-primary mt-1 cursor-pointer hover:underline">View details →</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {viewMode === 'heatmap' && mockMarkers.map(marker => (
            <CircleMarker 
              key={marker.id}
              center={[marker.lat, marker.lng]}
              radius={30}
              pathOptions={{ fillColor: 'var(--crimson)', fillOpacity: 0.4, color: 'transparent' }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Side Panel Stats */}
      <div className="w-full md:w-80 bg-card border border-border rounded-xl shadow-sm flex flex-col p-4 z-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-foreground">Map Statistics</h2>
          <Filter size={18} className="text-muted-foreground" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Issues in view</p>
            <p className="text-4xl font-extrabold text-foreground">24</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <List size={16} className="text-primary" /> Top Categories
            </h3>
            <div className="space-y-2">
              {['Roads (12)', 'Sanitation (8)', 'Water (4)'].map((c, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{c.split(' ')[0]}</span>
                  <span className="font-semibold text-foreground">{c.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function MapPinIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}
