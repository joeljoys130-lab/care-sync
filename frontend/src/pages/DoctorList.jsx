import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors } from '../api/api';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        if (err.message.toLowerCase().includes('token') || err.message.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [navigate]);

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🩺 Find Doctors</h1>
          <p style={styles.subtitle}>{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/appointments')} style={styles.btnSecondary}>My Appointments</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.btnDanger}>Logout</button>
        </div>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name or specialization…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {error && <div style={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div style={styles.emptyState}>Loading doctors…</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>No doctors found{search ? ` for "${search}"` : ''}.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((doc) => {
            // Backend's doctorRoutes.js queries User model directly — no nested userId
            const name = doc.name || doc.userId?.name || 'Doctor';
            const spec = doc.specialization || 'General Practice';
            const fees = doc.fees ?? doc.consultationFee ?? '—';

            return (
              <div key={doc._id} style={styles.card}>
                <div style={styles.avatar}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.doctorName}>Dr. {name}</p>
                  <p style={styles.spec}>{spec}</p>
                  <p style={styles.fees}>₹{fees} <span style={styles.feesLabel}>per visit</span></p>
                  <button
                    onClick={() => navigate(`/book/${doc._id}`)}
                    style={styles.bookBtn}
                  >
                    Book Appointment
                  </button>
                </div>
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
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: { margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  subtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
  search: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    marginBottom: '24px',
    outline: 'none',
    boxSizing: 'border-box',
  },
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
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    color: '#fff',
    fontSize: '26px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  cardBody: { width: '100%' },
  doctorName: { margin: '0 0 4px', fontWeight: '700', fontSize: '16px', color: '#1e293b' },
  spec: { margin: '0 0 10px', fontSize: '13px', color: '#64748b' },
  fees: { margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#0ea5e9' },
  feesLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: '400' },
  bookBtn: {
    width: '100%',
    padding: '11px',
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
};

export default DoctorList;
