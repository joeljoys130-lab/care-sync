const mongoose = require("mongoose");

// Slot subdocument — the canonical booking time unit used by appointmentController
const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime:   { type: String, required: true }  // e.g. "09:30"
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  // Primary time field — controllers supply { startTime, endTime }
  slot: {
    type: slotSchema,
    required: true
  },
  // Kept for backwards-compatibility; synced automatically from slot.startTime
  appointmentTime: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  // Fields used by appointmentController that were missing from the schema
  reason: {
    type: String
  },
  type: {
    type: String,
    enum: ["in-person", "video"],
    default: "in-person"
  },
  fees: {
    type: Number
  },
  symptoms: [{
    type: String
  }],
  notes: {
    type: String
  },
  doctorNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Keep appointmentTime in sync with slot.startTime for any legacy queries
appointmentSchema.pre("save", function (next) {
  if (this.slot && this.slot.startTime) {
    this.appointmentTime = this.slot.startTime;
  }
  next();
});

// Indexes
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
// Prevents double-booking the same time slot for a doctor at DB level
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, "slot.startTime": 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);