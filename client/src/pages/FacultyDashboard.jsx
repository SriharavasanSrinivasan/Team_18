import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import ETAPanel from '../components/ETAPanel';
import BusCard from '../components/BusCard';
import { getAllLatestLocations, getBuses } from '../services/api';

export default function FacultyDashboard() {
    const [buses, setBuses] = useState([]);
    const [activeBusId, setActiveBusId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Map representation: { [busId]: { latitude, longitude, speed, heading, timestamp, isDelayed } }
    const [locations, setLocations] = useState({});

    useEffect(() => {
        // 1. Fetch initial states
        const initData = async () => {
            try {
                const busRes = await getBuses();
                setBuses(busRes.data);

                const locRes = await getAllLatestLocations();
                const locMap = {};
                locRes.data.forEach(item => {
                    if (item.location) {
                        locMap[item.bus.busId] = item.location;
                    }
                });
                setLocations(locMap);

                if (busRes.data.length > 0) setActiveBusId(busRes.data[0].busId);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        initData();

        // 2. Connect Socket.io for live updates
        const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const socket = io(socketURL);

        socket.on('locationUpdate', (data) => {
            setLocations(prev => ({
                ...prev,
                [data.busId]: {
                    ...data,
                    isDelayed: false, // Fresh update means not delayed
                }
            }));
        });

        // 3. Periodic delay check (stale locations > 2m)
        const interval = setInterval(() => {
            const now = Date.now();
            setLocations(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(id => {
                    if (next[id] && !next[id].isDelayed) {
                        const lastSeen = new Date(next[id].timestamp).getTime();
                        if (now - lastSeen > 120000) { // 2 mins
                            next[id].isDelayed = true;
                            changed = true;
                        }
                    }
                });
                return changed ? next : prev;
            });
        }, 30000);

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, []);

    // Format locations for the Map component
    const mapLocations = Object.keys(locations).map(id => ({
        busId: id,
        ...locations[id]
    }));

    const activeLocation = activeBusId ? locations[activeBusId] : null;

    return (
        <div className="page-layout">
            <Navbar />

            {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </div>
            ) : (
                <div className="page-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2.5fr', gap: '24px', height: 'calc(100vh - 80px)' }}>

                    {/* Left Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
                        <ETAPanel activeBusId={activeBusId} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', margin: 0 }}>Available Buses</h3>
                                <span className="badge badge-green" style={{ background: 'rgba(16,185,129,0.1)' }}>Live</span>
                            </div>

                            {buses.map(bus => (
                                <BusCard
                                    key={bus._id}
                                    bus={bus}
                                    location={locations[bus.busId]}
                                    isActive={activeBusId === bus.busId}
                                    onClick={() => setActiveBusId(bus.busId)}
                                />
                            ))}
                            {buses.length === 0 && (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                                    No active buses found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Map Area */}
                    <div className="fade-in-up" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
                        <MapView
                            busLocations={mapLocations}
                            center={activeLocation ? { lat: activeLocation.latitude, lng: activeLocation.longitude } : null}
                            highlightBusId={activeBusId}
                        />
                    </div>

                </div>
            )}
        </div>
    );
}
