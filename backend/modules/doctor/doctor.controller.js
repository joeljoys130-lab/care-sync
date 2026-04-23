const doctorService = require("./doctor.service");

/**
 * Create Doctor Profile
 */
exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.createDoctorProfile(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Profile
 */
exports.getMyProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.getMyProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update My Profile
 */
exports.updateMyProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateMyProfile(
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Doctor by ID (Public)
 */
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Appointments
 */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const appointments = await doctorService.getMyAppointments(
      req.user.id,
      status,
      date
    );

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Appointment Status
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const appointment = await doctorService.updateAppointmentStatus(
      req.user.id,
      id,
      status,
      notes
    );

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Earnings Summary
 */
exports.getEarningsSummary = async (req, res, next) => {
  try {
    const earningsService = require("./earnings.service");
    const summary = await earningsService.getEarningsSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /doctors/me/earnings — full summary + monthly chart data
 */
exports.getEarnings = async (req, res, next) => {
  try {
    const earningsService = require("./earnings.service");
    const data = await earningsService.getEarningsSummary(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};