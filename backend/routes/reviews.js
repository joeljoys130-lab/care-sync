const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/reviewController');

// Create review
router.post(
  '/',
  protect,
  authorize('patient'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('appointmentId').notEmpty(),
    body('doctorId').notEmpty(),
  ],
  validate,
  ctrl.createReview
);

// Get doctor reviews (public)
router.get('/doctor/:doctorId', ctrl.getDoctorReviews);

// Update / delete own review
router.put('/:id', protect, authorize('patient'), ctrl.updateReview);
router.delete('/:id', protect, authorize('patient', 'admin'), ctrl.deleteReview);

// Doctor reply
router.put('/:id/reply', protect, authorize('doctor'), ctrl.replyToReview);

module.exports = router;
