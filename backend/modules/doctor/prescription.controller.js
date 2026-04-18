const prescriptionService = require("./prescription.service");

/**
 * Create prescription
 */
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, symptoms, medicines, notes, followUpDate } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and diagnosis are required"
      });
    }

    const prescription = await prescriptionService.createPrescription(
      req.user.id,
      appointmentId,
      { diagnosis, symptoms, medicines, notes, followUpDate }
    );

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prescription by appointment
 */
exports.getPrescription = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await prescriptionService.getPrescriptionByAppointment(
      req.user.id,
      appointmentId
    );

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update prescription
 */
exports.updatePrescription = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const updateData = req.body;

    const prescription = await prescriptionService.updatePrescription(
      req.user.id,
      appointmentId,
      updateData
    );

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all my prescriptions
 */
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await prescriptionService.getMyPrescriptions(req.user.id);

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};