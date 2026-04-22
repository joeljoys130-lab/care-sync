import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

/**
 * ProtectedRoute
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
 *     <Route path="/patient/dashboard" element={<PatientDashboard />} />
 *   </Route>
 *
 * - allowedRoles: optional array. If omitted, any authenticated user passes.
 * - Shows spinner while AuthContext is initialising from localStorage.
 * - Redirects to /login if unauthenticated.
 * - Redirects to / if authenticated but wrong role.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong role — send to their correct home
    const roleHome = {
      admin:   '/admin/dashboard',
      doctor:  '/doctor/dashboard',
      patient: '/patient/dashboard',
    };
    return <Navigate to={roleHome[user.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
