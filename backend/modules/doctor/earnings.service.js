const Doctor = require("./doctor.model");
const Appointment = require("../../models/Appointment");

/**
 * Calculate earnings for a doctor for a given date range (or all-time).
 */
const calculateEarnings = async (doctorId, startDate, endDate) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) throw new Error("Doctor not found");

  const query = { doctorId: doctor._id, status: "completed" };

  if (startDate && endDate) {
    query.appointmentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const appointments = await Appointment.find(query);
  const count = appointments.length;
  const total = count * (doctor.consultationFee || 0);

  return { count, total, avgPerAppointment: count > 0 ? total / count : 0 };
};

/**
 * GET /doctors/me/earnings
 * Returns a summary + monthly breakdown for the last 12 months.
 * Response shape: { data: { summary: {...}, monthly: [...] } }
 */
exports.getEarningsSummary = async (doctorId) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) throw new Error("Doctor not found");

  // ── All-time summary ──────────────────────────────────────────
  const summary = await calculateEarnings(doctorId);

  // ── Monthly breakdown (last 12 months) ───────────────────────
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const rows = await Appointment.aggregate([
    {
      $match: {
        doctorId: doctor._id,
        status: "completed",
        appointmentDate: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$appointmentDate" },
          month: { $month: "$appointmentDate" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthly = rows.map((r) => ({
    _id: r._id,
    count: r.count,
    total: r.count * (doctor.consultationFee || 0),
  }));

  return { summary, monthly };
};

/**
 * calculateEarnings (period-based) — used by getEarnings controller
 */
exports.calculateEarnings = calculateEarnings;