const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createNotification } = require('../utils/notificationHelper');

// ─── Book Appointment ─────────────────────────────────────────────────────────
exports.bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, slot, reason, type = 'in-person' } = req.body;

  // Get patient profile
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  // Get doctor
  const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  if (!doctor.isApproved) return res.status(400).json({ success: false, message: 'Doctor is not approved.' });

  // Check if slot is available (the unique compound index handles double-booking,
  // but let's do an explicit check for better UX)
  const existingAppt = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    'slot.startTime': slot.startTime,
    status: { $nin: ['cancelled'] },
  });

  if (existingAppt) {
    return res.status(409).json({ success: false, message: 'This slot is already booked. Please choose another.' });
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId,
    appointmentDate: new Date(appointmentDate),
    slot,
    reason,
    type,
    fees: doctor.fees,
  });

  // Increment patient's appointment counter
  await Patient.findByIdAndUpdate(patient._id, { $inc: { totalAppointments: 1 } });

  // Notify the doctor
  const doctorUser = await require('../models/User').findById(doctor.userId);
  await createNotification({
    userId: doctor.userId._id,
    title: 'New Appointment Booked',
    message: `A new appointment has been booked for ${new Date(appointmentDate).toDateString()} at ${slot.startTime}`,
    type: 'appointment_booked',
    refId: appointment._id,
    refModel: 'Appointment',
  });

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.',
    data: { appointment },
  });
};

// ─── Get Single Appointment ───────────────────────────────────────────────────
exports.getAppointmentById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email avatar' } })
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
    .populate('paymentId')
    .populate('medicalRecordId');

  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  // Authorization: only the patient, doctor, or admin can view
  const patient = await Patient.findOne({ userId: req.user.id });
  const doctor = await Doctor.findOne({ userId: req.user.id });

  const isOwner =
    (patient && appointment.patientId._id.toString() === patient._id.toString()) ||
    (doctor && appointment.doctorId._id.toString() === doctor._id.toString()) ||
    req.user.role === 'admin';

  if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized.' });

  res.json({ success: true, data: { appointment } });
};

// ─── Cancel Appointment ───────────────────────────────────────────────────────
exports.cancelAppointment = async (req, res) => {
  const { reason } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  if (['cancelled', 'completed'].includes(appointment.status)) {
    return res.status(400).json({ success: false, message: `Appointment is already ${appointment.status}.` });
  }

  // Check within 2 hours policy
  const now = new Date();
  const apptTime = new Date(appointment.appointmentDate);
  if ((apptTime - now) < 2 * 60 * 60 * 1000 && req.user.role === 'patient') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel appointments within 2 hours of the scheduled time.',
    });
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user.role;
  appointment.cancelReason = reason || '';
  appointment.cancelledAt = new Date();
  await appointment.save();

  // Notify opposing party
  const patient = await Patient.findById(appointment.patientId).populate('userId', '_id');
  const doctor = await Doctor.findById(appointment.doctorId).populate('userId', '_id');

  if (req.user.role === 'patient') {
    await createNotification({
      userId: doctor.userId._id,
      title: 'Appointment Cancelled',
      message: `An appointment on ${appointment.appointmentDate.toDateString()} has been cancelled by the patient.`,
      type: 'appointment_cancelled',
      refId: appointment._id,
      refModel: 'Appointment',
    });
  } else {
    await createNotification({
      userId: patient.userId._id,
      title: 'Appointment Cancelled',
      message: `Your appointment on ${appointment.appointmentDate.toDateString()} has been cancelled by the doctor.`,
      type: 'appointment_cancelled',
      refId: appointment._id,
      refModel: 'Appointment',
    });
  }

  res.json({ success: true, message: 'Appointment cancelled.', data: { appointment } });
};

// ─── Reschedule Appointment ───────────────────────────────────────────────────
exports.rescheduleAppointment = async (req, res) => {
  const { appointmentDate, slot } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: 'Only pending or confirmed appointments can be rescheduled.' });
  }

  // Check new slot availability
  const conflict = await Appointment.findOne({
    doctorId: appointment.doctorId,
    appointmentDate: new Date(appointmentDate),
    'slot.startTime': slot.startTime,
    status: { $nin: ['cancelled'] },
    _id: { $ne: appointment._id },
  });

  if (conflict) {
    return res.status(409).json({ success: false, message: 'Selected slot is not available.' });
  }

  appointment.appointmentDate = new Date(appointmentDate);
  appointment.slot = slot;
  appointment.status = 'pending'; // Reset to pending for re-confirmation
  await appointment.save();

  res.json({ success: true, message: 'Appointment rescheduled.', data: { appointment } });
};

// ─── Update Status (Admin / Doctor) ──────────────────────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
  const { status, notes } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  appointment.status = status;
  if (notes) appointment.notes = notes;
  await appointment.save();

  res.json({ success: true, message: 'Status updated.', data: { appointment } });
};
