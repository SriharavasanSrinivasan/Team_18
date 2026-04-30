import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import ETAPanel from '../components/ETAPanel';
import BusCard from '../components/BusCard';
import { getAllLatestLocations, getBuses, getBusStops, getProfile } from '../services/api';

export default function FacultyDashboard() {
    const [allBuses, setAllBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [activeBusId, setActiveBusId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('mine'); // 'mine' or 'all'
    const [stops, setStops] = useState([]);
    const [assignedBusId, setAssignedBusId] = useState(null);
    const [boardingStopName, setBoardingStopName] = useState(null);
    const [tripMode, setTripMode] = useState('to-college'); // 'to-college' or 'to-home'
    const [error, setError] = useState(null);
    
    // Map representation: { [busId]: { latitude, longitude, speed, heading, timestamp, isDelayed } }
    const [locations, setLocations] = useState({});

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch user profile first to get fresh assignedBus
                const profileRes = await getProfile();
                const freshAssignedBusId = profileRes.data.assignedBus;
                const freshBoardingStop = profileRes.data.boardingStop;
                setAssignedBusId(freshAssignedBusId);
                setBoardingStopName(freshBoardingStop);

                // 2. Fetch fleet data
                const [busRes, locRes, stopsRes] = await Promise.all([
                    getBuses(),
                    getAllLatestLocations(),
                    getBusStops()
                ]);

                setAllBuses(busRes.data);
                console.log("[DEBUG] allBuses loaded:", busRes.data);
                setStops(stopsRes.data);

                const locMap = {};
                locRes.data.forEach(item => {
                    if (item.location && item.bus) {
                        locMap[item.bus.busId] = item.location;
                    }
                });
                setLocations(locMap);

                // Initial filtering and active bus selection
                if (freshAssignedBusId) {
                    const myBus = busRes.data.find(b => 
                        b.busId?.toString().trim().toUpperCase() === freshAssignedBusId?.toString().trim().toUpperCase()
                    );
                    if (myBus) {
                        setFilteredBuses([myBus]);
                        setActiveBusId(myBus.busId);
                        setViewMode('mine');
                    } else {
                        setFilteredBuses(busRes.data);
                        if (busRes.data.length > 0) setActiveBusId(busRes.data[0].busId);
                        setViewMode('all');
                    }
                } else {
                    setFilteredBuses(busRes.data);
                    if (busRes.data.length > 0) setActiveBusId(busRes.data[0].busId);
                    setViewMode('all');
                }
                setLoading(false);
            } catch (err) {
                console.error("Dashboard initialization error:", err);
                setError(`Connection failed: ${err.response?.data?.message || err.message}`);
                setLoading(false);
            }
        };
        initData();

        const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const socket = io(socketURL);

        socket.on('locationUpdate', (data) => {
            setLocations(prev => ({
                ...prev,
                [data.busId]: {
                    ...data,
                    isDelayed: false,
                }
            }));
        });

        const interval = setInterval(() => {
            const now = Date.now();
            setLocations(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(id => {
                    if (next[id] && !next[id].isDelayed) {
                        const lastSeen = new Date(next[id].timestamp).getTime();
                        if (now - lastSeen > 120000) {
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

    // Handle view mode changes
    useEffect(() => {
        // Only run if loading is done
        if (loading) return;

        console.log("[DEBUG] Effect triggered. viewMode:", viewMode, "allBuses.length:", allBuses.length, "assignedBusId:", assignedBusId);

        if (viewMode === 'mine' && assignedBusId) {
            const myBus = allBuses.find(b =>
                b.busId?.toString().trim().toUpperCase() === assignedBusId?.toString().trim().toUpperCase()
            );
            if (myBus) {
                setFilteredBuses([myBus]);
                setActiveBusId(myBus.busId);
            } else {
                // Bus not found in fleet — silently show all buses
                setFilteredBuses(allBuses);
                if (allBuses.length > 0) setActiveBusId(allBuses[0].busId);
            }
        } else {
            setFilteredBuses(allBuses);
        }
    }, [viewMode, allBuses, assignedBusId, loading]);

    const mapLocations = Object.keys(locations).map(id => ({
        busId: id,
        ...locations[id]
    }));

    // Filter map locations based on viewMode
    const visibleMapLocations = viewMode === 'mine' && assignedBusId
        ? mapLocations.filter(l => l.busId === assignedBusId)
        : mapLocations;

    const activeLocation = activeBusId ? locations[activeBusId] : null;

    // Get active bus route stops for polyline
    // Destination for ETA calculation
    const COLLEGE_STOP = { name: 'SRM KTR Dropping Point', lat: 12.822944, lng: 80.038821 };
    
    let destination = COLLEGE_STOP;
    if (tripMode === 'to-home' && boardingStopName) {
        const bStop = stops.find(s => s.name === boardingStopName);
        if (bStop) {
            destination = { name: bStop.name, lat: bStop.lat, lng: bStop.lng };
        }
    }

    const activeBusObj = allBuses.find(b => b.busId === activeBusId);
    const activeRouteStops = activeBusObj?.stops || [];

    return (
        <div className="page-layout">
            <Navbar />
            
            {error && (
                <div style={{ margin: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-red)' }}>
                    {error}
                    <button onClick={() => window.location.reload()} style={{ marginLeft: '12px', background: 'var(--accent-red)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
                </div>
            )}

            {loading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
                    <div className="spinner" style={{ width: '50px', height: '50px' }} />
                    <h2 style={{ color: 'var(--accent-blue)', letterSpacing: '2px' }}>🔄 INITIALIZING DATA...</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Connecting to live tracking server</p>
                </div>
            ) : (
                <div className="page-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2.5fr', gap: '24px', height: 'calc(100vh - 80px)' }}>

                    {/* Left Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
                        <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                            <button 
                                className={`btn ${tripMode === 'to-college' ? 'btn-primary' : 'btn-secondary'}`} 
                                style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600' }}
                                onClick={() => setTripMode('to-college')}
                            >
                                🏫 To College
                            </button>
                            <button 
                                className={`btn ${tripMode === 'to-home' ? 'btn-primary' : 'btn-secondary'}`} 
                                style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600' }}
                                onClick={() => setTripMode('to-home')}
                                disabled={!boardingStopName}
                            >
                                🏠 To Home
                            </button>
                        </div>

                        <ETAPanel activeBusId={activeBusId} destination={destination} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', margin: 0 }}>Available Buses</h3>
                                <div className="glass-card" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: 'var(--radius-sm)' }}>
                                    <button 
                                        className={`btn ${viewMode === 'mine' ? 'btn-primary' : 'btn-secondary'}`} 
                                        style={{ padding: '4px 12px', fontSize: '11px' }}
                                        onClick={() => setViewMode('mine')}
                                        disabled={!assignedBusId}
                                    >
                                        My Route
                                    </button>
                                    <button 
                                        className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-secondary'}`} 
                                        style={{ padding: '4px 12px', fontSize: '11px' }}
                                        onClick={() => setViewMode('all')}
                                    >
                                        All Routes
                                    </button>
                                </div>
                            </div>

                            {loading && (
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--accent-blue)' }}>🔄 Initializing tracking system...</span>
                                </div>
                            )}

                            {!loading && allBuses.length === 0 && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-red)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--accent-red)' }}>⚠️ No active buses found in the fleet. Please contact admin.</span>
                                </div>
                            )}

                            {!loading && viewMode === 'mine' && assignedBusId && filteredBuses.length === 0 && allBuses.length > 0 && (
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-amber)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--accent-amber)' }}>⚠️ Your assigned bus "{assignedBusId}" is not in the active fleet. Showing all routes instead.</span>
                                    <button onClick={() => setViewMode('all')} style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}>View All Routes</button>
                                </div>
                            )}

                            {filteredBuses.map(bus => (
                                bus && bus.busId ? (
                                    <BusCard
                                        key={bus._id || bus.busId}
                                        bus={bus}
                                        location={locations[bus.busId]}
                                        isActive={activeBusId === bus.busId}
                                        onClick={() => setActiveBusId(bus.busId)}
                                    />
                                ) : null
                            ))}
                            {filteredBuses.length === 0 && !assignedBusId && (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                                    No active buses found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Map Area */}
                    <div className="fade-in-up" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
                        <MapView
                            busLocations={visibleMapLocations}
                            stops={stops}
                            routeStops={activeRouteStops}
                            center={activeLocation ? { lat: activeLocation.latitude, lng: activeLocation.longitude } : null}
                            highlightBusId={activeBusId}
                            boardingStopName={boardingStopName}
                        />
                    </div>

                </div>
            )}
        </div>
    );
}
