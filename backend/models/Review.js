const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // One review per appointment
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Doctor's response to review
    doctorReply: {
      type: String,
      maxlength: [500],
      default: '',
    },
    repliedAt: {
      type: Date,
    },
    // Admin moderation
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// doctorId and patientId indexes are set inline

// ─── After save: update doctor's rating aggregate ─────────────────────────────
reviewSchema.post('save', async function () {
  const Doctor = require('./Doctor');
  const stats = await reviewSchema.model('Review').aggregate([
    { $match: { doctorId: this.doctorId, isVisible: true } },
    {
      $group: {
        _id: '$doctorId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(this.doctorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
