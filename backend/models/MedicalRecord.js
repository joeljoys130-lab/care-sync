const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  dosage: { type: String, required: true },   // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "Twice daily"
  duration: { type: String, required: true },  // e.g. "7 days"
  notes: { type: String, default: '' },
});

const medicalRecordSchema = new mongoose.Schema(
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
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      maxlength: [2000],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    prescriptions: [prescriptionItemSchema],
    labTests: {
      type: [String],
      default: [],
    },
    followUpDate: {
      type: Date,
    },
    // Uploaded files (lab reports, X-rays, etc.)
    files: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    doctorNotes: {
      type: String,
      maxlength: [2000],
      default: '',
    },
    isSharedWithPatient: {
      type: Boolean,
      default: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
// doctorId index is set inline

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
