const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
      // index set via compound appointmentSchema.index below
    },
    // Appointment date and time
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    slot: {
      startTime: { type: String, required: true }, // "10:00"
      endTime: { type: String, required: true },   // "10:30"
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
      // index set via appointmentSchema.index below
    },
    type: {
      type: String,
      enum: ['in-person', 'video', 'phone'],
      default: 'in-person',
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    // Doctor notes (filled after consultation)
    notes: {
      type: String,
      default: '',
    },
    // Cancellation details
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', ''],
      default: '',
    },
    cancelReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    // Payment reference
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    fees: {
      type: Number,
      required: true,
    },
    // Medical record created for this appointment
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound index to prevent double-booking ─────────────────────────────────
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, 'slot.startTime': 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $nin: ['cancelled'] } },
  }
);

appointmentSchema.index({ appointmentDate: 1 }); // status index is set inline

module.exports = mongoose.model('Appointment', appointmentSchema);
