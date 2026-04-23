const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// Use the fully-featured doctorController (search, filter, pagination, Doctor model)
const ctrl = require("../controllers/doctorController");

// Use the module controller for doctor-self actions
const doctorModuleCtrl = require("../modules/doctor/doctor.controller");
const doctorModuleRoutes = require("../modules/doctor/doctor.routes");

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/doctors?search=&specialization=&city=&minFees=&maxFees=&sortBy=&order=&page=&limit=
router.get("/", ctrl.getDoctors);

// ─── Doctor self-service endpoints (Protected) ────────────────────────────────
// IMPORTANT: these specific named paths must come BEFORE /:id wildcard
router.get("/me/appointments", protect, authorize("doctor"), doctorModuleCtrl.getMyAppointments);
router.patch("/me/appointments/:id", protect, authorize("doctor"), doctorModuleCtrl.updateAppointmentStatus);
router.get("/me/earnings", protect, authorize("doctor"), doctorModuleCtrl.getEarnings);

// ─── Module routes (availability, prescriptions, profile, etc.) ───────────────
router.use("/", doctorModuleRoutes);

// ─── Parameterized Public Routes (MUST be last) ───────────────────────────────
router.get("/:doctorId/slots", ctrl.getAvailableSlots);
router.get("/:id", ctrl.getDoctorById);

module.exports = router;