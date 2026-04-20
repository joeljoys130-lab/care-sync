const User = require("../models/User");
const Complaint = require("../models/Complaint");

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

// GET all appointments (admin monitoring)
exports.getAllAppointments = async (req, res) => {
  try {
    const Appointment = require("../models/Appointment");
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(filter);

    return res.status(200).json({
      message: "Appointments fetched successfully",
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET all complaints (admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const complaints = await Complaint.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Complaint.countDocuments(filter);

    return res.status(200).json({
      message: "Complaints fetched successfully",
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// PATCH complaint status (admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    if (!status || !["open", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use 'open', 'in_progress', or 'resolved'",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    return res.status(200).json({
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};