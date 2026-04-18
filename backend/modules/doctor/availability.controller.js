const availabilityService = require("./availability.service");

/**
 * Set availability
 */
exports.setAvailability = async (req, res, next) => {
  try {
    const { date, slots } = req.body;

    // Validate input
    if (!date || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Date and slots array are required"
      });
    }

    const availability = await availabilityService.setAvailability(
      req.user.id,
      new Date(date),
      slots
    );

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my availability for a date
 */
exports.getMyAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const availability = await availabilityService.getAvailability(
      req.user.id,
      new Date(date)
    );

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all my availability
 */
exports.getAllMyAvailability = async (req, res, next) => {
  try {
    const availability = await availabilityService.getAllAvailability(req.user.id);

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};