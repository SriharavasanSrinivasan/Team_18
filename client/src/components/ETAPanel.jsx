import { useState, useEffect } from 'react';
import { getETA } from '../services/api';

export default function ETAPanel({ activeBusId, destination }) {
    const [etaData, setEtaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!activeBusId || !destination) {
            setEtaData(null);
            return;
        }

        const fetchETA = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getETA(activeBusId, destination.lat, destination.lng);
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
    }, [activeBusId, destination]);

    return (
        <div className="glass-card fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏱️ Predict Arrival Time
            </h3>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Destination</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-blue)' }}>📍 {destination?.name || 'Unknown'}</span>
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
                        Distance: <b>{etaData.distance} km</b> to {destination?.name || 'Destination'}
                    </div>
                </div>
            )}
        </div>
    );
}
