import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--glass-border)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            transition: 'var(--theme-transition)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '18px'
                }}>
                    🚌
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>
                    BusTrack
                </h1>
                {user && (
                    <span className={`badge ${user.role === 'admin' ? 'badge-amber' : 'badge-blue'}`} style={{ marginLeft: '12px' }}>
                        {user.role}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button 
                  onClick={toggleTheme}
                  className="btn btn-secondary"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    padding: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {user && (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</span>
                        </div>
                        <button className="btn btn-secondary" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
