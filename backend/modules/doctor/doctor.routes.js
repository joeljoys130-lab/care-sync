const express = require("express");
const router = express.Router();

const doctorController = require("./doctor.controller");
const availabilityController = require("./availability.controller");
const prescriptionController = require("./prescription.controller");

// Import Joel's middleware (adjust path if needed)
const { protect, isDoctor } = require("../../middleware/authMiddleware");

// Protect all routes → only authenticated doctors
router.use(protect);
router.use(isDoctor);

/**
 * Doctor Profile Routes
 */
router.post("/", doctorController.createDoctor);        // Create profile
router.get("/me", doctorController.getMyProfile);       // Get own profile
router.put("/me", doctorController.updateMyProfile);    // Update own profile

/**
 * Availability Routes
 */
router.post("/availability", availabilityController.setAvailability);     // Set availability
router.get("/availability", availabilityController.getMyAvailability);    // Get availability for date
router.get("/availability/all", availabilityController.getAllMyAvailability); // Get all availability

/**
 * Appointment Routes
 */
router.get("/appointments", doctorController.getMyAppointments);          // Get my appointments
router.put("/appointments/:appointmentId/status", doctorController.updateAppointmentStatus); // Update status

/**
 * Prescription Routes
 */
router.post("/prescriptions", prescriptionController.createPrescription); // Create prescription
router.get("/prescriptions", prescriptionController.getMyPrescriptions);  // Get my prescriptions
router.get("/prescriptions/:appointmentId", prescriptionController.getPrescription); // Get by appointment
router.put("/prescriptions/:appointmentId", prescriptionController.updatePrescription); // Update prescription

/**
 * Earnings Routes
 */
router.get("/earnings", doctorController.getEarnings);                   // Get earnings for period
router.get("/earnings/summary", doctorController.getEarningsSummary);   // Get earnings summary

/**
 * Public Route (IMPORTANT)
 * This should ideally be outside doctor-only middleware,
 * but for now keep it here — can be refactored later
 */
router.get("/:id", doctorController.getDoctorById);

module.exports = router;