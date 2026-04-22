const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/appointmentController');

// Book appointment (patient)
router.post(
  '/',
  protect,
  authorize('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID required'),
    body('appointmentDate').notEmpty().withMessage('Date required'),
    body('slot.startTime').notEmpty().withMessage('Slot start time required'),
    body('slot.endTime').notEmpty().withMessage('Slot end time required'),
    body('reason').notEmpty().withMessage('Reason for visit required'),
  ],
  validate,
  ctrl.bookAppointment
);

// Get single appointment
router.get('/:id', protect, ctrl.getAppointmentById);

// Cancel appointment
router.put('/:id/cancel', protect, authorize('patient', 'doctor', 'admin'), ctrl.cancelAppointment);

// Reschedule (patient only)
router.put('/:id/reschedule', protect, authorize('patient'), ctrl.rescheduleAppointment);

// Update status (doctor/admin)
router.put('/:id/status', protect, authorize('doctor', 'admin'), ctrl.updateAppointmentStatus);

module.exports = router;
