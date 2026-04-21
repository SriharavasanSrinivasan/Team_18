import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, resetPassword, addTeamMember } from '../services/api';

// ── Avatar helpers ─────────────────────────────────────────────
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
function avatarColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── MemberCard ─────────────────────────────────────────────────
function MemberCard({ member }) {
    const photoUrl = member.photo ? `/uploads/${member.photo}` : null;
    const bg = avatarColor(member.name);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'background 0.2s',
        }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
            <div style={{
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                overflow: 'hidden', border: `2px solid ${bg}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: photoUrl ? '#000' : bg, fontSize: '15px', fontWeight: '700', color: '#fff',
            }}>
                {photoUrl
                    ? <img src={photoUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials(member.name)
                }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{member.registerNumber} · {member.className}</div>
            </div>
            <div style={{
                fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '99px',
                background: `${bg}22`, color: bg, border: `1px solid ${bg}44`, flexShrink: 0,
            }}>Age {member.age}</div>
        </div>
    );
}

// ── TeamSection ────────────────────────────────────────────────
function TeamSection({ teamName, members }) {
    const [open, setOpen] = useState(true);
    const bg = avatarColor(teamName);
    return (
        <div style={{ marginBottom: '12px', borderRadius: '12px', border: `1px solid ${bg}33`, overflow: 'hidden' }}>
            <div onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', cursor: 'pointer',
                background: `linear-gradient(135deg, ${bg}22 0%, rgba(255,255,255,0.03) 100%)`,
                borderBottom: open ? `1px solid ${bg}22` : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '7px', background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '800', color: '#fff',
                    }}>{teamName[0].toUpperCase()}</div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>{teamName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{members.length} member{members.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '16px', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
            </div>
            {open && (
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {members.map(m => <MemberCard key={m._id} member={m} />)}
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────
export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showTeamPanel, setShowTeamPanel] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'faculty' });
    const [teamFormData, setTeamFormData] = useState({ name: '', age: '', registerNumber: '', className: '', teamName: '', photo: null });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [teamGroups, setTeamGroups] = useState({});
    const [teamsLoading, setTeamsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const fetchTeams = async () => {
        try {
            setTeamsLoading(true);
            const res = await fetch('/api/team/all');
            const data = await res.json();
            const grouped = {};
            data.forEach(m => {
                if (!grouped[m.teamName]) grouped[m.teamName] = [];
                grouped[m.teamName].push(m);
            });
            setTeamGroups(grouped);
        } catch { /* silent */ }
        finally { setTeamsLoading(false); }
    };

    useEffect(() => { if (showTeamPanel) fetchTeams(); }, [showTeamPanel]);

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

    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        const data = new FormData();
        data.append('name', teamFormData.name);
        data.append('age', teamFormData.age);
        data.append('registerNumber', teamFormData.registerNumber);
        data.append('className', teamFormData.className);
        data.append('teamName', teamFormData.teamName);
        if (teamFormData.photo) data.append('photo', teamFormData.photo);
        try {
            await addTeamMember(data);
            setSuccessMessage('Team member added!');
            setShowTeamModal(false);
            setTeamFormData({ name: '', age: '', registerNumber: '', className: '', teamName: '', photo: null });
            if (showTeamPanel) fetchTeams();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add team member');
        } finally { setLoading(false); }
    };

    const memberCount = Object.values(teamGroups).reduce((s, a) => s + a.length, 0);
    const teamCount = Object.keys(teamGroups).length;

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

                {/* Add Team Member button inside card */}
                <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--glass-border)' }}>
                    <button className="btn" style={{
                        width: '100%', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12))',
                        border: '1px solid rgba(139,92,246,0.25)', color: 'var(--text-primary)',
                    }} onClick={() => setShowTeamModal(true)}>
                        ➕ Add Team Member
                    </button>
                </div>
            </div>

            {/* ── Bottom-Left FAB: View Teams ── */}
            <button
                onClick={() => setShowTeamPanel(true)}
                style={{
                    position: 'fixed', bottom: '28px', left: '28px', zIndex: 900,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '13px 20px', borderRadius: '50px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#fff', fontWeight: '700', fontSize: '14px',
                    boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.4)'; }}
            >
                Team Members
            </button>

            {/* ── Team Panel (slide-in from left) ── */}
            {showTeamPanel && (
                <>
                    {/* Backdrop */}
                    <div onClick={() => setShowTeamPanel(false)} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)', zIndex: 950,
                    }} />

                    {/* Slide panel */}
                    <div style={{
                        position: 'fixed', top: 0, left: 0, bottom: 0,
                        width: '400px', maxWidth: '90vw', zIndex: 960,
                        background: 'var(--bg-secondary)',
                        borderRight: '1px solid var(--glass-border)',
                        boxShadow: '8px 0 40px rgba(0,0,0,0.4)',
                        display: 'flex', flexDirection: 'column',
                        animation: 'slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}>
                        {/* Panel header */}
                        <div style={{
                            padding: '24px 20px 18px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid var(--glass-border)',
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))',
                        }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Our Team
                                </h2>
                                {!teamsLoading && memberCount > 0 && (
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                        {teamCount} team{teamCount !== 1 ? 's' : ''} · {memberCount} member{memberCount !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowTeamPanel(false)} style={{
                                background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)',
                                color: 'var(--text-secondary)', width: '32px', height: '32px',
                                borderRadius: '8px', cursor: 'pointer', fontSize: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>&times;</button>
                        </div>

                        {/* Panel content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {teamsLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', marginTop: '32px', justifyContent: 'center' }}>
                                    <div className="spinner" style={{ width: '20px', height: '20px' }} />
                                    <span>Loading teams…</span>
                                </div>
                            ) : memberCount === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                                    <div style={{ fontSize: '44px', marginBottom: '14px' }}>👥</div>
                                    <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>No teams yet</div>
                                    <div style={{ fontSize: '13px' }}>Use "Add Team Member" on the login form to get started.</div>
                                </div>
                            ) : (
                                Object.entries(teamGroups).map(([teamName, members]) => (
                                    <TeamSection key={teamName} teamName={teamName} members={members} />
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ── Add Team Member Modal ── */}
            {showTeamModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: '480px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Add Team Member</h3>
                            <button onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input required className="form-input" type="text" placeholder="Member Name" value={teamFormData.name} onChange={e => setTeamFormData({ ...teamFormData, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input required className="form-input" type="number" min="1" placeholder="21" value={teamFormData.age} onChange={e => setTeamFormData({ ...teamFormData, age: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Register Number</label>
                                    <input required className="form-input" type="text" placeholder="RA2211003..." value={teamFormData.registerNumber} onChange={e => setTeamFormData({ ...teamFormData, registerNumber: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Class</label>
                                <input required className="form-input" type="text" placeholder="CSE-A / ECE-B" value={teamFormData.className} onChange={e => setTeamFormData({ ...teamFormData, className: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Team Name</label>
                                <input required className="form-input" type="text" placeholder="Alpha / Beta / Gamma" value={teamFormData.teamName} onChange={e => setTeamFormData({ ...teamFormData, teamName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                                <input type="file" className="form-input" accept="image/*" onChange={e => setTeamFormData({ ...teamFormData, photo: e.target.files[0] })} />
                            </div>
                            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '6px', padding: '12px', justifyContent: 'center', width: '100%' }} disabled={loading}>
                                {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : '✅ Register Team Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* slide-in animation */}
            <style>{`
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to   { transform: translateX(0);     opacity: 1; }
                }
            `}</style>
        </div>
    );
}
