import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/book/:doctorId" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/payment/:appointmentId" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
