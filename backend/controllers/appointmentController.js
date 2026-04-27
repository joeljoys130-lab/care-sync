const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createNotification } = require('../utils/notificationHelper');

// ─── Book Appointment ─────────────────────────────────────────────────────────
exports.bookAppointment = async (req, res, next) => {
  try {
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
} catch (err) {
    next(err);
  }
};

// ─── Get Single Appointment ───────────────────────────────────────────────────
exports.getAppointmentById = async (req, res, next) => {
  try {
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
} catch (err) {
    next(err);
  }
};

// ─── Cancel Appointment ───────────────────────────────────────────────────────
exports.cancelAppointment = async (req, res, next) => {
  try {
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

  // ─── Automated Refund Logic ────────────────────────────────────────────────
  if (appointment.isPaid) {
    const Payment = require('../models/Payment');
    try {
      const payment = await Payment.findOne({ appointmentId: appointment._id, status: 'completed' });
      if (payment) {
        console.log(`💰 Processing refund for payment ${payment._id}...`);
        
        // 1. Update Payment Record
        payment.status = 'refunded';
        payment.refundAmount = payment.amount;
        payment.refundedAt = new Date();
        payment.refundReason = `Appointment cancelled by ${req.user.role}: ${reason || 'No reason provided'}`;
        await payment.save();

        // 2. Deduct from Doctor's Earnings
        await Doctor.findByIdAndUpdate(appointment.doctorId, {
          $inc: { totalEarnings: -payment.amount }
        });

        // 3. Notify Patient of Refund
        const patientUser = await Patient.findById(appointment.patientId).populate('userId', '_id');
        await createNotification({
          userId: patientUser.userId._id,
          title: 'Refund Processed',
          message: `Your payment of ₹${payment.amount} for the appointment on ${appointment.appointmentDate.toDateString()} has been refunded.`,
          type: 'payment_success', // Reusing type for green styling
          refId: payment._id,
          refModel: 'Payment',
        });
        
        console.log(`✅ Refund successful for appointment ${appointment._id}`);
      }
    } catch (refundErr) {
      console.error('❌ Refund processing failed:', refundErr);
      // We don't block the cancellation even if refund logging fails, 
      // but in production you might want to retry.
    }
  }

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
} catch (err) {
    next(err);
  }
};

// ─── Reschedule Appointment ───────────────────────────────────────────────────
exports.rescheduleAppointment = async (req, res, next) => {
  try {
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
} catch (err) {
    next(err);
  }
};

// ─── Update Status (Admin / Doctor) ──────────────────────────────────────────
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
  const { status, notes } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  appointment.status = status;
  if (notes) appointment.notes = notes;
  await appointment.save();

  res.json({ success: true, message: 'Status updated.', data: { appointment } });
} catch (err) {
    next(err);
  }
};
