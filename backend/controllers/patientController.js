const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).populate('userId', 'name email avatar');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

    res.json({
      success: true,
      message: "Patient profile fetched",
      data: {
        user: req.user,
        patient
      }
    });
  } catch (err) {
    console.error("❌ Patient profile update failed:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || 'Update failed.' 
    });
  }
};
// ─── Update Patient Profile ───────────────────────────────────────────────────
exports.updatePatientProfile = async (req, res, next) => {
  try {
  const { dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address } = req.body;

  const patient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
    { dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address },
    { new: true, runValidators: true }
  );

  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  res.json({ success: true, message: 'Profile updated.', data: { patient } });
} catch (err) {
    next(err);
  }
};

// ─── Get Patient Appointments ──────────────────────────────────────────────────
exports.getPatientAppointments = async (req, res, next) => {
  try {
  const { status, page = 1, limit = 10 } = req.query;
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  const query = { patientId: patient._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name email avatar' },
    })
    .sort({ appointmentDate: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Check which appointments have reviews
  const Review = require('../models/Review');
  const appointmentIds = appointments.map(a => a._id);
  const reviews = await Review.find({ appointmentId: { $in: appointmentIds } });
  const reviewedIds = new Set(reviews.map(r => r.appointmentId.toString()));

  const appointmentsWithReviewFlag = appointments.map(appt => {
    const obj = appt.toObject();
    obj.isReviewed = reviewedIds.has(appt._id.toString());
    return obj;
  });

  res.json({
    success: true,
    data: {
      appointments: appointmentsWithReviewFlag,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
} catch (err) {
    next(err);
  }
};

// ─── Toggle Favorite Doctor ───────────────────────────────────────────────────
exports.toggleFavorite = async (req, res, next) => {
  try {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  const index = patient.favorites.findIndex(id => id.toString() === doctorId.toString());
  let message;
  if (index > -1) {
    patient.favorites.splice(index, 1);
    message = 'Removed from favorites.';
  } else {
    patient.favorites.push(doctorId);
    message = 'Added to favorites.';
  }

  await patient.save();
  res.json({ success: true, message, data: { favorites: patient.favorites } });
} catch (err) {
    next(err);
  }
};

// ─── Get Favorites ────────────────────────────────────────────────────────────
exports.getFavorites = async (req, res, next) => {
  try {
  const patient = await Patient.findOne({ userId: req.user.id }).populate({
    path: 'favorites',
    populate: { path: 'userId', select: 'name email avatar' },
  });

  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  res.json({ success: true, data: { favorites: patient.favorites } });
} catch (err) {
    next(err);
  }
};
