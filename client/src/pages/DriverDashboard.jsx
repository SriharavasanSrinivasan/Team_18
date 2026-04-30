import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { getMyBus } from '../services/api';
import api from '../services/api';

export default function DriverDashboard() {
    const [bus, setBus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Status visualizers
    const [lastLoc, setLastLoc] = useState(null);
    const [broadcastError, setBroadcastError] = useState('');

    const fetchBusDetails = async () => {
        try {
            const res = await getMyBus();
            setBus(res.data);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to fetch assigned bus');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusDetails();
        return () => stopBroadcasting(); // Cleanup GPS listener on unmount
    }, []);

    const sendLocationUpdate = async (coords) => {
        if (!bus) return;

        const payload = {
            busId: bus.busId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            speed: coords.speed ? Math.round(coords.speed * 3.6) : 0, // Convert m/s to km/h
            heading: coords.heading || 0,
            routeIndex: 0
        };

        try {
            // Use shared api instance (correct URL + auth token auto-attached)
            await api.post('/location/update', payload);
            setBroadcastError('');
            setLastLoc({
                time: new Date().toLocaleTimeString(),
                lat: coords.latitude.toFixed(5),
                lng: coords.longitude.toFixed(5)
            });
        } catch (err) {
            console.error("Failed to broadcast location", err);
            setBroadcastError(`Send failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const startBroadcasting = () => {
        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser');
            return;
        }

        setErrorMsg('');
        setIsBroadcasting(true);

        const id = navigator.geolocation.watchPosition(
            (position) => {
                sendLocationUpdate(position.coords);
            },
            (err) => {
                setErrorMsg(`GPS Error: ${err.message}`);
                setIsBroadcasting(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        setWatchId(id);
    };

    const stopBroadcasting = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsBroadcasting(false);
    };

    if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;

    return (
        <div className="page-layout">
            <Navbar />
            <div className="page-content" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Driver Console</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your trip and broadcast your live location</p>
                </div>

                {errorMsg && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        {errorMsg}
                    </div>
                )}

                {bus ? (
                    <div className="glass-card fade-in-up" style={{ textAlign: 'center', padding: '32px 24px' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '40px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Assigned Vehicle</span>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-blue)', marginTop: '4px' }}>{bus.busId}</div>
                        </div>

                        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{bus.routeName}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Route visualization is available on the Faculty dashboard. Keep this app open while driving to stream your coordinates.</p>

                        <button
                            className={`btn ${isBroadcasting ? 'btn-danger' : 'btn-primary'}`}
                            style={{ width: '100%', padding: '20px', fontSize: '18px', justifyContent: 'center', boxShadow: isBroadcasting ? '0 0 20px rgba(239,68,68,0.4)' : '0 0 20px rgba(59,130,246,0.3)' }}
                            onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
                        >
                            {isBroadcasting ? '⏹ Stop Broadcasting' : '▶ Start Trip & Broadcast Location'}
                        </button>

                        {isBroadcasting && (
                            <div style={{ marginTop: '32px', padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: broadcastError ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: '600' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: broadcastError ? 'var(--accent-red)' : 'var(--accent-green)', animation: broadcastError ? 'none' : 'pulse 2s infinite' }} />
                                    {broadcastError ? 'Connection Error' : 'Live Connection Active'}
                                </div>
                                {broadcastError && (
                                    <div style={{ fontSize: '12px', color: 'var(--accent-red)', textAlign: 'center' }}>{broadcastError}</div>
                                )}
                                {lastLoc && !broadcastError && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        Last sync: {lastLoc.time} • [{lastLoc.lat}, {lastLoc.lng}]
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚫</div>
                        <h3 style={{ marginBottom: '8px' }}>No Bus Assigned</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Please contact the Transport Administrator to get a vehicle assigned to your account.</p>
                    </div>
                )}
            </div>
            {/* Adding a simple pulse animation for the live dot */}
            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .btn-danger {
                    background: var(--accent-red);
                    color: white;
                }
                .btn-danger:hover {
                    opacity: 0.9;
                }
            `}</style>
        </div>
    );
}
