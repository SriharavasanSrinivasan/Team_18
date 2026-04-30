import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import api, { getAdminBuses, getAdminStats, createBus, updateBus, getUsersByRole, deleteUser, getBusStops, createBusStop, updateBusStop, deleteBusStop, registerUser, updateAdminUser, getBusPassengers } from '../services/api';

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
    const [allDrivers, setAllDrivers] = useState([]); // Separate state for drivers dropdown

    // Passenger viewing
    const [activeBusPassengers, setActiveBusPassengers] = useState([]);
    const [showPassengersId, setShowPassengersId] = useState(null); // ID of the bus whose passengers are shown
    const [loadingPassengers, setLoadingPassengers] = useState(false);

    // Stop management form
    const [showStopForm, setShowStopForm] = useState(false);
    const [editingStop, setEditingStop] = useState(null);
    const [stopFormData, setStopFormData] = useState({ name: '', lat: '', lng: '', description: '' });
    const [stopFormErr, setStopFormErr] = useState('');

    // Route management (Assigning stops to buses)
    const [selectedBusForRoute, setSelectedBusForRoute] = useState(null);

    // Bus management form
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [formData, setFormData] = useState({ busId: '', routeName: '', driverName: 'Unknown' });
    const [formErr, setFormErr] = useState('');

    // Add User form (replaces Add Admin)
    const [showUserForm, setShowUserForm] = useState(false);
    const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'driver', boardingStop: '' });
    const [userFormErr, setUserFormErr] = useState('');
    const [userFormSuccess, setUserFormSuccess] = useState('');
    const [adminList, setAdminList] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Track which ID is in "Confirm?" mode
    const [assigningUser, setAssigningUser] = useState(null); // User currently being assigned a bus
    const [tempAssignedBus, setTempAssignedBus] = useState(''); // Tracking selection in UI
    const [tempBoardingStop, setTempBoardingStop] = useState(''); // Tracking boarding stop in UI

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
            
            // Also fetch all drivers for the dropdowns
            const driverRes = await getUsersByRole('driver');
            setAllDrivers(driverRes.data);
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

    const fetchPassengers = async (busId) => {
        if (showPassengersId === busId) {
            setShowPassengersId(null);
            return;
        }
        setLoadingPassengers(true);
        setShowPassengersId(busId);
        try {
            const res = await getBusPassengers(busId);
            setActiveBusPassengers(res.data);
        } catch (err) {
            console.error("Fetch passengers error:", err);
            alert("Failed to load passengers");
        } finally {
            setLoadingPassengers(false);
        }
    };

    const handleUpdateUser = async (id, data, role) => {
        console.log("Updating user:", id, "Data:", data);
        try {
            await updateAdminUser(id, data);
            if (role === 'admin') fetchAdmins();
            else fetchUsers(role);
            setAssigningUser(null);
        } catch (err) {
            console.error("User update failed:", err);
            alert(err.response?.data?.message || 'Failed to update user. Check console for details.');
        }
    };

    const handleDeleteUser = async (id, role) => {
        // Inline confirmation: first click sets confirm state, second click deletes
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            setTimeout(() => setConfirmDeleteId(null), 3000);
            return;
        }
        try {
            await api.delete(`/admin/users/${id}`);
            setConfirmDeleteId(null);
            if (role === 'admin') fetchAdmins();
            else {
                setUsers(prev => prev.filter(u => u._id !== id));
                fetchUsers(role);
            }
        } catch (err) {
            setConfirmDeleteId(null);
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

    const handleUserCreate = async (e) => {
        e.preventDefault();
        setUserFormErr('');
        setUserFormSuccess('');
        
        try {
            await registerUser(userFormData);
            setUserFormSuccess(`${userFormData.role.charAt(0).toUpperCase() + userFormData.role.slice(1)} account created for ${userFormData.email}`);
            setUserFormData({ name: '', email: '', password: '', role: userFormData.role, boardingStop: '' });
            setShowUserForm(false);
            
            // Refresh lists
            if (userFormData.role === 'admin') fetchAdmins();
            else fetchUsers(userFormData.role);
        } catch (err) {
            setUserFormErr(err.response?.data?.message || `Failed to create ${userFormData.role}`);
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
        if (!id) return alert("Error: Invalid Stop ID");
        
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            setTimeout(() => setConfirmDeleteId(null), 3000);
            return;
        }

        try {
            await api.delete(`/admin/stops/${id}`);
            setStops(prev => prev.filter(s => s._id !== id));
            setAllStopsForMap(prev => prev.filter(s => s._id !== id));
            setConfirmDeleteId(null);
            setBuses(prev => prev.map(b => ({
                ...b,
                bus: {
                    ...b.bus,
                    stops: b.bus.stops?.filter(s => (s._id || s) !== id) || []
                }
            })));
            fetchAdminData();
        } catch (err) {
            setConfirmDeleteId(null);
            alert(err.response?.data?.message || 'Failed to delete stop');
        }
    };

    const handleDeleteBus = async (id) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            setTimeout(() => setConfirmDeleteId(null), 3000);
            return;
        }
        
        try {
            await api.delete(`/buses/${id}`);
            setConfirmDeleteId(null);
            fetchAdminData();
        } catch (err) {
            setConfirmDeleteId(null);
            alert(err.response?.data?.message || 'Failed to delete bus');
        }
    };

    const mapLocations = buses.map(b => ({
        busId: b.bus.busId,
        latitude: b.location?.latitude,
        longitude: b.location?.longitude,
        speed: b.speed,
        isDelayed: b.isDelayed,
        timestamp: b.lastUpdated,
    })).filter(l => l.latitude);

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
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                className={`btn ${viewMode === 'routes' ? 'btn-primary' : 'btn-secondary'}`} 
                                onClick={() => setViewMode('routes')}
                            >
                                🗺️ Bus Routes
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
                        {(viewMode === 'admin' || viewMode === 'driver' || viewMode === 'faculty') && (
                            <button className="btn btn-primary" onClick={() => { setShowUserForm(!showUserForm); setUserFormData({ ...userFormData, role: viewMode === 'admin' ? 'admin' : viewMode, boardingStop: '' }); setUserFormErr(''); setUserFormSuccess(''); }}>
                                {showUserForm ? 'Cancel' : `+ Add ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`}
                            </button>
                        )}
                    </div>

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

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
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
                                                    <select required className="form-input" value={formData.driverName} onChange={e => setFormData({ ...formData, driverName: e.target.value })}>
                                                        <option value="Unknown">Select Driver</option>
                                                        {(() => {
                                                            const assignedDriverNames = new Set(
                                                                buses.filter(({ bus }) => bus._id !== editingBus?._id).map(({ bus }) => bus.driverName).filter(name => name && name !== 'Unknown')
                                                            );
                                                            return allDrivers.filter(d => !assignedDriverNames.has(d.name)).map(d => (
                                                                <option key={d._id} value={d.name}>{d.name} ({d.email})</option>
                                                            ));
                                                        })()}
                                                    </select>
                                                </div>
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                                        {editingBus ? 'Update Bus Record' : 'Save Bus Record'}
                                                    </button>
                                                    {editingBus && (
                                                        <button type="button" className="btn btn-secondary" onClick={handleFormCancel}>Cancel Edit</button>
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
                                                {buses.map(({ bus, location, isDelayed }) => (
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
                                                        <td style={{ padding: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleEditClick(bus)}>Edit</button>
                                                            <div style={{ position: 'relative' }}>
                                                                <button 
                                                                    className={`btn ${showPassengersId === bus.busId ? 'btn-primary' : 'btn-secondary'}`}
                                                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                                                    onClick={() => fetchPassengers(bus.busId)}
                                                                >
                                                                    {showPassengersId === bus.busId ? 'Close Passengers' : 'View Passengers'}
                                                                </button>
                                                                {showPassengersId === bus.busId && (
                                                                    <div className="glass-card fade-in-up" style={{ 
                                                                        position: 'absolute', 
                                                                        top: '100%', 
                                                                        right: 0, 
                                                                        width: '250px', 
                                                                        maxHeight: '300px', 
                                                                        overflowY: 'auto', 
                                                                        zIndex: 100, 
                                                                        marginTop: '8px',
                                                                        boxShadow: 'var(--shadow-lg)',
                                                                        padding: '12px'
                                                                    }}>
                                                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '4px' }}>Passengers for {bus.busId}</h4>
                                                                        {loadingPassengers ? (
                                                                            <div style={{ padding: '12px', textAlign: 'center' }}><div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto' }} /></div>
                                                                        ) : activeBusPassengers.length === 0 ? (
                                                                            <div style={{ padding: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>No faculty assigned</div>
                                                                        ) : (
                                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                                {activeBusPassengers.map(p => (
                                                                                    <li key={p._id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                                                                                        <div style={{ fontWeight: '600' }}>{p.name}</div>
                                                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.email}</div>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button 
                                                                className={`btn ${confirmDeleteId === bus._id ? 'btn-primary' : 'btn-secondary'}`}
                                                                style={{ padding: '4px 12px', fontSize: '12px', color: confirmDeleteId === bus._id ? 'white' : 'var(--accent-red)' }}
                                                                onClick={() => handleDeleteBus(bus._id)}
                                                            >
                                                                {confirmDeleteId === bus._id ? 'Confirm?' : 'Delete'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : viewMode === 'stops' ? (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--glass-border)', fontSize: '18px' }}>Bus Stop Management</h3>
                                    {showStopForm && (
                                        <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <form onSubmit={handleStopSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                                                    <label className="form-label">Stop Name</label>
                                                    <input required className="form-input" placeholder="e.g. SRM Main Gate" value={stopFormData.name} onChange={e => setStopFormData({ ...stopFormData, name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Latitude</label>
                                                    <input required className="form-input" type="number" step="any" value={stopFormData.lat} onChange={e => setStopFormData({ ...stopFormData, lat: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Longitude</label>
                                                    <input required className="form-input" type="number" step="any" value={stopFormData.lng} onChange={e => setStopFormData({ ...stopFormData, lng: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                                                    <label className="form-label">Description (Optional)</label>
                                                    <input className="form-input" value={stopFormData.description} onChange={e => setStopFormData({ ...stopFormData, description: e.target.value })} />
                                                </div>
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editingStop ? 'Update Stop' : 'Save Stop'}</button>
                                                    <button type="button" className="btn btn-secondary" onClick={handleStopFormCancel}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
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
                                                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</td>
                                                    <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                                                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleStopEditClick(stop)}>Edit</button>
                                                        <button className={`btn ${confirmDeleteId === stop._id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleDeleteStop(stop._id)}>{confirmDeleteId === stop._id ? 'Confirm?' : 'Delete'}</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : viewMode === 'routes' ? (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--glass-border)', fontSize: '18px' }}>Route Stop Mapping</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                            <tr>
                                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>BUS ID / ROUTE</th>
                                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>CURRENT STOPS</th>
                                                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {buses.map(({ bus }) => (
                                                <tr key={bus._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: '600' }}>{bus.busId}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{bus.routeName}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {(bus.stops || []).map((stop, idx) => (
                                                                <span key={stop._id || idx} className="badge badge-blue" style={{ fontSize: '10px' }}>{stop.name}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setSelectedBusForRoute(bus)}>Manage Stops</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {selectedBusForRoute && (
                                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h3 style={{ margin: 0 }}>Configure {selectedBusForRoute.busId} Route</h3>
                                                    <button onClick={() => setSelectedBusForRoute(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                                                </div>
                                                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                                                    <select className="form-input" onChange={async (e) => {
                                                        if (!e.target.value) return;
                                                        const stopToAdd = allStopsForMap.find(s => s._id === e.target.value);
                                                        const updatedStops = [...(selectedBusForRoute.stops || []), stopToAdd];
                                                        await updateBus(selectedBusForRoute._id, { stops: updatedStops.map(s => s._id) });
                                                        setBuses(buses.map(b => b.bus._id === selectedBusForRoute._id ? { ...b, bus: { ...b.bus, stops: updatedStops } } : b));
                                                        setSelectedBusForRoute({ ...selectedBusForRoute, stops: updatedStops });
                                                    }} value="">
                                                        <option value="">-- Choose a stop to add --</option>
                                                        {allStopsForMap.filter(s => !(selectedBusForRoute.stops || []).some(existing => (existing._id || existing) === s._id)).map(s => (
                                                            <option key={s._id} value={s._id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                                                        {(selectedBusForRoute.stops || []).map((stop, index) => (
                                                            <div key={stop._id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                                                                <span>{index + 1}. {stop.name}</span>
                                                                <button className="btn-secondary" style={{ color: 'var(--accent-red)' }} onClick={async () => {
                                                                    const updatedStops = selectedBusForRoute.stops.filter((_, i) => i !== index);
                                                                    await updateBus(selectedBusForRoute._id, { stops: updatedStops.map(s => s._id) });
                                                                    setBuses(buses.map(b => b.bus._id === selectedBusForRoute._id ? { ...b, bus: { ...b.bus, stops: updatedStops } } : b));
                                                                    setSelectedBusForRoute({ ...selectedBusForRoute, stops: updatedStops });
                                                                }}>Remove</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-primary" onClick={() => setSelectedBusForRoute(null)}>Done</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : viewMode === 'admin' ? (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--glass-border)', fontSize: '18px' }}>👑 Admin Accounts</h3>
                                    {showUserForm && (
                                        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <form onSubmit={handleUserCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group"><label className="form-label">Full Name</label><input required className="form-input" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} /></div>
                                                <div className="form-group"><label className="form-label">Email</label><input required className="form-input" type="email" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} /></div>
                                                <div className="form-group"><label className="form-label">Password</label><input required className="form-input" type="password" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} /></div>
                                                {userFormData.role === 'faculty' && (
                                                    <div className="form-group">
                                                        <label className="form-label">Boarding Stop</label>
                                                        <select required className="form-input" value={userFormData.boardingStop} onChange={e => setUserFormData({ ...userFormData, boardingStop: e.target.value })}>
                                                            <option value="">Select Stop</option>
                                                            {allStopsForMap.map(stop => (
                                                                <option key={stop._id} value={stop.name}>{stop.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                                    <button type="button" className="btn btn-secondary" onClick={() => setShowUserForm(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                            <tr><th style={{ padding: '16px' }}>NAME</th><th style={{ padding: '16px' }}>EMAIL</th><th style={{ padding: '16px' }}>ACTIONS</th></tr>
                                        </thead>
                                        <tbody>
                                            {adminList.map(admin => (
                                                <tr key={admin._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                    <td style={{ padding: '16px' }}>👑 {admin.name}</td>
                                                    <td style={{ padding: '16px' }}>{admin.email}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <button className={`btn ${confirmDeleteId === admin._id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleDeleteUser(admin._id, 'admin')}>{confirmDeleteId === admin._id ? 'Confirm?' : 'Delete'}</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="glass-card" style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{viewMode} Accounts</h3>
                                        <button className="btn btn-primary" onClick={() => { setShowUserForm(!showUserForm); setUserFormData({ ...userFormData, role: viewMode, boardingStop: '' }); }}>{showUserForm ? 'Cancel' : `+ Add ${viewMode}`}</button>
                                    </div>
                                    {showUserForm && (
                                        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <form onSubmit={handleUserCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="form-group"><label className="form-label">Full Name</label><input required className="form-input" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} /></div>
                                                <div className="form-group"><label className="form-label">Email</label><input required className="form-input" type="email" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} /></div>
                                                <div className="form-group"><label className="form-label">Password</label><input required className="form-input" type="password" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} /></div>
                                                {viewMode === 'faculty' && (
                                                    <div className="form-group">
                                                        <label className="form-label">Boarding Stop</label>
                                                        <select required className="form-input" value={userFormData.boardingStop} onChange={e => setUserFormData({ ...userFormData, boardingStop: e.target.value })}>
                                                            <option value="">Select Stop</option>
                                                            {allStopsForMap.map(stop => (
                                                                <option key={stop._id} value={stop.name}>{stop.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <div style={{ gridColumn: '1 / 3', display: 'flex', gap: '12px' }}>
                                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                                    <button type="button" className="btn btn-secondary" onClick={() => setShowUserForm(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                            <tr>
                                                <th style={{ padding: '16px' }}>NAME</th>
                                                <th style={{ padding: '16px' }}>EMAIL</th>
                                                {viewMode === 'faculty' && (
                                                    <>
                                                        <th style={{ padding: '16px' }}>BOARDING STOP</th>
                                                        <th style={{ padding: '16px' }}>ASSIGNED ROUTE</th>
                                                    </>
                                                )}
                                                <th style={{ padding: '16px' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                    <td style={{ padding: '16px', fontWeight: '600' }}>{user.name}</td>
                                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                                                    {viewMode === 'faculty' && (
                                                        <>
                                                            <td style={{ padding: '16px' }}>
                                                                {assigningUser === user._id ? (
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <select className="form-input" style={{ padding: '4px', fontSize: '12px' }} value={tempBoardingStop} onChange={(e) => setTempBoardingStop(e.target.value)}>
                                                                            <option value="">None</option>
                                                                            {allStopsForMap.map(stop => (
                                                                                <option key={stop._id} value={stop.name}>{stop.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ) : (
                                                                    <span className="badge badge-blue">{user.boardingStop || 'Not Set'}</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                {assigningUser === user._id ? (
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <select className="form-input" style={{ padding: '4px', fontSize: '12px' }} value={tempAssignedBus} onChange={(e) => setTempAssignedBus(e.target.value)}>
                                                                            <option value="">None</option>
                                                                            {buses.map(b => <option key={b.bus._id} value={b.bus.busId}>{b.bus.busId}</option>)}
                                                                        </select>
                                                                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleUpdateUser(user._id, { assignedBus: tempAssignedBus, boardingStop: tempBoardingStop }, 'faculty')}>Save</button>
                                                                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setAssigningUser(null)}>X</button>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                                                        <span className="badge badge-blue">{user.assignedBus || 'None'}</span>
                                                                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => { setAssigningUser(user._id); setTempAssignedBus(user.assignedBus || ''); setTempBoardingStop(user.boardingStop || ''); }}>Edit</button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td style={{ padding: '16px' }}>
                                                        <button className={`btn ${confirmDeleteId === user._id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleDeleteUser(user._id, user.role)}>{confirmDeleteId === user._id ? 'Confirm?' : 'Delete'}</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="glass-card fade-in-up" style={{ height: '600px', padding: '0', overflow: 'hidden' }}>
                            <MapView 
                                busLocations={mapLocations} 
                                stops={allStopsForMap} 
                                routeStops={selectedBusForRoute?.stops || []}
                                center={editingStop ? { lat: editingStop.lat, lng: editingStop.lng } : null} 
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
