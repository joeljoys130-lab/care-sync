const Prescription = require("./prescription.model");
const Doctor = require("./doctor.model");
const Appointment = require("../../models/Appointment"); // Assuming Joel creates this

/**
 * Create prescription for an appointment
 */
exports.createPrescription = async (doctorId, appointmentId, data) => {
  // Validate doctor
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Validate appointment exists and belongs to this doctor
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new Error("Unauthorized: Appointment does not belong to this doctor");
  }

  // Check if prescription already exists
  const existing = await Prescription.findOne({ appointmentId });
  if (existing) {
    throw new Error("Prescription already exists for this appointment");
  }

  const prescription = await Prescription.create({
    appointmentId,
    doctorId: doctor._id,
    patientId: appointment.patientId,
    ...data
  });

  return prescription;
};

/**
 * Get prescription by appointment ID
 */
exports.getPrescriptionByAppointment = async (doctorId, appointmentId) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const prescription = await Prescription.findOne({ appointmentId, doctorId: doctor._id })
    .populate('appointmentId')
    .populate('patientId', 'name email');

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  return prescription;
};

/**
 * Update prescription
 */
exports.updatePrescription = async (doctorId, appointmentId, data) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const prescription = await Prescription.findOneAndUpdate(
    { appointmentId, doctorId: doctor._id },
    data,
    { new: true, runValidators: true }
  );

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  return prescription;
};

/**
 * Get all prescriptions for a doctor
 */
exports.getMyPrescriptions = async (doctorId) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return await Prescription.find({ doctorId: doctor._id })
    .populate('appointmentId')
    .populate('patientId', 'name email')
    .sort({ createdAt: -1 });
};