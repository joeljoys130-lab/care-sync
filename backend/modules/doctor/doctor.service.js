const Doctor = require("./doctor.model");

/**
 * Create doctor profile
 */
exports.createDoctorProfile = async (userId, data) => {
  const existing = await Doctor.findOne({ userId });
  if (existing) {
    throw new Error("Doctor profile already exists");
  }

  const doctor = await Doctor.create({
    userId,
    ...data
  });

  return doctor;
};

/**
 * Get current doctor's profile
 */
exports.getMyProfile = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).populate("userId", "-password");
  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

/**
 * Update doctor profile
 */
exports.updateMyProfile = async (userId, data) => {
  const doctor = await Doctor.findOneAndUpdate(
    { userId },
    data,
    { new: true, runValidators: true }
  );

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

/**
 * Get doctor by ID (public)
 */
exports.getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate("userId", "-password");
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

/**
 * Get my appointments
 */
exports.getMyAppointments = async (userId, status, date) => {
  const doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const Appointment = require("../../models/Appointment"); // Assuming Joel creates this

  const query = { doctorId: doctor._id };

  if (status) {
    query.status = status;
  }

  if (date) {
    query.appointmentDate = {
      $gte: new Date(date),
      $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
    };
  }

  return await Appointment.find(query)
    .populate("patientId", "name email")
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

/**
 * Update appointment status
 */
exports.updateAppointmentStatus = async (userId, appointmentId, status, notes) => {
  const doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const Appointment = require("../../models/Appointment");

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new Error("Unauthorized: Appointment does not belong to this doctor");
  }

  appointment.status = status;
  if (notes) {
    appointment.doctorNotes = notes;
  }

  await appointment.save();

  return appointment;
};