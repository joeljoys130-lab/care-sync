const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { uploadMedicalFiles } = require('../middleware/upload');
const ctrl = require('../controllers/medicalRecordController');

router.post('/', protect, authorize('doctor'), uploadMedicalFiles, ctrl.createRecord);
router.get('/patient/:patientId', protect, ctrl.getPatientRecords);
router.get('/:id', protect, ctrl.getRecordById);
router.put('/:id', protect, authorize('doctor'), uploadMedicalFiles, ctrl.updateRecord);

module.exports = router;
