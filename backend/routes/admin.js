const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/users', ctrl.getUsers);
router.patch('/users/:id/status', ctrl.updateUserStatus);
router.get('/doctors/pending', ctrl.getPendingDoctors);
router.patch('/doctors/:id/approval', ctrl.approveDoctor);
router.get('/analytics', ctrl.getAnalytics);
router.get('/appointments', ctrl.getAllAppointments);
router.get('/reviews', ctrl.getReviews);
router.delete('/reviews/:id', ctrl.deleteReview);

module.exports = router;
