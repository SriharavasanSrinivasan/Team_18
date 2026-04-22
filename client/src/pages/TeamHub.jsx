import { useNavigate } from 'react-router-dom';

export default function TeamHub() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background blobs for premium feel */}
            <div style={{
                position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px',
                background: 'rgba(59,130,246,0.1)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '10%', width: '350px', height: '350px',
                background: 'rgba(139,92,246,0.1)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0
            }} />

            <div className="glass-card fade-in-up" style={{
                width: '100%', maxWidth: '500px', padding: '60px 40px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', zIndex: 1
            }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Team Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        Manage your team members and view detailed information.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button 
                        onClick={() => navigate('/add-member')} 
                        className="btn btn-primary" 
                        style={{ 
                            padding: '16px', fontSize: '16px', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
                        }}
                    >
                        ➕ Add Members
                    </button>
                    
                    <button 
                        onClick={() => navigate('/team-list')}
                        className="btn" 
                        style={{ 
                            padding: '16px', fontSize: '16px', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        👥 View Members
                    </button>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ 
                            background: 'none', border: 'none', color: 'var(--text-secondary)', 
                            fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' 
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
