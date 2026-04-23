const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    specialization: {
      type: String,
      required: true,
      trim: true
    },

    experience: {
      type: Number,
      required: true,
      min: 0
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0
    },

    qualifications: [
      {
        type: String,
        trim: true
      }
    ],

    hospital: {
      type: String,
      trim: true
    },

    bio: {
      type: String,
      trim: true
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    ratings: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);