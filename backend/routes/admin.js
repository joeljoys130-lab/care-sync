const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/users', ctrl.getUsers);
router.put('/users/:id/status', ctrl.updateUserStatus);
router.get('/doctors/pending', ctrl.getPendingDoctors);
router.put('/doctors/:id/approve', ctrl.approveDoctor);
router.get('/analytics', ctrl.getAnalytics);
router.get('/appointments', ctrl.getAllAppointments);

module.exports = router;
