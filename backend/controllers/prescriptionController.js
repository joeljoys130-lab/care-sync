const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// ─── Create Prescription ──────────────────────────────────────────────────────
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, symptoms, medicines, notes, followUpDate } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and diagnosis are required.',
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Appointment does not belong to this doctor.',
      });
    }

    // Atomic upsert — $setOnInsert only writes if no doc exists for this appointmentId.
    // The unique DB index on appointmentId is the final safety net for concurrent requests.
    const prescription = await Prescription.findOneAndUpdate(
      { appointmentId },
      {
        $setOnInsert: {
          appointmentId,
          doctorId: doctor._id,
          patientId: appointment.patientId,
          diagnosis,
          symptoms,
          medicines,
          notes,
          followUpDate,
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: { prescription } });
  } catch (err) {
    next(err);
  }
};

// ─── Get Prescription by Appointment ID ──────────────────────────────────────
exports.getPrescription = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const prescription = await Prescription.findOne({
      appointmentId,
      doctorId: doctor._id,
    })
      .populate('appointmentId')
      .populate('patientId', 'name email');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    res.json({ success: true, data: { prescription } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Prescription ──────────────────────────────────────────────────────
exports.updatePrescription = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { appointmentId, doctorId: doctor._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    res.json({ success: true, data: { prescription } });
  } catch (err) {
    next(err);
  }
};

// ─── Get All My Prescriptions ─────────────────────────────────────────────────
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { prescriptions } });
  } catch (err) {
    next(err);
  }
};
