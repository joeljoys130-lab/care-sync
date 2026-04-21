const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "name email");

    res.json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;