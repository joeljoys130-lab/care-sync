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
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpiry: Date,
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: String,
  accountStatus: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);