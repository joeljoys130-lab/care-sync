const Availability = require("./availability.model");
const Doctor = require("./doctor.model");

/**
 * Set availability for a doctor
 */
exports.setAvailability = async (doctorId, date, slots) => {
  // Validate doctor exists
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Check if availability already exists for this date
  let availability = await Availability.findOne({ doctorId: doctor._id, date });

  if (availability) {
    // Update existing
    availability.slots = slots;
    await availability.save();
  } else {
    // Create new
    availability = await Availability.create({
      doctorId: doctor._id,
      date,
      slots
    });
  }

  return availability;
};

/**
 * Get availability for a doctor on a specific date
 */
exports.getAvailability = async (doctorId, date) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const availability = await Availability.findOne({ doctorId: doctor._id, date });
  return availability || { doctorId: doctor._id, date, slots: [] };
};

/**
 * Get all availability for a doctor
 */
exports.getAllAvailability = async (doctorId) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return await Availability.find({ doctorId: doctor._id }).sort({ date: 1 });
};

/**
 * Update slot booking status
 */
exports.updateSlotStatus = async (doctorId, date, slotIndex, isBooked) => {
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const availability = await Availability.findOne({ doctorId: doctor._id, date });
  if (!availability) {
    throw new Error("Availability not found");
  }

  if (slotIndex < 0 || slotIndex >= availability.slots.length) {
    throw new Error("Invalid slot index");
  }

  availability.slots[slotIndex].isBooked = isBooked;
  await availability.save();

  return availability;
};