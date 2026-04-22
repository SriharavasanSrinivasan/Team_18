import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, resetPassword } from '../services/api';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'faculty' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isLogin && !isForgotPassword && !formData.email.endsWith('@srmist.edu.in')) {
            setError('Only @srmist.edu.in email addresses are permitted.'); return;
        }
        setLoading(true);
        try {
            if (isForgotPassword) {
                await resetPassword({ email: formData.email, newPassword: formData.password });
                setSuccessMessage('Password updated! You can now log in.');
                setIsForgotPassword(false); setIsLogin(true); return;
            }
            const res = isLogin
                ? await loginUser({ email: formData.email, password: formData.password })
                : await registerUser(formData);
            const { token, ...userData } = res.data;
            login(userData, token);
            if (userData.role === 'admin') navigate('/admin'); else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
            setSuccessMessage('');
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.09) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(139,92,246,0.07) 0%, transparent 55%), var(--bg-primary)',
            position: 'relative',
        }}>

            {/* ── Centered Login Card ── */}
            <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '420px', padding: '40px 36px', margin: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚌</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>
                        {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        College Bus Tracking System
                    </p>
                </div>

                {successMessage && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && !isForgotPassword && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input required className="form-input" type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Administrator</option>
                                    <option value="driver">Bus Driver</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input required className="form-input" type="email" placeholder="you@srmist.edu.in" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{isForgotPassword ? 'New Password' : 'Password'}</label>
                        <input required className="form-input" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px' }} disabled={loading}>
                        {loading
                            ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                            : (isForgotPassword ? 'Reset Password' : (isLogin ? 'Sign In' : 'Sign Up'))}
                    </button>

                    {isLogin && !isForgotPassword && (
                        <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                            <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                onClick={() => { setIsForgotPassword(true); setError(''); }}>
                                Forgot Password?
                            </span>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {isForgotPassword ? (
                        <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '500' }}
                            onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(''); }}>
                            ← Back to login
                        </span>
                    ) : (
                        <>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '500' }}
                                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}>
                                {isLogin ? 'Register now' : 'Login here'}
                            </span>
                        </>
                    )}
                </div>

                {/* View/Manage Team button inside card */}
                <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--glass-border)' }}>
                    <button 
                        onClick={() => navigate('/view-team')}
                        className="btn" 
                        style={{
                            width: '100%', justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                            border: '1px solid var(--glass-border)', color: 'var(--text-primary)',
                            fontSize: '14px', fontWeight: '600'
                        }}
                    >
                        👥 Manage Team members
                    </button>
                </div>
            </div>
        </div>
    );
}
