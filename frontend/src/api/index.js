import api from './axiosInstance';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/users/change-password', data),
};

export const doctorAPI = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getAvailableSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } }),
  updateProfile: (data) => api.put('/doctors/profile', data),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getMyAppointments: (params) => api.get('/doctors/me/appointments', { params }),
  updateMyAppointment: (id, data) => api.put(`/doctors/me/appointments/${id}`, data),
  getEarnings: (params) => api.get('/doctors/me/earnings', { params }),
};

export const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getAppointments: (params) => api.get('/patients/appointments', { params }),
  toggleFavorite: (doctorId) => api.post(`/patients/favorites/${doctorId}`),
  getFavorites: () => api.get('/patients/favorites'),
};

export const appointmentAPI = {
  book: (data) => api.post('/appointments', data),
  getById: (id) => api.get(`/appointments/${id}`),
  cancel: (id, data) => api.put(`/appointments/${id}/cancel`, data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
};

export const paymentAPI = {
  createRazorpayOrder: (data) => api.post('/payments/razorpay/order', data),
  confirm: (data) => api.post('/payments/confirm', data),
  getHistory: (params) => api.get('/payments/history', { params }),
};

export const recordAPI = {
  create: (formData) =>
    api.post('/records', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPatientRecords: (patientId, params) => api.get(`/records/patient/${patientId}`, { params }),
  getById: (id) => api.get(`/records/${id}`),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getDoctorReviews: (doctorId, params) => api.get(`/reviews/doctor/${doctorId}`, { params }),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  reply: (id, data) => api.put(`/reviews/${id}/reply`, data),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  approveDoctor: (id, data) => api.put(`/admin/doctors/${id}/approve`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getAllAppointments: (params) => api.get('/admin/appointments', { params }),
};
