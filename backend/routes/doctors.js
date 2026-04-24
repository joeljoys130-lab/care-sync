const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/doctorController');
const prescriptionCtrl = require('../controllers/prescriptionController');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', ctrl.getDoctors);

// ─── Doctor-only Routes ───────────────────────────────────────────────────────
// ⚠️  IMPORTANT: Specific named routes MUST come BEFORE /:id wildcard,
//  otherwise Express treats "me", "profile", etc. as an id parameter.

// Profile
router.put('/profile', protect, authorize('doctor'), ctrl.updateDoctorProfile);

// Weekly recurring availability (stored on Doctor document)
router.put('/availability', protect, authorize('doctor'), ctrl.updateAvailability);

// Date-based availability schedule (stored in Availability collection)
router.post('/me/availability/schedule',     protect, authorize('doctor'), ctrl.setAvailabilitySchedule);
router.get('/me/availability/schedule/all',  protect, authorize('doctor'), ctrl.getAllAvailabilitySchedule);
router.get('/me/availability/schedule',      protect, authorize('doctor'), ctrl.getAvailabilitySchedule);

// Appointments
router.get('/me/appointments',       protect, authorize('doctor'), ctrl.getDoctorAppointments);
router.put('/me/appointments/:id',   protect, authorize('doctor'), ctrl.updateAppointmentStatus);

// Earnings
router.get('/me/earnings', protect, authorize('doctor'), ctrl.getDoctorEarnings);

// Prescriptions
router.post('/me/prescriptions',                    protect, authorize('doctor'), prescriptionCtrl.createPrescription);
router.get('/me/prescriptions',                     protect, authorize('doctor'), prescriptionCtrl.getMyPrescriptions);
router.get('/me/prescriptions/:appointmentId',      protect, authorize('doctor'), prescriptionCtrl.getPrescription);
router.put('/me/prescriptions/:appointmentId',      protect, authorize('doctor'), prescriptionCtrl.updatePrescription);

// ─── Parameterized Public Routes (must be LAST) ───────────────────────────────
router.get('/:doctorId/slots', ctrl.getAvailableSlots);
router.get('/:id', ctrl.getDoctorById);

module.exports = router;
