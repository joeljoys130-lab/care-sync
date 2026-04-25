const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const path = require('path');
const fs = require('fs');

// ─── Get Current User Profile ─────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;

    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: { user, profile }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated.',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Upload Avatar (SAFE) ─────────────────────────────────────────────────────
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar safely
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const baseDir = path.join(__dirname, '..', 'uploads', 'avatars');

      // Extract only filename (prevents ../../ attacks)
      const safeFilename = path.basename(user.avatar);

      const oldPath = path.join(baseDir, safeFilename);

      // Ensure path stays inside allowed directory
      if (!oldPath.startsWith(baseDir)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file path'
        });
      }

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store relative URL safely
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;

    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated.',
      data: { avatar: avatarUrl }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Account ───────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully.'
    });
  } catch (err) {
    next(err);
  }
};