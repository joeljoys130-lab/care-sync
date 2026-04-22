const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// 1. STATS
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      success: true,
      data: {
        users: totalUsers || 0,
        doctors: totalDoctors || 0,
        patients: totalPatients || 0,
        appointments: totalAppointments || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. USERS
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    await Appointment.deleteMany({
      $or: [
        { patientId: req.params.id },
        { doctorId: req.params.id }
      ]
    });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ['admin', 'doctor', 'patient'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, data: user || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DOCTORS
router.get('/doctors', protect, authorize('admin'), async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/doctors/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const doctor = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true }).select('-password');
    res.json({ success: true, data: doctor || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. APPOINTMENTS
router.get('/appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// soft delete (status = cancelled)
router.delete('/appointments/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;