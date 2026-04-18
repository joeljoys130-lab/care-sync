const Doctor = require("./doctor.model");
const Appointment = require("../../models/Appointment"); // Assuming Joel creates this

/**
 * Calculate earnings for a doctor
 */
exports.calculateEarnings = async (doctorId, startDate, endDate) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Build query for completed appointments in date range
  const query = {
    doctorId: doctor._id,
    status: "completed"
  };

  if (startDate && endDate) {
    query.appointmentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const appointments = await Appointment.find(query);

  const totalAppointments = appointments.length;
  const totalEarnings = totalAppointments * doctor.consultationFee;

  return {
    doctorId: doctor._id,
    totalAppointments,
    consultationFee: doctor.consultationFee,
    totalEarnings,
    period: {
      startDate,
      endDate
    },
    appointments: appointments.map(app => ({
      id: app._id,
      date: app.appointmentDate,
      fee: doctor.consultationFee
    }))
  };
};

/**
 * Get earnings summary
 */
exports.getEarningsSummary = async (doctorId) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // This month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthly = await this.calculateEarnings(doctorId, startOfMonth, endOfMonth);

  // This year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const yearly = await this.calculateEarnings(doctorId, startOfYear, endOfYear);

  // All time
  const allTime = await this.calculateEarnings(doctorId);

  return {
    monthly,
    yearly,
    allTime
  };
};