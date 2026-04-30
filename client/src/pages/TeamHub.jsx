import { useNavigate } from 'react-router-dom';

export default function TeamHub() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f8fafc', // Light background
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Background elements to match landing page style but in light mode */}
            <div style={{
                position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px',
                background: 'rgba(59,130,246,0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '10%', width: '350px', height: '350px',
                background: 'rgba(139,92,246,0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0
            }} />

            <div className="fade-in-up" style={{
                width: '100%', maxWidth: '500px', padding: '40px 30px', margin: '24px',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                textAlign: 'center', position: 'relative', zIndex: 1
            }}>
                {/* Top Center Icon */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>

                {/* Heading */}
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    TEAM_18
                </h1>

                {/* Subtitle */}
                <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '40px' }}>
                    Welcome to Team Management
                </p>

                {/* Main Section */}
                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        Manage Team
                    </h2>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button 
                            onClick={() => navigate('/add-member')} 
                            style={{ 
                                flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                                backgroundColor: '#3b82f6', color: '#ffffff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s ease', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Add Members
                        </button>
                        
                        <button 
                            onClick={() => navigate('/team-list')}
                            style={{ 
                                flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                                backgroundColor: '#3b82f6', color: '#ffffff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s ease', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            View Members
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ 
                            background: 'none', border: 'none', color: '#94a3b8', 
                            fontSize: '13px', cursor: 'pointer', textDecoration: 'none', fontWeight: '500'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
