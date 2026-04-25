const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

/**
 * @desc    Create prescription for an appointment
 * @route   POST /api/doctors/appointments/:appointmentId/prescription
 * @access  Private (Doctor only)
 */
exports.createPrescription = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Appointment does not belong to you' });
    }

    // Check if prescription already exists
    const existing = await Prescription.findOne({ appointmentId: req.params.appointmentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Prescription already exists for this appointment' });
    }

    const prescription = await Prescription.create({
      appointmentId: req.params.appointmentId,
      doctorId: doctor._id,
      patientId: appointment.patientId,
      ...req.body
    });

    // Mark appointment as completed if needed
    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prescription by appointment ID
 * @route   GET /api/doctors/appointments/:appointmentId/prescription
 * @access  Private (Doctor or Patient)
 */
exports.getPrescriptionByAppointment = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ appointmentId: req.params.appointmentId })
      .populate('doctorId', 'userId specialization')
      .populate('patientId', 'userId')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update prescription
 * @route   PUT /api/doctors/appointments/:appointmentId/prescription
 * @access  Private (Doctor only)
 */
exports.updatePrescription = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const prescription = await Prescription.findOneAndUpdate(
      { appointmentId: req.params.appointmentId, doctorId: doctor._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all prescriptions for logged in doctor
 * @route   GET /api/doctors/my-prescriptions
 * @access  Private (Doctor only)
 */
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('appointmentId')
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email avatar' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};
