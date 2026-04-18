const express = require("express");
const router = express.Router();

// Import the doctor module routes
const doctorModuleRoutes = require("../modules/doctor/doctor.routes");

// Mount the doctor module routes
router.use("/doctors", doctorModuleRoutes);

module.exports = router;