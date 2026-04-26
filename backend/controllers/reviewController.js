const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// ─── Create Review ────────────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
  const { appointmentId, doctorId, rating, comment, isAnonymous = false } = req.body;

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });

  // Verify appointment is completed and belongs to this patient
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patientId: patient._id,
    status: 'completed',
  });

  if (!appointment) {
    return res.status(400).json({
      success: false,
      message: 'You can only review doctors after a completed appointment.',
    });
  }

  // Check if already reviewed
  const existing = await Review.findOne({ appointmentId });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this appointment.' });
  }

  const review = await Review.create({
    patientId: patient._id,
    doctorId,
    appointmentId,
    rating,
    comment,
    isAnonymous,
  });

  res.status(201).json({ success: true, message: 'Review submitted.', data: { review } });
} catch (err) {
    next(err);
  }
};

// ─── Get Reviews for a Doctor ─────────────────────────────────────────────────
exports.getDoctorReviews = async (req, res, next) => {
  try {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Review.countDocuments({ doctorId: req.params.doctorId, isVisible: true });
  const reviews = await Review.find({ doctorId: req.params.doctorId, isVisible: true })
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name avatar' },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Mask name for anonymous reviews
  const masked = reviews.map((r) => {
    const rv = r.toObject();
    if (rv.isAnonymous) {
      rv.patientId = { userId: { name: 'Anonymous Patient', avatar: '' } };
    }
    return rv;
  });

  res.json({
    success: true,
    data: {
      reviews: masked,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
} catch (err) {
    next(err);
  }
};

// ─── Get My Reviews (Doctor) ─────────────────────────────────────────────────
exports.getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });

    const total = await Review.countDocuments({ doctorId: doctor._id });
    const reviews = await Review.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Mask name for anonymous reviews
    const masked = reviews.map((r) => {
      const rv = r.toObject();
      if (rv.isAnonymous) {
        rv.patientId = { userId: { name: 'Anonymous Patient', avatar: '' } };
      }
      return rv;
    });

    res.json({
      success: true,
      data: {
        reviews: masked,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Review ────────────────────────────────────────────────────────────
exports.updateReview = async (req, res, next) => {
  try {
  const patient = await Patient.findOne({ userId: req.user.id });
  const review = await Review.findOne({ _id: req.params.id, patientId: patient._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  const { rating, comment } = req.body;
  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  res.json({ success: true, message: 'Review updated.', data: { review } });
} catch (err) {
    next(err);
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
  const patient = await Patient.findOne({ userId: req.user.id });
  const review = await Review.findOne({
    _id: req.params.id,
    ...(req.user.role !== 'admin' ? { patientId: patient._id } : {}),
  });

  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted.' });
} catch (err) {
    next(err);
  }
};

// ─── Doctor Reply to Review ───────────────────────────────────────────────────
exports.replyToReview = async (req, res, next) => {
  try {
  const { reply } = req.body;
  const doctor = await Doctor.findOne({ userId: req.user.id });
  const review = await Review.findOne({ _id: req.params.id, doctorId: doctor._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  review.doctorReply = reply;
  review.repliedAt = new Date();
  await review.save();

  res.json({ success: true, message: 'Reply submitted.', data: { review } });
} catch (err) {
    next(err);
  }
};
