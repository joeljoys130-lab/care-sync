const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createReview,
  getDoctorReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  replyToReview
} = require('../controllers/reviewController');

// Get reviews for a specific doctor (public/protected depending on need, we'll use protect for now)
router.get('/doctor/:doctorId', protect, getDoctorReviews);

// Get my reviews (Doctor only)
router.get('/me', protect, authorize('doctor'), getMyReviews);

// Create a new review (Patient only)
router.post('/', protect, authorize('patient'), createReview);

// Update/Delete own review (Patient)
router.put('/:id', protect, authorize('patient'), updateReview);
router.delete('/:id', protect, authorize('patient', 'admin'), deleteReview);

// Doctor replies to a review
router.post('/:id/reply', protect, authorize('doctor'), replyToReview);

module.exports = router;