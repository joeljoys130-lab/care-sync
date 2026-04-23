const express = require("express");
const router = express.Router();
const User = require("../models/User");
const doctorModuleRoutes = require("../modules/doctor/doctor.routes");

// GET all doctors (Public/Patient access)
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mount the doctor module routes (Appointments, Availability, Earnings, etc.)
router.use("/", doctorModuleRoutes);

module.exports = router;