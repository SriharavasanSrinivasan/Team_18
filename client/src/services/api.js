import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

// Auto-attach JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bustrack_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global 401 handler — if the server says "Not Authorized", boot to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect to login if we're NOT already on the login page
        // and the error is a 401 (Unauthorized)
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('bustrack_user');
            localStorage.removeItem('bustrack_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// Buses
export const getBuses = () => api.get('/buses');
export const createBus = (data) => api.post('/buses', data);
export const updateBus = (id, data) => api.put(`/buses/${id}`, data);
export const getMyBus = () => api.get('/buses/my-bus');

// Locations
export const getLatestLocation = (busId) => api.get(`/location/${busId}`);
export const getAllLatestLocations = () => api.get('/location/all/latest');
export const getETA = (busId, stopLat, stopLng) =>
    api.get(`/location/eta/${busId}?stopLat=${stopLat}&stopLng=${stopLng}`);

// Admin
export const getAdminBuses = () => api.get('/admin/buses');
export const getDelays = () => api.get('/admin/delays');
export const getAdminStats = () => api.get('/admin/stats');
export const getUsersByRole = (role) => api.get(`/admin/users/${role}`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Bus Stops
export const getBusStops = () => api.get('/admin/stops');
export const createBusStop = (data) => api.post('/admin/stops', data);
export const updateBusStop = (id, data) => api.put(`/admin/stops/${id}`, data);
export const deleteBusStop = (id) => api.delete(`/admin/stops/${id}`);

// Team
export const addTeamMember = (formData) => api.post('/team/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
