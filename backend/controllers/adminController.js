const User = require("../models/User");

// GET all users (with pagination and filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    // Build filter query
    let filter = {};
    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select("-password")
      .limit(parseInt(limit))
      .skip(skip);

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      message: "Users fetched successfully",
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH approve/reject doctor
exports.approveDoctorAccount = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate input
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ message: "Rejection reason required when rejecting" });
    }

    // Find doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update doctor approval status
    doctor.isApproved = status === "approved" ? true : false;
    doctor.approvalStatus = status;
    if (status === "rejected") {
      doctor.rejectionReason = rejectionReason;
    }

    await doctor.save();

    res.status(200).json({
      message: `Doctor ${status} successfully`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        approvalStatus: doctor.approvalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const approvedDoctors = await User.countDocuments({
      role: "doctor",
      isApproved: true,
    });
    const pendingDoctors = await User.countDocuments({
      role: "doctor",
      isApproved: false,
    });

    res.status(200).json({
      message: "Analytics fetched successfully",
      analytics: {
        totalUsers,
        totalDoctors,
        totalPatients,
        approvedDoctors,
        pendingDoctors,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
