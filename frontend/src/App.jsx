<<<<<<< HEAD
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth & Public
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Landing from './pages/Landing';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import DoctorList from './pages/patient/DoctorList';
import DoctorDetail from './pages/patient/DoctorDetail';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import Favorites from './pages/patient/Favorites';
import PatientProfile from './pages/patient/Profile';
import Notifications from './pages/patient/Notifications';
import Payment from './pages/patient/Payment';
import PaymentHistory from './pages/patient/PaymentHistory';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
=======
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DoctorList from './pages/DoctorList';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
>>>>>>> 351661ddff1e8fa1896cf371a04f4a7b529a5ff3


function App() {
  return (
<<<<<<< HEAD
    <Routes>
      {/* ─── Public ──────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ─── Patient Routes ──────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route element={<DashboardLayout role="patient" />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/doctors" element={<DoctorList />} />
          <Route path="/patient/doctors/:id" element={<DoctorDetail />} />
          <Route path="/patient/book/:doctorId" element={<BookAppointment />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/records" element={<MedicalRecords />} />
          <Route path="/patient/favorites" element={<Favorites />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/notifications" element={<Notifications />} />
          <Route path="/patient/payment" element={<Payment />} />
          <Route path="/patient/payment/history" element={<PaymentHistory />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
=======
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/book/:doctorId" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />
      </Routes>
    </BrowserRouter>
>>>>>>> 351661ddff1e8fa1896cf371a04f4a7b529a5ff3
  );
}

export default App;
