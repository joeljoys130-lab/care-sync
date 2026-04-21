const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

// ✅ Create Appointment
router.post("/", protect, async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot } = req.body;

    // 🔴 Validate input
    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // ❗ Prevent double booking
    const exists = await Appointment.findOne({
      doctorId,
      appointmentDate,
      timeSlot,
    });

    if (exists) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      appointmentDate,
      timeSlot,
      status: "booked",
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get My Appointments
router.get("/", protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const appointments = await Appointment.find({
      patientId: patient._id,
    }).sort({ appointmentDate: -1 });

    res.json({
      success: true,
      data: appointments,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Cancel Appointment
router.delete("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;