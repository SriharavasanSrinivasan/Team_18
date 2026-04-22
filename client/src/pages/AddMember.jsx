import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTeamMember } from '../services/api';

export default function AddMember() {
    const [formData, setFormData] = useState({
        name: '', age: '', registerNumber: '', className: '', teamName: '', 
        studentEmail: '', personalEmail: '', phoneNumber: '', fatherName: '', photo: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

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
            background: 'var(--bg-primary)', padding: '40px 20px'
        }}>
            <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Add Team Member</h2>
                    <button onClick={() => navigate('/view-team')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-green)' }}>Success!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Member has been added to the team.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Section: Basic Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input required className="form-input" type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Father's Name</label>
                                <input className="form-input" type="text" placeholder="Father's Name" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input required className="form-input" type="number" placeholder="21" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Register No</label>
                                <input required className="form-input" type="text" placeholder="RA22..." value={formData.registerNumber} onChange={e => setFormData({ ...formData, registerNumber: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Class</label>
                                <input required className="form-input" type="text" placeholder="CSE-A" value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} />
                            </div>
                        </div>

                        {/* Section: Contact Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Student Email</label>
                                <input className="form-input" type="email" placeholder="student@srmist.edu.in" value={formData.studentEmail} onChange={e => setFormData({ ...formData, studentEmail: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Personal Email</label>
                                <input className="form-input" type="email" placeholder="personal@gmail.com" value={formData.personalEmail} onChange={e => setFormData({ ...formData, personalEmail: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" type="tel" placeholder="+91 98765 43210" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Team Name</label>
                                <input required className="form-input" type="text" placeholder="Team Alpha" value={formData.teamName} onChange={e => setFormData({ ...formData, teamName: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Profile Photo (Optional)</label>
                            <input className="form-input" type="file" accept="image/*" onChange={e => setFormData({ ...formData, photo: e.target.files[0] })} />
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', borderRadius: '8px', fontSize: '13px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px' }} disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }} /> : 'Add Member'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
