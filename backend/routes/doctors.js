const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/doctorController');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', ctrl.getDoctors);

// ─── Doctor-only Routes ───────────────────────────────────────────────────────
// ⚠️  IMPORTANT: Specific named routes MUST come BEFORE /:id wildcard,
//  otherwise Express treats "me", "profile", etc. as an id parameter.
router.put('/profile', protect, authorize('doctor'), ctrl.updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), ctrl.updateAvailability);
router.get('/me/appointments', protect, authorize('doctor'), ctrl.getDoctorAppointments);
router.put('/me/appointments/:id', protect, authorize('doctor'), ctrl.updateAppointmentStatus);
router.get('/me/earnings', protect, authorize('doctor'), ctrl.getDoctorEarnings);

// ─── Parameterized Public Routes (must be LAST) ───────────────────────────────
router.get('/:doctorId/slots', ctrl.getAvailableSlots);
router.get('/:id', ctrl.getDoctorById);

module.exports = router;
