const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime:   { type: String, required: true }, // e.g. "09:30"
  isBooked:  { type: Boolean, default: false },
});

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: { type: Date, required: true },
    slots: [slotSchema],
  },
  { timestamps: true }
);

// Compound unique index — one document per doctor per date
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports =
  mongoose.models.Availability ||
  mongoose.model('Availability', availabilitySchema);
