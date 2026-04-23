const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/patientController');
const { uploadAvatar } = require('../middleware/upload');

router.get('/profile', protect, authorize('patient'), ctrl.getPatientProfile);
router.put('/profile', protect, authorize('patient'), ctrl.updatePatientProfile);
router.get('/appointments', protect, authorize('patient'), ctrl.getPatientAppointments);
router.post('/favorites/:doctorId', protect, authorize('patient'), ctrl.toggleFavorite);
router.get('/favorites', protect, authorize('patient'), ctrl.getFavorites);
router.post('/profile/avatar', protect, authorize('patient'), uploadAvatar, ctrl.uploadAvatar);

module.exports = router;
