const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  approveDoctorAccount,
  getAnalytics,
  getAllAppointments,
  getAllComplaints,
  updateComplaintStatus,
  updateUserStatus,
  updateAppointmentStatus,
  rescheduleAppointment,
} = require("../controllers/adminController");

// Admin API router
// All endpoints in this file are for admin dashboard operations only.

// Route-level guard:
// 1) protect verifies JWT and attaches user
// 2) authorize('admin') blocks non-admin roles from accessing any route below
router.use(protect, authorize('admin'));

// User management endpoints
// - List users for admin table
// - Block/unblock users for moderation
router.get("/users", getAllUsers);

router.patch("/users/:userId/status", updateUserStatus);

// Doctor onboarding decision endpoint
router.patch("/doctors/:doctorId/approval", approveDoctorAccount);

// Dashboard metrics endpoint
router.get("/analytics", getAnalytics);

// Appointment management endpoints
// - View all appointments
// - Update status
// - Reschedule date and slot
router.get("/appointments", getAllAppointments);

router.patch("/appointments/:appointmentId/status", updateAppointmentStatus);

router.patch("/appointments/:appointmentId/reschedule", rescheduleAppointment);

// Complaint handling endpoints
// - View complaints queue
// - Move complaint across support workflow states
router.get("/complaints", getAllComplaints);

router.patch("/complaints/:complaintId/status", updateComplaintStatus);

module.exports = router;