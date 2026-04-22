import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('/api/team/all');
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
        navigate(`/team-member/${id}`);
    };

    return (
        <div style={{
            minHeight: '100vh', padding: '40px 20px', background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Team Members</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Currently showing {members.length} members
                        </p>
                    </div>
                    <button onClick={() => navigate('/view-team')} className="btn btn-secondary">
                        ← Back to Hub
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {members.map(member => (
                            <div key={member._id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%',
                                        overflow: 'hidden', background: '#3b82f622', border: '2px solid #3b82f644',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700'
                                    }}>
                                        {member.photo ? (
                                            <img src={`/uploads/${member.photo}`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            member.name[0]
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '18px' }}>{member.name}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.teamName}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleViewDetails(member._id)}
                                    className="btn btn-primary" 
                                    style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
