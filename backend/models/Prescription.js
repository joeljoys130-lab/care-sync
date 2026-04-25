const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  dosage:       { type: String, required: true, trim: true },
  duration:     { type: String, required: true, trim: true },
  instructions: { type: String, trim: true },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    diagnosis:    { type: String, required: true, trim: true },
    symptoms:     [{ type: String, trim: true }],
    medicines:    [medicineSchema],
    notes:        { type: String, trim: true },
    followUpDate: Date,
  },
  { timestamps: true }
);

// Unique on appointmentId: one prescription per appointment, enforced at DB level
// (prevents race-condition duplicates even under concurrent requests)
prescriptionSchema.index({ appointmentId: 1 }, { unique: true });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ patientId: 1 });

module.exports =
  mongoose.models.Prescription ||
  mongoose.model('Prescription', prescriptionSchema);
