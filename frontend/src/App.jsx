import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DoctorList from './pages/DoctorList';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/book/:doctorId" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
