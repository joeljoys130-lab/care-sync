const mongoose = require("mongoose");

// Appointment schema
// Captures booking details, lifecycle state, and payment details.
// This model is used in admin monitoring APIs and dashboard analytics.
const appointmentSchema = new mongoose.Schema(
  {
    // References to patient/doctor user documents keep data normalized
    // and allow populate() for readable admin responses.
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed", "rescheduled"],
      default: "booked",
    },
    // consultationFee is aggregated in analytics to compute revenue,
    // but only for records where paymentStatus is "paid".
    consultationFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
