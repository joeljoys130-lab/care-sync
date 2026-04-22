const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

router.post("/", protect, async (req, res) => {
  try {
    const { doctor, appointmentDate, timeSlot } = req.body;

    // ✅ Basic validation
    if (!doctor || !appointmentDate || !timeSlot) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ FIX 1: Prevent past date/time booking
    const selectedDateTime = new Date(`${appointmentDate} ${timeSlot}`);
    const now = new Date();

    if (isNaN(selectedDateTime)) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    if (selectedDateTime < now) {
      return res.status(400).json({
        message: "Cannot book appointment in the past",
      });
    }

    // ✅ FIX 2: Prevent duplicate booking
    const exists = await Appointment.findOne({
      doctorId: doctor,
      appointmentDate,
      timeSlot,
      status: { $ne: "cancelled" } // ignore cancelled ones
    });

    if (exists) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // ✅ Create appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId: doctor,
      appointmentDate,
      timeSlot,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment,
    });

  } catch (err) {
    console.error(err); // helpful debug
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET APPOINTMENTS
router.get("/", protect, async (req, res) => {
  try {
    let appointments;

    if (req.user.role === "doctor") {
      appointments = await Appointment.find({ doctorId: req.user.id })
        .populate("patientId", "name email")
        .populate("doctorId", "name email");
    } else {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate("doctorId", "name email")
        .populate("patientId", "name email");
    }

    res.json(Array.isArray(appointments) ? appointments : []); // safety
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ CANCEL APPOINTMENT
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