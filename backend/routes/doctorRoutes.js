const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET all doctors
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

// Import the doctor module routes
const doctorModuleRoutes = require("../modules/doctor/doctor.routes");

// Mount the doctor module routes
router.use("/doctors", doctorModuleRoutes);

module.exports = router;