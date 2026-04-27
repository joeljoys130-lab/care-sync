const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Fields used by patientController & patient/Favorites.jsx — were missing (silent data loss)
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    trim: true
  },
  allergies: [{
    type: String,
    trim: true
  }],
  // Saved/favourite doctor IDs (used by patient/Favorites page)
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  }],
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  chronicConditions: String
}, {
  timestamps: true
});

module.exports = mongoose.model("Patient", patientSchema);