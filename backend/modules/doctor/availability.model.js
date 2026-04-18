const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  startTime: {
    type: String, // e.g., "09:00"
    required: true
  },
  endTime: {
    type: String, // e.g., "09:30"
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slots: [slotSchema]
}, {
  timestamps: true
});

// Compound index for efficient queries
availabilitySchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model("Availability", availabilitySchema);