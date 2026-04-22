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

module.exports = router;