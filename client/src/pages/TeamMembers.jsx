import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('/api/members');
                const data = await res.json();
                setMembers(data);
            } catch (error) {
                console.error('Failed to fetch members:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const handleViewDetails = (id) => {
        navigate(`/member/${id}`);
    };

    return (
        <div style={{
            minHeight: '100vh', padding: '60px 20px', background: '#f8fafc',
            fontFamily: 'var(--font-family)', color: '#0f172a'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Top Heading */}
                <h1 style={{ 
                    textAlign: 'center', 
                    color: '#2563eb', 
                    fontSize: '24px', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    marginBottom: '60px',
                    marginTop: '20px'
                }}>
                    MEET OUR AMAZING TEAM
                </h1>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '40px',
                        justifyItems: 'center'
                    }}>
                        {members.map(member => (
                            <div key={member._id} style={{ 
                                background: '#ffffff', 
                                width: '100%',
                                maxWidth: '340px',
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Top Image */}
                                <div style={{ 
                                    width: '100%', 
                                    height: '240px', 
                                    background: '#f1f5f9',
                                    overflow: 'hidden'
                                }}>
                                    {member.photo ? (
                                        <img 
                                            src={`/uploads/${member.photo}`} 
                                            alt={member.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: '#cbd5e1', fontWeight: '800' }}>
                                            {member.name[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Card Content Below Image */}
                                <div style={{ padding: '24px', textAlign: 'center' }}>
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: '700', 
                                        color: '#1e293b', 
                                        marginBottom: '6px',
                                        textTransform: 'lowercase' // Based on example "dharani / ajay"
                                    }}>
                                        {member.name}
                                    </h3>
                                    
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: '#64748b', 
                                        marginBottom: '20px',
                                        fontWeight: '500'
                                    }}>
                                        Roll Number: {member.rollNumber}
                                    </div>

                                    {/* Button */}
                                    <button 
                                        onClick={() => handleViewDetails(member._id)}
                                        style={{ 
                                            padding: '8px 24px', 
                                            borderRadius: '50px', 
                                            background: '#2563eb', 
                                            color: '#ffffff', 
                                            fontWeight: '700',
                                            fontSize: '12px', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                                    >
                                        VIEW DETAILS
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <button 
                        onClick={() => navigate('/view-team')}
                        style={{ 
                            background: 'none', border: 'none', color: '#94a3b8', 
                            fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                        }}
                    >
                        ← Back to Team Hub
                    </button>
                </div>
            </div>
            
            <style>{`
                @media (max-width: 1024px) {
                    div[style*="gridTemplateColumns"] {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 640px) {
                    div[style*="gridTemplateColumns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
