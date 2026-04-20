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
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Get all users with filtering and pagination
router.get("/users", getAllUsers);

// Approve or reject doctor account
router.patch("/doctors/:doctorId/approval", approveDoctorAccount);

// Get analytics
router.get("/analytics", getAnalytics);

// get all appointments (admin monitoring)
router.get("/appointments", getAllAppointments);

// get all complaints (admin)
router.get("/complaints", getAllComplaints);

// update complaint status (admin)
router.patch("/complaints/:complaintId/status", updateComplaintStatus);

module.exports = router;