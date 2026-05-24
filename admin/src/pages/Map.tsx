import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Download, Maximize, Target, Grid } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import 'leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface Issue {
  id: string;
  title: string;
  category: 'roads' | 'sanitation' | 'water';
  status: 'open' | 'in_progress' | 'resolved';
  reporter: { name: string; id: string };
  lat: number;
  lng: number;
  createdAt: string;
}

const categoryColors = {
  roads: '#ef9f27',       // amber
  sanitation: '#e24b4a',  // red
  water: '#378add',       // blue
};

// Helper for custom SVG pin shape
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `,
    className: 'custom-leaflet-marker-div',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
};

// 1. Heatmap layer helper component
interface HeatmapLayerProps {
  points: [number, number, number][];
}
function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!(L as any).heatLayer) return;

    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: '#378add',
        0.6: '#4ade80',
        0.8: '#ef9f27',
        1.0: '#e24b4a'
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

// 2. Custom Marker Cluster and Single Marker rendering helper component
interface MarkerClusterGroupProps {
  issues: Issue[];
  enableCluster: boolean;
  onMarkerClick: (issueId: string) => void;
}
function MarkerClusterGroup({ issues, enableCluster, onMarkerClick }: MarkerClusterGroupProps) {
  const map = useMap();
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    let layer: any;

    if (enableCluster && (L as any).markerClusterGroup) {
      layer = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        iconCreateFunction: (cluster: any) => {
          const childMarkers = cluster.getAllChildMarkers();
          const count = childMarkers.length;
          
          // Determine dominant category
          const categories = childMarkers.map((m: any) => m.options.category || 'roads');
          const counts = categories.reduce((acc: any, c: string) => {
            acc[c] = (acc[c] || 0) + 1;
            return acc;
          }, {});
          
          let dominantCategory = 'roads';
          let maxCount = 0;
          Object.keys(counts).forEach(c => {
            if (counts[c] > maxCount) {
              maxCount = counts[c];
              dominantCategory = c;
            }
          });

          const color = categoryColors[dominantCategory as keyof typeof categoryColors] || '#64748B';

          return L.divIcon({
            html: `
              <div style="
                background-color: ${color}cc; 
                color: white; 
                width: 36px; 
                height: 36px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: 800; 
                font-size: 13px;
                border: 3.5px solid rgba(255,255,255,0.9);
                box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
              ">
                ${count}
              </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: [36, 36],
          });
        }
      });
    } else {
      layer = L.layerGroup();
    }

    issues.forEach((issue) => {
      const marker = L.marker([issue.lat, issue.lng], {
        icon: createCustomIcon(categoryColors[issue.category] || '#64748B'),
        category: issue.category,
      } as any);

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 10px; color: #94a3b8;">#${issue.id.slice(-6).toUpperCase()}</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background-color: ${
              issue.status === 'resolved' ? '#d1fae5' : issue.status === 'in_progress' ? '#fef3c7' : '#fee2e2'
            }; color: ${
              issue.status === 'resolved' ? '#065f46' : issue.status === 'in_progress' ? '#92400e' : '#991b1b'
            };">
              ${issue.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h3 style="font-weight: bold; color: #f8fafc; font-size: 13px; margin: 0 0 6px 0; line-height: 1.3;">${issue.title}</h3>
          
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px; border-top: 1px solid #334155; padding-top: 6px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${categoryColors[issue.category]}; display: inline-block;"></span>
              <span style="text-transform: capitalize;">${issue.category}</span>
            </div>
            <div>Reporter: <strong style="color: #cbd5e1;">${issue.reporter.name}</strong></div>
            <div>Reported: <strong style="color: #cbd5e1;">${new Date(issue.createdAt).toLocaleDateString()}</strong></div>
          </div>
          
          <a href="/issues/${issue.id}" style="display: block; text-align: center; font-size: 11px; font-weight: bold; color: #ffffff; background-color: #0f5c3a; padding: 6px; border-radius: 6px; text-decoration: none; transition: opacity 0.2s;">
            View full issue →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onMarkerClick(issue.id));
      layer.addLayer(marker);
    });

    layerGroupRef.current = layer;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, issues, enableCluster]);

  return null;
}

// 3. Map Viewport Bounds tracking component
interface MapBoundsListenerProps {
  issues: Issue[];
  onBoundsChange: (visible: Issue[]) => void;
}
function MapBoundsListener({ issues, onBoundsChange }: MapBoundsListenerProps) {
  const map = useMap();

  const updateVisible = () => {
    const bounds = map.getBounds();
    const visible = issues.filter(issue => bounds.contains([issue.lat, issue.lng]));
    onBoundsChange(visible);
  };

  useEffect(() => {
    updateVisible();
    map.on('moveend', updateVisible);
    map.on('zoomend', updateVisible);
    return () => {
      map.off('moveend', updateVisible);
      map.off('zoomend', updateVisible);
    };
  }, [map, issues]);

  return null;
}

// Helper to keep map instance reference in parent component
interface MapInstanceRefProps {
  onMapReady: (map: L.Map) => void;
}
function MapInstanceRef({ onMapReady }: MapInstanceRefProps) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map]);
  return null;
}

export default function MapView() {
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [visibleIssues, setVisibleIssues] = useState<Issue[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['open', 'in_progress', 'resolved']);
  
  // Layer states
  const [enableHeatmap, setEnableHeatmap] = useState(false);
  const [enableClustering, setEnableClustering] = useState(true);
  
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/admin/issues');
      const mapped = res.data.map((issue: any) => {
        let category: 'roads' | 'sanitation' | 'water' = 'roads';
        const cat = issue.category ? issue.category.toLowerCase() : 'other';
        if (cat === 'road' || cat === 'roads' || cat === 'streetlight') {
          category = 'roads';
        } else if (cat === 'garbage' || cat === 'drainage' || cat === 'parks' || cat === 'sanitation') {
          category = 'sanitation';
        } else if (cat === 'water') {
          category = 'water';
        }

        // Slight offset around Ludhiana center to avoid overlapping pins without locations
        const lat = issue.location?.lat || 30.9010 + (Math.random() - 0.5) * 0.05;
        const lng = issue.location?.lng || 75.8573 + (Math.random() - 0.5) * 0.05;

        return {
          id: issue._id,
          title: issue.title,
          category,
          status: issue.status || 'open',
          reporter: { name: issue.author?.name || 'Nagarik', id: issue.author?._id || '' },
          lat,
          lng,
          createdAt: issue.createdAt,
        };
      });
      setAllIssues(mapped);
    } catch (err) {
      console.error('Failed to load issues for map:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Update filtered issues
  useEffect(() => {
    const filtered = allIssues.filter((issue) => {
      const categoryMatch = selectedCategory === 'All' || issue.category === selectedCategory.toLowerCase();
      const statusMatch = selectedStatuses.includes(issue.status);
      return categoryMatch && statusMatch;
    });
    setFilteredIssues(filtered);
  }, [allIssues, selectedCategory, selectedStatuses]);

  // Viewport issues counts
  const totalIssuesInViewport = visibleIssues.length;
  
  const openCount = visibleIssues.filter(i => i.status === 'open').length;
  const inProgressCount = visibleIssues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = visibleIssues.filter(i => i.status === 'resolved').length;

  const roadsCount = visibleIssues.filter(i => i.category === 'roads').length;
  const sanitationCount = visibleIssues.filter(i => i.category === 'sanitation').length;
  const waterCount = visibleIssues.filter(i => i.category === 'water').length;

  const totalCategoryCount = Math.max(1, roadsCount + sanitationCount + waterCount);

  // Status donut data
  const totalInViewport = openCount + inProgressCount + resolvedCount;
  const statusDonutData = totalInViewport === 0
    ? [{ name: 'No Issues', value: 1, color: '#334155' }]
    : [
        { name: 'Open', value: openCount, color: '#e24b4a' },
        { name: 'In Progress', value: inProgressCount, color: '#ef9f27' },
        { name: 'Resolved', value: resolvedCount, color: '#1d9e75' }
      ];

  // Geolocation center
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstance?.setView([latitude, longitude], 15);
          toast.success('Centered on your location');
        },
        () => toast.error('Location access denied')
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  // Fullscreen trigger
  const toggleFullscreen = () => {
    const mapEl = document.getElementById('map-container-wrapper');
    if (!mapEl) return;
    if (!document.fullscreenElement) {
      mapEl.requestFullscreen().catch(() => toast.error('Fullscreen failed'));
    } else {
      document.exitFullscreen();
    }
  };

  // Export PDF via print layout
  const handleExportPDF = () => {
    toast.success('Opening print layout for PDF generation...');
    window.print();
  };

  // Toggle status filters helper
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Heatmap points
  const heatPoints = filteredIssues.map(i => [i.lat, i.lng, 1.0] as [number, number, number]);

  // Compute "+N vs last week"
  const vsLastWeek = allIssues.filter(
    i => new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="h-auto md:h-[calc(100vh-6.5rem)] flex flex-col md:flex-row gap-6 bg-[#0f1117] text-slate-100 p-5 rounded-2xl border border-slate-800/80 overflow-y-auto md:overflow-hidden">
      
      {/* Styles inject */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-leaflet-marker-div, .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: #1e2330 !important;
          color: #f8fafc !important;
          border-radius: 12px !important;
          border: 1px solid #334155 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
        }
        .leaflet-popup-tip {
          background: #1e2330 !important;
          border: 1px solid #334155 !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94a3b8 !important;
          padding: 8px 8px 0 0 !important;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #map-container-wrapper, #map-container-wrapper * {
            visibility: visible;
          }
          #map-container-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}} />

      <div className="flex-1 flex flex-col gap-4">
        {/* Filter bar */}
        <div className="bg-[#1e2330] p-3 rounded-xl border border-slate-700/50 flex flex-wrap gap-4 items-center justify-between shadow-md">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5 mr-2">
              <Filter size={14} className="text-primary" /> Category:
            </span>
            {['All', 'Roads', 'Sanitation', 'Water'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? cat === 'Roads'
                      ? 'border-[#ef9f27] bg-[#ef9f27]/10 text-[#ef9f27]'
                      : cat === 'Sanitation'
                      ? 'border-[#e24b4a] bg-[#e24b4a]/10 text-[#e24b4a]'
                      : cat === 'Water'
                      ? 'border-[#378add] bg-[#378add]/10 text-[#378add]'
                      : 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5 mr-2">
              Status:
            </span>
            {[
              { id: 'open', label: 'Open', color: 'border-[#e24b4a] bg-[#e24b4a]/10 text-[#e24b4a]' },
              { id: 'in_progress', label: 'In Progress', color: 'border-[#ef9f27] bg-[#ef9f27]/10 text-[#ef9f27]' },
              { id: 'resolved', label: 'Resolved', color: 'border-[#1d9e75] bg-[#1d9e75]/10 text-[#1d9e75]' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => toggleStatus(st.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  selectedStatuses.includes(st.id)
                    ? st.color
                    : 'border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Wrapper with Controls */}
        <div id="map-container-wrapper" className="h-[450px] md:h-full flex-1 bg-[#1e2330] border border-slate-800 rounded-xl overflow-hidden relative shadow-inner z-0">
          
          {/* Custom Overlay Controls */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <button 
              onClick={() => mapInstance?.zoomIn()} 
              className="w-10 h-10 bg-[#1e2330] hover:bg-[#2d3748] text-slate-100 border border-slate-700/60 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button 
              onClick={() => mapInstance?.zoomOut()} 
              className="w-10 h-10 bg-[#1e2330] hover:bg-[#2d3748] text-slate-100 border border-slate-700/60 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg transition-colors"
              title="Zoom Out"
            >
              -
            </button>
            <button 
              onClick={handleMyLocation} 
              className="w-10 h-10 bg-[#1e2330] hover:bg-[#2d3748] text-slate-100 border border-slate-700/60 rounded-lg shadow-lg flex items-center justify-center transition-colors"
              title="My Location"
            >
              <Target size={18} />
            </button>
            <button 
              onClick={toggleFullscreen} 
              className="w-10 h-10 bg-[#1e2330] hover:bg-[#2d3748] text-slate-100 border border-slate-700/60 rounded-lg shadow-lg flex items-center justify-center transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize size={18} />
            </button>
          </div>

          <MapContainer 
            center={[30.9010, 75.8573]} 
            zoom={13} 
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapInstanceRef onMapReady={setMapInstance} />
            <MapBoundsListener issues={filteredIssues} onBoundsChange={setVisibleIssues} />

            {/* Heatmap Layer */}
            {enableHeatmap && <HeatmapLayer points={heatPoints} />}

            {/* Markers & Clusters */}
            {!enableHeatmap && (
              <MarkerClusterGroup 
                issues={filteredIssues} 
                enableCluster={enableClustering} 
                onMarkerClick={(id) => console.log('Marker clicked:', id)}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Stats panel (right sidebar, 210px wide) */}
      <div className="w-full md:w-[210px] shrink-0 bg-[#1e2330] border border-slate-800/80 rounded-xl flex flex-col p-4 overflow-y-auto gap-5 shadow-lg">
        
        {/* Viewport Count */}
        <div>
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-1">Issues in Viewport</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">{totalIssuesInViewport}</span>
            <span className="text-xs font-semibold text-emerald-400">+{vsLastWeek} this week</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-1">
            <Grid size={12} className="text-primary" /> Categories
          </p>
          <div className="space-y-3">
            {[
              { name: 'Roads', count: roadsCount, color: 'bg-[#ef9f27]' },
              { name: 'Sanitation', count: sanitationCount, color: 'bg-[#e24b4a]' },
              { name: 'Water', count: waterCount, color: 'bg-[#378add]' }
            ].map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => setSelectedCategory(prev => prev === cat.name ? 'All' : cat.name)}
                className="group cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-300 group-hover:text-white transition-colors">{cat.name}</span>
                  <span className="text-slate-100">{cat.count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cat.color} transition-all duration-300`} 
                    style={{ width: `${Math.min(100, (cat.count / totalCategoryCount) * 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status donut chart */}
        <div>
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-2">Status Breakdown</p>
          <div className="h-28 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={36}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {totalInViewport === 0 ? (
                <>
                  <span className="text-[9px] font-bold text-slate-500 leading-none">NO ISSUES</span>
                  <span className="text-sm font-black text-slate-400 leading-none mt-1">0</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-slate-400">OPEN</span>
                  <span className="text-sm font-black text-white leading-none">{openCount}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map Layers Section */}
        <div className="border-t border-slate-800/80 pt-4">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3">Map Layers</p>
          <div className="space-y-3 text-xs font-bold">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Heatmap Mode</span>
              <input 
                type="checkbox" 
                checked={enableHeatmap} 
                onChange={(e) => setEnableHeatmap(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Clustering Mode</span>
              <input 
                type="checkbox" 
                checked={enableClustering} 
                onChange={(e) => setEnableClustering(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Export Action */}
        <button 
          onClick={handleExportPDF}
          className="mt-auto w-full bg-primary text-primary-foreground font-extrabold py-2.5 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-xs"
        >
          <Download size={14} /> Export Map PDF
        </button>

      </div>
    </div>
  );
}
