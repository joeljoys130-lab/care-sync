import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorList from "./pages/DoctorList";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";

// Placeholder dashboards rendered inline until proper dashboard pages are created
const AdminDashboard = () => (
  <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
    <h1>⚙️ Admin Dashboard</h1>
    <p>Admin panel coming soon. Backend routes are active at <code>/api/admin</code>.</p>
    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
      style={{ marginTop: '20px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
      Logout
    </button>
  </div>
);

const DoctorDashboard = () => (
  <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
    <h1>🩺 Doctor Dashboard</h1>
    <p>Your appointments appear below once the doctor panel is built out.</p>
    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
      style={{ marginTop: '20px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
      Logout
    </button>
  </div>
);

/** Redirects to /login if no token present */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/** After login, route to the correct dashboard based on stored role */
const RoleRedirect = () => {
  const role = localStorage.getItem("role");
  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "doctor") return <Navigate to="/doctor-dashboard" replace />;
  return <Navigate to="/doctors" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public — Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root: redirect based on role, or to login */}
        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <RoleRedirect />
              : <Navigate to="/login" replace />
          }
        />

        {/* Patient routes — protected */}
        <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} />
        <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />

        {/* Role dashboards — protected */}
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/doctor-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;