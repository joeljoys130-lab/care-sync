import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAppointment } from '../api/api';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({ doctor: doctorId, appointmentDate: date, timeSlot: time });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Book Appointment</h2>
      <button onClick={() => navigate('/doctors')}>Back to Doctors</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleBook} style={{ marginTop: '20px' }}>
        <div>
          <label>Date: </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Time Slot: </label>
          <input type="text" placeholder="e.g. 10:00 AM" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Confirm Booking</button>
      </form>
    </div>
  );
};

export default BookAppointment;
