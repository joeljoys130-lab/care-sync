import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors } from '../api/api';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('token')) navigate('/login');
      }
    };
    fetchDoctors();
  }, [navigate]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Doctors</h2>
      <button onClick={() => navigate('/appointments')}>My Appointments</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {doctors.map((doc) => (
          <li key={doc._id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <p><strong>Dr. {doc.userId?.name}</strong></p>
            <p>{doc.specialization}</p>
            <p>Fees: ₹{doc.fees}</p>
            <button onClick={() => navigate(`/book/${doc._id}`)}>Book Appointment</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorList;
