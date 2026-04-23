/**
 * src/api/index.js
 *
 * Centralised Axios client — every page in the team imports from here:
 *   import { patientAPI, appointmentAPI, doctorAPI, ... } from '../../api';
 *
 * The interceptors automatically:
 *   • attach the Bearer token to every request
 *   • redirect to /login on 401 responses
 */
import axios from 'axios';

/* ── Base instance ──────────────────────────────────────────── */
const api = axios.create({
  baseURL: '/api',          // proxied to http://localhost:5000 by vite.config.js
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: inject token ─────────────────────── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Response interceptor: global 401 handler ──────────────── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

/* ═══════════════════════════════════════════════════════════════
   AUTH API
═══════════════════════════════════════════════════════════════ */
export const authAPI = {
  login:       (data)  => api.post('/auth/login', data),
  register:    (data)  => api.post('/auth/register', data),
  sendOtp:     (data)  => api.post('/auth/send-otp', data),
  verifyOtp:   (data)  => api.post('/auth/verify-otp', data),
};

/* ═══════════════════════════════════════════════════════════════
   USER / PROFILE API  (used by Profile.jsx)
═══════════════════════════════════════════════════════════════ */
export const userAPI = {
  getProfile:   ()       => api.get('/patients/profile'),
  updateProfile: (data)  => api.put('/patients/profile', data),
  uploadAvatar:  (form)  => api.post('/patients/profile/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.post('/auth/change-password', data),
};

/* ═══════════════════════════════════════════════════════════════
   PATIENT API  (used by Dashboard.jsx, DoctorList.jsx, etc.)
═══════════════════════════════════════════════════════════════ */
export const patientAPI = {
  getProfile:      ()       => api.get('/patients/profile'),
  updateProfile:   (data)   => api.put('/patients/profile', data),
  getAppointments: (params) => api.get('/patients/appointments', { params }),
  getFavorites:    ()       => api.get('/patients/favorites'),
  toggleFavorite:  (docId)  => api.post(`/patients/favorites/${docId}`),
};

/* ═══════════════════════════════════════════════════════════════
   APPOINTMENT API  (used by BookAppointment.jsx, MyAppointments.jsx)
═══════════════════════════════════════════════════════════════ */
export const appointmentAPI = {
  book:   (data)          => api.post('/appointments', data),
  getAll: (params)        => api.get('/appointments', { params }),
  cancel: (id, data)      => api.delete(`/appointments/${id}`, { data }),
  getById:(id)            => api.get(`/appointments/${id}`),
};

/* ═══════════════════════════════════════════════════════════════
   DOCTOR API  (used by DoctorList.jsx, BookAppointment.jsx)
═══════════════════════════════════════════════════════════════ */
export const doctorAPI = {
  getDoctors:     (params) => api.get('/doctors', { params }),
  getDoctorById:  (id)     => api.get(`/doctors/${id}`),
  getAvailableSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  getMyAppointments: (params) => api.get('/doctors/me/appointments', { params }),
  updateMyAppointment: (id, data) => api.patch(`/doctors/me/appointments/${id}`, data),
  getEarnings: () => api.get('/doctors/me/earnings'),
};

/* ═══════════════════════════════════════════════════════════════
   PAYMENT API  (used by Jaishal's Payment.jsx + BookAppointment.jsx)
═══════════════════════════════════════════════════════════════ */
export const paymentAPI = {
  create:              (data) => api.post('/payments/create', data),
  getHistory:          ()     => api.get('/payments/history'),
  createRazorpayOrder: (data) => api.post('/payments/razorpay/order', data),
  confirm:             (data) => api.post('/payments/razorpay/confirm', data),
};

/* ═══════════════════════════════════════════════════════════════
   MEDICAL RECORDS API  (used by MedicalRecords.jsx)
═══════════════════════════════════════════════════════════════ */
export const recordAPI = {
  getAll:  (params) => api.get('/records', { params }),
  getById: (id)     => api.get(`/records/${id}`),
};

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION API  (used by Dashboard.jsx, Notifications.jsx)
   — stub until backend is built, returns empty gracefully
═══════════════════════════════════════════════════════════════ */
export const notificationAPI = {
  getAll:   (params) => api.get('/notifications', { params })
    .catch(() => ({ data: { data: { notifications: [], unreadCount: 0 } } })),
  markRead: (id)     => api.patch(`/notifications/${id}/read`)
    .catch(() => ({})),
  markAllRead: ()    => api.patch('/notifications/read-all')
    .catch(() => ({})),
};

/* ═══════════════════════════════════════════════════════════════
   REVIEW API
═══════════════════════════════════════════════════════════════ */
export const reviewAPI = {
  getDoctorReviews: (id, params) => api.get(`/doctors/${id}/reviews`, { params })
    .catch(() => ({ data: { data: { reviews: [] } } })),
  getDoctorReviewsAlt: (doctorId, params) => api.get(`/reviews/doctor/${doctorId}`, { params }),
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN API  (used by Adithya's admin dashboard)
═══════════════════════════════════════════════════════════════ */
export const adminAPI = {
  getAnalytics:      ()           => api.get('/admin/analytics'),
  getUsers:          (params)     => api.get('/admin/users', { params }),
  updateUserStatus:  (id, data)   => api.patch(`/admin/users/${id}/status`, data),
  getDoctors:        ()           => api.get('/admin/doctors'),
  approveDoctor:     (id, data)   => api.patch(`/admin/doctors/${id}/approval`, data),
  getAppointments:   (params)     => api.get('/admin/appointments', { params }),
  updateApptStatus:  (id, data)   => api.patch(`/admin/appointments/${id}/status`, data),
  rescheduleAppt:    (id, data)   => api.patch(`/admin/appointments/${id}/reschedule`, data),
  getComplaints:     (params)     => api.get('/admin/complaints', { params }),
  updateComplaint:   (id, data)   => api.patch(`/admin/complaints/${id}/status`, data),
};
