import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointments, cancelAppointment } from '../api/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('token')) navigate('/login');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [navigate]);

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Appointments</h2>
      <button onClick={() => navigate('/doctors')}>Back to Doctors</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {appointments.map((appt) => (
          <li key={appt._id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <p><strong>Date:</strong> {appt.appointmentDate}</p>
            <p><strong>Time:</strong> {appt.timeSlot}</p>
            <p><strong>Status:</strong> {appt.status}</p>
            {appt.status !== 'cancelled' && (
              <button onClick={() => handleCancel(appt._id)} style={{ color: 'red' }}>Cancel Appointment</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyAppointments;
