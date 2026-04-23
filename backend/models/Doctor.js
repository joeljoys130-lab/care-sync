const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },   
  slotDuration: { type: Number, default: 30 }, 
  isAvailable: { type: Boolean, default: true },
});

const qualificationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number },
});

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualifications: [qualificationSchema],
    experience: {
      type: Number, // years
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    fees: {
      type: Number,
      required: [true, 'Consultation fees are required'],
      min: [0, 'Fees cannot be negative'],
    },
    availability: [availabilitySlotSchema],
    // Hospital / clinic info
    hospital: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    // Rating aggregation (updated via virtual or post-save on Review)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Admin approval
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    // Earnings tracking (sum updated after each confirmed payment)
    totalEarnings: {
      type: Number,
      default: 0,
    },
    // Patients served count
    totalPatients: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ city: 1 });
doctorSchema.index({ fees: 1 });
doctorSchema.index({ rating: -1 });
// isApproved index is set inline

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
