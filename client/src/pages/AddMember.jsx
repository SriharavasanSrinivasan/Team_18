import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTeamMember } from '../services/api';

export default function AddMember() {
    const [formData, setFormData] = useState({
        name: '', rollNumber: '', year: '', degree: '', 
        aboutProject: '', hobbies: '', certificate: '', 
        internship: '', aboutYourAim: '', photo: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'photo') {
                if (formData.photo) data.append('photo', formData.photo);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            await addTeamMember(data);
            setSuccess(true);
            setTimeout(() => navigate('/team-list'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add team member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f3f4f6', // Light gray background
            padding: '20px',
            fontFamily: 'var(--font-family)'
        }}>
            <div style={{ 
                width: '100%', maxWidth: '380px',
                background: '#ffffff',
                padding: '30px 25px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                textAlign: 'center'
            }} className="fade-in-up">
                
                <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#2563eb', 
                    marginTop: '0',
                    marginBottom: '20px' 
                }}>
                    Add Team Member
                </h2>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>Success!</h3>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>Member added.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        
                        <input required style={inputStyle} type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input required style={inputStyle} type="text" placeholder="Roll Number" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} />
                        <input required style={inputStyle} type="text" placeholder="Year" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                        <input required style={inputStyle} type="text" placeholder="Degree" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} />
                        
                        <textarea required style={{ ...inputStyle, minHeight: '50px', height: '50px', resize: 'none' }} placeholder="About Project" value={formData.aboutProject} onChange={e => setFormData({ ...formData, aboutProject: e.target.value })} />
                        
                        <input required style={inputStyle} type="text" placeholder="Hobbies (comma separated)" value={formData.hobbies} onChange={e => setFormData({ ...formData, hobbies: e.target.value })} />
                        <input required style={inputStyle} type="text" placeholder="Certificate" value={formData.certificate} onChange={e => setFormData({ ...formData, certificate: e.target.value })} />
                        <input required style={inputStyle} type="text" placeholder="Internship" value={formData.internship} onChange={e => setFormData({ ...formData, internship: e.target.value })} />
                        
                        <textarea required style={{ ...inputStyle, minHeight: '50px', height: '50px', resize: 'none' }} placeholder="About Your Aim" value={formData.aboutYourAim} onChange={e => setFormData({ ...formData, aboutYourAim: e.target.value })} />

                        {/* Custom File Upload */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    padding: '5px 12px',
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                Browse...
                            </button>
                            <span style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {formData.photo ? formData.photo.name : 'No file selected.'}
                            </span>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                style={{ display: 'none' }} 
                                onChange={e => setFormData({ ...formData, photo: e.target.files[0] })} 
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '4px', fontSize: '12px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" style={{ 
                            width: '100%', 
                            padding: '10px', 
                            background: '#2563eb', 
                            color: '#ffffff', 
                            fontWeight: '600', 
                            fontSize: '14px', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginTop: '8px',
                            transition: 'background 0.2s'
                        }} disabled={loading}
                        onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                        >
                            {loading ? 'PROCESSING...' : 'SUBMIT'}
                        </button>

                        <button type="button" onClick={() => navigate('/view-team')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', marginTop: '2px', textAlign: 'center' }}>
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s'
};
