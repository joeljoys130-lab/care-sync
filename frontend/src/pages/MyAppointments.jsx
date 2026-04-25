import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../api';

const statusColor = {
  confirmed: '#16a34a',
  pending: '#d97706',
  cancelled: '#dc2626',
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      // If auth error, send them back to login
      if (err.message.toLowerCase().includes('token') || err.message.includes('401')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (raw) => {
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleDateString('en-IN', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return raw;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 My Appointments</h1>
          <p style={styles.subtitle}>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/doctors')} style={styles.btnSecondary}>+ Book New</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.btnDanger}>Logout</button>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div style={styles.emptyState}>Loading appointments…</div>
      ) : appointments.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No appointments yet.</p>
          <button onClick={() => navigate('/doctors')} style={styles.btnPrimary}>Find a Doctor</button>
        </div>
      ) : (
        <div style={styles.list}>
          {appointments.map((appt) => {
            const doctorName = appt.doctorId?.name || appt.doctor?.name || 'Doctor';
            return (
              <div key={appt._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.doctorName}>Dr. {doctorName}</p>
                    <p style={styles.meta}>{formatDate(appt.appointmentDate)} &bull; {appt.timeSlot || '—'}</p>
                  </div>
                  <span style={{ ...styles.badge, background: statusColor[appt.status] || '#64748b' }}>
                    {appt.status || 'unknown'}
                  </span>
                </div>

                {appt.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(appt._id)} style={styles.btnCancel}>
                    Cancel Appointment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: { margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  subtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
  errorBanner: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#94a3b8',
    fontSize: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  doctorName: { margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '16px' },
  meta: { margin: 0, fontSize: '13px', color: '#64748b' },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
    flexShrink: 0,
  },
  btnPrimary: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1.5px solid #0ea5e9',
    background: '#fff',
    color: '#0ea5e9',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1.5px solid #dc2626',
    background: '#fff',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default MyAppointments;
