import { useState, useEffect } from 'react';
import { getETA } from '../services/api';

// Typical stops for SRM Kattankulathur to select from
const COLLEGE_STOPS = [
    { id: 's1', name: 'SRM Main Gate', lat: 12.8236, lng: 80.0425 },
    { id: 's2', name: 'University Building', lat: 12.8228, lng: 80.0435 },
    { id: 's3', name: 'Tech Park', lat: 12.8215, lng: 80.0440 },
    { id: 's4', name: 'SRM Hospital', lat: 12.8248, lng: 80.0460 },
    { id: 's5', name: 'Potheri Railway Station', lat: 12.8250, lng: 80.0380 },
];

export default function ETAPanel({ activeBusId }) {
    const [selectedStop, setSelectedStop] = useState(COLLEGE_STOPS[0]);
    const [etaData, setEtaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!activeBusId || !selectedStop) {
            setEtaData(null);
            return;
        }

        const fetchETA = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getETA(activeBusId, selectedStop.lat, selectedStop.lng);
                setEtaData(res.data);
            } catch (err) {
                setError('Location unavailable');
                setEtaData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchETA();
        // Refresh ETA every 10 seconds
        const interval = setInterval(fetchETA, 10000);
        return () => clearInterval(interval);
    }, [activeBusId, selectedStop]);

    return (
        <div className="glass-card fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏱️ Predict Arrival Time
            </h3>

            <div className="form-group">
                <label className="form-label">Select Your Pickup Stop</label>
                <select
                    className="form-input"
                    value={selectedStop.id}
                    onChange={(e) => {
                        const stop = COLLEGE_STOPS.find(s => s.id === e.target.value);
                        if (stop) setSelectedStop(stop);
                    }}
                >
                    {COLLEGE_STOPS.map(stop => (
                        <option key={stop.id} value={stop.id}>{stop.name}</option>
                    ))}
                </select>
            </div>

            {!activeBusId && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Select a bus from the map or list to view ETA
                </div>
            )}

            {activeBusId && loading && !etaData && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <div className="spinner" style={{ width: '24px', height: '24px' }} />
                </div>
            )}

            {activeBusId && error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '13px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {activeBusId && etaData && !error && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase' }}>
                            Estimated Time
                        </span>
                        <span className="badge badge-blue">{activeBusId}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--accent-blue)', textShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                            {etaData.etaMinutes}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>mins</span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Distance: <b>{etaData.distance} km</b> to {selectedStop.name}
                    </div>
                </div>
            )}
        </div>
    );
}
