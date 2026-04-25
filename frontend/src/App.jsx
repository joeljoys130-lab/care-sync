import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

/* ── Layout & Guards ── */
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute  from './components/ProtectedRoute';

/* ── Public pages ── */
import Login    from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

/* ── Patient pages ── */
import PatientDashboard from './pages/patient/Dashboard';
import DoctorList       from './pages/patient/DoctorList';
import DoctorDetail     from './pages/patient/DoctorDetail';
import BookAppointment  from './pages/patient/BookAppointment';
import MyAppointments   from './pages/patient/MyAppointments';
import MedicalRecords   from './pages/patient/MedicalRecords';
import Favorites        from './pages/patient/Favorites';
import PatientProfile   from './pages/patient/Profile';
import Notifications    from './pages/patient/Notifications';
import Payment          from './pages/patient/Payment';
import PaymentHistory   from './pages/patient/PaymentHistory';

/* ── Placeholder dashboard pages (to be replaced when Adithya + Kavish finish) ── */
const AdminDashboard = () => (
  <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
    <h1>⚙️ Admin Dashboard</h1>
    <p style={{ color: '#64748b' }}>Adithya is building this — backend APIs are ready at <code>/api/admin</code>.</p>
  </div>
);

const DoctorDashboard = () => (
  <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
    <h1>🩺 Doctor Dashboard</h1>
    <p style={{ color: '#64748b' }}>Doctor portal coming soon.</p>
  </div>
);

/** Root redirect — send users to their correct home based on role */
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
  if (user.role === 'doctor')  return <Navigate to="/doctor/dashboard"  replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Root redirect ─────────────────────────────── */}
      <Route path="/" element={<RoleRedirect />} />

      {/* ── Public ────────────────────────────────────── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* ── Patient (protected) ───────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route element={<DashboardLayout role="patient" />}>
          <Route path="/patient/dashboard"    element={<PatientDashboard />} />
          <Route path="/patient/doctors"      element={<DoctorList />} />
          <Route path="/patient/doctors/:id"  element={<DoctorDetail />} />
          <Route path="/patient/book/:doctorId" element={<BookAppointment />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/records"      element={<MedicalRecords />} />
          <Route path="/patient/favorites"    element={<Favorites />} />
          <Route path="/patient/profile"      element={<PatientProfile />} />
          <Route path="/patient/notifications" element={<Notifications />} />
          <Route path="/patient/payment/:appointmentId" element={<Payment />} />
          <Route path="/patient/payment-history" element={<PaymentHistory />} />
        </Route>
      </Route>

      {/* ── Admin (protected) ─────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* ── Doctor (protected) ────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route element={<DashboardLayout role="doctor" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>
      </Route>

      {/* ── Legacy redirects (in case old links exist) ── */}
      <Route path="/doctors"          element={<Navigate to="/patient/doctors"      replace />} />
      <Route path="/appointments"     element={<Navigate to="/patient/appointments" replace />} />
      <Route path="/admin-dashboard"  element={<Navigate to="/admin/dashboard"      replace />} />
      <Route path="/doctor-dashboard" element={<Navigate to="/doctor/dashboard"     replace />} />

      {/* ── 404 ───────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;