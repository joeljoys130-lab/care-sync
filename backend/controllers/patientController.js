const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// ─── Get Patient Profile ──────────────────────────────────────────────────────
exports.getPatientProfile = async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id }).populate('favorites');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });
  res.json({ success: true, data: { patient } });
};

// ─── Update Patient Profile ───────────────────────────────────────────────────
exports.updatePatientProfile = async (req, res) => {
  const { dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address } = req.body;

  const patient = await Patient.findOneAndUpdate(
    { userId: req.user.id },
    { dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address },
    { new: true, runValidators: true }
  );

  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  res.json({ success: true, message: 'Profile updated.', data: { patient } });
};

// ─── Get Patient Appointments ──────────────────────────────────────────────────
exports.getPatientAppointments = async (req, res) => {
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

  const patient = await Patient.findOne({ userId: req.user.id });
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
  const patient = await Patient.findOne({ userId: req.user.id }).populate({
    path: 'favorites',
    populate: { path: 'userId', select: 'name email avatar' },
  });

  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  res.json({ success: true, data: { favorites: patient.favorites } });
};
