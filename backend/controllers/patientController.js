const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.getPatientProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Patient profile fetched",
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// ─── Update Patient Profile ───────────────────────────────────────────────────
exports.updatePatientProfile = async (req, res) => {
  const { name, phone, dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address } = req.body;

  const patient = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address },
    { new: true, runValidators: true }
  );

  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  res.json({ success: true, message: 'Profile updated.', data: { patient, user: patient } });
};

// ─── Get Patient Appointments ──────────────────────────────────────────────────
exports.getPatientAppointments = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const patient = await User.findById(req.user.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  const query = { patientId: req.user.id };
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

  res.json({
    success: true,
    data: {
      appointments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
};

// ─── Toggle Favorite Doctor ───────────────────────────────────────────────────
exports.toggleFavorite = async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const patient = await User.findById(req.user.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  const index = patient.favorites.indexOf(doctorId);
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
};

// ─── Get Favorites ────────────────────────────────────────────────────────────
exports.getFavorites = async (req, res) => {
  const patient = await User.findById(req.user.id).populate({
    path: 'favorites',
    populate: { path: 'userId', select: 'name email avatar' },
  });

  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  res.json({ success: true, data: { favorites: patient.favorites } });
};
