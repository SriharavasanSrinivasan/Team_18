import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MemberDetails() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await fetch(`/api/team/all`);
                const data = await res.json();
                const found = data.find(m => m._id === id);
                setMember(found);
            } catch (error) {
                console.error('Failed to fetch member details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
            <div className="spinner" />
        </div>
    );

    if (!member) return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
            <h2>Member not found</h2>
            <button onClick={() => navigate('/team-list')} className="btn btn-secondary" style={{ marginTop: '20px' }}>Back to List</button>
        </div>
    );

    const joinedDate = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : 'N/A';

    return (
        <div style={{
            minHeight: '100vh', padding: '60px 20px', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', display: 'flex', justifyContent: 'center'
        }}>
            <div className="glass-card fade-in-up" style={{
                width: '100%', maxWidth: '800px', padding: '50px', position: 'relative'
            }}>
                <button 
                    onClick={() => navigate('/team-list')}
                    style={{
                        position: 'absolute', top: '30px', left: '30px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', 
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', zIndex: 10
                    }}
                >
                    ← Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
                    <div style={{
                        width: '150px', height: '150px', borderRadius: '50%',
                        overflow: 'hidden', margin: '0 auto 25px', border: '4px solid #3b82f6',
                        background: '#3b82f622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', fontWeight: '800'
                    }}>
                        {member.photo ? (
                            <img src={`/uploads/${member.photo}`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            member.name[0]
                        )}
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{member.name}</h1>
                    <div style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '99px',
                        background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '14px',
                        fontWeight: '700', marginTop: '12px'
                    }}>
                        {member.teamName}
                    </div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '20px' 
                }}>
                    <DetailItem label="Full Name" value={member.name} icon="👤" />
                    <DetailItem label="Father's Name" value={member.fatherName} icon="👨‍👦" />
                    <DetailItem label="Register Number" value={member.registerNumber} icon="🆔" />
                    <DetailItem label="Age" value={member.age} icon="📅" />
                    <DetailItem label="Class / Section" value={member.className} icon="🏫" />
                    <DetailItem label="Phone Number" value={member.phoneNumber} icon="📞" />
                    <DetailItem label="Student Email" value={member.studentEmail} icon="📧" />
                    <DetailItem label="Personal Email" value={member.personalEmail} icon="✉️" />
                    <DetailItem label="Joined Date" value={joinedDate} icon="🎉" />
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        Internal ID: {member._id}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon }) {
    const displayValue = value && value !== '' ? value : 'Not provided';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
            background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)',
            transition: 'transform 0.2s'
        }}>
            <div style={{ fontSize: '24px', opacity: 0.8 }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ 
                    fontWeight: '600', fontSize: '15px', marginTop: '2px', 
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: value ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                    {displayValue}
                </div>
            </div>
        </div>
    );
}
