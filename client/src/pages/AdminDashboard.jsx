import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { getAdminBuses, getAdminStats, createBus, updateBus, getUsersByRole, deleteUser, getBusStops, createBusStop, updateBusStop, deleteBusStop, registerUser } from '../services/api';

export default function AdminDashboard() {
    const [buses, setBuses] = useState([]);
    const [stats, setStats] = useState({ totalBuses: 0, activeCount: 0, delayCount: 0 });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('buses'); // 'buses', 'faculty', 'driver', 'stops'
    const [users, setUsers] = useState([]);
    const [stops, setStops] = useState([]);
    const [allStopsForMap, setAllStopsForMap] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingStops, setLoadingStops] = useState(false);

    // Stop management form
    const [showStopForm, setShowStopForm] = useState(false);
    const [editingStop, setEditingStop] = useState(null);
    const [stopFormData, setStopFormData] = useState({ name: '', lat: '', lng: '', description: '' });
    const [stopFormErr, setStopFormErr] = useState('');

    // Bus management form
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [formData, setFormData] = useState({ busId: '', routeName: '', driverName: 'Unknown' });
    const [formErr, setFormErr] = useState('');

    // Add Admin form
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '' });
    const [adminFormErr, setAdminFormErr] = useState('');
    const [adminFormSuccess, setAdminFormSuccess] = useState('');
    const [adminList, setAdminList] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const fetchAdminData = async () => {
        try {
            const [busRes, statsRes, stopsRes] = await Promise.all([
                getAdminBuses(),
                getAdminStats(),
                getBusStops(),
            ]);
            setBuses(busRes.data);
            setStats(statsRes.data);
            setAllStopsForMap(stopsRes.data);
        } catch (err) {
            console.error("Admin dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (role) => {
        setLoadingUsers(true);
        try {
            const res = await getUsersByRole(role);
            setUsers(res.data);
            setViewMode(role);
        } catch (err) {
            console.error(`Fetch ${role} error:`, err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchStops = async () => {
        setLoadingStops(true);
        try {
            const res = await getBusStops();
            setStops(res.data);
            setViewMode('stops');
        } catch (err) {
            console.error("Fetch stops error:", err);
        } finally {
            setLoadingStops(false);
        }
    };

    const handleDeleteUser = async (id, role) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await deleteUser(id);
            if (role === 'admin') fetchAdmins();
            else fetchUsers(role);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const res = await getUsersByRole('admin');
            setAdminList(res.data);
        } catch (err) {
            console.error('Fetch admins error:', err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleAdminCreate = async (e) => {
        e.preventDefault();
        setAdminFormErr('');
        setAdminFormSuccess('');
        if (!adminFormData.email.endsWith('@srmist.edu.in')) {
            setAdminFormErr('Email must end with @srmist.edu.in');
            return;
        }
        try {
            await registerUser({ ...adminFormData, role: 'admin' });
            setAdminFormSuccess(`Admin account created for ${adminFormData.email}`);
            setAdminFormData({ name: '', email: '', password: '' });
            setShowAdminForm(false);
            fetchAdmins();
        } catch (err) {
            setAdminFormErr(err.response?.data?.message || 'Failed to create admin');
        }
    };

    useEffect(() => {
        fetchAdminData();
        fetchAdmins();
        const interval = setInterval(fetchAdminData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleEditClick = (busData) => {
        setEditingBus(busData);
        setFormData({
            busId: busData.busId,
            routeName: busData.routeName,
            driverName: busData.driverName || 'Unknown'
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFormCancel = () => {
        setShowAddForm(false);
        setEditingBus(null);
        setFormData({ busId: '', routeName: '', driverName: 'Unknown' });
        setFormErr('');
    };

    const handleBusSubmit = async (e) => {
        e.preventDefault();
        setFormErr('');
        try {
            if (editingBus) {
                await updateBus(editingBus._id, formData);
            } else {
                await createBus(formData);
            }
            handleFormCancel();
            fetchAdminData(); // Refresh list
        } catch (err) {
            setFormErr(err.response?.data?.message || `Failed to ${editingBus ? 'update' : 'add'} bus`);
        }
    };

    const handleStopEditClick = (stop) => {
        setEditingStop(stop);
        setStopFormData({
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            description: stop.description || ''
        });
        setShowStopForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStopFormCancel = () => {
        setShowStopForm(false);
        setEditingStop(null);
        setStopFormData({ name: '', lat: '', lng: '', description: '' });
        setStopFormErr('');
    };

    const handleStopSubmit = async (e) => {
        e.preventDefault();
        setStopFormErr('');
        try {
            if (editingStop) {
                await updateBusStop(editingStop._id, stopFormData);
            } else {
                await createBusStop(stopFormData);
            }
            handleStopFormCancel();
            await fetchStops();
            // Also refresh global map stops
            const res = await getBusStops();
            setAllStopsForMap(res.data);
        } catch (err) {
            setStopFormErr(err.response?.data?.message || `Failed to ${editingStop ? 'update' : 'add'} stop`);
        }
    };

    const handleDeleteStop = async (id) => {
        if (!window.confirm("Delete this bus stop? This may affect ETA calculations.")) return;
        try {
            await deleteBusStop(id);
            await fetchStops();
            const res = await getBusStops();
            setAllStopsForMap(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete stop');
        }
    };

    const mapLocations = buses.map(b => ({
        busId: b.bus.busId,
        latitude: b.location?.latitude,
        longitude: b.location?.longitude,
        speed: b.speed,
        isDelayed: b.isDelayed,
        timestamp: b.lastUpdated,
    })).filter(l => l.latitude); // Only map buses that have a location

    const allStops = buses.reduce((acc, b) => {
        if (b.bus && b.bus.stops) {
            return [...acc, ...b.bus.stops];
        }
        return acc;
    }, []);

    return (
        <div className="page-layout">
            <Navbar />

            {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </div>
            ) : (
                <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', marginRight: '24px' }}>Admin Control Center</h2>
                            <button 
                                className={`btn ${viewMode === 'buses' ? 'btn-primary' : 'btn-secondary'}`} 
                                onClick={() => setViewMode('buses')}
                            >
                                Fleet Overview
                            </button>
                            <button 
                                className={`btn ${viewMode === 'faculty' ? 'btn-primary' : 'btn-secondary'}`} 
                                onClick={() => fetchUsers('faculty')}
                            >
                                Faculty List
                            </button>
                            <button 
                                className={`btn ${viewMode === 'driver' ? 'btn-primary' : 'btn-secondary'}`} 
                                onClick={() => fetchUsers('driver')}
                            >
                                Driver List
                            </button>
                            <button 
                                className={`btn ${viewMode === 'stops' ? 'btn-primary' : 'btn-secondary'}`} 
                                onClick={() => fetchStops()}
                            >
                                Bus Stops
                            </button>
                            <button 
                                className={`btn ${viewMode === 'admin' ? 'btn-primary' : 'btn-secondary'}`} 
                                onClick={() => { setViewMode('admin'); fetchAdmins(); }}
                            >
                                👑 Admin Accounts
                            </button>
                        </div>
                        {viewMode === 'buses' && (
                            <button className="btn btn-primary" onClick={() => editingBus ? handleFormCancel() : setShowAddForm(!showAddForm)}>
                                {showAddForm ? 'Cancel Operation' : '+ Register New Bus'}
                            </button>
                        )}
                        {viewMode === 'stops' && (
                            <button className="btn btn-primary" onClick={() => editingStop ? handleStopFormCancel() : setShowStopForm(!showStopForm)}>
                                {showStopForm ? 'Cancel Operation' : '+ Add New Stop'}
                            </button>
                        )}
                        {viewMode === 'admin' && (
                            <button className="btn btn-primary" onClick={() => { setShowAdminForm(!showAdminForm); setAdminFormErr(''); setAdminFormSuccess(''); }}>
                                {showAdminForm ? 'Cancel' : '+ Add Admin'}
                            </button>
                        )}
                    </div>

                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div className="glass-card stat-card border-left-blue" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                            <span className="stat-label">Total Registered</span>
                            <span className="stat-value">{stats.totalBuses}</span>
                        </div>
                        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                            <span className="stat-label">Active / Live</span>
                            <span className="stat-value">{stats.activeCount}</span>
                        </div>
                        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--accent-red)' }}>
                            <span className="stat-label">Critical Delays</span>
                            <span className="stat-value" style={{ color: stats.delayCount > 0 ? 'var(--accent-red)' : 'inherit' }}>
                                {stats.delayCount}
                            </span>
                        </div>
                        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
                            <span className="stat-label">Total Location Logs</span>
                            <span className="stat-value">{stats.totalLocations}</span>
                        </div>
                    </div>

                    {/* Main Layout: Table + Map */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>

                        {/* Left: Operations Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {viewMode === 'buses' ? (
                                <>
                                    {showAddForm && (
                                        <div className="glass-card fade-in-up" style={{ padding: '24px' }}>
                                            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
                                                {editingBus ? `Edit Bus: ${editingBus.busId}` : 'Register New Bus'}
                                            </h3>
                                            {formErr && <div style={{ color: 'var(--accent-red)', marginBottom: '12px', fontSize: '13px' }}>{formErr}</div>}
                                            <form onSubmit={handleBusSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Bus Plate / ID</label>
                                                    <input required className="form-input" placeholder="e.g. KA-01-1234" value={formData.busId} onChange={e => setFormData({ ...formData, busId: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Route Designation</label>
                                                    <input required className="form-input" placeholder="e.g. Route A" value={formData.routeName} onChange={e => setFormData({ ...formData, routeName: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                                                    <label className="form-label">Driver Name</label>
                                                    <input required className="form-input" placeholder="Name" value={formData.driverName} onChange={e => setFormData({ ...formData, driverName: e.target.value })} />
                                                </div>
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                                        {editingBus ? 'Update Bus Record' : 'Save Bus Record'}
                                                    </button>
                                                    {editingBus && (
                                                        <button type="button" className="btn btn-secondary" onClick={handleFormCancel}>
                                                            Cancel Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>BUS ID</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>ROUTE</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>SPEED</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>STATUS</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {buses.map(({ bus, location, isDelayed, lastUpdated }) => (
                                                    <tr key={bus.busId} style={{ borderBottom: '1px solid var(--glass-border)', background: editingBus?._id === bus._id ? 'rgba(56, 139, 253, 0.1)' : 'transparent' }}>
                                                        <td style={{ padding: '16px', fontWeight: '600' }}>{bus.busId}</td>
                                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{bus.routeName}</td>
                                                        <td style={{ padding: '16px', fontFamily: 'monospace' }}>
                                                            {location ? `${location.speed} km/h` : '--'}
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <span className={`badge ${!location ? 'badge-amber' : isDelayed ? 'badge-red' : 'badge-green'}`}>
                                                                {!location ? 'Offline' : isDelayed ? 'Delayed' : 'En Route'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <button 
                                                                className="btn btn-secondary" 
                                                                style={{ padding: '4px 12px', fontSize: '12px' }}
                                                                onClick={() => handleEditClick(bus)}
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {buses.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                            No buses registered in the fleet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : viewMode === 'stops' ? (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--glass-border)', fontSize: '18px' }}>
                                        Bus Stop Management
                                    </h3>

                                    {showStopForm && (
                                        <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <form onSubmit={handleStopSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                                                    <label className="form-label">Stop Name</label>
                                                    <input required className="form-input" placeholder="e.g. SRM Main Gate" value={stopFormData.name} onChange={e => setStopFormData({ ...stopFormData, name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Latitude</label>
                                                    <input required className="form-input" type="number" step="any" placeholder="12.823..." value={stopFormData.lat} onChange={e => setStopFormData({ ...stopFormData, lat: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Longitude</label>
                                                    <input required className="form-input" type="number" step="any" placeholder="80.042..." value={stopFormData.lng} onChange={e => setStopFormData({ ...stopFormData, lng: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                                                    <label className="form-label">Description (Optional)</label>
                                                    <input className="form-input" placeholder="Nearby landmark..." value={stopFormData.description} onChange={e => setStopFormData({ ...stopFormData, description: e.target.value })} />
                                                </div>
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                                        {editingStop ? 'Update Stop' : 'Save Stop'}
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={handleStopFormCancel}>Cancel</button>
                                                </div>
                                            </form>
                                            {stopFormErr && <div style={{ color: 'var(--accent-red)', marginTop: '8px', fontSize: '13px' }}>{stopFormErr}</div>}
                                        </div>
                                    )}

                                    {loadingStops ? (
                                        <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>STOP NAME</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>COORDINATES</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stops.map((stop) => (
                                                    <tr key={stop._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                        <td style={{ padding: '16px', fontWeight: '600' }}>{stop.name}</td>
                                                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                                            {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                                        </td>
                                                        <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                                                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleStopEditClick(stop)}>Edit</button>
                                                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--accent-red)' }} onClick={() => handleDeleteStop(stop._id)}>Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ) : viewMode === 'admin' ? (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--glass-border)', fontSize: '18px' }}>
                                        👑 Admin Accounts
                                    </h3>

                                    {/* Success message */}
                                    {adminFormSuccess && (
                                        <div style={{ margin: '12px 16px', padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                                            ✅ {adminFormSuccess}
                                        </div>
                                    )}

                                    {/* Add Admin Form */}
                                    {showAdminForm && (
                                        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <form onSubmit={handleAdminCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Full Name</label>
                                                    <input required className="form-input" type="text" placeholder="Admin Name"
                                                        value={adminFormData.name} onChange={e => setAdminFormData({ ...adminFormData, name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Email <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(@srmist.edu.in only)</span></label>
                                                    <input required className="form-input" type="email" placeholder="admin@srmist.edu.in"
                                                        value={adminFormData.email} onChange={e => setAdminFormData({ ...adminFormData, email: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                                                    <label className="form-label">Password</label>
                                                    <input required className="form-input" type="password" placeholder="Minimum 6 characters" minLength={6}
                                                        value={adminFormData.password} onChange={e => setAdminFormData({ ...adminFormData, password: e.target.value })} />
                                                </div>
                                                {adminFormErr && (
                                                    <div style={{ gridColumn: '1 / 3', color: 'var(--accent-red)', fontSize: '13px' }}>{adminFormErr}</div>
                                                )}
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                                        Create Admin Account
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowAdminForm(false); setAdminFormErr(''); }}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Admin List Table */}
                                    {loadingAdmins ? (
                                        <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>NAME</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>EMAIL</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminList.map((admin) => (
                                                    <tr key={admin._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                        <td style={{ padding: '16px', fontWeight: '600' }}>
                                                            <span style={{ marginRight: '6px' }}>👑</span>{admin.name}
                                                        </td>
                                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{admin.email}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--accent-red)' }}
                                                                onClick={() => handleDeleteUser(admin._id, 'admin')}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {adminList.length === 0 && (
                                                    <tr>
                                                        <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                            No admin accounts found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ) : (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--glass-border)', fontSize: '18px', textTransform: 'capitalize' }}>
                                        {viewMode} Accounts
                                    </h3>
                                    {loadingUsers ? (
                                        <div style={{ padding: '40px', textAlign: 'center' }}>
                                            <div className="spinner" style={{ margin: '0 auto' }} />
                                        </div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>NAME</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>EMAIL</th>
                                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                        <td style={{ padding: '16px', fontWeight: '600' }}>{user.name}</td>
                                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            <button 
                                                                className="btn btn-secondary" 
                                                                style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--accent-red)' }}
                                                                onClick={() => handleDeleteUser(user._id, user.role)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && (
                                                    <tr>
                                                        <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                            No {viewMode} accounts found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: Overview Map */}
                        <div className="glass-card fade-in-up" style={{ height: '600px', padding: '0', overflow: 'hidden' }}>
                            {/* Force map to unmount/remount clean inside simple grid layouts */}
                            <MapView 
                                busLocations={mapLocations} 
                                stops={allStopsForMap} 
                                center={editingStop ? { lat: editingStop.lat, lng: editingStop.lng } : null} 
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
