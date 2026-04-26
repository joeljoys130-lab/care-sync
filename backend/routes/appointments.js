const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/appointmentController");
const Appointment = require("../models/Appointment");

// Book Appointment
router.post("/", protect, ctrl.bookAppointment);

// Get Single Appointment
router.get("/:id", protect, ctrl.getAppointmentById);

// Cancel Appointment
router.delete("/:id", protect, ctrl.cancelAppointment);

// Reschedule Appointment
router.put("/:id/reschedule", protect, ctrl.rescheduleAppointment);

// Update Status
router.put("/:id/status", protect, ctrl.updateAppointmentStatus);

// ✅ GET ALL APPOINTMENTS (fallback for appointmentAPI.getAll)
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

    res.json({ success: true, data: Array.isArray(appointments) ? appointments : [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;