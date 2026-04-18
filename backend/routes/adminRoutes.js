const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  approveDoctorAccount,
  getAnalytics,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Get all users with filtering and pagination
router.get("/users", getAllUsers);

// Approve or reject doctor account
router.patch("/doctors/:doctorId/approval", approveDoctorAccount);

// Get analytics
router.get("/analytics", getAnalytics);

module.exports = router;