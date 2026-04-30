export default function BusCard({ bus, location, isActive, onClick }) {
    const isDelayed = location && (Date.now() - new Date(location.timestamp).getTime() > 2 * 60 * 1000);

    const handleShare = (e) => {
        e.stopPropagation(); // Prevent triggering the card's onClick
        if (!location) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const busLat = location.latitude;
                const busLng = location.longitude;
                
                // Google Maps Directions: Origin (Bus) -> Destination (User)
                const url = `https://www.google.com/maps/dir/?api=1&origin=${busLat},${busLng}&destination=${userLat},${userLng}&travelmode=driving`;
                window.open(url, '_blank');
            }, (error) => {
                alert("Please enable location services to get directions to your location.");
                // Fallback: Origin (Bus) -> Destination (Empty/My Location)
                const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=My+Location`;
                window.open(url, '_blank');
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div
            className="glass-card"
            onClick={onClick}
            style={{
                padding: '16px',
                cursor: 'pointer',
                border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                boxShadow: isActive ? '0 0 0 1px var(--accent-blue), 0 4px 20px rgba(59,130,246,0.15)' : 'none',
                transform: isActive ? 'translateY(-2px)' : 'none',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{bus.routeName}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {bus.busId}
                        </span>
                        <span>Driver: {bus.driverName}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {location ? (
                        <span className={`badge ${isDelayed ? 'badge-red' : 'badge-green'}`}>
                            {isDelayed ? 'Delayed' : 'En Route'}
                        </span>
                    ) : (
                        <span className="badge badge-amber">Offline</span>
                    )}
                    
                    {location && (
                        <button 
                            onClick={handleShare}
                            className="btn btn-secondary"
                            style={{ 
                                padding: '4px 8px', 
                                fontSize: '11px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                background: 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.2)',
                                color: 'var(--accent-blue)'
                            }}
                        >
                            🔗 Share
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Speed</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {location ? `${location.speed} km/h` : '--'}
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Last Updated</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {location ? new Date(location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </div>
                </div>
                {location && (
                    <div style={{ flex: 1.5 }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Live Coordinates</div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
