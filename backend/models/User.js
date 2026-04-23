const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
  isActive: {
  type: Boolean,
  default: true
},
  fees: {
    type: Number,
    default: 500,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpiry: Date,
  isApproved: {
    type: Boolean,
    default: true,
  },
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  address: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);