const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { generateOTP } = require('../utils/generateOTP');
const { generateTokenPair, generateAccessToken } = require('../utils/generateTokens');
const { sendEmail, otpEmailTemplate } = require('../utils/sendEmail');

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, role = 'patient', phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  // Generate OTP
  const { otp, otpExpiry } = generateOTP();

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    otp,
    otpExpiry,
    otpPurpose: 'verification',
  });

  // Create role-specific profile
  if (role === 'patient') {
    await Patient.create({ userId: user._id });
  } else if (role === 'doctor') {
    // Doctors need approval — minimal profile until admin approves
    await Doctor.create({
      userId: user._id,
      specialization: req.body.specialization || 'General',
      fees: req.body.fees || 0,
    });
  }

  // Send OTP email
  console.log(`\n🔑 DEVELOPMENT OTP for ${email}: ${otp}\n`);
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your CareSync account',
      html: otpEmailTemplate(name, otp, 'verification'),
    });
  } catch (emailErr) {
    console.error('Email send failed (Check .env configuration):', emailErr.message);
    // Continue — don't block registration if email fails in dev
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email with the OTP sent.',
    data: { userId: user._id, email: user.email, role: user.role },
  });
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry +otpPurpose');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }

  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  // Mark as verified
  user.isVerified = true;
  user.clearOTP();
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);
  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully.',
    data: { accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  const { email, purpose = 'verification' } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry +otpPurpose');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (purpose === 'verification' && user.isVerified) {
    return res.status(400).json({ success: false, message: 'Email already verified.' });
  }

  const { otp, otpExpiry } = generateOTP();
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.otpPurpose = purpose;
  await user.save();

  console.log(`\n🔑 DEVELOPMENT OTP for ${email}: ${otp}\n`);
  try {
    await sendEmail({
      to: email,
      subject: purpose === 'verification' ? 'Verify your CareSync account' : 'Reset your CareSync password',
      html: otpEmailTemplate(user.name, otp, purpose),
    });
  } catch (emailErr) {
    console.error('Email send failed (Check .env configuration):', emailErr.message);
  }

  res.json({ success: true, message: 'OTP resent successfully.' });
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
  }

  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    },
  });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Always respond with success even if email not found (security)
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
  }

  const { otp, otpExpiry } = generateOTP();
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.otpPurpose = 'password_reset';
  await user.save();

  console.log(`\n🔑 DEVELOPMENT OTP for ${email}: ${otp}\n`);
  try {
    await sendEmail({
      to: email,
      subject: 'Reset your CareSync password',
      html: otpEmailTemplate(user.name, otp, 'password_reset'),
    });
  } catch (err) {
    console.error('Email send failed (Check .env configuration):', err.message);
  }

  res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry +otpPurpose +password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.otp !== otp || user.otpPurpose !== 'password_reset') {
    return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }

  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ success: false, message: 'OTP has expired.' });
  }

  user.password = newPassword;
  user.clearOTP();
  await user.save();

  res.json({ success: true, message: 'Password reset successfully. Please login.' });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ success: true, data: { accessToken } });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  const user = await User.findById(req.user.id).select('+refreshToken');
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
  res.json({ success: true, message: 'Logged out successfully.' });
};
