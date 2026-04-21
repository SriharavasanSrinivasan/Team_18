import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { useTheme } from '../context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons not showing in React Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom Bus Icon (HTML based)
const createBusIcon = (heading, isDelayed) => L.divIcon({
    className: 'custom-bus-icon',
    html: `<div style="
    width: 36px; height: 36px;
    background: ${isDelayed ? 'var(--accent-red)' : 'var(--accent-blue)'};
    border: 3px solid white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    transform: rotate(${heading || 0}deg);
    transition: all 0.3s ease;
  ">
    <div style="font-size: 16px; transform: rotate(-${heading || 0}deg);">🚌</div>
  </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Component to recenter map when focused location changes
const MapUpdater = ({ center }) => {
    const map = useMap();
    const prevCenterRef = useRef();

    useEffect(() => {
        // Only fly if a valid center is provided AND it's different from the last one
        if (center && center.lat && center.lng) {
            const isNew = !prevCenterRef.current || 
                          prevCenterRef.current.lat !== center.lat || 
                          prevCenterRef.current.lng !== center.lng;
            
            if (isNew) {
                map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
                prevCenterRef.current = center;
            }
        }
    }, [center, map]);
    return null;
};

export default function MapView({ busLocations, stops = [], center, highlightBusId }) {
    const { theme } = useTheme();
    const defaultCenter = [12.8236, 80.0425]; // SRM Kattankulathur Main Gate

    return (
        <div className="glass-card" style={{ height: '100%', minHeight: '400px', overflow: 'hidden', position: 'relative' }}>
            <MapContainer
                center={center ? [center.lat, center.lng] : defaultCenter}
                zoom={14}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                {/* Theme-aware map tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    url={theme === 'dark' 
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />

                <MapUpdater center={center} />

                {/* Render Bus Stops */}
                {stops.map((stop, idx) => (
                    <CircleMarker
                        key={`${stop.name}-${idx}`}
                        center={[stop.lat, stop.lng]}
                        radius={6}
                        pathOptions={{
                            fillColor: 'var(--accent-blue)',
                            fillOpacity: 0.8,
                            color: 'white',
                            weight: 2
                        }}
                    >
                        <Popup className="dark-popup">
                            <div style={{ padding: '4px', fontSize: '13px', fontWeight: 'bold', color: '#111' }}>
                                🚏 Stop: {stop.name}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* Render Live Buses */}

                {busLocations.map((loc) => {
                    if (!loc || !loc.latitude) return null;
                    const isHighlight = highlightBusId === loc.busId;
                    return (
                        <Marker
                            key={loc.busId}
                            position={[loc.latitude, loc.longitude]}
                            icon={createBusIcon(loc.heading, loc.isDelayed)}
                            zIndexOffset={isHighlight ? 1000 : 0}
                        >
                            <Popup className="dark-popup">
                                <div style={{ padding: '8px', minWidth: '150px' }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111' }}>{loc.busId}</h3>
                                    <div style={{ display: 'grid', gap: '4px', fontSize: '13px', color: '#444' }}>
                                        <div><b>Speed:</b> {loc.speed} km/h</div>
                                        <div><b>Status:</b> {loc.isDelayed ? <span style={{ color: 'red' }}>Delayed</span> : <span style={{ color: 'green' }}>Active</span>}</div>
                                        <div style={{ fontSize: '11px', marginTop: '4px', color: '#888' }}>
                                            Updated: {new Date(loc.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
