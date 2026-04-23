const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { createNotification } = require('../utils/notificationHelper');

// ─── Get All Users (with filter, pagination) ──────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
  const { role, search, isActive, page = 1, limit = 15 } = req.query;
  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) query.name = new RegExp(search, 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -otp -otpExpiry -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
} catch (err) {
    next(err);
  }
};

// ─── Update User Status (activate / deactivate) ───────────────────────────────
exports.updateUserStatus = async (req, res, next) => {
  try {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}.`, data: { user } });
} catch (err) {
    next(err);
  }
};

// ─── Get Pending Doctor Approvals ─────────────────────────────────────────────
exports.getPendingDoctors = async (req, res, next) => {
  try {
  const doctors = await Doctor.find({ isApproved: false }).populate(
    'userId',
    'name email avatar createdAt'
  );
  res.json({ success: true, data: { doctors } });
} catch (err) {
    next(err);
  }
};

// ─── Approve / Reject Doctor ──────────────────────────────────────────────────
exports.approveDoctor = async (req, res, next) => {
  try {
  const { isApproved, reason } = req.body;
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isApproved, ...(isApproved ? { approvedAt: new Date() } : {}) },
    { new: true }
  ).populate('userId', 'name email');

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  // Notify doctor
  await createNotification({
    userId: doctor.userId._id,
    title: isApproved ? 'Account Approved! 🎉' : 'Application Rejected',
    message: isApproved
      ? 'Your doctor profile has been approved. You can now receive appointments.'
      : `Your doctor application was rejected. Reason: ${reason || 'Please contact support.'}`,
    type: isApproved ? 'doctor_approved' : 'doctor_rejected',
  });

  res.json({
    success: true,
    message: `Doctor ${isApproved ? 'approved' : 'rejected'} successfully.`,
    data: { doctor },
  });
} catch (err) {
    next(err);
  }
};

// ─── Admin Analytics Dashboard ────────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
  const [
    totalUsers,
    totalDoctors,
    totalPatients,
    totalAppointments,
    pendingApprovals,
    completedAppointments,
    cancelledAppointments,
    totalRevenue,
    recentAppointments,
    appointmentsByMonth,
    revenueByMonth,
    topDoctors,
  ] = await Promise.all([
    User.countDocuments(),
    Doctor.countDocuments({ isApproved: true }),
    Patient.countDocuments(),
    Appointment.countDocuments(),
    Doctor.countDocuments({ isApproved: false }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Appointment.find()
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(5),
    // Appointments last 6 months
    Appointment.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
    // Revenue last 6 months
    Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
    // Top 5 doctors by rating
    Doctor.find({ isApproved: true })
      .populate('userId', 'name avatar')
      .sort({ rating: -1, totalPatients: -1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingApprovals,
        completedAppointments,
        cancelledAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentAppointments,
      charts: {
        appointmentsByMonth: appointmentsByMonth.reverse(),
        revenueByMonth: revenueByMonth.reverse(),
      },
      topDoctors,
    },
  });
} catch (err) {
    next(err);
  }
};

// ─── Get All Appointments (Admin) ─────────────────────────────────────────────
exports.getAllAppointments = async (req, res, next) => {
  try {
  const { status, page = 1, limit = 15 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: {
      appointments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
} catch (err) {
    next(err);
  }
};
