const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
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

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Get all users with filtering and pagination
router.get("/users", getAllUsers);

// Update user account status (active/blocked)
router.patch("/users/:userId/status", updateUserStatus);

// Approve or reject doctor account
router.patch("/doctors/:doctorId/approval", approveDoctorAccount);

// Get analytics
router.get("/analytics", getAnalytics);

// get all appointments (admin monitoring)
router.get("/appointments", getAllAppointments);

// update appointment status (admin)
router.patch("/appointments/:appointmentId/status", updateAppointmentStatus);

// reschedule appointment (admin)
router.patch("/appointments/:appointmentId/reschedule", rescheduleAppointment);

// get all complaints (admin)
router.get("/complaints", getAllComplaints);

// update complaint status (admin)
router.patch("/complaints/:complaintId/status", updateComplaintStatus);

module.exports = router;