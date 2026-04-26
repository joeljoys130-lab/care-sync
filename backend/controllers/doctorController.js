const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');

// ✅ SAFE HELPER (added once)
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─── Get All Doctors (with search, filter, pagination) ──────────────────────
exports.getDoctors = async (req, res, next) => {
  try {
    const {
      search,
      specialization,
      city,
      minFees,
      maxFees,
      minRating,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isApproved: true };

    // ✅ FIXED (safe regex)
    if (specialization) {
      const safeSpec = escapeRegex(specialization);
      query.specialization = new RegExp(safeSpec, 'i');
    }

    // ✅ FIXED
    if (city) {
      const safeCity = escapeRegex(city);
      query.city = new RegExp(safeCity, 'i');
    }

    if (minFees || maxFees) {
      query.fees = {};
      if (minFees) query.fees.$gte = Number(minFees);
      if (maxFees) query.fees.$lte = Number(maxFees);
    }

    if (minRating) query.rating = { $gte: Number(minRating) };

    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    let doctorIds = null;

    if (search) {
      const cleanSearch = search.replace(/^Dr\.\s*/i, '');

      // ✅ FIXED
      const safeSearch = escapeRegex(cleanSearch);

      const users = await User.find({
        name: new RegExp(safeSearch, 'i'),
        role: 'doctor',
      }).select('_id');

      const ids = users.map((u) => u._id);

      const doctors = await Doctor.find({
        userId: { $in: ids },
      }).select('_id');

      doctorIds = doctors.map((d) => d._id);

      query._id = { $in: doctorIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Doctor.countDocuments(query);

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email avatar phone')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Doctor by ID ─────────────────────────────────────────────────────────
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email avatar phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.json({ success: true, data: { doctor } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Doctor Profile ────────────────────────────────────────────────────
exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      specialization,
      qualifications,
      experience,
      fees,
      bio,
      hospital,
      address,
      city,
    } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      { specialization, qualifications, experience, fees, bio, hospital, address, city },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated.',
      data: { doctor },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get or Update Availability ───────────────────────────────────────────────
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      { availability },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    res.json({
      success: true,
      message: 'Availability updated.',
      data: { availability: doctor.availability },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Doctor's Appointments ────────────────────────────────────────────────
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, date } = req.query;

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    const query = { doctorId: doctor._id };

    if (status) query.status = status;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.appointmentDate = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(query);

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email avatar phone' },
      })
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Appointment Status ───────────────────────────────────────────────
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated.',
      data: { appointment },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Doctor Earnings ──────────────────────────────────────────────────────
exports.getDoctorEarnings = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    const { startDate, endDate } = req.query;

    const matchQuery = {
      doctorId: doctor._id,
      status: 'completed',
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const earnings = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgPerAppointment: { $avg: '$amount' },
        },
      },
    ]);

    const monthly = await Payment.aggregate([
      { $match: { doctorId: doctor._id, status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        summary: earnings[0] || { total: 0, count: 0, avgPerAppointment: 0 },
        monthly,
        totalEarnings: doctor.totalEarnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Available Slots ──────────────────────────────────────────────────────
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const targetDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[targetDate.getUTCDay()];

    const dayAvailability = doctor.availability?.find(a => a.day === dayName && a.isAvailable !== false);

    if (!dayAvailability) {
      return res.json({ success: true, data: { slots: [] } });
    }

    let allSlots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, dayAvailability.slotDuration || 30);

    const now = new Date();
    if (targetDate.toDateString() === now.toDateString()) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      allSlots = allSlots.filter(slot => {
        const [startH, startM] = slot.startTime.split(':').map(Number);
        return (startH * 60 + startM) > currentMinutes;
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedStarts = appointments.map(a => a.slot?.startTime);

    allSlots = allSlots.map(slot => ({
      ...slot,
      isBooked: bookedStarts.includes(slot.startTime)
    }));

    res.json({ success: true, data: { slots: allSlots } });
  } catch (err) {
    next(err);
  }
};

// ─── Helper: Generate Time Slots ─────────────────────────────────────────────
function generateTimeSlots(startTime, endTime, duration = 30) {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (current + duration <= endMinutes) {
    const h1 = Math.floor(current / 60).toString().padStart(2, '0');
    const m1 = (current % 60).toString().padStart(2, '0');
    const next = current + duration;
    const h2 = Math.floor(next / 60).toString().padStart(2, '0');
    const m2 = (next % 60).toString().padStart(2, '0');

    slots.push({
      startTime: `${h1}:${m1}`,
      endTime: `${h2}:${m2}`,
    });

    current = next;
  }

  return slots;
}