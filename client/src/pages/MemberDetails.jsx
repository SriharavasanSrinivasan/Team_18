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
                const res = await fetch(`/api/members/${id}`);
                const data = await res.json();
                setMember(data);
            } catch (error) {
                console.error('Failed to fetch member details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
            <div className="spinner" />
        </div>
    );

    if (!member) return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#64748b' }}>
            <h2>Member not found</h2>
            <button onClick={() => navigate('/team-list')} style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px' }}>Back to List</button>
        </div>
    );

    const hobbiesArray = member.hobbies ? member.hobbies.split(',').map(h => h.trim()).filter(h => h !== '') : [];

    return (
        <div style={{
            minHeight: '100vh', padding: '60px 20px', background: '#f3f4f6',
            fontFamily: 'var(--font-family)', color: '#1e293b', display: 'flex', justifyContent: 'center'
        }}>
            <div style={{
                width: '100%', maxWidth: '550px', 
                background: '#ffffff', borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative'
            }} className="fade-in-up">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/team-list')}
                    style={{
                        position: 'absolute', top: '15px', left: '15px', 
                        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)',
                        border: '1px solid #e2e8f0', color: '#64748b', 
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', zIndex: 10
                    }}
                >
                    ← Back
                </button>

                {/* Top Image Section */}
                <div style={{ width: '100%', height: '300px', background: '#f1f5f9' }}>
                    {member.photo ? (
                        <img 
                            src={`/uploads/${member.photo}`} 
                            alt={member.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', color: '#cbd5e1', fontWeight: '800' }}>
                            {member.name[0].toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Profile Header Below Image */}
                <div style={{ padding: '30px 25px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', textTransform: 'lowercase', marginBottom: '4px' }}>
                        {member.name}
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', textTransform: 'lowercase' }}>
                        {member.degree} - {member.year}
                    </p>
                </div>

                {/* Details Section */}
                <div style={{ padding: '20px 25px' }}>
                    <DetailRow label="Roll Number" value={member.rollNumber} />
                    <DetailRow label="Project" value={member.aboutProject} />
                    <DetailRow label="Certificate" value={member.certificate} />
                    <DetailRow label="Internship" value={member.internship} />
                    <DetailRow label="About Your Aim" value={member.aboutYourAim} />

                    {/* Hobbies Section */}
                    <div style={{ marginTop: '25px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>Hobbies:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {hobbiesArray.map((hobby, index) => (
                                <span key={index} style={{
                                    padding: '5px 14px',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    textTransform: 'lowercase'
                                }}>
                                    {hobby}
                                </span>
                            ))}
                            {hobbiesArray.length === 0 && <span style={{ color: '#94a3b8', fontSize: '13px' }}>No hobbies listed.</span>}
                        </div>
                    </div>
                </div>

                {/* Footer Spacer */}
                <div style={{ height: '30px' }} />
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ 
            padding: '14px 0', 
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                {label}:
            </div>
            <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                {value || 'N/A'}
            </div>
        </div>
    );
}
