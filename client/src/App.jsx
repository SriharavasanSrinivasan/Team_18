import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import TeamHub from './pages/TeamHub';
import TeamMembers from './pages/TeamMembers';
import AddMember from './pages/AddMember';
import MemberDetails from './pages/MemberDetails';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  const getLoginRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'driver') return '/driver';
    return '/dashboard';
  };

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={getLoginRedirect()} replace /> : <LoginPage />
      } />
      
      {/* Team Management Routes */}
      <Route path="/view-team" element={<TeamHub />} />
      <Route path="/team-list" element={<TeamMembers />} />
      <Route path="/add-member" element={<AddMember />} />
      <Route path="/team-member/:id" element={<MemberDetails />} />

      <Route path="/dashboard" element={
        <ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/driver" element={
        <ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
