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
// NUCLEAR FIX: Hardcoding the Render URL to bypass Vercel environment variable issues
const rawBaseURL = 'https://care-sync-4a6s.onrender.com/api';
console.log('CareSync API Initialization - NUCLEAR BaseURL:', rawBaseURL);

const api = axios.create({
  baseURL: rawBaseURL,
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
  login:          (data)  => api.post('/auth/login', data),
  register:       (data)  => api.post('/auth/register', data),
  sendOtp:        (data)  => api.post('/auth/send-otp', data),
  verifyOtp:      (data)  => api.post('/auth/verify-otp', data),
  forgotPassword: (data)  => api.post('/auth/forgot-password', data),
  resetPassword:  (data)  => api.post('/auth/reset-password', data),
};

/* ═══════════════════════════════════════════════════════════════
   USER / PROFILE API  (used by Profile.jsx)
═══════════════════════════════════════════════════════════════ */
export const userAPI = {
  getProfile:   ()       => api.get('/users/profile'),
  updateProfile: (data)  => api.put('/users/profile', data),
  uploadAvatar:  (form)  => api.put('/users/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
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
  getDoctors:        (params) => api.get('/doctors', { params }),
  getDoctorById:     (id)     => api.get(`/doctors/${id}`),
  getAvailableSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  getMyAppointments: (params) => api.get('/doctors/my/appointments', { params }),
  updateMyAppointment: (id, data) => api.patch(`/doctors/my/appointments/${id}`, data),
  getEarnings:       ()       => api.get('/doctors/my/earnings'),
  updateAvailability: (data)   => api.put('/doctors/availability', data),
  updateProfile:     (data)   => api.put('/doctors/profile', data),
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
  getAll:            (params)      => api.get('/records', { params }),
  getById:           (id)          => api.get(`/records/${id}`),
  getPatientRecords: (patientId, params) => api.get(`/records/patient/${patientId}`, { params }),
  create:            (data)        => api.post('/records', data),
  update:            (id, data)    => api.put(`/records/${id}`, data),
};

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION API  (used by Dashboard.jsx, Notifications.jsx)
   — stub until backend is built, returns empty gracefully
═══════════════════════════════════════════════════════════════ */
export const notificationAPI = {
  getAll:      (params) => api.get('/notifications', { params })
    .catch(() => ({ data: { data: { notifications: [], unreadCount: 0 } } })),
  markAsRead:  (id)     => api.patch(`/notifications/${id}/read`)
    .catch(() => ({})),
  markAllRead: ()       => api.patch('/notifications/read-all')
    .catch(() => ({})),
  delete:      (id)     => api.delete(`/notifications/${id}`)
    .catch(() => ({})),
};

/* ═══════════════════════════════════════════════════════════════
   REVIEW API  (used by DoctorDetail.jsx + DoctorList.jsx)
═══════════════════════════════════════════════════════════════ */
export const reviewAPI = {
  getDoctorReviews: (id, params) => api.get(`/reviews/doctor/${id}`, { params }),
  getForDoctor: (doctorId, params) => api.get(`/reviews/doctor/${doctorId}`, { params }),
  create: (data) => api.post('/reviews', data)
    .catch((err) => Promise.reject(err)),
  getMyReviews: (params) => api.get('/reviews/me', { params }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN API  (used by Adithya's admin dashboard)
═══════════════════════════════════════════════════════════════ */
export const adminAPI = {
  getAnalytics:      ()           => api.get('/admin/analytics'),
  getStats:          ()           => api.get('/admin/analytics'),
  getUsers:          (params)     => api.get('/admin/users', { params }),
  updateUserStatus:  (id, data)   => api.patch(`/admin/users/${id}/status`, data),
  getDoctors:        ()           => api.get('/admin/doctors'),
  getPendingDoctors: ()           => api.get('/admin/doctors/pending'),
  approveDoctor:     (id, data)   => api.patch(`/admin/doctors/${id}/approval`, data),
  getAppointments:   (params)     => api.get('/admin/appointments', { params }),
  getAllAppointments:(params)     => api.get('/admin/appointments', { params }),
  updateApptStatus:  (id, data)   => api.patch(`/admin/appointments/${id}/status`, data),
  rescheduleAppt:    (id, data)   => api.patch(`/admin/appointments/${id}/reschedule`, data),
  getComplaints:     (params)     => api.get('/admin/complaints', { params }),
  updateComplaint:   (id, data)   => api.patch(`/admin/complaints/${id}/status`, data),
  getReviews:        (params)     => api.get('/admin/reviews', { params }),
  deleteReview:      (id)         => api.delete(`/admin/reviews/${id}`),
};
